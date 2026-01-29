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
    if (
      progressionName &&
      !todaySession.progressionNames.includes(progressionName)
    ) {
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
