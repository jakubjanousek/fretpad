import { describe, expect, it } from "vitest";
import { getFretNotesForChord } from "@/lib/fretboard";
import { parseChordSymbol } from "@/lib/theory";
import { getGhostNotes } from "@/lib/theory/targetNotes";

describe("getGhostNotes", () => {
  it("returns root and guide tone positions for the given chord", () => {
    const chord = parseChordSymbol("G7");
    expect(chord).not.toBeNull();
    if (!chord) return;

    const ghostNotes = getGhostNotes(chord);

    // Should only contain roots and guide tones
    expect(ghostNotes.length).toBeGreaterThan(0);
    for (const note of ghostNotes) {
      expect(note.isRoot || note.isGuideTone).toBe(true);
    }
  });

  it("returns an empty array when chord is null", () => {
    const ghostNotes = getGhostNotes(null);
    expect(ghostNotes).toEqual([]);
  });

  it("excludes positions that overlap with current chord fret notes", () => {
    const currentChord = parseChordSymbol("Dm7");
    const nextChord = parseChordSymbol("G7");
    expect(currentChord).not.toBeNull();
    expect(nextChord).not.toBeNull();
    if (!currentChord || !nextChord) return;

    const currentFretNotes = getFretNotesForChord(currentChord);
    const ghostNotes = getGhostNotes(nextChord, {
      excludePositions: currentFretNotes,
    });

    // No ghost note should share a string+fret with a current chord note
    const currentPositions = new Set(
      currentFretNotes.map((n) => `${n.string}-${n.fret}`),
    );
    for (const ghost of ghostNotes) {
      expect(currentPositions.has(`${ghost.string}-${ghost.fret}`)).toBe(false);
    }
  });

  it("respects numFrets option", () => {
    const chord = parseChordSymbol("Cmaj7");
    expect(chord).not.toBeNull();
    if (!chord) return;

    const ghostNotes = getGhostNotes(chord, { numFrets: 5 });

    for (const note of ghostNotes) {
      expect(note.fret).toBeLessThanOrEqual(5);
    }
  });

  it("marks all returned notes as ghost notes", () => {
    const chord = parseChordSymbol("Cmaj7");
    expect(chord).not.toBeNull();
    if (!chord) return;

    const ghostNotes = getGhostNotes(chord);

    for (const note of ghostNotes) {
      expect(note.isGhost).toBe(true);
    }
  });
});
