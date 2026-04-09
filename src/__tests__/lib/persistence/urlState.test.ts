import { describe, expect, it } from "vitest";
import {
  decodeStateFromUrl,
  encodeStateToUrl,
  exportProgressionToText,
  generateShareUrl,
  type ShareableState,
} from "@/lib/persistence/urlState";
import { PRESET_PROGRESSIONS } from "@/lib/theory";

const sampleState: ShareableState = {
  progression: PRESET_PROGRESSIONS["ii-V-I"],
  tempo: 120,
};

describe("urlState", () => {
  describe("encode/decode roundtrip", () => {
    it("roundtrips a valid shareable state", () => {
      const encoded = encodeStateToUrl(sampleState);
      const decoded = decodeStateFromUrl(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded?.tempo).toBe(120);
      expect(decoded?.progression.name).toBe(sampleState.progression.name);
      expect(decoded?.progression.bars.length).toBe(
        sampleState.progression.bars.length,
      );
    });

    it("produces URL-safe base64 (no +, /, or = characters)", () => {
      const encoded = encodeStateToUrl(sampleState);
      expect(encoded).not.toMatch(/[+/=]/);
    });

    it("roundtrips different tempo values", () => {
      for (const tempo of [40, 100, 200]) {
        const state: ShareableState = { ...sampleState, tempo };
        const decoded = decodeStateFromUrl(encodeStateToUrl(state));
        expect(decoded?.tempo).toBe(tempo);
      }
    });
  });

  describe("decodeStateFromUrl - invalid input", () => {
    it("returns null for empty string", () => {
      expect(decodeStateFromUrl("")).toBeNull();
    });

    it("returns null for invalid base64", () => {
      expect(decodeStateFromUrl("not-valid-base64!!!")).toBeNull();
    });

    it("returns null for oversized encoded payloads", () => {
      expect(decodeStateFromUrl("a".repeat(10001))).toBeNull();
    });

    it("returns null for valid base64 but invalid JSON", () => {
      const encoded = btoa("not json")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      expect(decodeStateFromUrl(encoded)).toBeNull();
    });

    it("returns null for valid JSON but missing required fields", () => {
      const encoded = btoa(JSON.stringify({ tempo: 120 }))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      expect(decodeStateFromUrl(encoded)).toBeNull();
    });
  });

  describe("generateShareUrl", () => {
    it("builds readable URL with explicit mode in path", () => {
      const url = generateShareUrl(
        sampleState,
        "learn-the-neck",
        "https://fretpad.app",
      );
      expect(url).toMatch(
        /^https:\/\/fretpad\.app\/practice\/learn-the-neck\?chords=/,
      );
      expect(url).toContain("Dm7|G7|Cmaj7|Cmaj7");
    });

    it("falls back to default mode when mode is null", () => {
      const url = generateShareUrl(sampleState, null, "https://fretpad.app");
      expect(url).toContain("/practice/outline-chord-changes");
    });

    it("includes chords in readable format", () => {
      const url = generateShareUrl(
        sampleState,
        "comp-with-voicings",
        "https://fretpad.app",
      );
      expect(url).toContain("chords=Dm7|G7|Cmaj7|Cmaj7");
    });

    it("includes name when progression has one", () => {
      const named = {
        ...sampleState,
        progression: { ...sampleState.progression, name: "My Blues" },
      };
      const url = generateShareUrl(named, null, "https://fretpad.app");
      expect(url).toContain("name=My+Blues");
    });

    it("omits name when progression name is empty", () => {
      const unnamed = {
        ...sampleState,
        progression: { ...sampleState.progression, name: "" },
      };
      const url = generateShareUrl(unnamed, null, "https://fretpad.app");
      expect(url).not.toContain("name=");
    });
  });

  describe("exportProgressionToText", () => {
    it("exports single-chord bars", () => {
      const text = exportProgressionToText(PRESET_PROGRESSIONS["ii-V-I"]);
      expect(text).toContain("|");
      expect(text).toContain("Dm7");
      expect(text).toContain("G7");
      expect(text).toContain("Cmaj7");
    });

    it("formats as pipe-separated bars", () => {
      const progression = {
        id: "test",
        name: "Test",
        timeSignature: { numerator: 4, denominator: 4 },
        bars: [
          { id: "1", totalBeats: 4, chords: [{ chord: "Am", beats: 4 }] },
          { id: "2", totalBeats: 4, chords: [{ chord: "G", beats: 4 }] },
        ],
      };
      expect(exportProgressionToText(progression)).toBe("| Am | G |");
    });

    it("joins multiple chords in a bar with space", () => {
      const progression = {
        id: "test",
        name: "Test",
        timeSignature: { numerator: 4, denominator: 4 },
        bars: [
          {
            id: "1",
            totalBeats: 4,
            chords: [
              { chord: "Dm7", beats: 2 },
              { chord: "G7", beats: 2 },
            ],
          },
        ],
      };
      expect(exportProgressionToText(progression)).toBe("| Dm7 G7 |");
    });
  });
});
