import { describe, expect, it } from "vitest";

/**
 * Tests that the theory barrel export exposes all public API functions
 * that external consumers need. These tests import exclusively from
 * the barrel — if they pass, the barrel is complete.
 */
import {
  createProgression,
  // key detection
  detectKey,
  filterApproachNotesFromChordTones,
  getAllChordsFromProgression,
  getArpeggioConnections,
  // arpeggios
  getArpeggioNotes,
  getChromaticApproachNotes,
  getDiatonicApproachNotes,
  getIntervalName,
  // pentatonic / overlays
  getOverlayNotes,
  getPresetsByCategory,
  getPrimaryScale,
  getScaleNotes,
  // scales
  getSuggestedScalesForChord,
  // target notes
  getTargetNotes,
  getTargetStrength,
  isChordTone,
  isGuideTone,
  isRoot,
  PRESET_METADATA,
  // presets
  PRESET_PROGRESSIONS,
  // progression
  parseBar,
  // chords
  parseChordSymbol,
  // transpose
  transposeChordSymbol,
  transposeProgression,
} from "@/lib/theory";

describe("lib/theory barrel export", () => {
  it("exports chord functions", () => {
    const chord = parseChordSymbol("Cmaj7");
    expect(chord).not.toBeNull();
    expect(chord?.root).toBe("C");
    expect(chord?.guideTones).toContain("E");
    expect(isChordTone(chord!, "E")).toBe(true);
    expect(isGuideTone(chord!, "E")).toBe(true);
    expect(isRoot(chord!, "C")).toBe(true);
    expect(getIntervalName("C", "E")).toBe("3");
  });

  it("exports scale functions", () => {
    const chord = parseChordSymbol("Dm7")!;
    const scales = getSuggestedScalesForChord(chord);
    expect(scales.length).toBeGreaterThan(0);
    const notes = getScaleNotes("D", "dorian");
    expect(notes).toContain("D");
    expect(getPrimaryScale(chord)).toBeTruthy();
  });

  it("exports progression functions", () => {
    const bar = parseBar("Dm7");
    expect(bar).not.toBeNull();
    expect(bar?.chords[0]?.chord).toBe("Dm7");
    const prog = PRESET_PROGRESSIONS["ii-V-I"];
    expect(getAllChordsFromProgression(prog).length).toBeGreaterThan(0);
    const created = createProgression(["Am7"]);
    expect(created).not.toBeNull();
    expect(created?.bars).toHaveLength(1);
  });

  it("exports presets", () => {
    expect(PRESET_PROGRESSIONS["ii-V-I"]).toBeDefined();
    expect(PRESET_METADATA["ii-V-I"]).toBeDefined();
    const byCategory = getPresetsByCategory();
    expect(byCategory.jazz).toBeDefined();
  });

  it("exports transpose functions", () => {
    expect(transposeChordSymbol("Cmaj7", 2)).toBe("Dmaj7");
    const prog = PRESET_PROGRESSIONS["ii-V-I"];
    const transposed = transposeProgression(prog, 2);
    expect(transposed.bars[0]?.chords[0]?.chord).toContain("E");
  });

  it("exports key detection", () => {
    const prog = PRESET_PROGRESSIONS["ii-V-I"];
    const keys = detectKey(prog);
    expect(keys.length).toBeGreaterThan(0);
    expect(keys[0]?.root).toBe("C");
  });

  it("exports target note functions", () => {
    expect(getTargetStrength).toBeTypeOf("function");
    expect(getTargetNotes).toBeTypeOf("function");
    expect(getChromaticApproachNotes).toBeTypeOf("function");
    expect(getDiatonicApproachNotes).toBeTypeOf("function");
    expect(filterApproachNotesFromChordTones).toBeTypeOf("function");
  });

  it("exports overlay and arpeggio functions", () => {
    expect(getOverlayNotes).toBeTypeOf("function");
    expect(getArpeggioNotes).toBeTypeOf("function");
    expect(getArpeggioConnections).toBeTypeOf("function");
  });
});
