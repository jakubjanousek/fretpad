"use client";

import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import type { Chord, GuitarVoicing } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChordDiagram, type DiagramLabelMode } from "./ChordDiagram";

interface VoiceLeadingPathProps {
  chords: Chord[];
  path: GuitarVoicing[];
  currentIndex?: number;
  onSelectChord?: (index: number) => void;
  labelMode?: DiagramLabelMode;
}

export function VoiceLeadingPath({
  chords,
  path,
  currentIndex,
  onSelectChord,
  labelMode,
}: VoiceLeadingPathProps) {
  if (path.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-8">
        No voice-leading path computed
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Scroll fade indicators (mobile only) */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-surface/80 to-transparent z-10 md:hidden" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-surface/80 to-transparent z-10 md:hidden" />

      <div className="flex items-end gap-1 sm:gap-2 lg:gap-3 overflow-x-auto p-1 scrollbar-thin scrollbar-thumb-stone-700 snap-x snap-mandatory md:justify-center md:flex-wrap">
        {path.map((voicing, i) => {
          const chord = chords[i];
          const isCurrent = i === currentIndex;

          return (
            <Fragment key={`${voicing.id}-${i}`}>
              {i > 0 && (
                <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 text-stone-600 shrink-0 mb-8 sm:mb-10 lg:mb-14" />
              )}
              <button
                type="button"
                onClick={() => onSelectChord?.(i)}
                className={cn(
                  "flex flex-col items-center rounded-lg border-2 p-1.5 sm:p-2 lg:p-3 transition-all shrink-0 snap-center",
                  isCurrent
                    ? "border-orange-500/60 bg-surface-alt/60"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-surface-border hover:bg-surface-alt/30",
                )}
              >
                <span
                  className={cn(
                    "text-xs lg:text-sm font-semibold font-[var(--font-display)] mb-0.5 lg:mb-1",
                    isCurrent ? "text-orange-400" : "text-muted-foreground",
                  )}
                >
                  {chord?.symbol ?? "?"}
                </span>
                <ChordDiagram
                  voicing={voicing}
                  size={isCurrent ? "lg" : "md"}
                  guideTones={chord?.guideTones}
                  labelMode={labelMode}
                  root={chord?.root}
                />
              </button>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
