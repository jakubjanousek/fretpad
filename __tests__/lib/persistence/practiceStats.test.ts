import { beforeEach, describe, expect, it } from "vitest";
import {
  getTodayPracticeTime,
  loadPracticeStats,
  type PracticeStats,
  recordPracticeTime,
  savePracticeStats,
} from "@/lib/persistence/practiceStats";

function todayISO(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

function daysAgoISO(days: number): string {
  return (
    new Date(Date.now() - days * 86400000).toISOString().split("T")[0] ?? ""
  );
}

describe("practiceStats", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("loadPracticeStats", () => {
    it("returns default stats when nothing stored", () => {
      const stats = loadPracticeStats();
      expect(stats.sessions).toEqual([]);
      expect(stats.totalTimeMs).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.longestStreak).toBe(0);
      expect(stats.lastPracticeDate).toBeNull();
    });

    it("returns default stats for corrupted data", () => {
      localStorage.setItem("fretpad-practice-stats", "not json");
      const stats = loadPracticeStats();
      expect(stats.sessions).toEqual([]);
    });

    it("returns default stats for invalid structure", () => {
      localStorage.setItem(
        "fretpad-practice-stats",
        JSON.stringify({ not: "valid" }),
      );
      const stats = loadPracticeStats();
      expect(stats.sessions).toEqual([]);
    });
  });

  describe("savePracticeStats / loadPracticeStats roundtrip", () => {
    it("roundtrips practice stats", () => {
      const stats: PracticeStats = {
        sessions: [
          {
            date: todayISO(),
            durationMs: 60000,
            progressionNames: ["ii-V-I in C"],
          },
        ],
        totalTimeMs: 60000,
        currentStreak: 1,
        longestStreak: 1,
        lastPracticeDate: todayISO(),
      };

      savePracticeStats(stats);
      const loaded = loadPracticeStats();
      expect(loaded.totalTimeMs).toBe(60000);
      expect(loaded.sessions).toHaveLength(1);
      expect(loaded.lastPracticeDate).toBe(todayISO());
    });
  });

  describe("recordPracticeTime", () => {
    it("creates a new session for today", () => {
      const stats = recordPracticeTime(30000, "ii-V-I in C");
      expect(stats.sessions).toHaveLength(1);
      expect(stats.sessions[0]?.date).toBe(todayISO());
      expect(stats.sessions[0]?.durationMs).toBe(30000);
      expect(stats.sessions[0]?.progressionNames).toContain("ii-V-I in C");
      expect(stats.totalTimeMs).toBe(30000);
      expect(stats.lastPracticeDate).toBe(todayISO());
    });

    it("accumulates duration for same day", () => {
      recordPracticeTime(30000, "ii-V-I in C");
      const stats = recordPracticeTime(20000, "12-Bar Blues");

      expect(stats.sessions).toHaveLength(1);
      expect(stats.sessions[0]?.durationMs).toBe(50000);
      expect(stats.totalTimeMs).toBe(50000);
    });

    it("accumulates progression names without duplicates", () => {
      recordPracticeTime(30000, "ii-V-I in C");
      const stats = recordPracticeTime(20000, "ii-V-I in C");

      expect(stats.sessions[0]?.progressionNames).toEqual(["ii-V-I in C"]);
    });

    it("adds new progression names to existing session", () => {
      recordPracticeTime(30000, "ii-V-I in C");
      const stats = recordPracticeTime(20000, "12-Bar Blues");

      expect(stats.sessions[0]?.progressionNames).toContain("ii-V-I in C");
      expect(stats.sessions[0]?.progressionNames).toContain("12-Bar Blues");
    });

    it("records without progression name", () => {
      const stats = recordPracticeTime(30000);
      expect(stats.sessions[0]?.progressionNames).toEqual([]);
    });
  });

  describe("getTodayPracticeTime", () => {
    it("returns 0 when no practice today", () => {
      expect(getTodayPracticeTime()).toBe(0);
    });

    it("returns today's practice duration", () => {
      recordPracticeTime(45000);
      expect(getTodayPracticeTime()).toBe(45000);
    });
  });

  describe("streak calculation", () => {
    it("calculates current streak of 1 for today only", () => {
      const stats = recordPracticeTime(30000);
      expect(stats.currentStreak).toBe(1);
    });

    it("calculates streak for consecutive days", () => {
      const baseStats: PracticeStats = {
        sessions: [
          { date: todayISO(), durationMs: 30000, progressionNames: [] },
          { date: daysAgoISO(1), durationMs: 30000, progressionNames: [] },
          { date: daysAgoISO(2), durationMs: 30000, progressionNames: [] },
        ],
        totalTimeMs: 90000,
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: todayISO(),
      };

      savePracticeStats(baseStats);
      const loaded = loadPracticeStats();
      expect(loaded.currentStreak).toBe(3);
    });

    it("detects no streak when only non-recent sessions exist", () => {
      const baseStats: PracticeStats = {
        sessions: [
          { date: daysAgoISO(5), durationMs: 30000, progressionNames: [] },
          { date: daysAgoISO(6), durationMs: 30000, progressionNames: [] },
        ],
        totalTimeMs: 60000,
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: daysAgoISO(5),
      };

      savePracticeStats(baseStats);
      const loaded = loadPracticeStats();
      expect(loaded.currentStreak).toBe(0);
      expect(loaded.longestStreak).toBe(2);
    });

    it("tracks longest streak across all sessions", () => {
      const baseStats: PracticeStats = {
        sessions: [
          { date: daysAgoISO(5), durationMs: 30000, progressionNames: [] },
          { date: daysAgoISO(6), durationMs: 30000, progressionNames: [] },
          { date: daysAgoISO(7), durationMs: 30000, progressionNames: [] },
          { date: daysAgoISO(8), durationMs: 30000, progressionNames: [] },
        ],
        totalTimeMs: 120000,
        currentStreak: 0,
        longestStreak: 5, // previously achieved
        lastPracticeDate: daysAgoISO(5),
      };

      savePracticeStats(baseStats);
      const loaded = loadPracticeStats();
      expect(loaded.currentStreak).toBe(0);
      expect(loaded.longestStreak).toBe(5); // preserves previously achieved longest
    });
  });
});
