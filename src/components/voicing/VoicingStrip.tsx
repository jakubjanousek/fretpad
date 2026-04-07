"use client";

import { useRef } from "react";
import type { GuitarVoicing } from "@/lib/types";
import { VoicingCard } from "./VoicingCard";

interface VoicingStripProps {
  voicings: GuitarVoicing[];
  chordSymbol: string;
  selectedId?: string;
  onSelect?: (voicing: GuitarVoicing) => void;
}

export function VoicingStrip({
  voicings,
  chordSymbol,
  selectedId,
  onSelect,
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
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-stone-400">
          {voicings.length} voicing{voicings.length !== 1 && "s"}
        </span>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-700"
      >
        {voicings.map((v) => (
          <VoicingCard
            key={v.id}
            voicing={v}
            chordSymbol={chordSymbol}
            isSelected={v.id === selectedId}
            onClick={() => onSelect?.(v)}
          />
        ))}
      </div>
    </div>
  );
}
