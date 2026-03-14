"use client";

import { useEffect, useState } from "react";

export const ROLLING_ACCURACY_WINDOW = 10;
export const ROLLING_ACCURACY_THRESHOLD = 0.8;

export interface RollingAccuracyResult {
  accuracy: number;
  attemptCount: number;
  isUnlockEligible: boolean;
  record: (correct: boolean) => void;
  reset: () => void;
}

export function useRollingAccuracy(stepIndex: number): RollingAccuracyResult {
  const [attempts, setAttempts] = useState<boolean[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the active step index is the reset boundary
  useEffect(() => {
    setAttempts([]);
  }, [stepIndex]);

  const accuracy =
    attempts.length === 0
      ? 0
      : attempts.filter(Boolean).length / attempts.length;

  return {
    accuracy,
    attemptCount: attempts.length,
    isUnlockEligible:
      attempts.length >= ROLLING_ACCURACY_WINDOW &&
      accuracy >= ROLLING_ACCURACY_THRESHOLD,
    record: (correct) => {
      setAttempts((previous) => [
        ...previous.slice(-(ROLLING_ACCURACY_WINDOW - 1)),
        correct,
      ]);
    },
    reset: () => {
      setAttempts([]);
    },
  };
}
