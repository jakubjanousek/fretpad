import { beforeEach, describe, expect, it } from "vitest";
import { PRESET_PROGRESSIONS } from "@/lib/theory/presets";
import { getChordAtPosition } from "@/state/slices/progressionSlice";
import { useAppStore } from "@/state/useAppStore";

function resetQuizState() {
  const progression = PRESET_PROGRESSIONS["ii-V-I in C"];
  useAppStore.setState({
    progression,
    currentBarIndex: 0,
    currentChordIndex: 0,
    currentChord: getChordAtPosition(progression, 0, 0),
    quizActive: false,
    quizQuestion: null,
    quizScore: 0,
    quizTotal: 0,
    quizStreak: 0,
    quizBestStreak: 0,
    quizLastResult: null,
  });
}

describe("quizSlice", () => {
  beforeEach(() => {
    resetQuizState();
  });

  it("starts a quiz with a fresh question and cleared counters", () => {
    useAppStore.setState({
      quizScore: 4,
      quizTotal: 5,
      quizStreak: 3,
      quizBestStreak: 6,
      quizLastResult: "incorrect",
    });

    useAppStore.getState().startQuiz();

    const state = useAppStore.getState();
    expect(state.quizActive).toBe(true);
    expect(state.quizQuestion).not.toBeNull();
    expect(state.quizScore).toBe(0);
    expect(state.quizTotal).toBe(0);
    expect(state.quizStreak).toBe(0);
    expect(state.quizBestStreak).toBe(0);
    expect(state.quizLastResult).toBeNull();
  });

  it("keeps the quiz active after more than 10 answers", () => {
    useAppStore.getState().startQuiz();

    for (let index = 0; index < 11; index += 1) {
      const { quizQuestion } = useAppStore.getState();
      expect(quizQuestion).not.toBeNull();
      useAppStore
        .getState()
        .submitQuizAnswer(quizQuestion?.targetNote.interval ?? "1");
      useAppStore.getState().nextQuizQuestion();
    }

    const state = useAppStore.getState();
    expect(state.quizActive).toBe(true);
    expect(state.quizTotal).toBe(11);
    expect(state.quizScore).toBe(11);
    expect(state.quizStreak).toBe(11);
    expect(state.quizBestStreak).toBe(11);
    expect(state.quizQuestion).not.toBeNull();
  });

  it("ends the quiz without wiping the recorded stats", () => {
    useAppStore.getState().startQuiz();
    const question = useAppStore.getState().quizQuestion;
    expect(question).not.toBeNull();

    useAppStore
      .getState()
      .submitQuizAnswer(question?.targetNote.interval ?? "1");
    useAppStore.getState().endQuiz();

    const state = useAppStore.getState();
    expect(state.quizActive).toBe(false);
    expect(state.quizQuestion).toBeNull();
    expect(state.quizLastResult).toBeNull();
    expect(state.quizScore).toBe(1);
    expect(state.quizTotal).toBe(1);
  });
});
