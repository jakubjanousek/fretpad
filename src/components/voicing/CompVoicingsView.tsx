"use client";

import { useCallback, useState } from "react";
import { toFlatChordIndex, useVoicingData } from "@/hooks/useVoicingData";
import type { GuitarVoicing } from "@/lib/types";
import { useAppStore } from "@/state/useAppStore";
import { ChordDiagram, type DiagramLabelMode } from "./ChordDiagram";
import { VoiceLeadingPath } from "./VoiceLeadingPath";
import { VoicingStrip } from "./VoicingStrip";

const TYPE_LABELS: Record<string, string> = {
  shell: "Shell voicing",
  drop2: "Drop 2",
  drop3: "Drop 3",
  barre: "Barre chord",
  open: "Open voicing",
  rootless: "Rootless",
};

export function CompVoicingsView() {
  const progression = useAppStore((s) => s.progression);
  const currentBarIndex = useAppStore((s) => s.currentBarIndex);
  const currentChordIndex = useAppStore((s) => s.currentChordIndex);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const setCurrentPosition = useAppStore((s) => s.setCurrentPosition);

  const { chords, voicingsPerChord, path } = useVoicingData(progression);

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
    <div className="space-y-4 lg:space-y-5">
      {/* Top section: hero panel + path overview */}
      <div className="flex flex-col md:flex-row md:gap-6 lg:gap-8 gap-4">
        {/* Hero panel — featured voicing */}
        {selectedVoicing && activeChord && (
          <div className="flex flex-col items-center shrink-0 rounded-xl border border-stone-800/50 bg-stone-900/40 p-4 sm:p-5 lg:p-6">
            <span className="text-2xl lg:text-3xl font-semibold font-[var(--font-display)] text-orange-400 mb-2">
              {activeChord.symbol}
            </span>
            <ChordDiagram
              voicing={selectedVoicing}
              size="xl"
              guideTones={activeChord.guideTones}
              labelMode={labelMode}
              root={activeChord.root}
            />
            <div className="flex items-center gap-2 mt-3 text-xs text-stone-400">
              <span>
                {TYPE_LABELS[selectedVoicing.type] ?? selectedVoicing.type}
              </span>
              {fretRange && (
                <>
                  <span className="text-stone-600">·</span>
                  <span>{fretRange}</span>
                </>
              )}
            </div>
            {/* Notes / Intervals toggle */}
            <div className="flex items-center gap-1 mt-3 rounded-full bg-stone-800/60 p-0.5">
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

        {/* Path panel */}
        <div className="flex-1 min-w-0 flex flex-col rounded-xl border border-stone-800/50 bg-stone-900/40 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Voice Leading Path
            </span>
          </div>
          <VoiceLeadingPath
            chords={chords}
            path={effectivePath}
            currentIndex={activeIndex}
            onSelectChord={handleSelectChord}
            labelMode={labelMode}
          />
        </div>
      </div>

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
