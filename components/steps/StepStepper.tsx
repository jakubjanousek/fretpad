"use client";

import { LockKeyhole, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ROLLING_ACCURACY_THRESHOLD,
  ROLLING_ACCURACY_WINDOW,
} from "@/hooks/useRollingAccuracy";
import { MODE_STEPS } from "@/lib/modes";
import type { PracticeModeId } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ProgressConfig {
  /** Progress percentage (0-100) */
  percent: number;
  /** Description shown below the progress bar */
  label: string;
  /** Value shown to the right of the label (e.g. "3 / 5" or "72%") */
  valueLabel: string;
}

interface StepStepperProps {
  modeId: PracticeModeId;
  currentStepIndex: number;
  unlockedStepIndex: number;
  accuracy: number;
  attemptCount: number;
  /** Optional custom progress config. When provided, overrides accuracy-based progress. */
  progressConfig?: ProgressConfig;
  /** Label prefix for steps (default: "Step") */
  stepLabel?: string;
}

export function StepStepper({
  modeId,
  currentStepIndex,
  unlockedStepIndex,
  accuracy,
  attemptCount,
  progressConfig,
  stepLabel = "Step",
}: StepStepperProps) {
  const steps = MODE_STEPS[modeId];
  const safeCurrentStepIndex = Math.max(
    0,
    Math.min(currentStepIndex, steps.length - 1),
  );
  const nextStepIndex =
    unlockedStepIndex < steps.length - 1 ? unlockedStepIndex + 1 : null;

  // Use custom progress config or default accuracy-based progress
  const accuracyPercent = Math.round(accuracy * 100);
  const defaultProgressPercent =
    attemptCount === 0
      ? 0
      : Math.min(accuracy / ROLLING_ACCURACY_THRESHOLD, 1) * 100;

  const progress: ProgressConfig = progressConfig ?? {
    percent: defaultProgressPercent,
    label:
      nextStepIndex === null
        ? "All steps are unlocked."
        : `Reach ${Math.round(ROLLING_ACCURACY_THRESHOLD * 100)}% over the last ${ROLLING_ACCURACY_WINDOW} attempts to unlock the next step.`,
    valueLabel: attemptCount === 0 ? "No attempts yet" : `${accuracyPercent}%`,
  };

  return (
    <section className="rounded-lg border bg-card px-4 py-3 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Guided Steps</Badge>
            <span className="text-sm font-medium">
              {stepLabel} {safeCurrentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {steps[safeCurrentStepIndex]?.label}
          </p>
        </div>
        {nextStepIndex === null ? (
          <Badge className="gap-1">
            <Sparkles className="h-3 w-3" />
            All unlocked
          </Badge>
        ) : (
          <Badge variant="outline">
            Next unlock: {steps[nextStepIndex]?.label}
          </Badge>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-none lg:grid-flow-col">
        {steps.map((step, index) => {
          const isUnlocked = index <= unlockedStepIndex;
          const isCurrent = index === safeCurrentStepIndex;

          return (
            <div
              key={step.id}
              className={cn(
                "rounded-md border px-3 py-2 transition-colors",
                isCurrent && "border-primary bg-primary/5",
                !isUnlocked && "border-dashed opacity-60",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {stepLabel} {index + 1}
                </span>
                {!isUnlocked && (
                  <LockKeyhole className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <p className="mt-1 text-sm font-medium">{step.label}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            {nextStepIndex === null
              ? "All steps are unlocked."
              : progress.label}
          </span>
          <span className="tabular-nums">{progress.valueLabel}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>
    </section>
  );
}
