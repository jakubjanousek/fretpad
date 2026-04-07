"use client";

import type { GuitarVoicing } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChordDiagram } from "./ChordDiagram";

interface VoicingCardProps {
  voicing: GuitarVoicing;
  chordSymbol: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function VoicingCard({
  voicing,
  chordSymbol,
  isSelected = false,
  onClick,
}: VoicingCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center rounded-xl border p-2 transition-all",
        "hover:border-stone-600 hover:bg-stone-800/50",
        isSelected
          ? "border-orange-500/50 bg-stone-800/60 ring-1 ring-orange-500/20"
          : "border-stone-800/50 bg-stone-900/30",
      )}
    >
      <span
        className={cn(
          "text-xs font-semibold mb-1",
          isSelected ? "text-orange-400" : "text-stone-300",
        )}
      >
        {chordSymbol}
      </span>
      <ChordDiagram voicing={voicing} size="md" />
      <span className="text-[9px] text-stone-500 mt-1 truncate max-w-[80px]">
        {voicing.type}
        {voicing.baseFret > 0 && ` · fr ${voicing.baseFret}`}
      </span>
    </button>
  );
}
