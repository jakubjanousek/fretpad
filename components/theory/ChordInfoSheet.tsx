"use client";

import { BarChart3, Music, Scale, Shuffle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Chord } from "@/lib/types";
import { useAppStore } from "@/state/useAppStore";
import { ChordInfoPanel } from "./ChordInfoPanel";
import { ChordSubstitutionsPanel } from "./ChordSubstitutionsPanel";
import { KeyAnalysisPanel } from "./KeyAnalysisPanel";
import { ModeComparisonPanel } from "./ModeComparisonPanel";
import { ProgressionAnalysisPanel } from "./ProgressionAnalysisPanel";

interface ChordInfoSheetProps {
  chord: Chord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Hook to detect if we're on mobile
 */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

/**
 * Slide-out panel for displaying chord information.
 * Uses bottom sheet on mobile, right panel on larger screens.
 */
export function ChordInfoSheet({
  chord,
  open,
  onOpenChange,
}: ChordInfoSheetProps) {
  const isMobile = useIsMobile();
  const progression = useAppStore((state) => state.progression);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "overflow-y-auto max-h-[85vh] rounded-t-xl"
            : "overflow-y-auto"
        }
      >
        {/* Mobile drag handle */}
        {isMobile && (
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
        )}
        <SheetHeader>
          <SheetTitle className="text-lg sm:text-base">
            {chord ? chord.symbol : "Chord Info"}
          </SheetTitle>
          <SheetDescription className="text-sm">
            {chord
              ? "View chord tones, guide tones, scales, and substitutions."
              : "Select a chord to see its details."}
          </SheetDescription>
        </SheetHeader>
        <Tabs defaultValue="chord" className="mt-4 px-4">
          <TabsList className="grid w-full grid-cols-4 h-9">
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

          <TabsContent value="chord" className="mt-4 pb-safe">
            <ChordInfoPanel chord={chord} />
          </TabsContent>

          <TabsContent value="modes" className="mt-4 pb-safe">
            {chord ? (
              <ModeComparisonPanel root={chord.root} />
            ) : (
              <div className="text-sm text-muted-foreground">
                Select a chord to compare modes
              </div>
            )}
          </TabsContent>

          <TabsContent value="subs" className="mt-4 pb-safe">
            {chord ? (
              <ChordSubstitutionsPanel chord={chord} />
            ) : (
              <div className="text-sm text-muted-foreground">
                Select a chord to see substitutions
              </div>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="mt-4 pb-safe space-y-5">
            <KeyAnalysisPanel progression={progression} />
            <hr className="border-border" />
            <ProgressionAnalysisPanel progression={progression} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
