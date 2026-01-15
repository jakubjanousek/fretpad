"use client";

import { useEffect, useRef, useState } from "react";
import { usePlaybackPosition } from "@/hooks/usePlaybackPosition";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

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
                segment.isCurrentBar && "text-orange-500 font-medium",
                segment.isPastBar && "text-foreground/70",
              )}
            >
              {segment.chordNames}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar track */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        {/* Beat markers */}
        {beatMarkers.map((marker) => (
          <div
            key={marker.id}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 rounded-full z-5",
              marker.isDownbeat
                ? "w-1.5 h-1.5 bg-border"
                : "w-1 h-1 bg-border/60",
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

        {/* Progress fill */}
        <div
          className={cn(
            "absolute top-0 bottom-0 left-0 bg-orange-500/80 transition-none",
            !playbackPosition.isActive && "bg-muted",
          )}
          style={{ width: `${overallProgress * 100}%` }}
        />

        {/* Playhead indicator - enhanced with glow */}
        {playbackPosition.isActive && !playbackPosition.isCountingIn && (
          <div
            className="absolute top-0 bottom-0 w-0.75 bg-orange-500 rounded-full transition-none shadow-[0_0_8px_2px_rgba(249,115,22,0.5)]"
            style={{
              left: `${overallProgress * 100}%`,
              transform: "translateX(-50%)",
            }}
          />
        )}

        {/* Chord boundary flash effect */}
        {flashPosition !== null && (
          <div
            className="absolute top-0 bottom-0 w-4 animate-chord-flash pointer-events-none z-20"
            style={{
              left: `${flashPosition}%`,
              transform: "translateX(-50%)",
              background:
                "radial-gradient(ellipse at center, rgba(249, 115, 22, 0.8) 0%, transparent 70%)",
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
