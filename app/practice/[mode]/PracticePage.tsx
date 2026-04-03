"use client";

import { useState } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { ProgressionEditor } from "@/components/progression/ProgressionEditor";
import { TheoryPanel } from "@/components/theory/TheoryPanel";
import { ProgressBar } from "@/components/transport/ProgressBar";
import { TransportBar } from "@/components/transport/TransportBar";
import { TransportDrawer } from "@/components/transport/TransportDrawer";
import { useFretboardData } from "@/hooks/useFretboardData";
import { usePracticeModeSetup } from "@/hooks/usePracticeModeSetup";
import type { PracticeModeId } from "@/lib/types";

interface PracticePageProps {
  modeId: PracticeModeId;
}

export function PracticePage({ modeId }: PracticePageProps) {
  usePracticeModeSetup(modeId);

  const {
    currentChord,
    progression,
    fretNotes,
    targetNoteData,
    arpeggioConnections,
  } = useFretboardData();

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen pb-20">
      <div className="mx-auto max-w-6xl px-4 pt-4 space-y-4">
        <ProgressionEditor />
        <ProgressBar />
        <Fretboard
          fretNotes={fretNotes}
          targetNotes={targetNoteData.targets}
          chromaticApproaches={targetNoteData.chromatic}
          diatonicApproaches={targetNoteData.diatonic}
          arpeggioConnections={arpeggioConnections}
        />
        <TheoryPanel chord={currentChord} />
      </div>

      <TransportBar onSettingsClick={() => setSettingsOpen(true)} />
      <TransportDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
