"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { FretboardHeader } from "@/components/fretboard/FretboardHeader";
import { HelpGuide } from "@/components/help/HelpGuide";
import { SessionPlanner } from "@/components/planner/SessionPlanner";
import { PresetDropdown } from "@/components/progression/PresetDropdown";
import { ProgressionEditor } from "@/components/progression/ProgressionEditor";
import { ShareExport } from "@/components/progression/ShareExport";
import { ChordToneQuiz } from "@/components/quiz/ChordToneQuiz";
import { PracticeStats } from "@/components/stats/PracticeStats";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChordInfoSheet } from "@/components/theory/ChordInfoSheet";
import { ProgressBar } from "@/components/transport/ProgressBar";
import { TransportBar } from "@/components/transport/TransportBar";
import { TransportDrawer } from "@/components/transport/TransportDrawer";
import { Card, CardContent } from "@/components/ui/card";
import { useFirstVisit } from "@/hooks/useFirstVisit";
import { usePracticeTracker } from "@/hooks/usePracticeTracker";
import { useUrlState } from "@/hooks/useUrlState";
import { getFretNotesForChord } from "@/lib/fretboard";
import { getOverlayNotes } from "@/lib/theory/pentatonic";
import {
  calculateVoiceLeadingPaths,
  filterBestPaths,
  getNextChord,
} from "@/lib/theory/voiceLeading";
import { useAppStore } from "@/state/useAppStore";

export default function Page() {
  // Load state from URL if present
  useUrlState();

  const currentChord = useAppStore((state) => state.currentChord);
  const progression = useAppStore((state) => state.progression);
  const currentBarIndex = useAppStore((state) => state.currentBarIndex);
  const currentChordIndex = useAppStore((state) => state.currentChordIndex);
  const isPlaying = useAppStore((state) => state.isPlaying);
  const showScaleTones = useAppStore((state) => state.showScaleTones);
  const setShowScaleTones = useAppStore((state) => state.setShowScaleTones);
  const showVoiceLeading = useAppStore((state) => state.showVoiceLeading);
  const setShowVoiceLeading = useAppStore((state) => state.setShowVoiceLeading);
  const noteLabelMode = useAppStore((state) => state.noteLabelMode);
  const setNoteLabelMode = useAppStore((state) => state.setNoteLabelMode);
  const previewScale = useAppStore((state) => state.previewScale);
  const fretboardOverlay = useAppStore((state) => state.fretboardOverlay);
  const setFretboardOverlay = useAppStore((state) => state.setFretboardOverlay);

  // Quiz state
  const quizActive = useAppStore((state) => state.quizActive);
  const quizQuestion = useAppStore((state) => state.quizQuestion);
  const startQuiz = useAppStore((state) => state.startQuiz);

  // Panel states
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chordInfoOpen, setChordInfoOpen] = useState(false);
  const [helpGuideOpen, setHelpGuideOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);

  // Practice time tracking
  const { todayTimeMs } = usePracticeTracker({
    isPlaying,
    progressionName: progression.name,
  });

  // First-time user detection
  const { isFirstVisit, markAsVisited } = useFirstVisit();

  // Show help guide on first visit
  useEffect(() => {
    if (isFirstVisit) {
      setHelpGuideOpen(true);
      markAsVisited();
    }
  }, [isFirstVisit, markAsVisited]);

  // Keyboard shortcuts for panels (I and ? keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = document.activeElement?.tagName === "INPUT";
      const hasModifier = e.metaKey || e.ctrlKey || e.altKey;

      // Toggle chord info panel (I key)
      if (e.key.toLowerCase() === "i" && !hasModifier && !isInputFocused) {
        e.preventDefault();
        setChordInfoOpen((prev) => !prev);
      }

      // Toggle help guide (H or ? key)
      if (
        (e.key.toLowerCase() === "h" || e.key === "?") &&
        !hasModifier &&
        !isInputFocused
      ) {
        e.preventDefault();
        setHelpGuideOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleChordHeaderClick = useCallback(() => {
    setChordInfoOpen(true);
  }, []);

  // Use preview scale if set, otherwise use the first suggested scale
  const activeScale =
    previewScale || (showScaleTones ? currentChord?.suggestedScales[0] : null);

  const isOverlayActive = fretboardOverlay !== "none";

  const fretNotes = useMemo(() => {
    if (!currentChord) return [];

    if (isOverlayActive) {
      return getOverlayNotes(
        currentChord.root,
        fretboardOverlay as Exclude<typeof fretboardOverlay, "none">,
      );
    }

    return getFretNotesForChord(currentChord, {
      includeScale: showScaleTones || !!previewScale,
      scaleName: activeScale || undefined,
    });
  }, [
    currentChord,
    isOverlayActive,
    fretboardOverlay,
    showScaleTones,
    previewScale,
    activeScale,
  ]);

  // Calculate voice leading paths to next chord
  const voiceLeadingPaths = useMemo(() => {
    if (!showVoiceLeading || !currentChord) return [];

    const nextChord = getNextChord(
      progression,
      currentBarIndex,
      currentChordIndex,
    );
    if (!nextChord) return [];

    const allPaths = calculateVoiceLeadingPaths(currentChord, nextChord);
    return filterBestPaths(allPaths);
  }, [
    showVoiceLeading,
    currentChord,
    progression,
    currentBarIndex,
    currentChordIndex,
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight shrink-0">
            FretFlow
          </h1>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Progression
            </span>
            <PresetDropdown />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ShareExport />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content - add bottom padding for fixed transport bar */}
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-col gap-2 sm:gap-3 pb-20">
        {/* Progression Editor Section */}
        <section>
          <Card>
            <CardContent className="py-2 sm:py-3 px-3 sm:px-6">
              <ProgressionEditor />
            </CardContent>
          </Card>
        </section>

        {/* Fretboard Visualization Section */}
        <section className="flex-1">
          <Card className="h-full">
            <CardContent className="flex flex-col gap-1.5 py-2 sm:py-3 px-3 sm:px-6">
              {/* Prominent chord header */}
              <div className="flex justify-center">
                <FretboardHeader
                  chord={currentChord}
                  isPlaying={isPlaying}
                  onChordClick={handleChordHeaderClick}
                />
              </div>

              {/* Progress bar */}
              <ProgressBar />

              {/* Fretboard */}
              <Fretboard
                fretNotes={fretNotes}
                voiceLeadingPaths={voiceLeadingPaths}
                showVoiceLeading={showVoiceLeading}
                showScaleTones={showScaleTones}
                noteLabelMode={noteLabelMode}
                fretboardOverlay={fretboardOverlay}
                onToggleVoiceLeading={() =>
                  setShowVoiceLeading(!showVoiceLeading)
                }
                onToggleScaleTones={() => setShowScaleTones(!showScaleTones)}
                onNoteLabelModeChange={setNoteLabelMode}
                onOverlayChange={setFretboardOverlay}
                quizMode={quizActive}
                quizTargetPosition={
                  quizQuestion ? quizQuestion.targetNote : null
                }
              />

              {/* Chord Tone Quiz */}
              <ChordToneQuiz />
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Fixed Transport Bar */}
      <TransportBar
        onSettingsClick={() => setSettingsOpen(true)}
        onGuideClick={() => setHelpGuideOpen(true)}
        onStatsClick={() => setStatsOpen(true)}
        onQuizClick={startQuiz}
        onPlannerClick={() => setPlannerOpen(true)}
      />

      {/* Settings Drawer */}
      <TransportDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Chord Info Sheet */}
      <ChordInfoSheet
        chord={currentChord}
        open={chordInfoOpen}
        onOpenChange={setChordInfoOpen}
      />

      {/* Help Guide */}
      <HelpGuide open={helpGuideOpen} onOpenChange={setHelpGuideOpen} />

      {/* Practice Session Planner */}
      <SessionPlanner open={plannerOpen} onOpenChange={setPlannerOpen} />

      {/* Practice Stats */}
      <PracticeStats
        open={statsOpen}
        onOpenChange={setStatsOpen}
        todayTimeMs={todayTimeMs}
      />
    </div>
  );
}
