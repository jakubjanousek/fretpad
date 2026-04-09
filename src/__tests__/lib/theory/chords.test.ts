import { describe, expect, it } from "vitest";
import {
  getGuideTones,
  getIntervalName,
  isChordTone,
  isGuideTone,
  isRoot,
  parseChordSymbol,
} from "@/lib/theory/chords";
import type { Chord } from "@/lib/types";

describe("parseChordSymbol", () => {
  describe("major chords", () => {
    it("parses C major", () => {
      const chord = parseChordSymbol("C");
      expect(chord).not.toBeNull();
      expect(chord?.root).toBe("C");
      expect(chord?.quality).toBe("maj");
      expect(chord?.notes).toContain("C");
      expect(chord?.notes).toContain("E");
      expect(chord?.notes).toContain("G");
    });

    it("parses Cmaj", () => {
      const chord = parseChordSymbol("Cmaj");
      expect(chord).not.toBeNull();
      expect(chord?.quality).toBe("maj");
    });

    it("parses Cmaj7", () => {
      const chord = parseChordSymbol("Cmaj7");
      expect(chord).not.toBeNull();
      expect(chord?.root).toBe("C");
      expect(chord?.quality).toBe("maj7");
      expect(chord?.notes).toHaveLength(4);
      expect(chord?.notes).toContain("B"); // major 7th
    });

    it("parses Cmaj9", () => {
      const chord = parseChordSymbol("Cmaj9");
      expect(chord).not.toBeNull();
      expect(chord?.quality).toBe("maj9");
    });
  });

  describe("minor chords", () => {
    it("parses Dm", () => {
      const chord = parseChordSymbol("Dm");
      expect(chord).not.toBeNull();
      expect(chord?.root).toBe("D");
      expect(chord?.quality).toBe("min");
      expect(chord?.notes).toContain("F"); // minor 3rd
    });

    it("parses Dm7", () => {
      const chord = parseChordSymbol("Dm7");
      expect(chord).not.toBeNull();
      expect(chord?.root).toBe("D");
      expect(chord?.quality).toBe("min7");
      expect(chord?.notes).toContain("F"); // minor 3rd
      expect(chord?.notes).toContain("C"); // minor 7th
    });

    it("parses Am9", () => {
      const chord = parseChordSymbol("Am9");
      expect(chord).not.toBeNull();
      expect(chord?.quality).toBe("min9");
    });

    it("parses Cmin", () => {
      const chord = parseChordSymbol("Cmin");
      expect(chord).not.toBeNull();
      expect(chord?.quality).toBe("min");
    });
  });

  describe("dominant chords", () => {
    it("parses G7", () => {
      const chord = parseChordSymbol("G7");
      expect(chord).not.toBeNull();
      expect(chord?.root).toBe("G");
      expect(chord?.quality).toBe("7");
      expect(chord?.notes).toContain("B"); // major 3rd
      expect(chord?.notes).toContain("F"); // minor 7th
    });

    it("parses C9", () => {
      const chord = parseChordSymbol("C9");
      expect(chord).not.toBeNull();
      expect(chord?.quality).toBe("9");
    });
  });

  describe("diminished and half-diminished chords", () => {
    it("parses Cdim", () => {
      const chord = parseChordSymbol("Cdim");
      expect(chord).not.toBeNull();
      expect(chord?.quality).toBe("dim");
    });

    it("parses Cdim7", () => {
      const chord = parseChordSymbol("Cdim7");
      expect(chord).not.toBeNull();
      expect(chord?.quality).toBe("dim7");
    });

    it("does not suggest Whole Tone scale for diminished chords", () => {
      const chord = parseChordSymbol("Cdim");
      expect(chord).not.toBeNull();
      expect(chord?.suggestedScales).toContain("C Diminished");
      expect(chord?.suggestedScales).not.toContain("C Whole Tone");
    });

    it("parses Cm7b5", () => {
      const chord = parseChordSymbol("Cm7b5");
      expect(chord).not.toBeNull();
      expect(chord?.quality).toBe("min7b5");
    });
  });

  describe("other chord types", () => {
    it("parses Caug", () => {
      const chord = parseChordSymbol("Caug");
      expect(chord).not.toBeNull();
      expect(chord?.quality).toBe("aug");
    });

    it("parses Csus2", () => {
      const chord = parseChordSymbol("Csus2");
      expect(chord).not.toBeNull();
      expect(chord?.quality).toBe("sus2");
    });

    it("parses Csus4", () => {
      const chord = parseChordSymbol("Csus4");
      expect(chord).not.toBeNull();
      expect(chord?.quality).toBe("sus4");
    });

    it("parses C6", () => {
      const chord = parseChordSymbol("C6");
      expect(chord).not.toBeNull();
      expect(chord?.quality).toBe("6");
    });

    it("parses Cm6", () => {
      const chord = parseChordSymbol("Cm6");
      expect(chord).not.toBeNull();
      expect(chord?.quality).toBe("min6");
    });

    it("parses Cadd9", () => {
      const chord = parseChordSymbol("Cadd9");
      expect(chord).not.toBeNull();
      // tonal returns empty type for add9 chords, which maps to "maj"
      // The chord still contains the correct notes (C, E, G, D)
      expect(chord?.notes).toContain("C");
      expect(chord?.notes).toContain("E");
      expect(chord?.notes).toContain("G");
      expect(chord?.notes).toContain("D");
    });
  });

  describe("sharps and flats", () => {
    it("parses F#m7", () => {
      const chord = parseChordSymbol("F#m7");
      expect(chord).not.toBeNull();
      expect(chord?.root).toBe("F#");
      expect(chord?.quality).toBe("min7");
    });

    it("parses Bbmaj7", () => {
      const chord = parseChordSymbol("Bbmaj7");
      expect(chord).not.toBeNull();
      expect(chord?.root).toBe("Bb");
      expect(chord?.quality).toBe("maj7");
    });

    it("parses Ab7", () => {
      const chord = parseChordSymbol("Ab7");
      expect(chord).not.toBeNull();
      expect(chord?.root).toBe("Ab");
      expect(chord?.quality).toBe("7");
    });
  });

  describe("invalid input", () => {
    it("returns null for invalid chord symbol", () => {
      expect(parseChordSymbol("XYZ")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(parseChordSymbol("")).toBeNull();
    });
  });

  describe("suggested scales", () => {
    it("includes suggested scales for major chords", () => {
      const chord = parseChordSymbol("C");
      expect(chord?.suggestedScales).toContain("C Major");
      expect(chord?.suggestedScales).toContain("C Lydian");
    });

    it("includes suggested scales for minor 7 chords", () => {
      const chord = parseChordSymbol("Dm7");
      expect(chord?.suggestedScales).toContain("D Dorian");
      expect(chord?.suggestedScales).toContain("D Aeolian");
    });

    it("includes suggested scales for dominant 7 chords", () => {
      const chord = parseChordSymbol("G7");
      expect(chord?.suggestedScales).toContain("G Mixolydian");
    });
  });
});

describe("getGuideTones", () => {
  it("returns 3rd and 7th for maj7 chord", () => {
    const notes = ["C", "E", "G", "B"];
    const intervals = ["1P", "3M", "5P", "7M"];
    const guideTones = getGuideTones(notes, intervals, "maj7");
    expect(guideTones).toContain("E");
    expect(guideTones).toContain("B");
    expect(guideTones).toHaveLength(2);
  });

  it("returns 3rd and 7th for min7 chord", () => {
    const notes = ["D", "F", "A", "C"];
    const intervals = ["1P", "3m", "5P", "7m"];
    const guideTones = getGuideTones(notes, intervals, "min7");
    expect(guideTones).toContain("F");
    expect(guideTones).toContain("C");
    expect(guideTones).toHaveLength(2);
  });

  it("returns 3rd and 6th for 6 chord", () => {
    const notes = ["C", "E", "G", "A"];
    const intervals = ["1P", "3M", "5P", "6M"];
    const guideTones = getGuideTones(notes, intervals, "6");
    expect(guideTones).toContain("E");
    expect(guideTones).toContain("A");
    expect(guideTones).toHaveLength(2);
  });

  it("returns sus note for sus4 chord", () => {
    const notes = ["C", "F", "G"];
    const intervals = ["1P", "4P", "5P"];
    const guideTones = getGuideTones(notes, intervals, "sus4");
    expect(guideTones).toContain("F");
  });
});

describe("getIntervalName", () => {
  it("returns 1 for unison", () => {
    expect(getIntervalName("C", "C")).toBe("1");
  });

  it("returns b3 for minor third", () => {
    expect(getIntervalName("C", "Eb")).toBe("b3");
  });

  it("returns 3 for major third", () => {
    expect(getIntervalName("C", "E")).toBe("3");
  });

  it("returns 5 for perfect fifth", () => {
    expect(getIntervalName("C", "G")).toBe("5");
  });

  it("returns b7 for minor seventh", () => {
    expect(getIntervalName("C", "Bb")).toBe("b7");
  });

  it("returns 7 for major seventh", () => {
    expect(getIntervalName("C", "B")).toBe("7");
  });

  it("returns #4 for augmented fourth", () => {
    expect(getIntervalName("C", "F#")).toBe("#4");
  });

  it("returns b5 for diminished fifth", () => {
    expect(getIntervalName("C", "Gb")).toBe("b5");
  });
});

describe("isChordTone", () => {
  const cmaj7: Chord = {
    symbol: "Cmaj7",
    root: "C",
    quality: "maj7",
    notes: ["C", "E", "G", "B"],
    guideTones: ["E", "B"],
    suggestedScales: ["C Major"],
  };

  it("returns true for chord tones", () => {
    expect(isChordTone(cmaj7, "C")).toBe(true);
    expect(isChordTone(cmaj7, "E")).toBe(true);
    expect(isChordTone(cmaj7, "G")).toBe(true);
    expect(isChordTone(cmaj7, "B")).toBe(true);
  });

  it("returns false for non-chord tones", () => {
    expect(isChordTone(cmaj7, "D")).toBe(false);
    expect(isChordTone(cmaj7, "F")).toBe(false);
    expect(isChordTone(cmaj7, "A")).toBe(false);
  });

  it("matches chord tones with same spelling", () => {
    // Note: tonal's Note.pitchClass returns string names, not numeric classes
    // So F# and Gb are NOT considered equivalent in current implementation
    const fSharpChord: Chord = {
      symbol: "F#",
      root: "F#",
      quality: "maj",
      notes: ["F#", "A#", "C#"],
      guideTones: ["A#"],
      suggestedScales: ["F# Major"],
    };
    expect(isChordTone(fSharpChord, "F#")).toBe(true);
    expect(isChordTone(fSharpChord, "A#")).toBe(true);
    expect(isChordTone(fSharpChord, "C#")).toBe(true);
  });
});

describe("isGuideTone", () => {
  const dm7: Chord = {
    symbol: "Dm7",
    root: "D",
    quality: "min7",
    notes: ["D", "F", "A", "C"],
    guideTones: ["F", "C"],
    suggestedScales: ["D Dorian"],
  };

  it("returns true for guide tones", () => {
    expect(isGuideTone(dm7, "F")).toBe(true);
    expect(isGuideTone(dm7, "C")).toBe(true);
  });

  it("returns false for non-guide tones", () => {
    expect(isGuideTone(dm7, "D")).toBe(false);
    expect(isGuideTone(dm7, "A")).toBe(false);
    expect(isGuideTone(dm7, "G")).toBe(false);
  });
});

describe("isRoot", () => {
  const g7: Chord = {
    symbol: "G7",
    root: "G",
    quality: "7",
    notes: ["G", "B", "D", "F"],
    guideTones: ["B", "F"],
    suggestedScales: ["G Mixolydian"],
  };

  it("returns true for root note", () => {
    expect(isRoot(g7, "G")).toBe(true);
  });

  it("returns false for non-root notes", () => {
    expect(isRoot(g7, "B")).toBe(false);
    expect(isRoot(g7, "D")).toBe(false);
    expect(isRoot(g7, "F")).toBe(false);
    expect(isRoot(g7, "C")).toBe(false);
  });
});

describe("slash chords", () => {
  describe("inversions (bass note is a chord tone)", () => {
    it("parses C/G (2nd inversion)", () => {
      const chord = parseChordSymbol("C/G");
      expect(chord).not.toBeNull();
      expect(chord?.symbol).toBe("C/G");
      expect(chord?.root).toBe("C");
      expect(chord?.quality).toBe("maj");
      expect(chord?.notes).toEqual(["C", "E", "G"]);
      expect(chord?.bassNote).toBe("G");
    });

    it("parses C/E (1st inversion)", () => {
      const chord = parseChordSymbol("C/E");
      expect(chord).not.toBeNull();
      expect(chord?.root).toBe("C");
      expect(chord?.bassNote).toBe("E");
      expect(chord?.notes).toContain("E");
    });

    it("parses Cmaj7/B (3rd inversion)", () => {
      const chord = parseChordSymbol("Cmaj7/B");
      expect(chord).not.toBeNull();
      expect(chord?.root).toBe("C");
      expect(chord?.quality).toBe("maj7");
      expect(chord?.bassNote).toBe("B");
      expect(chord?.notes).toEqual(["C", "E", "G", "B"]);
    });

    it("parses D/F# (1st inversion with sharp bass)", () => {
      const chord = parseChordSymbol("D/F#");
      expect(chord).not.toBeNull();
      expect(chord?.root).toBe("D");
      expect(chord?.quality).toBe("maj");
      expect(chord?.bassNote).toBe("F#");
    });
  });

  describe("compound chords (bass note is NOT a chord tone)", () => {
    it("parses F/G", () => {
      const chord = parseChordSymbol("F/G");
      expect(chord).not.toBeNull();
      expect(chord?.root).toBe("F");
      expect(chord?.quality).toBe("maj");
      expect(chord?.notes).toEqual(["F", "A", "C"]);
      expect(chord?.bassNote).toBe("G");
    });

    it("parses Am/G", () => {
      const chord = parseChordSymbol("Am/G");
      expect(chord).not.toBeNull();
      expect(chord?.root).toBe("A");
      expect(chord?.quality).toBe("min");
      expect(chord?.notes).not.toContain("G");
      expect(chord?.bassNote).toBe("G");
    });
  });

  describe("slash chords with sharps and flats", () => {
    it("parses F#m7/E", () => {
      const chord = parseChordSymbol("F#m7/E");
      expect(chord).not.toBeNull();
      expect(chord?.root).toBe("F#");
      expect(chord?.quality).toBe("min7");
      expect(chord?.bassNote).toBe("E");
    });

    it("parses Bbmaj7/A", () => {
      const chord = parseChordSymbol("Bbmaj7/A");
      expect(chord).not.toBeNull();
      expect(chord?.root).toBe("Bb");
      expect(chord?.quality).toBe("maj7");
      expect(chord?.bassNote).toBe("A");
    });
  });

  describe("non-slash chords have no bassNote", () => {
    it("C has no bassNote", () => {
      const chord = parseChordSymbol("C");
      expect(chord).not.toBeNull();
      expect(chord?.bassNote).toBeUndefined();
    });

    it("Dm7 has no bassNote", () => {
      const chord = parseChordSymbol("Dm7");
      expect(chord).not.toBeNull();
      expect(chord?.bassNote).toBeUndefined();
    });
  });

  describe("scale suggestions based on upper structure", () => {
    it("F/G suggests F major scales", () => {
      const chord = parseChordSymbol("F/G");
      expect(chord?.suggestedScales).toContain("F Major");
      expect(chord?.suggestedScales).toContain("F Lydian");
    });

    it("Am/G suggests A minor scales", () => {
      const chord = parseChordSymbol("Am/G");
      expect(chord?.suggestedScales).toContain("A Dorian");
      expect(chord?.suggestedScales).toContain("A Aeolian");
    });
  });

  describe("guide tones from upper structure", () => {
    it("Cmaj7/B has guide tones E and B", () => {
      const chord = parseChordSymbol("Cmaj7/B");
      expect(chord?.guideTones).toEqual(["E", "B"]);
    });

    it("Dm7/C has guide tones F and C", () => {
      const chord = parseChordSymbol("Dm7/C");
      expect(chord?.guideTones).toEqual(["F", "C"]);
    });
  });
});
