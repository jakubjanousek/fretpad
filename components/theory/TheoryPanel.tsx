"use client";

import { ChevronDown, ChevronUp, Music } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import type { Chord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChordInfoPanel } from "./ChordInfoPanel";

interface TheoryPanelProps {
  chord: Chord | null;
}

export function TheoryPanel({ chord }: TheoryPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Collapsible header - always visible */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-2.5",
            "hover:bg-muted/50 transition-colors",
            "border-b border-transparent",
            isOpen && "border-border",
          )}
        >
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-sm">
              {chord ? `${chord.symbol} Theory` : "Theory"}
            </span>
            {chord && (
              <span className="text-xs text-muted-foreground">
                {chord.notes.join(" · ")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isOpen && chord && (
              <span className="text-xs text-muted-foreground">
                Click to expand
              </span>
            )}
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </button>

        <CollapsibleContent>
          <CardContent className="pt-4 pb-4 max-h-[50vh] overflow-y-auto">
            <ChordInfoPanel chord={chord} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
