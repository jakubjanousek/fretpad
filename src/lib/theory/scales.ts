import { Scale } from "tonal";
import type { Chord, NoteName } from "@/lib/types";

/**
 * Gets suggested scales for a chord
 * Returns the suggestedScales from the chord (populated during parsing)
 */
export function getSuggestedScalesForChord(chord: Chord): string[] {
  return chord.suggestedScales;
}

/**
 * Gets the notes of a scale
 * Returns an array of note names
 */
export function getScaleNotes(root: NoteName, scaleName: string): NoteName[] {
  const scale = Scale.get(`${root} ${scaleName}`);
  if (!scale.notes || scale.notes.length === 0) {
    return [];
  }
  return scale.notes as NoteName[];
}

/**
 * Checks if a note is in a given scale
 */
export function isInScale(
  note: NoteName,
  root: NoteName,
  scaleName: string,
): boolean {
  const scaleNotes = getScaleNotes(root, scaleName);
  // Compare pitch classes to handle enharmonics
  return scaleNotes.some((scaleNote) => {
    return enharmonicEqual(note, scaleNote);
  });
}

/**
 * Checks if two notes are enharmonically equivalent
 */
function enharmonicEqual(note1: string, note2: string): boolean {
  const pitchClass1 = getPitchClass(note1);
  const pitchClass2 = getPitchClass(note2);
  return pitchClass1 === pitchClass2;
}

/**
 * Gets the numeric pitch class (0-11) for a note
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
 * Gets the primary suggested scale for a chord (first in the list)
 */
export function getPrimaryScale(chord: Chord): string {
  const scales = getSuggestedScalesForChord(chord);
  return scales[0] || `${chord.root} Major`;
}

/**
 * Extracts just the scale type name from a full scale name
 * e.g., "C Dorian" -> "dorian"
 */
export function getScaleTypeName(fullScaleName: string): string {
  const parts = fullScaleName.split(" ");
  if (parts.length < 2) return "major";
  return parts.slice(1).join(" ").toLowerCase();
}
