"use client";

import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Music,
  Scale,
  Shuffle,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Chord, Progression } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChordInfoPanel } from "./ChordInfoPanel";
import { ChordSubstitutionsPanel } from "./ChordSubstitutionsPanel";
import { KeyAnalysisPanel } from "./KeyAnalysisPanel";
import { ModeComparisonPanel } from "./ModeComparisonPanel";
import { ProgressionAnalysisPanel } from "./ProgressionAnalysisPanel";

interface TheoryPanelProps {
  chord: Chord | null;
  progression: Progression;
}

/**
 * Collapsible panel below the fretboard for displaying chord theory information.
 * Shows chord tones, scales, substitutions, mode comparisons, and harmonic analysis.
 */
export function TheoryPanel({ chord, progression }: TheoryPanelProps) {
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
            <Tabs defaultValue="chord">
              <TabsList className="grid w-full grid-cols-4 h-9 mb-4">
                <TabsTrigger value="chord" className="text-xs gap-1.5">
                  <Music className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Chord</span>
                </TabsTrigger>
                <TabsTrigger value="modes" className="text-xs gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Modes</span>
                </TabsTrigger>
                <TabsTrigger value="subs" className="text-xs gap-1.5">
                  <Shuffle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Subs</span>
                </TabsTrigger>
                <TabsTrigger value="analysis" className="text-xs gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Analysis</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chord" className="mt-0">
                <ChordInfoPanel chord={chord} />
              </TabsContent>

              <TabsContent value="modes" className="mt-0">
                {chord ? (
                  <ModeComparisonPanel root={chord.root} />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Select a chord to compare modes
                  </div>
                )}
              </TabsContent>

              <TabsContent value="subs" className="mt-0">
                {chord ? (
                  <ChordSubstitutionsPanel chord={chord} />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Select a chord to see substitutions
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analysis" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <KeyAnalysisPanel progression={progression} />
                  <ProgressionAnalysisPanel progression={progression} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
