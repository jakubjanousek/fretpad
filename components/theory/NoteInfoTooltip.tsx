"use client";

import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FretNote } from "@/lib/types";

interface NoteInfoTooltipProps {
  note: FretNote;
  children: ReactNode;
}

/**
 * Formats interval for display
 * e.g., "1" -> "Root (1)", "b3" -> "Minor 3rd (b3)", "5" -> "Perfect 5th (5)"
 */
function formatInterval(interval: string): string {
  const intervalNames: Record<string, string> = {
    "1": "Root",
    b2: "Minor 2nd",
    "2": "Major 2nd",
    b3: "Minor 3rd",
    "3": "Major 3rd",
    "4": "Perfect 4th",
    "#4": "Augmented 4th",
    b5: "Diminished 5th",
    "5": "Perfect 5th",
    "#5": "Augmented 5th",
    b6: "Minor 6th",
    "6": "Major 6th",
    bb7: "Diminished 7th",
    b7: "Minor 7th",
    "7": "Major 7th",
    b9: "Minor 9th",
    "9": "Major 9th",
    "#9": "Augmented 9th",
    "11": "Perfect 11th",
    "#11": "Augmented 11th",
    b13: "Minor 13th",
    "13": "Major 13th",
  };

  const name = intervalNames[interval];
  return name ? `${name} (${interval})` : interval;
}

/**
 * Get the role of the note based on its flags
 */
function getNoteRole(note: FretNote): string | null {
  if (note.isRoot) return "Root";
  if (note.isGuideTone) return "Guide Tone";
  if (note.isChordTone) return "Chord Tone";
  if (note.isScaleTone) return "Scale Tone";
  return null;
}

/**
 * Get the color class for the note role badge
 */
function getRoleColorClass(note: FretNote): string {
  if (note.isRoot) return "text-orange-500";
  if (note.isGuideTone) return "text-blue-500";
  if (note.isChordTone) return "text-emerald-500";
  if (note.isScaleTone) return "text-slate-400";
  return "text-muted-foreground";
}

export function NoteInfoTooltip({ note, children }: NoteInfoTooltipProps) {
  const role = getNoteRole(note);
  const roleColorClass = getRoleColorClass(note);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-sm">{note.note}</span>
            <span className="text-muted-foreground">
              {formatInterval(note.interval)}
            </span>
            {role && (
              <span className={`text-[10px] font-medium ${roleColorClass}`}>
                {role}
              </span>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
