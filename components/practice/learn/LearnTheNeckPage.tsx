"use client";

import { Guitar, Mic, MicOff, Radio, Sparkles, Target } from "lucide-react";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Note } from "tonal";
import { useShallow } from "zustand/react/shallow";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { FretboardHeader } from "@/components/fretboard/FretboardHeader";
import { HelpGuide } from "@/components/help/HelpGuide";
import { ModeHeader } from "@/components/modes/ModeHeader";
import { ShareExport } from "@/components/progression/ShareExport";
import { PracticeStats } from "@/components/stats/PracticeStats";
import { StepStepper } from "@/components/steps/StepStepper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AudioInputScorecard } from "@/components/transport/AudioInputScorecard";
import { ProgressBar } from "@/components/transport/ProgressBar";
import { TransportBar } from "@/components/transport/TransportBar";
import { TransportDrawer } from "@/components/transport/TransportDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirstVisit } from "@/hooks/useFirstVisit";
import { useFretboardData } from "@/hooks/useFretboardData";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { usePracticeModeSetup } from "@/hooks/usePracticeModeSetup";
import { usePracticeTracker } from "@/hooks/usePracticeTracker";
import { useRollingAccuracy } from "@/hooks/useRollingAccuracy";
import { MODE_STEPS, PRACTICE_MODES } from "@/lib/modes";
import { unlockStep } from "@/lib/persistence/stepProgress";
import type { FretNote, TargetNoteMode } from "@/lib/types";
import { assertNever, cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

interface LearnQuizQuestion {
  chordSymbol: string;
  contextKey: string;
  prompt: string;
  targetNote: string;
}

interface QuizFeedback {
  tone: "correct" | "incorrect" | "neutral";
  message: string;
}

type InputMode = "tap" | "mic";

const MODE_ID = "learn-the-neck";
const MODE_CONFIG = PRACTICE_MODES[MODE_ID];
const LEARN_STEPS = MODE_STEPS[MODE_ID];
const STEP_PRESETS = [
  "Dorian Vamp (Dm7)",
  "ii-V-I in C",
  "ii-V-I in C",
] as const;
const FEEDBACK_DELAY_MS = 700;

function getStepPool(
  notes: FretNote[],
  targetMode: TargetNoteMode,
): FretNote[] {
  return notes.filter((note) => {
    if (note.fret > 12) {
      return false;
    }

    switch (targetMode) {
      case "root":
        return note.isRoot;
      case "root-and-guides":
        return note.isRoot || note.isGuideTone;
      case "chord-tones":
        return note.isChordTone;
      case "none":
      case "all":
      case "strong-beats":
        return false;
      default:
        return assertNever(targetMode);
    }
  });
}

function buildQuestion(
  notes: FretNote[],
  targetMode: TargetNoteMode,
  chordSymbol: string,
  contextKey: string,
  inputMode: InputMode,
): LearnQuizQuestion | null {
  const pool = getStepPool(notes, targetMode);
  const noteNames = [...new Set(pool.map((note) => note.note))];
  if (noteNames.length === 0) {
    return null;
  }

  const targetNote =
    noteNames[Math.floor(Math.random() * noteNames.length)] ?? noteNames[0];
  if (!targetNote) {
    return null;
  }

  return {
    chordSymbol,
    contextKey,
    targetNote,
    prompt:
      inputMode === "mic" ? `Play any ${targetNote}` : `Tap any ${targetNote}`,
  };
}

export function LearnTheNeckPage() {
  const modeConfig = MODE_CONFIG;
  const { unlockedStepIndex, refreshUnlockedStep } =
    usePracticeModeSetup(MODE_ID);
  const [activeStepIndex, setActiveStepIndex] = useState(unlockedStepIndex);
  const [inputMode, setInputMode] = useState<InputMode>("tap");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpGuideOpen, setHelpGuideOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [question, setQuestion] = useState<LearnQuizQuestion | null>(null);
  const [feedback, setFeedback] = useState<QuizFeedback | null>(null);
  const [unlockMessage, setUnlockMessage] = useState<string | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const {
    currentChord,
    currentBarIndex,
    currentChordIndex,
    progression,
    isPlaying,
    loadPreset,
  } = useAppStore(
    useShallow((state) => ({
      currentChord: state.currentChord,
      currentBarIndex: state.currentBarIndex,
      currentChordIndex: state.currentChordIndex,
      progression: state.progression,
      isPlaying: state.isPlaying,
      loadPreset: state.loadPreset,
    })),
  );
  const { fretNotes } = useFretboardData();
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

  // Synchronous gate: prevents double-answer from sustained notes detected on consecutive RAF frames
  const processingRef = useRef(false);
  // Cancellable feedback timer: prevents stale closure from firing after step/mode change
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Clean up feedback timer on unmount
  useEffect(() => () => clearTimeout(feedbackTimerRef.current), []);

  useEffect(() => {
    setActiveStepIndex(unlockedStepIndex);
  }, [unlockedStepIndex]);

  useEffect(() => {
    const preset = STEP_PRESETS[activeStepIndex] ?? STEP_PRESETS[0];
    startTransition(() => {
      loadPreset(preset);
    });
    setQuestion(null);
    setFeedback(null);
    setUnlockMessage(null);
    clearTimeout(feedbackTimerRef.current);
    processingRef.current = false;
  }, [activeStepIndex, loadPreset]);

  const currentStep = LEARN_STEPS[activeStepIndex] ?? LEARN_STEPS[0];
  const contextKey = `${currentBarIndex}:${currentChordIndex}:${currentChord?.symbol ?? "none"}`;

  // Refs for values accessed inside the feedback timeout to avoid stale closures
  const fretNotesRef = useRef(fretNotes);
  fretNotesRef.current = fretNotes;
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;
  const currentChordRef = useRef(currentChord);
  currentChordRef.current = currentChord;
  const inputModeRef = useRef(inputMode);
  inputModeRef.current = inputMode;

  const regenerateQuestion = useCallback(() => {
    if (!currentChord) {
      setQuestion(null);
      return;
    }

    setQuestion(
      buildQuestion(
        fretNotes,
        currentStep.targetMode,
        currentChord.symbol,
        contextKey,
        inputMode,
      ),
    );
  }, [contextKey, currentChord, currentStep.targetMode, fretNotes, inputMode]);

  useEffect(() => {
    regenerateQuestion();
  }, [regenerateQuestion]);

  const processAnswer = useCallback(
    (noteName: string, isCorrect: boolean) => {
      if (!question) return;

      processingRef.current = true;
      record(isCorrect);
      setSessionCorrect((value) => value + (isCorrect ? 1 : 0));
      setCurrentStreak((value) => {
        const next = isCorrect ? value + 1 : 0;
        setBestStreak((best) => Math.max(best, next));
        return next;
      });
      setFeedback({
        tone: isCorrect ? "correct" : "incorrect",
        message: isCorrect
          ? `${noteName} is correct for ${question.chordSymbol}.`
          : `${noteName} misses the prompt. Find ${question.targetNote} instead.`,
      });

      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => {
        processingRef.current = false;
        setFeedback(null);
        const { currentBarIndex: bar, currentChordIndex: chord } =
          useAppStore.getState();
        const ch = currentChordRef.current;
        setQuestion(
          buildQuestion(
            fretNotesRef.current,
            currentStepRef.current.targetMode,
            ch?.symbol ?? question.chordSymbol,
            `${bar}:${chord}:${ch?.symbol ?? question.chordSymbol}`,
            inputModeRef.current,
          ),
        );
      }, FEEDBACK_DELAY_MS);
    },
    [question, record],
  );

  const handleAnswer = useCallback(
    (note: FretNote) => {
      if (!question) return;

      if (question.contextKey !== contextKey) {
        setFeedback({
          tone: "neutral",
          message: "Chord changed before you answered. New prompt loaded.",
        });
        setQuestion(
          buildQuestion(
            fretNotes,
            currentStep.targetMode,
            currentChord?.symbol ?? question.chordSymbol,
            contextKey,
            inputMode,
          ),
        );
        return;
      }

      processAnswer(note.note, note.note === question.targetNote);
    },
    [
      contextKey,
      currentChord,
      currentStep.targetMode,
      fretNotes,
      inputMode,
      processAnswer,
      question,
    ],
  );

  // Stable ref for question to avoid stale closure in mic callback
  const questionRef = useRef(question);
  questionRef.current = question;
  const feedbackRef = useRef(feedback);
  feedbackRef.current = feedback;
  const contextKeyRef = useRef(contextKey);
  contextKeyRef.current = contextKey;

  const handleMicDetection = useCallback(
    (chroma: number, pitchClass: string) => {
      const q = questionRef.current;
      // Synchronous gate: skip while feedback is showing OR already processing
      if (!q || feedbackRef.current || processingRef.current) return;

      if (q.contextKey !== contextKeyRef.current) return; // chord changed

      const targetChroma = Note.chroma(q.targetNote);
      if (targetChroma === undefined) return;

      processAnswer(pitchClass, chroma === targetChroma);
    },
    [processAnswer],
  );

  const { toggleMic, signalElementRef, stopMic } = usePitchDetection({
    enabled: inputMode === "mic",
    onPitchDetected: handleMicDetection,
  });

  // Auto-toggle mic when switching to/from mic mode
  const prevInputModeRef = useRef(inputMode);
  useEffect(() => {
    if (prevInputModeRef.current === inputMode) return;
    const prev = prevInputModeRef.current;
    prevInputModeRef.current = inputMode;

    if (inputMode === "mic" && prev === "tap") {
      toggleMic();
    } else if (inputMode === "tap" && prev === "mic") {
      stopMic();
    }
  }, [inputMode, toggleMic, stopMic]);

  const micActive = useAppStore((s) => s.micActive);

  useEffect(() => {
    const nextStepIndex = activeStepIndex + 1;
    const nextStep = LEARN_STEPS[nextStepIndex];

    if (!isUnlockEligible || !nextStep || unlockedStepIndex >= nextStepIndex) {
      return;
    }

    unlockStep(MODE_ID, nextStepIndex);
    refreshUnlockedStep();
    setUnlockMessage(`Step ${nextStepIndex + 1} unlocked: ${nextStep.label}`);
  }, [
    activeStepIndex,
    isUnlockEligible,
    refreshUnlockedStep,
    unlockedStepIndex,
  ]);

  const accuracyPercent = Math.round(accuracy * 100);
  const sessionAttempts = attemptCount;
  const sessionMisses = sessionAttempts - sessionCorrect;
  const completedStepButtons = useMemo(
    () =>
      LEARN_STEPS.map((step, index) => ({
        disabled: index > unlockedStepIndex,
        index,
        step,
      })),
    [unlockedStepIndex],
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_28%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background))_45%,color-mix(in_oklab,hsl(var(--muted))_38%,transparent))]">
      <header className="sticky top-0 z-30 border-b bg-card/85 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between gap-2 px-3 py-2 sm:px-4">
          <ModeHeader modeConfig={modeConfig} />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ShareExport />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto flex flex-col gap-3 px-3 pb-44 pt-3 sm:px-4 sm:pt-4">
        <section className="grid gap-3 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.9fr)]">
          <Card className="overflow-hidden border-amber-500/20 bg-card/95 shadow-[0_20px_80px_rgba(15,23,42,0.12)]">
            <CardContent className="flex flex-col gap-3 px-4 py-4 sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                  >
                    {inputMode === "mic" ? (
                      <Mic className="h-3.5 w-3.5" />
                    ) : (
                      <Target className="h-3.5 w-3.5" />
                    )}
                    {inputMode === "mic" ? "Mic Drill" : "Tap Drill"}
                  </Badge>
                  <div>
                    <p className="font-serif text-2xl tracking-tight sm:text-3xl">
                      {question?.prompt ?? "Loading question..."}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Current chord:{" "}
                      <span className="font-medium text-foreground">
                        {currentChord?.symbol ?? "..."}
                      </span>
                      {" · "}
                      {inputMode === "mic"
                        ? "Play the note on your instrument."
                        : "Labels are hidden so the neck stays the test surface."}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
                  <p className="mb-2 font-medium">Input mode</p>
                  <div
                    data-slot="button-group"
                    className="inline-flex overflow-hidden rounded-md border border-border shadow-xs"
                  >
                    <Button
                      variant="toggle"
                      size="xs"
                      data-state={inputMode === "tap" ? "on" : "off"}
                      onClick={() => setInputMode("tap")}
                      className="gap-1.5 rounded-none border-0 border-r border-border"
                    >
                      <Target className="h-3 w-3" />
                      Tap
                    </Button>
                    <Button
                      variant="toggle"
                      size="xs"
                      data-state={inputMode === "mic" ? "on" : "off"}
                      onClick={() => setInputMode("mic")}
                      className="gap-1.5 rounded-none border-0"
                    >
                      <Mic className="h-3 w-3" />
                      Mic
                    </Button>
                  </div>
                  <p className="mt-2 text-muted-foreground">
                    {inputMode === "mic"
                      ? "Play the note on any string or fret."
                      : "Tap matching positions on frets 0\u201312."}
                  </p>
                </div>
              </div>

              <StepStepper
                modeId={MODE_ID}
                currentStepIndex={activeStepIndex}
                unlockedStepIndex={unlockedStepIndex}
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
                      Keep drilling here, or move to the next guided step.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setActiveStepIndex((index) =>
                        Math.min(index + 1, unlockedStepIndex),
                      );
                      setUnlockMessage(null);
                    }}
                  >
                    Continue
                  </Button>
                </div>
              ) : null}

              <div aria-live="polite" className="sr-only">
                {question
                  ? `${question.prompt} for ${question.chordSymbol}.`
                  : ""}
              </div>
              <div aria-live="assertive" className="sr-only">
                {unlockMessage ?? feedback?.message ?? ""}
              </div>

              <div className="rounded-2xl border bg-background/70 px-3 py-3">
                <div className="flex justify-center">
                  <FretboardHeader chord={currentChord} isPlaying={isPlaying} />
                </div>
                <ProgressBar />
                <div className="mt-2">
                  <Fretboard
                    fretNotes={fretNotes}
                    quizMode={false}
                    noteLabelModeOverride="none"
                    onNoteClick={handleAnswer}
                    showControls={false}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            <Card className="border-slate-200/70 bg-card/90">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Radio className="h-4 w-4" />
                  Session Scorecard
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-muted-foreground">Accuracy</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {accuracyPercent}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-muted-foreground">Attempts</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {sessionAttempts}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-muted-foreground">Current streak</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {currentStreak}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-muted-foreground">Best streak</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {bestStreak}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-dashed px-3 py-3">
                  <p className="font-medium">Feedback</p>
                  <p
                    className={cn(
                      "mt-1 text-sm text-muted-foreground",
                      feedback?.tone === "correct" &&
                        "text-emerald-600 dark:text-emerald-400",
                      feedback?.tone === "incorrect" &&
                        "text-red-500 dark:text-red-400",
                    )}
                  >
                    {feedback?.message ??
                      (inputMode === "mic"
                        ? "Play a note on your instrument to answer."
                        : "Tap a note on the board to answer the prompt.")}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Correct: {sessionCorrect} · Misses:{" "}
                    {Math.max(0, sessionMisses)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 bg-card/90">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4" />
                  Replay Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {completedStepButtons.map(({ disabled, index, step }) => (
                  <Button
                    key={step.id}
                    variant={index === activeStepIndex ? "default" : "outline"}
                    disabled={disabled}
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

            <Card className="border-slate-200/70 bg-card/90">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Guitar className="h-4 w-4" />
                  Drill Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Step 1 stays on a single Dm7 vamp. Steps 2 and 3 switch to a
                  ii-V-I loop so the target note pool changes with the harmony.
                </p>
                <p>
                  Questions only use positions through fret 12. Shared URLs
                  still load the progression, but step unlocks stay personal.
                </p>
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
          inputMode === "mic" ? (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                onClick={toggleMic}
                aria-label={
                  micActive ? "Disable microphone" : "Enable microphone"
                }
                className={cn(
                  "relative flex h-11 w-11 flex-col items-center gap-0.5 rounded-full transition-all duration-150 hover:bg-background/80 active:scale-95 sm:h-auto sm:w-auto sm:rounded-lg sm:px-2 sm:py-1.5",
                  micActive && "text-rose-500",
                )}
              >
                {micActive ? (
                  <Mic className="h-4 w-4" />
                ) : (
                  <MicOff className="h-4 w-4" />
                )}
                <span className="hidden text-[10px] leading-tight text-muted-foreground sm:block">
                  Mic
                </span>
                {micActive && (
                  <span
                    ref={signalElementRef}
                    className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 transition-colors duration-150 [&.signal-active]:bg-emerald-500 sm:right-0.5 sm:top-0.5"
                  />
                )}
              </Button>
            </div>
          ) : (
            <AudioInputScorecard enabled={modeConfig.showMicToggle} />
          )
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
