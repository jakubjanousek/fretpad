"use client";

import { BrainCircuit, RotateCcw, Trophy, X, Zap } from "lucide-react";
import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

const QUIZ_LENGTH = 10;

/**
 * Format interval for display with musical symbols
 */
function formatInterval(interval: string): string {
  return interval.replace(/b/g, "\u266D").replace(/#/g, "\u266F");
}

export function ChordToneQuiz() {
  const quizActive = useAppStore((s) => s.quizActive);
  const quizQuestion = useAppStore((s) => s.quizQuestion);
  const quizScore = useAppStore((s) => s.quizScore);
  const quizTotal = useAppStore((s) => s.quizTotal);
  const quizStreak = useAppStore((s) => s.quizStreak);
  const quizBestStreak = useAppStore((s) => s.quizBestStreak);
  const quizLastResult = useAppStore((s) => s.quizLastResult);
  const quizFinished = useAppStore((s) => s.quizFinished);
  const currentChord = useAppStore((s) => s.currentChord);

  const startQuiz = useAppStore((s) => s.startQuiz);
  const submitQuizAnswer = useAppStore((s) => s.submitQuizAnswer);
  const nextQuizQuestion = useAppStore((s) => s.nextQuizQuestion);
  const endQuiz = useAppStore((s) => s.endQuiz);

  // Auto-advance to next question after feedback
  useEffect(() => {
    if (quizLastResult && !quizFinished) {
      const timer = setTimeout(() => {
        nextQuizQuestion();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [quizLastResult, quizFinished, nextQuizQuestion]);

  const handleAnswer = useCallback(
    (interval: string) => {
      if (quizLastResult) return; // Prevent double-clicks during feedback
      submitQuizAnswer(interval);
    },
    [quizLastResult, submitQuizAnswer],
  );

  if (!quizActive) return null;
  if (!currentChord) return null;

  // Quiz finished — show summary
  if (quizFinished) {
    const accuracy = Math.round((quizScore / QUIZ_LENGTH) * 100);
    return (
      <div className="border-t bg-muted/30 rounded-b-lg px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Quiz Complete
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={endQuiz}
            className="h-7 w-7 rounded-full"
            aria-label="Close quiz"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {quizScore}/{QUIZ_LENGTH}
            </div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{accuracy}%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              {quizBestStreak}
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={startQuiz}
            className="flex-1"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Play Again
          </Button>
          <Button variant="ghost" size="sm" onClick={endQuiz}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  // Active quiz — show question
  if (!quizQuestion) return null;

  return (
    <div className="border-t bg-muted/30 rounded-b-lg px-4 py-3">
      {/* Header: score + progress + close */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">
            <BrainCircuit className="w-3.5 h-3.5 inline mr-1" />
            {quizTotal + (quizLastResult ? 0 : 0)}/{QUIZ_LENGTH}
          </span>
          <span className="text-xs font-medium">Score: {quizScore}</span>
          {quizStreak > 1 && (
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
              <Zap className="w-3 h-3" />
              {quizStreak}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={endQuiz}
          className="h-7 w-7 rounded-full"
          aria-label="Close quiz"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Question prompt */}
      <p className="text-sm text-center mb-3 text-muted-foreground">
        What interval is the highlighted note in{" "}
        <span className="font-semibold text-foreground">
          {quizQuestion.chord.symbol}
        </span>
        ?
      </p>

      {/* Answer buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {quizQuestion.availableIntervals.map((interval) => {
          const isCorrectAnswer = interval === quizQuestion.targetNote.interval;
          const showCorrect = quizLastResult && isCorrectAnswer;
          const showIncorrect =
            quizLastResult === "incorrect" && !isCorrectAnswer;

          return (
            <Button
              key={interval}
              variant="outline"
              size="sm"
              disabled={!!quizLastResult}
              onClick={() => handleAnswer(interval)}
              className={cn(
                "min-w-14 text-sm font-mono transition-all duration-150",
                showCorrect &&
                  "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400",
                showIncorrect && "opacity-40",
                !quizLastResult &&
                  "hover:bg-accent hover:border-foreground/30 active:scale-95",
              )}
            >
              {formatInterval(interval)}
            </Button>
          );
        })}
      </div>

      {/* Feedback */}
      {quizLastResult && (
        <div
          className={cn(
            "text-center mt-2 text-xs font-medium animate-in fade-in duration-200",
            quizLastResult === "correct"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-500 dark:text-red-400",
          )}
        >
          {quizLastResult === "correct"
            ? "Correct!"
            : `Incorrect — it was ${formatInterval(quizQuestion.targetNote.interval)}`}
        </div>
      )}
    </div>
  );
}
