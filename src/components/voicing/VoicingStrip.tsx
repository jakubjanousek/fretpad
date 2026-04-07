"use client";

import { useRef } from "react";
import type { GuitarVoicing, NoteName } from "@/lib/types";
import { VoicingCard } from "./VoicingCard";

interface VoicingStripProps {
  voicings: GuitarVoicing[];
  chordSymbol: string;
  selectedId?: string;
  onSelect?: (voicing: GuitarVoicing) => void;
  guideTones?: NoteName[];
}

export function VoicingStrip({
  voicings,
  chordSymbol,
  selectedId,
  onSelect,
  guideTones,
}: VoicingStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (voicings.length === 0) {
    return (
      <div className="text-center text-stone-500 text-sm py-4">
        No voicings available for {chordSymbol}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-2 px-1">
        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider shrink-0">
          Alternatives
        </span>
        <span className="text-xs text-stone-500 text-right">
          {voicings.length} option{voicings.length !== 1 && "s"} · tap to select
        </span>
      </div>
      <div className="relative">
        {/* Scroll fade indicators */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-stone-900/60 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-stone-900/60 to-transparent z-10" />
        <div
          ref={scrollRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto p-1 scrollbar-thin scrollbar-thumb-stone-700"
        >
          {voicings.map((v) => (
            <VoicingCard
              key={v.id}
              voicing={v}
              chordSymbol={chordSymbol}
              isSelected={v.id === selectedId}
              onClick={() => onSelect?.(v)}
              guideTones={guideTones}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
