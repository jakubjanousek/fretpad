"use client";

import { NoteInfoTooltip } from "@/components/theory/NoteInfoTooltip";
import {
  getFretNoteColor,
  getFretNoteShapeClasses,
  getFretNoteTextColor,
  getOverlayChordRoleColor,
  getOverlayNoteColor,
  getOverlayNoteTextColor,
  getThreeNPSNoteColor,
} from "@/lib/fretboard";
import type { FretNote, NoteLabelMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export type NoteHighlightState = "highlighted" | "dimmed" | "normal";

export type OverlayColorMode = "none" | "caged" | "chord-role";

interface FretMarkerProps {
  note: FretNote;
  labelMode?: NoteLabelMode;
  highlightState?: NoteHighlightState;
  labelOverride?: string;
  overlayMode?: OverlayColorMode;
}

export function FretMarker({
  note,
  labelMode = "notes",
  highlightState = "normal",
  labelOverride,
  overlayMode = "none",
}: FretMarkerProps) {
  const bgColor =
    overlayMode === "caged"
      ? note.threeNPSPosition
        ? getThreeNPSNoteColor(note)
        : getOverlayNoteColor(note)
      : overlayMode === "chord-role"
        ? getOverlayChordRoleColor(note)
        : getFretNoteColor(note);
  const textColor =
    overlayMode !== "none"
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

  // Use shape indicators for chord-role mode (default) for accessibility
  const shapeClasses =
    overlayMode === "none" ? getFretNoteShapeClasses(note) : "rounded-full";

  return (
    <NoteInfoTooltip note={note}>
      <div
        className={cn(
          "w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center",
          shapeClasses,
          "text-xs font-medium cursor-pointer",
          "transition-all duration-150 hover:scale-110 active:scale-95",
          "touch-target-expand animate-note-appear",
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
