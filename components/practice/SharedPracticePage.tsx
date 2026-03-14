"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { FretboardHeader } from "@/components/fretboard/FretboardHeader";
import { HelpGuide } from "@/components/help/HelpGuide";
import { ModeHeader } from "@/components/modes/ModeHeader";
import { ProgressionEditor } from "@/components/progression/ProgressionEditor";
import { ShareExport } from "@/components/progression/ShareExport";
import { ChordToneQuiz } from "@/components/quiz/ChordToneQuiz";
import { PracticeStats } from "@/components/stats/PracticeStats";
import { StepStepper } from "@/components/steps/StepStepper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TheoryPanel } from "@/components/theory/TheoryPanel";
import { ProgressBar } from "@/components/transport/ProgressBar";
import { TransportBar } from "@/components/transport/TransportBar";
import { TransportDrawer } from "@/components/transport/TransportDrawer";
import { Card, CardContent } from "@/components/ui/card";
import { useFirstVisit } from "@/hooks/useFirstVisit";
import { useFretboardData } from "@/hooks/useFretboardData";
import { usePracticeModeSetup } from "@/hooks/usePracticeModeSetup";
import { usePracticeTracker } from "@/hooks/usePracticeTracker";
import { useRollingAccuracy } from "@/hooks/useRollingAccuracy";
import { MODE_STEPS, PRACTICE_MODES } from "@/lib/modes";
import { getNextChord } from "@/lib/theory/voiceLeading";
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

interface SharedPracticePageProps {
  modeId: PracticeModeId;
}

export function SharedPracticePage({ modeId }: SharedPracticePageProps) {
  const modeConfig = PRACTICE_MODES[modeId];
  const { unlockedStepIndex } = usePracticeModeSetup(modeId);

  const {
    currentChord,
    progression,
    currentBarIndex,
    currentChordIndex,
    isPlaying,
    quizActive,
    quizQuestion,
    startQuiz,
    showVoicings,
    setShowVoicings,
    showVoicingFingers,
    setShowVoicingFingers,
    availableVoicings,
    selectedVoicingIndex,
    selectNextVoicing,
    selectPreviousVoicing,
    getSelectedVoicing,
    refreshVoicingsForChord,
    voiceLeadingEnabled,
    updateVoiceLeadingSuggestions,
  } = useAppStore(
    useShallow((state) => ({
      currentChord: state.currentChord,
      progression: state.progression,
      currentBarIndex: state.currentBarIndex,
      currentChordIndex: state.currentChordIndex,
      isPlaying: state.isPlaying,
      quizActive: state.quizActive,
      quizQuestion: state.quizQuestion,
      startQuiz: state.startQuiz,
      showVoicings: state.showVoicings,
      setShowVoicings: state.setShowVoicings,
      showVoicingFingers: state.showVoicingFingers,
      setShowVoicingFingers: state.setShowVoicingFingers,
      availableVoicings: state.availableVoicings,
      selectedVoicingIndex: state.selectedVoicingIndex,
      selectNextVoicing: state.selectNextVoicing,
      selectPreviousVoicing: state.selectPreviousVoicing,
      getSelectedVoicing: state.getSelectedVoicing,
      refreshVoicingsForChord: state.refreshVoicingsForChord,
      voiceLeadingEnabled: state.voiceLeading.enabled,
      updateVoiceLeadingSuggestions: state.updateVoiceLeadingSuggestions,
    })),
  );
  const { fretNotes, voiceLeadingPaths, targetNoteData, arpeggioConnections } =
    useFretboardData();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpGuideOpen, setHelpGuideOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const currentStepIndex = Math.min(
    unlockedStepIndex,
    MODE_STEPS[modeId].length - 1,
  );
  const { accuracy, attemptCount } = useRollingAccuracy(currentStepIndex);

  const { todayTimeMs } = usePracticeTracker({
    isPlaying,
    progressionName: progression.name,
    mode: modeId,
  });

  const { isFirstVisit, markAsVisited } = useFirstVisit();

  useEffect(() => {
    if (isFirstVisit) {
      setHelpGuideOpen(true);
      markAsVisited();
    }
  }, [isFirstVisit, markAsVisited]);

  useEffect(() => {
    if (showVoicings && currentChord) {
      refreshVoicingsForChord(currentChord);
    }
  }, [currentChord, showVoicings, refreshVoicingsForChord]);

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: availableVoicings and selectedVoicingIndex trigger re-computation when store updates
  const selectedVoicing = useMemo(() => {
    return getSelectedVoicing();
  }, [getSelectedVoicing, availableVoicings, selectedVoicingIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = document.activeElement?.tagName === "INPUT";
      const hasModifier = e.metaKey || e.ctrlKey || e.altKey;

      if (
        (e.key.toLowerCase() === "h" || e.key === "?") &&
        !hasModifier &&
        !isInputFocused
      ) {
        e.preventDefault();
        setHelpGuideOpen((prev) => !prev);
      }

      if (
        e.key.toLowerCase() === "v" &&
        !hasModifier &&
        !isInputFocused &&
        modeConfig.showVoicingsButton
      ) {
        e.preventDefault();
        setShowVoicings(!showVoicings);
      }

      if (e.key === "[" && !hasModifier && !isInputFocused) {
        e.preventDefault();
        selectPreviousVoicing();
      }

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
          <ModeHeader modeConfig={modeConfig} />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ShareExport />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main
        className={cn(
          "container mx-auto px-3 sm:px-4 pt-2 sm:pt-3 flex flex-col gap-2 sm:gap-3",
          "pb-44",
        )}
      >
        <section>
          <ProgressionEditor />
        </section>

        <StepStepper
          modeId={modeId}
          currentStepIndex={currentStepIndex}
          unlockedStepIndex={unlockedStepIndex}
          accuracy={accuracy}
          attemptCount={attemptCount}
        />

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
                quizMode={quizActive}
                quizTargetPosition={
                  quizQuestion ? quizQuestion.targetNote : null
                }
                targetNotes={targetNoteData.targets}
                chromaticApproaches={targetNoteData.chromatic}
                diatonicApproaches={targetNoteData.diatonic}
                enclosures={targetNoteData.enclosures}
                arpeggioConnections={arpeggioConnections}
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

              {modeConfig.showQuiz && <ChordToneQuiz />}
            </CardContent>
          </Card>
        </section>

        <section>
          <TheoryPanel
            chord={currentChord}
            progression={progression}
            visibleTabs={modeConfig.theoryTabs}
          />
        </section>
      </main>

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

      <TransportDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
      <HelpGuide open={helpGuideOpen} onOpenChange={setHelpGuideOpen} />
      <PracticeStats
        open={statsOpen}
        onOpenChange={setStatsOpen}
        todayTimeMs={todayTimeMs}
      />
    </div>
  );
}
