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
      getState().setSelectedStyle("bossaNova");
      expect(getState().selectedStyle).toBe("bossaNova");
    });

    it("can set all valid styles", () => {
      const styles = ["jazzSwing", "popRock", "bossaNova", "ballad"] as const;
      for (const style of styles) {
        getState().setSelectedStyle(style);
        expect(getState().selectedStyle).toBe(style);
      }
    });
  });
});
