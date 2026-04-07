import type { StateCreator } from "zustand";
import { clamp } from "@/lib/clamp";
import type { BackingTrackConfig } from "@/lib/types";
import type { AppState } from "../useAppStore";

export interface BackingTrackSlice {
  backingTrack: BackingTrackConfig;

  setBackingTrackVolume: (
    type: "bass" | "chord" | "drums",
    volume: number,
  ) => void;
  setBackingTrackMuted: (
    type: "bass" | "chord" | "drums",
    muted: boolean,
  ) => void;
  setCompingVariations: (enabled: boolean) => void;
}

const volumeKey = {
  bass: "bassVolume",
  chord: "chordVolume",
  drums: "drumsVolume",
} as const;

const mutedKey = {
  bass: "bassMuted",
  chord: "chordMuted",
  drums: "drumsMuted",
} as const;

export const createBackingTrackSlice: StateCreator<
  AppState,
  [],
  [],
  BackingTrackSlice
> = (set) => ({
  backingTrack: {
    bassVolume: -6,
    chordVolume: -14,
    drumsVolume: -8,
    bassMuted: false,
    chordMuted: false,
    drumsMuted: false,
    compingVariations: false,
  },

  setBackingTrackVolume: (type, volume) => {
    const clampedVolume = clamp(volume, -30, 0);
    set((state) => ({
      backingTrack: {
        ...state.backingTrack,
        [volumeKey[type]]: clampedVolume,
      },
    }));
  },

  setBackingTrackMuted: (type, muted) => {
    set((state) => ({
      backingTrack: {
        ...state.backingTrack,
        [mutedKey[type]]: muted,
      },
    }));
  },

  setCompingVariations: (enabled) => {
    set((state) => ({
      backingTrack: {
        ...state.backingTrack,
        compingVariations: enabled,
      },
    }));
  },
});
