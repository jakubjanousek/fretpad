import { beforeEach, describe, expect, it } from "vitest";
import type { Chord } from "@/lib/types";
import { useAppStore } from "@/state/useAppStore";

function getState() {
  return useAppStore.getState();
}

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

describe("voicingSlice", () => {
  beforeEach(() => {
    useAppStore.setState({
      showVoicings: false,
      availableVoicings: [],
      selectedVoicingIndex: 0,
      voicingFilter: {
        types: [
          "open",
          "barre",
          "shell",
          "drop2",
          "drop3",
          "triadic",
          "rootless",
        ],
        maxDifficulty: "advanced",
        maxFretStretch: 4,
      },
      vSystemFilter: {
        vPositions: [],
        stringGroups: [],
        structures: [],
        inversions: [],
      },
      voicingCache: new Map(),
    });
  });

  describe("showVoicings", () => {
    it("starts with voicings hidden", () => {
      expect(getState().showVoicings).toBe(false);
    });

    it("can toggle voicings visibility", () => {
      getState().setShowVoicings(true);
      expect(getState().showVoicings).toBe(true);

      getState().setShowVoicings(false);
      expect(getState().showVoicings).toBe(false);
    });

    it("generates voicings when turning on with a current chord", () => {
      const chord = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);
      useAppStore.setState({ currentChord: chord });

      getState().setShowVoicings(true);
      expect(getState().availableVoicings.length).toBeGreaterThan(0);
    });
  });

  describe("voicing selection", () => {
    const chord = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);

    beforeEach(() => {
      useAppStore.setState({ currentChord: chord, showVoicings: true });
      getState().refreshVoicingsForChord(chord);
    });

    it("starts with first voicing selected", () => {
      expect(getState().selectedVoicingIndex).toBe(0);
    });

    it("can select a specific voicing index", () => {
      const numVoicings = getState().availableVoicings.length;
      if (numVoicings > 1) {
        getState().selectVoicing(1);
        expect(getState().selectedVoicingIndex).toBe(1);
      }
    });

    it("does not select invalid indices", () => {
      getState().selectVoicing(-1);
      expect(getState().selectedVoicingIndex).toBe(0);

      getState().selectVoicing(1000);
      expect(getState().selectedVoicingIndex).toBe(0);
    });

    it("cycles to next voicing", () => {
      const numVoicings = getState().availableVoicings.length;
      if (numVoicings > 1) {
        getState().selectNextVoicing();
        expect(getState().selectedVoicingIndex).toBe(1);
      }
    });

    it("wraps around when cycling next", () => {
      const numVoicings = getState().availableVoicings.length;
      if (numVoicings > 0) {
        getState().selectVoicing(numVoicings - 1);
        getState().selectNextVoicing();
        expect(getState().selectedVoicingIndex).toBe(0);
      }
    });

    it("cycles to previous voicing", () => {
      const numVoicings = getState().availableVoicings.length;
      if (numVoicings > 1) {
        getState().selectVoicing(1);
        getState().selectPreviousVoicing();
        expect(getState().selectedVoicingIndex).toBe(0);
      }
    });

    it("wraps around when cycling previous from start", () => {
      const numVoicings = getState().availableVoicings.length;
      if (numVoicings > 0) {
        getState().selectPreviousVoicing();
        expect(getState().selectedVoicingIndex).toBe(numVoicings - 1);
      }
    });

    it("getSelectedVoicing returns the correct voicing", () => {
      const voicing = getState().getSelectedVoicing();
      expect(voicing).toBe(getState().availableVoicings[0]);
    });
  });

  describe("voicing generation", () => {
    it("generates voicings for a major chord", () => {
      const chord = createChord("C", "C", "maj", ["C", "E", "G"]);
      useAppStore.setState({ showVoicings: true });
      getState().refreshVoicingsForChord(chord);
      expect(getState().availableVoicings.length).toBeGreaterThan(0);
    });

    it("generates voicings for a minor chord", () => {
      const chord = createChord("Am", "A", "min", ["A", "C", "E"]);
      useAppStore.setState({ showVoicings: true });
      getState().refreshVoicingsForChord(chord);
      expect(getState().availableVoicings.length).toBeGreaterThan(0);
    });

    it("generates voicings for a dominant 7th chord", () => {
      const chord = createChord("G7", "G", "7", ["G", "B", "D", "F"]);
      useAppStore.setState({ showVoicings: true });
      getState().refreshVoicingsForChord(chord);
      expect(getState().availableVoicings.length).toBeGreaterThan(0);
    });

    it("clears voicings when chord is null", () => {
      const chord = createChord("C", "C", "maj", ["C", "E", "G"]);
      useAppStore.setState({ showVoicings: true });
      getState().refreshVoicingsForChord(chord);
      expect(getState().availableVoicings.length).toBeGreaterThan(0);

      getState().refreshVoicingsForChord(null);
      expect(getState().availableVoicings.length).toBe(0);
    });

    it("resets selection index when chord changes", () => {
      const chord1 = createChord("C", "C", "maj", ["C", "E", "G"]);
      const chord2 = createChord("G7", "G", "7", ["G", "B", "D", "F"]);

      useAppStore.setState({ showVoicings: true });
      getState().refreshVoicingsForChord(chord1);
      getState().selectVoicing(1);
      expect(getState().selectedVoicingIndex).toBe(1);

      getState().refreshVoicingsForChord(chord2);
      expect(getState().selectedVoicingIndex).toBe(0);
    });
  });

  describe("voicing filters", () => {
    const chord = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);

    beforeEach(() => {
      useAppStore.setState({ showVoicings: true, currentChord: chord });
    });

    it("filters by voicing type", () => {
      getState().refreshVoicingsForChord(chord);
      const allVoicings = getState().availableVoicings;

      getState().setVoicingTypes(["open"]);
      const openOnly = getState().availableVoicings;

      expect(openOnly.length).toBeLessThanOrEqual(allVoicings.length);
      for (const v of openOnly) {
        expect(v.type).toBe("open");
      }
    });

    it("filters by maximum difficulty", () => {
      getState().setMaxDifficulty("beginner");
      const beginnerVoicings = getState().availableVoicings;

      for (const v of beginnerVoicings) {
        expect(v.difficulty).toBe("beginner");
      }
    });
  });

  describe("V-System filters", () => {
    const chord = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);

    beforeEach(() => {
      useAppStore.setState({ showVoicings: true, currentChord: chord });
    });

    it("filters by V-System position", () => {
      getState().setVSystemPositions(["V-5", "V-6"]);
      const voicings = getState().availableVoicings;

      for (const v of voicings) {
        expect(["V-5", "V-6", undefined]).toContain(v.vSystem);
      }
    });

    it("filters by string group", () => {
      getState().setStringGroups(["top4"]);
      const voicings = getState().availableVoicings;

      for (const v of voicings) {
        expect(["top4", undefined]).toContain(v.stringGroup);
      }
    });

    it("filters by voicing structure", () => {
      getState().setVoicingStructures(["drop2"]);
      const voicings = getState().availableVoicings;

      for (const v of voicings) {
        expect(["drop2", undefined]).toContain(v.voicingStructure);
      }
    });

    it("filters by inversion", () => {
      getState().setInversions([0, 1]);
      const voicings = getState().availableVoicings;

      for (const v of voicings) {
        expect([0, 1]).toContain(v.inversion);
      }
    });

    it("resets all filters", () => {
      getState().setVSystemPositions(["V-5"]);
      getState().setStringGroups(["top4"]);
      getState().setMaxDifficulty("beginner");

      getState().resetFilters();

      expect(getState().vSystemFilter.vPositions).toEqual([]);
      expect(getState().vSystemFilter.stringGroups).toEqual([]);
      expect(getState().voicingFilter.maxDifficulty).toBe("advanced");
    });
  });

  describe("voicing cache", () => {
    const chord = createChord("Cmaj7", "C", "maj7", ["C", "E", "G", "B"]);

    beforeEach(() => {
      useAppStore.setState({ showVoicings: true, currentChord: chord });
    });

    it("caches generated voicings", () => {
      getState().refreshVoicingsForChord(chord);
      const firstResult = getState().availableVoicings;

      // Call again - should use cache
      getState().refreshVoicingsForChord(chord);
      const secondResult = getState().availableVoicings;

      expect(secondResult).toEqual(firstResult);
      expect(getState().voicingCache.size).toBe(1);
    });

    it("creates separate cache entries for different filters", () => {
      getState().refreshVoicingsForChord(chord);

      getState().setMaxDifficulty("beginner");
      getState().refreshVoicingsForChord(chord);

      expect(getState().voicingCache.size).toBe(2);
    });

    it("clears cache on demand", () => {
      getState().refreshVoicingsForChord(chord);
      expect(getState().voicingCache.size).toBeGreaterThan(0);

      getState().clearVoicingCache();
      expect(getState().voicingCache.size).toBe(0);
    });
  });
});
