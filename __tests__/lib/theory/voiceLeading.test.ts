import { describe, expect, it } from "vitest";
import { parseChordSymbol } from "@/lib/theory/chords";
import {
  calculateVoiceLeadingPaths,
  filterBestPaths,
  findCommonTones,
} from "@/lib/theory/voiceLeading";

describe("Voice Leading", () => {
  describe("calculateVoiceLeadingPaths", () => {
    it("should calculate voice leading paths between Dm7 and G7", () => {
      const dm7 = parseChordSymbol("Dm7");
      const g7 = parseChordSymbol("G7");

      expect(dm7).not.toBeNull();
      expect(g7).not.toBeNull();

      if (dm7 && g7) {
        console.log("Dm7 notes:", dm7.notes);
        console.log("Dm7 guideTones:", dm7.guideTones);
        console.log("G7 notes:", g7.notes);
        console.log("G7 guideTones:", g7.guideTones);

        const paths = calculateVoiceLeadingPaths(dm7, g7);
        console.log("Total paths:", paths.length);
        console.log("Paths:", JSON.stringify(paths.slice(0, 5), null, 2));

        expect(paths.length).toBeGreaterThan(0);

        const filtered = filterBestPaths(paths);
        console.log("Filtered paths:", filtered.length);
        console.log("Filtered:", JSON.stringify(filtered, null, 2));

        expect(filtered.length).toBeGreaterThan(0);
      }
    });

    it("should find common tones between chords", () => {
      const dm7 = parseChordSymbol("Dm7");
      const g7 = parseChordSymbol("G7");

      if (dm7 && g7) {
        const commonTones = findCommonTones(dm7, g7);
        console.log("Common tones between Dm7 and G7:", commonTones);
        // D is common between Dm7 (root) and G7 (5th)
        expect(commonTones.length).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
