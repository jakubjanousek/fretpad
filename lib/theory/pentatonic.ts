import { generateFretboardLayout } from "@/lib/fretboard";
import {
  getIntervalName,
  isChordTone,
  isGuideTone,
  isRoot,
} from "@/lib/theory/chords";
import type {
  CAGEDPosition,
  Chord,
  FretboardOverlay,
  FretNote,
  NoteName,
} from "@/lib/types";
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
 * Semitone intervals for each overlay scale type (relative to root)
 */
const SCALE_INTERVALS: Record<
  Exclude<FretboardOverlay, "none" | "threeNotePerString">,
  number[]
> = {
  pentatonicMinor: [0, 3, 5, 7, 10],
  pentatonicMajor: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10],
};

/**
 * CAGED position boundaries for minor pentatonic.
 * Each position spans a range of semitone offsets from root (mod 12).
 * Position 1 starts at the root (offset 0).
 */
const MINOR_POSITION_RANGES: Record<CAGEDPosition, number[]> = {
  1: [0, 1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8, 9],
  5: [10, 11],
};

/**
 * CAGED position boundaries for major pentatonic.
 * Position 1 starts at the root (offset 0).
 */
const MAJOR_POSITION_RANGES: Record<CAGEDPosition, number[]> = {
  1: [0, 1],
  2: [2, 3],
  3: [4, 5, 6],
  4: [7, 8],
  5: [9, 10, 11],
};

/**
 * Get the CAGED position for a fret given the root note and overlay type.
 * Uses the fret's semitone distance from root on the 6th string to determine position.
 */
function getCAGEDPosition(
  fret: number,
  rootPitchClass: number,
  overlay: FretboardOverlay,
): CAGEDPosition {
  // Compute the low E string root fret (position of root on 6th string)
  const lowEPitchClass = getPitchClass("E"); // 4
  const rootFret = (rootPitchClass - lowEPitchClass + 12) % 12;

  // Semitone offset of this fret from root fret (mod 12)
  const offset = (fret - rootFret + 120) % 12;

  const ranges =
    overlay === "pentatonicMajor"
      ? MAJOR_POSITION_RANGES
      : MINOR_POSITION_RANGES;

  for (const [pos, offsets] of Object.entries(ranges)) {
    if (offsets.includes(offset)) {
      return Number(pos) as CAGEDPosition;
    }
  }

  return 1; // fallback
}

/**
 * Get the scale notes (as pitch classes) for an overlay type and root
 */
function getOverlayPitchClasses(
  root: NoteName,
  overlay: Exclude<FretboardOverlay, "none" | "threeNotePerString">,
): Set<number> {
  const rootPC = getPitchClass(root);
  const intervals = SCALE_INTERVALS[overlay];
  return new Set(intervals.map((i) => (rootPC + i) % 12));
}

/**
 * Compute overlay FretNotes for the given root and overlay type.
 * Returns notes for all pentatonic/blues positions on the fretboard,
 * with CAGED position assignment and chord-tone classification.
 */
export function getOverlayNotes(
  root: NoteName,
  overlay: Exclude<FretboardOverlay, "none" | "threeNotePerString">,
  options: { numFrets?: number; tuning?: NoteName[]; chord?: Chord } = {},
): FretNote[] {
  const { numFrets = 12, tuning = STANDARD_TUNING, chord } = options;
  const rootPC = getPitchClass(root);
  const scalePCs = getOverlayPitchClasses(root, overlay);
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
      const cagedPosition = getCAGEDPosition(fret, rootPC, overlay);

      notes.push({
        string: stringIdx + 1,
        fret,
        note,
        interval,
        isRoot: noteIsRoot,
        isChordTone: noteIsChordTone,
        isGuideTone: noteIsGuideTone,
        isScaleTone: !noteIsChordTone,
        cagedPosition,
      });
    }
  }

  return notes;
}
