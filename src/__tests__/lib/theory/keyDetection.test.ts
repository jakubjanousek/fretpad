import { describe, expect, it } from "vitest";
import { detectKey } from "@/lib/theory/keyDetection";
import { PRESET_PROGRESSIONS } from "@/lib/theory/presets";
import type { Progression } from "@/lib/types";

describe("detectKey", () => {
  describe("major key detection", () => {
    it("detects C major for ii-V-I", () => {
      const progression = PRESET_PROGRESSIONS["ii-V-I"];
      const keys = detectKey(progression);
      expect(keys.length).toBeGreaterThan(0);
      const first = keys[0];
      expect(first).toBeDefined();
      expect(first?.root).toBe("C");
      expect(first?.mode).toBe("major");
      expect(first?.label).toBe("C Major");
    });

    it("detects C major for I-V-vi-IV", () => {
      const progression = PRESET_PROGRESSIONS["I-V-vi-IV"];
      const keys = detectKey(progression);
      expect(keys[0]?.root).toBe("C");
      expect(keys[0]?.mode).toBe("major");
    });

    it("detects G major for I-IV-V-IV", () => {
      const progression = PRESET_PROGRESSIONS["I-IV-V-IV"];
      const keys = detectKey(progression);
      expect(keys[0]?.root).toBe("G");
      expect(keys[0]?.mode).toBe("major");
    });
  });

  describe("minor key detection", () => {
    it("detects A minor for vi-IV-I-V (or C major as relative)", () => {
      const progression = PRESET_PROGRESSIONS["vi-IV-I-V"];
      const keys = detectKey(progression);
      // Should detect either C major or A minor (relative keys)
      const roots = keys.map((k) => `${k.root} ${k.mode}`);
      expect(roots.includes("C major") || roots.includes("A minor")).toBe(true);
    });
  });

  describe("roman numeral analysis", () => {
    it("provides roman numerals for ii-V-I", () => {
      const progression = PRESET_PROGRESSIONS["ii-V-I"];
      const keys = detectKey(progression);
      const cMajor = keys.find((k) => k.root === "C" && k.mode === "major");
      expect(cMajor).toBeDefined();
      // Dm7 = ii7, G7 = V7, Cmaj7 = Imaj7, Cmaj7 = Imaj7
      expect(cMajor?.romanNumerals).toEqual(["ii7", "V7", "Imaj7", "Imaj7"]);
    });
  });

  describe("confidence scoring", () => {
    it("returns confidence greater than 0", () => {
      const progression = PRESET_PROGRESSIONS["ii-V-I"];
      const keys = detectKey(progression);
      for (const key of keys) {
        expect(key.confidence).toBeGreaterThanOrEqual(0);
      }
    });

    it("returns results sorted by confidence descending", () => {
      const progression = PRESET_PROGRESSIONS["ii-V-I"];
      const keys = detectKey(progression);
      for (let i = 1; i < keys.length; i++) {
        const current = keys[i];
        const previous = keys[i - 1];
        if (current && previous) {
          expect(current.confidence).toBeLessThanOrEqual(previous.confidence);
        }
      }
    });
  });

  describe("edge cases", () => {
    it("returns empty array for empty progression", () => {
      const progression: Progression = {
        id: "test",
        name: "empty",
        timeSignature: { numerator: 4, denominator: 4 },
        bars: [],
      };
      const keys = detectKey(progression);
      expect(keys).toEqual([]);
    });

    it("respects maxResults parameter", () => {
      const progression = PRESET_PROGRESSIONS["ii-V-I"];
      const keys = detectKey(progression, 1);
      expect(keys).toHaveLength(1);
    });
  });
});
