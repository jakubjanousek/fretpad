"use client";

import { useCallback, useMemo, useState } from "react";
import { toFlatChordIndex, useVoicingData } from "@/hooks/useVoicingData";
import type { GuitarVoicing, GuitarVoicingType } from "@/lib/types";
import { useAppStore } from "@/state/useAppStore";
import type { DiagramLabelMode } from "./ChordDiagram";
import { VoiceLeadingPath } from "./VoiceLeadingPath";
import { VoicingStrip } from "./VoicingStrip";

const TYPE_LABELS: Record<string, string> = {
  shell: "Shell voicing",
  drop2: "Drop 2",
  drop3: "Drop 3",
  barre: "Barre chord",
  open: "Open voicing",
  triadic: "Triad",
  rootless: "Rootless",
};

type VoicingTypeFilter = "all" | "shell" | "drop2" | "drop3";

const FILTER_OPTIONS: { value: VoicingTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "shell", label: "Shell" },
  { value: "drop2", label: "Drop 2" },
  { value: "drop3", label: "Drop 3" },
];

function filterToTypes(
  filter: VoicingTypeFilter,
): GuitarVoicingType[] | undefined {
  switch (filter) {
    case "shell":
      return ["shell"];
    case "drop2":
      return ["drop2"];
    case "drop3":
      return ["drop3"];
    default:
      return undefined;
  }
}

export function CompVoicingsView() {
  const progression = useAppStore((s) => s.progression);
  const currentBarIndex = useAppStore((s) => s.currentBarIndex);
  const currentChordIndex = useAppStore((s) => s.currentChordIndex);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const setCurrentPosition = useAppStore((s) => s.setCurrentPosition);

  const [voicingFilter, setVoicingFilter] = useState<VoicingTypeFilter>("all");
  const typeFilter = useMemo(
    () => filterToTypes(voicingFilter),
    [voicingFilter],
  );

  const { chords, voicingsPerChord, path } = useVoicingData(
    progression,
    typeFilter,
  );

  const flatIndex = toFlatChordIndex(
    progression,
    currentBarIndex,
    currentChordIndex,
  );

  const activeIndex = flatIndex;

  // User overrides for the voice-leading path (index → voicing)
  const [overrides, setOverrides] = useState<Record<number, GuitarVoicing>>({});

  // Label mode toggle: notes vs intervals
  const [labelMode, setLabelMode] = useState<DiagramLabelMode>("notes");

  const handleSelectVoicing = useCallback(
    (voicing: GuitarVoicing) => {
      setOverrides((prev) => ({ ...prev, [activeIndex]: voicing }));
    },
    [activeIndex],
  );

  /** Navigate to chord at flat index by finding the corresponding bar/chord position */
  const handleSelectChord = useCallback(
    (index: number) => {
      if (isPlaying) return;
      let remaining = index;
      for (let bar = 0; bar < progression.bars.length; bar++) {
        const barChordCount = progression.bars[bar]?.chords.length ?? 0;
        if (remaining < barChordCount) {
          setCurrentPosition(bar, remaining);
          return;
        }
        remaining -= barChordCount;
      }
    },
    [isPlaying, progression.bars, setCurrentPosition],
  );

  const activeChord = chords[activeIndex];
  const activeVoicings = voicingsPerChord[activeIndex] ?? [];
  const selectedVoicing = overrides[activeIndex] ?? path[activeIndex];

  // Build effective path with overrides applied
  const effectivePath = path.map((v, i) => overrides[i] ?? v);

  const fretRange = selectedVoicing
    ? (() => {
        const frets = selectedVoicing.positions
          .filter((p) => p.fret > 0)
          .map((p) => p.fret);
        if (frets.length === 0) return "Open position";
        const min = Math.min(...frets);
        const max = Math.max(...frets);
        return min === max ? `Fret ${min}` : `Frets ${min}–${max}`;
      })()
    : null;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Progression path — the main visualization */}
      <VoiceLeadingPath
        chords={chords}
        path={effectivePath}
        currentIndex={activeIndex}
        onSelectChord={handleSelectChord}
        labelMode={labelMode}
      />

      {/* Detail bar — info about the active voicing + label toggle */}
      {selectedVoicing && activeChord && (
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          <span className="text-sm font-semibold font-[var(--font-display)] text-orange-400">
            {activeChord.symbol}
          </span>
          <span className="text-xs text-stone-500">
            {TYPE_LABELS[selectedVoicing.type] ?? selectedVoicing.type}
          </span>
          {fretRange && (
            <>
              <span className="text-stone-700">·</span>
              <span className="text-xs text-stone-500">{fretRange}</span>
            </>
          )}
          <div className="flex items-center gap-1 rounded-full bg-stone-800/60 p-0.5">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setVoicingFilter(opt.value)}
                className={`text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors ${
                  voicingFilter === opt.value
                    ? "bg-stone-700 text-stone-200"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-full bg-stone-800/60 p-0.5">
            <button
              type="button"
              onClick={() => setLabelMode("notes")}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors ${
                labelMode === "notes"
                  ? "bg-stone-700 text-stone-200"
                  : "text-stone-500 hover:text-stone-300"
              }`}
            >
              Notes
            </button>
            <button
              type="button"
              onClick={() => setLabelMode("intervals")}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors ${
                labelMode === "intervals"
                  ? "bg-stone-700 text-stone-200"
                  : "text-stone-500 hover:text-stone-300"
              }`}
            >
              Intervals
            </button>
          </div>
        </div>
      )}

      {/* Alternative voicings strip */}
      {!isPlaying && activeChord && (
        <div className="rounded-xl border border-stone-800/50 bg-stone-900/20 p-3 sm:p-4">
          <VoicingStrip
            voicings={activeVoicings}
            chordSymbol={activeChord.symbol}
            selectedId={selectedVoicing?.id}
            onSelect={handleSelectVoicing}
            guideTones={activeChord.guideTones}
            labelMode={labelMode}
            root={activeChord.root}
          />
        </div>
      )}
    </div>
  );
}
