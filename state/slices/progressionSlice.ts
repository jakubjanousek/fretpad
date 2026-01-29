import type { StateCreator } from "zustand";
import { generateId } from "@/lib/id";
import { parseChordSymbol } from "@/lib/theory/chords";
import { PRESET_PROGRESSIONS, parseBar } from "@/lib/theory/progression";
import type { Chord, Progression, ProgressionBar } from "@/lib/types";
import type { AppState } from "../useAppStore";

export interface ProgressionSlice {
  progression: Progression;
  currentBarIndex: number;
  currentChordIndex: number;
  currentChord: Chord | null;

  setProgression: (progression: Progression) => void;
  loadPreset: (presetName: keyof typeof PRESET_PROGRESSIONS) => void;
  setCurrentPosition: (barIndex: number, chordIndex: number) => void;
  updateBar: (barIndex: number, barString: string) => boolean;
  addBar: () => void;
  removeBar: (barIndex: number) => void;
  advanceToNextChord: () => void;
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

  setProgression: (progression) => {
    const chord = getChordAtPosition(progression, 0, 0);
    set({
      progression,
      currentBarIndex: 0,
      currentChordIndex: 0,
      currentChord: chord,
    });
  },

  loadPreset: (presetName) => {
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
});
