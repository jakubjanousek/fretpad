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

// Practice tracking storage
const PRACTICE_STATS_KEY = "fretflow-practice-stats";

/**
 * Practice session entry
 */
export interface PracticeSession {
  date: string; // ISO date string (YYYY-MM-DD)
  durationMs: number; // Total practice time in milliseconds
  progressionNames: string[]; // Progressions practiced
}

/**
 * Practice statistics
 */
export interface PracticeStats {
  sessions: PracticeSession[];
  totalTimeMs: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

/**
 * Calculate streak from sessions
 */
function calculateStreak(sessions: PracticeSession[]): {
  current: number;
  longest: number;
} {
  if (sessions.length === 0) return { current: 0, longest: 0 };

  // Sort sessions by date descending
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const today = getTodayDate();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const session of sortedSessions) {
    const sessionDate = new Date(session.date);

    if (prevDate === null) {
      // First session
      const isRecent = session.date === today || session.date === yesterday;
      if (isRecent) {
        currentStreak = 1;
      }
      tempStreak = 1;
    } else {
      // Check if consecutive day
      const diff = prevDate.getTime() - sessionDate.getTime();
      const daysDiff = diff / 86400000;

      if (daysDiff === 1) {
        tempStreak++;
        if (currentStreak > 0) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    prevDate = sessionDate;
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return { current: currentStreak, longest: longestStreak };
}

/**
 * Load practice stats from localStorage
 */
export function loadPracticeStats(): PracticeStats {
  try {
    const stored = localStorage.getItem(PRACTICE_STATS_KEY);
    if (!stored) {
      return {
        sessions: [],
        totalTimeMs: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: null,
      };
    }

    const parsed = JSON.parse(stored) as unknown;
    if (!isValidPracticeStats(parsed)) {
      return {
        sessions: [],
        totalTimeMs: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: null,
      };
    }

    // Recalculate streaks in case of date changes
    const streaks = calculateStreak(parsed.sessions);
    return {
      ...parsed,
      currentStreak: streaks.current,
      longestStreak: Math.max(parsed.longestStreak, streaks.longest),
    };
  } catch (error) {
    console.warn("Failed to load practice stats:", error);
    return {
      sessions: [],
      totalTimeMs: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null,
    };
  }
}

/**
 * Save practice stats to localStorage
 */
export function savePracticeStats(stats: PracticeStats): void {
  try {
    localStorage.setItem(PRACTICE_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.warn("Failed to save practice stats:", error);
  }
}

/**
 * Record practice time for today
 */
export function recordPracticeTime(
  durationMs: number,
  progressionName?: string,
): PracticeStats {
  const stats = loadPracticeStats();
  const today = getTodayDate();

  // Find or create today's session
  let todaySession = stats.sessions.find((s) => s.date === today);

  if (todaySession) {
    todaySession.durationMs += durationMs;
    if (progressionName && !todaySession.progressionNames.includes(progressionName)) {
      todaySession.progressionNames.push(progressionName);
    }
  } else {
    todaySession = {
      date: today,
      durationMs,
      progressionNames: progressionName ? [progressionName] : [],
    };
    stats.sessions.push(todaySession);
  }

  // Update totals
  stats.totalTimeMs += durationMs;
  stats.lastPracticeDate = today;

  // Keep only last 90 days of sessions
  const cutoffDate = new Date(Date.now() - 90 * 86400000)
    .toISOString()
    .split("T")[0];
  stats.sessions = stats.sessions.filter((s) => s.date >= (cutoffDate ?? ""));

  // Recalculate streaks
  const streaks = calculateStreak(stats.sessions);
  stats.currentStreak = streaks.current;
  stats.longestStreak = Math.max(stats.longestStreak, streaks.longest);

  savePracticeStats(stats);
  return stats;
}

/**
 * Get practice time for today in milliseconds
 */
export function getTodayPracticeTime(): number {
  const stats = loadPracticeStats();
  const today = getTodayDate();
  const todaySession = stats.sessions.find((s) => s.date === today);
  return todaySession?.durationMs ?? 0;
}

/**
 * Type guard for PracticeStats
 */
function isValidPracticeStats(value: unknown): value is PracticeStats {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    Array.isArray(obj.sessions) &&
    typeof obj.totalTimeMs === "number" &&
    typeof obj.currentStreak === "number" &&
    typeof obj.longestStreak === "number"
  );
}
