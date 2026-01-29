import type { Progression } from "../types";
import { isValidProgression } from "./localStorage";

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

    return parsed.filter(isValidCustomPreset);
  } catch (error) {
    console.warn("Failed to load custom presets:", error);
    return [];
  }
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
