import type { ChallengeState } from "@/lib/challenges/challenges";
import { CHALLENGES } from "@/lib/challenges/challenges";
import type { ChallengeId } from "@/lib/types";

const CHALLENGE_STATE_KEY = "fretpad-challenges";

const VALID_CHALLENGE_IDS: Set<string> = new Set(CHALLENGES.map((c) => c.id));

/**
 * Load challenge state from localStorage, filtering to known IDs only.
 */
export function loadChallengeState(): ChallengeState {
  try {
    const stored = localStorage.getItem(CHALLENGE_STATE_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return {};

    const obj = parsed as Record<string, unknown>;
    const result: ChallengeState = {};

    for (const [key, entry] of Object.entries(obj)) {
      if (!VALID_CHALLENGE_IDS.has(key)) continue;
      if (!isValidProgress(entry)) continue;
      result[key as ChallengeId] = entry;
    }

    return result;
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
 * Type guard for a single ChallengeProgress entry
 */
function isValidProgress(
  value: unknown,
): value is { startedAt: string; current: number; completedAt?: string } {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.startedAt === "string" &&
    typeof obj.current === "number" &&
    (obj.completedAt === undefined || typeof obj.completedAt === "string")
  );
}
