import type { StateCreator } from "zustand";
import type {
  FretboardOverlay,
  NoteLabelMode,
  TargetNoteMode,
} from "@/lib/types";
import type { AppState } from "../useAppStore";

export interface DisplaySlice {
  showScaleTones: boolean;
  noteLabelMode: NoteLabelMode;
  previewScale: string | null;
  fretboardOverlay: FretboardOverlay;

  // Target Notes state
  targetNoteMode: TargetNoteMode;
  showChromaticApproach: boolean;
  showDiatonicApproach: boolean;

  setShowScaleTones: (show: boolean) => void;
  setNoteLabelMode: (mode: NoteLabelMode) => void;
  setPreviewScale: (scale: string | null) => void;
  setFretboardOverlay: (overlay: FretboardOverlay) => void;

  // Target Notes actions
  setTargetNoteMode: (mode: TargetNoteMode) => void;
  setShowChromaticApproach: (show: boolean) => void;
  setShowDiatonicApproach: (show: boolean) => void;
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

  // Target Notes defaults
  targetNoteMode: "none",
  showChromaticApproach: false,
  showDiatonicApproach: false,

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
});
