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
  className?: string;
  onClick?: () => void;
  showVoicingStyle?: boolean;
  showFingerNumber?: boolean;
}

export function FretMarker({
  note,
  labelMode = "notes",
  highlightState = "normal",
  labelOverride,
  overlayMode = "none",
  className,
  onClick,
  showVoicingStyle = false,
  showFingerNumber = false,
}: FretMarkerProps) {
  const isVoicingNote = note.isVoicingNote && showVoicingStyle;

  const bgColor = isVoicingNote
    ? "bg-violet-500"
    : overlayMode === "caged"
      ? note.threeNPSPosition
        ? getThreeNPSNoteColor(note)
        : getOverlayNoteColor(note)
      : overlayMode === "chord-role"
        ? getOverlayChordRoleColor(note)
        : getFretNoteColor(note);
  const textColor =
    isVoicingNote || overlayMode !== "none"
      ? getOverlayNoteTextColor(note)
      : getFretNoteTextColor(note);

  const getLabel = (): string => {
    // Show finger number if voicing mode and finger is set
    if (showFingerNumber && note.voicingFinger) {
      return note.voicingFinger === "T" ? "T" : String(note.voicingFinger);
    }
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
    overlayMode === "none" && !isVoicingNote
      ? getFretNoteShapeClasses(note)
      : "rounded-full";

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
    // Voicing note special styling - violet ring and glow
    isVoicingNote &&
      "ring-2 ring-violet-300 ring-offset-1 ring-offset-background shadow-[0_0_12px_rgba(139,92,246,0.5)]",
    // Barre note indicator
    note.isBarreNote && isVoicingNote && "ring-violet-200",
    className,
  );

  const content = labelOverride ?? getLabel();

  // Use a button when onClick is provided for proper accessibility
  if (onClick) {
    return (
      <NoteInfoTooltip note={note}>
        <button type="button" className={markerClasses} onClick={onClick}>
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
