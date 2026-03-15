"use client";

import { Activity, Crosshair, MicOff, Radio, Target } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
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
import { ProgressBar } from "@/components/transport/ProgressBar";
import { TransportBar } from "@/components/transport/TransportBar";
import { TransportDrawer } from "@/components/transport/TransportDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirstVisit } from "@/hooks/useFirstVisit";
import { useFretboardData } from "@/hooks/useFretboardData";
import { usePracticeModeSetup } from "@/hooks/usePracticeModeSetup";
import { usePracticeTracker } from "@/hooks/usePracticeTracker";
import { useRollingAccuracy } from "@/hooks/useRollingAccuracy";
import { MODE_STEPS, PRACTICE_MODES } from "@/lib/modes";
import { unlockStep } from "@/lib/persistence/stepProgress";
import { useAppStore } from "@/state/useAppStore";

const AudioInputScorecard = dynamic(
  () =>
    import("@/components/transport/AudioInputScorecard").then(
      (m) => m.AudioInputScorecard,
    ),
  { ssr: false },
);

const MODE_ID = "outline-chord-changes" as const;
const MODE_CONFIG = PRACTICE_MODES[MODE_ID];
const OUTLINE_STEPS = MODE_STEPS[MODE_ID];

export function OutlineChangesPage() {
  const { unlockedStepIndex, refreshUnlockedStep } =
    usePracticeModeSetup(MODE_ID);
  const [activeStepIndex, setActiveStepIndex] = useState(unlockedStepIndex);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpGuideOpen, setHelpGuideOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [unlockMessage, setUnlockMessage] = useState<string | null>(null);

  const {
    currentChord,
    progression,
    isPlaying,
    micActive,
    score,
    setTargetNoteMode,
    setShowChromaticApproach,
  } = useAppStore(
    useShallow((state) => ({
      currentChord: state.currentChord,
      progression: state.progression,
      isPlaying: state.isPlaying,
      micActive: state.micActive,
      score: state.score,
      setTargetNoteMode: state.setTargetNoteMode,
      setShowChromaticApproach: state.setShowChromaticApproach,
    })),
  );

  const { fretNotes, voiceLeadingPaths, targetNoteData } = useFretboardData();

  const { accuracy, attemptCount, isUnlockEligible, record } =
    useRollingAccuracy(activeStepIndex);

  const { todayTimeMs } = usePracticeTracker({
    isPlaying,
    progressionName: progression.name,
    mode: MODE_ID,
  });

  const { isFirstVisit, markAsVisited } = useFirstVisit();

  useEffect(() => {
    if (isFirstVisit) {
      setHelpGuideOpen(true);
      markAsVisited();
    }
  }, [isFirstVisit, markAsVisited]);

  // Sync activeStepIndex when unlockedStepIndex changes (e.g. on mount)
  useEffect(() => {
    setActiveStepIndex(unlockedStepIndex);
  }, [unlockedStepIndex]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: activeStepIndex is the reset trigger
  useEffect(() => {
    setUnlockMessage(null);
  }, [activeStepIndex]);

  // Set targetNoteMode and approach notes based on current step
  const currentStep = OUTLINE_STEPS[activeStepIndex] ?? OUTLINE_STEPS[0];
  useEffect(() => {
    setTargetNoteMode(currentStep.targetMode);
    // Step 3 (approach-notes) expands scoring by showing chromatic approaches
    setShowChromaticApproach(currentStep.id === "approach-notes");
  }, [
    currentStep.targetMode,
    currentStep.id,
    setTargetNoteMode,
    setShowChromaticApproach,
  ]);

  // Deferred step advancement — only advance at loop boundary
  const pendingUnlockRef = useRef(false);

  // Track unlock eligibility
  useEffect(() => {
    const nextStepIndex = activeStepIndex + 1;
    const nextStep = OUTLINE_STEPS[nextStepIndex];

    if (!isUnlockEligible || !nextStep || unlockedStepIndex >= nextStepIndex) {
      return;
    }

    if (isPlaying) {
      // Defer advancement to loop boundary
      pendingUnlockRef.current = true;
      setUnlockMessage(
        `Step ${nextStepIndex + 1} ready: ${nextStep.label} — will unlock at loop end.`,
      );
    } else {
      // Not playing — unlock immediately
      unlockStep(MODE_ID, nextStepIndex);
      refreshUnlockedStep();
      setUnlockMessage(`Step ${nextStepIndex + 1} unlocked: ${nextStep.label}`);
    }
  }, [
    activeStepIndex,
    isPlaying,
    isUnlockEligible,
    refreshUnlockedStep,
    unlockedStepIndex,
  ]);

  // Loop-boundary detection via Zustand subscription — fires synchronously on
  // every state change, so intermediate bar transitions cannot be missed by
  // React batching (unlike a useEffect on currentBarIndex).
  const activeStepIndexRef = useRef(activeStepIndex);
  activeStepIndexRef.current = activeStepIndex;
  const unlockedStepIndexRef = useRef(unlockedStepIndex);
  unlockedStepIndexRef.current = unlockedStepIndex;

  useEffect(() => {
    let prevBar = useAppStore.getState().currentBarIndex;
    const unsub = useAppStore.subscribe((state) => {
      const bar = state.currentBarIndex;
      if (pendingUnlockRef.current && bar === 0 && prevBar !== 0) {
        pendingUnlockRef.current = false;
        const nextStepIndex = activeStepIndexRef.current + 1;
        const nextStep = OUTLINE_STEPS[nextStepIndex];
        if (nextStep && unlockedStepIndexRef.current < nextStepIndex) {
          unlockStep(MODE_ID, nextStepIndex);
          refreshUnlockedStep();
          setUnlockMessage(
            `Step ${nextStepIndex + 1} unlocked: ${nextStep.label}`,
          );
        }
      }
      prevBar = bar;
    });
    return unsub;
  }, [refreshUnlockedStep]);

  // Stats for scorecard
  const accuracyPercent = Math.round(accuracy * 100);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_28%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background))_45%,color-mix(in_oklab,hsl(var(--muted))_38%,transparent))]">
      <header className="sticky top-0 z-30 border-b bg-card/85 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between gap-2 px-3 py-2 sm:px-4">
          <ModeHeader modeConfig={MODE_CONFIG} />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ShareExport />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto flex flex-col gap-3 px-3 pb-44 pt-3 sm:px-4 sm:pt-4">
        {/* Visual Only banner when mic is not active */}
        {!micActive && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-2.5 text-sm">
            <MicOff className="h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">
                Visual Only mode.
              </span>{" "}
              Enable the microphone in the transport bar for pitch scoring and
              step gating.
            </p>
          </div>
        )}

        <section className="grid gap-3 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.9fr)]">
          <div className="flex flex-col gap-3">
            {/* Target call-out and step context */}
            <Card className="overflow-hidden border-blue-500/20 bg-card/95 shadow-[0_20px_80px_rgba(15,23,42,0.12)]">
              <CardContent className="flex flex-col gap-3 px-4 py-4 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Badge
                      variant="secondary"
                      className="gap-1 bg-blue-500/15 text-blue-700 dark:text-blue-300"
                    >
                      <Crosshair className="h-3.5 w-3.5" />
                      {currentStep.label}
                    </Badge>
                    <div>
                      <p className="font-serif text-2xl tracking-tight sm:text-3xl">
                        {getStepInstruction(currentStep.id)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Current chord:{" "}
                        <span className="font-medium text-foreground">
                          {currentChord?.symbol ?? "..."}
                        </span>
                        {micActive && " · Mic scoring active"}
                      </p>
                    </div>
                  </div>

                  {micActive && (
                    <div className="rounded-2xl border border-dashed border-blue-500/30 bg-blue-500/5 px-4 py-3 text-sm">
                      <p className="font-medium">Scoring</p>
                      <p className="mt-1 text-muted-foreground">
                        Play target notes as chords change. Hits are evaluated
                        at each chord transition.
                      </p>
                    </div>
                  )}
                </div>

                <StepStepper
                  modeId={MODE_ID}
                  currentStepIndex={activeStepIndex}
                  unlockedStepIndex={
                    micActive ? unlockedStepIndex : OUTLINE_STEPS.length - 1
                  }
                  accuracy={accuracy}
                  attemptCount={attemptCount}
                />

                {unlockMessage ? (
                  <div className="flex flex-col gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-emerald-700 dark:text-emerald-300">
                        {unlockMessage}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Keep practicing here, or move to the next step.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setActiveStepIndex((index) =>
                          Math.min(
                            index + 1,
                            micActive
                              ? unlockedStepIndex
                              : OUTLINE_STEPS.length - 1,
                          ),
                        );
                        setUnlockMessage(null);
                      }}
                    >
                      Continue
                    </Button>
                  </div>
                ) : null}

                <div aria-live="polite" className="sr-only">
                  {currentChord
                    ? `${getStepInstruction(currentStep.id)} Current chord: ${currentChord.symbol}.`
                    : ""}
                </div>
                <div aria-live="assertive" className="sr-only">
                  {unlockMessage ?? ""}
                </div>
              </CardContent>
            </Card>

            {/* Progression Editor */}
            <section>
              <ProgressionEditor />
            </section>

            {/* Fretboard */}
            <Card>
              <CardContent className="flex flex-col gap-1.5 px-3 py-2 sm:px-6 sm:py-3">
                <div className="flex justify-center">
                  <FretboardHeader chord={currentChord} isPlaying={isPlaying} />
                </div>
                <ProgressBar />
                <Fretboard
                  fretNotes={fretNotes}
                  voiceLeadingPaths={voiceLeadingPaths}
                  targetNotes={targetNoteData.targets}
                  chromaticApproaches={targetNoteData.chromatic}
                  diatonicApproaches={targetNoteData.diatonic}
                  enclosures={targetNoteData.enclosures}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right panel — Scorecard + Steps */}
          <div className="grid gap-3">
            {/* Scorecard panel */}
            <Card className="border-slate-200/70 bg-card/90">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4" />
                  Session Scorecard
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-muted-foreground">
                      {micActive ? "Rolling Accuracy" : "Accuracy"}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {micActive ? `${accuracyPercent}%` : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-muted-foreground">Evaluations</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {micActive ? attemptCount : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-muted-foreground">Hits</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {micActive ? score.hits : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-muted-foreground">Misses</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {micActive ? score.total - score.hits : "—"}
                    </p>
                  </div>
                </div>

                {!micActive && (
                  <div className="rounded-xl border border-dashed px-3 py-3">
                    <p className="text-sm text-muted-foreground">
                      Enable the microphone to see real-time scoring. Target
                      notes pulse on the fretboard for visual practice.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Replay Steps */}
            <Card className="border-slate-200/70 bg-card/90">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4" />
                  Practice Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {OUTLINE_STEPS.map((step, index) => (
                  <Button
                    key={step.id}
                    variant={index === activeStepIndex ? "default" : "outline"}
                    disabled={micActive ? index > unlockedStepIndex : false}
                    className="justify-start"
                    onClick={() => {
                      setActiveStepIndex(index);
                      setUnlockMessage(null);
                    }}
                  >
                    Step {index + 1}: {step.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Step info */}
            <Card className="border-slate-200/70 bg-card/90">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Radio className="h-4 w-4" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Play along with the backing track. Target notes on the
                  fretboard pulse when each chord changes.
                </p>
                <p>
                  With mic scoring on, your pitch is evaluated at every chord
                  transition. Reach 80% accuracy over 10 evaluations to unlock
                  the next step.
                </p>
                {!micActive && (
                  <p>
                    Without a microphone, all steps are accessible for visual
                    practice but won&apos;t track accuracy.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <TransportBar
        onSettingsClick={() => setSettingsOpen(true)}
        onGuideClick={() => setHelpGuideOpen(true)}
        onStatsClick={() => setStatsOpen(true)}
        onQuizClick={undefined}
        onPlannerClick={undefined}
        micSlot={
          <AudioInputScorecard
            enabled={MODE_CONFIG.showMicToggle}
            onEvaluationResult={record}
          />
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

function getStepInstruction(stepId: string): string {
  switch (stepId) {
    case "hit-the-root":
      return "Play the root note on each chord change";
    case "aim-guide-tones":
      return "Land on root or guide tones (3rd, 7th) at changes";
    case "approach-notes":
      return "Use approach notes to lead into target tones";
    case "free-improv":
      return "Improvise freely — all chord tones score";
    default:
      return "Play along with the changes";
  }
}
