"use client";

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
 * Slide-out panel for displaying chord information.
 * Wraps ChordInfoPanel in a Sheet component for on-demand access.
 */
export function ChordInfoSheet({
  chord,
  open,
  onOpenChange,
}: ChordInfoSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{chord ? chord.symbol : "Chord Info"}</SheetTitle>
          <SheetDescription>
            {chord
              ? "View chord tones, guide tones, and suggested scales."
              : "Select a chord to see its details."}
          </SheetDescription>
        </SheetHeader>
        <div className="p-4">
          <ChordInfoPanel chord={chord} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
