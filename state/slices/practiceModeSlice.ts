import type { StateCreator } from "zustand";
import { PRACTICE_MODES } from "@/lib/modes";
import type { PRESET_PROGRESSIONS } from "@/lib/theory/presets";
import type { PracticeModeId } from "@/lib/types";
import type { AppState } from "../useAppStore";

export interface PracticeModeSlice {
  activeMode: PracticeModeId | null;
  enterMode: (id: PracticeModeId) => void;
  exitMode: () => void;
}

export const createPracticeModeSlice: StateCreator<
  AppState,
  [],
  [],
  PracticeModeSlice
> = (set, get) => ({
  activeMode: null,

  enterMode: (id: PracticeModeId) => {
    const config = PRACTICE_MODES[id];
    const state = get();

    // Stop playback if playing
    if (state.isPlaying) {
      state.setIsPlaying(false);
    }

    // End quiz if active
    if (state.quizActive) {
      state.endQuiz();
    }

    // End session planner if active
    if (state.sessionActive) {
      state.endSession();
    }

    // Apply mode defaults
    state.loadPreset(config.defaultPreset as keyof typeof PRESET_PROGRESSIONS);
    state.setTempo(config.defaultTempo);
    state.setSelectedStyle(config.defaultStyle);

    // Apply display constraints based on mode
    if (!config.showVoicingsButton && state.showVoicings) {
      state.setShowVoicings(false);
    }
    if (!config.showTargetsDropdown && state.targetNoteMode !== "none") {
      state.setTargetNoteMode("none");
    }
    if (!config.showOverlayDropdown && state.fretboardOverlay !== "none") {
      state.setFretboardOverlay("none");
    }
    if (!config.showCAGED && state.showCAGEDPositions) {
      state.setShowCAGEDPositions(false);
    }

    // Persist last mode for auto-resume
    try {
      localStorage.setItem("fretpad-last-mode", id);
    } catch {
      // Ignore localStorage errors
    }

    set({ activeMode: id });
  },

  exitMode: () => {
    try {
      localStorage.removeItem("fretpad-last-mode");
    } catch {
      // Ignore localStorage errors
    }
    set({ activeMode: null });
  },
});
