import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type AudioInputSlice,
  createAudioInputSlice,
} from "./slices/audioInputSlice";
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
  createPracticeModeSlice,
  type PracticeModeSlice,
} from "./slices/practiceModeSlice";
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
  ErrorSlice &
  PracticeModeSlice &
  AudioInputSlice;

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createProgressionSlice(...a),
      ...createPlaybackSlice(...a),
      ...createMetronomeSlice(...a),
      ...createBackingTrackSlice(...a),
      ...createDisplaySlice(...a),
      ...createErrorSlice(...a),
      ...createPracticeModeSlice(...a),
      ...createAudioInputSlice(...a),
    }),
    {
      name: "fretpad-state",
      // micActive and score are intentionally excluded — mic should not auto-activate on reload
      partialize: (state) => ({
        progression: state.progression,
        tempo: state.tempo,
        tempoRamp: state.tempoRamp,
        selectedStyle: state.selectedStyle,
        metronome: state.metronome,
        backingTrack: state.backingTrack,
        showScaleTones: state.showScaleTones,
        noteLabelMode: state.noteLabelMode,
        fretboardOverlay: state.fretboardOverlay,
        // Target Notes settings
        targetNoteMode: state.targetNoteMode,
        showChromaticApproach: state.showChromaticApproach,
        showDiatonicApproach: state.showDiatonicApproach,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const chord = getChordAtPosition(state.progression, 0, 0);
          state.currentChord = chord;
          // Migrate legacy "intervals" label mode to "degrees"
          if ((state.noteLabelMode as string) === "intervals") {
            state.noteLabelMode = "degrees";
          }
          // Migrate legacy target note mode naming
          if ((state.targetNoteMode as string) === "guide-tones-only") {
            state.targetNoteMode = "root-and-guides";
          }
          // Migrate legacy backingTrack state missing drums fields
          if (state.backingTrack.drumsVolume === undefined) {
            state.backingTrack.drumsVolume = -8;
          }
          if (state.backingTrack.drumsMuted === undefined) {
            state.backingTrack.drumsMuted = false;
          }
        }
      },
    },
  ),
);
