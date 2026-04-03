import type { StateCreator } from "zustand";
import type { AppState } from "../useAppStore";

export interface AudioInputScore {
  hits: number;
  total: number;
}

export interface AudioInputSlice {
  micActive: boolean;
  score: AudioInputScore;
  setMicActive: (active: boolean) => void;
  updateScore: (hit: boolean) => void;
  resetScore: () => void;
}

export const createAudioInputSlice: StateCreator<
  AppState,
  [],
  [],
  AudioInputSlice
> = (set) => ({
  micActive: false,
  score: { hits: 0, total: 0 },

  setMicActive: (active) => {
    set({ micActive: active });
  },

  updateScore: (hit) => {
    set((state) => ({
      score: {
        hits: state.score.hits + (hit ? 1 : 0),
        total: state.score.total + 1,
      },
    }));
  },

  resetScore: () => {
    set({ score: { hits: 0, total: 0 } });
  },
});
