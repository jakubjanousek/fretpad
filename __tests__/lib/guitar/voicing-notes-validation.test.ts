import { Note } from "tonal";
import { describe, expect, it } from "vitest";
import {
  getDrop2Voicings,
  getDrop3Voicings,
  getShellVoicings,
} from "@/lib/guitar/voicings";
import type { Chord } from "@/lib/types";

// Helper to create test chords
function createChord(
  symbol: string,
  root: string,
  quality: Chord["quality"],
  notes: string[],
): Chord {
  return {
    symbol,
    root: root as Chord["root"],
    quality,
    notes: notes as Chord["notes"],
    guideTones: notes.slice(1, 3) as Chord["guideTones"],
    suggestedScales: [],
  };
}

// Helper to check if a note is enharmonically equal to any in a list
function noteInChord(note: string | undefined, chordNotes: string[]): boolean {
  if (!note) return false;
  const noteChroma = Note.chroma(note);
  return chordNotes.some((cn) => Note.chroma(cn) === noteChroma);
}

describe("Voicing Note Validation", () => {
  describe("shell voicings should only contain chord tones", () => {
    it("Am7 shell voicing should contain A, C, E, G (NOT G#)", () => {
      const am7 = createChord("Am7", "A", "min7", ["A", "C", "E", "G"]);
      const voicings = getShellVoicings(am7);

      expect(voicings.length).toBeGreaterThan(0);

      voicings.forEach((v) => {
        const notesPlayed = v.positions
          .filter((p) => p.fret >= 0 && p.note)
          .map((p) => p.note);

        // All notes should be chord tones
        notesPlayed.forEach((note) => {
          expect(
            noteInChord(note, am7.notes),
            `Note ${note} in ${v.name} is not a chord tone of Am7 (expected A, C, E, or G)`,
          ).toBe(true);
        });
      });
    });

    it("Cmaj7 shell voicing should contain C, E, G, B", () => {
      const cmaj7 = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);
      const voicings = getShellVoicings(cmaj7);

      expect(voicings.length).toBeGreaterThan(0);

      voicings.forEach((v) => {
        const notesPlayed = v.positions
          .filter((p) => p.fret >= 0 && p.note)
          .map((p) => p.note);

        notesPlayed.forEach((note) => {
          expect(
            noteInChord(note, cmaj7.notes),
            `Note ${note} in ${v.name} is not a chord tone of Cmaj7`,
          ).toBe(true);
        });
      });
    });

    it("G7 shell voicing should contain G, B, D, F (minor 7th)", () => {
      const g7 = createChord("G7", "G", "7", ["G", "B", "D", "F"]);
      const voicings = getShellVoicings(g7);

      expect(voicings.length).toBeGreaterThan(0);

      voicings.forEach((v) => {
        const notesPlayed = v.positions
          .filter((p) => p.fret >= 0 && p.note)
          .map((p) => p.note);

        notesPlayed.forEach((note) => {
          expect(
            noteInChord(note, g7.notes),
            `Note ${note} in ${v.name} is not a chord tone of G7`,
          ).toBe(true);
        });
      });
    });

    it("Dm7 shell voicing should contain D, F, A, C", () => {
      const dm7 = createChord("Dm7", "D", "min7", ["D", "F", "A", "C"]);
      const voicings = getShellVoicings(dm7);

      expect(voicings.length).toBeGreaterThan(0);

      voicings.forEach((v) => {
        const notesPlayed = v.positions
          .filter((p) => p.fret >= 0 && p.note)
          .map((p) => p.note);

        notesPlayed.forEach((note) => {
          expect(
            noteInChord(note, dm7.notes),
            `Note ${note} in ${v.name} is not a chord tone of Dm7`,
          ).toBe(true);
        });
      });
    });

    it("shell voicings should have root, 3rd, and 7th", () => {
      const am7 = createChord("Am7", "A", "min7", ["A", "C", "E", "G"]);
      const voicings = getShellVoicings(am7);

      voicings.forEach((v) => {
        const notesPlayed = v.positions
          .filter((p) => p.fret >= 0 && p.note)
          .map((p) => p.note as string);

        // Should have exactly 3 notes (root, 3rd, 7th)
        expect(notesPlayed.length).toBe(3);

        // Should have root (A)
        expect(
          notesPlayed.some((n) => Note.chroma(n) === Note.chroma("A")),
          `Voicing ${v.name} should have root A`,
        ).toBe(true);

        // Should have 3rd (C for Am7)
        expect(
          notesPlayed.some((n) => Note.chroma(n) === Note.chroma("C")),
          `Voicing ${v.name} should have 3rd C`,
        ).toBe(true);

        // Should have 7th (G for Am7)
        expect(
          notesPlayed.some((n) => Note.chroma(n) === Note.chroma("G")),
          `Voicing ${v.name} should have 7th G`,
        ).toBe(true);
      });
    });
  });

  describe("drop 2 voicings should only contain chord tones", () => {
    it("Am7 drop 2 voicing should contain only A, C, E, G", () => {
      const am7 = createChord("Am7", "A", "min7", ["A", "C", "E", "G"]);
      const voicings = getDrop2Voicings(am7);

      expect(voicings.length).toBeGreaterThan(0);

      voicings.forEach((v) => {
        const notesPlayed = v.positions
          .filter((p) => p.fret >= 0 && p.note)
          .map((p) => p.note);

        notesPlayed.forEach((note) => {
          expect(
            noteInChord(note, am7.notes),
            `Note ${note} in ${v.name} is not a chord tone of Am7`,
          ).toBe(true);
        });
      });
    });

    it("Cmaj7 drop 2 voicing should contain only C, E, G, B", () => {
      const cmaj7 = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);
      const voicings = getDrop2Voicings(cmaj7);

      expect(voicings.length).toBeGreaterThan(0);

      voicings.forEach((v) => {
        const notesPlayed = v.positions
          .filter((p) => p.fret >= 0 && p.note)
          .map((p) => p.note);

        notesPlayed.forEach((note) => {
          expect(
            noteInChord(note, cmaj7.notes),
            `Note ${note} in ${v.name} is not a chord tone of Cmaj7`,
          ).toBe(true);
        });
      });
    });

    it("G7 drop 2 voicing should contain only G, B, D, F", () => {
      const g7 = createChord("G7", "G", "7", ["G", "B", "D", "F"]);
      const voicings = getDrop2Voicings(g7);

      expect(voicings.length).toBeGreaterThan(0);

      voicings.forEach((v) => {
        const notesPlayed = v.positions
          .filter((p) => p.fret >= 0 && p.note)
          .map((p) => p.note);

        notesPlayed.forEach((note) => {
          expect(
            noteInChord(note, g7.notes),
            `Note ${note} in ${v.name} is not a chord tone of G7`,
          ).toBe(true);
        });
      });
    });

    it("drop 2 voicings should have 4 notes (root, 3rd, 5th, 7th)", () => {
      const cmaj7 = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);
      const voicings = getDrop2Voicings(cmaj7);

      voicings.forEach((v) => {
        const notesPlayed = v.positions
          .filter((p) => p.fret >= 0 && p.note)
          .map((p) => p.note as string);

        // Should have exactly 4 notes
        expect(notesPlayed.length).toBe(4);
      });
    });
  });

  describe("drop 3 voicings should only contain chord tones", () => {
    it("Am7 drop 3 voicing should contain only A, C, E, G", () => {
      const am7 = createChord("Am7", "A", "min7", ["A", "C", "E", "G"]);
      const voicings = getDrop3Voicings(am7);

      expect(voicings.length).toBeGreaterThan(0);

      voicings.forEach((v) => {
        const notesPlayed = v.positions
          .filter((p) => p.fret >= 0 && p.note)
          .map((p) => p.note);

        notesPlayed.forEach((note) => {
          expect(
            noteInChord(note, am7.notes),
            `Note ${note} in ${v.name} is not a chord tone of Am7`,
          ).toBe(true);
        });
      });
    });

    it("Cmaj7 drop 3 voicing should contain only C, E, G, B", () => {
      const cmaj7 = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);
      const voicings = getDrop3Voicings(cmaj7);

      expect(voicings.length).toBeGreaterThan(0);

      voicings.forEach((v) => {
        const notesPlayed = v.positions
          .filter((p) => p.fret >= 0 && p.note)
          .map((p) => p.note);

        notesPlayed.forEach((note) => {
          expect(
            noteInChord(note, cmaj7.notes),
            `Note ${note} in ${v.name} is not a chord tone of Cmaj7`,
          ).toBe(true);
        });
      });
    });

    it("G7 drop 3 voicing should contain only G, B, D, F", () => {
      const g7 = createChord("G7", "G", "7", ["G", "B", "D", "F"]);
      const voicings = getDrop3Voicings(g7);

      expect(voicings.length).toBeGreaterThan(0);

      voicings.forEach((v) => {
        const notesPlayed = v.positions
          .filter((p) => p.fret >= 0 && p.note)
          .map((p) => p.note);

        notesPlayed.forEach((note) => {
          expect(
            noteInChord(note, g7.notes),
            `Note ${note} in ${v.name} is not a chord tone of G7`,
          ).toBe(true);
        });
      });
    });
  });
});
