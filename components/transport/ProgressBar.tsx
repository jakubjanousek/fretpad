"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePlaybackPosition } from "@/hooks/usePlaybackPosition";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

// Color palette for chord segments — each entry has Tailwind text/bg classes and raw rgba for effects
const SEGMENT_COLORS = [
  { text: "text-orange-500", bg: "bg-orange-500", rgba: "249,115,22" },
  { text: "text-sky-500", bg: "bg-sky-500", rgba: "14,165,233" },
  { text: "text-emerald-500", bg: "bg-emerald-500", rgba: "16,185,129" },
  { text: "text-violet-500", bg: "bg-violet-500", rgba: "139,92,246" },
  { text: "text-rose-500", bg: "bg-rose-500", rgba: "244,63,94" },
  { text: "text-amber-500", bg: "bg-amber-500", rgba: "245,158,11" },
];

export function ProgressBar() {
  const progression = useAppStore((state) => state.progression);
  const isPlaying = useAppStore((state) => state.isPlaying);
  const metronome = useAppStore((state) => state.metronome);

  const playbackPosition = usePlaybackPosition({
    progression,
    isPlaying,
    countInBars: metronome.countIn,
  });

  // Track bar changes for flash effect
  const prevBarIndex = useRef(playbackPosition.barIndex);
  const [flashPosition, setFlashPosition] = useState<number | null>(null);

  useEffect(() => {
    if (
      playbackPosition.isActive &&
      !playbackPosition.isCountingIn &&
      playbackPosition.barIndex !== prevBarIndex.current &&
      playbackPosition.barIndex > 0
    ) {
      // Flash at the bar boundary that was just crossed
      const totalBars = progression.bars.length;
      const position = (playbackPosition.barIndex / totalBars) * 100;
      setFlashPosition(position);

      // Clear flash after animation
      const timeout = setTimeout(() => setFlashPosition(null), 400);
      prevBarIndex.current = playbackPosition.barIndex;
      return () => clearTimeout(timeout);
    }
    prevBarIndex.current = playbackPosition.barIndex;
  }, [
    playbackPosition.barIndex,
    playbackPosition.isActive,
    playbackPosition.isCountingIn,
    progression.bars.length,
  ]);

  // Map each unique chord to a color
  const chordColorMap = useMemo(() => {
    const map: Record<string, (typeof SEGMENT_COLORS)[number]> = {};
    let colorIndex = 0;
    for (const bar of progression.bars) {
      const key = bar.chords.map((bc) => bc.chord).join(" ");
      if (!(key in map)) {
        map[key] = SEGMENT_COLORS[colorIndex % SEGMENT_COLORS.length]!;
        colorIndex++;
      }
    }
    return map;
  }, [progression.bars]);

  // Calculate overall progress across the entire progression
  const totalBars = progression.bars.length;
  const beatsPerBar = progression.timeSignature.numerator;
  // During count-in, don't show progress
  const overallProgress =
    playbackPosition.isActive && !playbackPosition.isCountingIn
      ? (playbackPosition.barIndex + playbackPosition.barProgress) / totalBars
      : 0;

  // Build bar segments for the progress bar
  const barSegments = progression.bars.map((bar, index) => {
    const chordNames = bar.chords.map((bc) => bc.chord).join(" ");
    // Color is guaranteed to exist since chordColorMap is built from the same bars
    const color = chordColorMap[chordNames] as (typeof SEGMENT_COLORS)[number];
    // Don't highlight bars during count-in
    const isCurrentBar =
      playbackPosition.isActive &&
      !playbackPosition.isCountingIn &&
      playbackPosition.barIndex === index;
    const isPastBar =
      playbackPosition.isActive &&
      !playbackPosition.isCountingIn &&
      playbackPosition.barIndex > index;

    return {
      id: bar.id,
      chordNames,
      color,
      isCurrentBar,
      isPastBar,
      width: 100 / totalBars,
    };
  });

  // Generate beat markers for each bar
  const beatMarkers = barSegments.flatMap((segment, barIndex) => {
    const markers = [];
    for (let beat = 0; beat < beatsPerBar; beat++) {
      const position =
        barIndex * segment.width + (beat / beatsPerBar) * segment.width;
      markers.push({
        id: `${segment.id}-beat-${beat}`,
        position,
        isDownbeat: beat === 0,
      });
    }
    return markers;
  });

  return (
    <div className="w-full">
      {/* Bar labels */}
      <div className="flex mb-1">
        {barSegments.map((segment) => (
          <div
            key={segment.id}
            className="text-xs text-center text-muted-foreground truncate px-0.5"
            style={{ width: `${segment.width}%` }}
          >
            <span
              className={cn(
                "font-mono transition-colors",
                segment.isCurrentBar && `${segment.color.text} font-medium`,
                segment.isPastBar && "text-foreground/70",
              )}
            >
              {segment.chordNames}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar track */}
      <div className="relative h-5 bg-muted rounded-full overflow-hidden">
        {/* Active segment background highlight */}
        {barSegments.map((segment, index) => (
          <div
            key={`segment-bg-${segment.id}`}
            className="absolute top-0 bottom-0 transition-colors duration-200"
            style={{
              left: `${index * segment.width}%`,
              width: `${segment.width}%`,
              backgroundColor: segment.isCurrentBar
                ? `rgba(${segment.color.rgba},0.15)`
                : segment.isPastBar
                  ? `rgba(${segment.color.rgba},0.05)`
                  : undefined,
            }}
          />
        ))}

        {/* Beat markers */}
        {beatMarkers.map((marker) => (
          <div
            key={marker.id}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 rounded-full z-5",
              marker.isDownbeat ? "w-2 h-2 bg-border" : "w-1 h-1 bg-border/60",
            )}
            style={{ left: `${marker.position}%` }}
          />
        ))}

        {/* Bar segment dividers */}
        {barSegments.slice(0, -1).map((segment, index) => (
          <div
            key={`divider-${segment.id}`}
            className="absolute top-0 bottom-0 w-px bg-border z-10"
            style={{ left: `${(index + 1) * segment.width}%` }}
          />
        ))}

        {/* Per-segment progress fill */}
        {playbackPosition.isActive &&
          !playbackPosition.isCountingIn &&
          barSegments.map((segment, index) => {
            const segStart = index / totalBars;
            const segEnd = (index + 1) / totalBars;
            // How much of this segment is filled (0 to 1)
            const fill =
              overallProgress <= segStart
                ? 0
                : overallProgress >= segEnd
                  ? 1
                  : (overallProgress - segStart) / (segEnd - segStart);
            if (fill <= 0) return null;
            return (
              <div
                key={`fill-${segment.id}`}
                className="absolute top-0 bottom-0 transition-none"
                style={{
                  left: `${segStart * 100}%`,
                  width: `${segment.width * fill}%`,
                  backgroundColor: `rgba(${segment.color.rgba},0.8)`,
                }}
              />
            );
          })}

        {/* Playhead indicator - enhanced with glow */}
        {(() => {
          if (!playbackPosition.isActive || playbackPosition.isCountingIn)
            return null;
          const currentRgba =
            barSegments[playbackPosition.barIndex]?.color.rgba ?? "249,115,22";
          return (
            <div
              className="absolute -top-0.5 -bottom-0.5 w-1 rounded-full transition-none"
              style={{
                left: `${overallProgress * 100}%`,
                transform: "translateX(-50%)",
                backgroundColor: `rgb(${currentRgba})`,
                boxShadow: `0 0 10px 3px rgba(${currentRgba},0.6)`,
              }}
            />
          );
        })()}

        {/* Chord boundary flash effect */}
        {flashPosition !== null && (
          <div
            className="absolute top-0 bottom-0 w-6 animate-chord-flash pointer-events-none z-20"
            style={{
              left: `${flashPosition}%`,
              transform: "translateX(-50%)",
              background: `radial-gradient(ellipse at center, rgba(${barSegments[playbackPosition.barIndex]?.color.rgba ?? "249,115,22"},0.8) 0%, transparent 70%)`,
            }}
          />
        )}

        {/* Count-in pulse indicator */}
        {playbackPosition.isCountingIn && (
          <div className="absolute inset-0 bg-orange-500/20 animate-pulse" />
        )}
      </div>

      {/* Beat/bar counter */}
      <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
        <span>
          {playbackPosition.isCountingIn ? (
            <span className="text-orange-500 font-medium animate-pulse">
              Count-in...
            </span>
          ) : (
            <>
              Bar{" "}
              <span
                className={
                  playbackPosition.isActive ? "font-medium text-foreground" : ""
                }
              >
                {playbackPosition.isActive ? playbackPosition.barIndex + 1 : 1}
              </span>{" "}
              of {totalBars}
            </>
          )}
        </span>
        <span>
          {progression.timeSignature.numerator}/
          {progression.timeSignature.denominator}
        </span>
      </div>
    </div>
  );
}
