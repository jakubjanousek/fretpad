/**
 * Ted Greene V-System Framework
 *
 * The V-System provides a systematic way to organize and navigate guitar voicings
 * based on which string carries the root note and which strings are used.
 *
 * V-System Positions:
 * - V-1: Root on string 1 (high E)
 * - V-2: Root on string 2 (B)
 * - V-3: Root on string 3 (G)
 * - V-4: Root on string 4 (D)
 * - V-5: Root on string 5 (A)
 * - V-6: Root on string 6 (low E)
 *
 * String Groups:
 * - top4: Strings 1-2-3-4 (bright, clear voicings)
 * - inner4: Strings 2-3-4-5 (balanced, warm voicings)
 * - bottom4: Strings 3-4-5-6 (full, bass-heavy voicings)
 * - spread: Non-adjacent strings
 */

import type {
  Chord,
  GuitarVoicing,
  StringGroup,
  VoicingStructure,
  VSystemPosition,
} from "@/lib/types";
import { generateVoicingsForChord } from "./voicings";

// ============================================
// V-System Position Queries
// ============================================

/**
 * Get all voicings for a chord filtered by V-System position
 */
export function getVoicingsByVSystem(
  chord: Chord,
  vPosition: VSystemPosition,
): GuitarVoicing[] {
  const allVoicings = generateVoicingsForChord(chord);
  return allVoicings.filter((v) => v.vSystem === vPosition);
}

/**
 * Get all voicings for a chord filtered by multiple V-System positions
 */
export function getVoicingsByVSystemPositions(
  chord: Chord,
  vPositions: VSystemPosition[],
): GuitarVoicing[] {
  const allVoicings = generateVoicingsForChord(chord);
  return allVoicings.filter((v) => v.vSystem && vPositions.includes(v.vSystem));
}

/**
 * Get voicings grouped by V-System position
 */
export function groupVoicingsByVSystem(
  chord: Chord,
): Record<VSystemPosition, GuitarVoicing[]> {
  const allVoicings = generateVoicingsForChord(chord);
  const grouped: Record<VSystemPosition, GuitarVoicing[]> = {
    "V-1": [],
    "V-2": [],
    "V-3": [],
    "V-4": [],
    "V-5": [],
    "V-6": [],
  };

  for (const voicing of allVoicings) {
    if (voicing.vSystem) {
      grouped[voicing.vSystem].push(voicing);
    }
  }

  return grouped;
}

// ============================================
// String Group Queries
// ============================================

/**
 * Get all voicings for a chord filtered by string group
 */
export function getVoicingsByStringGroup(
  chord: Chord,
  stringGroup: StringGroup,
): GuitarVoicing[] {
  const allVoicings = generateVoicingsForChord(chord);
  return allVoicings.filter((v) => v.stringGroup === stringGroup);
}

/**
 * Get all voicings for a chord filtered by multiple string groups
 */
export function getVoicingsByStringGroups(
  chord: Chord,
  stringGroups: StringGroup[],
): GuitarVoicing[] {
  const allVoicings = generateVoicingsForChord(chord);
  return allVoicings.filter(
    (v) => v.stringGroup && stringGroups.includes(v.stringGroup),
  );
}

/**
 * Get voicings grouped by string group
 */
export function groupVoicingsByStringGroup(
  chord: Chord,
): Record<StringGroup, GuitarVoicing[]> {
  const allVoicings = generateVoicingsForChord(chord);
  const grouped: Record<StringGroup, GuitarVoicing[]> = {
    top4: [],
    inner4: [],
    bottom4: [],
    spread: [],
  };

  for (const voicing of allVoicings) {
    if (voicing.stringGroup) {
      grouped[voicing.stringGroup].push(voicing);
    }
  }

  return grouped;
}

// ============================================
// Inversion Queries
// ============================================

/**
 * Get all inversions of a voicing structure for a chord
 */
export function getAllInversions(
  chord: Chord,
  voicingStructure: VoicingStructure,
  stringGroup?: StringGroup,
): GuitarVoicing[] {
  const allVoicings = generateVoicingsForChord(chord);

  return allVoicings.filter((v) => {
    if (v.voicingStructure !== voicingStructure) return false;
    if (stringGroup && v.stringGroup !== stringGroup) return false;
    return true;
  });
}

/**
 * Get voicings filtered by specific inversion number
 */
export function getVoicingsByInversion(
  chord: Chord,
  inversion: 0 | 1 | 2 | 3,
): GuitarVoicing[] {
  const allVoicings = generateVoicingsForChord(chord);
  return allVoicings.filter((v) => v.inversion === inversion);
}

/**
 * Get voicings grouped by inversion
 */
export function groupVoicingsByInversion(
  chord: Chord,
): Record<0 | 1 | 2 | 3, GuitarVoicing[]> {
  const allVoicings = generateVoicingsForChord(chord);
  const grouped: Record<0 | 1 | 2 | 3, GuitarVoicing[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
  };

  for (const voicing of allVoicings) {
    grouped[voicing.inversion].push(voicing);
  }

  return grouped;
}

// ============================================
// Voicing Structure Queries
// ============================================

/**
 * Get all voicings for a chord filtered by voicing structure
 */
export function getVoicingsByStructure(
  chord: Chord,
  structure: VoicingStructure,
): GuitarVoicing[] {
  const allVoicings = generateVoicingsForChord(chord);
  return allVoicings.filter((v) => v.voicingStructure === structure);
}

/**
 * Get voicings grouped by voicing structure
 */
export function groupVoicingsByStructure(
  chord: Chord,
): Record<VoicingStructure, GuitarVoicing[]> {
  const allVoicings = generateVoicingsForChord(chord);
  const grouped: Record<VoicingStructure, GuitarVoicing[]> = {
    close: [],
    drop2: [],
    drop3: [],
    drop24: [],
    spread: [],
  };

  for (const voicing of allVoicings) {
    if (voicing.voicingStructure) {
      grouped[voicing.voicingStructure].push(voicing);
    }
  }

  return grouped;
}

// ============================================
// Combined Filtering
// ============================================

/**
 * Filter options for V-System queries
 */
export interface VSystemFilterOptions {
  vPositions?: VSystemPosition[];
  stringGroups?: StringGroup[];
  structures?: VoicingStructure[];
  inversions?: (0 | 1 | 2 | 3)[];
  maxDifficulty?: "beginner" | "intermediate" | "advanced";
  fretRange?: { min: number; max: number };
}

/**
 * Get voicings with combined V-System filtering
 * This is the main entry point for filtering voicings by V-System criteria
 */
export function filterVoicings(
  chord: Chord,
  options: VSystemFilterOptions = {},
): GuitarVoicing[] {
  const {
    vPositions,
    stringGroups,
    structures,
    inversions,
    maxDifficulty = "advanced",
    fretRange,
  } = options;

  // Generate base voicings with difficulty and fret range
  const allVoicings = generateVoicingsForChord(chord, {
    maxDifficulty,
    fretRange,
  });

  return allVoicings.filter((v) => {
    // Filter by V-System positions
    if (vPositions && vPositions.length > 0) {
      if (!v.vSystem || !vPositions.includes(v.vSystem)) {
        return false;
      }
    }

    // Filter by string groups
    if (stringGroups && stringGroups.length > 0) {
      if (!v.stringGroup || !stringGroups.includes(v.stringGroup)) {
        return false;
      }
    }

    // Filter by voicing structures
    if (structures && structures.length > 0) {
      if (!v.voicingStructure || !structures.includes(v.voicingStructure)) {
        return false;
      }
    }

    // Filter by inversions
    if (inversions && inversions.length > 0) {
      if (!inversions.includes(v.inversion)) {
        return false;
      }
    }

    return true;
  });
}

// ============================================
// V-System Analysis Utilities
// ============================================

/**
 * Get a summary of available voicings by V-System position
 */
export function getVSystemSummary(
  chord: Chord,
): Record<VSystemPosition, number> {
  const grouped = groupVoicingsByVSystem(chord);
  return {
    "V-1": grouped["V-1"].length,
    "V-2": grouped["V-2"].length,
    "V-3": grouped["V-3"].length,
    "V-4": grouped["V-4"].length,
    "V-5": grouped["V-5"].length,
    "V-6": grouped["V-6"].length,
  };
}

/**
 * Get the string number from a V-System position
 */
export function vSystemToString(vPosition: VSystemPosition): number {
  const mapping: Record<VSystemPosition, number> = {
    "V-1": 1,
    "V-2": 2,
    "V-3": 3,
    "V-4": 4,
    "V-5": 5,
    "V-6": 6,
  };
  return mapping[vPosition];
}

/**
 * Get the V-System position from a string number
 */
export function stringToVSystem(stringNumber: number): VSystemPosition | null {
  const mapping: Record<number, VSystemPosition> = {
    1: "V-1",
    2: "V-2",
    3: "V-3",
    4: "V-4",
    5: "V-5",
    6: "V-6",
  };
  return mapping[stringNumber] ?? null;
}

/**
 * Get a human-readable description of a V-System position
 */
export function getVSystemDescription(vPosition: VSystemPosition): string {
  const descriptions: Record<VSystemPosition, string> = {
    "V-1": "Root on high E string - bright, melody-focused voicings",
    "V-2": "Root on B string - upper register voicings",
    "V-3": "Root on G string - middle register voicings",
    "V-4": "Root on D string - balanced voicings",
    "V-5": "Root on A string - common jazz voicings",
    "V-6": "Root on low E string - full, bass-heavy voicings",
  };
  return descriptions[vPosition];
}

/**
 * Get a human-readable description of a string group
 */
export function getStringGroupDescription(stringGroup: StringGroup): string {
  const descriptions: Record<StringGroup, string> = {
    top4: "Strings 1-4: Bright, clear voicings ideal for comping",
    inner4: "Strings 2-5: Balanced, warm voicings",
    bottom4: "Strings 3-6: Full, bass-heavy voicings",
    spread: "Non-adjacent strings: Wide, open voicings",
  };
  return descriptions[stringGroup];
}

/**
 * Find voicings that stay in position (useful for chord melody)
 * Returns voicings within a specified fret range
 */
export function getVoicingsInPosition(
  chord: Chord,
  centerFret: number,
  range = 4,
): GuitarVoicing[] {
  return generateVoicingsForChord(chord, {
    fretRange: {
      min: Math.max(0, centerFret - range),
      max: centerFret + range,
    },
  });
}

/**
 * Get voicings that share the same V-System position across different chords
 * Useful for practicing voicings in the same neck position
 */
export function getMatchingVSystemVoicings(
  chords: Chord[],
  vPosition: VSystemPosition,
): Map<string, GuitarVoicing[]> {
  const result = new Map<string, GuitarVoicing[]>();

  for (const chord of chords) {
    const voicings = getVoicingsByVSystem(chord, vPosition);
    result.set(chord.symbol, voicings);
  }

  return result;
}
