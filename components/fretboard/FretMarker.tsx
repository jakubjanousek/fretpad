"use client";

import { NoteInfoTooltip } from "@/components/theory/NoteInfoTooltip";
import { getFretNoteColor, getFretNoteTextColor } from "@/lib/fretboard";
import type { FretNote, NoteLabelMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export type NoteHighlightState = "highlighted" | "dimmed" | "normal";

interface FretMarkerProps {
  note: FretNote;
  labelMode?: NoteLabelMode;
  highlightState?: NoteHighlightState;
}

export function FretMarker({
  note,
  labelMode = "notes",
  highlightState = "normal",
}: FretMarkerProps) {
  const bgColor = getFretNoteColor(note);
  const textColor = getFretNoteTextColor(note);

  const getLabel = (): string => {
    switch (labelMode) {
      case "intervals":
        return note.interval;
      case "none":
        return "";
      default:
        return note.note;
    }
  };

  return (
    <NoteInfoTooltip note={note}>
      <div
        className={cn(
          "w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center",
          "text-xs font-medium cursor-pointer",
          "transition-all duration-150 hover:scale-110 active:scale-95",
          "touch-target-sm animate-note-appear",
          bgColor,
          textColor,
          highlightState === "highlighted" &&
            "scale-110 ring-2 ring-white ring-offset-1 ring-offset-background shadow-lg",
          highlightState === "dimmed" && "opacity-25 scale-90",
        )}
      >
        {getLabel()}
      </div>
    </NoteInfoTooltip>
  );
}
