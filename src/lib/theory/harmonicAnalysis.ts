import type { Progression } from "@/lib/types";
import { type DetectedKey, detectKey } from "./keyDetection";
import {
  type BorrowedChord,
  type DetectedPattern,
  detectBorrowedChords,
  detectPatterns,
  detectSecondaryDominants,
  type SecondaryDominant,
} from "./progressionPatterns";
import { type BarTension, calculateBarTensions } from "./tensionAnalysis";

// ============================================
// Types
// ============================================

export interface ProgressionAnalysis {
  /** Detected key (primary) */
  key: DetectedKey;
  /** Detected progression patterns */
  patterns: DetectedPattern[];
  /** Borrowed/modal interchange chords */
  borrowedChords: BorrowedChord[];
  /** Secondary dominant relationships */
  secondaryDominants: SecondaryDominant[];
  /** Per-bar tension scores */
  tensionScores: BarTension[];
}

// ============================================
// Main Analysis Function
// ============================================

/**
 * Perform comprehensive harmonic analysis on a progression.
 *
 * Combines:
 * - Key detection with roman numeral analysis
 * - Common progression pattern detection (ii-V-I, turnarounds, etc.)
 * - Modal interchange / borrowed chord detection
 * - Secondary dominant chain detection
 * - Tension scoring per bar
 *
 * @param progression The chord progression to analyze
 * @returns Full analysis or null if progression is empty/invalid
 */
export function analyzeProgression(
  progression: Progression,
): ProgressionAnalysis | null {
  // Detect key first - this provides the foundation for all other analysis
  const keys = detectKey(progression, 1);
  const key = keys[0];

  if (!key) {
    return null;
  }

  // Run all analysis in parallel (conceptually)
  const patterns = detectPatterns(progression, key);
  const borrowedChords = detectBorrowedChords(progression, key);
  const secondaryDominants = detectSecondaryDominants(progression, key);
  const tensionScores = calculateBarTensions(progression, key);

  return {
    key,
    patterns,
    borrowedChords,
    secondaryDominants,
    tensionScores,
  };
}

/**
 * Get a summary description of the harmonic analysis
 */
export function getAnalysisSummary(analysis: ProgressionAnalysis): string {
  const parts: string[] = [];

  // Key
  parts.push(`Key: ${analysis.key.label}`);

  // Patterns
  if (analysis.patterns.length > 0) {
    const patternNames = analysis.patterns.map((p) => p.label).join(", ");
    parts.push(`Patterns: ${patternNames}`);
  }

  // Borrowed chords
  if (analysis.borrowedChords.length > 0) {
    const borrowed = analysis.borrowedChords
      .map((b) => b.borrowedNumeral)
      .join(", ");
    parts.push(`Borrowed: ${borrowed}`);
  }

  // Secondary dominants
  if (analysis.secondaryDominants.length > 0) {
    const secondaries = analysis.secondaryDominants
      .map((s) => s.notation)
      .join(", ");
    parts.push(`Secondary dominants: ${secondaries}`);
  }

  return parts.join(" | ");
}

// Re-export types for convenience
export type {
  BorrowedChord,
  DetectedPattern,
  SecondaryDominant,
} from "./progressionPatterns";
export type { BarTension, TensionFactors } from "./tensionAnalysis";
