"use client";

import { CheckCircle2, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import {
  allChallengesComplete,
  getActiveChallenge,
  getNextChallenge,
  getProgressFraction,
  isComplete,
} from "@/lib/challenges/challenges";
import type { PracticeModeId } from "@/lib/types";
import { useAppStore } from "@/state/useAppStore";

interface ChallengeTrackerProps {
  modeId: PracticeModeId;
}

export function ChallengeTracker({ modeId }: ChallengeTrackerProps) {
  const challengeProgress = useAppStore((s) => s.challengeProgress);
  const syncPracticeTime = useAppStore((s) => s.syncPracticeTime);
  const initChallenges = useAppStore((s) => s.initChallenges);

  // Initialize challenges on mount
  useEffect(() => {
    initChallenges();
  }, [initChallenges]);

  // Sync practice time periodically
  useEffect(() => {
    syncPracticeTime();
    const interval = setInterval(syncPracticeTime, 10_000);
    return () => clearInterval(interval);
  }, [syncPracticeTime]);

  const activeChallenge = getActiveChallenge(challengeProgress, modeId);
  const allComplete = allChallengesComplete(challengeProgress, modeId);

  if (allComplete) {
    return <CompletedBadge />;
  }

  if (!activeChallenge) return null;

  const progress = challengeProgress[activeChallenge.id];
  const justCompleted = isComplete(progress);

  if (justCompleted) {
    return <JustCompletedCard title={activeChallenge.title} modeId={modeId} />;
  }

  const nextChallenge = getNextChallenge(challengeProgress, modeId);

  return (
    <ChallengeCard
      title={activeChallenge.title}
      description={activeChallenge.description}
      current={progress?.current ?? 0}
      target={activeChallenge.target}
      fraction={getProgressFraction(activeChallenge, progress)}
      nextTitle={nextChallenge?.title}
    />
  );
}

function ChallengeCard({
  title,
  description,
  current,
  target,
  fraction,
  nextTitle,
}: {
  title: string;
  description: string;
  current: number;
  target: number;
  fraction: number;
  nextTitle?: string;
}) {
  const percentage = Math.round(fraction * 100);

  return (
    <div className="min-h-[72px] rounded-lg border bg-card px-4 py-3 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-sm text-muted-foreground tabular-nums">
          {current}/{target}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out will-change-[width]"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{description}</span>
        {nextTitle && (
          <span className="text-xs text-muted-foreground shrink-0 ml-2">
            Up next: {nextTitle}
          </span>
        )}
      </div>
    </div>
  );
}

function JustCompletedCard({
  title,
  modeId,
}: {
  title: string;
  modeId: PracticeModeId;
}) {
  const advanceChallenge = useAppStore((s) => s.advanceChallenge);
  const [visible, setVisible] = useState(true);

  // Auto-transition after 3s with cancellation
  useEffect(() => {
    const token = { canceled: false };
    const tid = setTimeout(() => {
      if (!token.canceled) {
        setVisible(false);
        advanceChallenge(modeId);
      }
    }, 3000);
    return () => {
      token.canceled = true;
      clearTimeout(tid);
    };
  }, [modeId, advanceChallenge]);

  if (!visible) return null;

  return (
    <div className="min-h-[72px] rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center gap-3">
      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
      <div className="flex-1">
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          Challenge complete!
        </span>
        <span className="text-sm text-muted-foreground ml-2">{title}</span>
      </div>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          advanceChallenge(modeId);
        }}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Dismiss
      </button>
    </div>
  );
}

function CompletedBadge() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="min-h-[72px] rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-center gap-3">
      <Trophy className="h-5 w-5 text-amber-500 shrink-0" />
      <span className="text-sm font-medium text-amber-700 dark:text-amber-400 flex-1">
        All challenges complete!
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Dismiss
      </button>
    </div>
  );
}
