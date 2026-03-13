import { beforeEach, describe, expect, it } from "vitest";
import {
  addRecentPreset,
  type CustomPreset,
  loadCustomPresets,
  loadRecentPresets,
  type RecentPreset,
  saveCustomPresets,
  saveRecentPresets,
} from "@/lib/persistence/customPresets";
import { PRESET_PROGRESSIONS } from "@/lib/theory/presets";

const samplePreset: CustomPreset = {
  id: "test-1",
  name: "My Preset",
  progression: PRESET_PROGRESSIONS["ii-V-I in C"],
  createdAt: Date.now(),
};

describe("customPresets", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("saveCustomPresets / loadCustomPresets", () => {
    it("roundtrips custom presets", () => {
      saveCustomPresets([samplePreset]);
      const loaded = loadCustomPresets();
      expect(loaded).toHaveLength(1);
      expect(loaded[0]?.name).toBe("My Preset");
      expect(loaded[0]?.id).toBe("test-1");
    });

    it("returns empty array when nothing stored", () => {
      expect(loadCustomPresets()).toEqual([]);
    });

    it("filters out invalid entries", () => {
      localStorage.setItem(
        "fretpad-custom-presets",
        JSON.stringify([
          samplePreset,
          { invalid: true },
          { id: "x", name: "y" }, // missing progression
        ]),
      );
      const loaded = loadCustomPresets();
      expect(loaded).toHaveLength(1);
    });

    it("returns empty array for corrupted data", () => {
      localStorage.setItem("fretpad-custom-presets", "not json");
      expect(loadCustomPresets()).toEqual([]);
    });

    it("returns empty array for non-array data", () => {
      localStorage.setItem(
        "fretpad-custom-presets",
        JSON.stringify({ not: "array" }),
      );
      expect(loadCustomPresets()).toEqual([]);
    });
  });

  describe("saveRecentPresets / loadRecentPresets", () => {
    const sampleRecent: RecentPreset = {
      key: "ii-V-I in C",
      type: "builtin",
      timestamp: Date.now(),
    };

    it("roundtrips recent presets", () => {
      saveRecentPresets([sampleRecent]);
      const loaded = loadRecentPresets();
      expect(loaded).toHaveLength(1);
      expect(loaded[0]?.key).toBe("ii-V-I in C");
    });

    it("returns empty array when nothing stored", () => {
      expect(loadRecentPresets()).toEqual([]);
    });
  });

  describe("addRecentPreset", () => {
    it("adds a preset to recents", () => {
      const result = addRecentPreset("ii-V-I in C", "builtin");
      expect(result).toHaveLength(1);
      expect(result[0]?.key).toBe("ii-V-I in C");
    });

    it("moves existing preset to front", () => {
      addRecentPreset("first", "builtin");
      addRecentPreset("second", "builtin");
      const result = addRecentPreset("first", "builtin");

      expect(result[0]?.key).toBe("first");
      expect(result[1]?.key).toBe("second");
      expect(result).toHaveLength(2);
    });

    it("limits to 5 recent presets", () => {
      for (let i = 0; i < 7; i++) {
        addRecentPreset(`preset-${i}`, "builtin");
      }
      const loaded = loadRecentPresets();
      expect(loaded).toHaveLength(5);
      // Most recent should be first
      expect(loaded[0]?.key).toBe("preset-6");
    });
  });
});
