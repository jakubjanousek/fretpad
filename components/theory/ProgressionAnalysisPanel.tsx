"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  analyzeProgression,
  type BarTension,
  type ProgressionAnalysis,
} from "@/lib/theory/harmonicAnalysis";
import type { Progression } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProgressionAnalysisPanelProps {
  progression: Progression;
  currentBarIndex?: number;
}

/**
 * Inline tension indicator bar
 */
function TensionIndicator({ score }: { score: number }) {
  // Color gradient: 0-3 green, 4-6 yellow, 7-10 red/orange
  const getColor = (s: number): string => {
    if (s < 3) return "bg-emerald-500";
    if (s < 5) return "bg-yellow-500";
    if (s < 7) return "bg-orange-500";
    return "bg-red-500";
  };

  const percentage = Math.min(100, (score / 10) * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", getColor(score))}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground font-mono w-8">
        {score.toFixed(1)}
      </span>
    </div>
  );
}

/**
 * Displays harmonic analysis including patterns, tension, and borrowed chords.
 */
export function ProgressionAnalysisPanel({
  progression,
  currentBarIndex,
}: ProgressionAnalysisPanelProps) {
  const analysis = useMemo<ProgressionAnalysis | null>(
    () => analyzeProgression(progression),
    [progression],
  );

  if (!analysis) {
    return null;
  }

  const currentTension: BarTension | undefined =
    currentBarIndex !== undefined
      ? analysis.tensionScores[currentBarIndex]
      : analysis.tensionScores[0];

  const hasPatterns = analysis.patterns.length > 0;
  const hasBorrowed = analysis.borrowedChords.length > 0;
  const hasSecondaryDominants = analysis.secondaryDominants.length > 0;

  // Don't render if there's nothing to show
  if (!hasPatterns && !hasBorrowed && !hasSecondaryDominants) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium text-muted-foreground">
        Harmonic Analysis
      </h4>

      {/* Detected Patterns */}
      {hasPatterns && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground/70">
            Detected Patterns
          </p>
          <div className="flex flex-wrap gap-1.5">
            {analysis.patterns.map((pattern, index) => (
              <Badge
                key={`pattern-${index}`}
                className={cn(
                  "font-medium text-xs px-2 py-0.5",
                  pattern.category === "cadence" &&
                    "bg-violet-500 hover:bg-violet-600 text-white",
                  pattern.category === "turnaround" &&
                    "bg-blue-500 hover:bg-blue-600 text-white",
                  pattern.category === "modal" &&
                    "bg-amber-500 hover:bg-amber-600 text-white",
                  pattern.category === "secondary" &&
                    "bg-rose-500 hover:bg-rose-600 text-white",
                  pattern.category === "circle" &&
                    "bg-cyan-500 hover:bg-cyan-600 text-white",
                )}
                title={pattern.description}
              >
                {pattern.label}
              </Badge>
            ))}
          </div>
          {analysis.patterns[0] && (
            <p className="text-[10px] text-muted-foreground/70 italic">
              {analysis.patterns[0].description}
            </p>
          )}
        </div>
      )}

      {/* Current Bar Tension */}
      {currentTension && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground/70">
            {currentBarIndex !== undefined
              ? `Bar ${currentBarIndex + 1} Tension`
              : "Tension"}
          </p>
          <TensionIndicator score={currentTension.score} />
          <p className="text-[10px] text-muted-foreground/70 italic">
            {currentTension.explanation}
          </p>
        </div>
      )}

      {/* Borrowed Chords */}
      {hasBorrowed && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground/70">
            Modal Interchange
          </p>
          <div className="space-y-1">
            {analysis.borrowedChords.map((borrowed, index) => (
              <div
                key={`borrowed-${index}`}
                className="flex items-center gap-2"
              >
                <Badge
                  variant="outline"
                  className="font-mono text-xs px-1.5 py-0.5 border-amber-400 text-amber-700 dark:text-amber-300"
                >
                  {borrowed.borrowedNumeral}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {borrowed.symbol} — {borrowed.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Secondary Dominants */}
      {hasSecondaryDominants && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground/70">
            Secondary Dominants
          </p>
          <div className="space-y-1">
            {analysis.secondaryDominants.map((secondary, index) => (
              <div
                key={`secondary-${index}`}
                className="flex items-center gap-2"
              >
                <Badge
                  variant="outline"
                  className="font-mono text-xs px-1.5 py-0.5 border-rose-400 text-rose-700 dark:text-rose-300"
                >
                  {secondary.notation}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {secondary.dominantSymbol} → {secondary.targetSymbol}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
