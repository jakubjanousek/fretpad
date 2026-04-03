"use client";

import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import type { Progression } from "@/lib/types";

export interface PlaybackPosition {
  /** Current bar index (0-based) */
  barIndex: number;
  /** Current chord index within the bar (0-based) */
  chordIndex: number;
  /** Position within the current bar as a fraction (0-1) */
  barProgress: number;
  /** Whether playback is currently active */
  isActive: boolean;
  /** Whether currently in count-in phase */
  isCountingIn: boolean;
  /** Progress through count-in (0-1), only valid when isCountingIn is true */
  countInProgress: number;
}

interface UsePlaybackPositionOptions {
  progression: Progression;
  isPlaying: boolean;
  /** Number of count-in bars (0, 1, or 2) */
  countInBars?: number;
}

interface UsePlaybackPositionObserverOptions
  extends UsePlaybackPositionOptions {
  onPositionChange: (position: PlaybackPosition) => void;
}

interface BeatMapEntry {
  barIndex: number;
  chordIndex: number;
  startBeat: number;
}

interface PlaybackTimeline {
  beatMap: BeatMapEntry[];
  barStartBeats: number[];
  totalBeats: number;
}

const RESET_PLAYBACK_POSITION: PlaybackPosition = {
  barIndex: 0,
  chordIndex: 0,
  barProgress: 0,
  isActive: false,
  isCountingIn: false,
  countInProgress: 0,
};

function buildPlaybackTimeline(progression: Progression): PlaybackTimeline {
  const beatMap: BeatMapEntry[] = [];
  const barStartBeats: number[] = [];
  let currentBeat = 0;

  for (let barIndex = 0; barIndex < progression.bars.length; barIndex++) {
    const bar = progression.bars[barIndex];
    if (!bar) continue;

    barStartBeats[barIndex] = currentBeat;

    for (let chordIndex = 0; chordIndex < bar.chords.length; chordIndex++) {
      const chord = bar.chords[chordIndex];
      if (!chord) continue;
      beatMap.push({ barIndex, chordIndex, startBeat: currentBeat });
      currentBeat += chord.beats;
    }
  }

  return {
    beatMap,
    barStartBeats,
    totalBeats: currentBeat,
  };
}

function parsePositionToBeats(
  positionStr: string,
  beatsPerBar: number,
): number {
  const parts = positionStr.split(":").map(Number);
  if (parts.length >= 2) {
    const bars = parts[0] ?? 0;
    const beats = parts[1] ?? 0;
    const sixteenths = parts[2] ?? 0;
    return bars * beatsPerBar + beats + sixteenths / 4;
  }
  return 0;
}

function findPositionAtBeat(
  beat: number,
  progression: Progression,
  timeline: PlaybackTimeline,
  beatsPerBar: number,
): Pick<PlaybackPosition, "barIndex" | "chordIndex" | "barProgress"> {
  const { beatMap, barStartBeats, totalBeats } = timeline;

  if (totalBeats <= 0) {
    return {
      barIndex: 0,
      chordIndex: 0,
      barProgress: 0,
    };
  }

  const normalizedBeat = beat % totalBeats;
  let currentBarIndex = 0;
  let currentChordIndex = 0;

  for (let i = 0; i < beatMap.length; i++) {
    const entry = beatMap[i];
    if (!entry) continue;

    const nextEntry = beatMap[i + 1];
    const entryEndBeat = nextEntry ? nextEntry.startBeat : totalBeats;

    if (normalizedBeat >= entry.startBeat && normalizedBeat < entryEndBeat) {
      currentBarIndex = entry.barIndex;
      currentChordIndex = entry.chordIndex;
      break;
    }
  }

  const bar = progression.bars[currentBarIndex];
  const barTotalBeats = bar?.totalBeats ?? beatsPerBar;
  const barStartBeat = barStartBeats[currentBarIndex] ?? 0;
  const beatInBar = normalizedBeat - barStartBeat;

  return {
    barIndex: currentBarIndex,
    chordIndex: currentChordIndex,
    barProgress: Math.min(1, Math.max(0, beatInBar / barTotalBeats)),
  };
}

function getPlaybackPositionSnapshot(
  transportPosition: string,
  progression: Progression,
  timeline: PlaybackTimeline,
  beatsPerBar: number,
  countInBars: number,
): PlaybackPosition {
  const beat = parsePositionToBeats(transportPosition, beatsPerBar);
  const countInBeats = countInBars * beatsPerBar;

  if (countInBeats > 0 && beat < countInBeats) {
    return {
      ...RESET_PLAYBACK_POSITION,
      isActive: true,
      isCountingIn: true,
      countInProgress: beat / countInBeats,
    };
  }

  const progressionBeat = beat - countInBeats;
  const { barIndex, chordIndex, barProgress } = findPositionAtBeat(
    progressionBeat,
    progression,
    timeline,
    beatsPerBar,
  );

  return {
    barIndex,
    chordIndex,
    barProgress,
    isActive: true,
    isCountingIn: false,
    countInProgress: 0,
  };
}

function observePlaybackPosition(
  options: UsePlaybackPositionObserverOptions,
): () => void {
  const { progression, isPlaying, countInBars = 0, onPositionChange } = options;

  if (!isPlaying) {
    onPositionChange(RESET_PLAYBACK_POSITION);
    return () => {};
  }

  const beatsPerBar = progression.timeSignature.numerator;
  const timeline = buildPlaybackTimeline(progression);
  let animationFrameId: number | null = null;

  const updatePosition = () => {
    const transport = Tone.getTransport();

    if (transport.state !== "started") {
      onPositionChange(RESET_PLAYBACK_POSITION);
      return;
    }

    const nextPosition = getPlaybackPositionSnapshot(
      transport.position as string,
      progression,
      timeline,
      beatsPerBar,
      countInBars,
    );

    onPositionChange(nextPosition);
    animationFrameId = requestAnimationFrame(updatePosition);
  };

  animationFrameId = requestAnimationFrame(updatePosition);

  return () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}

/**
 * Hook that tracks the current playback position in real-time.
 * Uses requestAnimationFrame to poll Tone.js transport position during playback.
 */
export function usePlaybackPosition({
  progression,
  isPlaying,
  countInBars = 0,
}: UsePlaybackPositionOptions): PlaybackPosition {
  const [position, setPosition] = useState<PlaybackPosition>(
    RESET_PLAYBACK_POSITION,
  );

  useEffect(() => {
    return observePlaybackPosition({
      progression,
      isPlaying,
      countInBars,
      onPositionChange: setPosition,
    });
  }, [progression, isPlaying, countInBars]);

  return position;
}

export function usePlaybackPositionObserver(
  options: UsePlaybackPositionObserverOptions,
): void {
  const callbackRef = useRef(options.onPositionChange);
  const { progression, isPlaying, countInBars } = options;

  callbackRef.current = options.onPositionChange;

  useEffect(() => {
    return observePlaybackPosition({
      progression,
      isPlaying,
      countInBars,
      onPositionChange: (position) => callbackRef.current(position),
    });
  }, [progression, isPlaying, countInBars]);
}
