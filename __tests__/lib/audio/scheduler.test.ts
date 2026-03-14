import { describe, expect, it } from "vitest";
import {
  beatsToTime,
  getDeterministicCenteredValue,
  getHumanization,
  getPatternVariantIndex,
  parseTimeToBeats,
  resolveBarEventBeat,
  resolveEventBeat,
  resolveHumanizedDuration,
} from "@/lib/audio/scheduler";
import { jazzSwingStyle } from "@/lib/audio/styles/jazzSwing";

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

  it("preserves triplet and laid-back microtiming in transport time", () => {
    expect(beatsToTime(2 / 3)).toBe("0:0:2.666667");
    expect(beatsToTime(1.59)).toBe("0:1:2.36");
  });

  it("applies explicit event offsets for swung placements", () => {
    const swungOffbeat = resolveEventBeat(
      { time: "0:0", offsetBeats: 2 / 3 },
      4,
    );

    expect(swungOffbeat).toBeCloseTo(2 / 3);
  });

  it("preserves bar-level jazz timing without compressing it to chord length", () => {
    expect(resolveBarEventBeat({ time: "0:0", offsetBeats: 2 / 3 })).toBeCloseTo(
      2 / 3,
    );
    expect(resolveBarEventBeat({ time: "0:2", offsetBeats: 2 / 3 })).toBeCloseTo(
      8 / 3,
    );
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

  it("keeps jazz ride events on the full bar grid", () => {
    const rideSkip = jazzSwingStyle.patterns.drums.events[1];
    const secondHalfSkip = jazzSwingStyle.patterns.drums.events[4];
    expect(rideSkip).toBeDefined();
    expect(secondHalfSkip).toBeDefined();

    expect(resolveBarEventBeat(rideSkip!)).toBeCloseTo(2 / 3);
    expect(resolveBarEventBeat(secondHalfSkip!)).toBeCloseTo(8 / 3);
  });

  it("produces deterministic bounded humanization offsets", () => {
    const profile = {
      timingBeats: 0.04,
      velocityDelta: 0.08,
      durationBeats: 0.1,
    };
    const first = getHumanization(profile, "chord", {
      loopIteration: 0,
      barIndex: 2,
      chordIndex: 1,
      eventIndex: 0,
    });
    const second = getHumanization(profile, "chord", {
      loopIteration: 0,
      barIndex: 2,
      chordIndex: 1,
      eventIndex: 0,
    });

    expect(first).toEqual(second);
    expect(Math.abs(first.timingOffsetBeats)).toBeLessThanOrEqual(0.04);
    expect(Math.abs(first.velocityOffset)).toBeLessThanOrEqual(0.08);
    expect(Math.abs(first.durationOffsetBeats)).toBeLessThanOrEqual(0.1);
  });

  it("supports late-only timing humanization", () => {
    const profile = {
      timingBeats: 0.04,
      timingDirection: "late" as const,
      velocityDelta: 0.08,
      durationBeats: 0.1,
    };
    const result = getHumanization(profile, "chord", {
      loopIteration: 0,
      barIndex: 2,
      chordIndex: 1,
      eventIndex: 0,
    });

    expect(result.timingOffsetBeats).toBeGreaterThanOrEqual(0);
    expect(result.timingOffsetBeats).toBeLessThanOrEqual(0.04);
  });

  it("changes deterministic values across different event seeds", () => {
    const first = getDeterministicCenteredValue("chord:0:0:0:timing");
    const second = getDeterministicCenteredValue("chord:0:0:1:timing");

    expect(first).not.toBe(second);
    expect(first).toBeGreaterThanOrEqual(-1);
    expect(first).toBeLessThanOrEqual(1);
  });

  it("changes humanization across loop iterations while staying deterministic", () => {
    const profile = {
      timingBeats: 0.04,
      velocityDelta: 0.08,
      durationBeats: 0.1,
    };
    const firstLoop = getHumanization(profile, "bass", {
      loopIteration: 0,
      barIndex: 0,
      chordIndex: 0,
      eventIndex: 1,
    });
    const secondLoop = getHumanization(profile, "bass", {
      loopIteration: 1,
      barIndex: 0,
      chordIndex: 0,
      eventIndex: 1,
    });

    expect(firstLoop).not.toEqual(secondLoop);
    expect(Math.abs(secondLoop.timingOffsetBeats)).toBeLessThanOrEqual(0.04);
    expect(Math.abs(secondLoop.velocityOffset)).toBeLessThanOrEqual(0.08);
    expect(Math.abs(secondLoop.durationOffsetBeats)).toBeLessThanOrEqual(0.1);
  });

  it("resolves humanized durations to transport time strings", () => {
    expect(resolveHumanizedDuration("8n", 0.25)).toBe("0:0:3");
    expect(resolveHumanizedDuration("16n", -0.5)).toBe("0:0:0.5");
  });

  it("selects deterministic pattern variants per chord slot", () => {
    expect(getPatternVariantIndex(0, 0, 4)).toBe(0);
    expect(getPatternVariantIndex(0, 1, 4)).toBe(1);
    expect(getPatternVariantIndex(1, 0, 4)).toBe(3);
    expect(getPatternVariantIndex(1, 1, 4)).toBe(0);
  });

  it("advances pattern variants across loop iterations", () => {
    expect(getPatternVariantIndex(0, 0, 4, 1)).toBe(1);
    expect(getPatternVariantIndex(1, 1, 4, 2)).toBe(2);
  });
});
