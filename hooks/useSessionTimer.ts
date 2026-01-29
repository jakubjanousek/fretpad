"use client";

import { useEffect, useRef } from "react";
import { SESSION_PHASES } from "@/state/slices/sessionPlannerSlice";
import { useAppStore } from "@/state/useAppStore";

/**
 * Runs the practice session timer and auto-advance logic.
 * Must be mounted whenever a session could be active (e.g. in page.tsx)
 * so the timer keeps ticking even when the SessionPlanner sheet is closed.
 */
export function useSessionTimer() {
  const sessionActive = useAppStore((s) => s.sessionActive);
  const sessionPaused = useAppStore((s) => s.sessionPaused);
  const sessionPhaseIndex = useAppStore((s) => s.sessionPhaseIndex);
  const sessionPhaseElapsedMs = useAppStore((s) => s.sessionPhaseElapsedMs);
  const tickSessionTimer = useAppStore((s) => s.tickSessionTimer);
  const advancePhase = useAppStore((s) => s.advancePhase);

  const currentPhase = SESSION_PHASES[sessionPhaseIndex];

  // Timer tick
  const lastTickRef = useRef<number>(0);
  useEffect(() => {
    if (!sessionActive || sessionPaused) {
      lastTickRef.current = 0;
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      if (lastTickRef.current === 0) {
        lastTickRef.current = now;
        return;
      }
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      tickSessionTimer(delta);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive, sessionPaused, tickSessionTimer]);

  // Auto-advance when phase time is exceeded
  useEffect(() => {
    if (!sessionActive || !currentPhase) return;
    const phaseMs = currentPhase.durationMinutes * 60 * 1000;
    if (sessionPhaseElapsedMs >= phaseMs) {
      advancePhase();
    }
  }, [sessionActive, sessionPhaseElapsedMs, currentPhase, advancePhase]);
}
