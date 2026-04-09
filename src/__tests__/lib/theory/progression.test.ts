import { describe, expect, it } from "vitest";
import { PRESET_PROGRESSIONS } from "@/lib/theory/presets";
import {
  createProgression,
  getAllChordsFromProgression,
  getNextChord,
  getProgressionTotalBeats,
  parseBar,
  parseProgression,
} from "@/lib/theory/progression";

describe("parseBar", () => {
  it("parses a single chord bar", () => {
    const bar = parseBar("Dm7");
    expect(bar).not.toBeNull();
    expect(bar?.chords).toHaveLength(1);
    expect(bar?.chords[0]?.chord).toBe("Dm7");
    expect(bar?.chords[0]?.beats).toBe(4);
    expect(bar?.totalBeats).toBe(4);
  });

  it("parses a bar with two chords", () => {
    const bar = parseBar("Dm7 G7");
    expect(bar).not.toBeNull();
    expect(bar?.chords).toHaveLength(2);
    expect(bar?.chords[0]?.chord).toBe("Dm7");
    expect(bar?.chords[0]?.beats).toBe(2);
    expect(bar?.chords[1]?.chord).toBe("G7");
    expect(bar?.chords[1]?.beats).toBe(2);
  });

  it("respects custom total beats", () => {
    const bar = parseBar("C", 3);
    expect(bar?.totalBeats).toBe(3);
    expect(bar?.chords[0]?.beats).toBe(3);
  });

  it("distributes beats evenly across multiple chords", () => {
    const bar = parseBar("Am Em", 4);
    expect(bar?.chords[0]?.beats).toBe(2);
    expect(bar?.chords[1]?.beats).toBe(2);
  });

  it("returns null for empty string", () => {
    expect(parseBar("")).toBeNull();
    expect(parseBar("   ")).toBeNull();
  });

  it("returns null for invalid chord symbol", () => {
    expect(parseBar("XYZ")).toBeNull();
    expect(parseBar("Dm7 XYZ")).toBeNull();
  });

  it("trims whitespace", () => {
    const bar = parseBar("  Cmaj7  ");
    expect(bar?.chords[0]?.chord).toBe("Cmaj7");
  });

  it("generates unique ID for each bar", () => {
    const bar1 = parseBar("C");
    const bar2 = parseBar("C");
    expect(bar1?.id).not.toBe(bar2?.id);
  });
});

describe("parseProgression", () => {
  describe("bar notation with pipes", () => {
    it("parses simple pipe notation", () => {
      const prog = parseProgression("| Dm7 | G7 | Cmaj7 |");
      expect(prog).not.toBeNull();
      expect(prog?.bars).toHaveLength(3);
      expect(prog?.bars[0]?.chords[0]?.chord).toBe("Dm7");
      expect(prog?.bars[1]?.chords[0]?.chord).toBe("G7");
      expect(prog?.bars[2]?.chords[0]?.chord).toBe("Cmaj7");
    });

    it("parses multiple chords per bar", () => {
      const prog = parseProgression("| Dm7 G7 | Cmaj7 |");
      expect(prog).not.toBeNull();
      expect(prog?.bars).toHaveLength(2);
      expect(prog?.bars[0]?.chords).toHaveLength(2);
      expect(prog?.bars[0]?.chords[0]?.chord).toBe("Dm7");
      expect(prog?.bars[0]?.chords[1]?.chord).toBe("G7");
    });

    it("handles leading/trailing pipes", () => {
      const prog1 = parseProgression("| C | G |");
      const prog2 = parseProgression("C | G");
      expect(prog1?.bars).toHaveLength(2);
      expect(prog2?.bars).toHaveLength(2);
    });
  });

  describe("comma notation", () => {
    it("parses comma-separated chords", () => {
      const prog = parseProgression("Dm7, G7, Cmaj7");
      expect(prog).not.toBeNull();
      expect(prog?.bars).toHaveLength(3);
      expect(prog?.bars[0]?.chords[0]?.chord).toBe("Dm7");
      expect(prog?.bars[1]?.chords[0]?.chord).toBe("G7");
      expect(prog?.bars[2]?.chords[0]?.chord).toBe("Cmaj7");
    });
  });

  describe("space notation", () => {
    it("parses space-separated chords (one per bar)", () => {
      const prog = parseProgression("C G Am F");
      expect(prog).not.toBeNull();
      expect(prog?.bars).toHaveLength(4);
    });
  });

  describe("options", () => {
    it("uses custom name", () => {
      const prog = parseProgression("| C |", { name: "Test Progression" });
      expect(prog?.name).toBe("Test Progression");
    });

    it("uses custom time signature", () => {
      const prog = parseProgression("| C |", {
        timeSignature: { numerator: 3, denominator: 4 },
      });
      expect(prog?.timeSignature).toEqual({ numerator: 3, denominator: 4 });
      expect(prog?.bars[0]?.totalBeats).toBe(3);
    });

    it("uses empty string as default name", () => {
      const prog = parseProgression("| C |");
      expect(prog?.name).toBe("");
    });

    it("uses default time signature 4/4", () => {
      const prog = parseProgression("| C |");
      expect(prog?.timeSignature).toEqual({ numerator: 4, denominator: 4 });
    });
  });

  describe("invalid input", () => {
    it("returns null for empty input", () => {
      expect(parseProgression("")).toBeNull();
    });

    it("returns null if any chord is invalid", () => {
      expect(parseProgression("| C | XYZ |")).toBeNull();
    });
  });

  it("generates unique ID for progression", () => {
    const prog1 = parseProgression("| C |");
    const prog2 = parseProgression("| C |");
    expect(prog1?.id).not.toBe(prog2?.id);
  });
});

describe("createProgression", () => {
  it("creates progression from chord symbols array", () => {
    const prog = createProgression(["Dm7", "G7", "Cmaj7"]);
    expect(prog).not.toBeNull();
    expect(prog?.bars).toHaveLength(3);
    expect(prog?.bars[0]?.chords[0]?.chord).toBe("Dm7");
    expect(prog?.bars[1]?.chords[0]?.chord).toBe("G7");
    expect(prog?.bars[2]?.chords[0]?.chord).toBe("Cmaj7");
  });

  it("each chord gets its own bar", () => {
    const prog = createProgression(["C", "G"]);
    expect(prog?.bars).toHaveLength(2);
    expect(prog?.bars[0]?.chords).toHaveLength(1);
    expect(prog?.bars[1]?.chords).toHaveLength(1);
  });

  it("uses custom options", () => {
    const prog = createProgression(["C"], {
      name: "Test",
      timeSignature: { numerator: 3, denominator: 4 },
    });
    expect(prog?.name).toBe("Test");
    expect(prog?.timeSignature).toEqual({ numerator: 3, denominator: 4 });
  });

  it("returns null for invalid chord symbol", () => {
    expect(createProgression(["C", "XYZ"])).toBeNull();
  });

  it("returns null for empty array", () => {
    expect(createProgression([])).toBeNull();
  });
});

describe("PRESET_PROGRESSIONS", () => {
  it("has ii-V-I in C preset", () => {
    const prog = PRESET_PROGRESSIONS["ii-V-I in C"];
    expect(prog).toBeDefined();
    expect(prog.name).toBe("ii-V-I in C");
    expect(prog.bars).toHaveLength(4);
  });

  it("has I-V-vi-IV in C preset", () => {
    const prog = PRESET_PROGRESSIONS["I-V-vi-IV in C"];
    expect(prog).toBeDefined();
    expect(prog.name).toBe("I-V-vi-IV in C");
    expect(prog.bars).toHaveLength(4);
  });

  it("has 12-bar blues in A preset", () => {
    const prog = PRESET_PROGRESSIONS["12-bar blues in A"];
    expect(prog).toBeDefined();
    expect(prog.name).toBe("12-bar blues in A");
    expect(prog.bars).toHaveLength(12);
  });
});

describe("getAllChordsFromProgression", () => {
  it("returns all chord symbols flattened", () => {
    const prog = parseProgression("| Dm7 G7 | Cmaj7 |");
    expect(prog).not.toBeNull();
    const chords = getAllChordsFromProgression(
      prog as NonNullable<typeof prog>,
    );
    expect(chords).toEqual(["Dm7", "G7", "Cmaj7"]);
  });

  it("returns chords in order", () => {
    const prog = PRESET_PROGRESSIONS["ii-V-I in C"];
    const chords = getAllChordsFromProgression(prog);
    expect(chords).toEqual(["Dm7", "G7", "Cmaj7", "Cmaj7"]);
  });
});

describe("getProgressionTotalBeats", () => {
  it("calculates total beats correctly", () => {
    const prog = parseProgression("| C | G | Am | F |");
    expect(prog).not.toBeNull();
    const totalBeats = getProgressionTotalBeats(
      prog as NonNullable<typeof prog>,
    );
    expect(totalBeats).toBe(16); // 4 bars * 4 beats
  });

  it("handles different time signatures", () => {
    const prog = parseProgression("| C | G |", {
      timeSignature: { numerator: 3, denominator: 4 },
    });
    expect(prog).not.toBeNull();
    const totalBeats = getProgressionTotalBeats(
      prog as NonNullable<typeof prog>,
    );
    expect(totalBeats).toBe(6); // 2 bars * 3 beats
  });

  it("handles 12-bar blues", () => {
    const prog = PRESET_PROGRESSIONS["12-bar blues in A"];
    const totalBeats = getProgressionTotalBeats(prog);
    expect(totalBeats).toBe(48); // 12 bars * 4 beats
  });
});

describe("getNextChord", () => {
  it("returns the next chord in the next bar", () => {
    // | Dm7 | G7 | Cmaj7 |
    const prog = parseProgression("| Dm7 | G7 | Cmaj7 |");
    expect(prog).not.toBeNull();
    const next = getNextChord(prog!, 0, 0);
    expect(next).not.toBeNull();
    expect(next!.symbol).toBe("G7");
  });

  it("returns the next chord within the same bar", () => {
    // | Dm7 G7 | Cmaj7 |
    const prog = parseProgression("| Dm7 G7 | Cmaj7 |");
    expect(prog).not.toBeNull();
    const next = getNextChord(prog!, 0, 0);
    expect(next).not.toBeNull();
    expect(next!.symbol).toBe("G7");
  });

  it("moves to the next bar when at the last chord in a bar", () => {
    // | Dm7 G7 | Cmaj7 |
    const prog = parseProgression("| Dm7 G7 | Cmaj7 |");
    expect(prog).not.toBeNull();
    const next = getNextChord(prog!, 0, 1);
    expect(next).not.toBeNull();
    expect(next!.symbol).toBe("Cmaj7");
  });

  it("wraps from the last bar to the first bar", () => {
    // | Dm7 | G7 | Cmaj7 |
    const prog = parseProgression("| Dm7 | G7 | Cmaj7 |");
    expect(prog).not.toBeNull();
    const next = getNextChord(prog!, 2, 0);
    expect(next).not.toBeNull();
    expect(next!.symbol).toBe("Dm7");
  });

  it("returns the same chord for a single-chord single-bar progression", () => {
    const prog = parseProgression("| Cmaj7 |");
    expect(prog).not.toBeNull();
    const next = getNextChord(prog!, 0, 0);
    expect(next).not.toBeNull();
    expect(next!.symbol).toBe("Cmaj7");
  });
});

describe("slash chords in progressions", () => {
  it("parses a bar with a slash chord", () => {
    const bar = parseBar("C/G");
    expect(bar).not.toBeNull();
    expect(bar?.chords).toHaveLength(1);
    expect(bar?.chords[0]?.chord).toBe("C/G");
    expect(bar?.chords[0]?.beats).toBe(4);
  });

  it("parses a bar with two chords including a slash chord", () => {
    const bar = parseBar("Dm7 C/G");
    expect(bar).not.toBeNull();
    expect(bar?.chords).toHaveLength(2);
    expect(bar?.chords[0]?.chord).toBe("Dm7");
    expect(bar?.chords[1]?.chord).toBe("C/G");
  });

  it("parses a full progression with slash chords using pipes", () => {
    const prog = parseProgression("| Am7 | F/G | C | C/E |");
    expect(prog).not.toBeNull();
    expect(prog?.bars).toHaveLength(4);
    expect(prog?.bars[1]?.chords[0]?.chord).toBe("F/G");
    expect(prog?.bars[3]?.chords[0]?.chord).toBe("C/E");
  });

  it("parses a progression with slash chords using commas", () => {
    const prog = parseProgression("C/G, Am/G, F, G7");
    expect(prog).not.toBeNull();
    expect(prog?.bars).toHaveLength(4);
    expect(prog?.bars[0]?.chords[0]?.chord).toBe("C/G");
    expect(prog?.bars[1]?.chords[0]?.chord).toBe("Am/G");
  });
});
