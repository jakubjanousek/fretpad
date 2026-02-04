import { Note, Scale } from "tonal";
import type { Chord, Progression } from "@/lib/types";
import { parseChordSymbol } from "./chords";
import type { DetectedKey } from "./keyDetection";
import { getAllChordsFromProgression } from "./progression";

// ============================================
// Types
// ============================================

export interface TensionFactors {
  /** Dominant 7th chord presence (0-3) */
  dominantFunction: number;
  /** Tritone intervals in chord (0-2) */
  tritonePresence: number;
  /** Non-diatonic notes relative to key (0-3) */
  chromaticism: number;
  /** Dissonant extensions (0-2) */
  dissonance: number;
}

export interface BarTension {
  barIndex: number;
  /** Overall tension score 0-10 */
  score: number;
  /** Breakdown of factors */
  factors: TensionFactors;
  /** Brief explanation */
  explanation: string;
}

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
 * Check if a chord contains a tritone interval (augmented 4th / diminished 5th)
 */
export function chordContainsTritone(chord: Chord): boolean {
  const chromas = chord.notes.map((n) => getChroma(n));

  for (let i = 0; i < chromas.length; i++) {
    for (let j = i + 1; j < chromas.length; j++) {
      const interval = Math.abs((chromas[j] ?? 0) - (chromas[i] ?? 0));
      // Tritone is 6 semitones
      if (interval === 6 || interval === 12 - 6) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Count non-diatonic notes in a chord relative to the key
 */
export function countNonDiatonicNotes(chord: Chord, key: DetectedKey): number {
  const scaleName = key.mode === "major" ? "major" : "minor";
  const scale = Scale.get(`${key.root} ${scaleName}`);
  const scaleChromaSet = new Set(scale.notes.map((n) => getChroma(n)));

  let count = 0;
  for (const note of chord.notes) {
    if (!scaleChromaSet.has(getChroma(note))) {
      count++;
    }
  }

  return count;
}

/**
 * Check if chord has dissonant extensions (b9, #9, b5, #11, b13)
 */
function hasDissonantExtensions(chord: Chord): boolean {
  // Check chord symbol for altered extensions
  const symbol = chord.symbol.toLowerCase();
  return (
    symbol.includes("b9") ||
    symbol.includes("#9") ||
    symbol.includes("b5") ||
    symbol.includes("#5") ||
    symbol.includes("#11") ||
    symbol.includes("b13") ||
    symbol.includes("alt")
  );
}

/**
 * Check if chord is a dominant chord (dominant function)
 */
function isDominantChord(chord: Chord): boolean {
  return (
    chord.quality === "7" ||
    chord.quality === "9" ||
    chord.quality === "dim7" ||
    chord.quality === "min7b5"
  );
}

/**
 * Check if this chord is the diatonic V or V7 of the key
 */
function isDiatonicDominant(chord: Chord, key: DetectedKey): boolean {
  const keyChroma = getChroma(key.root);
  const chordChroma = getChroma(chord.root);
  const interval = (chordChroma - keyChroma + 12) % 12;
  return interval === 7;
}

/**
 * Generate a human-readable tension explanation
 */
function generateTensionExplanation(
  factors: TensionFactors,
  score: number,
): string {
  const parts: string[] = [];

  if (score < 3) {
    parts.push("Low tension");
  } else if (score < 6) {
    parts.push("Moderate tension");
  } else {
    parts.push("High tension");
  }

  if (factors.dominantFunction >= 2) {
    parts.push("dominant function");
  }

  if (factors.tritonePresence > 0) {
    parts.push("tritone present");
  }

  if (factors.chromaticism >= 2) {
    parts.push("chromatic alterations");
  }

  if (factors.dissonance > 0) {
    parts.push("altered extensions");
  }

  return parts.length > 1
    ? `${parts[0]} — ${parts.slice(1).join(", ")}`
    : (parts[0] ?? "");
}

// ============================================
// Main Tension Calculation
// ============================================

/**
 * Calculate tension for a single chord in context
 */
function calculateChordTension(chord: Chord, key: DetectedKey): TensionFactors {
  const factors: TensionFactors = {
    dominantFunction: 0,
    tritonePresence: 0,
    chromaticism: 0,
    dissonance: 0,
  };

  // 1. Dominant function (0-3)
  if (isDominantChord(chord)) {
    if (isDiatonicDominant(chord, key)) {
      factors.dominantFunction = 2; // Diatonic V7
    } else {
      factors.dominantFunction = 3; // Secondary dominant or altered
    }
  } else if (chord.quality === "dim" || chord.quality === "aug") {
    factors.dominantFunction = 1.5;
  }

  // 2. Tritone presence (0-2)
  if (chordContainsTritone(chord)) {
    factors.tritonePresence = 2;
  }

  // 3. Chromaticism (0-3)
  const nonDiatonic = countNonDiatonicNotes(chord, key);
  factors.chromaticism = Math.min(3, nonDiatonic);

  // 4. Dissonant extensions (0-2)
  if (hasDissonantExtensions(chord)) {
    factors.dissonance = 2;
  }

  return factors;
}

/**
 * Calculate the overall tension score from factors
 */
function calculateScore(factors: TensionFactors): number {
  const score =
    factors.dominantFunction * 2 +
    factors.tritonePresence * 1.5 +
    factors.chromaticism * 1 +
    factors.dissonance * 0.5;

  return Math.min(10, Math.round(score * 10) / 10);
}

/**
 * Calculate tension scores for all bars in a progression
 */
export function calculateBarTensions(
  progression: Progression,
  key: DetectedKey,
): BarTension[] {
  const tensions: BarTension[] = [];
  const chordSymbols = getAllChordsFromProgression(progression);
  const chords = chordSymbols
    .map((s) => parseChordSymbol(s))
    .filter((c): c is Chord => c !== null);

  // Map chords to bars (handle multiple chords per bar by averaging)
  let chordIndex = 0;

  for (let barIndex = 0; barIndex < progression.bars.length; barIndex++) {
    const bar = progression.bars[barIndex];
    if (!bar) continue;

    const barChordCount = bar.chords.length;

    if (barChordCount === 0) {
      tensions.push({
        barIndex,
        score: 0,
        factors: {
          dominantFunction: 0,
          tritonePresence: 0,
          chromaticism: 0,
          dissonance: 0,
        },
        explanation: "No chord",
      });
      continue;
    }

    // Calculate tension for each chord in the bar and average
    let totalScore = 0;
    const combinedFactors: TensionFactors = {
      dominantFunction: 0,
      tritonePresence: 0,
      chromaticism: 0,
      dissonance: 0,
    };

    for (let i = 0; i < barChordCount; i++) {
      const chord = chords[chordIndex];
      if (chord) {
        const factors = calculateChordTension(chord, key);
        const score = calculateScore(factors);
        totalScore += score;

        combinedFactors.dominantFunction += factors.dominantFunction;
        combinedFactors.tritonePresence += factors.tritonePresence;
        combinedFactors.chromaticism += factors.chromaticism;
        combinedFactors.dissonance += factors.dissonance;
      }
      chordIndex++;
    }

    // Average the factors
    const avgFactors: TensionFactors = {
      dominantFunction: combinedFactors.dominantFunction / barChordCount,
      tritonePresence: combinedFactors.tritonePresence / barChordCount,
      chromaticism: combinedFactors.chromaticism / barChordCount,
      dissonance: combinedFactors.dissonance / barChordCount,
    };

    const avgScore = Math.round((totalScore / barChordCount) * 10) / 10;

    tensions.push({
      barIndex,
      score: avgScore,
      factors: avgFactors,
      explanation: generateTensionExplanation(avgFactors, avgScore),
    });
  }

  return tensions;
}
