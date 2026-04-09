import { describe, expect, it } from "vitest";
import { COLORS, getNoteColor } from "@/components/voicing/ChordDiagram";

describe("getNoteColor", () => {
  it("returns root color for root notes", () => {
    const pos = { string: 6, fret: 3, isRoot: true, note: "C" as const };
    expect(getNoteColor(pos, ["E", "B"])).toBe(COLORS.root);
  });

  it("returns guide tone color for 3rd and 7th", () => {
    const pos = { string: 3, fret: 4, isRoot: false, note: "E" as const };
    expect(getNoteColor(pos, ["E", "B"])).toBe(COLORS.guideTone);
  });

  it("returns guide tone color with enharmonic match", () => {
    const pos = { string: 2, fret: 3, isRoot: false, note: "Bb" as const };
    expect(getNoteColor(pos, ["E", "A#"])).toBe(COLORS.guideTone);
  });

  it("returns chord tone color for non-root non-guide notes", () => {
    const pos = { string: 4, fret: 5, isRoot: false, note: "G" as const };
    expect(getNoteColor(pos, ["E", "B"])).toBe(COLORS.chordTone);
  });

  it("returns chord tone color when no guideTones provided", () => {
    const pos = { string: 3, fret: 4, isRoot: false, note: "E" as const };
    expect(getNoteColor(pos)).toBe(COLORS.chordTone);
  });

  it("returns chord tone color when note is undefined", () => {
    const pos = { string: 3, fret: 4, isRoot: false };
    expect(getNoteColor(pos, ["E", "B"])).toBe(COLORS.chordTone);
  });
});
