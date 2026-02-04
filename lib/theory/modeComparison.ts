import { Scale } from "tonal";
import type {
  ModeComparisonResult,
  ModeIntervalDiff,
  NoteName,
} from "@/lib/types";

/**
 * Parses a full scale name into root and scale type
 * e.g., "D Dorian" -> { root: "D", scaleType: "dorian" }
 */
export function parseScaleName(fullName: string): {
  root: NoteName;
  scaleType: string;
} {
  const parts = fullName.split(" ");
  const root = parts[0] as NoteName;
  const scaleType = parts.slice(1).join(" ").toLowerCase();
  return { root, scaleType };
}

/**
 * Gets the intervals of a scale using tonal
 */
function getScaleIntervals(fullScaleName: string): string[] {
  const scale = Scale.get(fullScaleName);
  return scale.intervals || [];
}

/**
 * Gets the notes of a scale
 */
function getScaleNotes(fullScaleName: string): NoteName[] {
  const scale = Scale.get(fullScaleName);
  return (scale.notes as NoteName[]) || [];
}

/**
 * Maps interval to scale degree label
 */
function intervalToDegreeLabel(interval: string): string {
  const mapping: Record<string, string> = {
    "1P": "1",
    "2m": "♭2",
    "2M": "2",
    "3m": "♭3",
    "3M": "3",
    "4P": "4",
    "4A": "♯4",
    "5d": "♭5",
    "5P": "5",
    "5A": "♯5",
    "6m": "♭6",
    "6M": "6",
    "7m": "♭7",
    "7M": "7",
  };
  return mapping[interval] || interval;
}

/**
 * Gets a description of the interval difference
 */
function getIntervalDifferenceDescription(
  mode1Interval: string,
  mode2Interval: string,
  degree: number,
): string | undefined {
  const degreeNames: Record<number, string> = {
    2: "2nd",
    3: "3rd",
    4: "4th",
    5: "5th",
    6: "6th",
    7: "7th",
  };

  const degreeName = degreeNames[degree] || `${degree}th`;

  // Determine which is "raised" vs "lowered"
  // Major/Perfect intervals are "natural", minor/diminished are "lowered", augmented are "raised"
  const isMode1Raised =
    mode1Interval.includes("M") ||
    mode1Interval.includes("A") ||
    mode1Interval === "4P";
  const isMode2Raised =
    mode2Interval.includes("M") ||
    mode2Interval.includes("A") ||
    mode2Interval === "4P";

  if (isMode1Raised && !isMode2Raised) {
    return `Raised ${degreeName}`;
  } else if (!isMode1Raised && isMode2Raised) {
    return `Lowered ${degreeName}`;
  }
  return undefined;
}

/**
 * Gets the pitch class (0-11) for a note
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
 * Checks if two notes are enharmonically equivalent
 */
function enharmonicEqual(note1: string, note2: string): boolean {
  return getPitchClass(note1) === getPitchClass(note2);
}

/**
 * Compares two modes and returns detailed comparison
 */
export function compareModes(
  mode1FullName: string,
  mode2FullName: string,
): ModeComparisonResult | null {
  const { root: root1, scaleType: type1 } = parseScaleName(mode1FullName);
  const { root: root2, scaleType: type2 } = parseScaleName(mode2FullName);

  const mode1Notes = getScaleNotes(mode1FullName);
  const mode2Notes = getScaleNotes(mode2FullName);
  const mode1Intervals = getScaleIntervals(mode1FullName);
  const mode2Intervals = getScaleIntervals(mode2FullName);

  if (mode1Notes.length === 0 || mode2Notes.length === 0) {
    return null;
  }

  // Build interval comparison
  const intervals: ModeIntervalDiff[] = [];
  const maxLen = Math.max(mode1Intervals.length, mode2Intervals.length);

  for (let i = 0; i < maxLen; i++) {
    const mode1Interval = mode1Intervals[i] || "";
    const mode2Interval = mode2Intervals[i] || "";
    const mode1Note = mode1Notes[i] || ("" as NoteName);
    const mode2Note = mode2Notes[i] || ("" as NoteName);

    const isDifferent =
      mode1Interval !== mode2Interval || !enharmonicEqual(mode1Note, mode2Note);

    intervals.push({
      degree: i + 1,
      degreeLabel: intervalToDegreeLabel(mode1Interval),
      mode1Note,
      mode2Note,
      mode1Interval,
      mode2Interval,
      isDifferent,
      differenceDescription: isDifferent
        ? getIntervalDifferenceDescription(mode1Interval, mode2Interval, i + 1)
        : undefined,
    });
  }

  // Calculate shared and unique notes
  const mode1Set = new Set(mode1Notes.map((n) => getPitchClass(n)));
  const mode2Set = new Set(mode2Notes.map((n) => getPitchClass(n)));

  const sharedNotes = mode1Notes.filter((note) =>
    mode2Set.has(getPitchClass(note)),
  );
  const mode1UniqueNotes = mode1Notes.filter(
    (note) => !mode2Set.has(getPitchClass(note)),
  );
  const mode2UniqueNotes = mode2Notes.filter(
    (note) => !mode1Set.has(getPitchClass(note)),
  );

  // Generate key difference description
  const keyDifference = generateKeyDifference(
    type1,
    type2,
    intervals.filter((i) => i.isDifferent),
  );

  return {
    mode1Name: mode1FullName,
    mode2Name: mode2FullName,
    mode1Root: root1,
    mode2Root: root2,
    intervals,
    sharedNotes,
    mode1UniqueNotes,
    mode2UniqueNotes,
    keyDifference,
  };
}

/**
 * Generates a key difference description for two modes
 */
function generateKeyDifference(
  mode1Type: string,
  _mode2Type: string,
  differences: ModeIntervalDiff[],
): string {
  if (differences.length === 0) {
    return "These modes have identical intervals.";
  }

  const diffDescriptions = differences
    .filter((d) => d.differenceDescription)
    .map((d) => d.differenceDescription)
    .join(", ");

  if (diffDescriptions) {
    const capitalizedMode1 =
      mode1Type.charAt(0).toUpperCase() + mode1Type.slice(1);
    return `${capitalizedMode1} has a ${diffDescriptions.toLowerCase()}.`;
  }

  return `${differences.length} scale degree(s) differ between the modes.`;
}

/**
 * Common mode comparison presets
 */
export const MODE_COMPARISON_PRESETS: Array<{
  label: string;
  mode1Type: string;
  mode2Type: string;
  description: string;
}> = [
  {
    label: "Dorian vs Aeolian",
    mode1Type: "dorian",
    mode2Type: "aeolian",
    description: "The 6th is the difference — Dorian is brighter",
  },
  {
    label: "Mixolydian vs Ionian",
    mode1Type: "mixolydian",
    mode2Type: "major",
    description: "The ♭7 gives Mixolydian its bluesy edge",
  },
  {
    label: "Phrygian vs Aeolian",
    mode1Type: "phrygian",
    mode2Type: "aeolian",
    description: "The ♭2 adds Spanish/flamenco darkness",
  },
  {
    label: "Lydian vs Ionian",
    mode1Type: "lydian",
    mode2Type: "major",
    description: "The ♯4 creates Lydian's floating quality",
  },
  {
    label: "Dorian vs Mixolydian",
    mode1Type: "dorian",
    mode2Type: "mixolydian",
    description: "Minor vs Major 3rd — same ♭7",
  },
];

/**
 * Gets available modes for comparison (common modes)
 */
export const AVAILABLE_MODES = [
  "major",
  "dorian",
  "phrygian",
  "lydian",
  "mixolydian",
  "aeolian",
  "locrian",
  "harmonic minor",
  "melodic minor",
  "pentatonic major",
  "pentatonic minor",
  "blues",
];

/**
 * Capitalizes a mode name for display
 */
export function formatModeName(modeType: string): string {
  return modeType
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
