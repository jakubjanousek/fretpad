"use client";

import { ChevronUp, Pause, Play, SkipForward, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SESSION_PHASES,
  type SessionPhase,
} from "@/state/slices/sessionPlannerSlice";
import { useAppStore } from "@/state/useAppStore";

interface SessionDockProps {
  onExpand: () => void;
}

const PHASE_DOT_COLOR: Record<SessionPhase, string> = {
  warmup: "bg-amber-500",
  technique: "bg-blue-500",
  improv: "bg-violet-500",
  cooldown: "bg-emerald-500",
};

const PHASE_PROGRESS_BG: Record<SessionPhase, string> = {
  warmup: "bg-amber-500",
  technique: "bg-blue-500",
  improv: "bg-violet-500",
  cooldown: "bg-emerald-500",
};

const PHASE_ACCENT: Record<SessionPhase, string> = {
  warmup: "border-l-amber-500",
  technique: "border-l-blue-500",
  improv: "border-l-violet-500",
  cooldown: "border-l-emerald-500",
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Compact session status bar that appears above the transport bar
 * when a practice session is active. Shows phase, timer, and controls
 * without blocking the fretboard.
 */
export function SessionDock({ onExpand }: SessionDockProps) {
  const sessionActive = useAppStore((s) => s.sessionActive);
  const sessionPaused = useAppStore((s) => s.sessionPaused);
  const sessionPhaseIndex = useAppStore((s) => s.sessionPhaseIndex);
  const sessionPhaseElapsedMs = useAppStore((s) => s.sessionPhaseElapsedMs);
  const toggleSessionPause = useAppStore((s) => s.toggleSessionPause);
  const advancePhase = useAppStore((s) => s.advancePhase);
  const endSession = useAppStore((s) => s.endSession);

  if (!sessionActive) return null;

  const currentPhase = SESSION_PHASES[sessionPhaseIndex];
  if (!currentPhase) return null;

  const phaseMs = currentPhase.durationMinutes * 60 * 1000;
  const phaseProgress = Math.min(100, (sessionPhaseElapsedMs / phaseMs) * 100);
  const isLastPhase = sessionPhaseIndex >= SESSION_PHASES.length - 1;

  return (
    <div
      className={cn(
        "fixed bottom-16 left-0 right-0 z-40 border-t border-l-4 bg-card/95 backdrop-blur-sm animate-in slide-in-from-bottom-2 duration-300",
        PHASE_ACCENT[currentPhase.phase],
      )}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3 h-12">
          {/* Phase indicator + name */}
          <button
            type="button"
            onClick={onExpand}
            className="flex items-center gap-2 min-w-0 shrink-0 hover:opacity-80 transition-opacity"
          >
            <span
              className={cn(
                "w-2.5 h-2.5 rounded-full shrink-0",
                PHASE_DOT_COLOR[currentPhase.phase],
                !sessionPaused && "animate-pulse",
              )}
            />
            <span className="text-sm font-medium truncate">
              {currentPhase.label}
            </span>
          </button>

          {/* Progress bar */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  PHASE_PROGRESS_BG[currentPhase.phase],
                )}
                style={{ width: `${phaseProgress}%` }}
              />
            </div>
            <span className="text-xs font-mono tabular-nums text-muted-foreground shrink-0">
              {formatTime(sessionPhaseElapsedMs)}
              <span className="hidden sm:inline"> / {formatTime(phaseMs)}</span>
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSessionPause}
              aria-label={sessionPaused ? "Resume" : "Pause"}
              className="h-8 w-8 rounded-full"
            >
              {sessionPaused ? (
                <Play className="h-3.5 w-3.5" />
              ) : (
                <Pause className="h-3.5 w-3.5" />
              )}
            </Button>

            {!isLastPhase && (
              <Button
                variant="ghost"
                size="icon"
                onClick={advancePhase}
                aria-label="Next phase"
                className="h-8 w-8 rounded-full"
              >
                <SkipForward className="h-3.5 w-3.5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={endSession}
              aria-label="End session"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </Button>

            <div className="w-px h-5 bg-border mx-0.5 hidden sm:block" />

            <Button
              variant="ghost"
              size="icon"
              onClick={onExpand}
              aria-label="Expand practice session"
              className="h-8 w-8 rounded-full"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
