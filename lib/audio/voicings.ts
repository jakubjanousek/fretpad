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

interface WalkingBassOptions {
  octave: number;
  steps: number;
  variationIndex?: number;
  nextChord?: Chord | null;
}

type WalkingDirection = -1 | 1;

type WalkingStrategy = "chordTone" | "diatonic" | "chromatic";

function uniqueNotes(notes: Array<NoteName | undefined>): NoteName[] {
  return notes.filter((note, index, list): note is NoteName => {
    if (!note) return false;
    return list.indexOf(note) === index;
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function midiToNoteName(midi: number): string {
  return Note.fromMidi(midi) ?? `C${Math.max(1, Math.floor(midi / 12) - 1)}`;
}

function getScaleSemitonesForChord(chord: Chord): number[] {
  switch (chord.quality) {
    case "min":
    case "min7":
    case "min6":
    case "min9":
      return [0, 2, 3, 5, 7, 9, 10];
    case "7":
    case "9":
    case "sus4":
      return [0, 2, 4, 5, 7, 9, 10];
    case "min7b5":
      return [0, 1, 3, 5, 6, 8, 10];
    case "dim":
    case "dim7":
      return [0, 2, 3, 5, 6, 8, 9];
    case "aug":
      return [0, 2, 4, 6, 8, 10];
    case "sus2":
      return [0, 2, 5, 7, 9, 10];
    default:
      return [0, 2, 4, 5, 7, 9, 11];
  }
}

function getScalePitchClasses(chord: Chord): NoteName[] {
  return getScaleSemitonesForChord(chord)
    .map((semitones) =>
      Note.pitchClass(
        Note.transpose(chord.root, Interval.fromSemitones(semitones)),
      ),
    )
    .filter((note, index, list): note is NoteName => {
      if (!note) return false;
      return list.indexOf(note) === index;
    });
}

function getWalkingDirection(
  startMidi: number,
  targetMidi: number,
  variationIndex: number,
  hasNextChord: boolean,
): WalkingDirection {
  const intervalToTarget = targetMidi - startMidi;

  if (!hasNextChord || intervalToTarget === 0) {
    return variationIndex % 2 === 0 ? 1 : -1;
  }

  if (Math.abs(intervalToTarget) <= 2 && variationIndex % 2 === 1) {
    return intervalToTarget >= 0 ? -1 : 1;
  }

  return intervalToTarget >= 0 ? 1 : -1;
}

function getNearestMidiInDirection(
  note: NoteName,
  previousMidi: number,
  direction: WalkingDirection,
  maxDistance = 5,
): number | null {
  const baseMidi = Note.midi(`${note}3`) ?? 48;
  let bestMidi: number | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let octaveShift = -24; octaveShift <= 24; octaveShift += 12) {
    const candidateMidi = baseMidi + octaveShift;
    const delta = candidateMidi - previousMidi;

    if (direction > 0 && delta <= 0) continue;
    if (direction < 0 && delta >= 0) continue;
    if (Math.abs(delta) > maxDistance) continue;

    const distance = Math.abs(delta);
    if (distance < bestDistance) {
      bestMidi = candidateMidi;
      bestDistance = distance;
    }
  }

  return bestMidi;
}

function getStepwiseMidiCandidates(
  previousMidi: number,
  direction: WalkingDirection,
  scalePitchClasses: NoteName[],
): number[] {
  const candidates: number[] = [];

  for (let distance = 1; distance <= 3; distance++) {
    const candidateMidi = previousMidi + direction * distance;
    const pitchClass = Note.pitchClass(midiToNoteName(candidateMidi));

    if (pitchClass && scalePitchClasses.includes(pitchClass as NoteName)) {
      candidates.push(candidateMidi);
    }
  }

  return candidates;
}

function getChromaticApproachMidi(
  targetMidi: number,
  direction: WalkingDirection,
): number {
  return targetMidi - direction;
}

function getPreferredWalkingStrategies(
  variationIndex: number,
  isLastStep: boolean,
): WalkingStrategy[] {
  const strategySets: WalkingStrategy[][] = [
    ["chordTone", "diatonic", "chromatic"],
    ["diatonic", "chordTone", "chromatic"],
    ["chromatic", "diatonic", "chordTone"],
  ];
  const preferredIndex = variationIndex % strategySets.length;
  const preferred = strategySets[preferredIndex] ?? strategySets[0] ?? [];

  if (!isLastStep) {
    return preferred;
  }

  return [
    "chromatic",
    ...preferred.filter((strategy) => strategy !== "chromatic"),
  ];
}

function getWalkingCandidatePool(
  chord: Chord,
  previousMidi: number,
  targetMidi: number,
  direction: WalkingDirection,
  strategy: WalkingStrategy,
  isLastStep: boolean,
): number[] {
  switch (strategy) {
    case "chordTone":
      return uniqueNotes([
        chord.notes[1],
        chord.notes[2],
        chord.guideTones[1],
        chord.notes[3],
        chord.root,
      ])
        .map((note) => getNearestMidiInDirection(note, previousMidi, direction))
        .filter((candidate): candidate is number => candidate !== null);
    case "diatonic":
      return getStepwiseMidiCandidates(
        previousMidi,
        direction,
        getScalePitchClasses(chord),
      );
    case "chromatic":
      return isLastStep
        ? [getChromaticApproachMidi(targetMidi, direction)]
        : [previousMidi + direction, previousMidi + direction * 2];
    default:
      return [];
  }
}

function canReachTarget(
  candidateMidi: number,
  targetMidi: number,
  remainingSteps: number,
): boolean {
  if (remainingSteps <= 0) {
    return true;
  }

  const maxTravel = remainingSteps * 5 + 1;
  return Math.abs(targetMidi - candidateMidi) <= maxTravel;
}

export function getWalkingBassLine(
  chord: Chord,
  { octave, steps, variationIndex = 0, nextChord }: WalkingBassOptions,
): string[] {
  if (steps <= 0) return [];

  const startMidi = Note.midi(`${getEffectiveBass(chord)}${octave}`) ?? 36;
  const targetBass = nextChord
    ? getEffectiveBass(nextChord)
    : getEffectiveBass(chord);
  const targetMidi = Note.midi(`${targetBass}${octave}`) ?? startMidi;
  const direction = getWalkingDirection(
    startMidi,
    targetMidi,
    variationIndex,
    Boolean(nextChord),
  );
  const line: number[] = [startMidi];

  for (let stepIndex = 1; stepIndex < steps; stepIndex++) {
    const previousMidi = line[line.length - 1] ?? startMidi;
    const isLastStep = stepIndex === steps - 1;
    const remainingSteps = steps - stepIndex - 1;
    const strategies = getPreferredWalkingStrategies(
      variationIndex + stepIndex - 1,
      isLastStep,
    );
    let candidateMidi: number | null = null;

    for (const strategy of strategies) {
      const pool = getWalkingCandidatePool(
        chord,
        previousMidi,
        targetMidi,
        direction,
        strategy,
        isLastStep && Boolean(nextChord),
      );
      candidateMidi =
        pool.find(
          (candidate) =>
            candidate !== previousMidi &&
            canReachTarget(candidate, targetMidi, remainingSteps),
        ) ?? null;

      if (candidateMidi !== null) {
        break;
      }
    }

    if (candidateMidi === null) {
      candidateMidi = clamp(
        previousMidi + direction * 2,
        startMidi - 12,
        startMidi + 12,
      );
    }

    line.push(candidateMidi);
  }

  return line.map(midiToNoteName);
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

export function getRootlessVoicing(chord: Chord, octave: number): ChordVoicing {
  const preferredNotes = uniqueNotes([
    chord.guideTones[0],
    chord.guideTones[1],
    chord.notes[2],
    chord.notes[3],
    chord.notes[1],
  ]).filter((note) => note !== chord.root);

  const notes: string[] = [];
  let currentOctave = octave;
  let previousNote: NoteName | null = null;

  for (const note of preferredNotes) {
    if (notes.length >= 4) break;
    if (previousNote && shouldRaiseOctave(previousNote, note)) {
      currentOctave++;
    }
    notes.push(`${note}${currentOctave}`);
    previousNote = note;
  }

  return {
    notes,
    bassNote: `${getEffectiveBass(chord)}${octave - 2}`,
  };
}

/**
 * Gets a voicing based on the voicing type
 */
export function getVoicing(
  chord: Chord,
  voicingType: "shell" | "full" | "triad" | "rootless",
  octave: number,
): ChordVoicing {
  switch (voicingType) {
    case "shell":
      return getShellVoicing(chord, octave);
    case "triad":
      return getTriadVoicing(chord, octave);
    case "full":
      return getFullVoicing(chord, octave);
    case "rootless":
      return getRootlessVoicing(chord, octave);
    default:
      return getShellVoicing(chord, octave);
  }
}
