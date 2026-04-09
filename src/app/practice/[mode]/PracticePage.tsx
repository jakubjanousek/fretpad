"use client";

import { DM_Serif_Display } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FeedbackToast } from "@/components/feedback/FeedbackToast";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { PracticeNowPlaying } from "@/components/practice/PracticeNowPlaying";
import { ProgressionEditor } from "@/components/progression/ProgressionEditor";
import { TheoryPanel } from "@/components/theory/TheoryPanel";
import { AudioInputScorecard } from "@/components/transport/AudioInputScorecard";
import { ProgressBar } from "@/components/transport/ProgressBar";
import { TransportBar } from "@/components/transport/TransportBar";
import { TransportDrawer } from "@/components/transport/TransportDrawer";
import { CompVoicingsView } from "@/components/voicing/CompVoicingsView";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFretboardData } from "@/hooks/useFretboardData";
import { usePracticeModeSetup } from "@/hooks/usePracticeModeSetup";
import { buildQueryString } from "@/hooks/useUrlSync";
import { getNextChord } from "@/lib/theory";
import type { PracticeModeId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

const display = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

interface PracticePageProps {
  modeId: PracticeModeId;
}

export function PracticePage({ modeId }: PracticePageProps) {
  usePracticeModeSetup(modeId);
  useDocumentTitle();

  const isPlaying = useAppStore((s) => s.isPlaying);
  const progression = useAppStore((s) => s.progression);
  const currentBarIndex = useAppStore((s) => s.currentBarIndex);
  const currentChordIndex = useAppStore((s) => s.currentChordIndex);
  const loopCount = useAppStore((s) => s.loopCount);
  const tempo = useAppStore((s) => s.tempo);

  const {
    currentChord,
    fretNotes,
    targetNoteData,
    arpeggioConnections,
    ghostNotes,
  } = useFretboardData();

  const nextChord = getNextChord(
    progression,
    currentBarIndex,
    currentChordIndex,
  );

  const [settingsOpen, setSettingsOpen] = useState(false);
  const router = useRouter();

  const TOGGLE_MODES: { id: PracticeModeId; label: string }[] = [
    { id: "outline-chord-changes", label: "Fretboard" },
    { id: "comp-with-voicings", label: "Voicings" },
  ];

  const handleModeSwitch = (targetMode: PracticeModeId) => {
    if (targetMode === modeId) return;
    const qs = buildQueryString(progression, tempo);
    router.push(`/practice/${targetMode}?${qs}`);
  };

  return (
    <div className={`${display.variable} relative min-h-screen pb-24`}>
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,_rgba(251,146,60,0.04)_0%,_transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pt-4 space-y-4">
        {/* Top bar — collapses during play */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            isPlaying
              ? "max-h-0 opacity-0 pointer-events-none -mb-4"
              : "max-h-16 opacity-100",
          )}
        >
          <div className="flex items-center justify-between py-2">
            <Link
              href="/"
              className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground hover:text-stone-200 transition-colors"
            >
              FretPad
            </Link>
            {/* Mode toggle */}
            <div className="flex items-center gap-1 rounded-full bg-surface-alt/70 p-0.5">
              {TOGGLE_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handleModeSwitch(mode.id)}
                  className={cn(
                    "text-xs font-medium px-3 py-1 rounded-full transition-colors",
                    modeId === mode.id
                      ? "bg-stone-700 text-stone-200"
                      : "text-muted-foreground hover:text-stone-300",
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Setup controls — slide up and fade when playing */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            isPlaying
              ? "max-h-0 opacity-0 pointer-events-none -mt-4"
              : "max-h-[500px] opacity-100",
          )}
        >
          <div className="rounded-2xl border border-surface-border bg-surface/50 backdrop-blur-sm p-4 sm:p-5">
            <ProgressionEditor />
          </div>
        </div>

        {/* Now-playing bar — slides down when playing */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            isPlaying
              ? "max-h-40 opacity-100"
              : "max-h-0 opacity-0 pointer-events-none",
          )}
        >
          <PracticeNowPlaying
            currentChord={currentChord}
            nextChord={nextChord}
            micEnabled
          />
          <div className="mt-2">
            <ProgressBar variant="slim" />
          </div>
        </div>

        {/* Main visualization — Fretboard or Voicings depending on mode */}
        <div
          className={cn(
            "rounded-2xl border border-surface-border bg-surface/50 backdrop-blur-sm transition-all duration-300",
            isPlaying ? "p-3 sm:p-4" : "p-4 sm:p-5 lg:p-6",
          )}
        >
          {modeId === "comp-with-voicings" ? (
            <CompVoicingsView />
          ) : (
            <Fretboard
              fretNotes={fretNotes}
              targetNotes={targetNoteData.targets}
              ghostNotes={ghostNotes}
              chromaticApproaches={targetNoteData.chromatic}
              diatonicApproaches={targetNoteData.diatonic}
              arpeggioConnections={arpeggioConnections}
              showLegend
              showToolbar={!isPlaying}
            />
          )}
        </div>

        {/* Theory panel — collapses when playing */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            isPlaying
              ? "max-h-0 opacity-0 pointer-events-none"
              : "max-h-[800px] opacity-100",
          )}
        >
          <TheoryPanel chord={currentChord} />
        </div>
      </div>

      <TransportBar
        variant={isPlaying ? "minimal" : "full"}
        onSettingsClick={() => setSettingsOpen(true)}
        micSlot={!isPlaying ? <AudioInputScorecard enabled /> : undefined}
      />
      <TransportDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
      <FeedbackToast loopCount={loopCount} mode={modeId} tempo={tempo} />
    </div>
  );
}
