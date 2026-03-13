"use client";

import { Clock, Flame, Music, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  getTodayPracticeTime,
  loadPracticeStats,
  type PracticeStats as PracticeStatsType,
} from "@/lib/persistence";
import { cn } from "@/lib/utils";

interface PracticeStatsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todayTimeMs?: number; // Live today time from parent
}

/**
 * Format milliseconds to human-readable duration
 */
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Format milliseconds to short duration (for stats cards)
 */
function formatShortDuration(ms: number): { value: string; unit: string } {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);

  if (hours > 0) {
    const mins = totalMinutes % 60;
    return {
      value: `${hours}:${mins.toString().padStart(2, "0")}`,
      unit: "hours",
    };
  }
  return { value: totalMinutes.toString(), unit: "min" };
}

/**
 * Get a motivational message based on practice time
 */
function getMotivationalMessage(todayMs: number, streak: number): string {
  const todayMinutes = Math.floor(todayMs / 60000);

  if (todayMinutes === 0) {
    if (streak > 0) {
      return `${streak} day streak! Keep it going today.`;
    }
    return "Start practicing to build your streak!";
  }

  if (todayMinutes < 5) {
    return "Great start! Every minute counts.";
  }

  if (todayMinutes < 15) {
    return "Nice progress! Keep going.";
  }

  if (todayMinutes < 30) {
    return "Solid practice session!";
  }

  return "Amazing dedication today!";
}

export function PracticeStats({
  open,
  onOpenChange,
  todayTimeMs,
}: PracticeStatsProps) {
  const [stats, setStats] = useState<PracticeStatsType | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (open) {
      const loaded = loadPracticeStats();
      setStats(loaded);
      setIsLoaded(true);
    }
  }, [open]);

  // Use live today time if provided, otherwise from stats
  const todayTime = todayTimeMs ?? getTodayPracticeTime();
  const totalTime =
    (stats?.totalTimeMs ?? 0) +
    (todayTimeMs ? todayTimeMs - getTodayPracticeTime() : 0);

  const todayFormatted = formatShortDuration(todayTime);
  const totalFormatted = formatShortDuration(totalTime);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Practice Stats
          </SheetTitle>
          <SheetDescription>
            Track your guitar practice progress
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 space-y-6">
          {/* Motivational message */}
          {isLoaded && (
            <div className="text-sm text-muted-foreground italic">
              {getMotivationalMessage(todayTime, stats?.currentStreak ?? 0)}
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Today's practice */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-4 border border-cyan-500/20">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Today</span>
              </div>
              <div className="text-2xl font-bold">{todayFormatted.value}</div>
              <div className="text-xs text-muted-foreground">
                {todayFormatted.unit}
              </div>
            </div>

            {/* Current streak */}
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
                <Flame className="w-4 h-4" />
                <span className="text-xs font-medium">Streak</span>
              </div>
              <div className="text-2xl font-bold">
                {stats?.currentStreak ?? 0}
              </div>
              <div className="text-xs text-muted-foreground">days</div>
            </div>

            {/* Total time */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                <Music className="w-4 h-4" />
                <span className="text-xs font-medium">Total</span>
              </div>
              <div className="text-2xl font-bold">{totalFormatted.value}</div>
              <div className="text-xs text-muted-foreground">
                {totalFormatted.unit}
              </div>
            </div>

            {/* Longest streak */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-4 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-medium">Best Streak</span>
              </div>
              <div className="text-2xl font-bold">
                {stats?.longestStreak ?? 0}
              </div>
              <div className="text-xs text-muted-foreground">days</div>
            </div>
          </div>

          {/* Recent sessions */}
          {isLoaded && stats && stats.sessions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Recent Sessions</h4>
              <div className="space-y-2">
                {stats.sessions
                  .slice(-7)
                  .reverse()
                  .map((session, index) => {
                    const date = new Date(session.date);
                    const isToday =
                      session.date === new Date().toISOString().split("T")[0];
                    const dayName = isToday
                      ? "Today"
                      : date.toLocaleDateString("en-US", { weekday: "short" });

                    return (
                      <div
                        key={`${session.date}-${session.mode ?? "default"}-${index}`}
                        className={cn(
                          "flex items-center justify-between py-2 px-3 rounded-lg",
                          isToday ? "bg-cyan-500/10" : "bg-muted/50",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "text-xs font-medium w-12",
                              isToday && "text-cyan-600 dark:text-cyan-400",
                            )}
                          >
                            {dayName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {session.mode && (
                            <span className="text-xs text-muted-foreground capitalize">
                              {session.mode.replaceAll("-", " ")}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {formatDuration(session.durationMs)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {isLoaded && (!stats || stats.sessions.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No practice sessions yet.</p>
              <p className="text-xs mt-1">
                Hit play to start tracking your progress!
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
