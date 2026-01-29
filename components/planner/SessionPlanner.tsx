"use client";

import {
  CheckCircle2,
  ChevronRight,
  Clock,
  ListMusic,
  Pause,
  Play,
  SkipForward,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  SESSION_PHASES,
  type SessionPhase,
} from "@/state/slices/sessionPlannerSlice";
import { useAppStore } from "@/state/useAppStore";

interface SessionPlannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PHASE_COLORS: Record<SessionPhase, string> = {
  warmup: "text-amber-600 dark:text-amber-400",
  technique: "text-blue-600 dark:text-blue-400",
  improv: "text-violet-600 dark:text-violet-400",
  cooldown: "text-emerald-600 dark:text-emerald-400",
};

const PHASE_BG: Record<SessionPhase, string> = {
  warmup: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
  technique: "from-blue-500/10 to-cyan-500/10 border-blue-500/20",
  improv: "from-violet-500/10 to-purple-500/10 border-violet-500/20",
  cooldown: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
};

const PHASE_PROGRESS_BG: Record<SessionPhase, string> = {
  warmup: "bg-amber-500",
  technique: "bg-blue-500",
  improv: "bg-violet-500",
  cooldown: "bg-emerald-500",
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function SessionPlanner({ open, onOpenChange }: SessionPlannerProps) {
  const sessionActive = useAppStore((s) => s.sessionActive);
  const sessionPhaseIndex = useAppStore((s) => s.sessionPhaseIndex);
  const sessionPhaseElapsedMs = useAppStore((s) => s.sessionPhaseElapsedMs);
  const sessionTotalElapsedMs = useAppStore((s) => s.sessionTotalElapsedMs);
  const sessionPaused = useAppStore((s) => s.sessionPaused);

  const startSession = useAppStore((s) => s.startSession);
  const endSession = useAppStore((s) => s.endSession);
  const advancePhase = useAppStore((s) => s.advancePhase);
  const goToPhase = useAppStore((s) => s.goToPhase);
  const tickSessionTimer = useAppStore((s) => s.tickSessionTimer);
  const toggleSessionPause = useAppStore((s) => s.toggleSessionPause);

  const currentPhase = SESSION_PHASES[sessionPhaseIndex];
  const totalSessionMinutes = SESSION_PHASES.reduce(
    (sum, p) => sum + p.durationMinutes,
    0,
  );

  // Timer tick
  const lastTickRef = useRef<number>(0);
  useEffect(() => {
    if (!sessionActive || sessionPaused) {
      lastTickRef.current = 0;
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      if (lastTickRef.current === 0) {
        lastTickRef.current = now;
        return;
      }
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      tickSessionTimer(delta);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive, sessionPaused, tickSessionTimer]);

  // Auto-advance when phase time is exceeded
  useEffect(() => {
    if (!sessionActive || !currentPhase) return;
    const phaseMs = currentPhase.durationMinutes * 60 * 1000;
    if (sessionPhaseElapsedMs >= phaseMs) {
      advancePhase();
    }
  }, [sessionActive, sessionPhaseElapsedMs, currentPhase, advancePhase]);

  const handleStart = useCallback(() => {
    startSession();
  }, [startSession]);

  const handleEnd = useCallback(() => {
    endSession();
  }, [endSession]);

  const phaseProgress = currentPhase
    ? Math.min(
        100,
        (sessionPhaseElapsedMs / (currentPhase.durationMinutes * 60 * 1000)) *
          100,
      )
    : 0;

  const totalProgress = Math.min(
    100,
    (sessionTotalElapsedMs / (totalSessionMinutes * 60 * 1000)) * 100,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-cyan-500" />
            Practice Session
          </SheetTitle>
          <SheetDescription>
            Structured warmup &rarr; technique &rarr; improv &rarr; cooldown
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 space-y-5">
          {/* Session overview */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {totalSessionMinutes} min total
            </span>
            <span>{SESSION_PHASES.length} phases</span>
          </div>

          {/* Start / active controls */}
          {!sessionActive ? (
            <Button onClick={handleStart} className="w-full gap-2">
              <Play className="w-4 h-4" />
              Start Practice Session
            </Button>
          ) : (
            <div className="space-y-3">
              {/* Overall progress */}
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Session Progress</span>
                  <span>{formatTime(sessionTotalElapsedMs)}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-1000"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
              </div>

              {/* Session controls */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSessionPause}
                  className="flex-1 gap-1.5"
                >
                  {sessionPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      Pause
                    </>
                  )}
                </Button>
                {sessionPhaseIndex < SESSION_PHASES.length - 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={advancePhase}
                    className="flex-1 gap-1.5"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    Next Phase
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEnd}
                  className="gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  End
                </Button>
              </div>
            </div>
          )}

          {/* Phase list */}
          <div className="space-y-2.5">
            {SESSION_PHASES.map((phase, index) => {
              const isActive = sessionActive && index === sessionPhaseIndex;
              const isCompleted = sessionActive && index < sessionPhaseIndex;
              const isFuture = sessionActive && index > sessionPhaseIndex;

              return (
                <button
                  key={phase.phase}
                  type="button"
                  onClick={() => {
                    if (sessionActive) goToPhase(index);
                  }}
                  disabled={!sessionActive}
                  className={cn(
                    "w-full text-left rounded-xl border p-3.5 transition-all duration-200",
                    isActive &&
                      `bg-gradient-to-br ${PHASE_BG[phase.phase]} ring-1 ring-inset ring-white/10`,
                    isCompleted && "bg-muted/30 border-muted opacity-60",
                    isFuture && "bg-muted/20 border-muted/50 opacity-50",
                    !sessionActive &&
                      `bg-gradient-to-br ${PHASE_BG[phase.phase]}`,
                    sessionActive &&
                      "cursor-pointer hover:opacity-80 active:scale-[0.99]",
                    !sessionActive && "cursor-default",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <span
                            className={cn(
                              "text-xs font-bold uppercase tracking-wider",
                              isActive
                                ? PHASE_COLORS[phase.phase]
                                : "text-muted-foreground",
                            )}
                          >
                            {index + 1}
                          </span>
                        )}
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            isCompleted && "line-through",
                          )}
                        >
                          {phase.label}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-medium bg-foreground/10 px-1.5 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {phase.description}
                      </p>

                      {/* Phase details */}
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                        <span>{phase.durationMinutes} min</span>
                        <span>·</span>
                        <span>{phase.suggestedTempo} BPM</span>
                        <span>·</span>
                        <span className="truncate">
                          {phase.suggestedPreset}
                        </span>
                      </div>

                      {/* Active phase progress */}
                      {isActive && (
                        <div className="mt-2.5">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className={PHASE_COLORS[phase.phase]}>
                              {formatTime(sessionPhaseElapsedMs)}
                            </span>
                            <span className="text-muted-foreground">
                              {formatTime(phase.durationMinutes * 60 * 1000)}
                            </span>
                          </div>
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                PHASE_PROGRESS_BG[phase.phase],
                              )}
                              style={{ width: `${phaseProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Tip for active phase */}
                      {isActive && (
                        <div className="mt-2.5 flex items-start gap-1.5">
                          <ChevronRight
                            className={cn(
                              "w-3 h-3 mt-0.5 shrink-0",
                              PHASE_COLORS[phase.phase],
                            )}
                          />
                          <span className="text-xs italic text-muted-foreground">
                            {phase.tip}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Session complete indicator (when not active after having been active) */}
          {!sessionActive && sessionTotalElapsedMs > 0 && (
            <div className="text-center py-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Session Complete!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Total time: {formatTime(sessionTotalElapsedMs)}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
