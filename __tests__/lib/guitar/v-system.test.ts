import { describe, expect, it } from "vitest";
import {
  filterVoicings,
  getAllInversions,
  getMatchingVSystemVoicings,
  getStringGroupDescription,
  getVoicingsByInversion,
  getVoicingsByStringGroup,
  getVoicingsByStringGroups,
  getVoicingsByStructure,
  getVoicingsByVSystem,
  getVoicingsByVSystemPositions,
  getVoicingsInPosition,
  getVSystemDescription,
  getVSystemSummary,
  groupVoicingsByInversion,
  groupVoicingsByStringGroup,
  groupVoicingsByStructure,
  groupVoicingsByVSystem,
  stringToVSystem,
  vSystemToString,
} from "@/lib/guitar/v-system";
import type { Chord } from "@/lib/types";

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

describe("V-System Framework", () => {
  const cmaj7 = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);
  const dm7 = createChord("Dm7", "D", "min7", ["D", "F", "A", "C"]);
  const g7 = createChord("G7", "G", "7", ["G", "B", "D", "F"]);

  describe("getVoicingsByVSystem", () => {
    it("returns voicings filtered by V-6 position", () => {
      const voicings = getVoicingsByVSystem(cmaj7, "V-6");
      expect(voicings.length).toBeGreaterThan(0);
      voicings.forEach((v) => {
        expect(v.vSystem).toBe("V-6");
      });
    });

    it("returns voicings filtered by V-5 position", () => {
      const voicings = getVoicingsByVSystem(cmaj7, "V-5");
      expect(voicings.length).toBeGreaterThan(0);
      voicings.forEach((v) => {
        expect(v.vSystem).toBe("V-5");
      });
    });

    it("returns empty array for positions with no voicings", () => {
      // V-1 (root on high E) is less common for many chords
      const voicings = getVoicingsByVSystem(cmaj7, "V-1");
      // Should return an array (might be empty or have voicings)
      expect(Array.isArray(voicings)).toBe(true);
    });
  });

  describe("getVoicingsByVSystemPositions", () => {
    it("returns voicings filtered by multiple V-System positions", () => {
      const voicings = getVoicingsByVSystemPositions(cmaj7, ["V-5", "V-6"]);
      expect(voicings.length).toBeGreaterThan(0);
      voicings.forEach((v) => {
        expect(["V-5", "V-6"]).toContain(v.vSystem);
      });
    });
  });

  describe("groupVoicingsByVSystem", () => {
    it("groups voicings by all V-System positions", () => {
      const grouped = groupVoicingsByVSystem(cmaj7);

      expect(grouped).toHaveProperty("V-1");
      expect(grouped).toHaveProperty("V-2");
      expect(grouped).toHaveProperty("V-3");
      expect(grouped).toHaveProperty("V-4");
      expect(grouped).toHaveProperty("V-5");
      expect(grouped).toHaveProperty("V-6");

      // Each group should be an array
      for (const position of Object.keys(grouped)) {
        expect(Array.isArray(grouped[position as keyof typeof grouped])).toBe(
          true,
        );
      }
    });

    it("ensures voicings in each group match the V-System position", () => {
      const grouped = groupVoicingsByVSystem(cmaj7);

      for (const voicing of grouped["V-6"]) {
        expect(voicing.vSystem).toBe("V-6");
      }
      for (const voicing of grouped["V-5"]) {
        expect(voicing.vSystem).toBe("V-5");
      }
    });
  });

  describe("getVoicingsByStringGroup", () => {
    it("returns voicings filtered by top4 string group", () => {
      const voicings = getVoicingsByStringGroup(cmaj7, "top4");
      voicings.forEach((v) => {
        expect(v.stringGroup).toBe("top4");
      });
    });

    it("returns voicings filtered by bottom4 string group", () => {
      const voicings = getVoicingsByStringGroup(cmaj7, "bottom4");
      voicings.forEach((v) => {
        expect(v.stringGroup).toBe("bottom4");
      });
    });
  });

  describe("getVoicingsByStringGroups", () => {
    it("returns voicings filtered by multiple string groups", () => {
      const voicings = getVoicingsByStringGroups(cmaj7, ["top4", "inner4"]);
      voicings.forEach((v) => {
        expect(["top4", "inner4"]).toContain(v.stringGroup);
      });
    });
  });

  describe("groupVoicingsByStringGroup", () => {
    it("groups voicings by all string groups", () => {
      const grouped = groupVoicingsByStringGroup(cmaj7);

      expect(grouped).toHaveProperty("top4");
      expect(grouped).toHaveProperty("inner4");
      expect(grouped).toHaveProperty("bottom4");
      expect(grouped).toHaveProperty("spread");

      for (const group of Object.keys(grouped)) {
        expect(Array.isArray(grouped[group as keyof typeof grouped])).toBe(
          true,
        );
      }
    });
  });

  describe("getAllInversions", () => {
    it("returns all inversions for drop2 voicings", () => {
      const inversions = getAllInversions(cmaj7, "drop2");
      expect(inversions.length).toBeGreaterThan(0);
      inversions.forEach((v) => {
        expect(v.voicingStructure).toBe("drop2");
      });
    });

    it("can filter by string group as well", () => {
      const inversions = getAllInversions(cmaj7, "drop2", "top4");
      inversions.forEach((v) => {
        expect(v.voicingStructure).toBe("drop2");
        expect(v.stringGroup).toBe("top4");
      });
    });
  });

  describe("getVoicingsByInversion", () => {
    it("returns root position voicings", () => {
      const voicings = getVoicingsByInversion(cmaj7, 0);
      voicings.forEach((v) => {
        expect(v.inversion).toBe(0);
      });
    });

    it("returns first inversion voicings", () => {
      const voicings = getVoicingsByInversion(cmaj7, 1);
      voicings.forEach((v) => {
        expect(v.inversion).toBe(1);
      });
    });
  });

  describe("groupVoicingsByInversion", () => {
    it("groups voicings by all inversions", () => {
      const grouped = groupVoicingsByInversion(cmaj7);

      expect(grouped[0]).toBeDefined();
      expect(grouped[1]).toBeDefined();
      expect(grouped[2]).toBeDefined();
      expect(grouped[3]).toBeDefined();

      expect(Array.isArray(grouped[0])).toBe(true);
      expect(Array.isArray(grouped[1])).toBe(true);
      expect(Array.isArray(grouped[2])).toBe(true);
      expect(Array.isArray(grouped[3])).toBe(true);
    });
  });

  describe("getVoicingsByStructure", () => {
    it("returns voicings with drop2 structure", () => {
      const voicings = getVoicingsByStructure(cmaj7, "drop2");
      expect(voicings.length).toBeGreaterThan(0);
      voicings.forEach((v) => {
        expect(v.voicingStructure).toBe("drop2");
      });
    });

    it("returns voicings with close structure", () => {
      const voicings = getVoicingsByStructure(cmaj7, "close");
      expect(voicings.length).toBeGreaterThan(0);
      voicings.forEach((v) => {
        expect(v.voicingStructure).toBe("close");
      });
    });
  });

  describe("groupVoicingsByStructure", () => {
    it("groups voicings by all structures", () => {
      const grouped = groupVoicingsByStructure(cmaj7);

      expect(grouped).toHaveProperty("close");
      expect(grouped).toHaveProperty("drop2");
      expect(grouped).toHaveProperty("drop3");
      expect(grouped).toHaveProperty("drop24");
      expect(grouped).toHaveProperty("spread");
    });
  });

  describe("filterVoicings", () => {
    it("filters by V-System position", () => {
      const voicings = filterVoicings(cmaj7, { vPositions: ["V-5", "V-6"] });
      expect(voicings.length).toBeGreaterThan(0);
      voicings.forEach((v) => {
        expect(["V-5", "V-6"]).toContain(v.vSystem);
      });
    });

    it("filters by string group", () => {
      const voicings = filterVoicings(cmaj7, { stringGroups: ["top4"] });
      voicings.forEach((v) => {
        expect(v.stringGroup).toBe("top4");
      });
    });

    it("filters by voicing structure", () => {
      const voicings = filterVoicings(cmaj7, { structures: ["drop2"] });
      voicings.forEach((v) => {
        expect(v.voicingStructure).toBe("drop2");
      });
    });

    it("filters by inversion", () => {
      const voicings = filterVoicings(cmaj7, { inversions: [0, 1] });
      voicings.forEach((v) => {
        expect([0, 1]).toContain(v.inversion);
      });
    });

    it("filters by difficulty", () => {
      const voicings = filterVoicings(cmaj7, { maxDifficulty: "beginner" });
      voicings.forEach((v) => {
        expect(v.difficulty).toBe("beginner");
      });
    });

    it("combines multiple filters", () => {
      const voicings = filterVoicings(cmaj7, {
        vPositions: ["V-6"],
        structures: ["close"],
        maxDifficulty: "intermediate",
      });

      voicings.forEach((v) => {
        expect(v.vSystem).toBe("V-6");
        expect(v.voicingStructure).toBe("close");
        expect(["beginner", "intermediate"]).toContain(v.difficulty);
      });
    });

    it("filters by fret range", () => {
      const voicings = filterVoicings(cmaj7, {
        fretRange: { min: 5, max: 10 },
      });

      voicings.forEach((v) => {
        const frettedPositions = v.positions.filter((p) => p.fret > 0);
        if (frettedPositions.length > 0) {
          const maxFret = Math.max(...frettedPositions.map((p) => p.fret));
          expect(maxFret).toBeLessThanOrEqual(10);
        }
      });
    });
  });

  describe("getVSystemSummary", () => {
    it("returns counts for all V-System positions", () => {
      const summary = getVSystemSummary(cmaj7);

      expect(summary).toHaveProperty("V-1");
      expect(summary).toHaveProperty("V-2");
      expect(summary).toHaveProperty("V-3");
      expect(summary).toHaveProperty("V-4");
      expect(summary).toHaveProperty("V-5");
      expect(summary).toHaveProperty("V-6");

      // All values should be numbers
      for (const count of Object.values(summary)) {
        expect(typeof count).toBe("number");
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    it("has non-zero counts for common positions", () => {
      const summary = getVSystemSummary(cmaj7);
      // V-5 and V-6 typically have voicings for most chords
      expect(summary["V-5"] + summary["V-6"]).toBeGreaterThan(0);
    });
  });

  describe("vSystemToString", () => {
    it("converts V-System positions to string numbers", () => {
      expect(vSystemToString("V-1")).toBe(1);
      expect(vSystemToString("V-2")).toBe(2);
      expect(vSystemToString("V-3")).toBe(3);
      expect(vSystemToString("V-4")).toBe(4);
      expect(vSystemToString("V-5")).toBe(5);
      expect(vSystemToString("V-6")).toBe(6);
    });
  });

  describe("stringToVSystem", () => {
    it("converts string numbers to V-System positions", () => {
      expect(stringToVSystem(1)).toBe("V-1");
      expect(stringToVSystem(2)).toBe("V-2");
      expect(stringToVSystem(3)).toBe("V-3");
      expect(stringToVSystem(4)).toBe("V-4");
      expect(stringToVSystem(5)).toBe("V-5");
      expect(stringToVSystem(6)).toBe("V-6");
    });

    it("returns null for invalid string numbers", () => {
      expect(stringToVSystem(0)).toBeNull();
      expect(stringToVSystem(7)).toBeNull();
    });
  });

  describe("getVSystemDescription", () => {
    it("returns descriptions for all V-System positions", () => {
      expect(getVSystemDescription("V-1")).toContain("high E");
      expect(getVSystemDescription("V-5")).toContain("A string");
      expect(getVSystemDescription("V-6")).toContain("low E");
    });
  });

  describe("getStringGroupDescription", () => {
    it("returns descriptions for all string groups", () => {
      expect(getStringGroupDescription("top4")).toContain("1-4");
      expect(getStringGroupDescription("inner4")).toContain("2-5");
      expect(getStringGroupDescription("bottom4")).toContain("3-6");
      expect(getStringGroupDescription("spread")).toContain("Non-adjacent");
    });
  });

  describe("getVoicingsInPosition", () => {
    it("returns voicings within a fret range around center fret", () => {
      const voicings = getVoicingsInPosition(cmaj7, 7, 3);

      voicings.forEach((v) => {
        const frettedPositions = v.positions.filter((p) => p.fret > 0);
        if (frettedPositions.length > 0) {
          const maxFret = Math.max(...frettedPositions.map((p) => p.fret));
          const minFret = Math.min(...frettedPositions.map((p) => p.fret));
          expect(minFret).toBeGreaterThanOrEqual(4);
          expect(maxFret).toBeLessThanOrEqual(10);
        }
      });
    });
  });

  describe("getMatchingVSystemVoicings", () => {
    it("returns voicings for multiple chords in same V-System position", () => {
      const result = getMatchingVSystemVoicings([cmaj7, dm7, g7], "V-6");

      expect(result.has("Cmaj7")).toBe(true);
      expect(result.has("Dm7")).toBe(true);
      expect(result.has("G7")).toBe(true);

      // Each chord's voicings should be in V-6 position
      result.forEach((voicings) => {
        voicings.forEach((v) => {
          expect(v.vSystem).toBe("V-6");
        });
      });
    });

    it("useful for practicing ii-V-I in same position", () => {
      const result = getMatchingVSystemVoicings([dm7, g7, cmaj7], "V-5");

      // Should have entries for all three chords
      expect(result.size).toBe(3);

      // All voicings should be in V-5 position (root on A string)
      result.forEach((voicings) => {
        voicings.forEach((v) => {
          expect(v.vSystem).toBe("V-5");
        });
      });
    });
  });
});
