"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import type { Progression } from "@/lib/types";

interface PlaybackPosition {
  /** Current bar index (0-based) */
  barIndex: number;
  /** Current chord index within the bar (0-based) */
  chordIndex: number;
  /** Position within the current bar as a fraction (0-1) */
  barProgress: number;
  /** Whether playback is currently active */
  isActive: boolean;
}

interface UsePlaybackPositionOptions {
  progression: Progression;
  isPlaying: boolean;
}

/**
 * Hook that tracks the current playback position in real-time.
 * Uses requestAnimationFrame to poll Tone.js transport position during playback.
 */
export function usePlaybackPosition({
  progression,
  isPlaying,
}: UsePlaybackPositionOptions): PlaybackPosition {
  const [position, setPosition] = useState<PlaybackPosition>({
    barIndex: 0,
    chordIndex: 0,
    barProgress: 0,
    isActive: false,
  });

  const animationFrameRef = useRef<number | null>(null);
  const beatsPerBar = progression.timeSignature.numerator;

  // Build a lookup table for beat -> bar/chord mapping
  const beatMapRef = useRef<
    Array<{ barIndex: number; chordIndex: number; startBeat: number }>
  >([]);

  // Rebuild beat map when progression changes
  useEffect(() => {
    const map: Array<{
      barIndex: number;
      chordIndex: number;
      startBeat: number;
    }> = [];
    let currentBeat = 0;

    for (let barIndex = 0; barIndex < progression.bars.length; barIndex++) {
      const bar = progression.bars[barIndex];
      for (let chordIndex = 0; chordIndex < bar.chords.length; chordIndex++) {
        map.push({ barIndex, chordIndex, startBeat: currentBeat });
        currentBeat += bar.chords[chordIndex].beats;
      }
    }

    beatMapRef.current = map;
  }, [progression]);

  // Calculate total beats in the progression
  const getTotalBeats = useCallback(() => {
    return progression.bars.reduce((total, bar) => total + bar.totalBeats, 0);
  }, [progression]);

  // Convert transport position string to beat number
  const parsePositionToBeats = useCallback(
    (positionStr: string): number => {
      const parts = positionStr.split(":").map(Number);
      if (parts.length >= 2) {
        const bars = parts[0];
        const beats = parts[1];
        const sixteenths = parts.length > 2 ? parts[2] : 0;
        return bars * beatsPerBar + beats + sixteenths / 4;
      }
      return 0;
    },
    [beatsPerBar],
  );

  // Find the current bar and chord for a given beat position
  const findPositionAtBeat = useCallback(
    (
      beat: number,
    ): { barIndex: number; chordIndex: number; barProgress: number } => {
      const totalBeats = getTotalBeats();
      // Handle looping
      const normalizedBeat = beat % totalBeats;

      const map = beatMapRef.current;
      let currentBarIndex = 0;
      let currentChordIndex = 0;

      // Find which chord we're in
      for (let i = 0; i < map.length; i++) {
        const entry = map[i];
        const nextEntry = map[i + 1];
        const entryEndBeat = nextEntry ? nextEntry.startBeat : totalBeats;

        if (
          normalizedBeat >= entry.startBeat &&
          normalizedBeat < entryEndBeat
        ) {
          currentBarIndex = entry.barIndex;
          currentChordIndex = entry.chordIndex;
          break;
        }
      }

      // Calculate bar progress
      const bar = progression.bars[currentBarIndex];
      const barStartBeat = progression.bars
        .slice(0, currentBarIndex)
        .reduce((sum, b) => sum + b.totalBeats, 0);
      const beatInBar = normalizedBeat - barStartBeat;
      const barProgress = Math.min(1, Math.max(0, beatInBar / bar.totalBeats));

      return {
        barIndex: currentBarIndex,
        chordIndex: currentChordIndex,
        barProgress,
      };
    },
    [progression, getTotalBeats],
  );

  // Animation frame callback for polling position
  const updatePosition = useCallback(() => {
    const transport = Tone.getTransport();

    if (transport.state === "started") {
      const positionStr = transport.position as string;
      const beat = parsePositionToBeats(positionStr);
      const { barIndex, chordIndex, barProgress } = findPositionAtBeat(beat);

      setPosition({
        barIndex,
        chordIndex,
        barProgress,
        isActive: true,
      });

      animationFrameRef.current = requestAnimationFrame(updatePosition);
    } else {
      setPosition((prev) => ({ ...prev, isActive: false }));
    }
  }, [parsePositionToBeats, findPositionAtBeat]);

  // Start/stop polling based on isPlaying
  useEffect(() => {
    if (isPlaying) {
      // Start polling
      animationFrameRef.current = requestAnimationFrame(updatePosition);
    } else {
      // Stop polling and reset
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setPosition({
        barIndex: 0,
        chordIndex: 0,
        barProgress: 0,
        isActive: false,
      });
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, updatePosition]);

  return position;
}
