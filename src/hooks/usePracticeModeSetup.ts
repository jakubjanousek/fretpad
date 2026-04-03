"use client";

import { useEffect, useRef } from "react";
import type { PracticeModeId } from "@/lib/types";
import { useAppStore } from "@/state/useAppStore";
import { useUrlState } from "./useUrlState";

export function usePracticeModeSetup(modeId: PracticeModeId): void {
  const hasInitialUrlStateRef = useRef(
    typeof window !== "undefined" &&
      new URL(window.location.href).searchParams.has("p"),
  );
  const prevModeRef = useRef<PracticeModeId | null>(null);
  const enterMode = useAppStore((state) => state.enterMode);

  useUrlState();

  useEffect(() => {
    if (prevModeRef.current !== modeId) {
      prevModeRef.current = modeId;
      enterMode(modeId, {
        applyDefaults: !hasInitialUrlStateRef.current,
      });
    }
  }, [enterMode, modeId]);
}
