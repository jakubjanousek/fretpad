import { Note } from "tonal";
import { describe, expect, it } from "vitest";
import { getFretNotesForChord } from "@/lib/fretboard";
import { getIntervalName, parseChordSymbol } from "@/lib/theory";
import type { Chord, ChordQuality } from "@/lib/types";

// Helper: parse a chord and assert it's valid
function mustParse(symbol: string): Chord {
  const chord = parseChordSymbol(symbol);
  if (!chord) throw new Error(`Failed to parse chord: ${symbol}`);
  return chord;
}

// Helper: get pitch class number using tonal (handles double flats/sharps)
function pc(note: string): number {
  return Note.chroma(note) ?? -1;
}

function pcEqual(a: string, b: string): boolean {
  return pc(a) === pc(b);
}

// ============================================================
// A. Known chord shapes (~10 tests)
// ============================================================
describe("A. Known chord shapes", () => {
  it("Cmaj7 has correct notes: C, E, G, B", () => {
    const chord = mustParse("Cmaj7");
    expect(chord.root).toBe("C");
    expect(chord.quality).toBe("maj7");
    expect(chord.notes.map(pc).sort()).toEqual([0, 4, 7, 11].sort());
  });

  it("Dm7 has correct notes: D, F, A, C", () => {
    const chord = mustParse("Dm7");
    expect(chord.root).toBe("D");
    expect(chord.quality).toBe("min7");
    expect(chord.notes.map(pc).sort()).toEqual([2, 5, 9, 0].sort());
  });

  it("G7 has correct notes: G, B, D, F", () => {
    const chord = mustParse("G7");
    expect(chord.root).toBe("G");
    expect(chord.quality).toBe("7");
    expect(chord.notes.map(pc).sort()).toEqual([7, 11, 2, 5].sort());
  });

  it("Am has correct notes: A, C, E", () => {
    const chord = mustParse("Am");
    expect(chord.root).toBe("A");
    expect(chord.quality).toBe("min");
    expect(chord.notes.map(pc).sort()).toEqual([9, 0, 4].sort());
  });

  it("E has correct notes: E, G#, B", () => {
    const chord = mustParse("E");
    expect(chord.root).toBe("E");
    expect(chord.quality).toBe("maj");
    expect(chord.notes.map(pc).sort()).toEqual([4, 8, 11].sort());
  });

  it("Cmaj7 fretboard positions include root at known locations", () => {
    const chord = mustParse("Cmaj7");
    const notes = getFretNotesForChord(chord, { numFrets: 12 });

    // Open C string (string 5 in 1-indexed = B string, but let's check string 2 fret 1 = C)
    // String 2 (B string), fret 1 = C
    const cAtS2F1 = notes.find((n) => n.string === 2 && n.fret === 1);
    expect(cAtS2F1).toBeDefined();
    expect(cAtS2F1?.isRoot).toBe(true);
    expect(cAtS2F1?.note).toBe("C");
  });

  it("G7 fretboard has G root at string 1 fret 3", () => {
    const chord = mustParse("G7");
    const notes = getFretNotesForChord(chord, { numFrets: 12 });
    const gAtS1F3 = notes.find((n) => n.string === 1 && n.fret === 3);
    expect(gAtS1F3).toBeDefined();
    expect(gAtS1F3?.isRoot).toBe(true);
  });

  it("Dm7 fretboard has D at string 4 fret 0 (open D)", () => {
    const chord = mustParse("Dm7");
    const notes = getFretNotesForChord(chord, { numFrets: 12 });
    const dAtS4F0 = notes.find((n) => n.string === 4 && n.fret === 0);
    expect(dAtS4F0).toBeDefined();
    expect(dAtS4F0?.isRoot).toBe(true);
  });

  it("non-chord-tones are excluded when scale is not enabled", () => {
    const chord = mustParse("Cmaj7");
    const notes = getFretNotesForChord(chord, { numFrets: 12 });
    // Every note should be a chord tone
    for (const n of notes) {
      expect(n.isChordTone).toBe(true);
    }
  });

  it("Cmaj7 covers all 6 strings", () => {
    const chord = mustParse("Cmaj7");
    const notes = getFretNotesForChord(chord, { numFrets: 12 });
    const strings = new Set(notes.map((n) => n.string));
    expect(strings.size).toBe(6);
  });
});

// ============================================================
// B. Guide tone classification for all chord qualities
// ============================================================
describe("B. Guide tone classification", () => {
  const qualityTests: {
    symbol: string;
    quality: ChordQuality;
    expectedGuidePCs: number[]; // pitch classes of expected guide tones
  }[] = [
    { symbol: "C", quality: "maj", expectedGuidePCs: [4] }, // 3rd only (E), no 7th
    { symbol: "Cm", quality: "min", expectedGuidePCs: [3] }, // b3 (Eb)
    { symbol: "Cmaj7", quality: "maj7", expectedGuidePCs: [4, 11] }, // E, B
    { symbol: "Cm7", quality: "min7", expectedGuidePCs: [3, 10] }, // Eb, Bb
    { symbol: "C7", quality: "7", expectedGuidePCs: [4, 10] }, // E, Bb
    { symbol: "Cdim", quality: "dim", expectedGuidePCs: [3] }, // Eb
    { symbol: "Cdim7", quality: "dim7", expectedGuidePCs: [3, 9] }, // Eb, A(=Bbb)
    { symbol: "Caug", quality: "aug", expectedGuidePCs: [4] }, // E
    { symbol: "Csus2", quality: "sus2", expectedGuidePCs: [2] }, // D (2nd replaces 3rd)
    { symbol: "Csus4", quality: "sus4", expectedGuidePCs: [5] }, // F (4th replaces 3rd)
    { symbol: "C6", quality: "6", expectedGuidePCs: [4, 9] }, // E, A (3rd + 6th)
    { symbol: "Cm6", quality: "min6", expectedGuidePCs: [3, 9] }, // Eb, A
    { symbol: "C9", quality: "9", expectedGuidePCs: [4, 10] }, // E, Bb
    { symbol: "Cmaj9", quality: "maj9", expectedGuidePCs: [4, 11] }, // E, B
    { symbol: "Cm9", quality: "min9", expectedGuidePCs: [3, 10] }, // Eb, Bb
    { symbol: "Cm7b5", quality: "min7b5", expectedGuidePCs: [3, 10] }, // Eb, Bb
  ];

  for (const { symbol, quality, expectedGuidePCs } of qualityTests) {
    it(`${symbol} has quality "${quality}" and correct guide tones`, () => {
      const chord = mustParse(symbol);
      expect(chord.quality).toBe(quality);
      const guidePCs = chord.guideTones.map(pc).sort((a, b) => a - b);
      expect(guidePCs).toEqual(expectedGuidePCs.sort((a, b) => a - b));
    });
  }
});

// ============================================================
// C. Scale overlay accuracy
// ============================================================
describe("C. Scale overlay accuracy", () => {
  it("Cmaj7 + Major scale shows correct scale tones", () => {
    const chord = mustParse("Cmaj7");
    const notes = getFretNotesForChord(chord, {
      numFrets: 12,
      includeScale: true,
      scaleName: "C Major",
    });

    // C major scale: C D E F G A B (all 7 notes)
    const cMajorPCs = [0, 2, 4, 5, 7, 9, 11];
    const allNotePCs = new Set(notes.map((n) => pc(n.note)));
    for (const scalePC of cMajorPCs) {
      expect(allNotePCs.has(scalePC)).toBe(true);
    }

    // No chromatic notes should appear (e.g., C#, D#, F#, G#, A#)
    const chromaticPCs = [1, 3, 6, 8, 10];
    for (const chromPC of chromaticPCs) {
      expect(allNotePCs.has(chromPC)).toBe(false);
    }
  });

  it("Dm7 + Dorian scale shows correct scale tones", () => {
    const chord = mustParse("Dm7");
    const notes = getFretNotesForChord(chord, {
      numFrets: 12,
      includeScale: true,
      scaleName: "D Dorian",
    });

    // D Dorian: D E F G A B C
    const dorianPCs = [2, 4, 5, 7, 9, 11, 0];
    const allNotePCs = new Set(notes.map((n) => pc(n.note)));
    for (const scalePC of dorianPCs) {
      expect(allNotePCs.has(scalePC)).toBe(true);
    }
  });

  it("G7 + Mixolydian scale shows correct scale tones", () => {
    const chord = mustParse("G7");
    const notes = getFretNotesForChord(chord, {
      numFrets: 12,
      includeScale: true,
      scaleName: "G Mixolydian",
    });

    // G Mixolydian: G A B C D E F
    const mixolydianPCs = [7, 9, 11, 0, 2, 4, 5];
    const allNotePCs = new Set(notes.map((n) => pc(n.note)));
    for (const scalePC of mixolydianPCs) {
      expect(allNotePCs.has(scalePC)).toBe(true);
    }
  });

  it("Bb7 + Mixolydian scale shows correct scale tones", () => {
    const chord = mustParse("Bb7");
    const notes = getFretNotesForChord(chord, {
      numFrets: 12,
      includeScale: true,
      scaleName: "Bb Mixolydian",
    });

    // Bb Mixolydian: Bb C D Eb F G Ab
    const bbMixPCs = [10, 0, 2, 3, 5, 7, 8];
    const allNotePCs = new Set(notes.map((n) => pc(n.note)));
    for (const scalePC of bbMixPCs) {
      expect(allNotePCs.has(scalePC)).toBe(true);
    }
  });

  it("scale tones are marked as isScaleTone, not isChordTone", () => {
    const chord = mustParse("Cmaj7");
    const notes = getFretNotesForChord(chord, {
      numFrets: 12,
      includeScale: true,
      scaleName: "C Major",
    });
    const scaleTones = notes.filter((n) => n.isScaleTone);
    for (const s of scaleTones) {
      expect(s.isChordTone).toBe(false);
    }
  });
});

// ============================================================
// D. Enharmonic / flat-root edge cases
// ============================================================
describe("D. Enharmonic / flat-root edge cases", () => {
  it("Bb7 parses correctly with root Bb", () => {
    const chord = mustParse("Bb7");
    expect(pcEqual(chord.root, "Bb")).toBe(true);
    expect(chord.quality).toBe("7");
    // Notes: Bb, D, F, Ab
    expect(chord.notes.map(pc).sort((a, b) => a - b)).toEqual(
      [10, 2, 5, 8].sort((a, b) => a - b),
    );
  });

  it("Ebmaj7 parses correctly", () => {
    const chord = mustParse("Ebmaj7");
    expect(pcEqual(chord.root, "Eb")).toBe(true);
    expect(chord.quality).toBe("maj7");
    // Notes: Eb, G, Bb, D
    expect(chord.notes.map(pc).sort((a, b) => a - b)).toEqual(
      [3, 7, 10, 2].sort((a, b) => a - b),
    );
  });

  it("F#m7 parses correctly", () => {
    const chord = mustParse("F#m7");
    expect(pcEqual(chord.root, "F#")).toBe(true);
    expect(chord.quality).toBe("min7");
  });

  it("Abmaj7 parses correctly", () => {
    const chord = mustParse("Abmaj7");
    expect(pcEqual(chord.root, "Ab")).toBe(true);
    expect(chord.quality).toBe("maj7");
  });

  it("Bb7 guide tones include 3rd (D) and b7 (Ab)", () => {
    const chord = mustParse("Bb7");
    const guidePCs = chord.guideTones.map(pc);
    expect(guidePCs).toContain(2); // D
    expect(guidePCs).toContain(8); // Ab
  });
});

// ============================================================
// E. Interval label accuracy
// ============================================================
describe("E. Interval label accuracy", () => {
  it("Cmaj7 intervals: 1, 3, 5, 7", () => {
    mustParse("Cmaj7");
    expect(getIntervalName("C", "C")).toBe("1");
    expect(getIntervalName("C", "E")).toBe("3");
    expect(getIntervalName("C", "G")).toBe("5");
    expect(getIntervalName("C", "B")).toBe("7");
  });

  it("Dm7 intervals: 1, b3, 5, b7", () => {
    expect(getIntervalName("D", "D")).toBe("1");
    expect(getIntervalName("D", "F")).toBe("b3");
    expect(getIntervalName("D", "A")).toBe("5");
    expect(getIntervalName("D", "C")).toBe("b7");
  });

  it("G7 intervals: 1, 3, 5, b7", () => {
    expect(getIntervalName("G", "G")).toBe("1");
    expect(getIntervalName("G", "B")).toBe("3");
    expect(getIntervalName("G", "D")).toBe("5");
    expect(getIntervalName("G", "F")).toBe("b7");
  });

  it("Bb7 intervals are correct (flat-root enharmonic test)", () => {
    // This is the key bug test: root is "Bb" but fretboard notes are sharp-spelled
    expect(getIntervalName("Bb", "A#")).toBe("1"); // enharmonic root
    expect(getIntervalName("Bb", "D")).toBe("3");
    expect(getIntervalName("Bb", "F")).toBe("5");
    expect(getIntervalName("Bb", "G#")).toBe("b7"); // enharmonic of Ab
  });

  it("Ebmaj7 intervals are correct (flat-root enharmonic test)", () => {
    expect(getIntervalName("Eb", "D#")).toBe("1"); // enharmonic root
    expect(getIntervalName("Eb", "G")).toBe("3");
    expect(getIntervalName("Eb", "A#")).toBe("5"); // enharmonic of Bb
    expect(getIntervalName("Eb", "D")).toBe("7");
  });
});

// ============================================================
// F. Regression snapshots
// ============================================================
describe("F. Regression snapshots", () => {
  it("Cmaj7 fret notes snapshot", () => {
    const chord = mustParse("Cmaj7");
    const notes = getFretNotesForChord(chord, { numFrets: 12 });
    const snapshot = notes.map((n) => ({
      s: n.string,
      f: n.fret,
      note: n.note,
      interval: n.interval,
      root: n.isRoot,
      guide: n.isGuideTone,
    }));
    expect(snapshot).toMatchInlineSnapshot(`
      [
        {
          "f": 0,
          "guide": true,
          "interval": "3",
          "note": "E",
          "root": false,
          "s": 1,
        },
        {
          "f": 3,
          "guide": false,
          "interval": "5",
          "note": "G",
          "root": false,
          "s": 1,
        },
        {
          "f": 7,
          "guide": true,
          "interval": "7",
          "note": "B",
          "root": false,
          "s": 1,
        },
        {
          "f": 8,
          "guide": false,
          "interval": "1",
          "note": "C",
          "root": true,
          "s": 1,
        },
        {
          "f": 12,
          "guide": true,
          "interval": "3",
          "note": "E",
          "root": false,
          "s": 1,
        },
        {
          "f": 0,
          "guide": true,
          "interval": "7",
          "note": "B",
          "root": false,
          "s": 2,
        },
        {
          "f": 1,
          "guide": false,
          "interval": "1",
          "note": "C",
          "root": true,
          "s": 2,
        },
        {
          "f": 5,
          "guide": true,
          "interval": "3",
          "note": "E",
          "root": false,
          "s": 2,
        },
        {
          "f": 8,
          "guide": false,
          "interval": "5",
          "note": "G",
          "root": false,
          "s": 2,
        },
        {
          "f": 12,
          "guide": true,
          "interval": "7",
          "note": "B",
          "root": false,
          "s": 2,
        },
        {
          "f": 0,
          "guide": false,
          "interval": "5",
          "note": "G",
          "root": false,
          "s": 3,
        },
        {
          "f": 4,
          "guide": true,
          "interval": "7",
          "note": "B",
          "root": false,
          "s": 3,
        },
        {
          "f": 5,
          "guide": false,
          "interval": "1",
          "note": "C",
          "root": true,
          "s": 3,
        },
        {
          "f": 9,
          "guide": true,
          "interval": "3",
          "note": "E",
          "root": false,
          "s": 3,
        },
        {
          "f": 12,
          "guide": false,
          "interval": "5",
          "note": "G",
          "root": false,
          "s": 3,
        },
        {
          "f": 2,
          "guide": true,
          "interval": "3",
          "note": "E",
          "root": false,
          "s": 4,
        },
        {
          "f": 5,
          "guide": false,
          "interval": "5",
          "note": "G",
          "root": false,
          "s": 4,
        },
        {
          "f": 9,
          "guide": true,
          "interval": "7",
          "note": "B",
          "root": false,
          "s": 4,
        },
        {
          "f": 10,
          "guide": false,
          "interval": "1",
          "note": "C",
          "root": true,
          "s": 4,
        },
        {
          "f": 2,
          "guide": true,
          "interval": "7",
          "note": "B",
          "root": false,
          "s": 5,
        },
        {
          "f": 3,
          "guide": false,
          "interval": "1",
          "note": "C",
          "root": true,
          "s": 5,
        },
        {
          "f": 7,
          "guide": true,
          "interval": "3",
          "note": "E",
          "root": false,
          "s": 5,
        },
        {
          "f": 10,
          "guide": false,
          "interval": "5",
          "note": "G",
          "root": false,
          "s": 5,
        },
        {
          "f": 0,
          "guide": true,
          "interval": "3",
          "note": "E",
          "root": false,
          "s": 6,
        },
        {
          "f": 3,
          "guide": false,
          "interval": "5",
          "note": "G",
          "root": false,
          "s": 6,
        },
        {
          "f": 7,
          "guide": true,
          "interval": "7",
          "note": "B",
          "root": false,
          "s": 6,
        },
        {
          "f": 8,
          "guide": false,
          "interval": "1",
          "note": "C",
          "root": true,
          "s": 6,
        },
        {
          "f": 12,
          "guide": true,
          "interval": "3",
          "note": "E",
          "root": false,
          "s": 6,
        },
      ]
    `);
  });

  it("Bb7 fret notes snapshot", () => {
    const chord = mustParse("Bb7");
    const notes = getFretNotesForChord(chord, { numFrets: 5 });
    const snapshot = notes.map((n) => ({
      s: n.string,
      f: n.fret,
      note: n.note,
      interval: n.interval,
      root: n.isRoot,
    }));
    expect(snapshot).toMatchInlineSnapshot(`
      [
        {
          "f": 1,
          "interval": "5",
          "note": "F",
          "root": false,
          "s": 1,
        },
        {
          "f": 4,
          "interval": "b7",
          "note": "G#",
          "root": false,
          "s": 1,
        },
        {
          "f": 3,
          "interval": "3",
          "note": "D",
          "root": false,
          "s": 2,
        },
        {
          "f": 1,
          "interval": "b7",
          "note": "G#",
          "root": false,
          "s": 3,
        },
        {
          "f": 3,
          "interval": "1",
          "note": "A#",
          "root": true,
          "s": 3,
        },
        {
          "f": 0,
          "interval": "3",
          "note": "D",
          "root": false,
          "s": 4,
        },
        {
          "f": 3,
          "interval": "5",
          "note": "F",
          "root": false,
          "s": 4,
        },
        {
          "f": 1,
          "interval": "1",
          "note": "A#",
          "root": true,
          "s": 5,
        },
        {
          "f": 5,
          "interval": "3",
          "note": "D",
          "root": false,
          "s": 5,
        },
        {
          "f": 1,
          "interval": "5",
          "note": "F",
          "root": false,
          "s": 6,
        },
        {
          "f": 4,
          "interval": "b7",
          "note": "G#",
          "root": false,
          "s": 6,
        },
      ]
    `);
  });

  it("Dm7 + Dorian fret notes snapshot (first 5 frets)", () => {
    const chord = mustParse("Dm7");
    const notes = getFretNotesForChord(chord, {
      numFrets: 5,
      includeScale: true,
      scaleName: "D Dorian",
    });
    const snapshot = notes.map((n) => ({
      s: n.string,
      f: n.fret,
      note: n.note,
      interval: n.interval,
      chord: n.isChordTone,
      scale: n.isScaleTone,
    }));
    expect(snapshot).toMatchInlineSnapshot(`
      [
        {
          "chord": false,
          "f": 0,
          "interval": "2",
          "note": "E",
          "s": 1,
          "scale": true,
        },
        {
          "chord": true,
          "f": 1,
          "interval": "b3",
          "note": "F",
          "s": 1,
          "scale": false,
        },
        {
          "chord": false,
          "f": 3,
          "interval": "4",
          "note": "G",
          "s": 1,
          "scale": true,
        },
        {
          "chord": true,
          "f": 5,
          "interval": "5",
          "note": "A",
          "s": 1,
          "scale": false,
        },
        {
          "chord": false,
          "f": 0,
          "interval": "6",
          "note": "B",
          "s": 2,
          "scale": true,
        },
        {
          "chord": true,
          "f": 1,
          "interval": "b7",
          "note": "C",
          "s": 2,
          "scale": false,
        },
        {
          "chord": true,
          "f": 3,
          "interval": "1",
          "note": "D",
          "s": 2,
          "scale": false,
        },
        {
          "chord": false,
          "f": 5,
          "interval": "2",
          "note": "E",
          "s": 2,
          "scale": true,
        },
        {
          "chord": false,
          "f": 0,
          "interval": "4",
          "note": "G",
          "s": 3,
          "scale": true,
        },
        {
          "chord": true,
          "f": 2,
          "interval": "5",
          "note": "A",
          "s": 3,
          "scale": false,
        },
        {
          "chord": false,
          "f": 4,
          "interval": "6",
          "note": "B",
          "s": 3,
          "scale": true,
        },
        {
          "chord": true,
          "f": 5,
          "interval": "b7",
          "note": "C",
          "s": 3,
          "scale": false,
        },
        {
          "chord": true,
          "f": 0,
          "interval": "1",
          "note": "D",
          "s": 4,
          "scale": false,
        },
        {
          "chord": false,
          "f": 2,
          "interval": "2",
          "note": "E",
          "s": 4,
          "scale": true,
        },
        {
          "chord": true,
          "f": 3,
          "interval": "b3",
          "note": "F",
          "s": 4,
          "scale": false,
        },
        {
          "chord": false,
          "f": 5,
          "interval": "4",
          "note": "G",
          "s": 4,
          "scale": true,
        },
        {
          "chord": true,
          "f": 0,
          "interval": "5",
          "note": "A",
          "s": 5,
          "scale": false,
        },
        {
          "chord": false,
          "f": 2,
          "interval": "6",
          "note": "B",
          "s": 5,
          "scale": true,
        },
        {
          "chord": true,
          "f": 3,
          "interval": "b7",
          "note": "C",
          "s": 5,
          "scale": false,
        },
        {
          "chord": true,
          "f": 5,
          "interval": "1",
          "note": "D",
          "s": 5,
          "scale": false,
        },
        {
          "chord": false,
          "f": 0,
          "interval": "2",
          "note": "E",
          "s": 6,
          "scale": true,
        },
        {
          "chord": true,
          "f": 1,
          "interval": "b3",
          "note": "F",
          "s": 6,
          "scale": false,
        },
        {
          "chord": false,
          "f": 3,
          "interval": "4",
          "note": "G",
          "s": 6,
          "scale": true,
        },
        {
          "chord": true,
          "f": 5,
          "interval": "5",
          "note": "A",
          "s": 6,
          "scale": false,
        },
      ]
    `);
  });

  it("G7 + Mixolydian fret notes snapshot (first 5 frets)", () => {
    const chord = mustParse("G7");
    const notes = getFretNotesForChord(chord, {
      numFrets: 5,
      includeScale: true,
      scaleName: "G Mixolydian",
    });
    const snapshot = notes.map((n) => ({
      s: n.string,
      f: n.fret,
      note: n.note,
      interval: n.interval,
      chord: n.isChordTone,
      scale: n.isScaleTone,
    }));
    expect(snapshot).toMatchInlineSnapshot(`
      [
        {
          "chord": false,
          "f": 0,
          "interval": "6",
          "note": "E",
          "s": 1,
          "scale": true,
        },
        {
          "chord": true,
          "f": 1,
          "interval": "b7",
          "note": "F",
          "s": 1,
          "scale": false,
        },
        {
          "chord": true,
          "f": 3,
          "interval": "1",
          "note": "G",
          "s": 1,
          "scale": false,
        },
        {
          "chord": false,
          "f": 5,
          "interval": "2",
          "note": "A",
          "s": 1,
          "scale": true,
        },
        {
          "chord": true,
          "f": 0,
          "interval": "3",
          "note": "B",
          "s": 2,
          "scale": false,
        },
        {
          "chord": false,
          "f": 1,
          "interval": "4",
          "note": "C",
          "s": 2,
          "scale": true,
        },
        {
          "chord": true,
          "f": 3,
          "interval": "5",
          "note": "D",
          "s": 2,
          "scale": false,
        },
        {
          "chord": false,
          "f": 5,
          "interval": "6",
          "note": "E",
          "s": 2,
          "scale": true,
        },
        {
          "chord": true,
          "f": 0,
          "interval": "1",
          "note": "G",
          "s": 3,
          "scale": false,
        },
        {
          "chord": false,
          "f": 2,
          "interval": "2",
          "note": "A",
          "s": 3,
          "scale": true,
        },
        {
          "chord": true,
          "f": 4,
          "interval": "3",
          "note": "B",
          "s": 3,
          "scale": false,
        },
        {
          "chord": false,
          "f": 5,
          "interval": "4",
          "note": "C",
          "s": 3,
          "scale": true,
        },
        {
          "chord": true,
          "f": 0,
          "interval": "5",
          "note": "D",
          "s": 4,
          "scale": false,
        },
        {
          "chord": false,
          "f": 2,
          "interval": "6",
          "note": "E",
          "s": 4,
          "scale": true,
        },
        {
          "chord": true,
          "f": 3,
          "interval": "b7",
          "note": "F",
          "s": 4,
          "scale": false,
        },
        {
          "chord": true,
          "f": 5,
          "interval": "1",
          "note": "G",
          "s": 4,
          "scale": false,
        },
        {
          "chord": false,
          "f": 0,
          "interval": "2",
          "note": "A",
          "s": 5,
          "scale": true,
        },
        {
          "chord": true,
          "f": 2,
          "interval": "3",
          "note": "B",
          "s": 5,
          "scale": false,
        },
        {
          "chord": false,
          "f": 3,
          "interval": "4",
          "note": "C",
          "s": 5,
          "scale": true,
        },
        {
          "chord": true,
          "f": 5,
          "interval": "5",
          "note": "D",
          "s": 5,
          "scale": false,
        },
        {
          "chord": false,
          "f": 0,
          "interval": "6",
          "note": "E",
          "s": 6,
          "scale": true,
        },
        {
          "chord": true,
          "f": 1,
          "interval": "b7",
          "note": "F",
          "s": 6,
          "scale": false,
        },
        {
          "chord": true,
          "f": 3,
          "interval": "1",
          "note": "G",
          "s": 6,
          "scale": false,
        },
        {
          "chord": false,
          "f": 5,
          "interval": "2",
          "note": "A",
          "s": 6,
          "scale": true,
        },
      ]
    `);
  });
});

// ============================================================
// G. Edge cases
// ============================================================
describe("G. Edge cases", () => {
  it("no duplicate (string, fret) positions", () => {
    const chord = mustParse("Cmaj7");
    const notes = getFretNotesForChord(chord, {
      numFrets: 12,
      includeScale: true,
      scaleName: "C Major",
    });
    const positions = notes.map((n) => `${n.string}-${n.fret}`);
    const unique = new Set(positions);
    expect(unique.size).toBe(positions.length);
  });

  it("numFrets=0 returns only open string matches", () => {
    const chord = mustParse("E");
    const notes = getFretNotesForChord(chord, { numFrets: 0 });
    for (const n of notes) {
      expect(n.fret).toBe(0);
    }
    // E major: E, G#, B — open strings in standard tuning are E, B, G, D, A, E
    // E appears on strings 1 and 6, B on string 2 — all chord tones
    expect(notes.length).toBeGreaterThan(0);
  });

  it("every chord covers all 6 strings (within 12 frets)", () => {
    const symbols = ["Cmaj7", "Dm7", "G7", "Am", "E", "Bb7", "F#m7"];
    for (const sym of symbols) {
      const chord = mustParse(sym);
      const notes = getFretNotesForChord(chord, { numFrets: 12 });
      const strings = new Set(notes.map((n) => n.string));
      expect(strings.size).toBe(6);
    }
  });

  it("ii-V-I in C produces valid fret notes for all chords", () => {
    const progression = ["Dm7", "G7", "Cmaj7"];
    for (const sym of progression) {
      const chord = mustParse(sym);
      const notes = getFretNotesForChord(chord, { numFrets: 12 });
      expect(notes.length).toBeGreaterThan(0);
      // All notes should have valid intervals (not raw tonal notation)
      for (const n of notes) {
        expect(n.interval).toMatch(/^[b#]?\d+$/);
      }
    }
  });

  it("flat-root ii-V-I (Cm7 F7 Bbmaj7) has valid intervals", () => {
    const progression = ["Cm7", "F7", "Bbmaj7"];
    for (const sym of progression) {
      const chord = mustParse(sym);
      const notes = getFretNotesForChord(chord, { numFrets: 12 });
      for (const n of notes) {
        expect(n.interval).toMatch(/^[b#]?\d+$/);
      }
    }
  });
});
