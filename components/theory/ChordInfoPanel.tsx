"use client";

import { Check, Play, Volume2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  playChordArpeggio,
  playChordPreview,
  playScalePreview,
  stopPreview,
} from "@/lib/audio";
import type { Chord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

interface ChordInfoPanelProps {
  chord: Chord | null;
}

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
  const [playingChord, setPlayingChord] = useState<"chord" | "arpeggio" | null>(
    null,
  );
  const [playingScale, setPlayingScale] = useState<string | null>(null);

  if (!chord) {
    return (
      <div className="text-sm text-stone-400 dark:text-stone-500">
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
      {/* Header row */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-stone-800 dark:text-stone-100">
          {chord.symbol}
        </span>
        <span className="text-sm text-stone-500 dark:text-stone-400">
          {formatQuality(chord.quality)}
        </span>
        {chord.bassNote && (
          <span className="text-xs text-stone-400 dark:text-stone-500">
            Bass: {chord.bassNote}
          </span>
        )}
        {/* Audio preview buttons */}
        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlayChord}
            className={cn(
              "h-7 px-2 text-xs gap-1 rounded-full text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200",
              playingChord === "chord" &&
                "text-orange-500 dark:text-orange-400",
            )}
            title="Play chord"
          >
            <Volume2
              className={cn(
                "w-3.5 h-3.5",
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
              "h-7 px-2 text-xs gap-1 rounded-full text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200",
              playingChord === "arpeggio" &&
                "text-orange-500 dark:text-orange-400",
            )}
            title="Play arpeggio"
          >
            <Play
              className={cn(
                "w-3.5 h-3.5",
                playingChord === "arpeggio" && "animate-pulse",
              )}
            />
            Arp
          </Button>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {/* Chord Tones */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500 mb-2">
            Chord Tones
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {chord.notes.map((note, index) => {
              const isRoot = note === chord.root;
              const isGuide = chord.guideTones.includes(note);

              return (
                <span
                  key={`${note}-${index}`}
                  className={cn(
                    "inline-flex items-center font-mono text-xs px-2.5 py-1 rounded-full border",
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
                  {isRoot && (
                    <span className="ml-1 text-[10px] opacity-60">R</span>
                  )}
                  {isGuide && !isRoot && (
                    <span className="ml-1 text-[10px] opacity-60">G</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Guide Tones */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500 mb-2">
            Guide Tones{" "}
            <span className="normal-case tracking-normal">(3rd & 7th)</span>
          </h4>
          <div className="flex gap-2">
            {chord.guideTones.length > 0 ? (
              chord.guideTones.map((note, index) => (
                <span
                  key={`guide-${note}-${index}`}
                  className="inline-flex items-center font-mono text-xs px-2.5 py-1 rounded-full bg-blue-500 text-white"
                >
                  {note}
                </span>
              ))
            ) : (
              <span className="text-xs text-stone-400">No guide tones</span>
            )}
          </div>
          <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1.5">
            Define the chord's character
          </p>
        </div>

        {/* Suggested Scales */}
        <div>
          <div className="mb-2">
            <h4 className="text-[10px] uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500">
              Suggested Scales
            </h4>
            <p className="text-[10px] text-stone-400/70 dark:text-stone-500/70 mt-0.5">
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
                  className="flex items-center"
                >
                  <button
                    type="button"
                    onClick={() => handleScaleClick(scale)}
                    onMouseEnter={() => handleScaleHover(scale)}
                    onMouseLeave={() => handleScaleHover(null)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-l-full text-xs font-medium transition-all duration-150",
                      "border-y border-l active:scale-95",
                      isActive
                        ? "bg-orange-500/15 border-orange-400/50 text-orange-700 dark:text-orange-400"
                        : "bg-stone-100/60 dark:bg-stone-800/40 border-stone-200/50 dark:border-stone-700/50 text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-700/40",
                      isFirst &&
                        !isActive &&
                        "ring-1 ring-stone-300/30 dark:ring-stone-600/30",
                    )}
                  >
                    {isActive && <Check className="w-3 h-3" />}
                    {scale}
                    {isFirst && !isActive && (
                      <span className="text-[9px] text-stone-400 dark:text-stone-500 ml-0.5">
                        recommended
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlayScale(scale)}
                    className={cn(
                      "p-1 rounded-r-full border-y border-r transition-colors",
                      isPlayingThisScale
                        ? "bg-orange-500/15 border-orange-400/50 text-orange-500"
                        : "bg-stone-100/60 dark:bg-stone-800/40 border-stone-200/50 dark:border-stone-700/50 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300",
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
