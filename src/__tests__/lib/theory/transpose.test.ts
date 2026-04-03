import { describe, expect, it } from "vitest";
import {
  transposeChordSymbol,
  transposeProgression,
} from "@/lib/theory/transpose";
import type { Progression } from "@/lib/types";

describe("transposeChordSymbol", () => {
  it("transposes a simple major chord up", () => {
    expect(transposeChordSymbol("C", 2)).toBe("D");
  });

  it("transposes a minor 7th chord up", () => {
    expect(transposeChordSymbol("Dm7", 2)).toBe("Em7");
  });

  it("transposes a dominant 7th chord up", () => {
    expect(transposeChordSymbol("G7", 1)).toBe("Ab7");
  });

  it("transposes a maj7 chord up", () => {
    expect(transposeChordSymbol("Cmaj7", 2)).toBe("Dmaj7");
  });

  it("transposes down by semitone", () => {
    expect(transposeChordSymbol("Dm7", -1)).toBe("C#m7");
  });

  it("transposes a sharp root", () => {
    expect(transposeChordSymbol("F#m7", 2)).toBe("G#m7");
  });

  it("transposes by 0 returns same chord", () => {
    expect(transposeChordSymbol("Am", 0)).toBe("Am");
  });

  it("wraps around the octave", () => {
    expect(transposeChordSymbol("B", 1)).toBe("C");
  });

  it("returns original for unparseable input", () => {
    expect(transposeChordSymbol("XYZ", 3)).toBe("XYZ");
  });

  describe("slash chords", () => {
    it("transposes C/G up 2 semitones to D/A", () => {
      expect(transposeChordSymbol("C/G", 2)).toBe("D/A");
    });

    it("transposes Cmaj7/B up 2 semitones to Dmaj7/C#", () => {
      expect(transposeChordSymbol("Cmaj7/B", 2)).toBe("Dmaj7/C#");
    });

    it("transposes F/G up 2 semitones to G/A", () => {
      expect(transposeChordSymbol("F/G", 2)).toBe("G/A");
    });

    it("transposes D/F# down 2 semitones to C/E", () => {
      expect(transposeChordSymbol("D/F#", -2)).toBe("C/E");
    });

    it("transposes by 0 returns same slash chord", () => {
      expect(transposeChordSymbol("Am/G", 0)).toBe("Am/G");
    });
  });
});

describe("transposeProgression", () => {
  const progression: Progression = {
    id: "test",
    name: "Test",
    timeSignature: { numerator: 4, denominator: 4 },
    bars: [
      {
        id: "bar1",
        totalBeats: 4,
        chords: [{ chord: "Dm7", beats: 4 }],
      },
      {
        id: "bar2",
        totalBeats: 4,
        chords: [{ chord: "G7", beats: 4 }],
      },
      {
        id: "bar3",
        totalBeats: 4,
        chords: [{ chord: "Cmaj7", beats: 4 }],
      },
    ],
  };

  it("transposes all chords up by 2 semitones", () => {
    const result = transposeProgression(progression, 2);
    expect(result.bars.at(0)?.chords.at(0)?.chord).toBe("Em7");
    expect(result.bars.at(1)?.chords.at(0)?.chord).toBe("A7");
    expect(result.bars.at(2)?.chords.at(0)?.chord).toBe("Dmaj7");
  });

  it("preserves bar structure", () => {
    const result = transposeProgression(progression, 3);
    expect(result.bars).toHaveLength(3);
    expect(result.bars.at(0)?.id).toBe("bar1");
    expect(result.bars.at(0)?.totalBeats).toBe(4);
    expect(result.bars.at(0)?.chords.at(0)?.beats).toBe(4);
  });

  it("preserves progression metadata", () => {
    const result = transposeProgression(progression, 1);
    expect(result.id).toBe("test");
    expect(result.name).toBe("Test");
    expect(result.timeSignature).toEqual({ numerator: 4, denominator: 4 });
  });

  it("handles bars with multiple chords", () => {
    const multiChordProgression: Progression = {
      id: "multi",
      name: "Multi",
      timeSignature: { numerator: 4, denominator: 4 },
      bars: [
        {
          id: "bar1",
          totalBeats: 4,
          chords: [
            { chord: "Dm7", beats: 2 },
            { chord: "G7", beats: 2 },
          ],
        },
      ],
    };
    const result = transposeProgression(multiChordProgression, 2);
    expect(result.bars.at(0)?.chords.at(0)?.chord).toBe("Em7");
    expect(result.bars.at(0)?.chords.at(1)?.chord).toBe("A7");
  });
});
