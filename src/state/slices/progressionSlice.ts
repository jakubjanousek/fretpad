import type { StateCreator } from "zustand";
import { generateId } from "@/lib/id";
import {
  PRESET_PROGRESSIONS,
  parseBar,
  parseChordSymbol,
  transposeProgression as transposeProgressionUtil,
} from "@/lib/theory";
import type { Chord, Progression, ProgressionBar } from "@/lib/types";
import type { AppState } from "../useAppStore";

const MAX_HISTORY = 50;

export interface ProgressionSlice {
  progression: Progression;
  currentBarIndex: number;
  currentChordIndex: number;
  currentChord: Chord | null;

  /** Undo/redo history stacks */
  progressionHistory: Progression[];
  progressionFuture: Progression[];

  setProgression: (progression: Progression) => void;
  loadPreset: (presetName: keyof typeof PRESET_PROGRESSIONS) => void;
  setCurrentPosition: (barIndex: number, chordIndex: number) => void;
  updateBar: (barIndex: number, barString: string) => boolean;
  addBar: () => void;
  removeBar: (barIndex: number) => void;
  advanceToNextChord: () => void;
  setProgressionName: (name: string) => void;
  transposeProgression: (semitones: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

/**
 * Gets the chord at a specific position in the progression
 */
export function getChordAtPosition(
  progression: Progression,
  barIndex: number,
  chordIndex: number,
): Chord | null {
  const bar = progression.bars[barIndex];
  if (!bar) return null;

  const barChord = bar.chords[chordIndex];
  if (!barChord) return null;

  return parseChordSymbol(barChord.chord);
}

// Default progression: ii-V-I in C
export const defaultProgression = PRESET_PROGRESSIONS["ii-V-I in C"];
export const defaultChord = getChordAtPosition(defaultProgression, 0, 0);

/**
 * Push current progression onto the history stack before a mutation.
 * Clears the future stack (redo is invalidated on new edits).
 */
function pushHistory(
  get: () => AppState,
  set: (state: Partial<AppState>) => void,
) {
  const { progression, progressionHistory } = get();
  const newHistory = [...progressionHistory, progression];
  if (newHistory.length > MAX_HISTORY) {
    newHistory.shift();
  }
  set({ progressionHistory: newHistory, progressionFuture: [] });
}

export const createProgressionSlice: StateCreator<
  AppState,
  [],
  [],
  ProgressionSlice
> = (set, get) => ({
  progression: defaultProgression,
  currentBarIndex: 0,
  currentChordIndex: 0,
  currentChord: defaultChord,
  progressionHistory: [],
  progressionFuture: [],

  setProgression: (progression) => {
    pushHistory(get, set);
    const chord = getChordAtPosition(progression, 0, 0);
    set({
      progression,
      currentBarIndex: 0,
      currentChordIndex: 0,
      currentChord: chord,
    });
  },

  loadPreset: (presetName) => {
    pushHistory(get, set);
    const progression = PRESET_PROGRESSIONS[presetName];
    const chord = getChordAtPosition(progression, 0, 0);
    set({
      progression,
      currentBarIndex: 0,
      currentChordIndex: 0,
      currentChord: chord,
    });
  },

  setCurrentPosition: (barIndex, chordIndex) => {
    const { progression } = get();
    const chord = getChordAtPosition(progression, barIndex, chordIndex);
    set({
      currentBarIndex: barIndex,
      currentChordIndex: chordIndex,
      currentChord: chord,
    });
  },

  updateBar: (barIndex, barString) => {
    const { progression } = get();
    const newBar = parseBar(barString, progression.timeSignature.numerator);

    if (!newBar) {
      return false;
    }

    pushHistory(get, set);

    const existingBar = progression.bars[barIndex];
    if (existingBar) {
      newBar.id = existingBar.id;
    }

    const newBars = [...progression.bars];
    newBars[barIndex] = newBar;

    const newProgression: Progression = {
      ...progression,
      bars: newBars,
    };

    const { currentBarIndex, currentChordIndex } = get();
    let newCurrentChord = get().currentChord;
    let newChordIndex = currentChordIndex;

    if (barIndex === currentBarIndex) {
      if (currentChordIndex >= newBar.chords.length) {
        newChordIndex = newBar.chords.length - 1;
      }
      newCurrentChord = getChordAtPosition(
        newProgression,
        barIndex,
        newChordIndex,
      );
    }

    set({
      progression: newProgression,
      currentChordIndex: newChordIndex,
      currentChord: newCurrentChord,
    });

    return true;
  },

  addBar: () => {
    pushHistory(get, set);
    const { progression } = get();

    const newBar: ProgressionBar = {
      id: generateId(),
      totalBeats: progression.timeSignature.numerator,
      chords: [{ chord: "C", beats: progression.timeSignature.numerator }],
    };

    const newProgression: Progression = {
      ...progression,
      bars: [...progression.bars, newBar],
    };

    set({ progression: newProgression });
  },

  removeBar: (barIndex) => {
    const { progression, currentBarIndex, currentChordIndex } = get();

    if (progression.bars.length <= 1) return;

    pushHistory(get, set);

    const newBars = progression.bars.filter((_, idx) => idx !== barIndex);
    const newProgression: Progression = {
      ...progression,
      bars: newBars,
    };

    let newBarIndex = currentBarIndex;
    let newChordIndex = currentChordIndex;

    if (barIndex < currentBarIndex) {
      newBarIndex = currentBarIndex - 1;
    } else if (barIndex === currentBarIndex) {
      newBarIndex = Math.max(0, currentBarIndex - 1);
      newChordIndex = 0;
    }

    newBarIndex = Math.min(newBarIndex, newBars.length - 1);

    const newCurrentChord = getChordAtPosition(
      newProgression,
      newBarIndex,
      newChordIndex,
    );

    set({
      progression: newProgression,
      currentBarIndex: newBarIndex,
      currentChordIndex: newChordIndex,
      currentChord: newCurrentChord,
    });
  },

  advanceToNextChord: () => {
    const { progression, currentBarIndex, currentChordIndex } = get();
    const currentBar = progression.bars[currentBarIndex];

    if (!currentBar) return;

    if (currentChordIndex < currentBar.chords.length - 1) {
      const newChordIndex = currentChordIndex + 1;
      const chord = getChordAtPosition(
        progression,
        currentBarIndex,
        newChordIndex,
      );
      set({
        currentChordIndex: newChordIndex,
        currentChord: chord,
      });
      return;
    }

    if (currentBarIndex < progression.bars.length - 1) {
      const newBarIndex = currentBarIndex + 1;
      const chord = getChordAtPosition(progression, newBarIndex, 0);
      set({
        currentBarIndex: newBarIndex,
        currentChordIndex: 0,
        currentChord: chord,
      });
      return;
    }

    const chord = getChordAtPosition(progression, 0, 0);
    set({
      currentBarIndex: 0,
      currentChordIndex: 0,
      currentChord: chord,
    });
  },

  setProgressionName: (name) => {
    pushHistory(get, set);
    const { progression } = get();
    set({ progression: { ...progression, name } });
  },

  transposeProgression: (semitones) => {
    pushHistory(get, set);
    const { progression, currentBarIndex, currentChordIndex } = get();
    const newProgression = transposeProgressionUtil(progression, semitones);
    const chord = getChordAtPosition(
      newProgression,
      currentBarIndex,
      currentChordIndex,
    );
    set({
      progression: newProgression,
      currentChord: chord,
    });
  },

  undo: () => {
    const { progressionHistory, progression } = get();
    if (progressionHistory.length === 0) return;

    const previous = progressionHistory.at(-1);
    if (!previous) return;
    const newHistory = progressionHistory.slice(0, -1);
    const newFuture = [progression, ...get().progressionFuture];

    const barIndex = 0;
    const chordIndex = 0;
    const chord = getChordAtPosition(previous, barIndex, chordIndex);

    set({
      progression: previous,
      progressionHistory: newHistory,
      progressionFuture: newFuture,
      currentBarIndex: barIndex,
      currentChordIndex: chordIndex,
      currentChord: chord,
    });
  },

  redo: () => {
    const { progressionFuture, progression } = get();
    if (progressionFuture.length === 0) return;

    const next = progressionFuture[0];
    if (!next) return;
    const newFuture = progressionFuture.slice(1);
    const newHistory = [...get().progressionHistory, progression];

    const barIndex = 0;
    const chordIndex = 0;
    const chord = getChordAtPosition(next, barIndex, chordIndex);

    set({
      progression: next,
      progressionHistory: newHistory,
      progressionFuture: newFuture,
      currentBarIndex: barIndex,
      currentChordIndex: chordIndex,
      currentChord: chord,
    });
  },

  canUndo: () => get().progressionHistory.length > 0,
  canRedo: () => get().progressionFuture.length > 0,
});
