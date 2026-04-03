import { describe, expect, it } from "vitest";
import {
  beatsToTime,
  getDeterministicCenteredValue,
  getHumanization,
  getPatternVariantIndex,
  parseTimeToBeats,
  resolveBarEventBeat,
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

  it("resolves bar-level event beat positions", () => {
    expect(resolveBarEventBeat({ time: "0:0" })).toBe(0);
    expect(resolveBarEventBeat({ time: "0:2" })).toBe(2);
  });

  it("adds per-instrument placement offsets", () => {
    const result = resolveBarEventBeat({ time: "0:1" }, 0.03);
    expect(result).toBeCloseTo(1.03);
  });

  it("jazz swing patterns use straight grid positions (swing via Transport)", () => {
    // All events should be on straight grid — no offsetBeats
    const allEvents = [
      ...jazzSwingStyle.patterns.bass.events,
      ...jazzSwingStyle.patterns.chord.events,
      ...jazzSwingStyle.patterns.drums.events,
    ];
    for (const event of allEvents) {
      expect(event).not.toHaveProperty("offsetBeats");
    }
  });

  it("jazz swing style uses Transport swing", () => {
    expect(jazzSwingStyle.swing).toBeGreaterThan(0);
    expect(jazzSwingStyle.timing?.useTransportSwing).toBe(true);
  });

  it("jazz swing has multiple comping variants on straight grid", () => {
    const variants = jazzSwingStyle.patterns.chord.variants ?? [];
    expect(variants.length).toBeGreaterThanOrEqual(3);

    // All variant events should also be on straight grid
    for (const variant of variants) {
      for (const event of variant) {
        expect(event).not.toHaveProperty("offsetBeats");
      }
    }
  });

  it("jazz swing comping variants have different rhythms", () => {
    const variants = jazzSwingStyle.patterns.chord.variants ?? [];
    const timeSets = variants.map((v) => v.map((e) => e.time).join(","));
    const unique = new Set(timeSets);
    expect(unique.size).toBeGreaterThan(1);
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
