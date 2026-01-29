import { beforeEach, describe, expect, it } from "vitest";
import { PRESET_PROGRESSIONS } from "@/lib/theory/presets";
import {
  defaultProgression,
  getChordAtPosition,
} from "@/state/slices/progressionSlice";
import { useAppStore } from "@/state/useAppStore";

function getState() {
  return useAppStore.getState();
}

describe("progressionSlice", () => {
  beforeEach(() => {
    useAppStore.setState({
      progression: defaultProgression,
      currentBarIndex: 0,
      currentChordIndex: 0,
      currentChord: getChordAtPosition(defaultProgression, 0, 0),
    });
  });

  describe("getChordAtPosition", () => {
    it("returns chord at valid position", () => {
      const chord = getChordAtPosition(defaultProgression, 0, 0);
      expect(chord).not.toBeNull();
      expect(chord?.root).toBe("D");
    });

    it("returns null for out-of-bounds bar index", () => {
      expect(getChordAtPosition(defaultProgression, 99, 0)).toBeNull();
    });

    it("returns null for out-of-bounds chord index", () => {
      expect(getChordAtPosition(defaultProgression, 0, 99)).toBeNull();
    });
  });

  describe("setProgression", () => {
    it("replaces progression and resets position to 0,0", () => {
      getState().setCurrentPosition(1, 0);
      expect(getState().currentBarIndex).toBe(1);

      const preset = PRESET_PROGRESSIONS["12-bar blues in A"];
      getState().setProgression(preset);

      expect(getState().progression).toBe(preset);
      expect(getState().currentBarIndex).toBe(0);
      expect(getState().currentChordIndex).toBe(0);
      expect(getState().currentChord).not.toBeNull();
    });
  });

  describe("loadPreset", () => {
    it("loads a preset progression and resets position", () => {
      getState().setCurrentPosition(1, 0);
      getState().loadPreset("12-bar blues in A");

      const state = getState();
      expect(state.progression).toBe(PRESET_PROGRESSIONS["12-bar blues in A"]);
      expect(state.currentBarIndex).toBe(0);
      expect(state.currentChordIndex).toBe(0);
    });
  });

  describe("setCurrentPosition", () => {
    it("updates bar and chord index", () => {
      getState().setCurrentPosition(1, 0);
      expect(getState().currentBarIndex).toBe(1);
      expect(getState().currentChordIndex).toBe(0);
      expect(getState().currentChord?.root).toBe("G");
    });

    it("sets currentChord to null for invalid position", () => {
      getState().setCurrentPosition(99, 0);
      expect(getState().currentChord).toBeNull();
    });
  });

  describe("updateBar", () => {
    it("updates a bar with valid chord string", () => {
      const result = getState().updateBar(0, "Am7");
      expect(result).toBe(true);
      expect(getState().progression.bars[0]?.chords[0]?.chord).toBe("Am7");
    });

    it("returns false for invalid chord string", () => {
      const result = getState().updateBar(0, "XYZ123");
      expect(result).toBe(false);
    });

    it("preserves bar id on update", () => {
      const originalId = getState().progression.bars[0]?.id;
      getState().updateBar(0, "Am7");
      expect(getState().progression.bars[0]?.id).toBe(originalId);
    });

    it("adjusts chord index when current bar is updated with fewer chords", () => {
      // Load a progression that has a bar with 2 chords, then update to 1
      getState().updateBar(0, "Dm7 G7");
      getState().setCurrentPosition(0, 1);
      expect(getState().currentChordIndex).toBe(1);

      getState().updateBar(0, "Am7");
      expect(getState().currentChordIndex).toBe(0);
    });
  });

  describe("addBar", () => {
    it("appends a new bar with C chord", () => {
      const barsBefore = getState().progression.bars.length;
      getState().addBar();
      const barsAfter = getState().progression.bars.length;

      expect(barsAfter).toBe(barsBefore + 1);
      const lastBar = getState().progression.bars[barsAfter - 1];
      expect(lastBar?.chords[0]?.chord).toBe("C");
    });
  });

  describe("removeBar", () => {
    it("removes a bar from the progression", () => {
      const barsBefore = getState().progression.bars.length;
      getState().removeBar(0);
      expect(getState().progression.bars.length).toBe(barsBefore - 1);
    });

    it("does not remove the last bar", () => {
      // Remove until only 1 bar left
      while (getState().progression.bars.length > 1) {
        getState().removeBar(0);
      }
      getState().removeBar(0);
      expect(getState().progression.bars.length).toBe(1);
    });

    it("adjusts currentBarIndex when removing a bar before it", () => {
      getState().setCurrentPosition(2, 0);
      getState().removeBar(0);
      expect(getState().currentBarIndex).toBe(1);
    });

    it("adjusts currentBarIndex when removing the current bar", () => {
      getState().setCurrentPosition(1, 0);
      getState().removeBar(1);
      expect(getState().currentBarIndex).toBe(0);
      expect(getState().currentChordIndex).toBe(0);
    });
  });

  describe("advanceToNextChord", () => {
    it("advances to next chord in same bar", () => {
      // Set up a bar with 2 chords
      getState().updateBar(0, "Dm7 G7");
      getState().setCurrentPosition(0, 0);

      getState().advanceToNextChord();
      expect(getState().currentChordIndex).toBe(1);
      expect(getState().currentBarIndex).toBe(0);
    });

    it("advances to next bar when at last chord of bar", () => {
      getState().setCurrentPosition(0, 0);
      getState().advanceToNextChord();
      expect(getState().currentBarIndex).toBe(1);
      expect(getState().currentChordIndex).toBe(0);
    });

    it("wraps to beginning when at end of progression", () => {
      const lastBarIndex = getState().progression.bars.length - 1;
      getState().setCurrentPosition(lastBarIndex, 0);

      getState().advanceToNextChord();
      expect(getState().currentBarIndex).toBe(0);
      expect(getState().currentChordIndex).toBe(0);
    });
  });
});
