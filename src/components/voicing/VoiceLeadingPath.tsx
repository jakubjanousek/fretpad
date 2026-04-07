"use client";

import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
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
    <div className="relative">
      {/* Scroll fade indicators */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-stone-900/80 to-transparent z-10 md:hidden" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-stone-900/80 to-transparent z-10 md:hidden" />

      <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto p-1 scrollbar-thin scrollbar-thumb-stone-700 snap-x snap-mandatory md:justify-center md:flex-wrap">
        {path.map((voicing, i) => {
          const chord = chords[i];
          const isCurrent = i === currentIndex;

          return (
            <Fragment key={`${voicing.id}-${i}`}>
              {i > 0 && (
                <ChevronRight className="w-4 h-4 text-stone-600 shrink-0" />
              )}
              <button
                type="button"
                onClick={() => onSelectChord?.(i)}
                className={cn(
                  "flex flex-col items-center rounded-lg border-2 p-1.5 sm:p-2 transition-all shrink-0 snap-center",
                  isCurrent
                    ? "border-orange-500/60 bg-stone-800/60"
                    : "border-transparent opacity-70 hover:opacity-100 hover:border-stone-700 hover:bg-stone-800/30",
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
                <ChordDiagram
                  voicing={voicing}
                  size="sm"
                  guideTones={chord?.guideTones}
                />
              </button>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
