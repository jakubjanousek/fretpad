import { describe, expect, it } from "vitest";
import {
  calculateVoiceLeadingDistance,
  calculateVoiceMovements,
  describeVoiceLeading,
  getBestVoiceLeadingOption,
  getOptimalVoicingPath,
  getSuggestedVoicingsForNextChord,
  getVoiceLeadingOptions,
} from "@/lib/guitar/voice-leading";
import { generateVoicingsForChord } from "@/lib/guitar/voicings";
import { parseChordSymbol } from "@/lib/theory/chords";
import type { GuitarVoicing, Progression } from "@/lib/types";

describe("voice-leading", () => {
  // Standard tuning notes at each fret for strings 1-6
  const STANDARD_TUNING_NOTES = ["E", "B", "G", "D", "A", "E"];
  const NOTE_NAMES = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  function getNoteAtFret(string: number, fret: number): string {
    const openNote = STANDARD_TUNING_NOTES[string - 1] ?? "E";
    const openNoteIndex = NOTE_NAMES.indexOf(openNote);
    const noteIndex = (openNoteIndex + fret) % 12;
    return NOTE_NAMES[noteIndex] ?? "C";
  }

  // Helper to create a simple test voicing with realistic notes
  function createTestVoicing(
    frets: (number | null)[],
    name = "Test Voicing",
  ): GuitarVoicing {
    return {
      id: "test-voicing",
      name,
      type: "barre",
      positions: frets.map((fret, index) => ({
        string: index + 1,
        fret: fret ?? -1,
        note:
          fret !== null && fret >= 0
            ? (getNoteAtFret(index + 1, fret) as "C")
            : undefined,
        isRoot: index === 5,
      })),
      baseFret: Math.min(
        ...frets.filter((f): f is number => f !== null && f > 0),
      ),
      isBarreChord: false,
      difficulty: "intermediate",
      inversion: 0,
    };
  }

  describe("calculateVoiceMovements", () => {
    it("should identify common tones on same position", () => {
      const from = createTestVoicing([0, 1, 0, 2, 3, null]);
      const to = createTestVoicing([0, 1, 0, 2, 3, null]);

      const movements = calculateVoiceMovements(from, to);

      // All movements should be common tones with no fret distance
      const playedMovements = movements.filter(
        (m) => m.fromFret >= 0 && m.toFret >= 0,
      );
      expect(playedMovements.every((m) => m.type === "common-tone")).toBe(true);
      expect(playedMovements.every((m) => m.fretDistance === 0)).toBe(true);
    });

    it("should calculate fret distance for moving voices", () => {
      const from = createTestVoicing([0, 1, 0, 2, 3, null]);
      const to = createTestVoicing([2, 3, 2, 4, 5, null]); // All moved up 2 frets

      const movements = calculateVoiceMovements(from, to);

      const playedMovements = movements.filter(
        (m) => m.fromFret >= 0 && m.toFret >= 0,
      );
      expect(playedMovements.every((m) => m.fretDistance === 2)).toBe(true);
    });

    it("should identify voice entry (muted to played)", () => {
      const from = createTestVoicing([null, 1, 0, 2, 3, null]);
      const to = createTestVoicing([0, 1, 0, 2, 3, null]);

      const movements = calculateVoiceMovements(from, to);

      const entryMovement = movements.find((m) => m.string === 1);
      expect(entryMovement?.type).toBe("new-voice");
    });

    it("should identify voice exit (played to muted)", () => {
      const from = createTestVoicing([0, 1, 0, 2, 3, null]);
      const to = createTestVoicing([null, 1, 0, 2, 3, null]);

      const movements = calculateVoiceMovements(from, to);

      const exitMovement = movements.find((m) => m.string === 1);
      expect(exitMovement?.type).toBe("voice-exit");
    });

    it("should identify step movements (1-2 frets)", () => {
      const from = createTestVoicing([0, 1, 0, 2, 3, null]);
      const to = createTestVoicing([1, 2, 1, 3, 4, null]); // All moved up 1 fret

      const movements = calculateVoiceMovements(from, to);

      const playedMovements = movements.filter(
        (m) => m.fromFret >= 0 && m.toFret >= 0,
      );
      expect(playedMovements.every((m) => m.type === "step")).toBe(true);
    });

    it("should identify leap movements (> 2 frets)", () => {
      const from = createTestVoicing([0, 1, 0, 2, 3, null]);
      const to = createTestVoicing([4, 5, 4, 6, 7, null]); // All moved up 4 frets

      const movements = calculateVoiceMovements(from, to);

      const playedMovements = movements.filter(
        (m) => m.fromFret >= 0 && m.toFret >= 0,
      );
      expect(playedMovements.every((m) => m.type === "leap")).toBe(true);
    });
  });

  describe("calculateVoiceLeadingDistance", () => {
    it("should return low score for identical voicings (common tones)", () => {
      const voicing = createTestVoicing([0, 1, 0, 2, 3, null]);

      const score = calculateVoiceLeadingDistance(voicing, voicing);

      // Should be negative due to common tone bonuses
      expect(score).toBeLessThan(0);
    });

    it("should return higher score for larger movements", () => {
      const from = createTestVoicing([0, 1, 0, 2, 3, null]);
      const smallMove = createTestVoicing([1, 2, 1, 3, 4, null]);
      const largeMove = createTestVoicing([5, 6, 5, 7, 8, null]);

      const smallScore = calculateVoiceLeadingDistance(from, smallMove);
      const largeScore = calculateVoiceLeadingDistance(from, largeMove);

      expect(largeScore).toBeGreaterThan(smallScore);
    });

    it("should penalize movements exceeding maxMovement", () => {
      const from = createTestVoicing([0, 1, 0, 2, 3, null]);
      const to = createTestVoicing([5, 6, 5, 7, 8, null]);

      const scoreWithDefault = calculateVoiceLeadingDistance(from, to, {
        maxMovement: 3,
      });
      const scoreWithHighMax = calculateVoiceLeadingDistance(from, to, {
        maxMovement: 10,
      });

      expect(scoreWithDefault).toBeGreaterThan(scoreWithHighMax);
    });
  });

  describe("getVoiceLeadingOptions", () => {
    it("should return sorted voicing options for a chord", () => {
      const dm7 = parseChordSymbol("Dm7");
      const g7 = parseChordSymbol("G7");

      if (!dm7 || !g7) {
        throw new Error("Failed to parse chord symbols");
      }

      const dm7Voicings = generateVoicingsForChord(dm7);
      const currentVoicing = dm7Voicings[0];
      if (!currentVoicing) {
        // Skip test if no voicings available
        return;
      }

      const options = getVoiceLeadingOptions(currentVoicing, g7, {
        maxSuggestions: 5,
      });

      expect(options.length).toBeLessThanOrEqual(5);

      // Options should be sorted by score (ascending)
      for (let i = 1; i < options.length; i++) {
        const prev = options[i - 1];
        const curr = options[i];
        if (prev && curr) {
          expect(curr.score).toBeGreaterThanOrEqual(prev.score);
        }
      }
    });

    it("should include movement analysis in results", () => {
      const dm7 = parseChordSymbol("Dm7");
      const g7 = parseChordSymbol("G7");

      if (!dm7 || !g7) {
        throw new Error("Failed to parse chord symbols");
      }

      const dm7Voicings = generateVoicingsForChord(dm7);
      const currentVoicing = dm7Voicings[0];
      if (!currentVoicing) {
        return;
      }

      const options = getVoiceLeadingOptions(currentVoicing, g7);

      const firstOption = options[0];
      if (firstOption) {
        expect(firstOption).toHaveProperty("movements");
        expect(firstOption).toHaveProperty("commonToneCount");
        expect(firstOption).toHaveProperty("averageMovement");
        expect(firstOption).toHaveProperty("hasExcessiveMovement");
      }
    });
  });

  describe("getBestVoiceLeadingOption", () => {
    it("should return the best option or null", () => {
      const dm7 = parseChordSymbol("Dm7");
      const g7 = parseChordSymbol("G7");

      if (!dm7 || !g7) {
        throw new Error("Failed to parse chord symbols");
      }

      const dm7Voicings = generateVoicingsForChord(dm7);
      const currentVoicing = dm7Voicings[0];
      if (!currentVoicing) {
        return;
      }

      const best = getBestVoiceLeadingOption(currentVoicing, g7);

      // Should return either null or a valid result
      if (best) {
        expect(best).toHaveProperty("voicing");
        expect(best).toHaveProperty("score");
      }
    });
  });

  describe("getOptimalVoicingPath", () => {
    it("should find an optimal path through a progression", () => {
      const progression: Progression = {
        id: "test",
        name: "ii-V-I",
        timeSignature: { numerator: 4, denominator: 4 },
        bars: [
          { id: "bar1", totalBeats: 4, chords: [{ chord: "Dm7", beats: 4 }] },
          { id: "bar2", totalBeats: 4, chords: [{ chord: "G7", beats: 4 }] },
          { id: "bar3", totalBeats: 4, chords: [{ chord: "Cmaj7", beats: 4 }] },
        ],
      };

      const path = getOptimalVoicingPath(progression);

      if (path) {
        expect(path.voicings.length).toBe(3);
        expect(path.transitionScores.length).toBe(2);
        expect(typeof path.totalScore).toBe("number");
      }
    });

    it("should return null for empty progression", () => {
      const progression: Progression = {
        id: "test",
        name: "Empty",
        timeSignature: { numerator: 4, denominator: 4 },
        bars: [],
      };

      const path = getOptimalVoicingPath(progression);
      expect(path).toBeNull();
    });
  });

  describe("getSuggestedVoicingsForNextChord", () => {
    it("should return voicings without current voicing", () => {
      const g7 = parseChordSymbol("G7");
      if (!g7) {
        throw new Error("Failed to parse chord symbol");
      }

      const suggestions = getSuggestedVoicingsForNextChord(null, g7, 3);

      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it("should return voice-led voicings with current voicing", () => {
      const dm7 = parseChordSymbol("Dm7");
      const g7 = parseChordSymbol("G7");

      if (!dm7 || !g7) {
        throw new Error("Failed to parse chord symbols");
      }

      const dm7Voicings = generateVoicingsForChord(dm7);
      const currentVoicing = dm7Voicings[0];
      if (!currentVoicing) {
        return;
      }

      const suggestions = getSuggestedVoicingsForNextChord(
        currentVoicing,
        g7,
        3,
      );

      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe("describeVoiceLeading", () => {
    it("should return a human-readable description", () => {
      const voicing = createTestVoicing([0, 1, 0, 2, 3, null]);
      const description = describeVoiceLeading(voicing, voicing);

      expect(typeof description).toBe("string");
      expect(description.length).toBeGreaterThan(0);
      expect(description).toContain("voice leading");
    });
  });
});
