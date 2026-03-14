// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ROLLING_ACCURACY_THRESHOLD,
  ROLLING_ACCURACY_WINDOW,
  useRollingAccuracy,
} from "@/hooks/useRollingAccuracy";

describe("useRollingAccuracy", () => {
  it("tracks a rolling accuracy window", () => {
    const { result } = renderHook(
      ({ stepIndex }) => useRollingAccuracy(stepIndex),
      {
        initialProps: { stepIndex: 0 },
      },
    );

    act(() => {
      for (let index = 0; index < ROLLING_ACCURACY_WINDOW + 2; index++) {
        result.current.record(index % 2 === 0);
      }
    });

    expect(result.current.attemptCount).toBe(ROLLING_ACCURACY_WINDOW);
    expect(result.current.accuracy).toBe(0.5);
    expect(result.current.isUnlockEligible).toBe(false);
  });

  it("marks unlock eligibility once the threshold is met", () => {
    const { result } = renderHook(() => useRollingAccuracy(0));

    act(() => {
      for (let index = 0; index < ROLLING_ACCURACY_WINDOW; index++) {
        result.current.record(index < 8);
      }
    });

    expect(result.current.accuracy).toBe(ROLLING_ACCURACY_THRESHOLD);
    expect(result.current.isUnlockEligible).toBe(true);
  });

  it("resets when the step changes", () => {
    const { result, rerender } = renderHook(
      ({ stepIndex }) => useRollingAccuracy(stepIndex),
      { initialProps: { stepIndex: 0 } },
    );

    act(() => {
      result.current.record(true);
      result.current.record(false);
    });

    rerender({ stepIndex: 1 });

    expect(result.current.attemptCount).toBe(0);
    expect(result.current.accuracy).toBe(0);
  });
});
