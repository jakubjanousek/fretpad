import type { StateCreator } from "zustand";
import { DEFAULT_STYLE_ID } from "@/lib/audio/styles";
import type { StyleId } from "@/lib/types";
import type { AppState } from "../useAppStore";

export interface PlaybackSlice {
  tempo: number;
  isPlaying: boolean;
  selectedStyle: StyleId;

  setTempo: (tempo: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setSelectedStyle: (style: StyleId) => void;
}

export const createPlaybackSlice: StateCreator<
  AppState,
  [],
  [],
  PlaybackSlice
> = (set) => ({
  tempo: 120,
  isPlaying: false,
  selectedStyle: DEFAULT_STYLE_ID,

  setTempo: (tempo) => {
    const clampedTempo = Math.max(40, Math.min(200, tempo));
    set({ tempo: clampedTempo });
  },

  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
  },

  setSelectedStyle: (style) => {
    set({ selectedStyle: style });
  },
});
