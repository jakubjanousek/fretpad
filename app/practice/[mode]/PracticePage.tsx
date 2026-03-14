"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChallengeTracker } from "@/components/challenges/ChallengeTracker";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { FretboardHeader } from "@/components/fretboard/FretboardHeader";
import { HelpGuide } from "@/components/help/HelpGuide";
import { ModeHeader } from "@/components/modes/ModeHeader";
import { ProgressionEditor } from "@/components/progression/ProgressionEditor";
import { ShareExport } from "@/components/progression/ShareExport";
import { ChordToneQuiz } from "@/components/quiz/ChordToneQuiz";
import { PracticeStats } from "@/components/stats/PracticeStats";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TheoryPanel } from "@/components/theory/TheoryPanel";
import { ProgressBar } from "@/components/transport/ProgressBar";
import { TransportBar } from "@/components/transport/TransportBar";
import { TransportDrawer } from "@/components/transport/TransportDrawer";
import { Card, CardContent } from "@/components/ui/card";
import { useFirstVisit } from "@/hooks/useFirstVisit";
import { usePracticeTracker } from "@/hooks/usePracticeTracker";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { useUrlState } from "@/hooks/useUrlState";
import { getFretNotesForChord } from "@/lib/fretboard";
import { PRACTICE_MODES } from "@/lib/modes";
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
import type { PracticeModeId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

const AudioInputScorecard = dynamic(
  () =>
    import("@/components/transport/AudioInputScorecard").then(
      (m) => m.AudioInputScorecard,
    ),
  { ssr: false },
);

interface PracticePageProps {
  modeId: PracticeModeId;
}

export function PracticePage({ modeId }: PracticePageProps) {
  const modeConfig = PRACTICE_MODES[modeId];
  const hasInitialUrlStateRef = useRef(
    typeof window !== "undefined" &&
      new URL(window.location.href).searchParams.has("p"),
  );

  // Load state from URL if present
  useUrlState();

  // Run session timer
  useSessionTimer();

  // Enter mode on mount and when modeId changes
  const enterMode = useAppStore((state) => state.enterMode);
  const prevModeRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevModeRef.current !== modeId) {
      prevModeRef.current = modeId;
      enterMode(modeId, {
        applyDefaults: !hasInitialUrlStateRef.current,
      });
    }
  }, [enterMode, modeId]);

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

  // Voice leading state
  const voiceLeadingEnabled = useAppStore(
    (state) => state.voiceLeading.enabled,
  );
  const updateVoiceLeadingSuggestions = useAppStore(
    (state) => state.updateVoiceLeadingSuggestions,
  );

  // Panel states
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpGuideOpen, setHelpGuideOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  // Practice time tracking
  const { todayTimeMs } = usePracticeTracker({
    isPlaying,
    progressionName: progression.name,
    mode: modeId,
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

  // Update voice leading suggestions when the next chord is known
  // biome-ignore lint/correctness/useExhaustiveDependencies: selectedVoicingIndex triggers recalculation when user changes voicing
  useEffect(() => {
    if (!voiceLeadingEnabled || !showVoicings) {
      return;
    }

    const nextChord = getNextChord(
      progression,
      currentBarIndex,
      currentChordIndex,
    );
    updateVoiceLeadingSuggestions(nextChord);
  }, [
    voiceLeadingEnabled,
    showVoicings,
    progression,
    currentBarIndex,
    currentChordIndex,
    selectedVoicingIndex,
    updateVoiceLeadingSuggestions,
  ]);

  // Get the currently selected voicing
  // biome-ignore lint/correctness/useExhaustiveDependencies: availableVoicings and selectedVoicingIndex trigger re-computation when store updates
  const selectedVoicing = useMemo(() => {
    return getSelectedVoicing();
  }, [getSelectedVoicing, availableVoicings, selectedVoicingIndex]);

  // Keyboard shortcuts for panels and voicings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = document.activeElement?.tagName === "INPUT";
      const hasModifier = e.metaKey || e.ctrlKey || e.altKey;

      // Toggle help guide (H or ? key)
      if (
        (e.key.toLowerCase() === "h" || e.key === "?") &&
        !hasModifier &&
        !isInputFocused
      ) {
        e.preventDefault();
        setHelpGuideOpen((prev) => !prev);
      }

      // Toggle voicings (V key) - only if mode allows
      if (
        e.key.toLowerCase() === "v" &&
        !hasModifier &&
        !isInputFocused &&
        modeConfig.showVoicingsButton
      ) {
        e.preventDefault();
        setShowVoicings(!showVoicings);
      }

      // Previous voicing ([ key)
      if (e.key === "[" && !hasModifier && !isInputFocused) {
        e.preventDefault();
        selectPreviousVoicing();
      }

      // Next voicing (] key)
      if (e.key === "]" && !hasModifier && !isInputFocused) {
        e.preventDefault();
        selectNextVoicing();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    showVoicings,
    setShowVoicings,
    selectPreviousVoicing,
    selectNextVoicing,
    modeConfig.showVoicingsButton,
  ]);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
          <ModeHeader modeConfig={modeConfig} />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ShareExport />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          "container mx-auto px-3 sm:px-4 pt-2 sm:pt-3 flex flex-col gap-2 sm:gap-3",
          "pb-44",
        )}
      >
        {/* Progression Editor */}
        <section>
          <ProgressionEditor />
        </section>

        {/* Challenge Tracker */}
        <ChallengeTracker modeId={modeId} />

        {/* Fretboard */}
        <section>
          <Card className="h-full">
            <CardContent className="flex flex-col gap-1.5 py-2 sm:py-3 px-3 sm:px-6">
              <div className="flex justify-center">
                <FretboardHeader chord={currentChord} isPlaying={isPlaying} />
              </div>

              <ProgressBar />

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

              {/* Chord Tone Quiz - only if mode allows */}
              {modeConfig.showQuiz && <ChordToneQuiz />}
            </CardContent>
          </Card>
        </section>

        {/* Theory Panel */}
        <section>
          <TheoryPanel
            chord={currentChord}
            progression={progression}
            visibleTabs={modeConfig.theoryTabs}
          />
        </section>
      </main>

      {/* Fixed Transport Bar */}
      <TransportBar
        onSettingsClick={() => setSettingsOpen(true)}
        onGuideClick={() => setHelpGuideOpen(true)}
        onStatsClick={() => setStatsOpen(true)}
        onQuizClick={modeConfig.showQuiz ? startQuiz : undefined}
        onPlannerClick={undefined}
        micSlot={
          modeConfig.showMicToggle ? (
            <AudioInputScorecard enabled={modeConfig.showMicToggle} />
          ) : undefined
        }
      />

      {/* Settings Drawer */}
      <TransportDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Help Guide */}
      <HelpGuide open={helpGuideOpen} onOpenChange={setHelpGuideOpen} />

      {/* Practice Stats */}
      <PracticeStats
        open={statsOpen}
        onOpenChange={setStatsOpen}
        todayTimeMs={todayTimeMs}
      />
    </div>
  );
}
