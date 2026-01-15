import { describe, expect, it } from "vitest";
import {
  generateFretboardLayout,
  getFretNoteColor,
  getFretNoteTextColor,
  getFretNotesForChord,
  getNoteAtFret,
} from "@/lib/fretboard";
import type { Chord, FretNote } from "@/lib/types";
import { STANDARD_TUNING } from "@/lib/types";

describe("getNoteAtFret", () => {
  it("returns open string note at fret 0", () => {
    expect(getNoteAtFret("E", 0)).toBe("E");
    expect(getNoteAtFret("B", 0)).toBe("B");
    expect(getNoteAtFret("G", 0)).toBe("G");
    expect(getNoteAtFret("D", 0)).toBe("D");
    expect(getNoteAtFret("A", 0)).toBe("A");
  });

  it("calculates notes correctly on high E string", () => {
    expect(getNoteAtFret("E", 1)).toBe("F");
    expect(getNoteAtFret("E", 2)).toBe("F#");
    expect(getNoteAtFret("E", 3)).toBe("G");
    expect(getNoteAtFret("E", 5)).toBe("A");
    expect(getNoteAtFret("E", 7)).toBe("B");
    expect(getNoteAtFret("E", 12)).toBe("E"); // octave
  });

  it("calculates notes correctly on A string", () => {
    expect(getNoteAtFret("A", 2)).toBe("B");
    expect(getNoteAtFret("A", 3)).toBe("C");
    expect(getNoteAtFret("A", 5)).toBe("D");
    expect(getNoteAtFret("A", 7)).toBe("E");
  });

  it("wraps around at octave", () => {
    expect(getNoteAtFret("C", 12)).toBe("C");
    expect(getNoteAtFret("G", 12)).toBe("G");
  });

  it("handles frets beyond 12", () => {
    expect(getNoteAtFret("E", 15)).toBe("G");
    expect(getNoteAtFret("E", 24)).toBe("E");
  });
});

describe("generateFretboardLayout", () => {
  it("generates standard tuning layout by default", () => {
    const layout = generateFretboardLayout();
    // String 0 (high E)
    expect(layout[0][0]).toBe("E");
    expect(layout[0][1]).toBe("F");
    // String 1 (B)
    expect(layout[1][0]).toBe("B");
    // String 5 (low E)
    expect(layout[5][0]).toBe("E");
  });

  it("generates correct number of frets", () => {
    const layout = generateFretboardLayout(12);
    expect(layout[0]).toHaveLength(13); // 0 through 12 = 13 positions
  });

  it("generates correct number of strings", () => {
    const layout = generateFretboardLayout();
    expect(layout).toHaveLength(6);
  });

  it("respects custom number of frets", () => {
    const layout = generateFretboardLayout(24);
    expect(layout[0]).toHaveLength(25); // 0 through 24
  });

  it("respects custom tuning", () => {
    const dropD: typeof STANDARD_TUNING = ["E", "B", "G", "D", "A", "D"];
    const layout = generateFretboardLayout(12, dropD);
    expect(layout[5][0]).toBe("D"); // Low string is now D
  });
});

describe("getFretNotesForChord", () => {
  const cmaj7: Chord = {
    symbol: "Cmaj7",
    root: "C",
    quality: "maj7",
    notes: ["C", "E", "G", "B"],
    guideTones: ["E", "B"],
    suggestedScales: ["C Major"],
  };

  it("returns fret notes for chord tones", () => {
    const fretNotes = getFretNotesForChord(cmaj7);
    expect(fretNotes.length).toBeGreaterThan(0);

    // All returned notes should be chord tones
    for (const fn of fretNotes) {
      expect(["C", "E", "G", "B"]).toContain(fn.note);
    }
  });

  it("marks root notes correctly", () => {
    const fretNotes = getFretNotesForChord(cmaj7);
    const rootNotes = fretNotes.filter((fn) => fn.isRoot);

    expect(rootNotes.length).toBeGreaterThan(0);
    for (const rn of rootNotes) {
      expect(rn.note).toBe("C");
    }
  });

  it("marks guide tones correctly", () => {
    const fretNotes = getFretNotesForChord(cmaj7);
    const guideToneNotes = fretNotes.filter((fn) => fn.isGuideTone);

    expect(guideToneNotes.length).toBeGreaterThan(0);
    for (const gt of guideToneNotes) {
      expect(["E", "B"]).toContain(gt.note);
    }
  });

  it("marks all chord tones", () => {
    const fretNotes = getFretNotesForChord(cmaj7);

    for (const fn of fretNotes) {
      expect(fn.isChordTone).toBe(true);
    }
  });

  it("assigns correct interval names", () => {
    const fretNotes = getFretNotesForChord(cmaj7);

    const cNote = fretNotes.find((fn) => fn.note === "C");
    expect(cNote?.interval).toBe("1");

    const eNote = fretNotes.find((fn) => fn.note === "E");
    expect(eNote?.interval).toBe("3");

    const gNote = fretNotes.find((fn) => fn.note === "G");
    expect(gNote?.interval).toBe("5");

    const bNote = fretNotes.find((fn) => fn.note === "B");
    expect(bNote?.interval).toBe("7");
  });

  it("uses 1-indexed string numbers", () => {
    const fretNotes = getFretNotesForChord(cmaj7);

    for (const fn of fretNotes) {
      expect(fn.string).toBeGreaterThanOrEqual(1);
      expect(fn.string).toBeLessThanOrEqual(6);
    }
  });

  it("respects numFrets option", () => {
    const fretNotes = getFretNotesForChord(cmaj7, { numFrets: 5 });

    for (const fn of fretNotes) {
      expect(fn.fret).toBeLessThanOrEqual(5);
    }
  });

  describe("with scale tones", () => {
    it("includes scale tones when requested", () => {
      const fretNotes = getFretNotesForChord(cmaj7, {
        includeScale: true,
        scaleName: "C Major",
      });

      const scaleTones = fretNotes.filter((fn) => fn.isScaleTone);
      expect(scaleTones.length).toBeGreaterThan(0);
    });

    it("scale tones are not chord tones", () => {
      const fretNotes = getFretNotesForChord(cmaj7, {
        includeScale: true,
        scaleName: "C Major",
      });

      const scaleTones = fretNotes.filter((fn) => fn.isScaleTone);
      for (const st of scaleTones) {
        expect(st.isChordTone).toBe(false);
      }
    });

    it("does not include scale tones by default", () => {
      const fretNotes = getFretNotesForChord(cmaj7);
      const scaleTones = fretNotes.filter((fn) => fn.isScaleTone);
      expect(scaleTones).toHaveLength(0);
    });
  });
});

describe("getFretNoteColor", () => {
  it("returns orange for root", () => {
    const note: FretNote = {
      string: 1,
      fret: 0,
      note: "C",
      interval: "1",
      isRoot: true,
      isChordTone: true,
      isGuideTone: false,
      isScaleTone: false,
    };
    expect(getFretNoteColor(note)).toBe("bg-orange-500");
  });

  it("returns blue for guide tone (non-root)", () => {
    const note: FretNote = {
      string: 1,
      fret: 0,
      note: "E",
      interval: "3",
      isRoot: false,
      isChordTone: true,
      isGuideTone: true,
      isScaleTone: false,
    };
    expect(getFretNoteColor(note)).toBe("bg-blue-500");
  });

  it("returns emerald for other chord tones", () => {
    const note: FretNote = {
      string: 1,
      fret: 0,
      note: "G",
      interval: "5",
      isRoot: false,
      isChordTone: true,
      isGuideTone: false,
      isScaleTone: false,
    };
    expect(getFretNoteColor(note)).toBe("bg-emerald-500");
  });

  it("returns slate-400 for scale tones", () => {
    const note: FretNote = {
      string: 1,
      fret: 0,
      note: "D",
      interval: "2",
      isRoot: false,
      isChordTone: false,
      isGuideTone: false,
      isScaleTone: true,
    };
    expect(getFretNoteColor(note)).toBe("bg-slate-400");
  });

  it("returns slate-200 for inactive notes", () => {
    const note: FretNote = {
      string: 1,
      fret: 0,
      note: "X",
      interval: "?",
      isRoot: false,
      isChordTone: false,
      isGuideTone: false,
      isScaleTone: false,
    };
    expect(getFretNoteColor(note)).toBe("bg-slate-200");
  });

  it("root takes precedence over guide tone", () => {
    // A root can also be a chord tone - root color should win
    const note: FretNote = {
      string: 1,
      fret: 0,
      note: "C",
      interval: "1",
      isRoot: true,
      isChordTone: true,
      isGuideTone: true, // unusual but possible
      isScaleTone: false,
    };
    expect(getFretNoteColor(note)).toBe("bg-orange-500");
  });
});

describe("getFretNoteTextColor", () => {
  it("returns white text for root", () => {
    const note: FretNote = {
      string: 1,
      fret: 0,
      note: "C",
      interval: "1",
      isRoot: true,
      isChordTone: true,
      isGuideTone: false,
      isScaleTone: false,
    };
    expect(getFretNoteTextColor(note)).toBe("text-white");
  });

  it("returns white text for guide tones", () => {
    const note: FretNote = {
      string: 1,
      fret: 0,
      note: "E",
      interval: "3",
      isRoot: false,
      isChordTone: true,
      isGuideTone: true,
      isScaleTone: false,
    };
    expect(getFretNoteTextColor(note)).toBe("text-white");
  });

  it("returns white text for chord tones", () => {
    const note: FretNote = {
      string: 1,
      fret: 0,
      note: "G",
      interval: "5",
      isRoot: false,
      isChordTone: true,
      isGuideTone: false,
      isScaleTone: false,
    };
    expect(getFretNoteTextColor(note)).toBe("text-white");
  });

  it("returns white text for scale tones", () => {
    const note: FretNote = {
      string: 1,
      fret: 0,
      note: "D",
      interval: "2",
      isRoot: false,
      isChordTone: false,
      isGuideTone: false,
      isScaleTone: true,
    };
    expect(getFretNoteTextColor(note)).toBe("text-white");
  });

  it("returns slate text for inactive notes", () => {
    const note: FretNote = {
      string: 1,
      fret: 0,
      note: "X",
      interval: "?",
      isRoot: false,
      isChordTone: false,
      isGuideTone: false,
      isScaleTone: false,
    };
    expect(getFretNoteTextColor(note)).toBe("text-slate-600");
  });
});
