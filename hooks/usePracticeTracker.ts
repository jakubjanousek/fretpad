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
 * Hook to track practice time while the user is playing.
 * Automatically saves progress to localStorage periodically.
 */
export function usePracticeTracker({
  isPlaying,
  progressionName,
}: UsePracticeTrackerOptions): UsePracticeTrackerResult {
  const [todayTimeMs, setTodayTimeMs] = useState(0);
  const [sessionTimeMs, setSessionTimeMs] = useState(0);
  const sessionStartRef = useRef<number | null>(null);
  const lastSaveRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

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
        recordPracticeTime(elapsed, progressionName);
        setTodayTimeMs(getTodayPracticeTime());
      }
      sessionStartRef.current = null;
      setSessionTimeMs(0);
    }
  }, [isPlaying, progressionName]);

  // Periodically save and update while playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (sessionStartRef.current === null) return;

      const now = Date.now();
      const elapsed = now - lastSaveRef.current;

      // Save progress
      recordPracticeTime(elapsed, progressionName);
      lastSaveRef.current = now;
      accumulatedTimeRef.current += elapsed;

      // Update state
      setTodayTimeMs(getTodayPracticeTime());
      setSessionTimeMs(accumulatedTimeRef.current);
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isPlaying, progressionName]);

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
