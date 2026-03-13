"use client";

import { useEffect, useRef, useState } from "react";
import { getTodayPracticeTime, recordPracticeTime } from "@/lib/persistence";

const SAVE_INTERVAL_MS = 10000; // Save every 10 seconds while playing

interface UsePracticeTrackerOptions {
  isPlaying: boolean;
  progressionName?: string;
  mode?: string;
}

interface UsePracticeTrackerResult {
  todayTimeMs: number;
  sessionTimeMs: number;
}

/**
 * Compute today's total from a stats object without re-reading localStorage.
 */
function todayTotalFromStats(stats: {
  sessions: { date: string; durationMs: number }[];
}): number {
  const today = new Date().toISOString().split("T")[0] ?? "";
  return stats.sessions
    .filter((s) => s.date === today)
    .reduce((total, s) => total + s.durationMs, 0);
}

/**
 * Hook to track practice time while the user is playing.
 * Automatically saves progress to localStorage periodically.
 */
export function usePracticeTracker({
  isPlaying,
  progressionName,
  mode,
}: UsePracticeTrackerOptions): UsePracticeTrackerResult {
  const [todayTimeMs, setTodayTimeMs] = useState(0);
  const [sessionTimeMs, setSessionTimeMs] = useState(0);
  const sessionStartRef = useRef<number | null>(null);
  const lastSaveRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  // Use refs for values that shouldn't restart intervals
  const progressionNameRef = useRef(progressionName);
  const modeRef = useRef(mode);
  useEffect(() => {
    progressionNameRef.current = progressionName;
  }, [progressionName]);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Load initial today time
  useEffect(() => {
    setTodayTimeMs(getTodayPracticeTime());
  }, []);

  // Track playing state
  useEffect(() => {
    if (isPlaying) {
      // Start tracking
      sessionStartRef.current = Date.now();
      lastSaveRef.current = Date.now();
      accumulatedTimeRef.current = 0;
    } else if (sessionStartRef.current !== null) {
      // Stop tracking and save final time
      const elapsed = Date.now() - lastSaveRef.current;
      if (elapsed > 1000) {
        // Only save if more than 1 second
        const stats = recordPracticeTime(
          elapsed,
          progressionNameRef.current,
          modeRef.current,
        );
        setTodayTimeMs(todayTotalFromStats(stats));
      }
      sessionStartRef.current = null;
      setSessionTimeMs(0);
    }
  }, [isPlaying]);

  // Periodically save and update while playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (sessionStartRef.current === null) return;

      const now = Date.now();
      const elapsed = now - lastSaveRef.current;

      // Save progress and use the return value directly
      const stats = recordPracticeTime(
        elapsed,
        progressionNameRef.current,
        modeRef.current,
      );
      lastSaveRef.current = now;
      accumulatedTimeRef.current += elapsed;

      // Update state from return value — no redundant localStorage read
      setTodayTimeMs(todayTotalFromStats(stats));
      setSessionTimeMs(accumulatedTimeRef.current);
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Update session time more frequently for UI
  useEffect(() => {
    if (!isPlaying) return;

    const uiInterval = setInterval(() => {
      if (sessionStartRef.current === null) return;

      const elapsed = Date.now() - sessionStartRef.current;
      setSessionTimeMs(elapsed);
    }, 1000);

    return () => clearInterval(uiInterval);
  }, [isPlaying]);

  return {
    todayTimeMs,
    sessionTimeMs,
  };
}
