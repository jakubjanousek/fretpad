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
    quizActive: false,
    quizQuestion: null,
    quizLastResult: null,
    quizFinished: false,
    sessionActive: false,
    sessionPhaseIndex: 0,
    sessionPhaseElapsedMs: 0,
    sessionTotalElapsedMs: 0,
    sessionPaused: false,
    progression,
    currentBarIndex: 0,
    currentChordIndex: 0,
    currentChord: getChordAtPosition(progression, 0, 0),
    tempo: 120,
    selectedStyle: "jazzSwing",
    showVoicings: false,
    targetNoteMode: "none",
    showChromaticApproach: false,
    showDiatonicApproach: false,
    showEnclosures: false,
    focusedEnclosureTarget: null,
    fretboardOverlay: "none",
    showCAGEDPositions: false,
    focusedPosition: null,
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
    expect(localStorage.getItem("fretpad-last-mode")).toBe("learn-the-neck");
  });

  it("stops transport, clears transient state, and enforces display constraints", () => {
    useAppStore.setState({
      isPlaying: true,
      micActive: true,
      quizActive: true,
      quizFinished: true,
      quizLastResult: "correct",
      sessionActive: true,
      sessionPhaseIndex: 2,
      sessionPhaseElapsedMs: 1200,
      sessionTotalElapsedMs: 8000,
      sessionPaused: true,
      showVoicings: true,
      targetNoteMode: "root-and-guides",
      showChromaticApproach: true,
      showDiatonicApproach: true,
      showEnclosures: true,
      focusedEnclosureTarget: { string: 2, fret: 5 },
      fretboardOverlay: "pentatonicMinor",
      showCAGEDPositions: true,
      focusedPosition: 3,
    });

    useAppStore.getState().enterMode("outline-chord-changes");

    const state = useAppStore.getState();
    expect(stopMock).toHaveBeenCalledTimes(1);
    expect(cancelMock).toHaveBeenCalledTimes(1);
    expect(state.isPlaying).toBe(false);
    expect(state.micActive).toBe(false);
    expect(state.quizActive).toBe(false);
    expect(state.quizFinished).toBe(false);
    expect(state.quizLastResult).toBeNull();
    expect(state.sessionActive).toBe(false);
    expect(state.sessionPhaseIndex).toBe(0);
    expect(state.sessionPhaseElapsedMs).toBe(0);
    expect(state.sessionTotalElapsedMs).toBe(0);
    expect(state.sessionPaused).toBe(false);
    expect(state.showVoicings).toBe(false);
    expect(state.targetNoteMode).toBe("root-and-guides");
    expect(state.showChromaticApproach).toBe(true);
    expect(state.fretboardOverlay).toBe("none");
    expect(state.showCAGEDPositions).toBe(false);
    expect(state.focusedPosition).toBeNull();
  });

  it("clears hidden target-note controls when entering a mode without targets", () => {
    useAppStore.setState({
      targetNoteMode: "root",
      showChromaticApproach: true,
      showDiatonicApproach: true,
      showEnclosures: true,
      focusedEnclosureTarget: { string: 3, fret: 4 },
    });

    useAppStore
      .getState()
      .enterMode("learn-the-neck", { applyDefaults: false });

    const state = useAppStore.getState();
    expect(state.targetNoteMode).toBe("none");
    expect(state.showChromaticApproach).toBe(false);
    expect(state.showDiatonicApproach).toBe(false);
    expect(state.showEnclosures).toBe(false);
    expect(state.focusedEnclosureTarget).toBeNull();
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
});
