import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "@/state/useAppStore";

function getState() {
  return useAppStore.getState();
}

describe("metronomeSlice", () => {
  beforeEach(() => {
    useAppStore.setState({
      metronome: {
        enabled: false,
        volume: -6,
        accentDownbeat: true,
        countIn: 0,
      },
    });
  });

  describe("setMetronomeEnabled", () => {
    it("enables the metronome", () => {
      getState().setMetronomeEnabled(true);
      expect(getState().metronome.enabled).toBe(true);
    });

    it("disables the metronome", () => {
      getState().setMetronomeEnabled(true);
      getState().setMetronomeEnabled(false);
      expect(getState().metronome.enabled).toBe(false);
    });

    it("preserves other metronome settings", () => {
      getState().setMetronomeVolume(-10);
      getState().setMetronomeEnabled(true);
      expect(getState().metronome.volume).toBe(-10);
      expect(getState().metronome.accentDownbeat).toBe(true);
    });
  });

  describe("setMetronomeVolume", () => {
    it("sets volume within valid range", () => {
      getState().setMetronomeVolume(-12);
      expect(getState().metronome.volume).toBe(-12);
    });

    it("clamps volume to minimum of -20", () => {
      getState().setMetronomeVolume(-50);
      expect(getState().metronome.volume).toBe(-20);
    });

    it("clamps volume to maximum of 0", () => {
      getState().setMetronomeVolume(10);
      expect(getState().metronome.volume).toBe(0);
    });

    it("clamps at exact boundaries", () => {
      getState().setMetronomeVolume(-20);
      expect(getState().metronome.volume).toBe(-20);

      getState().setMetronomeVolume(0);
      expect(getState().metronome.volume).toBe(0);
    });
  });

  describe("setMetronomeCountIn", () => {
    it("sets count-in to 0", () => {
      getState().setMetronomeCountIn(0);
      expect(getState().metronome.countIn).toBe(0);
    });

    it("sets count-in to 1", () => {
      getState().setMetronomeCountIn(1);
      expect(getState().metronome.countIn).toBe(1);
    });

    it("sets count-in to 2", () => {
      getState().setMetronomeCountIn(2);
      expect(getState().metronome.countIn).toBe(2);
    });
  });
});
