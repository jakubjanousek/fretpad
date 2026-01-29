import type { StateCreator } from "zustand";
import type {
  CAGEDPosition,
  FretboardOverlay,
  NoteLabelMode,
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

  setShowScaleTones: (show: boolean) => void;
  setShowVoiceLeading: (show: boolean) => void;
  setNoteLabelMode: (mode: NoteLabelMode) => void;
  setPreviewScale: (scale: string | null) => void;
  setFretboardOverlay: (overlay: FretboardOverlay) => void;
  setShowCAGEDPositions: (show: boolean) => void;
  setFocusedPosition: (pos: CAGEDPosition | null) => void;
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
});
