import { describe, expect, it } from "vitest";
import {
  beatsToTime,
  parseTimeToBeats,
  resolveEventBeat,
} from "@/lib/audio/scheduler";

describe("audio scheduler timing helpers", () => {
  it("parses bar-beat-sixteenth time strings into beats", () => {
    expect(parseTimeToBeats("0:0")).toBe(0);
    expect(parseTimeToBeats("0:1:2")).toBe(1.5);
    expect(parseTimeToBeats("1:0")).toBe(4);
  });

  it("converts fractional beats back to Tone transport time", () => {
    expect(beatsToTime(0)).toBe("0:0");
    expect(beatsToTime(1.5)).toBe("0:1:2");
    expect(beatsToTime(4.75)).toBe("1:0:3");
  });

  it("applies explicit event offsets for swung placements", () => {
    const swungOffbeat = resolveEventBeat(
      { time: "0:0", offsetBeats: 2 / 3 },
      4,
    );

    expect(swungOffbeat).toBeCloseTo(2 / 3);
  });

  it("scales event offsets with multi-chord bars", () => {
    const compressedSwing = resolveEventBeat(
      { time: "0:1", offsetBeats: 2 / 3 },
      2,
    );

    expect(compressedSwing).toBeCloseTo(5 / 6);
  });

  it("adds per-instrument placement offsets after event timing", () => {
    const laidBackComping = resolveEventBeat(
      { time: "0:1", offsetBeats: 0.56 },
      4,
      0.03,
    );

    expect(laidBackComping).toBeCloseTo(1.59);
  });
});
