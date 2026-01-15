import { generateId } from "@/lib/id";
import type {
  BarChord,
  ChordSymbol,
  Progression,
  ProgressionBar,
} from "@/lib/types";
import { parseChordSymbol } from "./chords";

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
 * Preset categories for UI organization
 */
export type PresetCategory = "jazz" | "pop" | "blues" | "modal";

export interface PresetMetadata {
  key: string;
  label: string;
  description: string;
  category: PresetCategory;
}

/**
 * Preset progressions organized by category
 */
export const PRESET_PROGRESSIONS = {
  // Jazz Standards
  "ii-V-I in C": assertProgression(
    createProgression(["Dm7", "G7", "Cmaj7", "Cmaj7"], {
      name: "ii-V-I in C",
    }),
    "ii-V-I in C",
  ),

  "Autumn Leaves (A section)": assertProgression(
    parseProgression("| Am7 | D7 | Gmaj7 | Cmaj7 | F#m7b5 | B7 | Em | Em |", {
      name: "Autumn Leaves (A section)",
    }),
    "Autumn Leaves (A section)",
  ),

  "Rhythm Changes (A)": assertProgression(
    parseProgression(
      "| Bbmaj7 Gm7 | Cm7 F7 | Dm7 Gm7 | Cm7 F7 | Fm7 Bb7 | Ebmaj7 Ab7 | Dm7 Gm7 | Cm7 F7 |",
      { name: "Rhythm Changes (A)" },
    ),
    "Rhythm Changes (A)",
  ),

  "All The Things You Are (A)": assertProgression(
    parseProgression(
      "| Fm7 | Bbm7 | Eb7 | Abmaj7 | Dbmaj7 | G7 | Cmaj7 | Cmaj7 |",
      { name: "All The Things You Are (A)" },
    ),
    "All The Things You Are (A)",
  ),

  // Pop Progressions
  "I-V-vi-IV in C": assertProgression(
    createProgression(["C", "G", "Am", "F"], {
      name: "I-V-vi-IV in C",
    }),
    "I-V-vi-IV in C",
  ),

  "vi-IV-I-V in C": assertProgression(
    createProgression(["Am", "F", "C", "G"], {
      name: "vi-IV-I-V in C",
    }),
    "vi-IV-I-V in C",
  ),

  "I-vi-IV-V in C": assertProgression(
    createProgression(["C", "Am", "F", "G"], {
      name: "I-vi-IV-V in C",
    }),
    "I-vi-IV-V in C",
  ),

  "I-IV-V-IV in G": assertProgression(
    createProgression(["G", "C", "D", "C"], {
      name: "I-IV-V-IV in G",
    }),
    "I-IV-V-IV in G",
  ),

  // Blues Progressions
  "12-bar blues in A": assertProgression(
    parseProgression(
      "| A7 | A7 | A7 | A7 | D7 | D7 | A7 | A7 | E7 | D7 | A7 | E7 |",
      { name: "12-bar blues in A" },
    ),
    "12-bar blues in A",
  ),

  "Minor Blues in Am": assertProgression(
    parseProgression(
      "| Am7 | Am7 | Am7 | Am7 | Dm7 | Dm7 | Am7 | Am7 | Fmaj7 | E7 | Am7 | E7 |",
      { name: "Minor Blues in Am" },
    ),
    "Minor Blues in Am",
  ),

  "Jazz Blues in Bb": assertProgression(
    parseProgression(
      "| Bb7 | Eb7 | Bb7 | Fm7 Bb7 | Eb7 | Edim7 | Bb7 | Dm7 G7 | Cm7 | F7 | Bb7 G7 | Cm7 F7 |",
      { name: "Jazz Blues in Bb" },
    ),
    "Jazz Blues in Bb",
  ),

  "8-bar Blues in E": assertProgression(
    parseProgression("| E7 | A7 | E7 | E7 | A7 | B7 | E7 | B7 |", {
      name: "8-bar Blues in E",
    }),
    "8-bar Blues in E",
  ),

  // Modal Vamps
  "Dorian Vamp (Dm7)": assertProgression(
    createProgression(["Dm7", "Em7", "Dm7", "Dm7"], {
      name: "Dorian Vamp (Dm7)",
    }),
    "Dorian Vamp (Dm7)",
  ),

  "Mixolydian Vamp (G7)": assertProgression(
    createProgression(["G7", "F", "G7", "G7"], {
      name: "Mixolydian Vamp (G7)",
    }),
    "Mixolydian Vamp (G7)",
  ),

  "Phrygian Vamp (Em)": assertProgression(
    createProgression(["Em", "Fmaj7", "Em", "Em"], {
      name: "Phrygian Vamp (Em)",
    }),
    "Phrygian Vamp (Em)",
  ),

  "Lydian Vamp (Fmaj7)": assertProgression(
    createProgression(["Fmaj7", "G", "Fmaj7", "Fmaj7"], {
      name: "Lydian Vamp (Fmaj7)",
    }),
    "Lydian Vamp (Fmaj7)",
  ),
} as const;

/**
 * Metadata for each preset (for UI display)
 */
export const PRESET_METADATA: Record<
  keyof typeof PRESET_PROGRESSIONS,
  PresetMetadata
> = {
  // Jazz
  "ii-V-I in C": {
    key: "ii-V-I in C",
    label: "ii–V–I",
    description: "The most common jazz cadence",
    category: "jazz",
  },
  "Autumn Leaves (A section)": {
    key: "Autumn Leaves (A section)",
    label: "Autumn Leaves",
    description: "Classic jazz standard in G major",
    category: "jazz",
  },
  "Rhythm Changes (A)": {
    key: "Rhythm Changes (A)",
    label: "Rhythm Changes",
    description: "Based on 'I Got Rhythm'",
    category: "jazz",
  },
  "All The Things You Are (A)": {
    key: "All The Things You Are (A)",
    label: "All The Things",
    description: "Jerome Kern classic",
    category: "jazz",
  },

  // Pop
  "I-V-vi-IV in C": {
    key: "I-V-vi-IV in C",
    label: "I–V–vi–IV",
    description: "Most popular pop progression",
    category: "pop",
  },
  "vi-IV-I-V in C": {
    key: "vi-IV-I-V in C",
    label: "vi–IV–I–V",
    description: "Sensitive/emotional progression",
    category: "pop",
  },
  "I-vi-IV-V in C": {
    key: "I-vi-IV-V in C",
    label: "I–vi–IV–V",
    description: "'50s doo-wop progression",
    category: "pop",
  },
  "I-IV-V-IV in G": {
    key: "I-IV-V-IV in G",
    label: "I–IV–V–IV",
    description: "Classic rock progression",
    category: "pop",
  },

  // Blues
  "12-bar blues in A": {
    key: "12-bar blues in A",
    label: "12-Bar Blues",
    description: "Standard blues form in A",
    category: "blues",
  },
  "Minor Blues in Am": {
    key: "Minor Blues in Am",
    label: "Minor Blues",
    description: "12-bar minor blues",
    category: "blues",
  },
  "Jazz Blues in Bb": {
    key: "Jazz Blues in Bb",
    label: "Jazz Blues",
    description: "Blues with jazz substitutions",
    category: "blues",
  },
  "8-bar Blues in E": {
    key: "8-bar Blues in E",
    label: "8-Bar Blues",
    description: "Shorter blues form",
    category: "blues",
  },

  // Modal
  "Dorian Vamp (Dm7)": {
    key: "Dorian Vamp (Dm7)",
    label: "Dorian (Dm7)",
    description: "D Dorian mode vamp",
    category: "modal",
  },
  "Mixolydian Vamp (G7)": {
    key: "Mixolydian Vamp (G7)",
    label: "Mixolydian (G7)",
    description: "G Mixolydian mode vamp",
    category: "modal",
  },
  "Phrygian Vamp (Em)": {
    key: "Phrygian Vamp (Em)",
    label: "Phrygian (Em)",
    description: "E Phrygian mode vamp",
    category: "modal",
  },
  "Lydian Vamp (Fmaj7)": {
    key: "Lydian Vamp (Fmaj7)",
    label: "Lydian (Fmaj7)",
    description: "F Lydian mode vamp",
    category: "modal",
  },
};

/**
 * Get presets grouped by category
 */
export function getPresetsByCategory(): Record<
  PresetCategory,
  PresetMetadata[]
> {
  const categories: Record<PresetCategory, PresetMetadata[]> = {
    jazz: [],
    pop: [],
    blues: [],
    modal: [],
  };

  for (const metadata of Object.values(PRESET_METADATA)) {
    categories[metadata.category].push(metadata);
  }

  return categories;
}

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
