import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type BackingTrackSlice,
  createBackingTrackSlice,
} from "./slices/backingTrackSlice";
import { createDisplaySlice, type DisplaySlice } from "./slices/displaySlice";
import { createErrorSlice, type ErrorSlice } from "./slices/errorSlice";
import {
  createMetronomeSlice,
  type MetronomeSlice,
} from "./slices/metronomeSlice";
import {
  createPlaybackSlice,
  type PlaybackSlice,
} from "./slices/playbackSlice";
import {
  createProgressionSlice,
  getChordAtPosition,
  type ProgressionSlice,
} from "./slices/progressionSlice";

export type AppState = ProgressionSlice &
  PlaybackSlice &
  MetronomeSlice &
  BackingTrackSlice &
  DisplaySlice &
  ErrorSlice;

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createProgressionSlice(...a),
      ...createPlaybackSlice(...a),
      ...createMetronomeSlice(...a),
      ...createBackingTrackSlice(...a),
      ...createDisplaySlice(...a),
      ...createErrorSlice(...a),
    }),
    {
      name: "fretflow-state",
      partialize: (state) => ({
        progression: state.progression,
        tempo: state.tempo,
        tempoRamp: state.tempoRamp,
        selectedStyle: state.selectedStyle,
        metronome: state.metronome,
        backingTrack: state.backingTrack,
        showScaleTones: state.showScaleTones,
        showVoiceLeading: state.showVoiceLeading,
        noteLabelMode: state.noteLabelMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const chord = getChordAtPosition(state.progression, 0, 0);
          state.currentChord = chord;
          // Migrate legacy "intervals" label mode to "degrees"
          if ((state.noteLabelMode as string) === "intervals") {
            state.noteLabelMode = "degrees";
          }
        }
      },
    },
  ),
);
