import { Note, Scale } from "tonal";
import type { Chord, NoteName, Progression } from "@/lib/types";
import { parseChordSymbol } from "./chords";
import { getAllChordsFromProgression } from "./progression";

/**
 * All 12 possible key roots (using sharps for consistency with tonal)
 */
const ALL_ROOTS: NoteName[] = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

/**
 * Represents a detected key with confidence score
 */
export interface DetectedKey {
  root: NoteName;
  mode: "major" | "minor";
  /** Display label like "C Major" or "A Minor" */
  label: string;
  /** 0-1 confidence score based on how many chord tones fit the key */
  confidence: number;
  /** Roman numeral analysis of each chord in the key */
  romanNumerals: string[];
}

/**
 * Maps semitone interval from key root to major scale roman numeral
 */
const MAJOR_ROMAN_NUMERALS: Record<number, string> = {
  0: "I",
  2: "II",
  4: "III",
  5: "IV",
  7: "V",
  9: "VI",
  11: "VII",
};

/**
 * Maps semitone interval from key root to minor scale roman numeral
 */
const MINOR_ROMAN_NUMERALS: Record<number, string> = {
  0: "I",
  2: "II",
  3: "III",
  5: "IV",
  7: "V",
  8: "VI",
  10: "VII",
};

/**
 * Gets the chroma (0-11) for a note name, handling enharmonics
 */
function getChroma(note: string): number {
  return Note.chroma(note) ?? 0;
}

/**
 * Gets the scale notes as chroma values for fast lookup
 */
function getScaleChromaSet(root: NoteName, scaleName: string): Set<number> {
  const scale = Scale.get(`${root} ${scaleName}`);
  return new Set(scale.notes.map((n) => getChroma(n)));
}

/**
 * Analyzes a chord's fit within a given key
 * Returns the fraction of chord tones that belong to the key's scale
 */
function chordFitScore(chord: Chord, keyChromaSet: Set<number>): number {
  if (chord.notes.length === 0) return 0;
  const matched = chord.notes.filter((n) => keyChromaSet.has(getChroma(n)));
  return matched.length / chord.notes.length;
}

/**
 * Gets the roman numeral for a chord in a given key
 */
function getRomanNumeral(
  chord: Chord,
  keyRoot: NoteName,
  mode: "major" | "minor",
): string {
  const interval = (getChroma(chord.root) - getChroma(keyRoot) + 12) % 12;
  const numeralMap =
    mode === "major" ? MAJOR_ROMAN_NUMERALS : MINOR_ROMAN_NUMERALS;
  const baseNumeral = numeralMap[interval];

  if (!baseNumeral) {
    // Non-diatonic chord root - use flat/sharp prefix
    const closestBelow = Object.keys(numeralMap)
      .map(Number)
      .filter((k) => k < interval)
      .sort((a, b) => b - a)[0];
    const closestAbove = Object.keys(numeralMap)
      .map(Number)
      .filter((k) => k > interval)
      .sort((a, b) => a - b)[0];

    if (
      closestAbove !== undefined &&
      (closestBelow === undefined ||
        interval - closestBelow > closestAbove - interval)
    ) {
      const numeral = numeralMap[closestAbove];
      return formatRomanNumeral(`b${numeral}`, chord.quality);
    }
    if (closestBelow !== undefined) {
      const numeral = numeralMap[closestBelow];
      return formatRomanNumeral(`#${numeral}`, chord.quality);
    }
    return chord.symbol;
  }

  return formatRomanNumeral(baseNumeral, chord.quality);
}

/**
 * Formats a roman numeral based on chord quality (lowercase for minor, etc.)
 */
function formatRomanNumeral(numeral: string, quality: string): string {
  const isMinor =
    quality === "min" ||
    quality === "min7" ||
    quality === "min7b5" ||
    quality === "dim" ||
    quality === "dim7" ||
    quality === "min6" ||
    quality === "min9";

  const base = isMinor ? numeral.toLowerCase() : numeral;

  // Add quality suffix
  switch (quality) {
    case "maj7":
      return `${base}maj7`;
    case "min7":
      return `${base}7`;
    case "7":
      return `${base}7`;
    case "min7b5":
      return `${base}ø7`;
    case "dim":
      return `${base}°`;
    case "dim7":
      return `${base}°7`;
    case "aug":
      return `${base}+`;
    case "sus2":
      return `${base}sus2`;
    case "sus4":
      return `${base}sus4`;
    case "6":
      return `${base}6`;
    case "min6":
      return `${base}6`;
    case "9":
      return `${base}9`;
    case "maj9":
      return `${base}maj9`;
    case "min9":
      return `${base}9`;
    case "add9":
      return `${base}add9`;
    default:
      return base;
  }
}

/**
 * Detects the most likely key(s) for a progression.
 *
 * Algorithm:
 * 1. Parse all chords from the progression
 * 2. For each possible key (12 major + 12 minor), score how well
 *    all chord tones fit the scale
 * 3. Weight first and last chords more heavily (common tonal anchors)
 * 4. Bonus for dominant V chord presence (strong key indicator)
 * 5. Return top candidates sorted by confidence
 */
export function detectKey(
  progression: Progression,
  maxResults = 3,
): DetectedKey[] {
  const chordSymbols = getAllChordsFromProgression(progression);
  const chords = chordSymbols
    .map((s) => parseChordSymbol(s))
    .filter((c): c is Chord => c !== null);

  if (chords.length === 0) return [];

  // Deduplicate chords for scoring (but keep order for roman numerals)
  const uniqueChords = Array.from(
    new Map(chords.map((c) => [c.symbol, c])).values(),
  );

  const candidates: DetectedKey[] = [];

  for (const root of ALL_ROOTS) {
    for (const mode of ["major", "minor"] as const) {
      const scaleName = mode === "major" ? "major" : "minor";
      const chromaSet = getScaleChromaSet(root, scaleName);

      // Base score: average fit of all unique chords
      let totalFit = 0;
      for (const chord of uniqueChords) {
        totalFit += chordFitScore(chord, chromaSet);
      }
      let score = totalFit / uniqueChords.length;

      // Weight first chord more heavily (tonic tendency)
      const firstChord = chords[0] as Chord;
      if (getChroma(firstChord.root) === getChroma(root)) {
        // First chord is tonic
        if (
          (mode === "major" &&
            (firstChord.quality === "maj" ||
              firstChord.quality === "maj7" ||
              firstChord.quality === "maj9" ||
              firstChord.quality === "6")) ||
          (mode === "minor" &&
            (firstChord.quality === "min" ||
              firstChord.quality === "min7" ||
              firstChord.quality === "min9" ||
              firstChord.quality === "min6"))
        ) {
          score += 0.2;
        }
      }

      // Weight last chord (resolution tendency)
      const lastChord = chords[chords.length - 1] as Chord;
      if (getChroma(lastChord.root) === getChroma(root)) {
        if (
          (mode === "major" &&
            (lastChord.quality === "maj" ||
              lastChord.quality === "maj7" ||
              lastChord.quality === "maj9")) ||
          (mode === "minor" &&
            (lastChord.quality === "min" ||
              lastChord.quality === "min7" ||
              lastChord.quality === "min9"))
        ) {
          score += 0.05;
        }
      }

      // Bonus for V chord presence (strong key indicator)
      const dominantChroma = (getChroma(root) + 7) % 12;
      const hasDominantSeventh = chords.some(
        (c) =>
          getChroma(c.root) === dominantChroma &&
          (c.quality === "7" || c.quality === "9"),
      );
      const hasDominant = chords.some(
        (c) => getChroma(c.root) === dominantChroma,
      );
      if (hasDominantSeventh) {
        score += 0.1;
      } else if (hasDominant) {
        score += 0.05;
      }

      // For major keys, bonus for IV chord (subdominant strengthens key feel)
      if (mode === "major") {
        const subdominantChroma = (getChroma(root) + 5) % 12;
        const hasSubdominant = chords.some(
          (c) => getChroma(c.root) === subdominantChroma,
        );
        if (hasSubdominant) score += 0.05;
      }

      // For minor keys, bonus if there's a bVII or bIII chord
      if (mode === "minor") {
        const bVII = (getChroma(root) + 10) % 12;
        const bIII = (getChroma(root) + 3) % 12;
        const hasBVII = chords.some(
          (c) =>
            getChroma(c.root) === bVII &&
            (c.quality === "maj" || c.quality === "maj7" || c.quality === "7"),
        );
        const hasBIII = chords.some(
          (c) =>
            getChroma(c.root) === bIII &&
            (c.quality === "maj" || c.quality === "maj7"),
        );
        if (hasBVII) score += 0.05;
        if (hasBIII) score += 0.05;
      }

      // Roman numeral analysis for all chords in the progression
      const romanNumerals = chords.map((c) => getRomanNumeral(c, root, mode));

      const modeLabel = mode === "major" ? "Major" : "Minor";
      candidates.push({
        root,
        mode,
        label: `${root} ${modeLabel}`,
        confidence: score,
        romanNumerals,
      });
    }
  }

  // Sort by confidence descending
  candidates.sort((a, b) => b.confidence - a.confidence);

  return candidates.slice(0, maxResults);
}

/**
 * Gets the parent scale name for a detected key
 */
export function getParentScale(key: DetectedKey): string {
  return `${key.root} ${key.mode === "major" ? "Major" : "Minor"}`;
}
