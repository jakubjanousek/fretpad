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

  if (usedStrings.length === 0) return undefined;

  const minString = usedStrings[0]!;
  const maxString = usedStrings[usedStrings.length - 1]!;

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
 */
export function getShellVoicings(chord: Chord): GuitarVoicing[] {
  return getVoicingsByType(chord, "shell");
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
