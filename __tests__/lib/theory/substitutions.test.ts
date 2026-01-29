import { describe, expect, it } from "vitest";
import { parseChordSymbol } from "@/lib/theory/chords";
import { getSubstitutions } from "@/lib/theory/substitutions";
import type { Chord } from "@/lib/types";

function parseChord(symbol: string): Chord {
  const chord = parseChordSymbol(symbol);
  if (!chord) throw new Error(`Failed to parse chord: ${symbol}`);
  return chord;
}

describe("getSubstitutions", () => {
  describe("tritone substitution", () => {
    it("suggests tritone sub for dominant 7th chords", () => {
      const g7 = parseChord("G7");
      const subs = getSubstitutions(g7);
      const tritoneSub = subs.find((s) => s.type === "Tritone sub");
      expect(tritoneSub).toBeDefined();
      // G7 tritone sub is Db7
      expect(tritoneSub?.symbol).toBe("Db7");
    });

    it("suggests tritone sub for dominant 9th chords", () => {
      const c9 = parseChord("C9");
      const subs = getSubstitutions(c9);
      const tritoneSub = subs.find((s) => s.type === "Tritone sub");
      expect(tritoneSub).toBeDefined();
    });

    it("does not suggest tritone sub for non-dominant chords", () => {
      const cmaj7 = parseChord("Cmaj7");
      const subs = getSubstitutions(cmaj7);
      const tritoneSub = subs.find((s) => s.type === "Tritone sub");
      expect(tritoneSub).toBeUndefined();
    });
  });

  describe("relative major/minor", () => {
    it("suggests relative major for minor chords", () => {
      const dm7 = parseChord("Dm7");
      const subs = getSubstitutions(dm7);
      const relSub = subs.find((s) => s.type === "Relative major");
      expect(relSub).toBeDefined();
      // Dm7 relative major is Fmaj7
      expect(relSub?.symbol).toBe("Fmaj7");
    });

    it("suggests relative minor for major chords", () => {
      const cmaj7 = parseChord("Cmaj7");
      const subs = getSubstitutions(cmaj7);
      const relSub = subs.find((s) => s.type === "Relative minor");
      expect(relSub).toBeDefined();
      // Cmaj7 relative minor is Am7
      expect(relSub?.symbol).toBe("Am7");
    });
  });

  describe("parallel major/minor", () => {
    it("suggests parallel minor for major chords", () => {
      const cmaj7 = parseChord("Cmaj7");
      const subs = getSubstitutions(cmaj7);
      const parSub = subs.find((s) => s.type === "Parallel minor");
      expect(parSub).toBeDefined();
      expect(parSub?.symbol).toBe("Cm7");
    });

    it("suggests parallel major for minor chords", () => {
      const am7 = parseChord("Am7");
      const subs = getSubstitutions(am7);
      const parSub = subs.find((s) => s.type === "Parallel major");
      expect(parSub).toBeDefined();
      expect(parSub?.symbol).toBe("Amaj7");
    });
  });

  describe("diminished approach", () => {
    it("suggests diminished approach chord", () => {
      const cmaj7 = parseChord("Cmaj7");
      const subs = getSubstitutions(cmaj7);
      const dimSub = subs.find((s) => s.type === "Diminished approach");
      expect(dimSub).toBeDefined();
      expect(dimSub?.symbol).toBe("Bdim7");
    });
  });

  describe("secondary dominant", () => {
    it("suggests secondary dominant (V7 of chord)", () => {
      const dm7 = parseChord("Dm7");
      const subs = getSubstitutions(dm7);
      const secDom = subs.find((s) => s.type === "Secondary dominant");
      expect(secDom).toBeDefined();
      // V7 of Dm7 is A7
      expect(secDom?.symbol).toBe("A7");
    });
  });

  describe("all substitutions have parsed chords", () => {
    it("all substitutions have valid parsed chord", () => {
      const chords = ["C", "Dm7", "G7", "Cmaj7", "Am", "F#m7b5", "Bb7"];
      for (const symbol of chords) {
        const chord = parseChord(symbol);
        const subs = getSubstitutions(chord);
        for (const sub of subs) {
          expect(sub.chord).not.toBeNull();
          expect(sub.symbol).toBeTruthy();
          expect(sub.type).toBeTruthy();
          expect(sub.description).toBeTruthy();
        }
      }
    });
  });
});
