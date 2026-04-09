import type { StateCreator } from "zustand";
import type {
  FretboardOverlay,
  MaxFrets,
  NoteLabelMode,
  TargetNoteMode,
} from "@/lib/types";
import type { AppState } from "../useAppStore";

export interface DisplaySlice {
  showScaleTones: boolean;
  noteLabelMode: NoteLabelMode;
  previewScale: string | null;
  fretboardOverlay: FretboardOverlay;
  maxFrets: MaxFrets;

  // Target Notes state
  targetNoteMode: TargetNoteMode;
  showChromaticApproach: boolean;
  showDiatonicApproach: boolean;
  showGhostNotes: boolean;

  setShowScaleTones: (show: boolean) => void;
  setNoteLabelMode: (mode: NoteLabelMode) => void;
  setPreviewScale: (scale: string | null) => void;
  setFretboardOverlay: (overlay: FretboardOverlay) => void;
  setMaxFrets: (frets: MaxFrets) => void;

  // Target Notes actions
  setTargetNoteMode: (mode: TargetNoteMode) => void;
  setShowChromaticApproach: (show: boolean) => void;
  setShowDiatonicApproach: (show: boolean) => void;
  setShowGhostNotes: (show: boolean) => void;
}

export const createDisplaySlice: StateCreator<
  AppState,
  [],
  [],
  DisplaySlice
> = (set) => ({
  showScaleTones: false,
  noteLabelMode: "notes",
  previewScale: null,
  fretboardOverlay: "none",
  maxFrets: 12,

  // Target Notes defaults
  targetNoteMode: "none",
  showChromaticApproach: false,
  showDiatonicApproach: false,
  showGhostNotes: false,

  setShowScaleTones: (show) => {
    set({ showScaleTones: show });
  },

  setNoteLabelMode: (mode) => {
    set({ noteLabelMode: mode });
  },

  setPreviewScale: (scale) => {
    set({ previewScale: scale });
  },

  setFretboardOverlay: (overlay) => {
    set({ fretboardOverlay: overlay });
  },

  setMaxFrets: (frets) => {
    set({ maxFrets: frets });
  },

  // Target Notes actions
  setTargetNoteMode: (mode) => {
    set((state) => ({
      targetNoteMode: mode,
      // Reset approach toggles when mode changes to "none"
      showChromaticApproach:
        mode === "none" ? false : state.showChromaticApproach,
      showDiatonicApproach:
        mode === "none" ? false : state.showDiatonicApproach,
    }));
  },

  setShowChromaticApproach: (show) => {
    set({ showChromaticApproach: show });
  },

  setShowDiatonicApproach: (show) => {
    set({ showDiatonicApproach: show });
  },

  setShowGhostNotes: (show) => {
    set({ showGhostNotes: show });
  },
});
