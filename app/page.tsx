"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { FretboardHeader } from "@/components/fretboard/FretboardHeader";
import { HelpGuide } from "@/components/help/HelpGuide";
import { SessionDock } from "@/components/planner/SessionDock";
import { SessionPlanner } from "@/components/planner/SessionPlanner";
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
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { useUrlState } from "@/hooks/useUrlState";
import { getFretNotesForChord } from "@/lib/fretboard";
import {
  getArpeggioConnections,
  getArpeggioNotes,
} from "@/lib/theory/arpeggios";
import { getOverlayNotes } from "@/lib/theory/pentatonic";
import {
  filterApproachNotesFromChordTones,
  getChromaticApproachNotes,
  getDiatonicApproachNotes,
  getEnclosurePatterns,
  getTargetNotes,
} from "@/lib/theory/targetNotes";
import { getThreeNPSNotes } from "@/lib/theory/threeNPS";
import {
  calculateVoiceLeadingPaths,
  filterBestPaths,
  getNextChord,
} from "@/lib/theory/voiceLeading";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

export default function Page() {
  // Load state from URL if present
  useUrlState();

  // Run session timer (must be at page level so it ticks even when sheet is closed)
  useSessionTimer();
  const sessionActive = useAppStore((state) => state.sessionActive);

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
  const showCAGEDPositions = useAppStore((state) => state.showCAGEDPositions);
  const setShowCAGEDPositions = useAppStore(
    (state) => state.setShowCAGEDPositions,
  );
  const focusedPosition = useAppStore((state) => state.focusedPosition);
  const setFocusedPosition = useAppStore((state) => state.setFocusedPosition);

  // Target Notes state
  const targetNoteMode = useAppStore((state) => state.targetNoteMode);
  const setTargetNoteMode = useAppStore((state) => state.setTargetNoteMode);
  const showChromaticApproach = useAppStore(
    (state) => state.showChromaticApproach,
  );
  const setShowChromaticApproach = useAppStore(
    (state) => state.setShowChromaticApproach,
  );
  const showDiatonicApproach = useAppStore(
    (state) => state.showDiatonicApproach,
  );
  const setShowDiatonicApproach = useAppStore(
    (state) => state.setShowDiatonicApproach,
  );
  const showEnclosures = useAppStore((state) => state.showEnclosures);
  const setShowEnclosures = useAppStore((state) => state.setShowEnclosures);
  const focusedEnclosureTarget = useAppStore(
    (state) => state.focusedEnclosureTarget,
  );
  const setFocusedEnclosureTarget = useAppStore(
    (state) => state.setFocusedEnclosureTarget,
  );

  // Quiz state
  const quizActive = useAppStore((state) => state.quizActive);
  const quizQuestion = useAppStore((state) => state.quizQuestion);
  const startQuiz = useAppStore((state) => state.startQuiz);

  // Voicing state
  const showVoicings = useAppStore((state) => state.showVoicings);
  const setShowVoicings = useAppStore((state) => state.setShowVoicings);
  const showVoicingFingers = useAppStore((state) => state.showVoicingFingers);
  const setShowVoicingFingers = useAppStore(
    (state) => state.setShowVoicingFingers,
  );
  const availableVoicings = useAppStore((state) => state.availableVoicings);
  const selectedVoicingIndex = useAppStore(
    (state) => state.selectedVoicingIndex,
  );
  const selectNextVoicing = useAppStore((state) => state.selectNextVoicing);
  const selectPreviousVoicing = useAppStore(
    (state) => state.selectPreviousVoicing,
  );
  const getSelectedVoicing = useAppStore((state) => state.getSelectedVoicing);
  const refreshVoicingsForChord = useAppStore(
    (state) => state.refreshVoicingsForChord,
  );

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

  // Refresh voicings when chord changes
  useEffect(() => {
    if (showVoicings && currentChord) {
      refreshVoicingsForChord(currentChord);
    }
  }, [currentChord, showVoicings, refreshVoicingsForChord]);

  // Get the currently selected voicing
  // biome-ignore lint/correctness/useExhaustiveDependencies: availableVoicings and selectedVoicingIndex trigger re-computation when store updates
  const selectedVoicing = useMemo(() => {
    return getSelectedVoicing();
  }, [getSelectedVoicing, availableVoicings, selectedVoicingIndex]);

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
      if (fretboardOverlay === "threeNotePerString") {
        const scaleName =
          currentChord.suggestedScales[0]?.split(" ").slice(1).join(" ") ||
          "major";
        return getThreeNPSNotes(currentChord.root, {
          chord: currentChord,
          scaleName,
        });
      }
      if (fretboardOverlay === "arpeggio") {
        return getArpeggioNotes(currentChord.root, {
          chord: currentChord,
        });
      }
      return getOverlayNotes(
        currentChord.root,
        fretboardOverlay as Exclude<
          typeof fretboardOverlay,
          "none" | "threeNotePerString" | "arpeggio"
        >,
        { chord: currentChord },
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

  // Calculate arpeggio connections for SVG overlay
  const arpeggioConnections = useMemo(() => {
    if (fretboardOverlay !== "arpeggio") return [];
    return getArpeggioConnections(fretNotes);
  }, [fretboardOverlay, fretNotes]);

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

  // Calculate target notes and approaches
  const targetNoteData = useMemo(() => {
    if (!currentChord || targetNoteMode === "none") {
      return {
        targets: [],
        chromatic: [],
        diatonic: [],
        enclosures: [],
      };
    }

    const targets = getTargetNotes(targetNoteMode, fretNotes);

    const chromatic = showChromaticApproach
      ? filterApproachNotesFromChordTones(
          getChromaticApproachNotes(targets),
          fretNotes.filter((n) => n.isChordTone),
        )
      : [];

    const diatonic = showDiatonicApproach
      ? filterApproachNotesFromChordTones(
          getDiatonicApproachNotes(
            currentChord,
            targets,
            activeScale || currentChord.suggestedScales[0],
          ),
          fretNotes.filter((n) => n.isChordTone),
        )
      : [];

    const enclosures = showEnclosures ? getEnclosurePatterns(targets) : [];

    return { targets, chromatic, diatonic, enclosures };
  }, [
    currentChord,
    targetNoteMode,
    fretNotes,
    showChromaticApproach,
    showDiatonicApproach,
    showEnclosures,
    activeScale,
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight shrink-0">
            FretFlow
          </h1>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ShareExport />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content - add bottom padding for fixed transport bar (+ dock when session active) */}
      <main
        className={cn(
          "flex-1 container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-col gap-2 sm:gap-3",
          sessionActive ? "pb-32" : "pb-20",
        )}
      >
        {/* Progression Editor Section - compact strip, fretboard should dominate */}
        <section>
          <ProgressionEditor />
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
                showCAGEDPositions={showCAGEDPositions}
                focusedPosition={focusedPosition}
                onToggleVoiceLeading={() =>
                  setShowVoiceLeading(!showVoiceLeading)
                }
                onToggleScaleTones={() => setShowScaleTones(!showScaleTones)}
                onNoteLabelModeChange={setNoteLabelMode}
                onOverlayChange={setFretboardOverlay}
                onToggleCAGEDPositions={() =>
                  setShowCAGEDPositions(!showCAGEDPositions)
                }
                onFocusedPositionChange={setFocusedPosition}
                quizMode={quizActive}
                quizTargetPosition={
                  quizQuestion ? quizQuestion.targetNote : null
                }
                // Target Notes props
                targetNoteMode={targetNoteMode}
                targetNotes={targetNoteData.targets}
                chromaticApproaches={targetNoteData.chromatic}
                diatonicApproaches={targetNoteData.diatonic}
                enclosures={targetNoteData.enclosures}
                showChromaticApproach={showChromaticApproach}
                showDiatonicApproach={showDiatonicApproach}
                showEnclosures={showEnclosures}
                focusedEnclosureTarget={focusedEnclosureTarget}
                onTargetNoteModeChange={setTargetNoteMode}
                onToggleChromaticApproach={() =>
                  setShowChromaticApproach(!showChromaticApproach)
                }
                onToggleDiatonicApproach={() =>
                  setShowDiatonicApproach(!showDiatonicApproach)
                }
                onToggleEnclosures={() => setShowEnclosures(!showEnclosures)}
                onFocusedEnclosureTargetChange={setFocusedEnclosureTarget}
                arpeggioConnections={arpeggioConnections}
                // Voicing props
                showVoicings={showVoicings}
                selectedVoicing={selectedVoicing}
                showVoicingFingers={showVoicingFingers}
                onToggleVoicings={() => setShowVoicings(!showVoicings)}
                onToggleVoicingFingers={() =>
                  setShowVoicingFingers(!showVoicingFingers)
                }
                onNextVoicing={selectNextVoicing}
                onPreviousVoicing={selectPreviousVoicing}
                availableVoicingsCount={availableVoicings.length}
                selectedVoicingIndex={selectedVoicingIndex}
              />

              {/* Chord Tone Quiz */}
              <ChordToneQuiz />
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Session Dock - compact bar above transport when practice session is active */}
      <SessionDock onExpand={() => setPlannerOpen(true)} />

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
