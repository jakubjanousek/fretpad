import type { StateCreator } from "zustand";
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
  },

  setBackingTrackVolume: (type, volume) => {
    const clampedVolume = Math.max(-30, Math.min(0, volume));
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
});
