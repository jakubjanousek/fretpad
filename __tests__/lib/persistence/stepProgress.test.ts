import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearLegacyChallengeProgress,
  getUnlockedStep,
  unlockStep,
} from "@/lib/persistence/stepProgress";

describe("stepProgress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns 0 when nothing is stored", () => {
    expect(getUnlockedStep("learn-the-neck")).toBe(0);
  });

  it("clamps persisted values to the available step range", () => {
    localStorage.setItem(
      "fretpad-step-progress",
      JSON.stringify({ "comp-with-voicings": 99 }),
    );

    expect(getUnlockedStep("comp-with-voicings")).toBe(1);
  });

  it("persists the highest unlocked step for a mode", () => {
    expect(unlockStep("outline-chord-changes", 2)).toBe(2);
    expect(unlockStep("outline-chord-changes", 1)).toBe(2);
    expect(getUnlockedStep("outline-chord-changes")).toBe(2);
  });

  it("clamps unlock requests before persisting", () => {
    expect(unlockStep("learn-the-neck", 99)).toBe(2);
    expect(getUnlockedStep("learn-the-neck")).toBe(2);
  });

  it("clears legacy challenge progress", () => {
    localStorage.setItem("fretpad-challenges", JSON.stringify({ stale: true }));
    clearLegacyChallengeProgress();
    expect(localStorage.getItem("fretpad-challenges")).toBeNull();
  });

  it("returns 0 during SSR", () => {
    const originalWindow = globalThis.window;

    vi.stubGlobal("window", undefined);
    expect(getUnlockedStep("learn-the-neck")).toBe(0);

    vi.stubGlobal("window", originalWindow);
  });
});
