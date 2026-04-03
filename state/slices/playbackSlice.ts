import type { StateCreator } from "zustand";
import { DEFAULT_STYLE_ID } from "@/lib/audio";
import type { StyleId, TempoRampConfig } from "@/lib/types";
import type { AppState } from "../useAppStore";

const DEFAULT_TEMPO_RAMP: TempoRampConfig = {
  enabled: false,
  increment: 5,
  everyNLoops: 2,
  maxTempo: 200,
};

export interface PlaybackSlice {
  tempo: number;
  isPlaying: boolean;
  isInterrupted: boolean;
  selectedStyle: StyleId;
  tempoRamp: TempoRampConfig;
  loopCount: number;

  setTempo: (tempo: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsInterrupted: (isInterrupted: boolean) => void;
  setSelectedStyle: (style: StyleId) => void;
  setTempoRampEnabled: (enabled: boolean) => void;
  setTempoRampIncrement: (increment: number) => void;
  setTempoRampEveryNLoops: (everyNLoops: number) => void;
  setTempoRampMaxTempo: (maxTempo: number) => void;
  incrementLoopCount: () => void;
  resetLoopCount: () => void;
}

export const createPlaybackSlice: StateCreator<
  AppState,
  [],
  [],
  PlaybackSlice
> = (set, get) => ({
  tempo: 120,
  isPlaying: false,
  isInterrupted: false,
  selectedStyle: DEFAULT_STYLE_ID,
  tempoRamp: DEFAULT_TEMPO_RAMP,
  loopCount: 0,

  setTempo: (tempo) => {
    const clampedTempo = Math.max(40, Math.min(200, tempo));
    set({ tempo: clampedTempo });
  },

  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
  },

  setIsInterrupted: (isInterrupted) => {
    set({ isInterrupted });
  },

  setSelectedStyle: (style) => {
    set({ selectedStyle: style });
  },

  setTempoRampEnabled: (enabled) => {
    set((state) => ({ tempoRamp: { ...state.tempoRamp, enabled } }));
  },

  setTempoRampIncrement: (increment) => {
    const clamped = Math.max(1, Math.min(20, increment));
    set((state) => ({
      tempoRamp: { ...state.tempoRamp, increment: clamped },
    }));
  },

  setTempoRampEveryNLoops: (everyNLoops) => {
    set((state) => ({ tempoRamp: { ...state.tempoRamp, everyNLoops } }));
  },

  setTempoRampMaxTempo: (maxTempo) => {
    const clamped = Math.max(40, Math.min(300, maxTempo));
    set((state) => ({
      tempoRamp: { ...state.tempoRamp, maxTempo: clamped },
    }));
  },

  incrementLoopCount: () => {
    const state = get();
    const newLoopCount = state.loopCount + 1;
    const updates: Partial<AppState> = { loopCount: newLoopCount };

    if (
      state.tempoRamp.enabled &&
      newLoopCount % state.tempoRamp.everyNLoops === 0
    ) {
      const newTempo = Math.min(
        state.tempoRamp.maxTempo,
        state.tempo + state.tempoRamp.increment,
      );
      updates.tempo = newTempo;
    }

    set(updates);
  },

  resetLoopCount: () => {
    set({ loopCount: 0 });
  },
});
