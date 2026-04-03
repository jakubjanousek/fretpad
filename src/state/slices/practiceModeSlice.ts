import * as Tone from "tone";
import type { StateCreator } from "zustand";
import { PRACTICE_MODES } from "@/lib/modes";
import { PRESET_PROGRESSIONS } from "@/lib/theory";
import type { PracticeModeId } from "@/lib/types";
import type { AppState } from "../useAppStore";
import { getChordAtPosition } from "./progressionSlice";

const MAX_MODE_SWITCH_HISTORY = 10;

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
    const delta: Partial<AppState> = { activeMode: id };

    if (state.isPlaying) {
      const transport = Tone.getTransport();
      transport.stop();
      transport.cancel();
      delta.isPlaying = false;
    }

    if (state.micActive) {
      delta.micActive = false;
    }

    if (applyDefaults) {
      const progression = PRESET_PROGRESSIONS[config.defaultPreset];
      delta.progression = progression;
      delta.currentBarIndex = 0;
      delta.currentChordIndex = 0;
      delta.currentChord = getChordAtPosition(progression, 0, 0);
      delta.tempo = Math.max(40, Math.min(200, config.defaultTempo));
      delta.selectedStyle = config.defaultStyle;
      delta.progressionHistory = [
        ...state.progressionHistory,
        state.progression,
      ].slice(-MAX_MODE_SWITCH_HISTORY);
      delta.progressionFuture = [];
    }

    if (!config.showTargetsDropdown && state.targetNoteMode !== "none") {
      Object.assign(delta, {
        targetNoteMode: "none",
        showChromaticApproach: false,
        showDiatonicApproach: false,
      });
    }
    if (!config.showOverlayDropdown && state.fretboardOverlay !== "none") {
      delta.fretboardOverlay = "none";
    }

    try {
      localStorage.setItem("fretpad-last-mode", id);
    } catch {
      // Ignore localStorage errors
    }

    set(delta);
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
