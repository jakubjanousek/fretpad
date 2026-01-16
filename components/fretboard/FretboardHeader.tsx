"use client";

import { Badge } from "@/components/ui/badge";
import type { Chord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FretboardHeaderProps {
  chord: Chord | null;
  isPlaying?: boolean;
  onChordClick?: () => void;
}

/**
 * Formats chord quality for display
 */
function formatQuality(quality: string): string {
  const qualityNames: Record<string, string> = {
    maj: "Major",
    min: "Minor",
    maj7: "Major 7th",
    min7: "Minor 7th",
    "7": "Dominant 7th",
    min7b5: "Half-Diminished",
    dim: "Diminished",
    dim7: "Diminished 7th",
    aug: "Augmented",
    sus2: "Suspended 2nd",
    sus4: "Suspended 4th",
    "6": "Major 6th",
    min6: "Minor 6th",
    "9": "Dominant 9th",
    maj9: "Major 9th",
    min9: "Minor 9th",
    add9: "Add 9",
    other: "Other",
  };

  return qualityNames[quality] || quality;
}

/**
 * Prominent chord name header displayed above the fretboard.
 * Shows the current chord symbol and quality badge.
 * Clicking opens the chord info panel.
 */
export function FretboardHeader({
  chord,
  isPlaying = false,
  onChordClick,
}: FretboardHeaderProps) {
  if (!chord) {
    return (
      <div className="text-center py-2">
        <span className="text-muted-foreground text-sm">
          Select a chord to display
        </span>
      </div>
    );
  }

  return (
    <div key={chord.symbol} className="animate-chord-change">
      <button
        type="button"
        onClick={onChordClick}
        className={cn(
          "flex flex-col items-center gap-0.5 py-1.5 sm:py-2 px-4 sm:px-6 rounded-lg transition-all",
          "hover:bg-muted/50 focus-ring",
          isPlaying && "animate-pulse-subtle",
        )}
      >
        <div className="flex items-baseline gap-2 sm:gap-3">
          <span
            className={cn(
              "hero-text transition-colors",
              isPlaying && "text-orange-500",
            )}
          >
            {chord.symbol}
          </span>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs sm:text-sm font-medium transition-colors",
              isPlaying &&
                "bg-orange-500/10 text-orange-600 dark:text-orange-400",
            )}
          >
            {formatQuality(chord.quality)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
          <span>Root: {chord.root}</span>
          <span className="text-border hidden sm:inline">|</span>
          <span className="italic hidden sm:inline">Click for details</span>
        </div>
      </button>
    </div>
  );
}
