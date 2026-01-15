"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getFretNoteColor, getFretNoteTextColor } from "@/lib/fretboard";
import type { FretNote } from "@/lib/types";

interface FretMarkerProps {
  note: FretNote;
}

export function FretMarker({ note }: FretMarkerProps) {
  const bgColor = getFretNoteColor(note);
  const textColor = getFretNoteTextColor(note);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`
              w-7 h-7 rounded-full flex items-center justify-center
              text-xs font-medium cursor-pointer
              transition-transform hover:scale-110
              ${bgColor} ${textColor}
            `}
          >
            {note.note}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">{note.note}</span>
            <span className="text-muted-foreground">
              Interval: {note.interval}
            </span>
            {note.isRoot && (
              <span className="text-orange-500 text-[10px]">Root</span>
            )}
            {note.isGuideTone && !note.isRoot && (
              <span className="text-blue-500 text-[10px]">Guide tone</span>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
