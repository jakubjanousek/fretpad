import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "@/state/useAppStore";

function getState() {
  return useAppStore.getState();
}

describe("playbackSlice", () => {
  beforeEach(() => {
    useAppStore.setState({
      tempo: 120,
      isPlaying: false,
      selectedStyle: "jazzSwing",
      tempoRamp: {
        enabled: false,
        increment: 5,
        everyNLoops: 2,
        maxTempo: 200,
      },
      loopCount: 0,
    });
  });

  describe("setTempo", () => {
    it("sets tempo within valid range", () => {
      getState().setTempo(140);
      expect(getState().tempo).toBe(140);
    });

    it("clamps tempo to minimum of 40", () => {
      getState().setTempo(10);
      expect(getState().tempo).toBe(40);
    });

    it("clamps tempo to maximum of 200", () => {
      getState().setTempo(300);
      expect(getState().tempo).toBe(200);
    });

    it("clamps tempo at exact boundaries", () => {
      getState().setTempo(40);
      expect(getState().tempo).toBe(40);

      getState().setTempo(200);
      expect(getState().tempo).toBe(200);
    });
  });

  describe("setIsPlaying", () => {
    it("sets playing state to true", () => {
      getState().setIsPlaying(true);
      expect(getState().isPlaying).toBe(true);
    });

    it("sets playing state to false", () => {
      getState().setIsPlaying(true);
      getState().setIsPlaying(false);
      expect(getState().isPlaying).toBe(false);
    });
  });

  describe("setSelectedStyle", () => {
    it("changes the selected style", () => {
      getState().setSelectedStyle("jazzSwing");
      expect(getState().selectedStyle).toBe("jazzSwing");
    });
  });

  describe("tempoRamp", () => {
    it("has correct default values", () => {
      const { tempoRamp } = getState();
      expect(tempoRamp.enabled).toBe(false);
      expect(tempoRamp.increment).toBe(5);
      expect(tempoRamp.everyNLoops).toBe(2);
      expect(tempoRamp.maxTempo).toBe(200);
    });

    it("toggles enabled state", () => {
      getState().setTempoRampEnabled(true);
      expect(getState().tempoRamp.enabled).toBe(true);

      getState().setTempoRampEnabled(false);
      expect(getState().tempoRamp.enabled).toBe(false);
    });

    it("sets increment within valid range", () => {
      getState().setTempoRampIncrement(10);
      expect(getState().tempoRamp.increment).toBe(10);
    });

    it("clamps increment to 1-20 range", () => {
      getState().setTempoRampIncrement(0);
      expect(getState().tempoRamp.increment).toBe(1);

      getState().setTempoRampIncrement(25);
      expect(getState().tempoRamp.increment).toBe(20);
    });

    it("sets everyNLoops", () => {
      getState().setTempoRampEveryNLoops(4);
      expect(getState().tempoRamp.everyNLoops).toBe(4);
    });

    it("sets maxTempo within valid range", () => {
      getState().setTempoRampMaxTempo(180);
      expect(getState().tempoRamp.maxTempo).toBe(180);
    });

    it("clamps maxTempo to 40-300 range", () => {
      getState().setTempoRampMaxTempo(10);
      expect(getState().tempoRamp.maxTempo).toBe(40);

      getState().setTempoRampMaxTempo(500);
      expect(getState().tempoRamp.maxTempo).toBe(300);
    });
  });

  describe("loopCount", () => {
    it("starts at 0", () => {
      expect(getState().loopCount).toBe(0);
    });

    it("increments loop count", () => {
      getState().incrementLoopCount();
      expect(getState().loopCount).toBe(1);

      getState().incrementLoopCount();
      expect(getState().loopCount).toBe(2);
    });

    it("resets loop count", () => {
      getState().incrementLoopCount();
      getState().incrementLoopCount();
      getState().resetLoopCount();
      expect(getState().loopCount).toBe(0);
    });

    it("increments tempo when ramp is enabled and loop threshold is met", () => {
      getState().setTempoRampEnabled(true);
      // everyNLoops defaults to 2, increment defaults to 5
      getState().incrementLoopCount(); // loopCount = 1
      expect(getState().tempo).toBe(120); // no change yet

      getState().incrementLoopCount(); // loopCount = 2, triggers ramp
      expect(getState().tempo).toBe(125);
    });

    it("does not increment tempo when ramp is disabled", () => {
      getState().incrementLoopCount();
      getState().incrementLoopCount();
      expect(getState().tempo).toBe(120);
    });

    it("caps tempo at maxTempo", () => {
      getState().setTempoRampEnabled(true);
      getState().setTempoRampMaxTempo(122);
      getState().setTempoRampIncrement(5);

      getState().incrementLoopCount(); // 1
      getState().incrementLoopCount(); // 2 → tempo should be min(122, 125) = 122
      expect(getState().tempo).toBe(122);
    });
  });
});
