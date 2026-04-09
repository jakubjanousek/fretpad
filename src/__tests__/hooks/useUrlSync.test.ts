// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildUrlParams, parseUrlParams } from "@/hooks/useUrlSync";
import { PRESET_PROGRESSIONS } from "@/lib/theory";

const iiVI = PRESET_PROGRESSIONS["ii-V-I in C"];

describe("useUrlSync helpers", () => {
  describe("buildUrlParams", () => {
    it("encodes single-chord bars separated by pipe", () => {
      const params = buildUrlParams(iiVI, 120);
      // ii-V-I in C is | Dm7 | G7 | Cmaj7 | Cmaj7 |
      expect(params.get("chords")).toBe("Dm7|G7|Cmaj7|Cmaj7");
    });

    it("encodes multi-chord bars with spaces", () => {
      const progression = {
        ...iiVI,
        bars: [
          {
            id: "1",
            totalBeats: 4,
            chords: [
              { chord: "Dm7", beats: 2 },
              { chord: "G7", beats: 2 },
            ],
          },
          {
            id: "2",
            totalBeats: 4,
            chords: [{ chord: "Cmaj7", beats: 4 }],
          },
        ],
      };
      const params = buildUrlParams(progression, 120);
      expect(params.get("chords")).toBe("Dm7 G7|Cmaj7");
    });

    it("includes tempo param", () => {
      const params = buildUrlParams(iiVI, 145);
      expect(params.get("tempo")).toBe("145");
    });

    it("omits tempo when it is 120 (default)", () => {
      const params = buildUrlParams(iiVI, 120);
      expect(params.has("tempo")).toBe(false);
    });

    it("includes name param when progression has a non-empty name", () => {
      const named = { ...iiVI, name: "My Jazz Turnaround" };
      const params = buildUrlParams(named, 120);
      expect(params.get("name")).toBe("My Jazz Turnaround");
    });

    it("omits name param when name is empty", () => {
      const unnamed = { ...iiVI, name: "" };
      const params = buildUrlParams(unnamed, 120);
      expect(params.has("name")).toBe(false);
    });
  });

  describe("parseUrlParams", () => {
    it("parses chords and tempo from URL params", () => {
      const params = new URLSearchParams("chords=Dm7|G7|Cmaj7|Cmaj7&tempo=140");
      const result = parseUrlParams(params);
      expect(result).not.toBeNull();
      const bars = result?.progression.bars;
      expect(bars).toHaveLength(4);
      expect(bars?.[0]?.chords[0]?.chord).toBe("Dm7");
      expect(result?.tempo).toBe(140);
    });

    it("defaults tempo to 120 when omitted", () => {
      const params = new URLSearchParams("chords=Cmaj7");
      const result = parseUrlParams(params);
      expect(result).not.toBeNull();
      expect(result?.tempo).toBe(120);
    });

    it("returns null when chords param is missing", () => {
      const params = new URLSearchParams("tempo=120");
      const result = parseUrlParams(params);
      expect(result).toBeNull();
    });

    it("returns null when chords param is empty", () => {
      const params = new URLSearchParams("chords=");
      const result = parseUrlParams(params);
      expect(result).toBeNull();
    });

    it("handles multi-chord bars (space-separated within pipe)", () => {
      const params = new URLSearchParams("chords=Dm7 G7|Cmaj7");
      const result = parseUrlParams(params);
      expect(result).not.toBeNull();
      const bars = result?.progression.bars;
      expect(bars).toHaveLength(2);
      const firstBar = bars?.[0];
      expect(firstBar?.chords).toHaveLength(2);
      expect(firstBar?.chords[0]?.chord).toBe("Dm7");
      expect(firstBar?.chords[1]?.chord).toBe("G7");
    });

    it("roundtrips through buildUrlParams", () => {
      const params = buildUrlParams(iiVI, 135);
      const result = parseUrlParams(params);
      expect(result).not.toBeNull();
      expect(result?.tempo).toBe(135);
      expect(result?.progression.bars).toHaveLength(iiVI.bars.length);
      const parsedBars = result?.progression.bars ?? [];
      for (let i = 0; i < iiVI.bars.length; i++) {
        const originalChords = iiVI.bars[i]?.chords.map((c) => c.chord);
        const parsedChords = parsedBars[i]?.chords.map((c) => c.chord) ?? [];
        expect(parsedChords).toEqual(originalChords);
      }
    });

    it("ignores invalid tempo values", () => {
      const params = new URLSearchParams("chords=Cmaj7&tempo=abc");
      const result = parseUrlParams(params);
      expect(result).not.toBeNull();
      expect(result?.tempo).toBe(120);
    });

    it("returns null for completely invalid chord symbols", () => {
      const params = new URLSearchParams("chords=XYZ123");
      const result = parseUrlParams(params);
      expect(result).toBeNull();
    });

    it("reads name from URL params into progression.name", () => {
      const params = new URLSearchParams("chords=Dm7|G7|Cmaj7&name=My+Blues");
      const result = parseUrlParams(params);
      expect(result?.progression.name).toBe("My Blues");
    });

    it("sets empty name when name param is missing", () => {
      const params = new URLSearchParams("chords=Dm7|G7|Cmaj7");
      const result = parseUrlParams(params);
      expect(result?.progression.name).toBe("");
    });

    it("roundtrips name through buildUrlParams/parseUrlParams", () => {
      const named = { ...iiVI, name: "Cool Progression" };
      const params = buildUrlParams(named, 120);
      const result = parseUrlParams(params);
      expect(result?.progression.name).toBe("Cool Progression");
    });
  });

  describe("buildQueryString", () => {
    it("includes name when non-empty", async () => {
      const { buildQueryString } = await import("@/hooks/useUrlSync");
      const named = { ...iiVI, name: "My Turnaround" };
      const qs = buildQueryString(named, 120);
      expect(qs).toContain("name=My+Turnaround");
    });

    it("omits name when empty", async () => {
      const { buildQueryString } = await import("@/hooks/useUrlSync");
      const unnamed = { ...iiVI, name: "" };
      const qs = buildQueryString(unnamed, 120);
      expect(qs).not.toContain("name=");
    });
  });

  describe("syncStateToUrl", () => {
    let replaceStateSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      replaceStateSpy = vi.spyOn(window.history, "replaceState");
    });

    afterEach(() => {
      window.history.replaceState({}, "", window.location.pathname);
      replaceStateSpy.mockRestore();
    });

    it("keeps pipes unencoded in the URL", async () => {
      const { syncStateToUrl } = await import("@/hooks/useUrlSync");
      syncStateToUrl(iiVI, 120);

      const raw = window.location.search;
      expect(raw).toContain("chords=Dm7|G7|Cmaj7|Cmaj7");
      expect(raw).not.toContain("%7C");
    });

    it("uses replaceState (no history entries)", async () => {
      const { syncStateToUrl } = await import("@/hooks/useUrlSync");
      syncStateToUrl(iiVI, 120);
      expect(replaceStateSpy).toHaveBeenCalled();
    });
  });
});
