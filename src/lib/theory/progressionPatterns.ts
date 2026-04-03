import { Note } from "tonal";
import type { Chord, Progression } from "@/lib/types";
import { parseChordSymbol } from "./chords";
import type { DetectedKey } from "./keyDetection";
import { getAllChordsFromProgression } from "./progression";

// ============================================
// Types
// ============================================

export type PatternCategory =
  | "cadence"
  | "turnaround"
  | "modal"
  | "secondary"
  | "circle";

export interface DetectedPattern {
  /** Pattern type identifier */
  type: string;
  /** Human-readable label */
  label: string;
  /** Category for grouping */
  category: PatternCategory;
  /** Bar indices where pattern starts and ends (inclusive) */
  barRange: [number, number];
  /** Chord indices within the progression */
  chordIndices: number[];
  /** Key context for this pattern */
  keyContext: { root: string; mode: "major" | "minor" };
  /** Educational description */
  description: string;
  /** Confidence score 0-1 */
  confidence: number;
}

export interface BorrowedChord {
  /** Bar index */
  barIndex: number;
  /** Chord index within the bar */
  chordIndex: number;
  /** The chord symbol */
  symbol: string;
  /** Source mode (e.g., "minor" when in major key) */
  sourceMode: string;
  /** Roman numeral in borrowed context */
  borrowedNumeral: string;
  /** Explanation */
  description: string;
}

export interface SecondaryDominant {
  /** Bar index of the secondary dominant */
  barIndex: number;
  /** Chord index within the bar */
  chordIndex: number;
  /** The dominant chord symbol */
  dominantSymbol: string;
  /** Target chord it resolves to */
  targetSymbol: string;
  /** Target bar index */
  targetBarIndex: number;
  /** Roman numeral notation (e.g., "V7/V") */
  notation: string;
  /** Whether it actually resolves in the progression */
  resolves: boolean;
}

// ============================================
// Pattern Definitions
// ============================================

interface PatternDefinition {
  /** Roman numeral pattern (normalized, no quality suffixes) */
  numerals: string[];
  /** Category */
  category: PatternCategory;
  /** Display label */
  label: string;
  /** Educational description */
  description: string;
  /** Optional quality requirements by index */
  qualityRequirements?: Record<number, string[]>;
}

const PATTERN_DEFINITIONS: Record<string, PatternDefinition> = {
  "ii-V-I": {
    numerals: ["ii", "V", "I"],
    category: "cadence",
    label: "ii-V-I Cadence",
    description:
      "The most common jazz cadence. Creates strong resolution through circle-of-fifths motion.",
  },
  "ii-V-i": {
    numerals: ["ii", "V", "i"],
    category: "cadence",
    label: "Minor ii-V-i",
    description:
      "Minor key cadence with half-diminished ii chord leading to dominant V.",
    qualityRequirements: { 0: ["min7b5"], 2: ["min", "min7", "min9"] },
  },
  "I-vi-IV-V": {
    numerals: ["I", "vi", "IV", "V"],
    category: "cadence",
    label: "'50s Progression",
    description:
      "Classic doo-wop progression found in countless pop and rock songs.",
  },
  "I-IV-V-I": {
    numerals: ["I", "IV", "V", "I"],
    category: "cadence",
    label: "I-IV-V-I Cadence",
    description: "Fundamental tonal cadence in Western music.",
  },
  "iii-vi-ii-V": {
    numerals: ["iii", "vi", "ii", "V"],
    category: "turnaround",
    label: "iii-vi-ii-V Turnaround",
    description:
      "Extended turnaround moving through the circle of fifths. Common in jazz standards.",
  },
  "I-VI-II-V": {
    numerals: ["I", "VI", "II", "V"],
    category: "turnaround",
    label: "Rhythm Changes Turnaround",
    description:
      "Turnaround with secondary dominants (VI7 and II7). Named after Gershwin's 'I Got Rhythm'.",
  },
  "backdoor-ii-V": {
    numerals: ["iv", "bVII"],
    category: "cadence",
    label: "Backdoor ii-V",
    description:
      "Alternative resolution using iv-bVII7 to I. Creates a softer, unexpected cadence.",
  },
  "I-V-vi-IV": {
    numerals: ["I", "V", "vi", "IV"],
    category: "cadence",
    label: "Pop Progression",
    description:
      "Ubiquitous modern pop progression. Works in major keys with strong emotional pull.",
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Gets the chroma (0-11) for a note name
 */
function getChroma(note: string): number {
  return Note.chroma(note) ?? 0;
}

/**
 * Normalize a roman numeral by removing quality suffixes for pattern matching
 */
function normalizeRomanNumeral(numeral: string): string {
  // Remove common suffixes: maj7, 7, ø7, °7, °, +, 9, etc.
  return numeral
    .replace(/maj[79]?/g, "")
    .replace(/ø[79]?/g, "")
    .replace(/°[79]?/g, "")
    .replace(/[79]/g, "")
    .replace(/\+/g, "")
    .replace(/sus[24]/g, "")
    .replace(/add\d+/g, "")
    .replace(/6/g, "");
}

/**
 * Check if a chord quality matches a list of allowed qualities
 */
function qualityMatches(
  chord: Chord,
  allowedQualities: string[] | undefined,
): boolean {
  if (!allowedQualities) return true;
  return allowedQualities.includes(chord.quality);
}

/**
 * Get chord with bar and position info from a progression
 */
interface ChordWithPosition {
  chord: Chord;
  barIndex: number;
  chordIndex: number;
  globalIndex: number;
}

function getChordsWithPositions(progression: Progression): ChordWithPosition[] {
  const result: ChordWithPosition[] = [];
  let globalIndex = 0;

  for (let barIndex = 0; barIndex < progression.bars.length; barIndex++) {
    const bar = progression.bars[barIndex];
    if (!bar) continue;

    for (let chordIndex = 0; chordIndex < bar.chords.length; chordIndex++) {
      const barChord = bar.chords[chordIndex];
      if (!barChord) continue;

      const parsed = parseChordSymbol(barChord.chord);
      if (parsed) {
        result.push({
          chord: parsed,
          barIndex,
          chordIndex,
          globalIndex,
        });
        globalIndex++;
      }
    }
  }

  return result;
}

// ============================================
// Pattern Detection
// ============================================

/**
 * Detect common chord progression patterns
 */
export function detectPatterns(
  progression: Progression,
  key: DetectedKey,
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const chordSymbols = getAllChordsFromProgression(progression);

  if (chordSymbols.length === 0 || !key.romanNumerals.length) {
    return patterns;
  }

  // Normalize roman numerals for pattern matching
  const normalizedNumerals = key.romanNumerals.map(normalizeRomanNumeral);
  const chords = chordSymbols
    .map((s) => parseChordSymbol(s))
    .filter((c): c is Chord => c !== null);

  // Try each pattern definition
  for (const [patternType, definition] of Object.entries(PATTERN_DEFINITIONS)) {
    const patternLength = definition.numerals.length;

    // Slide window across the progression
    for (let i = 0; i <= normalizedNumerals.length - patternLength; i++) {
      const windowNumerals = normalizedNumerals.slice(i, i + patternLength);
      const windowChords = chords.slice(i, i + patternLength);

      // Check if numerals match
      const numeralsMatch = definition.numerals.every(
        (expected, idx) =>
          windowNumerals[idx]?.toLowerCase() === expected.toLowerCase(),
      );

      if (!numeralsMatch) continue;

      // Check quality requirements if specified
      let qualitiesMatch = true;
      if (definition.qualityRequirements) {
        for (const [idxStr, allowedQualities] of Object.entries(
          definition.qualityRequirements,
        )) {
          const idx = Number.parseInt(idxStr, 10);
          const chord = windowChords[idx];
          if (chord && !qualityMatches(chord, allowedQualities)) {
            qualitiesMatch = false;
            break;
          }
        }
      }

      if (!qualitiesMatch) continue;

      // Found a match - calculate bar range
      const chordsWithPos = getChordsWithPositions(progression);
      const startChord = chordsWithPos[i];
      const endChord = chordsWithPos[i + patternLength - 1];

      if (startChord && endChord) {
        patterns.push({
          type: patternType,
          label: definition.label,
          category: definition.category,
          barRange: [startChord.barIndex, endChord.barIndex],
          chordIndices: Array.from(
            { length: patternLength },
            (_, idx) => i + idx,
          ),
          keyContext: { root: key.root, mode: key.mode },
          description: definition.description,
          confidence: 1.0,
        });
      }
    }
  }

  // Remove duplicate/overlapping patterns (keep longer ones)
  return deduplicatePatterns(patterns);
}

/**
 * Remove overlapping patterns, preferring longer or more specific ones
 */
function deduplicatePatterns(patterns: DetectedPattern[]): DetectedPattern[] {
  // Sort by length (descending) then by start position
  const sorted = [...patterns].sort((a, b) => {
    const lenA = a.chordIndices.length;
    const lenB = b.chordIndices.length;
    if (lenB !== lenA) return lenB - lenA;
    return (a.chordIndices[0] ?? 0) - (b.chordIndices[0] ?? 0);
  });

  const result: DetectedPattern[] = [];
  const usedIndices = new Set<number>();

  for (const pattern of sorted) {
    // Check if this pattern overlaps with already selected ones
    const hasOverlap = pattern.chordIndices.some((idx) => usedIndices.has(idx));

    if (!hasOverlap) {
      result.push(pattern);
      for (const idx of pattern.chordIndices) {
        usedIndices.add(idx);
      }
    }
  }

  return result.sort(
    (a, b) => (a.chordIndices[0] ?? 0) - (b.chordIndices[0] ?? 0),
  );
}

// ============================================
// Borrowed Chord Detection
// ============================================

/**
 * Borrowed chord definitions for major keys (from parallel minor)
 */
const BORROWED_FROM_MINOR: Record<
  number,
  { numeral: string; description: string; qualities: string[] }
> = {
  10: {
    numeral: "bVII",
    description: "Borrowed from parallel minor (Mixolydian)",
    qualities: ["maj", "maj7", "7"],
  },
  8: {
    numeral: "bVI",
    description: "Borrowed from parallel minor (Aeolian)",
    qualities: ["maj", "maj7"],
  },
  3: {
    numeral: "bIII",
    description: "Borrowed from parallel minor",
    qualities: ["maj", "maj7"],
  },
  5: {
    numeral: "iv",
    description: "Minor iv borrowed from parallel minor",
    qualities: ["min", "min7"],
  },
};

/**
 * Detect chords borrowed from parallel modes
 */
export function detectBorrowedChords(
  progression: Progression,
  key: DetectedKey,
): BorrowedChord[] {
  // Only detect borrowed chords in major keys
  if (key.mode !== "major") {
    return [];
  }

  const borrowed: BorrowedChord[] = [];
  const keyChroma = getChroma(key.root);
  const chordsWithPos = getChordsWithPositions(progression);

  for (const { chord, barIndex, chordIndex } of chordsWithPos) {
    const interval = (getChroma(chord.root) - keyChroma + 12) % 12;
    const borrowedInfo = BORROWED_FROM_MINOR[interval];

    if (borrowedInfo?.qualities.includes(chord.quality)) {
      // Special case: interval 5 is diatonic IV in major, only iv (minor) is borrowed
      if (interval === 5 && !chord.quality.startsWith("min")) {
        continue;
      }

      borrowed.push({
        barIndex,
        chordIndex,
        symbol: chord.symbol,
        sourceMode: "parallel minor",
        borrowedNumeral: borrowedInfo.numeral,
        description: borrowedInfo.description,
      });
    }
  }

  return borrowed;
}

// ============================================
// Secondary Dominant Detection
// ============================================

/**
 * Check if a chord is the diatonic V7 of the key
 */
function isDiatonicDominant(chord: Chord, key: DetectedKey): boolean {
  const keyChroma = getChroma(key.root);
  const chordChroma = getChroma(chord.root);
  const interval = (chordChroma - keyChroma + 12) % 12;

  // V chord is 7 semitones above the root
  return interval === 7;
}

/**
 * Detect secondary dominant relationships
 */
export function detectSecondaryDominants(
  progression: Progression,
  key: DetectedKey,
): SecondaryDominant[] {
  const secondaries: SecondaryDominant[] = [];
  const chordsWithPos = getChordsWithPositions(progression);

  for (let i = 0; i < chordsWithPos.length - 1; i++) {
    const current = chordsWithPos[i];
    const next = chordsWithPos[i + 1];

    if (!current || !next) continue;

    // Is current a dominant 7th chord?
    if (current.chord.quality !== "7" && current.chord.quality !== "9") {
      continue;
    }

    // Is this the diatonic V7? Skip if so
    if (isDiatonicDominant(current.chord, key)) {
      continue;
    }

    // Does it resolve down a fifth to next chord?
    const interval =
      (getChroma(next.chord.root) - getChroma(current.chord.root) + 12) % 12;

    // P5 down = 7 semitones up (or P4 up = 5 semitones)
    if (interval !== 7 && interval !== 5) {
      continue;
    }

    // Get the target's roman numeral
    const targetIndex = next.globalIndex;
    const targetNumeral = key.romanNumerals[targetIndex];

    if (targetNumeral) {
      const normalizedTarget = normalizeRomanNumeral(targetNumeral);
      secondaries.push({
        barIndex: current.barIndex,
        chordIndex: current.chordIndex,
        dominantSymbol: current.chord.symbol,
        targetSymbol: next.chord.symbol,
        targetBarIndex: next.barIndex,
        notation: `V7/${normalizedTarget}`,
        resolves: true,
      });
    }
  }

  return secondaries;
}
