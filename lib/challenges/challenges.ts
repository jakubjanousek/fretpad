import type { ChallengeId, PracticeModeId } from "@/lib/types";

export type ChallengeCriterion =
  | { type: "practice-time" }
  | { type: "quiz-accuracy"; threshold: number }
  | { type: "voicings-explored" }
  | { type: "keys"; preset: string };

export interface Challenge {
  id: ChallengeId;
  mode: PracticeModeId;
  title: string;
  description: string;
  target: number;
  criterion: ChallengeCriterion;
}

export interface ChallengeProgress {
  startedAt: string; // ISO timestamp
  current: number;
  completedAt?: string; // ISO timestamp
  trackedKeys?: string[]; // Persisted dedup keys for voicings-explored and keys criteria
}

export type ChallengeState = Partial<Record<ChallengeId, ChallengeProgress>>;

export const CHALLENGES: Challenge[] = [
  // Learn the Neck
  {
    id: "ltn-practice-10",
    mode: "learn-the-neck",
    title: "Practice for 10 minutes",
    description: "Ease into the mode. Time accumulates while playing.",
    target: 10,
    criterion: { type: "practice-time" },
  },
  {
    id: "ltn-quiz-accuracy",
    mode: "learn-the-neck",
    title: "Score 80% on 3 quizzes",
    description:
      "Complete 3 quizzes with at least 80% accuracy. Only finished quizzes count.",
    target: 3,
    criterion: { type: "quiz-accuracy", threshold: 80 },
  },
  {
    id: "ltn-keys-4",
    mode: "learn-the-neck",
    title: "Practice in 4 different keys",
    description: "Transpose and play in different keys.",
    target: 4,
    criterion: { type: "keys", preset: "Dorian Vamp (Dm7)" },
  },

  // Outline Chord Changes
  {
    id: "occ-practice-10",
    mode: "outline-chord-changes",
    title: "Practice for 10 minutes",
    description: "Start by getting comfortable with the mode.",
    target: 10,
    criterion: { type: "practice-time" },
  },
  {
    id: "occ-keys-4",
    mode: "outline-chord-changes",
    title: "ii-V-I in 4 keys",
    description: "Transpose and play the progression in different keys.",
    target: 4,
    criterion: { type: "keys", preset: "ii-V-I in C" },
  },
  {
    id: "occ-practice-30",
    mode: "outline-chord-changes",
    title: "Practice for 30 minutes total",
    description: "Cumulative practice time since this challenge started.",
    target: 30,
    criterion: { type: "practice-time" },
  },

  // Comp with Voicings
  {
    id: "cwv-practice-10",
    mode: "comp-with-voicings",
    title: "Practice for 10 minutes",
    description: "Get comfortable comping with voicings.",
    target: 10,
    criterion: { type: "practice-time" },
  },
  {
    id: "cwv-voicings-10",
    mode: "comp-with-voicings",
    title: "Explore 10 voicings",
    description: "Browse through different voicing shapes for chords.",
    target: 10,
    criterion: { type: "voicings-explored" },
  },
  {
    id: "cwv-keys-3",
    mode: "comp-with-voicings",
    title: "Comp through ii-V-I in 3 keys",
    description:
      "Transpose and comp through the progression in different keys.",
    target: 3,
    criterion: { type: "keys", preset: "ii-V-I in C" },
  },
];

/** Get challenges for a specific mode, in order */
export function getChallengesForMode(mode: PracticeModeId): Challenge[] {
  return CHALLENGES.filter((c) => c.mode === mode);
}

/** Check if a challenge is complete */
export function isComplete(progress: ChallengeProgress | undefined): boolean {
  return progress?.completedAt != null;
}

/** Get the active (first incomplete) challenge for a mode */
export function getActiveChallenge(
  state: ChallengeState,
  mode: PracticeModeId,
): Challenge | null {
  const modeChallenges = getChallengesForMode(mode);
  for (const challenge of modeChallenges) {
    if (!isComplete(state[challenge.id])) {
      return challenge;
    }
  }
  return null;
}

/** Get the next challenge after the active one (for "up next" preview) */
export function getNextChallenge(
  state: ChallengeState,
  mode: PracticeModeId,
): Challenge | null {
  const challenges = getChallengesForMode(mode);
  const activeIdx = challenges.findIndex((c) => !isComplete(state[c.id]));
  return activeIdx >= 0 && activeIdx + 1 < challenges.length
    ? (challenges[activeIdx + 1] ?? null)
    : null;
}

/** Get progress fraction (0-1) for a challenge */
export function getProgressFraction(
  challenge: Challenge,
  progress: ChallengeProgress | undefined,
): number {
  if (!progress) return 0;
  if (isComplete(progress)) return 1;
  return Math.min(progress.current / challenge.target, 1);
}

/** Check if all challenges for a mode are complete */
export function allChallengesComplete(
  state: ChallengeState,
  mode: PracticeModeId,
): boolean {
  return getActiveChallenge(state, mode) === null;
}
