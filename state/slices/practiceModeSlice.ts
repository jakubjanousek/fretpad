import type { StateCreator } from "zustand";
import { PRACTICE_MODES } from "@/lib/modes";
import type { PracticeModeId } from "@/lib/types";
import type { AppState } from "../useAppStore";

export interface PracticeModeSlice {
  activeMode: PracticeModeId | null;
  enterMode: (
    id: PracticeModeId,
    options?: { applyDefaults?: boolean },
  ) => void;
  exitMode: () => void;
}

export const createPracticeModeSlice: StateCreator<
  AppState,
  [],
  [],
  PracticeModeSlice
> = (set, get) => ({
  activeMode: null,

  enterMode: (id: PracticeModeId, options) => {
    const config = PRACTICE_MODES[id];
    const state = get();
    const applyDefaults = options?.applyDefaults ?? true;

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

    // Apply mode defaults unless the caller is restoring a shared URL state.
    if (applyDefaults) {
      state.loadPreset(config.defaultPreset);
      state.setTempo(config.defaultTempo);
      state.setSelectedStyle(config.defaultStyle);
    }

    // Deactivate mic when switching to a mode without mic support
    if (!config.showMicToggle && state.micActive) {
      state.setMicActive(false);
    }

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
