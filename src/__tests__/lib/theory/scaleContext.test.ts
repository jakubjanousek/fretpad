import { describe, expect, it } from "vitest";
import { createProgression } from "@/lib/theory/progression";
import {
  areModesOfSameParent,
  getParentScale,
  getProgressionScaleContext,
} from "@/lib/theory/scaleContext";

describe("getParentScale", () => {
  it("returns C Major for D Dorian (mode 2 of C Major)", () => {
    const result = getParentScale("D Dorian");
    expect(result).toEqual({ root: "C", name: "Major" });
  });

  it("returns C Major for G Mixolydian (mode 5 of C Major)", () => {
    const result = getParentScale("G Mixolydian");
    expect(result).toEqual({ root: "C", name: "Major" });
  });

  it("returns C Major for C Major (identity)", () => {
    const result = getParentScale("C Major");
    expect(result).toEqual({ root: "C", name: "Major" });
  });

  it("returns C Major for A Aeolian (natural minor = relative major)", () => {
    const result = getParentScale("A Aeolian");
    expect(result).toEqual({ root: "C", name: "Major" });
  });

  it("returns D Melodic Minor for D Melodic Minor (is its own parent)", () => {
    const result = getParentScale("D Melodic Minor");
    expect(result).toEqual({ root: "D", name: "Melodic Minor" });
  });
});

describe("areModesOfSameParent", () => {
  it("returns true for D Dorian and G Mixolydian (both modes of C Major)", () => {
    expect(areModesOfSameParent("D Dorian", "G Mixolydian")).toBe(true);
  });

  it("returns true for D Dorian and C Major (same parent)", () => {
    expect(areModesOfSameParent("D Dorian", "C Major")).toBe(true);
  });

  it("returns false for D Dorian and D Melodic Minor (different parents)", () => {
    expect(areModesOfSameParent("D Dorian", "D Melodic Minor")).toBe(false);
  });
});

describe("getProgressionScaleContext", () => {
  it("marks all chords as same key for ii-V-I in C", () => {
    const progression = createProgression(["Dm7", "G7", "Cmaj7", "Cmaj7"], {
      name: "ii-V-I in C",
    });
    expect(progression).not.toBeNull();

    const context = getProgressionScaleContext(progression!);
    expect(context).toHaveLength(4);

    // All chords should share C Major as parent scale
    for (const ctx of context) {
      expect(ctx.parentScale).toBe("C Major");
      expect(ctx.scaleChangesFromKey).toBe(false);
    }

    // Check specific chord details
    expect(context[0]?.chordSymbol).toBe("Dm7");
    expect(context[0]?.suggestedScale).toBe("D Dorian");

    expect(context[1]?.chordSymbol).toBe("G7");
    expect(context[1]?.suggestedScale).toBe("G Mixolydian");

    expect(context[2]?.chordSymbol).toBe("Cmaj7");
    expect(context[2]?.suggestedScale).toBe("C Major");
  });

  it("marks borrowed chord as scale change", () => {
    // I - ii - V - bIII7 - I in C: Cmaj7, Dm7, G7 are diatonic,
    // but Eb7 (Eb Mixolydian) has different notes than C Major
    const progression = createProgression(
      ["Cmaj7", "Dm7", "G7", "Eb7", "Cmaj7"],
      { name: "With borrowed chord" },
    );
    expect(progression).not.toBeNull();

    const context = getProgressionScaleContext(progression!);
    expect(context).toHaveLength(5);

    // Cmaj7 (C Major), Dm7 (D Dorian), G7 (G Mixolydian) share C Major's notes
    expect(context[0]?.scaleChangesFromKey).toBe(false);
    expect(context[1]?.scaleChangesFromKey).toBe(false);
    expect(context[2]?.scaleChangesFromKey).toBe(false);

    // Eb7 should be a scale change (Eb Mixolydian has different notes)
    expect(context[3]?.scaleChangesFromKey).toBe(true);

    // Last Cmaj7 should be in key
    expect(context[4]?.scaleChangesFromKey).toBe(false);
  });
});
