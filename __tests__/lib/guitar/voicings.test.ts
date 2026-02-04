import { describe, expect, it } from "vitest";
import {
  generateVoicingsForChord,
  getBarreVoicings,
  getDrop2Voicings,
  getDrop3Voicings,
  getFretForNote,
  getNoteAtFret,
  getOpenVoicings,
  getShellVoicings,
  getStringGroup,
  getVSystemPosition,
  isPlayableVoicing,
  sortVoicingsByPriority,
} from "@/lib/guitar/voicings";
import type { Chord, GuitarFretPosition } from "@/lib/types";

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

describe("Guitar Voicing Generation", () => {
  describe("getNoteAtFret", () => {
    it("returns correct note for open strings", () => {
      expect(getNoteAtFret(1, 0)).toBe("E"); // High E
      expect(getNoteAtFret(2, 0)).toBe("B");
      expect(getNoteAtFret(3, 0)).toBe("G");
      expect(getNoteAtFret(4, 0)).toBe("D");
      expect(getNoteAtFret(5, 0)).toBe("A");
      expect(getNoteAtFret(6, 0)).toBe("E"); // Low E
    });

    it("returns correct notes at various frets", () => {
      expect(getNoteAtFret(6, 3)).toBe("G"); // 3rd fret low E = G
      expect(getNoteAtFret(6, 5)).toBe("A"); // 5th fret low E = A
      expect(getNoteAtFret(5, 3)).toBe("C"); // 3rd fret A string = C
      expect(getNoteAtFret(1, 5)).toBe("A"); // 5th fret high E = A
    });

    it("handles frets beyond 12", () => {
      expect(getNoteAtFret(6, 12)).toBe("E"); // 12th fret = octave
      expect(getNoteAtFret(6, 15)).toBe("G"); // 15th fret
    });
  });

  describe("getFretForNote", () => {
    it("finds C on string 5 (A string)", () => {
      const frets = getFretForNote(5, "C", 0, 12);
      expect(frets).toContain(3);
      expect(frets).not.toContain(0);
    });

    it("finds G on string 6 (low E string)", () => {
      const frets = getFretForNote(6, "G", 0, 12);
      expect(frets).toContain(3);
    });

    it("returns multiple positions within range", () => {
      const frets = getFretForNote(6, "E", 0, 15);
      expect(frets).toContain(0);
      expect(frets).toContain(12);
    });

    it("respects min/max fret constraints", () => {
      const frets = getFretForNote(6, "E", 5, 15);
      expect(frets).not.toContain(0);
      expect(frets).toContain(12);
    });
  });

  describe("isPlayableVoicing", () => {
    it("returns true for positions within 4 frets", () => {
      const positions: GuitarFretPosition[] = [
        { string: 1, fret: 5 },
        { string: 2, fret: 5 },
        { string: 3, fret: 6 },
        { string: 4, fret: 7 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ];
      expect(isPlayableVoicing(positions)).toBe(true);
    });

    it("returns false for positions spanning more than 4 frets", () => {
      const positions: GuitarFretPosition[] = [
        { string: 1, fret: 1 },
        { string: 2, fret: 3 },
        { string: 3, fret: 6 },
        { string: 4, fret: 7 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ];
      expect(isPlayableVoicing(positions)).toBe(false);
    });

    it("returns true for all open strings", () => {
      const positions: GuitarFretPosition[] = [
        { string: 1, fret: 0 },
        { string: 2, fret: 0 },
        { string: 3, fret: 0 },
        { string: 4, fret: 0 },
        { string: 5, fret: 0 },
        { string: 6, fret: 0 },
      ];
      expect(isPlayableVoicing(positions)).toBe(true);
    });

    it("ignores muted strings in calculation", () => {
      const positions: GuitarFretPosition[] = [
        { string: 1, fret: 5 },
        { string: 2, fret: -1 },
        { string: 3, fret: 6 },
        { string: 4, fret: -1 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ];
      expect(isPlayableVoicing(positions)).toBe(true);
    });
  });

  describe("getVSystemPosition", () => {
    it("returns V-6 when root is on string 6", () => {
      const positions: GuitarFretPosition[] = [
        { string: 1, fret: 0 },
        { string: 2, fret: 0 },
        { string: 3, fret: 1 },
        { string: 4, fret: 2 },
        { string: 5, fret: 2 },
        { string: 6, fret: 0, isRoot: true },
      ];
      expect(getVSystemPosition(positions)).toBe("V-6");
    });

    it("returns V-5 when root is on string 5", () => {
      const positions: GuitarFretPosition[] = [
        { string: 1, fret: 0 },
        { string: 2, fret: 1 },
        { string: 3, fret: 0 },
        { string: 4, fret: 2 },
        { string: 5, fret: 0, isRoot: true },
        { string: 6, fret: -1 },
      ];
      expect(getVSystemPosition(positions)).toBe("V-5");
    });

    it("returns undefined when no root is marked", () => {
      const positions: GuitarFretPosition[] = [
        { string: 1, fret: 0 },
        { string: 2, fret: 0 },
        { string: 3, fret: 0 },
        { string: 4, fret: 0 },
        { string: 5, fret: 0 },
        { string: 6, fret: 0 },
      ];
      expect(getVSystemPosition(positions)).toBeUndefined();
    });
  });

  describe("getStringGroup", () => {
    it("returns top4 for strings 1-4", () => {
      const positions: GuitarFretPosition[] = [
        { string: 1, fret: 2 },
        { string: 2, fret: 3 },
        { string: 3, fret: 2 },
        { string: 4, fret: 0 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ];
      expect(getStringGroup(positions)).toBe("top4");
    });

    it("returns bottom4 for strings 3-6", () => {
      const positions: GuitarFretPosition[] = [
        { string: 1, fret: -1 },
        { string: 2, fret: -1 },
        { string: 3, fret: 0 },
        { string: 4, fret: 1 },
        { string: 5, fret: 2 },
        { string: 6, fret: 2 },
      ];
      expect(getStringGroup(positions)).toBe("bottom4");
    });

    it("returns spread for non-adjacent strings", () => {
      const positions: GuitarFretPosition[] = [
        { string: 1, fret: 0 },
        { string: 2, fret: -1 },
        { string: 3, fret: 2 },
        { string: 4, fret: -1 },
        { string: 5, fret: 3 },
        { string: 6, fret: -1 },
      ];
      expect(getStringGroup(positions)).toBe("spread");
    });
  });

  describe("generateVoicingsForChord", () => {
    const cmaj7 = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);
    const dm7 = createChord("Dm7", "D", "min7", ["D", "F", "A", "C"]);
    const g7 = createChord("G7", "G", "7", ["G", "B", "D", "F"]);

    it("generates voicings for Cmaj7", () => {
      const voicings = generateVoicingsForChord(cmaj7);
      expect(voicings.length).toBeGreaterThan(0);
    });

    it("generates voicings for Dm7", () => {
      const voicings = generateVoicingsForChord(dm7);
      expect(voicings.length).toBeGreaterThan(0);
    });

    it("generates voicings for G7", () => {
      const voicings = generateVoicingsForChord(g7);
      expect(voicings.length).toBeGreaterThan(0);
    });

    it("respects type filter", () => {
      const voicings = generateVoicingsForChord(cmaj7, { types: ["open"] });
      voicings.forEach((v) => {
        expect(v.type).toBe("open");
      });
    });

    it("respects difficulty filter", () => {
      const voicings = generateVoicingsForChord(cmaj7, {
        maxDifficulty: "beginner",
      });
      voicings.forEach((v) => {
        expect(v.difficulty).toBe("beginner");
      });
    });

    it("respects fret range filter", () => {
      const voicings = generateVoicingsForChord(cmaj7, {
        fretRange: { min: 5, max: 10 },
      });
      voicings.forEach((v) => {
        const maxFret = Math.max(
          ...v.positions.filter((p) => p.fret >= 0).map((p) => p.fret),
        );
        expect(maxFret).toBeGreaterThanOrEqual(5);
        expect(maxFret).toBeLessThanOrEqual(10);
      });
    });

    it("all generated voicings are playable", () => {
      const voicings = generateVoicingsForChord(cmaj7);
      voicings.forEach((v) => {
        expect(isPlayableVoicing(v.positions)).toBe(true);
      });
    });
  });

  describe("getOpenVoicings", () => {
    it("returns open chord voicings for C major", () => {
      const cMajor = createChord("C", "C", "maj", ["C", "E", "G"]);
      const voicings = getOpenVoicings(cMajor);
      expect(voicings.length).toBeGreaterThan(0);
      voicings.forEach((v) => {
        expect(v.type).toBe("open");
      });
    });

    it("returns open chord voicings for Am", () => {
      const aMinor = createChord("Am", "A", "min", ["A", "C", "E"]);
      const voicings = getOpenVoicings(aMinor);
      expect(voicings.length).toBeGreaterThan(0);
    });
  });

  describe("getBarreVoicings", () => {
    it("returns barre chord voicings for F major", () => {
      const fMajor = createChord("F", "F", "maj", ["F", "A", "C"]);
      const voicings = getBarreVoicings(fMajor);
      expect(voicings.length).toBeGreaterThan(0);
      voicings.forEach((v) => {
        expect(v.type).toBe("barre");
        expect(v.isBarreChord).toBe(true);
      });
    });

    it("returns barre chord voicings for Bm", () => {
      const bMinor = createChord("Bm", "B", "min", ["B", "D", "F#"]);
      const voicings = getBarreVoicings(bMinor);
      expect(voicings.length).toBeGreaterThan(0);
    });
  });

  describe("getShellVoicings", () => {
    it("returns shell voicings for Cmaj7", () => {
      const cmaj7 = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);
      const voicings = getShellVoicings(cmaj7);
      expect(voicings.length).toBeGreaterThan(0);
      voicings.forEach((v) => {
        expect(["shell", "rootless"]).toContain(v.type);
      });
    });

    it("returns shell voicings for Dm7", () => {
      const dm7 = createChord("Dm7", "D", "min7", ["D", "F", "A", "C"]);
      const voicings = getShellVoicings(dm7);
      expect(voicings.length).toBeGreaterThan(0);
    });

    it("returns shell voicings for G7", () => {
      const g7 = createChord("G7", "G", "7", ["G", "B", "D", "F"]);
      const voicings = getShellVoicings(g7);
      expect(voicings.length).toBeGreaterThan(0);
    });
  });

  describe("getDrop2Voicings", () => {
    it("returns drop2 voicings for Cmaj7", () => {
      const cmaj7 = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);
      const voicings = getDrop2Voicings(cmaj7);
      expect(voicings.length).toBeGreaterThan(0);
      voicings.forEach((v) => {
        expect(v.type).toBe("drop2");
        expect(v.voicingStructure).toBe("drop2");
      });
    });
  });

  describe("getDrop3Voicings", () => {
    it("returns drop3 voicings for Cmaj7", () => {
      const cmaj7 = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);
      const voicings = getDrop3Voicings(cmaj7);
      expect(voicings.length).toBeGreaterThan(0);
      voicings.forEach((v) => {
        expect(v.type).toBe("drop3");
        expect(v.voicingStructure).toBe("drop3");
      });
    });
  });

  describe("sortVoicingsByPriority", () => {
    it("sorts beginner voicings before advanced", () => {
      const cmaj7 = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);
      const voicings = generateVoicingsForChord(cmaj7);
      const sorted = sortVoicingsByPriority(voicings);

      // Find indices of different difficulty levels
      const beginnerIdx = sorted.findIndex((v) => v.difficulty === "beginner");
      const advancedIdx = sorted.findIndex((v) => v.difficulty === "advanced");

      if (beginnerIdx !== -1 && advancedIdx !== -1) {
        expect(beginnerIdx).toBeLessThan(advancedIdx);
      }
    });

    it("sorts open voicings before barre within same difficulty", () => {
      const cMajor = createChord("C", "C", "maj", ["C", "E", "G"]);
      const voicings = generateVoicingsForChord(cMajor, {
        maxDifficulty: "intermediate",
      });
      const sorted = sortVoicingsByPriority(voicings);

      const openIdx = sorted.findIndex((v) => v.type === "open");
      const barreIdx = sorted.findIndex((v) => v.type === "barre");

      if (openIdx !== -1 && barreIdx !== -1) {
        expect(openIdx).toBeLessThan(barreIdx);
      }
    });
  });

  describe("voicing properties", () => {
    it("voicings have valid V-System positions", () => {
      const cmaj7 = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);
      const voicings = generateVoicingsForChord(cmaj7);

      const validVPositions = ["V-1", "V-2", "V-3", "V-4", "V-5", "V-6"];

      voicings.forEach((v) => {
        if (v.vSystem) {
          expect(validVPositions).toContain(v.vSystem);
        }
      });
    });

    it("voicings have valid string groups", () => {
      const cmaj7 = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);
      const voicings = generateVoicingsForChord(cmaj7);

      const validStringGroups = ["top4", "inner4", "bottom4", "spread"];

      voicings.forEach((v) => {
        if (v.stringGroup) {
          expect(validStringGroups).toContain(v.stringGroup);
        }
      });
    });

    it("voicings have exactly 6 positions", () => {
      const cmaj7 = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);
      const voicings = generateVoicingsForChord(cmaj7);

      voicings.forEach((v) => {
        expect(v.positions).toHaveLength(6);
      });
    });

    it("positions have valid string numbers", () => {
      const cmaj7 = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);
      const voicings = generateVoicingsForChord(cmaj7);

      voicings.forEach((v) => {
        v.positions.forEach((p, i) => {
          expect(p.string).toBe(i + 1);
        });
      });
    });
  });
});
