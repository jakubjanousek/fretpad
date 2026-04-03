"use client";

import { memo } from "react";
import { NoteInfoTooltip } from "@/components/theory/NoteInfoTooltip";
import {
  getFretNoteColor,
  getFretNoteShapeClasses,
  getFretNoteTextColor,
  getOverlayChordRoleColor,
  getOverlayNoteColor,
  getOverlayNoteTextColor,
} from "@/lib/fretboard";
import type { FretNote, NoteLabelMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export type NoteHighlightState = "highlighted" | "dimmed" | "normal";

export type OverlayColorMode = "none" | "chord-role";

interface FretMarkerProps {
  note: FretNote;
  labelMode?: NoteLabelMode;
  highlightState?: NoteHighlightState;
  labelOverride?: string;
  overlayMode?: OverlayColorMode;
  className?: string;
  onClickNote?: (note: FretNote) => void;
}

function FretMarkerComponent({
  note,
  labelMode = "notes",
  highlightState = "normal",
  labelOverride,
  overlayMode = "none",
  className,
  onClickNote,
}: FretMarkerProps) {
  const bgColor =
    overlayMode === "chord-role"
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

  const markerClasses = cn(
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
    className,
  );

  const content = labelOverride ?? getLabel();

  // Use a button when onClick is provided for proper accessibility
  if (onClickNote) {
    return (
      <NoteInfoTooltip note={note}>
        <button
          type="button"
          className={markerClasses}
          onClick={() => onClickNote(note)}
        >
          {content}
        </button>
      </NoteInfoTooltip>
    );
  }

  return (
    <NoteInfoTooltip note={note}>
      <div className={markerClasses}>{content}</div>
    </NoteInfoTooltip>
  );
}

function areEqual(prev: FretMarkerProps, next: FretMarkerProps) {
  return (
    prev.labelMode === next.labelMode &&
    prev.highlightState === next.highlightState &&
    prev.labelOverride === next.labelOverride &&
    prev.overlayMode === next.overlayMode &&
    prev.className === next.className &&
    prev.onClickNote === next.onClickNote &&
    prev.note.note === next.note.note &&
    prev.note.interval === next.note.interval &&
    prev.note.string === next.note.string &&
    prev.note.fret === next.note.fret &&
    prev.note.isRoot === next.note.isRoot &&
    prev.note.isChordTone === next.note.isChordTone &&
    prev.note.isGuideTone === next.note.isGuideTone &&
    prev.note.isScaleTone === next.note.isScaleTone
  );
}

export const FretMarker = memo(FretMarkerComponent, areEqual);
