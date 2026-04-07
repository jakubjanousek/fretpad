import { describe, expect, it } from "vitest";
import {
  isValidProgression,
  loadFromLocalStorage,
} from "@/lib/persistence/localStorage";

describe("localStorage persistence guards", () => {
  it("accepts a progression with 64 bars", () => {
    const progression = {
      id: "bounded",
      name: "Bounded Progression",
      timeSignature: { numerator: 4, denominator: 4 },
      bars: Array.from({ length: 64 }, (_, index) => ({
        id: String(index + 1),
        totalBeats: 4,
        chords: [{ chord: "Cmaj7", beats: 4 }],
      })),
    };

    expect(isValidProgression(progression)).toBe(true);
  });

  it("rejects a progression with more than 64 bars", () => {
    const progression = {
      id: "too-large",
      name: "Too Large",
      timeSignature: { numerator: 4, denominator: 4 },
      bars: Array.from({ length: 65 }, (_, index) => ({
        id: String(index + 1),
        totalBeats: 4,
        chords: [{ chord: "Cmaj7", beats: 4 }],
      })),
    };

    expect(isValidProgression(progression)).toBe(false);
  });

  it("migrates the removed natural style back to jazzSwing", () => {
    localStorage.setItem(
      "fretpad-state",
      JSON.stringify({
        progression: {
          id: "ii-v-i",
          name: "ii-V-I",
          timeSignature: { numerator: 4, denominator: 4 },
          bars: [
            {
              id: "1",
              totalBeats: 4,
              chords: [{ chord: "Dm7", beats: 4 }],
            },
          ],
        },
        tempo: 120,
        selectedStyle: "jazzSwingNatural",
        metronome: {
          enabled: true,
          volume: -6,
          accentDownbeat: true,
          countIn: 1,
        },
        showScaleTones: true,
      }),
    );

    expect(loadFromLocalStorage()?.selectedStyle).toBe("jazzSwing");
  });
});
