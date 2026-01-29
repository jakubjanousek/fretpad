import type { StateCreator } from "zustand";
import type { MetronomeConfig } from "@/lib/types";
import type { AppState } from "../useAppStore";

export interface MetronomeSlice {
  metronome: MetronomeConfig;

  setMetronomeEnabled: (enabled: boolean) => void;
  setMetronomeVolume: (volume: number) => void;
  setMetronomeCountIn: (countIn: 0 | 1 | 2) => void;
}

export const createMetronomeSlice: StateCreator<
  AppState,
  [],
  [],
  MetronomeSlice
> = (set) => ({
  metronome: {
    enabled: false,
    volume: -6,
    accentDownbeat: true,
    countIn: 0,
  },

  setMetronomeEnabled: (enabled) => {
    set((state) => ({
      metronome: { ...state.metronome, enabled },
    }));
  },

  setMetronomeVolume: (volume) => {
    const clampedVolume = Math.max(-20, Math.min(0, volume));
    set((state) => ({
      metronome: { ...state.metronome, volume: clampedVolume },
    }));
  },

  setMetronomeCountIn: (countIn) => {
    set((state) => ({
      metronome: { ...state.metronome, countIn },
    }));
  },
});
