import type { ChallengeState } from "@/lib/challenges/challenges";
import type { ChallengeId } from "@/lib/types";

const CHALLENGE_STATE_KEY = "fretpad-challenges";

const VALID_CHALLENGE_IDS: Set<string> = new Set<string>([
  "ltn-practice-10",
  "ltn-quiz-accuracy",
  "ltn-keys-4",
  "occ-practice-10",
  "occ-keys-4",
  "occ-practice-30",
  "cwv-practice-10",
  "cwv-voicings-10",
  "cwv-keys-3",
]);

/**
 * Load challenge state from localStorage
 */
export function loadChallengeState(): ChallengeState {
  try {
    const stored = localStorage.getItem(CHALLENGE_STATE_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored) as unknown;
    if (!isValidChallengeState(parsed)) {
      console.warn("Invalid challenge state in localStorage, resetting");
      return {};
    }

    return parsed;
  } catch (error) {
    console.warn("Failed to load challenge state:", error);
    return {};
  }
}

/**
 * Save challenge state to localStorage
 */
export function saveChallengeState(state: ChallengeState): void {
  try {
    localStorage.setItem(CHALLENGE_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save challenge state:", error);
  }
}

/**
 * Clear challenge state from localStorage
 */
export function clearChallengeState(): void {
  try {
    localStorage.removeItem(CHALLENGE_STATE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Type guard for ChallengeState
 */
function isValidChallengeState(value: unknown): value is ChallengeState {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;

  const obj = value as Record<string, unknown>;

  for (const [key, entry] of Object.entries(obj)) {
    // Skip unknown challenge IDs (future-proofing)
    if (!VALID_CHALLENGE_IDS.has(key)) continue;

    if (typeof entry !== "object" || entry === null) return false;

    const progress = entry as Record<string, unknown>;
    if (typeof progress.startedAt !== "string") return false;
    if (typeof progress.current !== "number") return false;
    if (
      progress.completedAt !== undefined &&
      typeof progress.completedAt !== "string"
    )
      return false;
  }

  // Filter to only known IDs
  return true;
}

/**
 * Filter loaded state to only known challenge IDs
 */
export function filterKnownChallenges(state: ChallengeState): ChallengeState {
  const filtered: ChallengeState = {};
  for (const [key, value] of Object.entries(state)) {
    if (VALID_CHALLENGE_IDS.has(key)) {
      filtered[key as ChallengeId] = value;
    }
  }
  return filtered;
}
