import { Interval, Note } from "tonal";
import type { Chord, NoteName } from "@/lib/types";

/**
 * Represents a playable chord voicing with notes including octaves
 */
export interface ChordVoicing {
  notes: string[]; // Full note names with octave: ["C3", "E3", "G3", "B3"]
  bassNote: string; // Bass note: "C2" (or slash bass like "G2" for C/G)
}

/**
 * Returns the effective bass note for a chord.
 * For slash chords (e.g., C/G), returns the specified bass note.
 * For regular chords, returns the root.
 */
function getEffectiveBass(chord: Chord): NoteName {
  return chord.bassNote ?? chord.root;
}

/**
 * Gets a shell voicing (root + 3rd + 7th) for a chord
 * Shell voicings are the minimal voicing that captures the chord's character
 */
export function getShellVoicing(chord: Chord, octave: number): ChordVoicing {
  const notes: string[] = [];

  // Root
  notes.push(`${chord.root}${octave}`);

  // 3rd (or sus note)
  if (chord.guideTones[0]) {
    notes.push(`${chord.guideTones[0]}${octave}`);
  }

  // 7th (or 6th for 6 chords)
  if (chord.guideTones[1]) {
    // Place 7th above the 3rd
    const seventhOctave = shouldRaiseOctave(
      chord.guideTones[0],
      chord.guideTones[1],
    )
      ? octave + 1
      : octave;
    notes.push(`${chord.guideTones[1]}${seventhOctave}`);
  }

  return {
    notes,
    bassNote: `${getEffectiveBass(chord)}${octave - 1}`,
  };
}

/**
 * Gets a triad voicing (root + 3rd + 5th) for a chord
 */
export function getTriadVoicing(chord: Chord, octave: number): ChordVoicing {
  const notes: string[] = [];

  // Root
  notes.push(`${chord.root}${octave}`);

  // 3rd
  if (chord.notes[1]) {
    notes.push(`${chord.notes[1]}${octave}`);
  }

  // 5th
  if (chord.notes[2]) {
    const fifthOctave = shouldRaiseOctave(chord.notes[1], chord.notes[2])
      ? octave + 1
      : octave;
    notes.push(`${chord.notes[2]}${fifthOctave}`);
  }

  return {
    notes,
    bassNote: `${getEffectiveBass(chord)}${octave - 1}`,
  };
}

/**
 * Gets a full voicing with all chord tones
 */
export function getFullVoicing(chord: Chord, octave: number): ChordVoicing {
  const notes: string[] = [];
  let currentOctave = octave;
  let prevNote: NoteName | null = null;

  for (const note of chord.notes) {
    if (prevNote && shouldRaiseOctave(prevNote, note)) {
      currentOctave++;
    }
    notes.push(`${note}${currentOctave}`);
    prevNote = note;
  }

  return {
    notes,
    bassNote: `${getEffectiveBass(chord)}${octave - 1}`,
  };
}

/**
 * Determines if the second note should be raised an octave to maintain ascending order
 */
function shouldRaiseOctave(
  prevNote: NoteName | undefined,
  nextNote: NoteName | undefined,
): boolean {
  if (!prevNote || !nextNote) return false;

  const prevMidi = Note.midi(`${prevNote}4`) ?? 0;
  const nextMidi = Note.midi(`${nextNote}4`) ?? 0;

  // If next note is lower or equal, it should be raised
  return nextMidi <= prevMidi;
}

/**
 * Gets a bass note for a given scale degree relative to the chord.
 * For slash chords, degree 1 plays the specified bass note.
 */
export function getBassNote(
  chord: Chord,
  degree: number,
  octave: number,
  _nextChord?: Chord,
): string {
  const bass = getEffectiveBass(chord);
  switch (degree) {
    case 1:
      return `${bass}${octave}`;
    case 3:
      return chord.notes[1] ? `${chord.notes[1]}${octave}` : `${bass}${octave}`;
    case 5:
      return chord.notes[2] ? `${chord.notes[2]}${octave}` : `${bass}${octave}`;
    case 7:
      return chord.guideTones[1]
        ? `${chord.guideTones[1]}${octave}`
        : `${bass}${octave}`;
    default:
      return `${bass}${octave}`;
  }
}

/**
 * Gets a chromatic approach note to the target chord's bass note.
 * Approaches from a half step below.
 * For slash chords, approaches the specified bass note.
 */
export function getApproachNote(
  targetChord: Chord,
  octave: number,
  direction: "below" | "above" = "below",
): string {
  const targetBass = getEffectiveBass(targetChord);
  const targetNote = `${targetBass}${octave}`;
  const semitones = direction === "below" ? -1 : 1;
  const approachNote = Note.transpose(
    targetNote,
    Interval.fromSemitones(semitones),
  );
  return approachNote || targetNote;
}

/**
 * Gets a voicing based on the voicing type
 */
export function getVoicing(
  chord: Chord,
  voicingType: "shell" | "full" | "triad",
  octave: number,
): ChordVoicing {
  switch (voicingType) {
    case "shell":
      return getShellVoicing(chord, octave);
    case "triad":
      return getTriadVoicing(chord, octave);
    case "full":
      return getFullVoicing(chord, octave);
    default:
      return getShellVoicing(chord, octave);
  }
}
