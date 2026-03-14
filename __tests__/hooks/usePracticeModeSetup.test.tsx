// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePracticeModeSetup } from "@/hooks/usePracticeModeSetup";
import type { PracticeModeId } from "@/lib/types";

const enterModeMock = vi.fn();
const useUrlStateMock = vi.fn();
const useSessionTimerMock = vi.fn();
const getUnlockedStepMock = vi.fn();
const clearLegacyChallengeProgressMock = vi.fn();

vi.mock("@/state/useAppStore", () => ({
  useAppStore: (
    selector: (state: { enterMode: typeof enterModeMock }) => unknown,
  ) => selector({ enterMode: enterModeMock }),
}));

vi.mock("@/hooks/useUrlState", () => ({
  useUrlState: () => useUrlStateMock(),
}));

vi.mock("@/hooks/useSessionTimer", () => ({
  useSessionTimer: () => useSessionTimerMock(),
}));

vi.mock("@/lib/persistence/stepProgress", () => ({
  clearLegacyChallengeProgress: () => clearLegacyChallengeProgressMock(),
  getUnlockedStep: (modeId: PracticeModeId) => getUnlockedStepMock(modeId),
}));

describe("usePracticeModeSetup", () => {
  beforeEach(() => {
    enterModeMock.mockReset();
    useUrlStateMock.mockReset();
    useSessionTimerMock.mockReset();
    getUnlockedStepMock.mockReset();
    clearLegacyChallengeProgressMock.mockReset();
    getUnlockedStepMock.mockReturnValue(1);
    window.history.replaceState({}, "", "/practice/learn-the-neck");
  });

  it("runs shared setup and enters the mode with defaults by default", () => {
    const { result } = renderHook(() => usePracticeModeSetup("learn-the-neck"));

    expect(useUrlStateMock).toHaveBeenCalledTimes(1);
    expect(useSessionTimerMock).toHaveBeenCalledTimes(1);
    expect(clearLegacyChallengeProgressMock).toHaveBeenCalledTimes(1);
    expect(getUnlockedStepMock).toHaveBeenCalledWith("learn-the-neck");
    expect(enterModeMock).toHaveBeenCalledWith("learn-the-neck", {
      applyDefaults: true,
    });
    expect(result.current.unlockedStepIndex).toBe(1);
  });

  it("preserves URL state defaults and re-enters when the mode changes", () => {
    getUnlockedStepMock
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(2);

    window.history.replaceState({}, "", "/practice/learn-the-neck?p=encoded");

    const { result, rerender } = renderHook(
      ({ modeId }) => usePracticeModeSetup(modeId),
      {
        initialProps: { modeId: "learn-the-neck" as PracticeModeId },
      },
    );

    rerender({ modeId: "outline-chord-changes" });

    expect(enterModeMock).toHaveBeenNthCalledWith(1, "learn-the-neck", {
      applyDefaults: false,
    });
    expect(enterModeMock).toHaveBeenNthCalledWith(2, "outline-chord-changes", {
      applyDefaults: false,
    });
    expect(clearLegacyChallengeProgressMock).toHaveBeenCalledTimes(2);
    expect(result.current.unlockedStepIndex).toBe(2);
  });
});
