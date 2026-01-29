"use client";

import { NoteInfoTooltip } from "@/components/theory/NoteInfoTooltip";
import {
  getFretNoteColor,
  getFretNoteTextColor,
  getOverlayNoteColor,
  getOverlayNoteTextColor,
} from "@/lib/fretboard";
import type { FretNote, NoteLabelMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export type NoteHighlightState = "highlighted" | "dimmed" | "normal";

interface FretMarkerProps {
  note: FretNote;
  labelMode?: NoteLabelMode;
  highlightState?: NoteHighlightState;
  labelOverride?: string;
  overlayMode?: boolean;
}

export function FretMarker({
  note,
  labelMode = "notes",
  highlightState = "normal",
  labelOverride,
  overlayMode = false,
}: FretMarkerProps) {
  const bgColor = overlayMode
    ? getOverlayNoteColor(note)
    : getFretNoteColor(note);
  const textColor = overlayMode
    ? getOverlayNoteTextColor(note)
    : getFretNoteTextColor(note);

  const getLabel = (): string => {
    switch (labelMode) {
      case "degrees":
        return note.interval.replace(/b/g, "\u266D").replace(/#/g, "\u266F");
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
        {labelOverride ?? getLabel()}
      </div>
    </NoteInfoTooltip>
  );
}
