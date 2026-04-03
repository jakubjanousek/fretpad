import { describe, expect, it } from "vitest";
import {
  getPrimaryScale,
  getScaleNotes,
  getScaleTypeName,
  getSuggestedScalesForChord,
  isInScale,
} from "@/lib/theory/scales";
import type { Chord } from "@/lib/types";

describe("getSuggestedScalesForChord", () => {
  it("returns suggested scales from chord object", () => {
    const chord: Chord = {
      symbol: "Dm7",
      root: "D",
      quality: "min7",
      notes: ["D", "F", "A", "C"],
      guideTones: ["F", "C"],
      suggestedScales: ["D Dorian", "D Aeolian"],
    };

    const scales = getSuggestedScalesForChord(chord);
    expect(scales).toEqual(["D Dorian", "D Aeolian"]);
  });

  it("returns empty array if no suggested scales", () => {
    const chord: Chord = {
      symbol: "C",
      root: "C",
      quality: "maj",
      notes: ["C", "E", "G"],
      guideTones: ["E"],
      suggestedScales: [],
    };

    const scales = getSuggestedScalesForChord(chord);
    expect(scales).toEqual([]);
  });
});

describe("getScaleNotes", () => {
  it("returns notes for C Major scale", () => {
    const notes = getScaleNotes("C", "Major");
    expect(notes).toContain("C");
    expect(notes).toContain("D");
    expect(notes).toContain("E");
    expect(notes).toContain("F");
    expect(notes).toContain("G");
    expect(notes).toContain("A");
    expect(notes).toContain("B");
    expect(notes).toHaveLength(7);
  });

  it("returns notes for D Dorian scale", () => {
    const notes = getScaleNotes("D", "Dorian");
    expect(notes).toContain("D");
    expect(notes).toContain("E");
    expect(notes).toContain("F");
    expect(notes).toContain("G");
    expect(notes).toContain("A");
    expect(notes).toContain("B");
    expect(notes).toContain("C");
    expect(notes).toHaveLength(7);
  });

  it("returns notes for G Mixolydian scale", () => {
    const notes = getScaleNotes("G", "Mixolydian");
    expect(notes).toContain("G");
    expect(notes).toContain("A");
    expect(notes).toContain("B");
    expect(notes).toContain("C");
    expect(notes).toContain("D");
    expect(notes).toContain("E");
    expect(notes).toContain("F");
    expect(notes).toHaveLength(7);
  });

  it("returns notes for A Aeolian (natural minor) scale", () => {
    const notes = getScaleNotes("A", "Aeolian");
    expect(notes).toContain("A");
    expect(notes).toContain("B");
    expect(notes).toContain("C");
    expect(notes).toContain("D");
    expect(notes).toContain("E");
    expect(notes).toContain("F");
    expect(notes).toContain("G");
    expect(notes).toHaveLength(7);
  });

  it("returns empty array for invalid scale", () => {
    const notes = getScaleNotes("C", "InvalidScale");
    expect(notes).toEqual([]);
  });

  it("handles sharp roots", () => {
    const notes = getScaleNotes("F#", "Major");
    expect(notes).toContain("F#");
    expect(notes).toHaveLength(7);
  });

  it("handles flat roots", () => {
    const notes = getScaleNotes("Bb", "Major");
    expect(notes).toContain("Bb");
    expect(notes).toHaveLength(7);
  });
});

describe("isInScale", () => {
  it("returns true for notes in C Major scale", () => {
    expect(isInScale("C", "C", "Major")).toBe(true);
    expect(isInScale("D", "C", "Major")).toBe(true);
    expect(isInScale("E", "C", "Major")).toBe(true);
    expect(isInScale("F", "C", "Major")).toBe(true);
    expect(isInScale("G", "C", "Major")).toBe(true);
    expect(isInScale("A", "C", "Major")).toBe(true);
    expect(isInScale("B", "C", "Major")).toBe(true);
  });

  it("returns false for notes not in C Major scale", () => {
    expect(isInScale("C#", "C", "Major")).toBe(false);
    expect(isInScale("Eb", "C", "Major")).toBe(false);
    expect(isInScale("F#", "C", "Major")).toBe(false);
    expect(isInScale("Ab", "C", "Major")).toBe(false);
    expect(isInScale("Bb", "C", "Major")).toBe(false);
  });

  it("handles enharmonic equivalents", () => {
    // Bb Major scale has Bb, not A#, but they're enharmonically equivalent
    expect(isInScale("A#", "Bb", "Major")).toBe(true);
  });

  it("works with Dorian mode", () => {
    // D Dorian: D E F G A B C
    expect(isInScale("D", "D", "Dorian")).toBe(true);
    expect(isInScale("F", "D", "Dorian")).toBe(true); // b3
    expect(isInScale("C", "D", "Dorian")).toBe(true); // b7
    expect(isInScale("C#", "D", "Dorian")).toBe(false);
    expect(isInScale("F#", "D", "Dorian")).toBe(false);
  });

  it("returns false for invalid scale", () => {
    expect(isInScale("C", "C", "InvalidScale")).toBe(false);
  });
});

describe("getPrimaryScale", () => {
  it("returns first suggested scale", () => {
    const chord: Chord = {
      symbol: "Dm7",
      root: "D",
      quality: "min7",
      notes: ["D", "F", "A", "C"],
      guideTones: ["F", "C"],
      suggestedScales: ["D Dorian", "D Aeolian"],
    };

    expect(getPrimaryScale(chord)).toBe("D Dorian");
  });

  it("returns default Major scale if no suggestions", () => {
    const chord: Chord = {
      symbol: "C",
      root: "C",
      quality: "maj",
      notes: ["C", "E", "G"],
      guideTones: ["E"],
      suggestedScales: [],
    };

    expect(getPrimaryScale(chord)).toBe("C Major");
  });
});

describe("getScaleTypeName", () => {
  it("extracts scale type from full scale name", () => {
    expect(getScaleTypeName("C Dorian")).toBe("dorian");
    expect(getScaleTypeName("D Major")).toBe("major");
    expect(getScaleTypeName("G Mixolydian")).toBe("mixolydian");
    expect(getScaleTypeName("A Aeolian")).toBe("aeolian");
  });

  it("handles multi-word scale names", () => {
    expect(getScaleTypeName("C Lydian Dominant")).toBe("lydian dominant");
    expect(getScaleTypeName("D Melodic Minor")).toBe("melodic minor");
  });

  it("returns major for single word input", () => {
    expect(getScaleTypeName("C")).toBe("major");
  });
});
