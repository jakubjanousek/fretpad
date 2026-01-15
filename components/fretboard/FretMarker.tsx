"use client";

import { NoteInfoTooltip } from "@/components/theory/NoteInfoTooltip";
import { getFretNoteColor, getFretNoteTextColor } from "@/lib/fretboard";
import type { FretNote } from "@/lib/types";

interface FretMarkerProps {
  note: FretNote;
}

export function FretMarker({ note }: FretMarkerProps) {
  const bgColor = getFretNoteColor(note);
  const textColor = getFretNoteTextColor(note);

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
        {note.note}
      </div>
    </NoteInfoTooltip>
  );
}
