import type {
  BarChord,
  ChordSymbol,
  Progression,
  ProgressionBar,
} from "@/lib/types";
import { parseChordSymbol } from "./chords";

/**
 * Generates a unique ID for bars
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Parses a bar string into a ProgressionBar
 * Supports 1-2 chords per bar, split by whitespace
 * e.g., "Dm7" -> one chord (4 beats)
 * e.g., "Dm7 G7" -> two chords (2 beats each)
 */
export function parseBar(
  barString: string,
  totalBeats: number = 4,
): ProgressionBar | null {
  const trimmed = barString.trim();
  if (!trimmed) return null;

  // Split by whitespace to get individual chord symbols
  const chordSymbols = trimmed.split(/\s+/).filter(Boolean);
  if (chordSymbols.length === 0) return null;

  // Validate all chords can be parsed
  for (const symbol of chordSymbols) {
    const parsed = parseChordSymbol(symbol);
    if (!parsed) return null;
  }

  // Calculate beats per chord
  const beatsPerChord = totalBeats / chordSymbols.length;

  const chords: BarChord[] = chordSymbols.map((symbol) => ({
    chord: symbol,
    beats: beatsPerChord,
  }));

  return {
    id: generateId(),
    totalBeats,
    chords,
  };
}

/**
 * Parses a progression string into a Progression object
 * Format: "| Chord1 | Chord2 Chord3 | Chord4 |" or "Chord1, Chord2, Chord3"
 *
 * Supports:
 * - Bar notation with pipes: "| Dm7 | G7 | Cmaj7 |"
 * - Multiple chords per bar: "| Dm7 G7 | Cmaj7 |"
 * - Comma-separated: "Dm7, G7, Cmaj7"
 * - Space-separated (one chord per bar): "Dm7 G7 Cmaj7"
 */
export function parseProgression(
  input: string,
  options: {
    name?: string;
    timeSignature?: { numerator: number; denominator: number };
  } = {},
): Progression | null {
  const {
    name = "Custom Progression",
    timeSignature = { numerator: 4, denominator: 4 },
  } = options;

  const totalBeats = timeSignature.numerator;
  const bars: ProgressionBar[] = [];

  // Check if input uses bar notation (pipes)
  if (input.includes("|")) {
    // Split by pipes and filter empty strings
    const barStrings = input
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const barString of barStrings) {
      const bar = parseBar(barString, totalBeats);
      if (!bar) return null; // Invalid chord found
      bars.push(bar);
    }
  }
  // Check if input uses comma separation
  else if (input.includes(",")) {
    const chordSymbols = input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const symbol of chordSymbols) {
      const bar = parseBar(symbol, totalBeats);
      if (!bar) return null;
      bars.push(bar);
    }
  }
  // Default: space-separated, one chord per bar
  else {
    const chordSymbols = input.split(/\s+/).filter(Boolean);

    for (const symbol of chordSymbols) {
      const bar = parseBar(symbol, totalBeats);
      if (!bar) return null;
      bars.push(bar);
    }
  }

  if (bars.length === 0) return null;

  return {
    id: generateId(),
    name,
    timeSignature,
    bars,
  };
}

/**
 * Creates a progression from an array of chord symbols
 * Each chord gets its own bar
 */
export function createProgression(
  chordSymbols: ChordSymbol[],
  options: {
    name?: string;
    timeSignature?: { numerator: number; denominator: number };
  } = {},
): Progression | null {
  const {
    name = "Custom Progression",
    timeSignature = { numerator: 4, denominator: 4 },
  } = options;

  const bars: ProgressionBar[] = [];

  for (const symbol of chordSymbols) {
    const parsed = parseChordSymbol(symbol);
    if (!parsed) return null;

    bars.push({
      id: generateId(),
      totalBeats: timeSignature.numerator,
      chords: [{ chord: symbol, beats: timeSignature.numerator }],
    });
  }

  if (bars.length === 0) return null;

  return {
    id: generateId(),
    name,
    timeSignature,
    bars,
  };
}

/**
 * Helper to assert a progression was created successfully
 */
function assertProgression(
  progression: Progression | null,
  name: string,
): Progression {
  if (!progression) {
    throw new Error(`Failed to create preset progression: ${name}`);
  }
  return progression;
}

/**
 * Preset progressions
 */
export const PRESET_PROGRESSIONS = {
  "ii-V-I in C": assertProgression(
    createProgression(["Dm7", "G7", "Cmaj7", "Cmaj7"], {
      name: "ii-V-I in C",
    }),
    "ii-V-I in C",
  ),

  "I-V-vi-IV in C": assertProgression(
    createProgression(["C", "G", "Am", "F"], {
      name: "I-V-vi-IV in C",
    }),
    "I-V-vi-IV in C",
  ),

  "12-bar blues in A": assertProgression(
    parseProgression(
      "| A7 | A7 | A7 | A7 | D7 | D7 | A7 | A7 | E7 | D7 | A7 | E7 |",
      { name: "12-bar blues in A" },
    ),
    "12-bar blues in A",
  ),
} as const;

/**
 * Gets all chord symbols from a progression (flattened)
 */
export function getAllChordsFromProgression(
  progression: Progression,
): ChordSymbol[] {
  return progression.bars.flatMap((bar) => bar.chords.map((bc) => bc.chord));
}

/**
 * Gets the total number of beats in a progression
 */
export function getProgressionTotalBeats(progression: Progression): number {
  return progression.bars.reduce((total, bar) => total + bar.totalBeats, 0);
}
