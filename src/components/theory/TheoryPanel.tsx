"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { Chord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChordInfoPanel } from "./ChordInfoPanel";

interface TheoryPanelProps {
  chord: Chord | null;
}

export function TheoryPanel({ chord }: TheoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-surface-border bg-surface/50 backdrop-blur-sm overflow-hidden">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-5 py-3",
          "hover:bg-surface-alt/30 transition-colors",
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-medium text-stone-200">Theory</span>
          {chord && (
            <span className="text-xs text-muted-foreground">
              {chord.symbol} — {chord.notes.join(" · ")}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="px-5 pb-5 pt-1">
          <ChordInfoPanel chord={chord} />
        </div>
      </div>
    </div>
  );
}
