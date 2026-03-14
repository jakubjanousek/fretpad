import { MODE_STEPS, PRACTICE_MODE_IDS } from "@/lib/modes";
import type { PracticeModeId } from "@/lib/types";

const STORAGE_KEY = "fretpad-step-progress";
const LEGACY_CHALLENGE_KEY = "fretpad-challenges";

type PersistedStepProgress = Partial<Record<PracticeModeId, number>>;

const VALID_MODES = new Set<PracticeModeId>(PRACTICE_MODE_IDS);

export function getUnlockedStep(mode: PracticeModeId): number {
  const storage = getStorage();
  if (!storage) {
    return 0;
  }

  try {
    const stored = storage.getItem(STORAGE_KEY);
    if (!stored) {
      return 0;
    }

    const parsed = JSON.parse(stored) as unknown;
    if (typeof parsed !== "object" || parsed === null) {
      return 0;
    }

    const value = (parsed as PersistedStepProgress)[mode];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return 0;
    }

    return clampStep(mode, value);
  } catch (error) {
    console.warn("Failed to load step progress:", error);
    return 0;
  }
}

export function unlockStep(mode: PracticeModeId, step: number): number {
  const storage = getStorage();
  if (!storage) {
    return 0;
  }

  if (!VALID_MODES.has(mode)) {
    return 0;
  }

  const nextStep = clampStep(mode, step);

  try {
    const stored = storage.getItem(STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as unknown) : {};
    const currentData =
      typeof parsed === "object" && parsed !== null
        ? (parsed as PersistedStepProgress)
        : {};
    const currentStep = currentData[mode] ?? 0;

    currentData[mode] = Math.max(currentStep, nextStep);
    storage.setItem(STORAGE_KEY, JSON.stringify(currentData));

    return currentData[mode] ?? 0;
  } catch (error) {
    console.warn("Failed to persist step progress:", error);
    return nextStep;
  }
}

export function clearLegacyChallengeProgress(): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(LEGACY_CHALLENGE_KEY);
  } catch (error) {
    console.warn("Failed to clear legacy challenge progress:", error);
  }
}

function clampStep(mode: PracticeModeId, step: number): number {
  const maxStep = MODE_STEPS[mode].length - 1;
  return Math.max(0, Math.min(step, maxStep));
}

function getStorage(): Storage | null {
  if (typeof localStorage === "undefined") {
    return null;
  }

  return typeof localStorage.getItem === "function" &&
    typeof localStorage.setItem === "function" &&
    typeof localStorage.removeItem === "function"
    ? localStorage
    : null;
}
