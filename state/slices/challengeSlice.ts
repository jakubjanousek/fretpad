import type { StateCreator } from "zustand";
import {
  type ChallengeProgress,
  type ChallengeState,
  getActiveChallenge,
  isComplete,
} from "@/lib/challenges/challenges";
import {
  loadChallengeState,
  saveChallengeState,
} from "@/lib/persistence/challengeStorage";
import { loadPracticeStats } from "@/lib/persistence/practiceStats";
import type { ChallengeId, PracticeModeId } from "@/lib/types";
import type { AppState } from "../useAppStore";

export interface ChallengeSlice {
  challengeProgress: ChallengeState;
  exploredVoicings: Set<string>;
  practicedKeys: Record<ChallengeId, Set<string>>;

  initChallenges: () => void;
  recordQuizResult: (score: number, total: number) => void;
  recordVoicingExplored: (chordSymbol: string, voicingIndex: number) => void;
  recordKeyPracticed: (rootNote: string) => void;
  syncPracticeTime: () => void;
}

/** Ensure a challenge has progress initialized */
function ensureProgress(
  state: ChallengeState,
  id: ChallengeId,
): ChallengeProgress {
  const existing = state[id];
  if (existing) return existing;
  return { startedAt: new Date().toISOString(), current: 0 };
}

/** Initialize next challenge if the current one just completed */
function maybeInitNextChallenge(
  state: ChallengeState,
  mode: PracticeModeId,
): void {
  const next = getActiveChallenge(state, mode);
  if (next && !state[next.id]) {
    state[next.id] = { startedAt: new Date().toISOString(), current: 0 };
  }
}

export const createChallengeSlice: StateCreator<
  AppState,
  [],
  [],
  ChallengeSlice
> = (set, get) => ({
  challengeProgress: {},
  exploredVoicings: new Set(),
  practicedKeys: {} as Record<ChallengeId, Set<string>>,

  initChallenges: () => {
    const loaded = loadChallengeState();

    // Ensure the first challenge of each mode has progress initialized
    const modes: PracticeModeId[] = [
      "learn-the-neck",
      "outline-chord-changes",
      "comp-with-voicings",
    ];
    const progress = { ...loaded };
    for (const mode of modes) {
      const active = getActiveChallenge(progress, mode);
      if (active && !progress[active.id]) {
        progress[active.id] = {
          startedAt: new Date().toISOString(),
          current: 0,
        };
      }
    }

    set({ challengeProgress: progress });
  },

  recordQuizResult: (score: number, total: number) => {
    const { activeMode, challengeProgress } = get();
    if (!activeMode) return;

    const active = getActiveChallenge(challengeProgress, activeMode);
    if (!active || active.criterion.type !== "quiz-accuracy") return;

    const percentage = (score / total) * 100;
    if (percentage < active.criterion.threshold) return;

    const progress = ensureProgress(challengeProgress, active.id);
    if (isComplete(progress)) return;

    const newCurrent = progress.current + 1;
    const updated: ChallengeProgress = {
      ...progress,
      current: newCurrent,
      completedAt:
        newCurrent >= active.target ? new Date().toISOString() : undefined,
    };

    const newState = { ...challengeProgress, [active.id]: updated };
    if (updated.completedAt) maybeInitNextChallenge(newState, activeMode);

    set({ challengeProgress: newState });
    saveChallengeState(newState);
  },

  recordVoicingExplored: (chordSymbol: string, voicingIndex: number) => {
    const { activeMode, challengeProgress, exploredVoicings } = get();
    if (!activeMode) return;

    const active = getActiveChallenge(challengeProgress, activeMode);
    if (!active || active.criterion.type !== "voicings-explored") return;

    const progress = ensureProgress(challengeProgress, active.id);
    if (isComplete(progress)) return;

    const key = `${chordSymbol}|${voicingIndex}`;
    const newSet = new Set(exploredVoicings);
    newSet.add(key);

    // Never regress: Sets reset on reload, but persisted current may be higher
    const newCurrent = Math.max(progress.current, newSet.size);
    const updated: ChallengeProgress = {
      ...progress,
      current: newCurrent,
      completedAt:
        newCurrent >= active.target ? new Date().toISOString() : undefined,
    };

    const newState = { ...challengeProgress, [active.id]: updated };
    if (updated.completedAt) maybeInitNextChallenge(newState, activeMode);

    set({ challengeProgress: newState, exploredVoicings: newSet });
    saveChallengeState(newState);
  },

  recordKeyPracticed: (rootNote: string) => {
    const { activeMode, challengeProgress, practicedKeys } = get();
    if (!activeMode) return;

    const active = getActiveChallenge(challengeProgress, activeMode);
    if (!active || active.criterion.type !== "keys") return;

    const progress = ensureProgress(challengeProgress, active.id);
    if (isComplete(progress)) return;

    const challengeKeys = practicedKeys[active.id] ?? new Set<string>();
    const newSet = new Set(challengeKeys);
    newSet.add(rootNote);

    // Never regress: Sets reset on reload, but persisted current may be higher
    const newCurrent = Math.max(progress.current, newSet.size);
    const updated: ChallengeProgress = {
      ...progress,
      current: newCurrent,
      completedAt:
        newCurrent >= active.target ? new Date().toISOString() : undefined,
    };

    const newState = { ...challengeProgress, [active.id]: updated };
    if (updated.completedAt) maybeInitNextChallenge(newState, activeMode);

    set({
      challengeProgress: newState,
      practicedKeys: {
        ...practicedKeys,
        [active.id]: newSet,
      } as Record<ChallengeId, Set<string>>,
    });
    saveChallengeState(newState);
  },

  syncPracticeTime: () => {
    const { activeMode, challengeProgress } = get();
    if (!activeMode) return;

    const active = getActiveChallenge(challengeProgress, activeMode);
    if (!active || active.criterion.type !== "practice-time") return;

    const progress = ensureProgress(challengeProgress, active.id);
    if (isComplete(progress)) return;

    const stats = loadPracticeStats();
    const relevantMs = stats.sessions
      .filter(
        (s) =>
          s.mode === activeMode &&
          new Date(s.date).getTime() >=
            new Date(progress.startedAt.split("T")[0] ?? "").getTime(),
      )
      .reduce((sum, s) => sum + s.durationMs, 0);

    const minutes = Math.floor(relevantMs / 60000);
    if (minutes === progress.current) return;

    const updated: ChallengeProgress = {
      ...progress,
      current: minutes,
      completedAt:
        minutes >= active.target ? new Date().toISOString() : undefined,
    };

    const newState = { ...challengeProgress, [active.id]: updated };
    if (updated.completedAt) maybeInitNextChallenge(newState, activeMode);

    set({ challengeProgress: newState });
    saveChallengeState(newState);
  },
});
