import { describe, expect, it } from "vitest";
import {
  applySwing,
  beatsToTime,
  getCorrelatedHumanization,
  getDeterministicCenteredValue,
  getHumanization,
  getPatternVariantIndex,
  getPhraseVelocityMultiplier,
  getPocketOffset,
  getTempoSwingRatio,
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

  it("jazz swing drum pattern uses ride and hihat", () => {
    const sounds = new Set(
      jazzSwingStyle.patterns.drums.events.map((e) => e.sound),
    );
    expect(sounds).toContain("ride");
    expect(sounds).toContain("hihat");
  });

  it("jazz swing style defines per-instrument swing multipliers", () => {
    const { swing } = jazzSwingStyle;
    expect(swing.drums).toBe(1); // ride defines the swing
    expect(swing.chord).toBeGreaterThan(0);
    expect(swing.chord).toBeLessThan(1); // comping slightly less than ride
    expect(swing.bass).toBe(0); // quarter notes, no swing
  });

  it("computes tempo-adaptive swing ratio", () => {
    // Medium tempo: near triplet feel (~0.667)
    const medium = getTempoSwingRatio(120);
    expect(medium).toBeGreaterThan(0.6);
    expect(medium).toBeLessThan(0.72);

    // Fast tempo: compresses toward straight
    const fast = getTempoSwingRatio(220);
    expect(fast).toBeGreaterThan(0.5);
    expect(fast).toBeLessThan(0.6);

    // Slow tempo: wider swing
    const slow = getTempoSwingRatio(70);
    expect(slow).toBeGreaterThan(0.67);
    expect(slow).toBeLessThanOrEqual(0.75);

    // Faster = less swing
    expect(fast).toBeLessThan(medium);
    expect(medium).toBeLessThan(slow);
  });

  it("applies swing only to upbeat 8th positions", () => {
    const ratio = 0.667;
    // Downbeats: untouched
    expect(applySwing(0, ratio)).toBe(0);
    expect(applySwing(1, ratio)).toBe(1);
    expect(applySwing(2, ratio)).toBe(2);
    // Upbeat 8ths: shifted
    expect(applySwing(0.5, ratio)).toBeCloseTo(0.667);
    expect(applySwing(1.5, ratio)).toBeCloseTo(1.667);
    // Other positions (16ths): untouched
    expect(applySwing(0.25, ratio)).toBe(0.25);
    expect(applySwing(0.75, ratio)).toBe(0.75);
  });

  it("applies no swing when ratio is 0.5 (straight)", () => {
    expect(applySwing(0.5, 0.5)).toBe(0.5);
    expect(applySwing(1.5, 0.5)).toBe(1.5);
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

  it("jazz swing half-bar comping variants announce the chord inside the first beat", () => {
    const halfBarPattern = jazzSwingStyle.patterns.chord.slotVariants?.find(
      (variant) => variant.slotBeats === 2,
    );

    expect(halfBarPattern).toBeDefined();

    for (const variant of halfBarPattern?.variants ?? []) {
      const firstEvent = variant[0];
      expect(firstEvent).toBeDefined();
      if (!firstEvent) {
        throw new Error("Expected a half-bar comping event");
      }
      expect(parseTimeToBeats(firstEvent.time)).toBeLessThanOrEqual(0.5);
    }
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

  describe("correlated humanization (AR(1) drift)", () => {
    const profile = {
      timingBeats: 0.06,
      timingDirection: "centered" as const,
      velocityDelta: 0.1,
      durationBeats: 0.08,
      correlation: 0.5,
    };

    const eventCount = 8;
    const context = {
      loopIteration: 0,
      barIndex: 0,
      chordIndex: 0,
    };

    it("with correlation=0, matches independent getHumanization output", () => {
      const uncorrelatedProfile = { ...profile, correlation: 0 };
      const results = getCorrelatedHumanization(
        uncorrelatedProfile,
        "drums",
        context,
        eventCount,
      );

      for (let i = 0; i < eventCount; i++) {
        const independent = getHumanization(uncorrelatedProfile, "drums", {
          ...context,
          eventIndex: i,
        });
        const result = results[i];
        expect(result).toBeDefined();
        if (!result) {
          throw new Error(`Missing correlated humanization result at ${i}`);
        }
        expect(result.timingOffsetBeats).toBeCloseTo(
          independent.timingOffsetBeats,
          10,
        );
        expect(result.velocityOffset).toBeCloseTo(
          independent.velocityOffset,
          10,
        );
      }
    });

    it("is deterministic — same inputs produce same outputs", () => {
      const first = getCorrelatedHumanization(
        profile,
        "bass",
        context,
        eventCount,
      );
      const second = getCorrelatedHumanization(
        profile,
        "bass",
        context,
        eventCount,
      );
      expect(first).toEqual(second);
    });

    it("correlated timing has fewer sign changes than independent", () => {
      // With correlation, consecutive values should trend in the same direction
      // more often than independent random values
      const correlated = getCorrelatedHumanization(
        { ...profile, correlation: 0.7 },
        "bass",
        { loopIteration: 0, barIndex: 0, chordIndex: 0 },
        20,
      );
      const independent = getCorrelatedHumanization(
        { ...profile, correlation: 0 },
        "bass",
        { loopIteration: 0, barIndex: 0, chordIndex: 0 },
        20,
      );

      function countSignChanges(
        values: { timingOffsetBeats: number }[],
      ): number {
        let changes = 0;
        for (let i = 1; i < values.length; i++) {
          const current = values[i];
          const previous = values[i - 1];
          if (!current || !previous) continue;
          if (current.timingOffsetBeats * previous.timingOffsetBeats < 0) {
            changes++;
          }
        }
        return changes;
      }

      expect(countSignChanges(correlated)).toBeLessThan(
        countSignChanges(independent),
      );
    });

    it("all values stay within timingBeats bounds", () => {
      const results = getCorrelatedHumanization(
        profile,
        "drums",
        context,
        eventCount,
      );
      for (const r of results) {
        expect(Math.abs(r.timingOffsetBeats)).toBeLessThanOrEqual(
          profile.timingBeats,
        );
        expect(Math.abs(r.velocityOffset)).toBeLessThanOrEqual(
          profile.velocityDelta,
        );
        expect(Math.abs(r.durationOffsetBeats)).toBeLessThanOrEqual(
          profile.durationBeats,
        );
      }
    });
  });

  describe("bass-drum pocket coupling", () => {
    it("produces deterministic per-beat offsets", () => {
      const a = getPocketOffset(0, 0, 0, 0.04);
      const b = getPocketOffset(0, 0, 0, 0.04);
      expect(a).toBe(b);
    });

    it("different beats produce different offsets", () => {
      const beat0 = getPocketOffset(0, 0, 0, 0.04);
      const beat1 = getPocketOffset(0, 1, 0, 0.04);
      expect(beat0).not.toBe(beat1);
    });

    it("offsets stay within the given scale", () => {
      for (let beat = 0; beat < 4; beat++) {
        for (let bar = 0; bar < 8; bar++) {
          const offset = getPocketOffset(bar, beat, 0, 0.04);
          expect(Math.abs(offset)).toBeLessThanOrEqual(0.04);
        }
      }
    });

    it("blending with weight=0 produces fully independent timing", () => {
      const pocket = getPocketOffset(0, 0, 0, 0.04);
      const individual = 0.03;
      const weight = 0;
      const blended = weight * pocket + (1 - weight) * individual;
      expect(blended).toBe(individual);
    });

    it("blending with weight=1 produces pocket-only timing", () => {
      const pocket = getPocketOffset(0, 0, 0, 0.04);
      const individual = 0.03;
      const weight = 1;
      const blended = weight * pocket + (1 - weight) * individual;
      expect(blended).toBe(pocket);
    });
  });

  describe("phrase-level velocity dynamics", () => {
    const phraseDynamics = {
      phraseLengthBars: 4,
      velocityContour: [0.95, 1.0, 1.05, 0.98],
    };

    it("returns correct multiplier for each bar position", () => {
      expect(getPhraseVelocityMultiplier(0, phraseDynamics)).toBe(0.95);
      expect(getPhraseVelocityMultiplier(1, phraseDynamics)).toBe(1.0);
      expect(getPhraseVelocityMultiplier(2, phraseDynamics)).toBe(1.05);
      expect(getPhraseVelocityMultiplier(3, phraseDynamics)).toBe(0.98);
    });

    it("wraps at phrase boundary", () => {
      expect(getPhraseVelocityMultiplier(4, phraseDynamics)).toBe(0.95);
      expect(getPhraseVelocityMultiplier(7, phraseDynamics)).toBe(0.98);
    });

    it("returns 1.0 when phraseDynamics is undefined", () => {
      expect(getPhraseVelocityMultiplier(0, undefined)).toBe(1.0);
    });
  });

  describe("timing stack simplification", () => {
    it("jazzSwing retains instrument offsets and does not use groove templates", () => {
      expect(jazzSwingStyle.timing?.instrumentOffsets?.bass).toBeGreaterThan(0);
      expect(jazzSwingStyle.timing?.instrumentOffsets?.chord).toBeGreaterThan(
        0,
      );
      expect(jazzSwingStyle.grooveTemplates).toBeUndefined();
    });
  });

  describe("ride pattern (spang-a-lang)", () => {
    const quarterNoteBeats = ["0:0", "0:1", "0:2", "0:3"];

    function getRideTimesFromEvents(
      events: { time: string; sound: string }[],
    ): string[] {
      return events.filter((e) => e.sound === "ride").map((e) => e.time);
    }

    it("jazzSwing default drum pattern has ride on all four quarter notes", () => {
      const rideTimes = getRideTimesFromEvents(
        jazzSwingStyle.patterns.drums.events,
      );
      for (const beat of quarterNoteBeats) {
        expect(rideTimes).toContain(beat);
      }
    });

    it("all drum variants maintain ride on all four quarter notes", () => {
      const allVariants = [...(jazzSwingStyle.patterns.drums.variants ?? [])];
      for (const variant of allVariants) {
        const rideTimes = getRideTimesFromEvents(variant);
        for (const beat of quarterNoteBeats) {
          expect(rideTimes).toContain(beat);
        }
      }
    });

    it("default drum patterns include skip notes on upbeats", () => {
      const rideTimes = getRideTimesFromEvents(
        jazzSwingStyle.patterns.drums.events,
      );
      const hasSkipNote = rideTimes.some((t) => t.includes(":2"));
      expect(hasSkipNote).toBe(true);
    });
  });
});
