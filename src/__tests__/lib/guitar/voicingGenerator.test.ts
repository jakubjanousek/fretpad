import { describe, expect, it } from "vitest";
import { getNoteAtFret } from "@/lib/fretboard";
import { generateVoicingsForChord } from "@/lib/guitar/voicingGenerator";
import { parseChordSymbol } from "@/lib/theory/chords";
import type { Chord, GuitarVoicing } from "@/lib/types";
import { STANDARD_TUNING } from "@/lib/types";

/** Parse chord or throw — convenience for tests */
function chord(symbol: string): Chord {
  const c = parseChordSymbol(symbol);
  if (!c) throw new Error(`Failed to parse chord: ${symbol}`);
  return c;
}

/** Helper: extract sounding notes from a voicing */
function getSoundingNotes(voicing: GuitarVoicing): string[] {
  return voicing.positions
    .filter((p) => p.fret >= 0)
    .map((p) => {
      const openString = STANDARD_TUNING[p.string - 1];
      if (!openString) throw new Error(`Invalid string ${p.string}`);
      return getNoteAtFret(openString, p.fret);
    });
}

/** Helper: get pitch class (0-11) for enharmonic comparison */
function getPitchClass(note: string): number {
  const map: Record<string, number> = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };
  return map[note] ?? -1;
}

/** Helper: check if all sounding notes belong to a chord (enharmonic-aware) */
function allNotesInChord(
  voicing: GuitarVoicing,
  chordNotes: string[],
): boolean {
  const chordPCs = new Set(chordNotes.map(getPitchClass));
  const soundingNotes = getSoundingNotes(voicing);
  return soundingNotes.every((n) => chordPCs.has(getPitchClass(n)));
}

describe("generateVoicingsForChord", () => {
  describe("basic generation", () => {
    it("returns voicings for Cmaj7", () => {
      const voicings = generateVoicingsForChord(chord("Cmaj7"));
      expect(voicings.length).toBeGreaterThan(0);
    });

    it("returns voicings for Dm7", () => {
      const voicings = generateVoicingsForChord(chord("Dm7"));
      expect(voicings.length).toBeGreaterThan(0);
    });

    it("returns voicings for G7", () => {
      const voicings = generateVoicingsForChord(chord("G7"));
      expect(voicings.length).toBeGreaterThan(0);
    });

    it("returns voicings for Am7b5", () => {
      const voicings = generateVoicingsForChord(chord("Am7b5"));
      expect(voicings.length).toBeGreaterThan(0);
    });
  });

  describe("note correctness", () => {
    it("all notes in Cmaj7 voicings belong to the chord", () => {
      const c = chord("Cmaj7");
      const voicings = generateVoicingsForChord(c);
      for (const v of voicings) {
        expect(allNotesInChord(v, c.notes)).toBe(true);
      }
    });

    it("all notes in Dm7 voicings belong to the chord", () => {
      const c = chord("Dm7");
      const voicings = generateVoicingsForChord(c);
      for (const v of voicings) {
        expect(allNotesInChord(v, c.notes)).toBe(true);
      }
    });

    it("all notes in G7 voicings belong to the chord", () => {
      const c = chord("G7");
      const voicings = generateVoicingsForChord(c);
      for (const v of voicings) {
        expect(allNotesInChord(v, c.notes)).toBe(true);
      }
    });

    it("every voicing contains the root", () => {
      const c = chord("Cmaj7");
      const voicings = generateVoicingsForChord(c);
      const rootPC = getPitchClass(c.root);
      for (const v of voicings) {
        const notes = getSoundingNotes(v);
        expect(notes.some((n) => getPitchClass(n) === rootPC)).toBe(true);
      }
    });
  });

  describe("playability", () => {
    it("no voicing has a fret stretch greater than 4", () => {
      const voicings = generateVoicingsForChord(chord("Cmaj7"));
      for (const v of voicings) {
        const frets = v.positions.filter((p) => p.fret > 0).map((p) => p.fret);
        if (frets.length > 0) {
          const stretch = Math.max(...frets) - Math.min(...frets);
          expect(stretch).toBeLessThanOrEqual(4);
        }
      }
    });

    it("no fret exceeds 14", () => {
      const voicings = generateVoicingsForChord(chord("Cmaj7"));
      for (const v of voicings) {
        for (const p of v.positions) {
          if (p.fret > 0) {
            expect(p.fret).toBeLessThanOrEqual(14);
          }
        }
      }
    });

    it("each voicing has at least 3 sounding strings", () => {
      const voicings = generateVoicingsForChord(chord("Cmaj7"));
      for (const v of voicings) {
        const sounding = v.positions.filter((p) => p.fret >= 0).length;
        expect(sounding).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe("transposition", () => {
    it("generates voicings at different fret positions for the same chord type", () => {
      const voicings = generateVoicingsForChord(chord("Cmaj7"));
      const baseFrets = new Set(voicings.map((v) => v.baseFret));
      expect(baseFrets.size).toBeGreaterThan(1);
    });

    it("generates the same number of voicings for enharmonic roots", () => {
      const voicingsSharp = generateVoicingsForChord(chord("C#maj7"));
      const voicingsFlat = generateVoicingsForChord(chord("Dbmaj7"));
      expect(voicingsSharp.length).toBe(voicingsFlat.length);
    });
  });

  describe("voicing metadata", () => {
    it("sets unique ids on each voicing", () => {
      const voicings = generateVoicingsForChord(chord("Cmaj7"));
      const ids = new Set(voicings.map((v) => v.id));
      expect(ids.size).toBe(voicings.length);
    });

    it("sets correct baseFret as lowest sounding fret", () => {
      const voicings = generateVoicingsForChord(chord("Cmaj7"));
      for (const v of voicings) {
        const frets = v.positions.filter((p) => p.fret > 0).map((p) => p.fret);
        if (frets.length > 0) {
          expect(v.baseFret).toBe(Math.min(...frets));
        }
      }
    });

    it("marks positions with correct note names", () => {
      const voicings = generateVoicingsForChord(chord("Cmaj7"));
      for (const v of voicings) {
        for (const p of v.positions) {
          if (p.fret >= 0 && p.note) {
            const openString = STANDARD_TUNING[p.string - 1];
            if (!openString) continue;
            const expected = getNoteAtFret(openString, p.fret);
            expect(getPitchClass(p.note)).toBe(getPitchClass(expected));
          }
        }
      }
    });

    it("marks root positions correctly", () => {
      const c = chord("Dm7");
      const voicings = generateVoicingsForChord(c);
      const rootPC = getPitchClass(c.root);
      for (const v of voicings) {
        for (const p of v.positions) {
          if (p.isRoot && p.note) {
            expect(getPitchClass(p.note)).toBe(rootPC);
          }
        }
      }
    });
  });

  describe("drop 2 inversions", () => {
    it("generates voicings with inversions 0, 1, 2, and 3 for Cmaj7", () => {
      const voicings = generateVoicingsForChord(chord("Cmaj7"));
      const drop2 = voicings.filter((v) => v.type === "drop2");
      const inversions = new Set(drop2.map((v) => v.inversion));
      expect(inversions).toContain(0);
      expect(inversions).toContain(1);
      expect(inversions).toContain(2);
      expect(inversions).toContain(3);
    });

    it("generates voicings with inversions 0, 1, 2, and 3 for Dm7", () => {
      const voicings = generateVoicingsForChord(chord("Dm7"));
      const drop2 = voicings.filter((v) => v.type === "drop2");
      const inversions = new Set(drop2.map((v) => v.inversion));
      expect(inversions).toContain(0);
      expect(inversions).toContain(1);
      expect(inversions).toContain(2);
      expect(inversions).toContain(3);
    });

    it("generates voicings with inversions 0, 1, 2, and 3 for G7", () => {
      const voicings = generateVoicingsForChord(chord("G7"));
      const drop2 = voicings.filter((v) => v.type === "drop2");
      const inversions = new Set(drop2.map((v) => v.inversion));
      expect(inversions).toContain(0);
      expect(inversions).toContain(1);
      expect(inversions).toContain(2);
      expect(inversions).toContain(3);
    });

    it("generates voicings with inversions 0, 1, 2, and 3 for Am7b5", () => {
      const voicings = generateVoicingsForChord(chord("Am7b5"));
      const drop2 = voicings.filter((v) => v.type === "drop2");
      const inversions = new Set(drop2.map((v) => v.inversion));
      expect(inversions).toContain(0);
      expect(inversions).toContain(1);
      expect(inversions).toContain(2);
      expect(inversions).toContain(3);
    });

    it("all drop 2 inversion voicings have correct chord tones", () => {
      for (const symbol of ["Cmaj7", "Dm7", "G7", "Bm7b5"]) {
        const c = chord(symbol);
        const voicings = generateVoicingsForChord(c);
        const drop2 = voicings.filter((v) => v.type === "drop2");
        for (const v of drop2) {
          expect(allNotesInChord(v, c.notes)).toBe(true);
        }
      }
    });

    it("generates more voicings than with root position only", () => {
      // With inversions, we should have significantly more drop 2 voicings
      const voicings = generateVoicingsForChord(chord("Cmaj7"));
      const drop2 = voicings.filter((v) => v.type === "drop2");
      // Root position only produced ~2 drop 2 voicings for Cmaj7
      // With inversions we expect significantly more
      expect(drop2.length).toBeGreaterThan(5);
    });
  });
});
