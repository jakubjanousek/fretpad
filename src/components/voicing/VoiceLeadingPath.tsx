"use client";

import type { Chord, GuitarVoicing } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChordDiagram } from "./ChordDiagram";

interface VoiceLeadingPathProps {
  chords: Chord[];
  path: GuitarVoicing[];
  currentIndex?: number;
  onSelectChord?: (index: number) => void;
}

export function VoiceLeadingPath({
  chords,
  path,
  currentIndex,
  onSelectChord,
}: VoiceLeadingPathProps) {
  if (path.length === 0) {
    return (
      <div className="text-center text-stone-500 text-sm py-8">
        No voice-leading path computed
      </div>
    );
  }

  return (
    <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 items-end justify-center">
      {path.map((voicing, i) => {
        const chord = chords[i];
        const isCurrent = i === currentIndex;

        return (
          <button
            key={`${voicing.id}-${i}`}
            type="button"
            onClick={() => onSelectChord?.(i)}
            className={cn(
              "flex flex-col items-center rounded-xl border p-1.5 sm:p-2 transition-all shrink-0",
              isCurrent
                ? "border-orange-500/50 bg-stone-800/60 ring-1 ring-orange-500/20 scale-105"
                : "border-stone-800/30 bg-stone-900/20 hover:border-stone-700",
            )}
          >
            <span
              className={cn(
                "text-xs font-semibold font-[var(--font-display)] mb-0.5",
                isCurrent ? "text-orange-400" : "text-stone-400",
              )}
            >
              {chord?.symbol ?? "?"}
            </span>
            <ChordDiagram voicing={voicing} size={isCurrent ? "md" : "sm"} />
          </button>
        );
      })}
    </div>
  );
}
