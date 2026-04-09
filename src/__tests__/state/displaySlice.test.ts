import { beforeEach, describe, expect, it, vi } from "vitest";

const stopMock = vi.fn();
const cancelMock = vi.fn();

vi.mock("tone", () => ({
  getTransport: () => ({
    stop: stopMock,
    cancel: cancelMock,
  }),
}));

import { useAppStore } from "@/state/useAppStore";

function resetStore() {
  useAppStore.setState({
    maxFrets: 12,
  });
}

describe("displaySlice — maxFrets", () => {
  beforeEach(() => {
    resetStore();
  });

  it("defaults maxFrets to 12", () => {
    const state = useAppStore.getState();
    expect(state.maxFrets).toBe(12);
  });

  it("setMaxFrets updates to 15", () => {
    useAppStore.getState().setMaxFrets(15);
    expect(useAppStore.getState().maxFrets).toBe(15);
  });

  it("setMaxFrets updates to 17", () => {
    useAppStore.getState().setMaxFrets(17);
    expect(useAppStore.getState().maxFrets).toBe(17);
  });
});
