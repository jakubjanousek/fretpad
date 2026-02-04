/**
 * Voice Leading Engine for Guitar Voicings
 *
 * This module implements voice leading algorithms for smooth chord transitions
 * based on Ted Greene's principles:
 * 1. Common tones: Keep notes that appear in both chords on the same string
 * 2. Minimal movement: Prefer half-step and whole-step movements
 * 3. Contrary motion: Move voices in opposite directions when possible
 * 4. Avoid jumps: Large interval jumps in any voice are penalized
 */

import { Note } from "tonal";
import { parseChordSymbol } from "@/lib/theory/chords";
import type { Chord, GuitarVoicing, NoteName, Progression } from "@/lib/types";
import { generateVoicingsForChord } from "./voicings";

// ============================================
// Types
// ============================================

export interface VoiceLeadingOptions {
  /** Maximum frets any single voice should move (default: 3) */
  maxMovement: number;
  /** Prioritize voicings sharing notes (default: true) */
  preferCommonTones: boolean;
  /** Allow large position shifts if overall smoother (default: true) */
  allowPositionJump: boolean;
  /** Maximum number of suggestions to return (default: 5) */
  maxSuggestions: number;
}

export interface VoiceMovement {
  /** String number (1-6) */
  string: number;
  /** Starting fret position */
  fromFret: number;
  /** Ending fret position */
  toFret: number;
  /** Note at starting position */
  fromNote: NoteName | undefined;
  /** Note at ending position */
  toNote: NoteName | undefined;
  /** Fret distance moved (negative = down the neck) */
  fretDistance: number;
  /** Semitone distance moved */
  semitoneDistance: number;
  /** Whether this is a common tone (same note, ideally same position) */
  isCommonTone: boolean;
  /** Type of movement */
  type: "common-tone" | "step" | "leap" | "new-voice" | "voice-exit";
}

export interface VoiceLeadingResult {
  /** The target voicing */
  voicing: GuitarVoicing;
  /** Total voice leading "cost" - lower is better */
  score: number;
  /** Individual voice movements */
  movements: VoiceMovement[];
  /** Number of common tones */
  commonToneCount: number;
  /** Average fret movement across all voices */
  averageMovement: number;
  /** Whether any voice moves more than the max allowed */
  hasExcessiveMovement: boolean;
}

export interface VoicingPath {
  /** The sequence of voicings for the progression */
  voicings: GuitarVoicing[];
  /** Total voice leading score for the path */
  totalScore: number;
  /** Individual transition scores */
  transitionScores: number[];
}

// ============================================
// Constants
// ============================================

const DEFAULT_OPTIONS: VoiceLeadingOptions = {
  maxMovement: 3,
  preferCommonTones: true,
  allowPositionJump: true,
  maxSuggestions: 5,
};

// Scoring weights for voice leading quality
const SCORING_WEIGHTS = {
  /** Penalty per fret of movement */
  fretMovement: 1,
  /** Penalty per semitone of movement */
  semitoneMovement: 0.5,
  /** Bonus for common tones */
  commonToneBonus: -3,
  /** Bonus for common tone staying on same fret */
  samePositionBonus: -2,
  /** Penalty for voice leaps (> 2 frets) */
  leapPenalty: 3,
  /** Penalty for large position shifts */
  positionShiftPenalty: 2,
  /** Penalty when a voice enters (was muted, now played) */
  voiceEntryPenalty: 1,
  /** Penalty when a voice exits (was played, now muted) */
  voiceExitPenalty: 1,
  /** Bonus for contrary motion between outer voices */
  contraryMotionBonus: -1,
};

// ============================================
// Core Algorithms
// ============================================

/**
 * Get the semitone distance between two notes (0-6, wrapping at octave)
 */
function getSemitoneDistance(from: NoteName, to: NoteName): number {
  const fromMidi = Note.midi(`${from}4`) ?? 0;
  const toMidi = Note.midi(`${to}4`) ?? 0;
  const diff = Math.abs(toMidi - fromMidi);
  return Math.min(diff, 12 - diff);
}

/**
 * Check if two notes are enharmonically equivalent
 */
function enharmonicEqual(note1: NoteName, note2: NoteName): boolean {
  return Note.pitchClass(note1) === Note.pitchClass(note2);
}

/**
 * Calculate the voice movements between two voicings
 */
export function calculateVoiceMovements(
  from: GuitarVoicing,
  to: GuitarVoicing,
): VoiceMovement[] {
  const movements: VoiceMovement[] = [];

  for (let string = 1; string <= 6; string++) {
    const fromPos = from.positions.find((p) => p.string === string);
    const toPos = to.positions.find((p) => p.string === string);

    const fromFret = fromPos?.fret ?? -1;
    const toFret = toPos?.fret ?? -1;
    const fromNote = fromPos?.note;
    const toNote = toPos?.note;

    // Skip if both are muted
    if (fromFret < 0 && toFret < 0) continue;

    // Voice entry (was muted, now played)
    if (fromFret < 0 && toFret >= 0) {
      movements.push({
        string,
        fromFret,
        toFret,
        fromNote: undefined,
        toNote,
        fretDistance: 0,
        semitoneDistance: 0,
        isCommonTone: false,
        type: "new-voice",
      });
      continue;
    }

    // Voice exit (was played, now muted)
    if (fromFret >= 0 && toFret < 0) {
      movements.push({
        string,
        fromFret,
        toFret,
        fromNote,
        toNote: undefined,
        fretDistance: 0,
        semitoneDistance: 0,
        isCommonTone: false,
        type: "voice-exit",
      });
      continue;
    }

    // Both are played - calculate movement
    const fretDistance = toFret - fromFret;
    const semitoneDistance =
      fromNote && toNote ? getSemitoneDistance(fromNote, toNote) : 0;
    const isCommonTone =
      fromNote !== undefined &&
      toNote !== undefined &&
      enharmonicEqual(fromNote, toNote);

    let type: VoiceMovement["type"];
    if (isCommonTone) {
      type = "common-tone";
    } else if (Math.abs(fretDistance) <= 2) {
      type = "step";
    } else {
      type = "leap";
    }

    movements.push({
      string,
      fromFret,
      toFret,
      fromNote,
      toNote,
      fretDistance,
      semitoneDistance,
      isCommonTone,
      type,
    });
  }

  return movements;
}

/**
 * Calculate the voice leading distance (score) between two voicings.
 * Lower scores indicate smoother voice leading.
 *
 * @param from - The starting voicing
 * @param to - The target voicing
 * @param options - Voice leading options
 * @returns A numeric score (lower = better voice leading)
 */
export function calculateVoiceLeadingDistance(
  from: GuitarVoicing,
  to: GuitarVoicing,
  options: Partial<VoiceLeadingOptions> = {},
): number {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const movements = calculateVoiceMovements(from, to);

  let score = 0;
  let commonToneCount = 0;

  for (const movement of movements) {
    switch (movement.type) {
      case "common-tone":
        commonToneCount++;
        score += SCORING_WEIGHTS.commonToneBonus;
        // Extra bonus if the common tone stays on the same fret
        if (movement.fretDistance === 0) {
          score += SCORING_WEIGHTS.samePositionBonus;
        }
        break;

      case "step":
        score += Math.abs(movement.fretDistance) * SCORING_WEIGHTS.fretMovement;
        score += movement.semitoneDistance * SCORING_WEIGHTS.semitoneMovement;
        break;

      case "leap":
        score += Math.abs(movement.fretDistance) * SCORING_WEIGHTS.fretMovement;
        score += movement.semitoneDistance * SCORING_WEIGHTS.semitoneMovement;
        score += SCORING_WEIGHTS.leapPenalty;

        // Extra penalty if movement exceeds max
        if (Math.abs(movement.fretDistance) > opts.maxMovement) {
          score += (Math.abs(movement.fretDistance) - opts.maxMovement) * 2;
        }
        break;

      case "new-voice":
        score += SCORING_WEIGHTS.voiceEntryPenalty;
        break;

      case "voice-exit":
        score += SCORING_WEIGHTS.voiceExitPenalty;
        break;
    }
  }

  // Bonus for common tones if preferred
  if (opts.preferCommonTones && commonToneCount > 0) {
    score -= commonToneCount * 0.5;
  }

  // Check for contrary motion between bass and soprano (strings 6 and 1)
  const bassMovement = movements.find((m) => m.string === 6 || m.string === 5);
  const sopranoMovement = movements.find(
    (m) => m.string === 1 || m.string === 2,
  );
  if (
    bassMovement &&
    sopranoMovement &&
    bassMovement.fretDistance !== 0 &&
    sopranoMovement.fretDistance !== 0
  ) {
    const bassDirection = Math.sign(bassMovement.fretDistance);
    const sopranoDirection = Math.sign(sopranoMovement.fretDistance);
    if (bassDirection !== sopranoDirection) {
      score += SCORING_WEIGHTS.contraryMotionBonus;
    }
  }

  // Position shift penalty (large change in base fret)
  const positionShift = Math.abs(to.baseFret - from.baseFret);
  if (positionShift > 3 && !opts.allowPositionJump) {
    score += positionShift * SCORING_WEIGHTS.positionShiftPenalty;
  }

  return score;
}

/**
 * Get voice leading options for transitioning from current voicing to next chord.
 * Returns voicings sorted by voice leading quality (best first).
 *
 * @param currentVoicing - The current voicing being played
 * @param nextChord - The next chord to transition to
 * @param options - Voice leading options
 * @returns Array of voicing results sorted by voice leading score
 */
export function getVoiceLeadingOptions(
  currentVoicing: GuitarVoicing,
  nextChord: Chord,
  options: Partial<VoiceLeadingOptions> = {},
): VoiceLeadingResult[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Generate all possible voicings for the next chord
  const candidateVoicings = generateVoicingsForChord(nextChord, {
    maxDifficulty: currentVoicing.difficulty,
  });

  if (candidateVoicings.length === 0) {
    return [];
  }

  // Score each candidate voicing
  const results: VoiceLeadingResult[] = candidateVoicings.map((voicing) => {
    const movements = calculateVoiceMovements(currentVoicing, voicing);
    const score = calculateVoiceLeadingDistance(
      currentVoicing,
      voicing,
      options,
    );

    const commonToneCount = movements.filter((m) => m.isCommonTone).length;
    const movingVoices = movements.filter(
      (m) => m.type === "step" || m.type === "leap",
    );
    const averageMovement =
      movingVoices.length > 0
        ? movingVoices.reduce((sum, m) => sum + Math.abs(m.fretDistance), 0) /
          movingVoices.length
        : 0;
    const hasExcessiveMovement = movements.some(
      (m) => Math.abs(m.fretDistance) > opts.maxMovement,
    );

    return {
      voicing,
      score,
      movements,
      commonToneCount,
      averageMovement,
      hasExcessiveMovement,
    };
  });

  // Sort by score (lower is better) and return top suggestions
  return results
    .sort((a, b) => a.score - b.score)
    .slice(0, opts.maxSuggestions);
}

/**
 * Get the best voice-led voicing for transitioning to the next chord.
 * Returns null if no good options are available.
 */
export function getBestVoiceLeadingOption(
  currentVoicing: GuitarVoicing,
  nextChord: Chord,
  options: Partial<VoiceLeadingOptions> = {},
): VoiceLeadingResult | null {
  const results = getVoiceLeadingOptions(currentVoicing, nextChord, options);
  return results[0] ?? null;
}

/**
 * Find the optimal voicing path through a chord progression.
 * Uses dynamic programming to find the path with minimum total voice leading cost.
 *
 * @param progression - The chord progression
 * @param startingVoicing - Optional starting voicing (if not provided, picks best for first chord)
 * @param options - Voice leading options
 * @returns The optimal voicing path through the progression
 */
export function getOptimalVoicingPath(
  progression: Progression,
  startingVoicing?: GuitarVoicing,
  options: Partial<VoiceLeadingOptions> = {},
): VoicingPath | null {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Extract chords from progression
  const chords: Chord[] = [];
  for (const bar of progression.bars) {
    for (const barChord of bar.chords) {
      const parsed = parseChordSymbol(barChord.chord);
      if (parsed) {
        chords.push(parsed);
      }
    }
  }

  if (chords.length === 0) {
    return null;
  }

  // Generate voicings for each chord position
  const voicingsPerChord: GuitarVoicing[][] = chords.map((chord) =>
    generateVoicingsForChord(chord, { maxDifficulty: "advanced" }),
  );

  // If any chord has no voicings, we can't create a path
  if (voicingsPerChord.some((v) => v.length === 0)) {
    return null;
  }

  // Dynamic programming: dp[i][j] = min cost to reach voicing j at chord i
  const dp: number[][] = [];
  const parent: number[][] = []; // To reconstruct the path

  // Initialize first chord
  const firstChordVoicings = voicingsPerChord[0];
  if (!firstChordVoicings || firstChordVoicings.length === 0) {
    return null;
  }

  dp[0] = firstChordVoicings.map((v) => {
    if (startingVoicing) {
      return calculateVoiceLeadingDistance(startingVoicing, v, opts);
    }
    // Prefer simpler voicings at the start (lower base fret)
    return v.baseFret * 0.5 + (v.difficulty === "beginner" ? 0 : 1);
  });
  parent[0] = firstChordVoicings.map(() => -1);

  // Fill DP table
  for (let i = 1; i < chords.length; i++) {
    const currentVoicings = voicingsPerChord[i];
    const prevVoicings = voicingsPerChord[i - 1];

    if (!currentVoicings || !prevVoicings) continue;

    const dpRow: number[] = [];
    const parentRow: number[] = [];
    dp[i] = dpRow;
    parent[i] = parentRow;

    for (let j = 0; j < currentVoicings.length; j++) {
      let minCost = Infinity;
      let bestParent = 0;

      for (let k = 0; k < prevVoicings.length; k++) {
        const prevVoicing = prevVoicings[k];
        const currentVoicing = currentVoicings[j];
        const prevDpValue = dp[i - 1]?.[k];

        if (!prevVoicing || !currentVoicing || prevDpValue === undefined)
          continue;

        const transitionCost = calculateVoiceLeadingDistance(
          prevVoicing,
          currentVoicing,
          opts,
        );

        const totalCost = prevDpValue + transitionCost;

        if (totalCost < minCost) {
          minCost = totalCost;
          bestParent = k;
        }
      }

      dpRow[j] = minCost;
      parentRow[j] = bestParent;
    }
  }

  // Find the best ending voicing
  const lastDp = dp[chords.length - 1];
  if (!lastDp || lastDp.length === 0) {
    return null;
  }

  let minEndCost = Infinity;
  let bestEndIndex = 0;
  for (let j = 0; j < lastDp.length; j++) {
    const cost = lastDp[j];
    if (cost !== undefined && cost < minEndCost) {
      minEndCost = cost;
      bestEndIndex = j;
    }
  }

  // Reconstruct the path
  const voicingIndices: number[] = [];
  let currentIndex = bestEndIndex;
  for (let i = chords.length - 1; i >= 0; i--) {
    voicingIndices.unshift(currentIndex);
    const parentIndex = parent[i]?.[currentIndex];
    currentIndex = parentIndex ?? 0;
  }

  // Build the result
  const voicings: GuitarVoicing[] = [];
  const transitionScores: number[] = [];

  for (let i = 0; i < voicingIndices.length; i++) {
    const voicingIndex = voicingIndices[i];
    const voicing = voicingsPerChord[i]?.[voicingIndex ?? 0];
    if (voicing) {
      voicings.push(voicing);
    }

    if (i > 0) {
      const prevVoicing = voicings[i - 1];
      const currentVoicing = voicings[i];
      if (prevVoicing && currentVoicing) {
        transitionScores.push(
          calculateVoiceLeadingDistance(prevVoicing, currentVoicing, opts),
        );
      }
    }
  }

  return {
    voicings,
    totalScore: minEndCost,
    transitionScores,
  };
}

/**
 * Get suggested voicings for the next chord during playback.
 * Returns the top N voicings that voice-lead well from the current voicing.
 */
export function getSuggestedVoicingsForNextChord(
  currentVoicing: GuitarVoicing | null,
  nextChord: Chord,
  count = 3,
): GuitarVoicing[] {
  if (!currentVoicing) {
    // No current voicing - return default voicings sorted by priority
    const voicings = generateVoicingsForChord(nextChord);
    return voicings.slice(0, count);
  }

  const options = getVoiceLeadingOptions(currentVoicing, nextChord, {
    maxSuggestions: count,
  });

  return options.map((o) => o.voicing);
}

/**
 * Analyze the voice leading quality between two voicings.
 * Returns a human-readable description of the voice leading.
 */
export function describeVoiceLeading(
  from: GuitarVoicing,
  to: GuitarVoicing,
): string {
  const movements = calculateVoiceMovements(from, to);
  const score = calculateVoiceLeadingDistance(from, to);

  const commonTones = movements.filter((m) => m.isCommonTone);
  const steps = movements.filter((m) => m.type === "step");
  const leaps = movements.filter((m) => m.type === "leap");

  const parts: string[] = [];

  if (commonTones.length > 0) {
    parts.push(
      `${commonTones.length} common tone${commonTones.length > 1 ? "s" : ""}`,
    );
  }

  if (steps.length > 0) {
    parts.push(`${steps.length} step${steps.length > 1 ? "s" : ""}`);
  }

  if (leaps.length > 0) {
    parts.push(`${leaps.length} leap${leaps.length > 1 ? "s" : ""}`);
  }

  const quality =
    score < -2
      ? "Excellent"
      : score < 2
        ? "Good"
        : score < 5
          ? "Fair"
          : "Challenging";

  return `${quality} voice leading: ${parts.join(", ")}`;
}
