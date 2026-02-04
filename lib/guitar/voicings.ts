/**
 * Guitar voicing generation system
 *
 * This module provides guitar-specific chord voicings, separate from the
 * audio/piano-oriented voicings. Voicings are organized using Ted Greene's
 * V-System principles for categorization.
 */

import { Note } from "tonal";
import { generateId } from "@/lib/id";
import type {
  Chord,
  ChordQuality,
  GuitarFretPosition,
  GuitarVoicing,
  GuitarVoicingType,
  NoteName,
  StringGroup,
  VoicingTemplate,
  VSystemPosition,
} from "@/lib/types";
import { STANDARD_TUNING } from "@/lib/types";

// ============================================
// Constants
// ============================================

const NOTE_NAMES = [
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

// Maximum fret stretch for playable voicings
const MAX_FRET_STRETCH = 4;

// ============================================
// Interval Calculation Utilities
// ============================================

/**
 * Interval names used in voicing templates
 */
export type IntervalName = "1" | "b3" | "3" | "5" | "b7" | "7";

/**
 * Get the correct intervals for a chord quality
 * Returns the semitones for 3rd and 7th based on quality
 */
export function getIntervalsForQuality(quality: ChordQuality): {
  third: number;
  seventh: number | null;
  fifth: number;
} {
  switch (quality) {
    // Major family
    case "maj":
      return { third: 4, seventh: null, fifth: 7 };
    case "maj7":
      return { third: 4, seventh: 11, fifth: 7 }; // Major 3rd, Major 7th
    case "maj9":
      return { third: 4, seventh: 11, fifth: 7 };
    case "6":
      return { third: 4, seventh: null, fifth: 7 }; // No 7th in 6 chord

    // Minor family
    case "min":
      return { third: 3, seventh: null, fifth: 7 };
    case "min7":
      return { third: 3, seventh: 10, fifth: 7 }; // Minor 3rd, Minor 7th
    case "min7b5":
      return { third: 3, seventh: 10, fifth: 6 }; // Minor 3rd, Minor 7th, Flat 5th
    case "min9":
      return { third: 3, seventh: 10, fifth: 7 };
    case "min6":
      return { third: 3, seventh: null, fifth: 7 };

    // Dominant family
    case "7":
      return { third: 4, seventh: 10, fifth: 7 }; // Major 3rd, Minor 7th
    case "9":
      return { third: 4, seventh: 10, fifth: 7 };

    // Diminished
    case "dim":
      return { third: 3, seventh: null, fifth: 6 };
    case "dim7":
      return { third: 3, seventh: 9, fifth: 6 }; // Diminished 7th = 9 semitones

    // Augmented
    case "aug":
      return { third: 4, seventh: null, fifth: 8 };

    // Suspended
    case "sus2":
      return { third: 2, seventh: null, fifth: 7 }; // 2nd instead of 3rd
    case "sus4":
      return { third: 5, seventh: null, fifth: 7 }; // 4th instead of 3rd

    // Add9 and other
    case "add9":
      return { third: 4, seventh: null, fifth: 7 };

    default:
      return { third: 4, seventh: null, fifth: 7 }; // Default to major
  }
}

/**
 * Calculate the fret position for a given interval on a given string,
 * relative to a root note on a reference string.
 *
 * @param rootString - String number where the root is (1-6)
 * @param rootFret - Fret position of the root
 * @param targetString - String number to calculate position for (1-6)
 * @param intervalSemitones - Semitones above the root for the desired interval
 * @returns Fret number on the target string, or null if not reachable
 */
export function getFretForInterval(
  rootString: number,
  rootFret: number,
  targetString: number,
  intervalSemitones: number,
): number | null {
  // Get the root note
  const rootOpenNote = STANDARD_TUNING[rootString - 1];
  if (!rootOpenNote) return null;
  const rootNoteIndex = NOTE_NAMES.indexOf(Note.pitchClass(rootOpenNote) ?? "");
  const rootNoteChroma = (rootNoteIndex + rootFret) % 12;

  // Calculate target note chroma
  const targetNoteChroma = (rootNoteChroma + intervalSemitones) % 12;

  // Get target string open note
  const targetOpenNote = STANDARD_TUNING[targetString - 1];
  if (!targetOpenNote) return null;
  const targetOpenNoteIndex = NOTE_NAMES.indexOf(
    Note.pitchClass(targetOpenNote) ?? "",
  );

  // Calculate fret on target string
  let targetFret = targetNoteChroma - targetOpenNoteIndex;
  if (targetFret < 0) targetFret += 12;

  // Find the closest playable fret to the root position
  // Check within reasonable range of the root fret
  const candidates = [targetFret, targetFret + 12];
  const baseFret = rootFret;

  // Find the candidate closest to baseFret that's within playable range
  let bestFret = targetFret;
  let bestDistance = Math.abs(targetFret - baseFret);

  for (const fret of candidates) {
    if (fret >= 0 && fret <= 15) {
      const distance = Math.abs(fret - baseFret);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestFret = fret;
      }
    }
  }

  return bestFret;
}

/**
 * Configuration for interval-based shell voicing
 */
interface ShellVoicingConfig {
  name: string;
  rootString: 5 | 6;
  thirdString: number;
  seventhString: number;
  thirdOnTop: boolean; // If true, 3rd is higher pitch than 7th
}

/**
 * Shell voicing configurations - defines string layout for root + 3rd + 7th
 */
const SHELL_CONFIGS: ShellVoicingConfig[] = [
  // Root on 6th string, 7th on 4th, 3rd on 3rd
  {
    name: "Shell 6th String (3-7)",
    rootString: 6,
    thirdString: 3,
    seventhString: 4,
    thirdOnTop: true,
  },
  // Root on 6th string, 3rd on 4th, 7th on 3rd
  {
    name: "Shell 6th String (7-3)",
    rootString: 6,
    thirdString: 4,
    seventhString: 3,
    thirdOnTop: false,
  },
  // Root on 5th string, 7th on 3rd, 3rd on 2nd
  {
    name: "Shell 5th String (3-7)",
    rootString: 5,
    thirdString: 2,
    seventhString: 3,
    thirdOnTop: true,
  },
  // Root on 5th string, 3rd on 3rd, 7th on 2nd
  {
    name: "Shell 5th String (7-3)",
    rootString: 5,
    thirdString: 3,
    seventhString: 2,
    thirdOnTop: false,
  },
];

/**
 * Generate an interval-based shell voicing for a chord at a specific root fret position
 */
function generateIntervalBasedShellVoicing(
  chord: Chord,
  config: ShellVoicingConfig,
  rootFret: number,
): GuitarVoicing | null {
  const { third, seventh } = getIntervalsForQuality(chord.quality);

  // Shell voicings require a 7th
  if (seventh === null) return null;

  // Calculate fret positions for 3rd and 7th
  const thirdFret = getFretForInterval(
    config.rootString,
    rootFret,
    config.thirdString,
    third,
  );
  const seventhFret = getFretForInterval(
    config.rootString,
    rootFret,
    config.seventhString,
    seventh,
  );

  if (thirdFret === null || seventhFret === null) return null;

  // Check if the voicing is playable (within 4 fret stretch)
  const frets = [rootFret, thirdFret, seventhFret].filter((f) => f > 0);
  if (frets.length > 0) {
    const minFret = Math.min(...frets);
    const maxFret = Math.max(...frets);
    if (maxFret - minFret > MAX_FRET_STRETCH) return null;
  }

  // Build positions array (6 strings, 1-indexed)
  const positions: GuitarFretPosition[] = [];
  for (let string = 1; string <= 6; string++) {
    if (string === config.rootString) {
      positions.push({
        string,
        fret: rootFret,
        isRoot: true,
        note: getNoteAtFret(string, rootFret),
      });
    } else if (string === config.thirdString) {
      positions.push({
        string,
        fret: thirdFret,
        note: getNoteAtFret(string, thirdFret),
      });
    } else if (string === config.seventhString) {
      positions.push({
        string,
        fret: seventhFret,
        note: getNoteAtFret(string, seventhFret),
      });
    } else {
      positions.push({ string, fret: -1 }); // Muted
    }
  }

  // Calculate base fret (lowest non-zero fret for position indicator)
  const playedFrets = positions.filter((p) => p.fret > 0).map((p) => p.fret);
  const baseFret = playedFrets.length > 0 ? Math.min(...playedFrets) : 0;

  return {
    id: generateId(),
    name: `${chord.symbol} - ${config.name}`,
    type: "shell",
    positions,
    baseFret,
    isBarreChord: false,
    difficulty: "intermediate",
    vSystem: getVSystemPosition(positions),
    stringGroup: getStringGroup(positions),
    voicingStructure: "close",
    inversion: 0,
  };
}

/**
 * Generate all interval-based shell voicings for a chord
 */
export function generateIntervalBasedShellVoicings(
  chord: Chord,
  options: { fretRange?: { min: number; max: number } } = {},
): GuitarVoicing[] {
  const { fretRange = { min: 0, max: 12 } } = options;
  const voicings: GuitarVoicing[] = [];

  for (const config of SHELL_CONFIGS) {
    // Find all root positions on the root string within the fret range
    const rootFrets = getFretForNote(
      config.rootString,
      chord.root,
      fretRange.min,
      fretRange.max,
    );

    for (const rootFret of rootFrets) {
      const voicing = generateIntervalBasedShellVoicing(
        chord,
        config,
        rootFret,
      );
      if (voicing) {
        // Verify all notes are within fret range
        const maxFret = Math.max(
          ...voicing.positions.filter((p) => p.fret >= 0).map((p) => p.fret),
        );
        if (maxFret <= fretRange.max) {
          voicings.push(voicing);
        }
      }
    }
  }

  return deduplicateVoicings(voicings);
}

// ============================================
// Interval-Based Drop 2 Voicing Generation
// ============================================

/**
 * Drop 2 voicing configuration
 * Drop 2: Take close position (1-3-5-7), drop the 2nd voice from top down an octave
 */
interface Drop2Config {
  name: string;
  stringSet: "top4" | "mid4" | "bottom4"; // Which 4 adjacent strings
  inversion: 0 | 1 | 2 | 3;
}

/**
 * String assignments for each string set
 * Strings are numbered 1 (high E) to 6 (low E)
 */
const DROP2_STRING_SETS: Record<"top4" | "mid4" | "bottom4", number[]> = {
  top4: [1, 2, 3, 4], // High E, B, G, D
  mid4: [2, 3, 4, 5], // B, G, D, A
  bottom4: [3, 4, 5, 6], // G, D, A, E
};

/**
 * Voice order for drop 2 inversions (from lowest to highest string)
 * Each array shows semitones from root: [lowest string voice, ..., highest string voice]
 * null means we need to get from chord quality (3rd or 7th changes)
 */
type Drop2VoiceFunction = (
  third: number,
  seventh: number,
  fifth: number,
) => number[];
const DROP2_VOICE_ORDERS: Record<0 | 1 | 2 | 3, Drop2VoiceFunction> = {
  // Root position: 5-1-3-7 (5th on bass, root, 3rd, 7th on top)
  0: (third, seventh, fifth) => [fifth, 0, third, seventh],
  // 1st inversion: 7-3-5-1 (7th on bass)
  1: (third, seventh, fifth) => [seventh - 12, third, fifth, 12], // 12 = root up an octave
  // 2nd inversion: 1-5-7-3 (root on bass)
  2: (third, seventh, fifth) => [0, fifth, seventh, third + 12],
  // 3rd inversion: 3-7-1-5 (3rd on bass)
  3: (third, seventh, fifth) => [third, seventh, 12, fifth + 12],
};

/**
 * Drop 2 configurations - all inversions on all string sets
 */
const DROP2_CONFIGS: Drop2Config[] = [
  // Top 4 strings (1-2-3-4)
  { name: "Drop 2 Top 4 (Root)", stringSet: "top4", inversion: 0 },
  { name: "Drop 2 Top 4 (1st Inv)", stringSet: "top4", inversion: 1 },
  { name: "Drop 2 Top 4 (2nd Inv)", stringSet: "top4", inversion: 2 },
  { name: "Drop 2 Top 4 (3rd Inv)", stringSet: "top4", inversion: 3 },
  // Middle 4 strings (2-3-4-5)
  { name: "Drop 2 Mid 4 (Root)", stringSet: "mid4", inversion: 0 },
  { name: "Drop 2 Mid 4 (1st Inv)", stringSet: "mid4", inversion: 1 },
  { name: "Drop 2 Mid 4 (2nd Inv)", stringSet: "mid4", inversion: 2 },
  { name: "Drop 2 Mid 4 (3rd Inv)", stringSet: "mid4", inversion: 3 },
  // Bottom 4 strings (3-4-5-6)
  { name: "Drop 2 Bottom 4 (Root)", stringSet: "bottom4", inversion: 0 },
  { name: "Drop 2 Bottom 4 (1st Inv)", stringSet: "bottom4", inversion: 1 },
  { name: "Drop 2 Bottom 4 (2nd Inv)", stringSet: "bottom4", inversion: 2 },
  { name: "Drop 2 Bottom 4 (3rd Inv)", stringSet: "bottom4", inversion: 3 },
];

/**
 * Generate an interval-based drop 2 voicing for a chord
 */
function generateIntervalBasedDrop2Voicing(
  chord: Chord,
  config: Drop2Config,
  bassNoteFret: number, // Fret of the lowest voice
): GuitarVoicing | null {
  const { third, seventh, fifth } = getIntervalsForQuality(chord.quality);

  // Drop 2 voicings require a 7th
  if (seventh === null) return null;

  const strings = DROP2_STRING_SETS[config.stringSet];
  const getVoiceOrder = DROP2_VOICE_ORDERS[config.inversion];
  const voiceIntervals = getVoiceOrder(third, seventh, fifth);

  // The bass string (lowest in pitch = highest string number in set)
  const bassString = strings[3]; // strings are ordered high to low
  if (bassString === undefined) return null;

  // Get the bass note's interval in semitones
  const bassInterval = voiceIntervals[0];
  if (bassInterval === undefined) return null;

  // Calculate the root fret from the bass note position
  // bassNoteFret = rootFret + bassInterval (mod 12 handled by guitar)
  // We need to find what fret the root would be at
  const rootOpenNote = STANDARD_TUNING[bassString - 1];
  if (!rootOpenNote) return null;
  const rootOpenIndex = NOTE_NAMES.indexOf(Note.pitchClass(rootOpenNote) ?? "");
  const bassNoteChroma = (rootOpenIndex + bassNoteFret) % 12;

  // Root chroma = bass chroma - bass interval (normalized)
  let rootChroma = bassNoteChroma - (bassInterval % 12);
  if (rootChroma < 0) rootChroma += 12;

  // Now calculate frets for all voices
  const positions: GuitarFretPosition[] = Array(6)
    .fill(null)
    .map((_, i) => ({ string: i + 1, fret: -1 })); // Initialize all muted

  for (let i = 0; i < 4; i++) {
    const string = strings[3 - i]; // Reverse: strings[3] is bass, strings[0] is treble
    const interval = voiceIntervals[i];
    if (string === undefined || interval === undefined) return null;

    // Calculate target note chroma
    const targetChroma = (rootChroma + interval + 120) % 12; // +120 to handle negative intervals

    // Get string open note
    const openNote = STANDARD_TUNING[string - 1];
    if (!openNote) return null;
    const openIndex = NOTE_NAMES.indexOf(Note.pitchClass(openNote) ?? "");

    // Calculate fret
    let fret = targetChroma - openIndex;
    if (fret < 0) fret += 12;

    // Adjust to be near the bass fret position
    const candidates = [fret, fret + 12, fret - 12].filter(
      (f) => f >= 0 && f <= 17,
    );
    const baseFret = bassNoteFret;
    let bestFret = candidates[0] ?? fret;
    let bestDist = Math.abs(bestFret - baseFret);
    for (const c of candidates) {
      const dist = Math.abs(c - baseFret);
      if (dist < bestDist) {
        bestDist = dist;
        bestFret = c;
      }
    }

    const note = getNoteAtFret(string, bestFret);
    const isRoot = interval % 12 === 0;

    positions[string - 1] = { string, fret: bestFret, note, isRoot };
  }

  // Check playability (max 4 fret stretch)
  const frettedPositions = positions.filter((p) => p.fret > 0);
  if (frettedPositions.length > 0) {
    const minFret = Math.min(...frettedPositions.map((p) => p.fret));
    const maxFret = Math.max(...frettedPositions.map((p) => p.fret));
    if (maxFret - minFret > MAX_FRET_STRETCH) return null;
  }

  // Calculate base fret
  const playedFrets = positions.filter((p) => p.fret > 0).map((p) => p.fret);
  const baseFret = playedFrets.length > 0 ? Math.min(...playedFrets) : 0;

  return {
    id: generateId(),
    name: `${chord.symbol} - ${config.name}`,
    type: "drop2",
    positions,
    baseFret,
    isBarreChord: false,
    difficulty: "intermediate",
    vSystem: getVSystemPosition(positions),
    stringGroup: getStringGroup(positions),
    voicingStructure: "drop2",
    inversion: config.inversion,
  };
}

/**
 * Generate all interval-based drop 2 voicings for a chord
 */
export function generateIntervalBasedDrop2Voicings(
  chord: Chord,
  options: { fretRange?: { min: number; max: number } } = {},
): GuitarVoicing[] {
  const { fretRange = { min: 0, max: 12 } } = options;
  const voicings: GuitarVoicing[] = [];

  // Get intervals for this chord quality
  const { seventh } = getIntervalsForQuality(chord.quality);
  if (seventh === null) return voicings; // No 7th = no drop 2 voicings

  for (const config of DROP2_CONFIGS) {
    const strings = DROP2_STRING_SETS[config.stringSet];
    const bassString = strings[3]; // Lowest pitch string in the set
    if (bassString === undefined) continue;

    // Find bass note positions
    // For each inversion, figure out what note is on the bass string
    const getVoiceOrder = DROP2_VOICE_ORDERS[config.inversion];
    const { third, fifth } = getIntervalsForQuality(chord.quality);
    const voiceIntervals = getVoiceOrder(third, seventh, fifth);
    const bassInterval = voiceIntervals[0];
    if (bassInterval === undefined) continue;

    // Calculate bass note (root + interval)
    const rootChroma = NOTE_NAMES.indexOf(
      Note.pitchClass(chord.root) ?? chord.root,
    );
    const bassChroma = (rootChroma + bassInterval + 120) % 12;
    const bassNote = NOTE_NAMES[bassChroma];
    if (!bassNote) continue;

    // Find positions of bass note on bass string
    const bassFrets = getFretForNote(
      bassString,
      bassNote as NoteName,
      fretRange.min,
      fretRange.max,
    );

    for (const bassFret of bassFrets) {
      const voicing = generateIntervalBasedDrop2Voicing(
        chord,
        config,
        bassFret,
      );
      if (voicing) {
        // Verify all notes are within fret range
        const maxFret = Math.max(
          ...voicing.positions.filter((p) => p.fret >= 0).map((p) => p.fret),
        );
        if (maxFret <= fretRange.max) {
          voicings.push(voicing);
        }
      }
    }
  }

  return deduplicateVoicings(voicings);
}

// ============================================
// Interval-Based Drop 3 Voicing Generation
// ============================================

/**
 * Drop 3 voicing configuration
 * Drop 3: Take close position (1-3-5-7), drop the 3rd voice from top down an octave
 */
interface Drop3Config {
  name: string;
  strings: number[]; // 4 strings used (with a gap)
  inversion: 0 | 1 | 2 | 3;
}

/**
 * Voice order for drop 3 inversions
 * Each returns semitones from root: [lowest string voice, ..., highest string voice]
 */
const DROP3_VOICE_ORDERS: Record<0 | 1 | 2 | 3, Drop2VoiceFunction> = {
  // Root position: 3-1-5-7 (3rd on bass dropped, root, 5th, 7th on top)
  0: (third, seventh, fifth) => [third - 12, 0, fifth, seventh],
  // 1st inversion: 5-3-7-1
  1: (third, seventh, fifth) => [fifth - 12, third, seventh, 12],
  // 2nd inversion: 7-5-1-3
  2: (third, seventh, fifth) => [seventh - 12, fifth, 12, third + 12],
  // 3rd inversion: 1-7-3-5
  3: (third, seventh, fifth) => [0, seventh, third + 12, fifth + 12],
};

/**
 * Drop 3 configurations - common voicings on specific string sets
 * Drop 3 typically spans 5 strings with one skipped
 */
const DROP3_CONFIGS: Drop3Config[] = [
  // Strings 1-2-3-5 (skip 4)
  { name: "Drop 3 (Root)", strings: [1, 2, 3, 5], inversion: 0 },
  { name: "Drop 3 (1st Inv)", strings: [1, 2, 3, 5], inversion: 1 },
  { name: "Drop 3 (2nd Inv)", strings: [1, 2, 3, 5], inversion: 2 },
  { name: "Drop 3 (3rd Inv)", strings: [1, 2, 3, 5], inversion: 3 },
  // Strings 1-2-3-6 (skip 4, 5)
  { name: "Drop 3 w/Bass (Root)", strings: [1, 2, 3, 6], inversion: 0 },
  { name: "Drop 3 w/Bass (1st Inv)", strings: [1, 2, 3, 6], inversion: 1 },
];

/**
 * Generate an interval-based drop 3 voicing for a chord
 */
function generateIntervalBasedDrop3Voicing(
  chord: Chord,
  config: Drop3Config,
  bassNoteFret: number,
): GuitarVoicing | null {
  const { third, seventh, fifth } = getIntervalsForQuality(chord.quality);

  // Drop 3 voicings require a 7th
  if (seventh === null) return null;

  const strings = config.strings;
  const getVoiceOrder = DROP3_VOICE_ORDERS[config.inversion];
  const voiceIntervals = getVoiceOrder(third, seventh, fifth);

  // The bass string (lowest in pitch = highest number in strings array)
  const bassString = Math.max(...strings);

  // Get the bass note's interval
  const bassInterval = voiceIntervals[0];
  if (bassInterval === undefined) return null;

  // Calculate root chroma from bass position
  const rootOpenNote = STANDARD_TUNING[bassString - 1];
  if (!rootOpenNote) return null;
  const rootOpenIndex = NOTE_NAMES.indexOf(Note.pitchClass(rootOpenNote) ?? "");
  const bassNoteChroma = (rootOpenIndex + bassNoteFret) % 12;

  let rootChroma = bassNoteChroma - (bassInterval % 12);
  if (rootChroma < 0) rootChroma += 12;

  // Initialize all positions as muted
  const positions: GuitarFretPosition[] = Array(6)
    .fill(null)
    .map((_, i) => ({ string: i + 1, fret: -1 }));

  // Sort strings from lowest pitch (highest number) to highest pitch (lowest number)
  const sortedStrings = [...strings].sort((a, b) => b - a);

  for (let i = 0; i < 4; i++) {
    const string = sortedStrings[i];
    const interval = voiceIntervals[i];
    if (string === undefined || interval === undefined) return null;

    // Calculate target note chroma
    const targetChroma = (rootChroma + interval + 120) % 12;

    // Get string open note
    const openNote = STANDARD_TUNING[string - 1];
    if (!openNote) return null;
    const openIndex = NOTE_NAMES.indexOf(Note.pitchClass(openNote) ?? "");

    // Calculate fret
    let fret = targetChroma - openIndex;
    if (fret < 0) fret += 12;

    // Adjust to be near the bass fret position
    const candidates = [fret, fret + 12, fret - 12].filter(
      (f) => f >= 0 && f <= 17,
    );
    let bestFret = candidates[0] ?? fret;
    let bestDist = Math.abs(bestFret - bassNoteFret);
    for (const c of candidates) {
      const dist = Math.abs(c - bassNoteFret);
      if (dist < bestDist) {
        bestDist = dist;
        bestFret = c;
      }
    }

    const note = getNoteAtFret(string, bestFret);
    const isRoot = interval % 12 === 0;

    positions[string - 1] = { string, fret: bestFret, note, isRoot };
  }

  // Check playability
  const frettedPositions = positions.filter((p) => p.fret > 0);
  if (frettedPositions.length > 0) {
    const minFret = Math.min(...frettedPositions.map((p) => p.fret));
    const maxFret = Math.max(...frettedPositions.map((p) => p.fret));
    if (maxFret - minFret > MAX_FRET_STRETCH) return null;
  }

  const playedFrets = positions.filter((p) => p.fret > 0).map((p) => p.fret);
  const baseFret = playedFrets.length > 0 ? Math.min(...playedFrets) : 0;

  return {
    id: generateId(),
    name: `${chord.symbol} - ${config.name}`,
    type: "drop3",
    positions,
    baseFret,
    isBarreChord: false,
    difficulty: "advanced",
    vSystem: getVSystemPosition(positions),
    stringGroup: getStringGroup(positions),
    voicingStructure: "drop3",
    inversion: config.inversion,
  };
}

/**
 * Generate all interval-based drop 3 voicings for a chord
 */
export function generateIntervalBasedDrop3Voicings(
  chord: Chord,
  options: { fretRange?: { min: number; max: number } } = {},
): GuitarVoicing[] {
  const { fretRange = { min: 0, max: 12 } } = options;
  const voicings: GuitarVoicing[] = [];

  const { seventh, third, fifth } = getIntervalsForQuality(chord.quality);
  if (seventh === null) return voicings;

  for (const config of DROP3_CONFIGS) {
    const strings = config.strings;
    const bassString = Math.max(...strings);

    // Get bass interval for this inversion
    const getVoiceOrder = DROP3_VOICE_ORDERS[config.inversion];
    const voiceIntervals = getVoiceOrder(third, seventh, fifth);
    const bassInterval = voiceIntervals[0];
    if (bassInterval === undefined) continue;

    // Calculate bass note
    const rootChroma = NOTE_NAMES.indexOf(
      Note.pitchClass(chord.root) ?? chord.root,
    );
    const bassChroma = (rootChroma + bassInterval + 120) % 12;
    const bassNote = NOTE_NAMES[bassChroma];
    if (!bassNote) continue;

    // Find positions of bass note on bass string
    const bassFrets = getFretForNote(
      bassString,
      bassNote as NoteName,
      fretRange.min,
      fretRange.max,
    );

    for (const bassFret of bassFrets) {
      const voicing = generateIntervalBasedDrop3Voicing(
        chord,
        config,
        bassFret,
      );
      if (voicing) {
        const maxFret = Math.max(
          ...voicing.positions.filter((p) => p.fret >= 0).map((p) => p.fret),
        );
        if (maxFret <= fretRange.max) {
          voicings.push(voicing);
        }
      }
    }
  }

  return deduplicateVoicings(voicings);
}

// ============================================
// Open Chord Templates (CAGED System)
// ============================================

/**
 * Open chord templates based on the CAGED system
 * These are the "cowboy chords" - basic open position shapes
 */
export const OPEN_CHORD_TEMPLATES: VoicingTemplate[] = [
  // C shape - Major
  {
    name: "C Shape",
    type: "open",
    quality: ["maj", "maj7"],
    relativePositions: [0, 1, 0, 2, 3, null],
    rootString: 5, // Root on A string (string 5)
    rootFretOffset: 3,
    difficulty: "beginner",
    isBarreChord: false,
    voicingStructure: "close",
    inversion: 0,
  },
  // A shape - Major
  {
    name: "A Shape",
    type: "open",
    quality: ["maj", "maj7"],
    relativePositions: [0, 2, 2, 2, 0, null],
    rootString: 5, // Root on A string
    rootFretOffset: 0,
    difficulty: "beginner",
    isBarreChord: false,
    voicingStructure: "close",
    inversion: 0,
  },
  // G shape - Major
  {
    name: "G Shape",
    type: "open",
    quality: ["maj", "maj7"],
    relativePositions: [3, 0, 0, 0, 2, 3],
    rootString: 6, // Root on low E string
    rootFretOffset: 3,
    difficulty: "beginner",
    isBarreChord: false,
    voicingStructure: "close",
    inversion: 0,
  },
  // E shape - Major
  {
    name: "E Shape",
    type: "open",
    quality: ["maj", "maj7"],
    relativePositions: [0, 0, 1, 2, 2, 0],
    rootString: 6, // Root on low E string
    rootFretOffset: 0,
    difficulty: "beginner",
    isBarreChord: false,
    voicingStructure: "close",
    inversion: 0,
  },
  // D shape - Major
  {
    name: "D Shape",
    type: "open",
    quality: ["maj", "maj7"],
    relativePositions: [2, 3, 2, 0, null, null],
    rootString: 4, // Root on D string
    rootFretOffset: 0,
    difficulty: "beginner",
    isBarreChord: false,
    voicingStructure: "close",
    inversion: 0,
  },
  // Am shape - Minor
  {
    name: "Am Shape",
    type: "open",
    quality: ["min", "min7"],
    relativePositions: [0, 1, 2, 2, 0, null],
    rootString: 5,
    rootFretOffset: 0,
    difficulty: "beginner",
    isBarreChord: false,
    voicingStructure: "close",
    inversion: 0,
  },
  // Em shape - Minor
  {
    name: "Em Shape",
    type: "open",
    quality: ["min", "min7"],
    relativePositions: [0, 0, 0, 2, 2, 0],
    rootString: 6,
    rootFretOffset: 0,
    difficulty: "beginner",
    isBarreChord: false,
    voicingStructure: "close",
    inversion: 0,
  },
  // Dm shape - Minor
  {
    name: "Dm Shape",
    type: "open",
    quality: ["min", "min7"],
    relativePositions: [1, 3, 2, 0, null, null],
    rootString: 4,
    rootFretOffset: 0,
    difficulty: "beginner",
    isBarreChord: false,
    voicingStructure: "close",
    inversion: 0,
  },
];

// ============================================
// Barre Chord Templates
// ============================================

/**
 * Movable barre chord templates
 * These can be moved up and down the neck to play any root note
 */
export const BARRE_CHORD_TEMPLATES: VoicingTemplate[] = [
  // E-shape barre - Major
  {
    name: "E-Shape Barre",
    type: "barre",
    quality: ["maj", "maj7"],
    relativePositions: [0, 0, 1, 2, 2, 0],
    rootString: 6,
    rootFretOffset: 0,
    difficulty: "intermediate",
    isBarreChord: true,
    barreOffset: 0,
    barreStrings: [1, 6],
    voicingStructure: "close",
    inversion: 0,
  },
  // E-shape barre - Minor
  {
    name: "E-Shape Barre Minor",
    type: "barre",
    quality: ["min", "min7"],
    relativePositions: [0, 0, 0, 2, 2, 0],
    rootString: 6,
    rootFretOffset: 0,
    difficulty: "intermediate",
    isBarreChord: true,
    barreOffset: 0,
    barreStrings: [1, 6],
    voicingStructure: "close",
    inversion: 0,
  },
  // A-shape barre - Major
  {
    name: "A-Shape Barre",
    type: "barre",
    quality: ["maj", "maj7"],
    relativePositions: [0, 2, 2, 2, 0, null],
    rootString: 5,
    rootFretOffset: 0,
    difficulty: "intermediate",
    isBarreChord: true,
    barreOffset: 0,
    barreStrings: [1, 5],
    voicingStructure: "close",
    inversion: 0,
  },
  // A-shape barre - Minor
  {
    name: "A-Shape Barre Minor",
    type: "barre",
    quality: ["min", "min7"],
    relativePositions: [0, 1, 2, 2, 0, null],
    rootString: 5,
    rootFretOffset: 0,
    difficulty: "intermediate",
    isBarreChord: true,
    barreOffset: 0,
    barreStrings: [1, 5],
    voicingStructure: "close",
    inversion: 0,
  },
  // E-shape barre - Dominant 7
  {
    name: "E-Shape Barre Dom7",
    type: "barre",
    quality: "7",
    relativePositions: [0, 0, 1, 0, 2, 0],
    rootString: 6,
    rootFretOffset: 0,
    difficulty: "intermediate",
    isBarreChord: true,
    barreOffset: 0,
    barreStrings: [1, 6],
    voicingStructure: "close",
    inversion: 0,
  },
  // A-shape barre - Dominant 7
  {
    name: "A-Shape Barre Dom7",
    type: "barre",
    quality: "7",
    relativePositions: [0, 2, 0, 2, 0, null],
    rootString: 5,
    rootFretOffset: 0,
    difficulty: "intermediate",
    isBarreChord: true,
    barreOffset: 0,
    barreStrings: [1, 5],
    voicingStructure: "close",
    inversion: 0,
  },
];

// ============================================
// Shell Voicing Templates (Jazz Voicings)
// ============================================

/**
 * Shell voicings - Root + 3rd + 7th (minimal jazz voicings)
 * These are essential for jazz comping and leave room for melody
 */
export const SHELL_VOICING_TEMPLATES: VoicingTemplate[] = [
  // Shell with root on 6th string - 3rd on top
  {
    name: "Shell 6th String (3-7)",
    type: "shell",
    quality: ["maj7", "min7", "7"],
    relativePositions: [null, null, 4, 4, null, 0],
    rootString: 6,
    rootFretOffset: 0,
    difficulty: "intermediate",
    isBarreChord: false,
    voicingStructure: "close",
    inversion: 0,
  },
  // Shell with root on 6th string - 7th on top
  {
    name: "Shell 6th String (7-3)",
    type: "shell",
    quality: ["maj7", "min7", "7"],
    relativePositions: [null, null, 3, 4, null, 0],
    rootString: 6,
    rootFretOffset: 0,
    difficulty: "intermediate",
    isBarreChord: false,
    voicingStructure: "close",
    inversion: 0,
  },
  // Shell with root on 5th string - 3rd on top
  {
    name: "Shell 5th String (3-7)",
    type: "shell",
    quality: ["maj7", "min7", "7"],
    relativePositions: [null, null, null, 4, 4, null],
    rootString: 5,
    rootFretOffset: 4,
    difficulty: "intermediate",
    isBarreChord: false,
    voicingStructure: "close",
    inversion: 0,
  },
  // Shell with root on 5th string - 7th on top
  {
    name: "Shell 5th String (7-3)",
    type: "shell",
    quality: ["maj7", "min7", "7"],
    relativePositions: [null, null, null, 3, 4, null],
    rootString: 5,
    rootFretOffset: 4,
    difficulty: "intermediate",
    isBarreChord: false,
    voicingStructure: "close",
    inversion: 0,
  },
  // Rootless shell (3rd + 7th only) - 6th string position
  {
    name: "Rootless Shell (3-7)",
    type: "rootless",
    quality: ["maj7", "min7", "7"],
    relativePositions: [null, null, 4, 4, null, null],
    rootString: 6, // Reference position
    rootFretOffset: 0,
    difficulty: "advanced",
    isBarreChord: false,
    voicingStructure: "close",
    inversion: 1,
  },
];

// ============================================
// Drop 2 Voicing Templates
// ============================================

/**
 * Drop 2 voicings - standard jazz guitar voicings
 * The second voice from the top is dropped an octave
 */
export const DROP2_VOICING_TEMPLATES: VoicingTemplate[] = [
  // Drop 2 on top 4 strings - Root position
  {
    name: "Drop 2 Top 4 (Root)",
    type: "drop2",
    quality: ["maj7", "min7", "7"],
    relativePositions: [0, 1, 2, 2, null, null],
    rootString: 4,
    rootFretOffset: 0,
    difficulty: "intermediate",
    isBarreChord: false,
    voicingStructure: "drop2",
    inversion: 0,
  },
  // Drop 2 on top 4 strings - 1st inversion
  {
    name: "Drop 2 Top 4 (1st Inv)",
    type: "drop2",
    quality: ["maj7", "min7", "7"],
    relativePositions: [1, 2, 2, 0, null, null],
    rootString: 4,
    rootFretOffset: 0,
    difficulty: "intermediate",
    isBarreChord: false,
    voicingStructure: "drop2",
    inversion: 1,
  },
  // Drop 2 on top 4 strings - 2nd inversion
  {
    name: "Drop 2 Top 4 (2nd Inv)",
    type: "drop2",
    quality: ["maj7", "min7", "7"],
    relativePositions: [2, 2, 0, 1, null, null],
    rootString: 4,
    rootFretOffset: 0,
    difficulty: "intermediate",
    isBarreChord: false,
    voicingStructure: "drop2",
    inversion: 2,
  },
  // Drop 2 on top 4 strings - 3rd inversion
  {
    name: "Drop 2 Top 4 (3rd Inv)",
    type: "drop2",
    quality: ["maj7", "min7", "7"],
    relativePositions: [2, 0, 1, 2, null, null],
    rootString: 4,
    rootFretOffset: 0,
    difficulty: "intermediate",
    isBarreChord: false,
    voicingStructure: "drop2",
    inversion: 3,
  },
  // Drop 2 on middle 4 strings - Root position
  {
    name: "Drop 2 Mid 4 (Root)",
    type: "drop2",
    quality: ["maj7", "min7", "7"],
    relativePositions: [null, 0, 1, 2, 2, null],
    rootString: 5,
    rootFretOffset: 0,
    difficulty: "intermediate",
    isBarreChord: false,
    voicingStructure: "drop2",
    inversion: 0,
  },
  // Drop 2 on bottom 4 strings - Root position
  {
    name: "Drop 2 Bottom 4 (Root)",
    type: "drop2",
    quality: ["maj7", "min7", "7"],
    relativePositions: [null, null, 0, 1, 2, 2],
    rootString: 6,
    rootFretOffset: 0,
    difficulty: "intermediate",
    isBarreChord: false,
    voicingStructure: "drop2",
    inversion: 0,
  },
];

// ============================================
// Drop 3 Voicing Templates
// ============================================

/**
 * Drop 3 voicings - the third voice from top is dropped an octave
 * Creates wider voicings, often spanning 5 strings
 */
export const DROP3_VOICING_TEMPLATES: VoicingTemplate[] = [
  // Drop 3 - Root position (strings 1, 2, 3, 5)
  {
    name: "Drop 3 (Root)",
    type: "drop3",
    quality: ["maj7", "min7", "7"],
    relativePositions: [0, 1, 2, null, 2, null],
    rootString: 5,
    rootFretOffset: 0,
    difficulty: "advanced",
    isBarreChord: false,
    voicingStructure: "drop3",
    inversion: 0,
  },
  // Drop 3 - 1st inversion
  {
    name: "Drop 3 (1st Inv)",
    type: "drop3",
    quality: ["maj7", "min7", "7"],
    relativePositions: [1, 2, 0, null, 2, null],
    rootString: 5,
    rootFretOffset: 0,
    difficulty: "advanced",
    isBarreChord: false,
    voicingStructure: "drop3",
    inversion: 1,
  },
  // Drop 3 with bass (strings 1, 2, 3, 6)
  {
    name: "Drop 3 with Bass (Root)",
    type: "drop3",
    quality: ["maj7", "min7", "7"],
    relativePositions: [0, 1, 2, null, null, 0],
    rootString: 6,
    rootFretOffset: 0,
    difficulty: "advanced",
    isBarreChord: false,
    voicingStructure: "drop3",
    inversion: 0,
  },
];

// ============================================
// Helper Functions
// ============================================

/**
 * Get the note at a specific fret on a specific string
 */
export function getNoteAtFret(stringNumber: number, fret: number): NoteName {
  const openNote = STANDARD_TUNING[stringNumber - 1];
  if (!openNote) {
    throw new Error(`Invalid string number: ${stringNumber}`);
  }
  const openNoteIndex = NOTE_NAMES.indexOf(Note.pitchClass(openNote) ?? "");
  const noteIndex = (openNoteIndex + fret) % 12;
  return NOTE_NAMES[noteIndex] as NoteName;
}

/**
 * Get the fret position for a given note on a given string
 * Returns all positions within a fret range
 */
export function getFretForNote(
  stringNumber: number,
  targetNote: NoteName,
  minFret = 0,
  maxFret = 15,
): number[] {
  const openNote = STANDARD_TUNING[stringNumber - 1];
  if (!openNote) {
    return [];
  }
  const openNoteIndex = NOTE_NAMES.indexOf(Note.pitchClass(openNote) ?? "");
  const targetIndex = NOTE_NAMES.indexOf(Note.pitchClass(targetNote) ?? "");

  const frets: number[] = [];
  for (let fret = minFret; fret <= maxFret; fret++) {
    if ((openNoteIndex + fret) % 12 === targetIndex) {
      frets.push(fret);
    }
  }
  return frets;
}

/**
 * Determine the V-System position based on which string has the root
 */
export function getVSystemPosition(
  positions: GuitarFretPosition[],
): VSystemPosition | undefined {
  const rootPosition = positions.find((p) => p.isRoot && p.fret >= 0);
  if (!rootPosition) return undefined;

  const vPositions: Record<number, VSystemPosition> = {
    1: "V-1",
    2: "V-2",
    3: "V-3",
    4: "V-4",
    5: "V-5",
    6: "V-6",
  };
  return vPositions[rootPosition.string];
}

/**
 * Determine the string group based on which strings are used
 */
export function getStringGroup(
  positions: GuitarFretPosition[],
): StringGroup | undefined {
  const usedStrings = positions
    .filter((p) => p.fret >= 0)
    .map((p) => p.string)
    .sort((a, b) => a - b);

  const minString = usedStrings.at(0);
  const maxString = usedStrings.at(-1);
  if (minString === undefined || maxString === undefined) return undefined;

  // Check for spread voicings (gaps in string usage)
  const hasGap = usedStrings.some((s, i) => {
    const prev = usedStrings[i - 1];
    return i > 0 && prev !== undefined && s - prev > 1;
  });
  if (hasGap) return "spread";

  // Determine based on string range
  if (maxString <= 4) return "top4";
  if (minString >= 3) return "bottom4";
  if (minString >= 2 && maxString <= 5) return "inner4";

  return "spread";
}

/**
 * Check if a voicing is physically playable (max 4 fret stretch)
 */
export function isPlayableVoicing(positions: GuitarFretPosition[]): boolean {
  const frettedPositions = positions.filter((p) => p.fret > 0);
  if (frettedPositions.length === 0) return true;

  const minFret = Math.min(...frettedPositions.map((p) => p.fret));
  const maxFret = Math.max(...frettedPositions.map((p) => p.fret));

  return maxFret - minFret <= MAX_FRET_STRETCH;
}

/**
 * Match chord quality with template qualities
 */
function qualityMatchesTemplate(
  chordQuality: ChordQuality,
  templateQuality: ChordQuality | ChordQuality[],
): boolean {
  if (Array.isArray(templateQuality)) {
    return templateQuality.includes(chordQuality);
  }
  return chordQuality === templateQuality;
}

// ============================================
// Voicing Generation
// ============================================

/**
 * Generate a guitar voicing from a template for a specific chord
 */
export function generateVoicingFromTemplate(
  template: VoicingTemplate,
  chord: Chord,
  targetFret?: number,
): GuitarVoicing | null {
  // Find the root note position on the specified string
  const rootString = template.rootString;
  const rootFrets = getFretForNote(rootString, chord.root, 0, 12);

  if (rootFrets.length === 0) return null;

  // Use target fret if specified, otherwise use the first available position
  let rootFret: number;
  if (targetFret !== undefined) {
    // Find closest root fret to target
    rootFret = rootFrets.reduce((closest, fret) =>
      Math.abs(fret - targetFret) < Math.abs(closest - targetFret)
        ? fret
        : closest,
    );
  } else {
    // For open chords, prefer lower positions
    const firstFret = rootFrets[0];
    const secondFret = rootFrets[1];
    rootFret =
      template.type === "open"
        ? (firstFret ?? 0)
        : (firstFret ?? secondFret ?? 0);
  }

  // Calculate actual fret positions
  const positions: GuitarFretPosition[] = [];
  let baseFret = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i < 6; i++) {
    const stringNumber = i + 1;
    const relativePosition = template.relativePositions[i];

    if (relativePosition === null || relativePosition === undefined) {
      positions.push({
        string: stringNumber,
        fret: -1, // Muted
      });
    } else {
      const actualFret = rootFret + relativePosition - template.rootFretOffset;

      if (actualFret < 0) {
        // Can't play below open string
        return null;
      }

      const note = getNoteAtFret(stringNumber, actualFret);
      const isRoot = note === chord.root;

      positions.push({
        string: stringNumber,
        fret: actualFret,
        isRoot,
        note,
      });

      if (actualFret < baseFret && actualFret > 0) {
        baseFret = actualFret;
      }
    }
  }

  // Handle open chord case
  if (baseFret === Number.MAX_SAFE_INTEGER) {
    baseFret = 0;
  }

  // Check playability
  if (!isPlayableVoicing(positions)) {
    return null;
  }

  // Build the voicing
  const voicing: GuitarVoicing = {
    id: generateId(),
    name: `${chord.symbol} - ${template.name}`,
    type: template.type,
    positions,
    baseFret,
    isBarreChord: template.isBarreChord,
    difficulty: template.difficulty,
    vSystem: getVSystemPosition(positions),
    stringGroup: getStringGroup(positions),
    voicingStructure: template.voicingStructure,
    inversion: template.inversion,
  };

  if (template.isBarreChord && template.barreOffset !== undefined) {
    voicing.barreFret = rootFret + template.barreOffset;
    voicing.barreStrings = template.barreStrings;
  }

  return voicing;
}

/**
 * Get all voicing templates
 */
export function getAllTemplates(): VoicingTemplate[] {
  return [
    ...OPEN_CHORD_TEMPLATES,
    ...BARRE_CHORD_TEMPLATES,
    ...SHELL_VOICING_TEMPLATES,
    ...DROP2_VOICING_TEMPLATES,
    ...DROP3_VOICING_TEMPLATES,
  ];
}

/**
 * Generate all available voicings for a chord
 */
export function generateVoicingsForChord(
  chord: Chord,
  options: {
    types?: GuitarVoicingType[];
    maxDifficulty?: "beginner" | "intermediate" | "advanced";
    fretRange?: { min: number; max: number };
  } = {},
): GuitarVoicing[] {
  const { types, maxDifficulty = "advanced", fretRange } = options;

  const difficultyOrder = ["beginner", "intermediate", "advanced"];
  const maxDifficultyIndex = difficultyOrder.indexOf(maxDifficulty);

  const voicings: GuitarVoicing[] = [];
  const templates = getAllTemplates();

  for (const template of templates) {
    // Skip templates that use interval-based generation
    if (
      template.type === "shell" ||
      template.type === "rootless" ||
      template.type === "drop2" ||
      template.type === "drop3"
    ) {
      continue;
    }

    // Filter by type
    if (types && !types.includes(template.type)) {
      continue;
    }

    // Filter by difficulty
    const templateDifficultyIndex = difficultyOrder.indexOf(
      template.difficulty,
    );
    if (templateDifficultyIndex > maxDifficultyIndex) {
      continue;
    }

    // Check if chord quality matches
    if (!qualityMatchesTemplate(chord.quality, template.quality)) {
      continue;
    }

    // Generate voicings at different positions
    const minFret = fretRange?.min ?? 0;
    const maxFret = fretRange?.max ?? 12;

    // Try generating at multiple fret positions
    const rootFrets = getFretForNote(
      template.rootString,
      chord.root,
      minFret,
      maxFret,
    );

    for (const fret of rootFrets) {
      const voicing = generateVoicingFromTemplate(template, chord, fret);
      if (voicing) {
        // Check fret range
        if (fretRange) {
          const maxVoicingFret = Math.max(
            ...voicing.positions.filter((p) => p.fret >= 0).map((p) => p.fret),
          );
          if (maxVoicingFret > fretRange.max) continue;
        }
        voicings.push(voicing);
      }
    }
  }

  // Add interval-based voicings for types that need them
  const fretRangeOption = fretRange ?? { min: 0, max: 12 };

  // Shell voicings (intermediate difficulty)
  const includeShell = !types || types.includes("shell");
  const shellDifficultyOk = maxDifficultyIndex >= 1; // intermediate or above
  if (includeShell && shellDifficultyOk) {
    const shellVoicings = generateIntervalBasedShellVoicings(chord, {
      fretRange: fretRangeOption,
    });
    voicings.push(...shellVoicings);
  }

  // Drop 2 voicings (intermediate difficulty)
  const includeDrop2 = !types || types.includes("drop2");
  const drop2DifficultyOk = maxDifficultyIndex >= 1; // intermediate or above
  if (includeDrop2 && drop2DifficultyOk) {
    const drop2Voicings = generateIntervalBasedDrop2Voicings(chord, {
      fretRange: fretRangeOption,
    });
    voicings.push(...drop2Voicings);
  }

  // Drop 3 voicings (advanced difficulty)
  const includeDrop3 = !types || types.includes("drop3");
  const drop3DifficultyOk = maxDifficultyIndex >= 2; // advanced only
  if (includeDrop3 && drop3DifficultyOk) {
    const drop3Voicings = generateIntervalBasedDrop3Voicings(chord, {
      fretRange: fretRangeOption,
    });
    voicings.push(...drop3Voicings);
  }

  // Remove duplicates based on positions
  return deduplicateVoicings(voicings);
}

/**
 * Remove duplicate voicings (same fret positions)
 */
function deduplicateVoicings(voicings: GuitarVoicing[]): GuitarVoicing[] {
  const seen = new Set<string>();
  return voicings.filter((v) => {
    const key = v.positions.map((p) => `${p.string}:${p.fret}`).join(",");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Get voicings filtered by type
 */
export function getVoicingsByType(
  chord: Chord,
  type: GuitarVoicingType,
): GuitarVoicing[] {
  return generateVoicingsForChord(chord, { types: [type] });
}

/**
 * Get open chord voicings
 */
export function getOpenVoicings(chord: Chord): GuitarVoicing[] {
  return getVoicingsByType(chord, "open");
}

/**
 * Get barre chord voicings
 */
export function getBarreVoicings(chord: Chord): GuitarVoicing[] {
  return getVoicingsByType(chord, "barre");
}

/**
 * Get shell voicings (jazz voicings)
 * Uses interval-based generation for correct chord tones
 */
export function getShellVoicings(chord: Chord): GuitarVoicing[] {
  return generateIntervalBasedShellVoicings(chord);
}

/**
 * Get drop 2 voicings
 */
export function getDrop2Voicings(chord: Chord): GuitarVoicing[] {
  return getVoicingsByType(chord, "drop2");
}

/**
 * Get drop 3 voicings
 */
export function getDrop3Voicings(chord: Chord): GuitarVoicing[] {
  return getVoicingsByType(chord, "drop3");
}

/**
 * Sort voicings by priority for display
 * Priority: lower position first, simpler voicings first
 */
export function sortVoicingsByPriority(
  voicings: GuitarVoicing[],
): GuitarVoicing[] {
  const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
  const typeOrder = {
    open: 0,
    barre: 1,
    shell: 2,
    triadic: 3,
    drop2: 4,
    drop3: 5,
    rootless: 6,
  };

  return [...voicings].sort((a, b) => {
    // First by difficulty
    const diffDiff =
      difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    if (diffDiff !== 0) return diffDiff;

    // Then by type
    const typeDiff = typeOrder[a.type] - typeOrder[b.type];
    if (typeDiff !== 0) return typeDiff;

    // Then by position (lower frets first)
    return a.baseFret - b.baseFret;
  });
}
