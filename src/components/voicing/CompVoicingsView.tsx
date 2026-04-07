"use client";

import { useState } from "react";
import { toFlatChordIndex, useVoicingData } from "@/hooks/useVoicingData";
import { useAppStore } from "@/state/useAppStore";
import { VoiceLeadingPath } from "./VoiceLeadingPath";
import { VoicingStrip } from "./VoicingStrip";

export function CompVoicingsView() {
  const progression = useAppStore((s) => s.progression);
  const currentBarIndex = useAppStore((s) => s.currentBarIndex);
  const currentChordIndex = useAppStore((s) => s.currentChordIndex);
  const isPlaying = useAppStore((s) => s.isPlaying);

  const { chords, voicingsPerChord, path } = useVoicingData(progression);

  const flatIndex = toFlatChordIndex(
    progression,
    currentBarIndex,
    currentChordIndex,
  );

  // Which chord position the user is browsing (defaults to current playback position)
  const [browsingIndex, setBrowsingIndex] = useState(0);
  const activeIndex = isPlaying ? flatIndex : browsingIndex;

  const activeChord = chords[activeIndex];
  const activeVoicings = voicingsPerChord[activeIndex] ?? [];
  const selectedVoicing = path[activeIndex];

  return (
    <div className="space-y-4">
      {/* Voice-leading path — the main progression view */}
      <VoiceLeadingPath
        chords={chords}
        path={path}
        currentIndex={activeIndex}
        onSelectChord={(i) => {
          if (!isPlaying) setBrowsingIndex(i);
        }}
      />

      {/* Alternative voicings for the active chord */}
      {!isPlaying && activeChord && (
        <div className="rounded-xl border border-stone-800/50 bg-stone-900/20 p-3">
          <VoicingStrip
            voicings={activeVoicings}
            chordSymbol={activeChord.symbol}
            selectedId={selectedVoicing?.id}
          />
        </div>
      )}
    </div>
  );
}
