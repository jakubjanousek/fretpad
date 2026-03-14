"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearLegacyChallengeProgress,
  getUnlockedStep,
} from "@/lib/persistence/stepProgress";
import type { PracticeModeId } from "@/lib/types";
import { useAppStore } from "@/state/useAppStore";
import { useSessionTimer } from "./useSessionTimer";
import { useUrlState } from "./useUrlState";

interface UsePracticeModeSetupResult {
  unlockedStepIndex: number;
  refreshUnlockedStep: () => void;
}

export function usePracticeModeSetup(
  modeId: PracticeModeId,
): UsePracticeModeSetupResult {
  const [unlockedStepIndex, setUnlockedStepIndex] = useState(() =>
    getUnlockedStep(modeId),
  );
  const hasInitialUrlStateRef = useRef(
    typeof window !== "undefined" &&
      new URL(window.location.href).searchParams.has("p"),
  );
  const prevModeRef = useRef<PracticeModeId | null>(null);
  const enterMode = useAppStore((state) => state.enterMode);

  useUrlState();
  useSessionTimer();

  const refreshUnlockedStep = useCallback(() => {
    setUnlockedStepIndex(getUnlockedStep(modeId));
  }, [modeId]);

  useEffect(() => {
    if (prevModeRef.current !== modeId) {
      prevModeRef.current = modeId;
      enterMode(modeId, {
        applyDefaults: !hasInitialUrlStateRef.current,
      });
    }
  }, [enterMode, modeId]);

  useEffect(() => {
    clearLegacyChallengeProgress();
    refreshUnlockedStep();
  }, [refreshUnlockedStep]);

  return {
    unlockedStepIndex,
    refreshUnlockedStep,
  };
}
