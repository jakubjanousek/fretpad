import type { StateCreator } from "zustand";
import {
  type Challenge,
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
  justCompletedChallenge: Challenge | null;

  initChallenges: () => void;
  recordQuizResult: (score: number, total: number) => void;
  recordVoicingExplored: (chordSymbol: string, voicingIndex: number) => void;
  recordKeyPracticed: (rootNote: string) => void;
  syncPracticeTime: () => void;
  dismissCompleted: () => void;
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
  justCompletedChallenge: null,

  initChallenges: () => {
    const loaded = loadChallengeState();

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

    const progress = ensureProgress(challengeProgress, active.id);
    if (isComplete(progress)) return;

    const percentage = (score / total) * 100;
    if (percentage < active.criterion.threshold) return;

    const newCurrent = progress.current + 1;
    const updated: ChallengeProgress = {
      ...progress,
      current: newCurrent,
      completedAt:
        newCurrent >= active.target ? new Date().toISOString() : undefined,
    };

    const newState = { ...challengeProgress, [active.id]: updated };
    const justCompleted = updated.completedAt ? active : null;
    if (updated.completedAt) maybeInitNextChallenge(newState, activeMode);

    set({ challengeProgress: newState, justCompletedChallenge: justCompleted });
    saveChallengeState(newState);
  },

  recordVoicingExplored: (chordSymbol: string, voicingIndex: number) => {
    const { activeMode, challengeProgress } = get();
    if (!activeMode) return;

    const active = getActiveChallenge(challengeProgress, activeMode);
    if (!active || active.criterion.type !== "voicings-explored") return;

    const progress = ensureProgress(challengeProgress, active.id);
    if (isComplete(progress)) return;

    // Rebuild dedup set from persisted keys
    const existingKeys = new Set(progress.trackedKeys ?? []);
    const key = `${chordSymbol}|${voicingIndex}`;
    if (existingKeys.has(key)) return; // Already counted

    existingKeys.add(key);
    const trackedKeys = [...existingKeys];

    const updated: ChallengeProgress = {
      ...progress,
      current: trackedKeys.length,
      trackedKeys,
      completedAt:
        trackedKeys.length >= active.target
          ? new Date().toISOString()
          : undefined,
    };

    const newState = { ...challengeProgress, [active.id]: updated };
    const justCompleted = updated.completedAt ? active : null;
    if (updated.completedAt) maybeInitNextChallenge(newState, activeMode);

    set({ challengeProgress: newState, justCompletedChallenge: justCompleted });
    saveChallengeState(newState);
  },

  recordKeyPracticed: (rootNote: string) => {
    const { activeMode, challengeProgress } = get();
    if (!activeMode) return;

    const active = getActiveChallenge(challengeProgress, activeMode);
    if (!active || active.criterion.type !== "keys") return;

    const progress = ensureProgress(challengeProgress, active.id);
    if (isComplete(progress)) return;

    // Rebuild dedup set from persisted keys
    const existingKeys = new Set(progress.trackedKeys ?? []);
    if (existingKeys.has(rootNote)) return; // Already counted

    existingKeys.add(rootNote);
    const trackedKeys = [...existingKeys];

    const updated: ChallengeProgress = {
      ...progress,
      current: trackedKeys.length,
      trackedKeys,
      completedAt:
        trackedKeys.length >= active.target
          ? new Date().toISOString()
          : undefined,
    };

    const newState = { ...challengeProgress, [active.id]: updated };
    const justCompleted = updated.completedAt ? active : null;
    if (updated.completedAt) maybeInitNextChallenge(newState, activeMode);

    set({ challengeProgress: newState, justCompletedChallenge: justCompleted });
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

    // Filter sessions by mode and startedAt date
    const relevantMs = stats.sessions
      .filter((s) => {
        if (s.mode !== activeMode) return false;
        // Session date is YYYY-MM-DD; convert to end-of-day for comparison
        // A session on the same day as startedAt is included (conservative)
        const sessionDayMs = new Date(s.date).getTime();
        const startedAtDayMs = new Date(
          progress.startedAt.split("T")[0] ?? "",
        ).getTime();
        return sessionDayMs >= startedAtDayMs;
      })
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
    const justCompleted = updated.completedAt ? active : null;
    if (updated.completedAt) maybeInitNextChallenge(newState, activeMode);

    set({ challengeProgress: newState, justCompletedChallenge: justCompleted });
    saveChallengeState(newState);
  },

  dismissCompleted: () => {
    set({ justCompletedChallenge: null });
  },
});
