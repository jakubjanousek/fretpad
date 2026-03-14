"use client";

import { BrainCircuit, RotateCcw, X, Zap } from "lucide-react";
import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

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
  const currentChord = useAppStore((s) => s.currentChord);

  const startQuiz = useAppStore((s) => s.startQuiz);
  const submitQuizAnswer = useAppStore((s) => s.submitQuizAnswer);
  const nextQuizQuestion = useAppStore((s) => s.nextQuizQuestion);
  const endQuiz = useAppStore((s) => s.endQuiz);

  // Auto-advance to next question after feedback
  useEffect(() => {
    if (quizLastResult) {
      const timer = setTimeout(() => {
        nextQuizQuestion();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [quizLastResult, nextQuizQuestion]);

  const handleAnswer = useCallback(
    (interval: string) => {
      if (quizLastResult) return; // Prevent double-clicks during feedback
      submitQuizAnswer(interval);
    },
    [quizLastResult, submitQuizAnswer],
  );

  if (!quizActive) return null;
  if (!currentChord) return null;

  // Active quiz — show question
  if (!quizQuestion) return null;

  const accuracy =
    quizTotal === 0 ? null : Math.round((quizScore / quizTotal) * 100);

  return (
    <div className="border-t bg-muted/30 rounded-b-lg px-4 py-3">
      {/* Header: score + stats + close */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">
            <BrainCircuit className="w-3.5 h-3.5 inline mr-1" />
            {quizTotal} attempts
          </span>
          <span className="text-xs font-medium">Score: {quizScore}</span>
          {accuracy !== null && (
            <span className="text-xs font-medium text-muted-foreground">
              Accuracy: {accuracy}%
            </span>
          )}
          {quizStreak > 1 && (
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
              <Zap className="w-3 h-3" />
              {quizStreak}
            </span>
          )}
          {quizBestStreak > 1 && (
            <span className="hidden sm:inline text-xs text-muted-foreground">
              Best {quizBestStreak}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={startQuiz}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset
          </Button>
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
