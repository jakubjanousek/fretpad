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
          w-7 h-7 rounded-full flex items-center justify-center
          text-xs font-medium cursor-pointer
          transition-transform hover:scale-110
          ${bgColor} ${textColor}
        `}
      >
        {note.note}
      </div>
    </NoteInfoTooltip>
  );
}
