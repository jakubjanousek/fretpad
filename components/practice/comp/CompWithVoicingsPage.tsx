"use client";

import {
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import { useShallow } from "zustand/react/shallow";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { FretboardHeader } from "@/components/fretboard/FretboardHeader";
import { HelpGuide } from "@/components/help/HelpGuide";
import { ModeHeader } from "@/components/modes/ModeHeader";
import { ProgressionEditor } from "@/components/progression/ProgressionEditor";
import { ShareExport } from "@/components/progression/ShareExport";
import { PracticeStats } from "@/components/stats/PracticeStats";
import { StepStepper } from "@/components/steps/StepStepper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TheoryPanel } from "@/components/theory/TheoryPanel";
import { ProgressBar } from "@/components/transport/ProgressBar";
import { TransportBar } from "@/components/transport/TransportBar";
import { TransportDrawer } from "@/components/transport/TransportDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChordDiagram } from "@/components/voicing/ChordDiagram";
import { useFirstVisit } from "@/hooks/useFirstVisit";
import { useFretboardData } from "@/hooks/useFretboardData";
import { usePracticeModeSetup } from "@/hooks/usePracticeModeSetup";
import { usePracticeTracker } from "@/hooks/usePracticeTracker";
import {
  createChordInstrument,
  defaultChordConfig,
} from "@/lib/audio/instruments/chordInstrument";
import { getFullVoicing } from "@/lib/audio/voicings";
import { PRACTICE_MODES } from "@/lib/modes";
import { unlockStep } from "@/lib/persistence/stepProgress";
import { getNextChord } from "@/lib/theory/voiceLeading";
import type { Chord, GuitarVoicing } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

const COMP_MODE_ID = "comp-with-voicings" as const;
const EXPLORE_THRESHOLD = 5;

export function CompWithVoicingsPage() {
  const modeConfig = PRACTICE_MODES[COMP_MODE_ID];
  const { unlockedStepIndex, refreshUnlockedStep } =
    usePracticeModeSetup(COMP_MODE_ID);

  const {
    currentChord,
    progression,
    currentBarIndex,
    currentChordIndex,
    isPlaying,
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
    setVoiceLeadingEnabled,
    setShowMovementIndicators,
    updateVoiceLeadingSuggestions,
    voiceLeadingSuggestions,
    selectSuggestedVoicing,
  } = useAppStore(
    useShallow((state) => ({
      currentChord: state.currentChord,
      progression: state.progression,
      currentBarIndex: state.currentBarIndex,
      currentChordIndex: state.currentChordIndex,
      isPlaying: state.isPlaying,
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
      setVoiceLeadingEnabled: state.setVoiceLeadingEnabled,
      setShowMovementIndicators: state.setShowMovementIndicators,
      updateVoiceLeadingSuggestions: state.updateVoiceLeadingSuggestions,
      voiceLeadingSuggestions: state.voiceLeadingSuggestions,
      selectSuggestedVoicing: state.selectSuggestedVoicing,
    })),
  );

  const { fretNotes, voiceLeadingPaths } = useFretboardData();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpGuideOpen, setHelpGuideOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  // Stage gating: track unique voicings explored
  const [explored, setExplored] = useState(new Set<string>());
  const currentStepIndex = Math.min(
    unlockedStepIndex,
    1, // comp mode has 2 steps (0, 1)
  );
  const isStage1 = currentStepIndex === 0;
  const isStage2 = currentStepIndex === 1;

  const { todayTimeMs } = usePracticeTracker({
    isPlaying,
    progressionName: progression.name,
    mode: COMP_MODE_ID,
  });

  const { isFirstVisit, markAsVisited } = useFirstVisit();

  useEffect(() => {
    if (isFirstVisit) {
      setHelpGuideOpen(true);
      markAsVisited();
    }
  }, [isFirstVisit, markAsVisited]);

  // Auto-enable voicings on mount for comp mode
  // biome-ignore lint/correctness/useExhaustiveDependencies: only run on mount
  useEffect(() => {
    setShowVoicings(true);
  }, []);

  // Refresh voicings when chord changes
  useEffect(() => {
    if (showVoicings && currentChord) {
      refreshVoicingsForChord(currentChord);
    }
  }, [currentChord, showVoicings, refreshVoicingsForChord]);

  // Stage 2: auto-enable voice leading once (user can toggle off after)
  const hasAutoEnabledVoiceLeading = useRef(false);
  useEffect(() => {
    if (isStage2 && !hasAutoEnabledVoiceLeading.current) {
      hasAutoEnabledVoiceLeading.current = true;
      setVoiceLeadingEnabled(true);
      setShowMovementIndicators(true);
    }
  }, [isStage2, setVoiceLeadingEnabled, setShowMovementIndicators]);

  // Update voice leading suggestions when relevant state changes
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

  // Track explored voicings (pure updater, no side effects)
  const trackExploration = useCallback((voicingId: string) => {
    setExplored((prev) => {
      if (prev.has(voicingId)) return prev;
      const next = new Set(prev);
      next.add(voicingId);
      return next;
    });
  }, []);

  // Unlock stage 2 when exploration threshold is reached
  useEffect(() => {
    if (explored.size >= EXPLORE_THRESHOLD && unlockedStepIndex === 0) {
      unlockStep(COMP_MODE_ID, 1);
      refreshUnlockedStep();
    }
  }, [explored.size, unlockedStepIndex, refreshUnlockedStep]);

  // Track current voicing as explored
  useEffect(() => {
    if (selectedVoicing) {
      trackExploration(selectedVoicing.id);
    }
  }, [selectedVoicing, trackExploration]);

  // Play voicing button: trigger chord strum via synth
  const synthRef = useRef<ReturnType<typeof createChordInstrument> | null>(
    null,
  );
  const isMountedRef = useRef(true);
  const synthCreatingRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      synthRef.current?.dispose();
      synthRef.current = null;
    };
  }, []);

  const handlePlayVoicing = useCallback(async () => {
    if (!currentChord) return;

    try {
      await Tone.start();
    } catch {
      return;
    }

    if (!isMountedRef.current) return;

    if (!synthRef.current && !synthCreatingRef.current) {
      synthCreatingRef.current = true;
      synthRef.current = createChordInstrument(defaultChordConfig);
      synthCreatingRef.current = false;
    }

    if (!synthRef.current) return;

    // Play the chord's full voicing through the synth
    const voicing = getFullVoicing(currentChord, 4);
    synthRef.current.triggerAttackRelease(voicing.notes, "2n");
  }, [currentChord]);

  // Keyboard shortcuts
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
  }, [selectPreviousVoicing, selectNextVoicing]);

  // Progress config for StepStepper
  const progressConfig = useMemo(
    () => ({
      percent:
        unlockedStepIndex >= 1
          ? 100
          : Math.min((explored.size / EXPLORE_THRESHOLD) * 100, 100),
      label: `Explore ${EXPLORE_THRESHOLD} unique voicings to unlock the next stage.`,
      valueLabel:
        unlockedStepIndex >= 1 ? "" : `${explored.size} / ${EXPLORE_THRESHOLD}`,
    }),
    [explored.size, unlockedStepIndex],
  );

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
          modeId={COMP_MODE_ID}
          currentStepIndex={currentStepIndex}
          unlockedStepIndex={unlockedStepIndex}
          accuracy={0}
          attemptCount={0}
          progressConfig={progressConfig}
          stepLabel="Stage"
        />

        {/* Stage-specific content */}
        {isStage1 && (
          <VoicingExplorer
            currentChord={currentChord}
            selectedVoicing={selectedVoicing}
            availableVoicings={availableVoicings}
            selectedVoicingIndex={selectedVoicingIndex}
            showVoicingFingers={showVoicingFingers}
            onNextVoicing={selectNextVoicing}
            onPreviousVoicing={selectPreviousVoicing}
            onPlayVoicing={handlePlayVoicing}
          />
        )}

        {isStage2 && voiceLeadingSuggestions.length > 0 && (
          <section className="rounded-lg border bg-card px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium">
                Voice Leading Suggestions
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {voiceLeadingSuggestions.slice(0, 3).map((suggestion, idx) => (
                <Button
                  key={suggestion.voicing.id}
                  variant="outline"
                  size="sm"
                  onClick={() => selectSuggestedVoicing(idx)}
                  className="h-8 text-xs px-3 flex items-center gap-1.5"
                  title={`Score: ${suggestion.score.toFixed(1)}, Common tones: ${suggestion.commonToneCount}`}
                >
                  <span className="truncate max-w-24">
                    {suggestion.voicing.name.split(" - ")[1] ??
                      suggestion.voicing.type}
                  </span>
                  {suggestion.commonToneCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1 py-0 text-emerald-600 dark:text-emerald-400"
                    >
                      {suggestion.commonToneCount} common
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </section>
        )}

        <section>
          <Card className="h-full">
            <CardContent className="flex flex-col gap-1.5 py-2 sm:py-3 px-3 sm:px-6">
              <div className="flex justify-center">
                <FretboardHeader chord={currentChord} isPlaying={isPlaying} />
              </div>

              <ProgressBar />

              <Fretboard
                fretNotes={fretNotes}
                voiceLeadingPaths={isStage2 ? voiceLeadingPaths : []}
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

// --- Stage 1: Voicing Explorer ---

interface VoicingExplorerProps {
  currentChord: Chord | null;
  selectedVoicing: GuitarVoicing | null;
  availableVoicings: GuitarVoicing[];
  selectedVoicingIndex: number;
  showVoicingFingers: boolean;
  onNextVoicing: () => void;
  onPreviousVoicing: () => void;
  onPlayVoicing: () => void;
}

function VoicingExplorer({
  currentChord,
  selectedVoicing,
  availableVoicings,
  selectedVoicingIndex,
  showVoicingFingers,
  onNextVoicing,
  onPreviousVoicing,
  onPlayVoicing,
}: VoicingExplorerProps) {
  if (!selectedVoicing || !currentChord) {
    return (
      <section className="rounded-lg border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
        Loading voicings...
      </section>
    );
  }

  return (
    <section className="rounded-lg border bg-card px-4 py-3">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Chord Diagram — hero element */}
        <div className="flex flex-col items-center gap-2">
          <ChordDiagram
            voicing={selectedVoicing}
            width={140}
            showFingers={showVoicingFingers}
            showFretNumbers
            chordName={currentChord.symbol}
          />
        </div>

        {/* Voicing info + controls */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Voicing name and type */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">
                {selectedVoicing.name}
              </span>
              <Badge
                variant="secondary"
                className="shrink-0 text-xs bg-violet-500/20 text-violet-600 dark:text-violet-400"
              >
                {selectedVoicing.type}
              </Badge>
            </div>
            {selectedVoicing.vSystem && (
              <p className="text-xs text-muted-foreground">
                {[
                  selectedVoicing.vSystem,
                  selectedVoicing.stringGroup,
                  selectedVoicing.voicingStructure,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>

          {/* Navigation + Play */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousVoicing}
              disabled={availableVoicings.length === 0}
              className="h-9 px-2"
              aria-label="Previous voicing"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm text-muted-foreground tabular-nums min-w-16 text-center">
              {availableVoicings.length > 0
                ? `${selectedVoicingIndex + 1} of ${availableVoicings.length}`
                : "None"}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={onNextVoicing}
              disabled={availableVoicings.length === 0}
              className="h-9 px-2"
              aria-label="Next voicing"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={onPlayVoicing}
              className="h-9 gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-white ml-auto"
              aria-label="Play voicing"
            >
              <Volume2 className="h-4 w-4" />
              <span className="hidden sm:inline">Play</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
