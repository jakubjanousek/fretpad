"use client";

import type { GuitarVoicing, NoteName } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChordDiagram, type DiagramLabelMode } from "./ChordDiagram";

const TYPE_COLORS: Record<string, string> = {
  shell: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  drop2: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  drop3: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  barre: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  open: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  rootless: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

function getFretRange(voicing: GuitarVoicing): string {
  const frets = voicing.positions.filter((p) => p.fret > 0).map((p) => p.fret);
  if (frets.length === 0) return "open";
  const min = Math.min(...frets);
  const max = Math.max(...frets);
  return min === max ? `fr ${min}` : `fr ${min}–${max}`;
}

interface VoicingCardProps {
  voicing: GuitarVoicing;
  chordSymbol: string;
  isSelected?: boolean;
  onClick?: () => void;
  guideTones?: NoteName[];
  labelMode?: DiagramLabelMode;
  root?: string;
}

export function VoicingCard({
  voicing,
  isSelected = false,
  onClick,
  guideTones,
  labelMode,
  root,
}: VoicingCardProps) {
  const typeColor =
    TYPE_COLORS[voicing.type] ??
    "text-stone-400 bg-stone-500/10 border-stone-500/20";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center rounded-xl border-2 p-2.5 sm:p-3 transition-all shrink-0",
        "hover:border-surface-border hover:bg-surface-alt/50",
        isSelected
          ? "border-orange-500/60 bg-surface-alt/60 ring-1 ring-orange-500/20"
          : "border-surface-border bg-surface/50",
      )}
    >
      <ChordDiagram
        voicing={voicing}
        size="md"
        guideTones={guideTones}
        labelMode={labelMode}
        root={root}
      />
      <div className="flex items-center gap-1.5 mt-2">
        <span
          className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded-full border",
            typeColor,
          )}
        >
          {voicing.type}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {getFretRange(voicing)}
        </span>
      </div>
    </button>
  );
}
