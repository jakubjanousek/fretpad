import { beforeEach, describe, expect, it, vi } from "vitest";

const stopMock = vi.fn();
const cancelMock = vi.fn();

vi.mock("tone", () => ({
  getTransport: () => ({
    stop: stopMock,
    cancel: cancelMock,
  }),
}));

import { PRESET_PROGRESSIONS } from "@/lib/theory/presets";
import { getChordAtPosition } from "@/state/slices/progressionSlice";
import { useAppStore } from "@/state/useAppStore";

function resetStore() {
  const progression = PRESET_PROGRESSIONS["ii-V-I in C"];
  useAppStore.setState({
    activeMode: null,
    isPlaying: false,
    micActive: false,
    progression,
    currentBarIndex: 0,
    currentChordIndex: 0,
    currentChord: getChordAtPosition(progression, 0, 0),
    tempo: 120,
    selectedStyle: "jazzSwing",
    progressionHistory: [],
    progressionFuture: [],
    targetNoteMode: "none",
    showChromaticApproach: false,
    showDiatonicApproach: false,
    fretboardOverlay: "none",
  });
  localStorage.clear();
  stopMock.mockReset();
  cancelMock.mockReset();
}

describe("practiceModeSlice", () => {
  beforeEach(() => {
    resetStore();
  });

  it("switches mode in one pass and applies mode defaults", () => {
    useAppStore.setState({
      progression: PRESET_PROGRESSIONS["12-bar blues in A"],
      currentChord: getChordAtPosition(
        PRESET_PROGRESSIONS["12-bar blues in A"],
        0,
        0,
      ),
      currentBarIndex: 2,
      currentChordIndex: 0,
      tempo: 40,
      selectedStyle: "ballad",
      progressionHistory: [PRESET_PROGRESSIONS["Minor Blues in Am"]],
      progressionFuture: [PRESET_PROGRESSIONS["Rhythm Changes (A)"]],
    });

    useAppStore.getState().enterMode("learn-the-neck");

    const state = useAppStore.getState();
    expect(state.activeMode).toBe("learn-the-neck");
    expect(state.progression).toBe(PRESET_PROGRESSIONS["Dorian Vamp (Dm7)"]);
    expect(state.currentBarIndex).toBe(0);
    expect(state.currentChordIndex).toBe(0);
    expect(state.currentChord?.root).toBe("D");
    expect(state.tempo).toBe(90);
    expect(state.selectedStyle).toBe("bossaNova");
    expect(state.progressionHistory).toEqual([
      PRESET_PROGRESSIONS["Minor Blues in Am"],
      PRESET_PROGRESSIONS["12-bar blues in A"],
    ]);
    expect(state.progressionFuture).toEqual([]);
    expect(localStorage.getItem("fretpad-last-mode")).toBe("learn-the-neck");
  });

  it("stops transport and clears transient state", () => {
    useAppStore.setState({
      isPlaying: true,
      micActive: true,
      targetNoteMode: "root-and-guides",
      showChromaticApproach: true,
      showDiatonicApproach: true,
      fretboardOverlay: "pentatonicMinor",
    });

    useAppStore.getState().enterMode("outline-chord-changes");

    const state = useAppStore.getState();
    expect(stopMock).toHaveBeenCalledTimes(1);
    expect(cancelMock).toHaveBeenCalledTimes(1);
    expect(state.isPlaying).toBe(false);
    expect(state.micActive).toBe(false);
    expect(state.targetNoteMode).toBe("root-and-guides");
    expect(state.showChromaticApproach).toBe(true);
    expect(state.fretboardOverlay).toBe("none");
  });

  it("clears hidden target-note controls when entering a mode without targets", () => {
    useAppStore.setState({
      targetNoteMode: "root",
      showChromaticApproach: true,
      showDiatonicApproach: true,
    });

    useAppStore
      .getState()
      .enterMode("learn-the-neck", { applyDefaults: false });

    const state = useAppStore.getState();
    expect(state.targetNoteMode).toBe("none");
    expect(state.showChromaticApproach).toBe(false);
    expect(state.showDiatonicApproach).toBe(false);
  });

  it("preserves progression data when defaults are skipped", () => {
    const progression = PRESET_PROGRESSIONS["12-bar blues in A"];
    useAppStore.setState({
      progression,
      currentBarIndex: 3,
      currentChordIndex: 0,
      currentChord: getChordAtPosition(progression, 3, 0),
      tempo: 150,
      selectedStyle: "funk",
    });

    useAppStore
      .getState()
      .enterMode("outline-chord-changes", { applyDefaults: false });

    const state = useAppStore.getState();
    expect(state.progression).toBe(progression);
    expect(state.currentBarIndex).toBe(3);
    expect(state.currentChordIndex).toBe(0);
    expect(state.tempo).toBe(150);
    expect(state.selectedStyle).toBe("funk");
  });

  it("caps mode-switch history at 10 entries", () => {
    const history = Array.from({ length: 10 }, (_, index) => ({
      ...PRESET_PROGRESSIONS["ii-V-I in C"],
      name: `History ${index}`,
    }));

    useAppStore.setState({
      progression: PRESET_PROGRESSIONS["12-bar blues in A"],
      progressionHistory: history,
    });

    useAppStore.getState().enterMode("comp-with-voicings");

    const { progressionHistory } = useAppStore.getState();
    expect(progressionHistory).toHaveLength(10);
    expect(progressionHistory.at(0)?.name).toBe("History 1");
    expect(progressionHistory.at(-1)?.name).toBe("12-bar blues in A");
  });

  it("notifies subscribers once for a mode switch", () => {
    const listener = vi.fn();
    const unsubscribe = useAppStore.subscribe(listener);

    useAppStore.getState().enterMode("learn-the-neck");

    unsubscribe();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
