"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Chord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

interface ChordInfoPanelProps {
  chord: Chord | null;
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

export function ChordInfoPanel({ chord }: ChordInfoPanelProps) {
  const previewScale = useAppStore((state) => state.previewScale);
  const setPreviewScale = useAppStore((state) => state.setPreviewScale);
  const showScaleTones = useAppStore((state) => state.showScaleTones);
  const setShowScaleTones = useAppStore((state) => state.setShowScaleTones);

  if (!chord) {
    return (
      <div className="text-sm text-muted-foreground">
        Select a chord to see its details
      </div>
    );
  }

  const handleScaleClick = (scale: string) => {
    if (previewScale === scale) {
      // Clicking active scale clears it
      setPreviewScale(null);
    } else {
      // Set the preview scale and enable scale tones if not already
      setPreviewScale(scale);
      if (!showScaleTones) {
        setShowScaleTones(true);
      }
    }
  };

  const handleScaleHover = (scale: string | null) => {
    // Only set hover preview if no scale is actively selected
    if (!previewScale) {
      setPreviewScale(scale);
    }
  };

  return (
    <div className="space-y-4">
      {/* Chord Symbol & Quality */}
      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold">{chord.symbol}</span>
          <span className="text-sm text-muted-foreground">
            {formatQuality(chord.quality)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Root: {chord.root}</p>
      </div>

      {/* Chord Tones */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground mb-2">
          Chord Tones
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {chord.notes.map((note, index) => {
            const isRoot = note === chord.root;
            const isGuide = chord.guideTones.includes(note);

            return (
              <Badge
                key={`${note}-${index}`}
                variant="outline"
                className={`
                  font-mono text-xs px-2 py-0.5
                  ${isRoot ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-400" : ""}
                  ${isGuide && !isRoot ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400" : ""}
                  ${!isRoot && !isGuide ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : ""}
                `}
              >
                {note}
                {isRoot && (
                  <span className="ml-1 text-[10px] opacity-70">R</span>
                )}
                {isGuide && !isRoot && (
                  <span className="ml-1 text-[10px] opacity-70">G</span>
                )}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Guide Tones */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground mb-2">
          Guide Tones <span className="font-normal">(3rd & 7th)</span>
        </h4>
        <div className="flex gap-2">
          {chord.guideTones.length > 0 ? (
            chord.guideTones.map((note, index) => (
              <Badge
                key={`guide-${note}-${index}`}
                className="bg-blue-500 hover:bg-blue-600 text-white font-mono text-xs"
              >
                {note}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">
              No guide tones
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Guide tones define the chord's character and voice-lead smoothly
        </p>
      </div>

      {/* Suggested Scales */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground mb-2">
          Suggested Scales
          <span className="font-normal text-muted-foreground/70 ml-1">
            (click to preview)
          </span>
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {chord.suggestedScales.map((scale, index) => {
            const isActive = previewScale === scale;
            const isFirst = index === 0;

            return (
              <button
                key={`scale-${scale}-${index}`}
                type="button"
                onClick={() => handleScaleClick(scale)}
                onMouseEnter={() => handleScaleHover(scale)}
                onMouseLeave={() => handleScaleHover(null)}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150",
                  "border active:scale-95",
                  isActive
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-300"
                    : "bg-secondary/50 border-transparent hover:bg-secondary hover:border-muted-foreground/20",
                  isFirst && !isActive && "ring-1 ring-muted-foreground/10",
                )}
              >
                {isActive && <Check className="w-3 h-3" />}
                {scale}
                {isFirst && !isActive && (
                  <span className="text-[9px] text-muted-foreground ml-0.5">
                    recommended
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {previewScale && (
          <p className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-2">
            Showing {previewScale} on fretboard. Click again to clear.
          </p>
        )}
      </div>
    </div>
  );
}
