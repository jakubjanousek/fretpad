import type { MetronomeConfig, Progression, StyleId } from "./types";

const STORAGE_KEY = "fretflow-state";
const URL_PARAM = "p";

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
 * Shareable state subset - minimal state for URL sharing
 */
export interface ShareableState {
  progression: Progression;
  tempo: number;
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
 * Encode shareable state to URL-safe base64
 */
export function encodeStateToUrl(state: ShareableState): string {
  const json = JSON.stringify(state);
  // Use base64url encoding (URL-safe)
  const base64 = btoa(json)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return base64;
}

/**
 * Decode shareable state from URL-safe base64
 */
export function decodeStateFromUrl(encoded: string): ShareableState | null {
  try {
    // Restore standard base64 padding
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padding = base64.length % 4;
    if (padding) {
      base64 += "=".repeat(4 - padding);
    }

    const json = atob(base64);
    const parsed = JSON.parse(json) as unknown;

    if (!isValidShareableState(parsed)) {
      console.warn("Invalid state in URL, ignoring");
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("Failed to decode state from URL:", error);
    return null;
  }
}

/**
 * Generate a shareable URL with encoded progression
 */
export function generateShareUrl(state: ShareableState): string {
  const encoded = encodeStateToUrl(state);
  const url = new URL(window.location.href);
  url.searchParams.set(URL_PARAM, encoded);
  return url.toString();
}

/**
 * Extract shareable state from current URL if present
 */
export function getStateFromUrl(): ShareableState | null {
  const url = new URL(window.location.href);
  const encoded = url.searchParams.get(URL_PARAM);
  if (!encoded) return null;
  return decodeStateFromUrl(encoded);
}

/**
 * Remove state parameter from URL without reloading
 */
export function clearUrlState(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(URL_PARAM);
  window.history.replaceState({}, "", url.toString());
}

/**
 * Export progression to text format
 * Example: | Dm7 | G7 | Cmaj7 | Cmaj7 |
 */
export function exportProgressionToText(progression: Progression): string {
  const bars = progression.bars.map((bar) => {
    if (bar.chords.length === 1) {
      return bar.chords[0]?.chord ?? "";
    }
    // Multiple chords in bar - join with space
    return bar.chords.map((c) => c.chord).join(" ");
  });

  return `| ${bars.join(" | ")} |`;
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
 * Type guard for ShareableState
 */
function isValidShareableState(value: unknown): value is ShareableState {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return isValidProgression(obj.progression) && typeof obj.tempo === "number";
}

/**
 * Type guard for Progression
 */
function isValidProgression(value: unknown): value is Progression {
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

// Custom presets storage
const CUSTOM_PRESETS_KEY = "fretflow-custom-presets";
const RECENT_PRESETS_KEY = "fretflow-recent-presets";
const MAX_RECENT_PRESETS = 5;

export interface CustomPreset {
  id: string;
  name: string;
  progression: Progression;
  createdAt: number;
}

/**
 * Save custom presets to localStorage
 */
export function saveCustomPresets(presets: CustomPreset[]): void {
  try {
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets));
  } catch (error) {
    console.warn("Failed to save custom presets:", error);
  }
}

/**
 * Load custom presets from localStorage
 */
export function loadCustomPresets(): CustomPreset[] {
  try {
    const stored = localStorage.getItem(CUSTOM_PRESETS_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];

    // Validate each preset
    return parsed.filter(isValidCustomPreset);
  } catch (error) {
    console.warn("Failed to load custom presets:", error);
    return [];
  }
}

/**
 * Type guard for CustomPreset
 */
function isValidCustomPreset(value: unknown): value is CustomPreset {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    isValidProgression(obj.progression) &&
    typeof obj.createdAt === "number"
  );
}

/**
 * Recent preset entry - tracks which presets were recently used
 */
export interface RecentPreset {
  key: string; // preset key (built-in) or custom preset id
  type: "builtin" | "custom";
  timestamp: number;
}

/**
 * Save recent presets to localStorage
 */
export function saveRecentPresets(presets: RecentPreset[]): void {
  try {
    localStorage.setItem(RECENT_PRESETS_KEY, JSON.stringify(presets));
  } catch (error) {
    console.warn("Failed to save recent presets:", error);
  }
}

/**
 * Load recent presets from localStorage
 */
export function loadRecentPresets(): RecentPreset[] {
  try {
    const stored = localStorage.getItem(RECENT_PRESETS_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];

    // Validate each entry
    return parsed.filter(isValidRecentPreset);
  } catch (error) {
    console.warn("Failed to load recent presets:", error);
    return [];
  }
}

/**
 * Add a preset to recent presets (moves to front if already exists)
 */
export function addRecentPreset(
  key: string,
  type: "builtin" | "custom",
): RecentPreset[] {
  const recent = loadRecentPresets();

  // Remove if already exists
  const filtered = recent.filter((p) => !(p.key === key && p.type === type));

  // Add to front
  const updated: RecentPreset[] = [
    { key, type, timestamp: Date.now() },
    ...filtered,
  ].slice(0, MAX_RECENT_PRESETS);

  saveRecentPresets(updated);
  return updated;
}

/**
 * Type guard for RecentPreset
 */
function isValidRecentPreset(value: unknown): value is RecentPreset {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.key === "string" &&
    (obj.type === "builtin" || obj.type === "custom") &&
    typeof obj.timestamp === "number"
  );
}
