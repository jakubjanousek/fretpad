import { generateFretboardLayout } from "@/lib/fretboard";
import {
  getIntervalName,
  isChordTone,
  isGuideTone,
  isRoot,
} from "@/lib/theory/chords";
import type {
  ArpeggioConnection,
  CAGEDPosition,
  Chord,
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

/**
 * CAGED position boundaries for arpeggios.
 * Uses the same approach as pentatonic - semitone offset from root on low E string.
 * Arpeggios follow the same positional layout as scales but only include chord tones.
 */
const ARPEGGIO_POSITION_RANGES: Record<CAGEDPosition, number[]> = {
  1: [0, 1, 2], // E shape - starts at root
  2: [3, 4], // D shape
  3: [5, 6], // C shape
  4: [7, 8, 9], // A shape
  5: [10, 11], // G shape
};

/**
 * Get the CAGED position for a fret given the root note.
 * Uses the fret's semitone distance from root on the 6th string.
 */
function getArpeggioCAGEDPosition(
  fret: number,
  rootPitchClass: number,
): CAGEDPosition {
  const lowEPitchClass = getPitchClass("E"); // 4
  const rootFret = (rootPitchClass - lowEPitchClass + 12) % 12;
  const offset = (fret - rootFret + 120) % 12;

  for (const [pos, offsets] of Object.entries(ARPEGGIO_POSITION_RANGES)) {
    if (offsets.includes(offset)) {
      return Number(pos) as CAGEDPosition;
    }
  }

  return 1; // fallback
}

export interface GetArpeggioNotesOptions {
  numFrets?: number;
  tuning?: NoteName[];
  chord: Chord;
}

/**
 * Compute arpeggio FretNotes for the given chord.
 * Returns only chord tones (1-3-5-7) with CAGED position assignment.
 */
export function getArpeggioNotes(
  root: NoteName,
  options: GetArpeggioNotesOptions,
): FretNote[] {
  const { numFrets = 12, tuning = STANDARD_TUNING, chord } = options;
  const rootPC = getPitchClass(root);
  const layout = generateFretboardLayout(numFrets, tuning);
  const notes: FretNote[] = [];

  // Get the set of chord tone pitch classes for quick lookup
  const chordTonePCs = new Set(chord.notes.map((n) => getPitchClass(n)));

  for (let stringIdx = 0; stringIdx < tuning.length; stringIdx++) {
    const stringNotes = layout[stringIdx];
    if (!stringNotes) continue;

    for (let fret = 0; fret <= numFrets; fret++) {
      const note = stringNotes[fret];
      if (!note) continue;

      const notePC = getPitchClass(note);

      // Only include chord tones (arpeggio notes)
      if (!chordTonePCs.has(notePC)) continue;

      const noteIsRoot = isRoot(chord, note);
      const noteIsChordTone = isChordTone(chord, note);
      const noteIsGuideTone = isGuideTone(chord, note);
      const interval = getIntervalName(root, note);
      const cagedPosition = getArpeggioCAGEDPosition(fret, rootPC);

      notes.push({
        string: stringIdx + 1,
        fret,
        note,
        interval,
        isRoot: noteIsRoot,
        isChordTone: noteIsChordTone,
        isGuideTone: noteIsGuideTone,
        isScaleTone: false, // Arpeggios only show chord tones
        cagedPosition,
      });
    }
  }

  return notes;
}

/**
 * Generate arpeggio connections for SVG overlay visualization.
 * Connects chord tones within each CAGED position in melodic order
 * (low to high string, then ascending fret).
 */
export function getArpeggioConnections(
  arpeggioNotes: FretNote[],
): ArpeggioConnection[] {
  const connections: ArpeggioConnection[] = [];

  // Group notes by CAGED position
  const byPosition = new Map<CAGEDPosition, FretNote[]>();
  for (const note of arpeggioNotes) {
    if (!note.cagedPosition) continue;
    const pos = note.cagedPosition;
    if (!byPosition.has(pos)) {
      byPosition.set(pos, []);
    }
    byPosition.get(pos)?.push(note);
  }

  // For each position, sort notes by string (descending = low to high pitch)
  // then by fret (ascending) and create connections
  for (const [position, notes] of byPosition) {
    // Sort: string descending (6->1 for low to high), then fret ascending
    const sorted = [...notes].sort((a, b) => {
      if (a.string !== b.string) return b.string - a.string;
      return a.fret - b.fret;
    });

    // Create connections between consecutive notes
    for (let i = 0; i < sorted.length - 1; i++) {
      const from = sorted[i];
      const to = sorted[i + 1];
      if (!from || !to) continue;

      connections.push({
        from: { string: from.string, fret: from.fret },
        to: { string: to.string, fret: to.fret },
        fromDegree: from.interval,
        toDegree: to.interval,
        cagedPosition: position,
      });
    }
  }

  return connections;
}

/**
 * Get an ordered sequence of arpeggio notes for a specific CAGED position.
 * Useful for audio playback.
 */
export function getArpeggioSequence(
  arpeggioNotes: FretNote[],
  position: CAGEDPosition,
  direction: "ascending" | "descending" = "ascending",
): FretNote[] {
  const positionNotes = arpeggioNotes.filter(
    (n) => n.cagedPosition === position,
  );

  // Sort for melodic order (low to high pitch)
  const sorted = [...positionNotes].sort((a, b) => {
    if (a.string !== b.string) return b.string - a.string;
    return a.fret - b.fret;
  });

  return direction === "ascending" ? sorted : sorted.reverse();
}
