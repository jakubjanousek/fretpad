import {
  getIntervalName,
  isChordTone,
  isGuideTone,
  isRoot,
} from "@/lib/theory/chords";
import { getScaleNotes } from "@/lib/theory/scales";
import type { CAGEDPosition, Chord, FretNote, NoteName } from "@/lib/types";
import { STANDARD_TUNING } from "@/lib/types";

/**
 * All chromatic notes in order (using sharps)
 */
const CHROMATIC_NOTES: NoteName[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

/**
 * Gets the pitch class (0-11) for a note name
 */
function getPitchClass(note: string): number {
  const noteMap: Record<string, number> = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };
  return noteMap[note] ?? 0;
}

/**
 * Gets the note name at a specific fret on a string
 */
export function getNoteAtFret(openString: NoteName, fret: number): NoteName {
  const openPitchClass = getPitchClass(openString);
  const newPitchClass = (openPitchClass + fret) % 12;
  // newPitchClass is always 0-11 due to modulo, so index is always valid
  return CHROMATIC_NOTES[newPitchClass] ?? "C";
}

/**
 * Generates the complete fretboard layout
 * Returns a 2D array where [string][fret] = NoteName
 */
export function generateFretboardLayout(
  numFrets: number = 12,
  tuning: NoteName[] = STANDARD_TUNING,
): NoteName[][] {
  const layout: NoteName[][] = [];

  for (let stringNum = 0; stringNum < tuning.length; stringNum++) {
    const openString = tuning[stringNum];
    if (!openString) continue;
    const stringNotes: NoteName[] = [];
    for (let fret = 0; fret <= numFrets; fret++) {
      stringNotes.push(getNoteAtFret(openString, fret));
    }
    layout.push(stringNotes);
  }

  return layout;
}

/**
 * Checks if two notes are enharmonically equivalent
 */
function enharmonicEqual(note1: string, note2: string): boolean {
  return getPitchClass(note1) === getPitchClass(note2);
}

/**
 * Checks if a note is in a scale (using enharmonic comparison)
 */
function isNoteInScale(note: NoteName, scaleNotes: NoteName[]): boolean {
  return scaleNotes.some((scaleNote) => enharmonicEqual(note, scaleNote));
}

export interface GetFretNotesOptions {
  includeScale?: boolean;
  scaleName?: string;
  numFrets?: number;
  tuning?: NoteName[];
}

/**
 * Gets all fret notes for a chord, optionally including scale notes
 * Returns an array of FretNote objects for visualization
 */
export function getFretNotesForChord(
  chord: Chord,
  options: GetFretNotesOptions = {},
): FretNote[] {
  const {
    includeScale = false,
    scaleName,
    numFrets = 12,
    tuning = STANDARD_TUNING,
  } = options;

  const fretNotes: FretNote[] = [];
  const layout = generateFretboardLayout(numFrets, tuning);

  // Get scale notes if requested
  let scaleNotes: NoteName[] = [];
  if (includeScale && scaleName) {
    // Extract just the scale type from full scale name (e.g., "D Dorian" -> "Dorian")
    const scaleType = scaleName.includes(" ")
      ? scaleName.split(" ").slice(1).join(" ")
      : scaleName;
    scaleNotes = getScaleNotes(chord.root, scaleType);
  }

  // Iterate through each position on the fretboard
  for (let stringNum = 0; stringNum < tuning.length; stringNum++) {
    const stringNotes = layout[stringNum];
    if (!stringNotes) continue;
    for (let fret = 0; fret <= numFrets; fret++) {
      const note = stringNotes[fret];
      if (!note) continue;

      const noteIsRoot = isRoot(chord, note);
      const noteIsChordTone = isChordTone(chord, note);
      const noteIsGuideTone = isGuideTone(chord, note);
      const noteIsScaleTone =
        includeScale && isNoteInScale(note, scaleNotes) && !noteIsChordTone;

      // Only include notes that are chord tones or scale tones (if showing scale)
      if (noteIsChordTone || noteIsScaleTone) {
        const interval = getIntervalName(chord.root, note);

        fretNotes.push({
          string: stringNum + 1, // 1-indexed (1 = high E)
          fret,
          note,
          interval,
          isRoot: noteIsRoot,
          isChordTone: noteIsChordTone,
          isGuideTone: noteIsGuideTone,
          isScaleTone: noteIsScaleTone,
        });
      }
    }
  }

  return fretNotes;
}

/**
 * Gets the color class for a fret note based on its role
 * Uses the design tokens from CLAUDE.md
 */
export function getFretNoteColor(note: FretNote): string {
  if (note.isRoot) {
    return "bg-orange-500";
  }
  if (note.isGuideTone) {
    return "bg-blue-500";
  }
  if (note.isChordTone) {
    return "bg-emerald-500";
  }
  if (note.isScaleTone) {
    return "bg-slate-400";
  }
  return "bg-slate-200";
}

/**
 * Gets the text color class for a fret note
 */
export function getFretNoteTextColor(note: FretNote): string {
  if (note.isRoot || note.isGuideTone || note.isChordTone) {
    return "text-white";
  }
  if (note.isScaleTone) {
    return "text-white";
  }
  return "text-slate-600";
}

/**
 * Color classes for CAGED positions (used in overlay mode)
 */
const CAGED_POSITION_COLORS: Record<CAGEDPosition, string> = {
  1: "bg-purple-500",
  2: "bg-pink-500",
  3: "bg-cyan-500",
  4: "bg-amber-500",
  5: "bg-rose-500",
};

/**
 * Gets the color class for a CAGED position overlay note.
 * Root notes keep orange; others get position-specific colors.
 */
export function getOverlayNoteColor(note: FretNote): string {
  if (note.isRoot) {
    return "bg-orange-500";
  }
  if (note.cagedPosition) {
    return CAGED_POSITION_COLORS[note.cagedPosition];
  }
  return "bg-slate-400";
}

/**
 * Gets the text color for overlay notes
 */
export function getOverlayNoteTextColor(_note: FretNote): string {
  return "text-white";
}
