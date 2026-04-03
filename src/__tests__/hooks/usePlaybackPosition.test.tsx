// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Progression } from "@/lib/types";

const transport = {
  state: "stopped" as "started" | "stopped",
  position: "0:0:0",
};

vi.mock("tone", () => ({
  getTransport: () => transport,
}));

import { usePlaybackPositionObserver } from "@/hooks/usePlaybackPosition";

const progression: Progression = {
  id: "test-progression",
  name: "Test Progression",
  timeSignature: { numerator: 4, denominator: 4 },
  bars: [
    {
      id: "bar-1",
      totalBeats: 4,
      chords: [{ chord: "Cmaj7", beats: 4 }],
    },
    {
      id: "bar-2",
      totalBeats: 4,
      chords: [{ chord: "G7", beats: 4 }],
    },
  ],
};

describe("usePlaybackPositionObserver", () => {
  let nextFrame: FrameRequestCallback | null = null;
  let frameId = 0;

  beforeEach(() => {
    transport.state = "stopped";
    transport.position = "0:0:0";
    nextFrame = null;
    frameId = 0;

    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        nextFrame = callback;
        frameId += 1;
        return frameId;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("streams playback updates through the callback and resets on stop", () => {
    const onPositionChange = vi.fn();

    const { rerender, unmount } = renderHook(
      ({ isPlaying }) =>
        usePlaybackPositionObserver({
          progression,
          isPlaying,
          countInBars: 1,
          onPositionChange,
        }),
      {
        initialProps: { isPlaying: true },
      },
    );

    transport.state = "started";
    transport.position = "0:2:0";

    act(() => {
      nextFrame?.(performance.now());
    });

    expect(onPositionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isActive: true,
        isCountingIn: true,
        countInProgress: 0.5,
      }),
    );

    transport.position = "1:1:0";

    act(() => {
      nextFrame?.(performance.now());
    });

    expect(onPositionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        barIndex: 0,
        chordIndex: 0,
        barProgress: 0.25,
        isActive: true,
        isCountingIn: false,
      }),
    );

    rerender({ isPlaying: false });

    expect(onPositionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isActive: false,
        isCountingIn: false,
        barProgress: 0,
      }),
    );

    unmount();

    expect(cancelAnimationFrame).toHaveBeenCalled();
  });
});
