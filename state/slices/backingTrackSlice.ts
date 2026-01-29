import type { StateCreator } from "zustand";
import type { BackingTrackConfig } from "@/lib/types";
import type { AppState } from "../useAppStore";

export interface BackingTrackSlice {
  backingTrack: BackingTrackConfig;

  setBackingTrackVolume: (type: "bass" | "chord", volume: number) => void;
  setBackingTrackMuted: (type: "bass" | "chord", muted: boolean) => void;
}

export const createBackingTrackSlice: StateCreator<
  AppState,
  [],
  [],
  BackingTrackSlice
> = (set) => ({
  backingTrack: {
    bassVolume: -6,
    chordVolume: -14,
    bassMuted: false,
    chordMuted: false,
  },

  setBackingTrackVolume: (type, volume) => {
    const clampedVolume = Math.max(-30, Math.min(0, volume));
    set((state) => ({
      backingTrack: {
        ...state.backingTrack,
        [type === "bass" ? "bassVolume" : "chordVolume"]: clampedVolume,
      },
    }));
  },

  setBackingTrackMuted: (type, muted) => {
    set((state) => ({
      backingTrack: {
        ...state.backingTrack,
        [type === "bass" ? "bassMuted" : "chordMuted"]: muted,
      },
    }));
  },
});
