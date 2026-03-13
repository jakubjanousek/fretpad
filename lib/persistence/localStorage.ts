import type { MetronomeConfig, Progression, StyleId } from "../types";

const STORAGE_KEY = "fretpad-state";

/**
 * Persistable state subset - only what needs to survive reload
 */
export interface PersistedState {
  progression: Progression;
  tempo: number;
  selectedStyle: StyleId;
  metronome: MetronomeConfig;
  showScaleTones: boolean;
}

/**
 * Save state to localStorage
 */
export function saveToLocalStorage(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save state to localStorage:", error);
  }
}

/**
 * Load state from localStorage
 */
export function loadFromLocalStorage(): PersistedState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as unknown;
    if (!isValidPersistedState(parsed)) {
      console.warn("Invalid state in localStorage, ignoring");
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("Failed to load state from localStorage:", error);
    return null;
  }
}

/**
 * Clear persisted state from localStorage
 */
export function clearLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear localStorage:", error);
  }
}

/**
 * Type guard for PersistedState
 */
function isValidPersistedState(value: unknown): value is PersistedState {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    isValidProgression(obj.progression) &&
    typeof obj.tempo === "number" &&
    typeof obj.selectedStyle === "string" &&
    isValidMetronomeConfig(obj.metronome) &&
    typeof obj.showScaleTones === "boolean"
  );
}

/**
 * Type guard for Progression
 */
export function isValidProgression(value: unknown): value is Progression {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.timeSignature === "object" &&
    obj.timeSignature !== null &&
    Array.isArray(obj.bars) &&
    obj.bars.length > 0
  );
}

/**
 * Type guard for MetronomeConfig
 */
function isValidMetronomeConfig(value: unknown): value is MetronomeConfig {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.enabled === "boolean" &&
    typeof obj.volume === "number" &&
    typeof obj.accentDownbeat === "boolean" &&
    (obj.countIn === 0 || obj.countIn === 1 || obj.countIn === 2)
  );
}
