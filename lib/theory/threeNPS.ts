import { generateFretboardLayout } from "@/lib/fretboard";
import {
  getIntervalName,
  isChordTone,
  isGuideTone,
  isRoot,
} from "@/lib/theory/chords";
import { getScaleNotes } from "@/lib/theory/scales";
import type { Chord, FretNote, NoteName, ThreeNPSPosition } from "@/lib/types";
import { STANDARD_TUNING } from "@/lib/types";

/**
 * Pitch class lookup (0-11)
 */
const PITCH_CLASS: Record<string, number> = {
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

function getPitchClass(note: string): number {
  return PITCH_CLASS[note] ?? 0;
}

function sameChroma(a: string, b: string): boolean {
  return getPitchClass(a) === getPitchClass(b);
}

/**
 * 3-note-per-string position for a note.
 * Positions 1-7 correspond to starting on each degree of the major scale.
 * We assign position based on the fret's semitone distance from root on
 * the low E string, mapping to the 7 diatonic degree zones.
 */
/**
 * Major scale intervals (semitones from root): W-W-H-W-W-W-H
 * Degrees: 1(0), 2(2), 3(4), 4(5), 5(7), 6(9), 7(11)
 */
const MAJOR_DEGREE_SEMITONES = [0, 2, 4, 5, 7, 9, 11];

/**
 * For each 3NPS position (starting degree 1-7), define the semitone
 * offset range (from root on low E) that belongs to that position.
 * Each position covers roughly a 2-fret span.
 */
function getThreeNPSPosition(
  fret: number,
  rootPitchClass: number,
): ThreeNPSPosition {
  const lowEPitchClass = getPitchClass("E"); // 4
  const rootFret = (rootPitchClass - lowEPitchClass + 12) % 12;
  const offset = (fret - rootFret + 120) % 12;

  // Map offset to the nearest scale degree zone
  // Each position starts at the scale degree's semitone offset
  for (let i = MAJOR_DEGREE_SEMITONES.length - 1; i >= 0; i--) {
    const degreeSemitone = MAJOR_DEGREE_SEMITONES[i];
    if (degreeSemitone === undefined) continue;
    if (offset >= degreeSemitone) {
      return (i + 1) as ThreeNPSPosition;
    }
  }
  return 1;
}

/**
 * Compute 3-note-per-string overlay notes for the major scale.
 * Uses all 7 diatonic notes and assigns positions 1-7 based on starting degree.
 */
export function getThreeNPSNotes(
  root: NoteName,
  options: {
    numFrets?: number;
    tuning?: NoteName[];
    chord?: Chord;
    scaleName?: string;
  } = {},
): FretNote[] {
  const {
    numFrets = 12,
    tuning = STANDARD_TUNING,
    chord,
    scaleName = "major",
  } = options;
  const rootPC = getPitchClass(root);
  const scaleNotes = getScaleNotes(root, scaleName);
  if (scaleNotes.length === 0) return [];

  const scalePCs = new Set(scaleNotes.map((n) => getPitchClass(n)));
  const layout = generateFretboardLayout(numFrets, tuning);
  const notes: FretNote[] = [];

  for (let stringIdx = 0; stringIdx < tuning.length; stringIdx++) {
    const stringNotes = layout[stringIdx];
    if (!stringNotes) continue;

    for (let fret = 0; fret <= numFrets; fret++) {
      const note = stringNotes[fret];
      if (!note) continue;

      const notePC = getPitchClass(note);
      if (!scalePCs.has(notePC)) continue;

      const noteIsRoot = chord ? isRoot(chord, note) : sameChroma(note, root);
      const noteIsChordTone = chord ? isChordTone(chord, note) : false;
      const noteIsGuideTone = chord ? isGuideTone(chord, note) : false;
      const interval = getIntervalName(root, note);
      const position = getThreeNPSPosition(fret, rootPC);

      notes.push({
        string: stringIdx + 1,
        fret,
        note,
        interval,
        isRoot: noteIsRoot,
        isChordTone: noteIsChordTone,
        isGuideTone: noteIsGuideTone,
        isScaleTone: !noteIsChordTone,
        threeNPSPosition: position,
      });
    }
  }

  return notes;
}
