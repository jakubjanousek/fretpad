import type { StateCreator } from "zustand";
import {
  type ChallengeProgress,
  type ChallengeState,
  getActiveChallenge,
  isComplete,
} from "@/lib/challenges/challenges";
import {
  filterKnownChallenges,
  loadChallengeState,
  saveChallengeState,
} from "@/lib/persistence/challengeStorage";
import { loadPracticeStats } from "@/lib/persistence/practiceStats";
import type { ChallengeId, PracticeModeId } from "@/lib/types";
import type { AppState } from "../useAppStore";

const SAVE_DEBOUNCE_MS = 5000;

export interface ChallengeSlice {
  // State
  challengeProgress: ChallengeState;
  exploredVoicings: Set<string>;
  practicedKeys: Record<string, Set<string>>; // per challenge ID

  // Actions
  initChallenges: () => void;
  recordQuizResult: (score: number, total: number) => void;
  recordVoicingExplored: (chordSymbol: string, voicingIndex: number) => void;
  recordKeyPracticed: (rootNote: string) => void;
  syncPracticeTime: () => void;
  advanceChallenge: (mode: PracticeModeId) => void;
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

export const createChallengeSlice: StateCreator<
  AppState,
  [],
  [],
  ChallengeSlice
> = (set, get) => {
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingSave = false;

  function scheduleSave(progress: ChallengeState) {
    pendingSave = true;
    if (saveTimer) return; // Already scheduled
    saveTimer = setTimeout(() => {
      saveTimer = null;
      pendingSave = false;
      saveChallengeState(progress);
    }, SAVE_DEBOUNCE_MS);
  }

  // Flush on page unload
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
      if (pendingSave) {
        if (saveTimer) clearTimeout(saveTimer);
        saveChallengeState(get().challengeProgress);
      }
    });
  }

  return {
    challengeProgress: {},
    exploredVoicings: new Set(),
    practicedKeys: {},

    initChallenges: () => {
      const loaded = filterKnownChallenges(loadChallengeState());

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

      // Auto-initialize next challenge if this one completed
      if (updated.completedAt) {
        const next = getActiveChallenge(newState, activeMode);
        if (next && !newState[next.id]) {
          newState[next.id] = {
            startedAt: new Date().toISOString(),
            current: 0,
          };
        }
      }

      set({ challengeProgress: newState });
      scheduleSave(newState);
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

      const newCurrent = newSet.size;
      const updated: ChallengeProgress = {
        ...progress,
        current: newCurrent,
        completedAt:
          newCurrent >= active.target ? new Date().toISOString() : undefined,
      };

      const newState = { ...challengeProgress, [active.id]: updated };

      if (updated.completedAt) {
        const next = getActiveChallenge(newState, activeMode);
        if (next && !newState[next.id]) {
          newState[next.id] = {
            startedAt: new Date().toISOString(),
            current: 0,
          };
        }
      }

      set({ challengeProgress: newState, exploredVoicings: newSet });
      scheduleSave(newState);
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

      const newCurrent = newSet.size;
      const updated: ChallengeProgress = {
        ...progress,
        current: newCurrent,
        completedAt:
          newCurrent >= active.target ? new Date().toISOString() : undefined,
      };

      const newState = { ...challengeProgress, [active.id]: updated };

      if (updated.completedAt) {
        const next = getActiveChallenge(newState, activeMode);
        if (next && !newState[next.id]) {
          newState[next.id] = {
            startedAt: new Date().toISOString(),
            current: 0,
          };
        }
      }

      set({
        challengeProgress: newState,
        practicedKeys: { ...practicedKeys, [active.id]: newSet },
      });
      scheduleSave(newState);
    },

    syncPracticeTime: () => {
      const { activeMode, challengeProgress } = get();
      if (!activeMode) return;

      const active = getActiveChallenge(challengeProgress, activeMode);
      if (!active || active.criterion.type !== "practice-time") return;

      const progress = ensureProgress(challengeProgress, active.id);
      if (isComplete(progress)) return;

      // Read practice stats and compute minutes since challenge started
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

      if (minutes === progress.current) return; // No change

      const updated: ChallengeProgress = {
        ...progress,
        current: minutes,
        completedAt:
          minutes >= active.target ? new Date().toISOString() : undefined,
      };

      const newState = { ...challengeProgress, [active.id]: updated };

      if (updated.completedAt) {
        const next = getActiveChallenge(newState, activeMode);
        if (next && !newState[next.id]) {
          newState[next.id] = {
            startedAt: new Date().toISOString(),
            current: 0,
          };
        }
      }

      set({ challengeProgress: newState });
      scheduleSave(newState);
    },

    advanceChallenge: (_mode: PracticeModeId) => {
      // This is called after the congratulations auto-transition.
      // The challenge is already marked complete — just force a re-render
      // by touching the state so the component picks up the next challenge.
      const { challengeProgress } = get();
      set({ challengeProgress: { ...challengeProgress } });
    },
  };
};
