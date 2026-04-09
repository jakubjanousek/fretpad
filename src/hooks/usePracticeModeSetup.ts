"use client";

import { track } from "@vercel/analytics";
import { useEffect, useRef } from "react";
import type { PracticeModeId } from "@/lib/types";
import { useAppStore } from "@/state/useAppStore";
import { hadInitialUrlState, useUrlSync } from "./useUrlSync";

export function usePracticeModeSetup(modeId: PracticeModeId): void {
  const prevModeRef = useRef<PracticeModeId | null>(null);
  const enterMode = useAppStore((state) => state.enterMode);

  useUrlSync();

  useEffect(() => {
    if (prevModeRef.current !== modeId) {
      prevModeRef.current = modeId;
      enterMode(modeId, {
        applyDefaults: !hadInitialUrlState,
      });
      track("mode_enter", { modeId });
    }
  }, [enterMode, modeId]);
}
