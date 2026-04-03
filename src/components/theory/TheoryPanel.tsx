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
    <div className="rounded-2xl border border-stone-800/50 bg-stone-900/30 backdrop-blur-sm overflow-hidden">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-5 py-3",
          "hover:bg-stone-800/30 transition-colors",
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-medium text-stone-200">Theory</span>
          {chord && (
            <span className="text-xs text-stone-500">
              {chord.symbol} — {chord.notes.join(" · ")}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" />
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
