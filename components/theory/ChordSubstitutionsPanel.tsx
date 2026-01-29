"use client";

import { ArrowRightLeft } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { getSubstitutions } from "@/lib/theory/substitutions";
import type { Chord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChordSubstitutionsPanelProps {
  chord: Chord;
  onSubstitute?: (barIndex: number, chordIndex: number, symbol: string) => void;
}

/**
 * Displays chord substitution suggestions for the current chord.
 */
export function ChordSubstitutionsPanel({
  chord,
}: ChordSubstitutionsPanelProps) {
  const substitutions = useMemo(() => getSubstitutions(chord), [chord]);

  if (substitutions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-muted-foreground">
          Chord Substitutions
        </h4>
        <p className="text-[10px] text-muted-foreground/70 mt-0.5">
          Try instead of {chord.symbol}
        </p>
      </div>
      <div className="space-y-1.5">
        {substitutions.map((sub) => (
          <div
            key={`sub-${sub.symbol}-${sub.type}`}
            className={cn(
              "flex items-start gap-2 px-2 py-1.5 rounded-md",
              "bg-secondary/30 hover:bg-secondary/50 transition-colors",
            )}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-sm">{sub.symbol}</span>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 font-normal"
                >
                  {sub.type}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                {sub.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
