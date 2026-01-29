"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { detectKey } from "@/lib/theory/keyDetection";
import type { Progression } from "@/lib/types";
import { cn } from "@/lib/utils";

interface KeyAnalysisPanelProps {
  progression: Progression;
}

/**
 * Displays detected key and roman numeral analysis for the current progression.
 */
export function KeyAnalysisPanel({ progression }: KeyAnalysisPanelProps) {
  const detectedKeys = useMemo(() => detectKey(progression, 2), [progression]);

  const primaryKey = detectedKeys[0];
  const alternateKey = detectedKeys[1];

  if (!primaryKey) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground">
        Detected Key
      </h4>

      {/* Primary key */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          className={cn(
            "font-semibold text-sm px-2.5 py-0.5",
            "bg-violet-500 hover:bg-violet-600 text-white",
          )}
        >
          {primaryKey.label}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {Math.min(100, Math.round(primaryKey.confidence * 100))}% match
        </span>
        {alternateKey &&
          alternateKey.confidence > 0.5 &&
          alternateKey.confidence >= primaryKey.confidence - 0.15 && (
            <>
              <span className="text-xs text-muted-foreground">or</span>
              <Badge
                variant="outline"
                className="font-medium text-xs px-2 py-0.5 border-violet-400 text-violet-700 dark:text-violet-300"
              >
                {alternateKey.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {Math.min(100, Math.round(alternateKey.confidence * 100))}%
              </span>
            </>
          )}
      </div>

      {/* Roman numeral analysis */}
      <div>
        <div className="mb-1.5">
          <h4 className="text-xs font-medium text-muted-foreground">
            Roman Numeral Analysis
          </h4>
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
            In {primaryKey.label}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {primaryKey.romanNumerals.map((numeral, index) => (
            <Badge
              key={`rn-${index}`}
              variant="outline"
              className="font-mono text-xs px-1.5 py-0.5"
            >
              {numeral}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
