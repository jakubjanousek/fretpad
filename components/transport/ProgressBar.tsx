"use client";

import { usePlaybackPosition } from "@/hooks/usePlaybackPosition";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

export function ProgressBar() {
  const progression = useAppStore((state) => state.progression);
  const isPlaying = useAppStore((state) => state.isPlaying);

  const playbackPosition = usePlaybackPosition({ progression, isPlaying });

  // Calculate overall progress across the entire progression
  const totalBars = progression.bars.length;
  const overallProgress = playbackPosition.isActive
    ? (playbackPosition.barIndex + playbackPosition.barProgress) / totalBars
    : 0;

  // Build bar segments for the progress bar
  const barSegments = progression.bars.map((bar, index) => {
    const chordNames = bar.chords.map((bc) => bc.chord).join(" ");
    const isCurrentBar =
      playbackPosition.isActive && playbackPosition.barIndex === index;
    const isPastBar =
      playbackPosition.isActive && playbackPosition.barIndex > index;

    return {
      id: bar.id,
      chordNames,
      isCurrentBar,
      isPastBar,
      width: 100 / totalBars,
    };
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
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
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
            "absolute top-0 bottom-0 left-0 bg-orange-500 transition-none",
            !playbackPosition.isActive && "bg-muted",
          )}
          style={{ width: `${overallProgress * 100}%` }}
        />

        {/* Playhead indicator */}
        {playbackPosition.isActive && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-orange-600 rounded-full shadow-sm transition-none"
            style={{
              left: `${overallProgress * 100}%`,
              transform: "translateX(-50%)",
            }}
          />
        )}
      </div>

      {/* Beat/bar counter */}
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>
          Bar {playbackPosition.isActive ? playbackPosition.barIndex + 1 : 1} of{" "}
          {totalBars}
        </span>
        <span>
          {progression.timeSignature.numerator}/
          {progression.timeSignature.denominator}
        </span>
      </div>
    </div>
  );
}
