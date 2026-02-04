import type { StateCreator } from "zustand";
import type {
  CAGEDPosition,
  FretboardOverlay,
  FretPosition,
  ModeComparisonFretboardView,
  ModeComparisonState,
  NoteLabelMode,
  TargetNoteMode,
} from "@/lib/types";
import type { AppState } from "../useAppStore";

export interface DisplaySlice {
  showScaleTones: boolean;
  showVoiceLeading: boolean;
  noteLabelMode: NoteLabelMode;
  previewScale: string | null;
  fretboardOverlay: FretboardOverlay;
  showCAGEDPositions: boolean;
  focusedPosition: CAGEDPosition | null;

  // Target Notes state
  targetNoteMode: TargetNoteMode;
  showChromaticApproach: boolean;
  showDiatonicApproach: boolean;
  showEnclosures: boolean;
  focusedEnclosureTarget: FretPosition | null;

  // Voicing display state
  showVoicingFingers: boolean;

  // Mode Comparison state
  modeComparison: ModeComparisonState;
  modeComparisonView: ModeComparisonFretboardView;

  setShowScaleTones: (show: boolean) => void;
  setShowVoiceLeading: (show: boolean) => void;
  setNoteLabelMode: (mode: NoteLabelMode) => void;
  setPreviewScale: (scale: string | null) => void;
  setFretboardOverlay: (overlay: FretboardOverlay) => void;
  setShowCAGEDPositions: (show: boolean) => void;
  setFocusedPosition: (pos: CAGEDPosition | null) => void;

  // Target Notes actions
  setTargetNoteMode: (mode: TargetNoteMode) => void;
  setShowChromaticApproach: (show: boolean) => void;
  setShowDiatonicApproach: (show: boolean) => void;
  setShowEnclosures: (show: boolean) => void;
  setFocusedEnclosureTarget: (target: FretPosition | null) => void;

  // Voicing display action
  setShowVoicingFingers: (show: boolean) => void;

  // Mode Comparison actions
  setModeComparison: (comparison: ModeComparisonState) => void;
  setModeComparisonView: (view: ModeComparisonFretboardView) => void;
  clearModeComparison: () => void;
}

export const createDisplaySlice: StateCreator<
  AppState,
  [],
  [],
  DisplaySlice
> = (set) => ({
  showScaleTones: false,
  showVoiceLeading: false,
  noteLabelMode: "notes",
  previewScale: null,
  fretboardOverlay: "none",
  showCAGEDPositions: false,
  focusedPosition: null,

  // Target Notes defaults
  targetNoteMode: "none",
  showChromaticApproach: false,
  showDiatonicApproach: false,
  showEnclosures: false,
  focusedEnclosureTarget: null,

  // Voicing display defaults
  showVoicingFingers: true,

  // Mode Comparison defaults
  modeComparison: { mode1: null, mode2: null },
  modeComparisonView: "both",

  setShowScaleTones: (show) => {
    set({ showScaleTones: show });
  },

  setShowVoiceLeading: (show) => {
    set({ showVoiceLeading: show });
  },

  setNoteLabelMode: (mode) => {
    set({ noteLabelMode: mode });
  },

  setPreviewScale: (scale) => {
    set({ previewScale: scale });
  },

  setFretboardOverlay: (overlay) => {
    set({ fretboardOverlay: overlay, focusedPosition: null });
  },

  setShowCAGEDPositions: (show) => {
    set({ showCAGEDPositions: show, focusedPosition: show ? null : null });
  },

  setFocusedPosition: (pos) => {
    set({ focusedPosition: pos });
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
      showEnclosures: mode === "none" ? false : state.showEnclosures,
      focusedEnclosureTarget:
        mode === "none" ? null : state.focusedEnclosureTarget,
    }));
  },

  setShowChromaticApproach: (show) => {
    set({ showChromaticApproach: show });
  },

  setShowDiatonicApproach: (show) => {
    set({ showDiatonicApproach: show });
  },

  setShowEnclosures: (show) => {
    set({ showEnclosures: show, focusedEnclosureTarget: show ? null : null });
  },

  setFocusedEnclosureTarget: (target) => {
    set({ focusedEnclosureTarget: target });
  },

  // Voicing display action
  setShowVoicingFingers: (show) => {
    set({ showVoicingFingers: show });
  },

  // Mode Comparison actions
  setModeComparison: (comparison) => {
    set({ modeComparison: comparison });
  },

  setModeComparisonView: (view) => {
    set({ modeComparisonView: view });
  },

  clearModeComparison: () => {
    set({
      modeComparison: { mode1: null, mode2: null },
      modeComparisonView: "both",
    });
  },
});
