import type { StateCreator } from "zustand";
import type { NoteLabelMode } from "@/lib/types";
import type { AppState } from "../useAppStore";

export interface DisplaySlice {
  showScaleTones: boolean;
  showVoiceLeading: boolean;
  noteLabelMode: NoteLabelMode;
  previewScale: string | null;

  setShowScaleTones: (show: boolean) => void;
  setShowVoiceLeading: (show: boolean) => void;
  setNoteLabelMode: (mode: NoteLabelMode) => void;
  setPreviewScale: (scale: string | null) => void;
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
});
