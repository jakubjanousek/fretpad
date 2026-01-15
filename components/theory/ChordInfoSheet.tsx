"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Chord } from "@/lib/types";
import { ChordInfoPanel } from "./ChordInfoPanel";

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
              ? "View chord tones, guide tones, and suggested scales."
              : "Select a chord to see its details."}
          </SheetDescription>
        </SheetHeader>
        <div className="p-4 pb-safe">
          <ChordInfoPanel chord={chord} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
