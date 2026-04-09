"use client";

import { useRef } from "react";
import type { GuitarVoicing, NoteName } from "@/lib/types";
import type { DiagramLabelMode } from "./ChordDiagram";
import { VoicingCard } from "./VoicingCard";

interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface VoicingStripProps {
  voicings: GuitarVoicing[];
  chordSymbol: string;
  selectedId?: string;
  onSelect?: (voicing: GuitarVoicing) => void;
  guideTones?: NoteName[];
  labelMode?: DiagramLabelMode;
  root?: string;
  filterOptions?: FilterOption<string>[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
}

export function VoicingStrip({
  voicings,
  chordSymbol,
  selectedId,
  onSelect,
  guideTones,
  labelMode,
  root,
  filterOptions,
  activeFilter,
  onFilterChange,
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
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-stone-400 uppercase tracking-wider shrink-0">
            Alternatives
          </span>
          <span className="text-xs text-stone-600">{voicings.length}</span>
        </div>
        {filterOptions && onFilterChange && (
          <div className="flex items-center gap-0.5 rounded-full bg-stone-800/80 p-0.5">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onFilterChange(opt.value)}
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                  activeFilter === opt.value
                    ? "bg-stone-600 text-stone-100"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
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
              labelMode={labelMode}
              root={root}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
