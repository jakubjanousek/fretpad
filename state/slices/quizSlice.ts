import type { StateCreator } from "zustand";
import { getFretNotesForChord } from "@/lib/fretboard";
import type { QuizQuestion } from "@/lib/types";
import type { AppState } from "../useAppStore";

export interface QuizSlice {
  quizActive: boolean;
  quizQuestion: QuizQuestion | null;
  quizScore: number;
  quizTotal: number;
  quizStreak: number;
  quizBestStreak: number;
  quizLastResult: "correct" | "incorrect" | null;
  quizFinished: boolean;

  startQuiz: () => void;
  submitQuizAnswer: (interval: string) => void;
  nextQuizQuestion: () => void;
  endQuiz: () => void;
}

export const createQuizSlice: StateCreator<AppState, [], [], QuizSlice> = (
  set,
  get,
) => ({
  quizActive: false,
  quizQuestion: null,
  quizScore: 0,
  quizTotal: 0,
  quizStreak: 0,
  quizBestStreak: 0,
  quizLastResult: null,
  quizFinished: false,

  startQuiz: () => {
    set({
      quizActive: true,
      quizScore: 0,
      quizTotal: 0,
      quizStreak: 0,
      quizBestStreak: 0,
      quizLastResult: null,
      quizFinished: false,
    });
    // Generate first question
    get().nextQuizQuestion();
  },

  submitQuizAnswer: (interval: string) => {
    const { quizQuestion, quizScore, quizStreak, quizBestStreak, quizTotal } =
      get();
    if (!quizQuestion) return;

    const isCorrect = interval === quizQuestion.targetNote.interval;
    const newStreak = isCorrect ? quizStreak + 1 : 0;
    const newBestStreak = Math.max(quizBestStreak, newStreak);
    const newTotal = quizTotal + 1;

    const newScore = isCorrect ? quizScore + 1 : quizScore;
    const finished = newTotal >= 10;

    set({
      quizScore: newScore,
      quizTotal: newTotal,
      quizStreak: newStreak,
      quizBestStreak: newBestStreak,
      quizLastResult: isCorrect ? "correct" : "incorrect",
      quizFinished: finished,
    });
  },

  nextQuizQuestion: () => {
    const state = get();
    const chord = state.currentChord;
    if (!chord) return;

    // Get chord tones only (no scale tones)
    const allFretNotes = getFretNotesForChord(chord, { includeScale: false });
    // Filter to chord tones only (they all are since includeScale is false)
    const chordTones = allFretNotes.filter((n) => n.isChordTone);
    if (chordTones.length === 0) return;

    // Get unique intervals available
    const uniqueIntervals = [
      ...new Set(chordTones.map((n) => n.interval)),
    ].sort((a, b) => {
      // Sort by musical order: 1, b2, 2, b3, 3, 4, #4, b5, 5, #5, b6, 6, b7, 7
      const order = [
        "1",
        "b2",
        "2",
        "b3",
        "3",
        "4",
        "#4",
        "b5",
        "5",
        "#5",
        "b6",
        "6",
        "b7",
        "7",
      ];
      return order.indexOf(a) - order.indexOf(b);
    });

    // Pick a random chord tone
    const randomIndex = Math.floor(Math.random() * chordTones.length);
    const targetNote = chordTones[randomIndex];
    if (!targetNote) return;

    set({
      quizQuestion: {
        targetNote,
        chord,
        availableIntervals: uniqueIntervals,
      },
      quizLastResult: null,
    });
  },

  endQuiz: () => {
    set({
      quizActive: false,
      quizQuestion: null,
      quizLastResult: null,
      quizFinished: false,
    });
  },
});
