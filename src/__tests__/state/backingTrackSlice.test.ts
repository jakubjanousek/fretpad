import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "@/state/useAppStore";

function getState() {
  return useAppStore.getState();
}

describe("backingTrackSlice", () => {
  beforeEach(() => {
    useAppStore.setState({
      backingTrack: {
        bassVolume: -6,
        chordVolume: -14,
        drumsVolume: -8,
        bassMuted: false,
        chordMuted: false,
        drumsMuted: false,
        compingVariations: false,
      },
    });
  });

  describe("setBackingTrackVolume", () => {
    it("sets bass volume", () => {
      getState().setBackingTrackVolume("bass", -10);
      expect(getState().backingTrack.bassVolume).toBe(-10);
    });

    it("sets chord volume", () => {
      getState().setBackingTrackVolume("chord", -8);
      expect(getState().backingTrack.chordVolume).toBe(-8);
    });

    it("clamps bass volume to minimum of -30", () => {
      getState().setBackingTrackVolume("bass", -50);
      expect(getState().backingTrack.bassVolume).toBe(-30);
    });

    it("clamps bass volume to maximum of 0", () => {
      getState().setBackingTrackVolume("bass", 10);
      expect(getState().backingTrack.bassVolume).toBe(0);
    });

    it("clamps chord volume to minimum of -30", () => {
      getState().setBackingTrackVolume("chord", -50);
      expect(getState().backingTrack.chordVolume).toBe(-30);
    });

    it("clamps chord volume to maximum of 0", () => {
      getState().setBackingTrackVolume("chord", 10);
      expect(getState().backingTrack.chordVolume).toBe(0);
    });

    it("does not affect other volume when setting one", () => {
      getState().setBackingTrackVolume("bass", -20);
      expect(getState().backingTrack.chordVolume).toBe(-14);
    });
  });

  describe("setBackingTrackMuted", () => {
    it("mutes bass", () => {
      getState().setBackingTrackMuted("bass", true);
      expect(getState().backingTrack.bassMuted).toBe(true);
    });

    it("unmutes bass", () => {
      getState().setBackingTrackMuted("bass", true);
      getState().setBackingTrackMuted("bass", false);
      expect(getState().backingTrack.bassMuted).toBe(false);
    });

    it("mutes chord", () => {
      getState().setBackingTrackMuted("chord", true);
      expect(getState().backingTrack.chordMuted).toBe(true);
    });

    it("unmutes chord", () => {
      getState().setBackingTrackMuted("chord", true);
      getState().setBackingTrackMuted("chord", false);
      expect(getState().backingTrack.chordMuted).toBe(false);
    });

    it("does not affect other mute state", () => {
      getState().setBackingTrackMuted("bass", true);
      expect(getState().backingTrack.chordMuted).toBe(false);
    });
  });
});
