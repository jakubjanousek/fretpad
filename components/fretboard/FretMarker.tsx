"use client";

import { NoteInfoTooltip } from "@/components/theory/NoteInfoTooltip";
import { getFretNoteColor, getFretNoteTextColor } from "@/lib/fretboard";
import type { FretNote, NoteLabelMode } from "@/lib/types";

interface FretMarkerProps {
  note: FretNote;
  labelMode?: NoteLabelMode;
}

export function FretMarker({ note, labelMode = "notes" }: FretMarkerProps) {
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
        className={`
          w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center
          text-xs font-medium cursor-pointer
          transition-transform hover:scale-110 active:scale-95
          touch-target-sm
          ${bgColor} ${textColor}
        `}
      >
        {getLabel()}
      </div>
    </NoteInfoTooltip>
  );
}
