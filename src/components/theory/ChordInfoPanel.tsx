"use client";

import { Check, Play, Volume2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useScaleContext } from "@/hooks/useScaleContext";
import {
  playChordArpeggio,
  playChordPreview,
  playScalePreview,
  stopPreview,
} from "@/lib/audio";
import { getIntervalName } from "@/lib/theory/chords";
import type { Chord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

interface ChordInfoPanelProps {
  chord: Chord | null;
}

export function ChordInfoPanel({ chord }: ChordInfoPanelProps) {
  const previewScale = useAppStore((state) => state.previewScale);
  const setPreviewScale = useAppStore((state) => state.setPreviewScale);
  const showScaleTones = useAppStore((state) => state.showScaleTones);
  const setShowScaleTones = useAppStore((state) => state.setShowScaleTones);
  const [playingChord, setPlayingChord] = useState<"chord" | "arpeggio" | null>(
    null,
  );
  const [playingScale, setPlayingScale] = useState<string | null>(null);
  const { detectedKey, currentChordContext } = useScaleContext();

  if (!chord) {
    return (
      <div className="text-sm text-stone-400 dark:text-muted-foreground">
        Select a chord to see its details
      </div>
    );
  }

  const handlePlayChord = async () => {
    if (playingChord) {
      stopPreview();
      setPlayingChord(null);
      return;
    }
    setPlayingChord("chord");
    await playChordPreview(chord.symbol, 1.5);
    setPlayingChord(null);
  };

  const handlePlayArpeggio = async () => {
    if (playingChord) {
      stopPreview();
      setPlayingChord(null);
      return;
    }
    setPlayingChord("arpeggio");
    await playChordArpeggio(chord.symbol, 1.5);
    setPlayingChord(null);
  };

  const handlePlayScale = async (scale: string) => {
    if (playingScale === scale) {
      stopPreview();
      setPlayingScale(null);
      return;
    }
    setPlayingScale(scale);
    await playScalePreview(scale, 2);
    setPlayingScale(null);
  };

  const handleScaleClick = (scale: string) => {
    if (previewScale === scale) {
      setPreviewScale(null);
    } else {
      setPreviewScale(scale);
      if (!showScaleTones) {
        setShowScaleTones(true);
      }
    }
  };

  const handleScaleHover = (scale: string | null) => {
    if (!previewScale) {
      setPreviewScale(scale);
    }
  };

  return (
    <div className="space-y-5">
      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {/* Key Context */}
        {detectedKey && (
          <div className="md:col-span-2 -mb-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-400 dark:text-muted-foreground uppercase tracking-[0.15em] text-[10px]">
                Key
              </span>
              <span className="font-medium text-stone-700 dark:text-stone-200">
                {detectedKey.label}
              </span>
              {currentChordContext &&
                !currentChordContext.scaleChangesFromKey &&
                currentChordContext.modeLabel && (
                  <span className="text-stone-400 dark:text-muted-foreground">
                    · {currentChordContext.suggestedScale} is{" "}
                    {currentChordContext.modeLabel}
                  </span>
                )}
              {currentChordContext?.scaleChangesFromKey && (
                <span className="text-amber-600 dark:text-amber-400">
                  · Scale changes here
                </span>
              )}
            </div>
          </div>
        )}

        {/* Chord Tones */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] uppercase tracking-[0.15em] text-stone-400 dark:text-muted-foreground">
              Chord Tones
            </h4>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayChord}
                className={cn(
                  "h-6 px-1.5 text-[10px] gap-0.5 rounded-full text-stone-500 hover:text-stone-700 dark:text-muted-foreground dark:hover:text-stone-200",
                  playingChord === "chord" &&
                    "text-orange-500 dark:text-orange-400",
                )}
                title="Play chord"
              >
                <Volume2
                  className={cn(
                    "w-3 h-3",
                    playingChord === "chord" && "animate-pulse",
                  )}
                />
                Chord
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayArpeggio}
                className={cn(
                  "h-6 px-1.5 text-[10px] gap-0.5 rounded-full text-stone-500 hover:text-stone-700 dark:text-muted-foreground dark:hover:text-stone-200",
                  playingChord === "arpeggio" &&
                    "text-orange-500 dark:text-orange-400",
                )}
                title="Play arpeggio"
              >
                <Play
                  className={cn(
                    "w-3 h-3",
                    playingChord === "arpeggio" && "animate-pulse",
                  )}
                />
                Arp
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {chord.notes.map((note, index) => {
              const isRoot = note === chord.root;
              const isGuide = chord.guideTones.includes(note);
              const interval = getIntervalName(chord.root, note);

              return (
                <span
                  key={`${note}-${index}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full border",
                    isRoot &&
                      "border-orange-400/50 bg-orange-500/10 text-orange-700 dark:text-orange-400",
                    isGuide &&
                      !isRoot &&
                      "border-blue-400/50 bg-blue-500/10 text-blue-700 dark:text-blue-400",
                    !isRoot &&
                      !isGuide &&
                      "border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                  )}
                >
                  {note}
                  <span className="text-[10px] opacity-60">{interval}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Suggested Scales */}
        <div>
          <div className="mb-2">
            <h4 className="text-[10px] uppercase tracking-[0.15em] text-stone-400 dark:text-muted-foreground">
              Suggested Scales
            </h4>
            <p className="text-[10px] text-stone-400/70 dark:text-muted-foreground/70 mt-0.5">
              Click to preview on fretboard
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {chord.suggestedScales.map((scale, index) => {
              const isActive = previewScale === scale;
              const isFirst = index === 0;
              const isPlayingThisScale = playingScale === scale;

              return (
                <div
                  key={`scale-${scale}-${index}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 border",
                    isActive
                      ? "bg-orange-500/15 border-orange-400/50 text-orange-700 dark:text-orange-400"
                      : "bg-stone-100/60 dark:bg-surface-alt/40 border-stone-200/50 dark:border-stone-700/50 text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-700/40",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleScaleClick(scale)}
                    onMouseEnter={() => handleScaleHover(scale)}
                    onMouseLeave={() => handleScaleHover(null)}
                    className="inline-flex items-center gap-1 active:scale-95"
                  >
                    {isActive && <Check className="w-3 h-3" />}
                    {scale}
                    {isFirst && !isActive && (
                      <span className="text-[9px] text-muted-foreground ml-0.5">
                        recommended
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlayScale(scale)}
                    className={cn(
                      "transition-colors",
                      isPlayingThisScale
                        ? "text-orange-500"
                        : "text-muted-foreground hover:text-stone-200",
                    )}
                    title={`Play ${scale}`}
                  >
                    <Volume2
                      className={cn(
                        "w-3 h-3",
                        isPlayingThisScale && "animate-pulse",
                      )}
                    />
                  </button>
                </div>
              );
            })}
          </div>
          {previewScale && (
            <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-2">
              Showing {previewScale}. Click again to clear.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
