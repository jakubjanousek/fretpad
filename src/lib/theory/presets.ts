import type { Progression } from "@/lib/types";
import { createProgression, parseProgression } from "./progression";

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

/**
 * Difficulty levels for presets
 */
export type PresetDifficulty = "beginner" | "intermediate" | "advanced";

export interface PresetMetadata {
  key: string;
  label: string;
  description: string;
  category: PresetCategory;
  difficulty: PresetDifficulty;
  barCount: number;
}

/**
 * Preset progressions organized by category
 */
export const PRESET_PROGRESSIONS = {
  // Jazz Standards
  "ii-V-I": assertProgression(
    createProgression(["Dm7", "G7", "Cmaj7", "Cmaj7"], {
      name: "ii-V-I",
    }),
    "ii-V-I",
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

  "Blue Bossa": assertProgression(
    parseProgression(
      "| Cm7 | Cm7 | Fm7 | Fm7 | Dm7b5 | G7 | Cm7 | Cm7 | Ebm7 | Ab7 | Dbmaj7 | Dbmaj7 | Dm7b5 | G7 | Cm7 | Cm7 |",
      { name: "Blue Bossa" },
    ),
    "Blue Bossa",
  ),

  "Fly Me to the Moon (A)": assertProgression(
    parseProgression("| Am7 | Dm7 | G7 | Cmaj7 | Fmaj7 | Bm7b5 | E7 | Am7 |", {
      name: "Fly Me to the Moon (A)",
    }),
    "Fly Me to the Moon (A)",
  ),

  "So What": assertProgression(
    parseProgression(
      "| Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Ebm7 | Ebm7 | Ebm7 | Ebm7 | Ebm7 | Ebm7 | Ebm7 | Ebm7 |",
      { name: "So What" },
    ),
    "So What",
  ),

  "iii-vi-ii-V": assertProgression(
    parseProgression("| Em7 | Am7 | Dm7 | G7 |", { name: "iii-vi-ii-V" }),
    "iii-vi-ii-V",
  ),

  "On the Sunny Side of the Street": assertProgression(
    parseProgression(
      "| C E7 | F F#dim7 | C/G A7 | Dm7 G7 | C E7 | F F#dim7 | C/G Am | Dm7 G7 |",
      { name: "On the Sunny Side of the Street" },
    ),
    "On the Sunny Side of the Street",
  ),

  "Sonnymoon for Two": assertProgression(
    parseProgression(
      "| Bb7 | Eb7 | Bb7 | Bb7 | Eb7 | Eb7 | Bb7 | Bb7 | F7 | Eb7 | Bb7 | F7 |",
      { name: "Sonnymoon for Two" },
    ),
    "Sonnymoon for Two",
  ),

  "Afro Blue": assertProgression(
    parseProgression(
      "| Fm7 | Fm7 | Fm7 | Fm7 | Db7 | Db7 | Fm7 | Fm7 | Db7 | Db7 | Fm7 | Fm7 |",
      { name: "Afro Blue" },
    ),
    "Afro Blue",
  ),

  "Song for Bilbao": assertProgression(
    parseProgression(
      "| Gm7 | Gm7 | C7sus4 | C7sus4 | Fmaj7/A | Fmaj7/A | Bbmaj7 | Bbmaj7 |",
      { name: "Song for Bilbao" },
    ),
    "Song for Bilbao",
  ),

  // Pop Progressions
  "I-V-vi-IV": assertProgression(
    createProgression(["C", "G", "Am", "F"], {
      name: "I-V-vi-IV",
    }),
    "I-V-vi-IV",
  ),

  "vi-IV-I-V": assertProgression(
    createProgression(["Am", "F", "C", "G"], {
      name: "vi-IV-I-V",
    }),
    "vi-IV-I-V",
  ),

  "I-vi-IV-V": assertProgression(
    createProgression(["C", "Am", "F", "G"], {
      name: "I-vi-IV-V",
    }),
    "I-vi-IV-V",
  ),

  "I-IV-V-IV": assertProgression(
    createProgression(["G", "C", "D", "C"], {
      name: "I-IV-V-IV",
    }),
    "I-IV-V-IV",
  ),

  "I-IV-vi-V": assertProgression(
    createProgression(["G", "C", "Em", "D"], {
      name: "I-IV-vi-V",
    }),
    "I-IV-vi-V",
  ),

  "i-bVI-bIII-bVII": assertProgression(
    createProgression(["Am", "F", "C", "G"], {
      name: "i-bVI-bIII-bVII",
    }),
    "i-bVI-bIII-bVII",
  ),

  "I-iii-IV-V": assertProgression(
    createProgression(["D", "F#m", "G", "A"], {
      name: "I-iii-IV-V",
    }),
    "I-iii-IV-V",
  ),

  "IV-V-iii-vi": assertProgression(
    createProgression(["F", "G", "Em", "Am"], {
      name: "IV-V-iii-vi",
    }),
    "IV-V-iii-vi",
  ),

  // Blues Progressions
  "12-Bar Blues": assertProgression(
    parseProgression(
      "| A7 | A7 | A7 | A7 | D7 | D7 | A7 | A7 | E7 | D7 | A7 | E7 |",
      { name: "12-Bar Blues" },
    ),
    "12-Bar Blues",
  ),

  "Minor Blues": assertProgression(
    parseProgression(
      "| Am7 | Am7 | Am7 | Am7 | Dm7 | Dm7 | Am7 | Am7 | Fmaj7 | E7 | Am7 | E7 |",
      { name: "Minor Blues" },
    ),
    "Minor Blues",
  ),

  "Jazz Blues": assertProgression(
    parseProgression(
      "| Bb7 | Eb7 | Bb7 | Fm7 Bb7 | Eb7 | Edim7 | Bb7 | Dm7 G7 | Cm7 | F7 | Bb7 G7 | Cm7 F7 |",
      { name: "Jazz Blues" },
    ),
    "Jazz Blues",
  ),

  "8-Bar Blues": assertProgression(
    parseProgression("| E7 | A7 | E7 | E7 | A7 | B7 | E7 | B7 |", {
      name: "8-Bar Blues",
    }),
    "8-Bar Blues",
  ),

  "Slow Blues": assertProgression(
    parseProgression(
      "| G7 | C7 | G7 | G7 | C7 | C7 | G7 | Em7 | Am7 | D7 | G7 D7 | G7 D7 |",
      { name: "Slow Blues" },
    ),
    "Slow Blues",
  ),

  "Blues Shuffle": assertProgression(
    parseProgression(
      "| E7 | E7 | E7 | E7 | A7 | A7 | E7 | E7 | B7 | A7 | E7 | B7 |",
      { name: "Blues Shuffle" },
    ),
    "Blues Shuffle",
  ),

  "Stormy Monday": assertProgression(
    parseProgression(
      "| G7 | C7 | G7 | Gm7 C7 | C7 | C#dim7 | G7 | Am7 D7 | Am7 | D7 | G7 C7 | G7 D7 |",
      { name: "Stormy Monday" },
    ),
    "Stormy Monday",
  ),

  "Quick Change Blues": assertProgression(
    parseProgression(
      "| A7 | D7 | A7 | A7 | D7 | D7 | A7 | A7 | E7 | D7 | A7 | E7 |",
      { name: "Quick Change Blues" },
    ),
    "Quick Change Blues",
  ),

  "Jockey Full of Bourbon": assertProgression(
    createProgression(["Em", "D", "C", "D"], {
      name: "Jockey Full of Bourbon",
    }),
    "Jockey Full of Bourbon",
  ),

  "Way Down in the Hole": assertProgression(
    parseProgression("| Em | Em | Am | Am | Em | Em | B7 | Em |", {
      name: "Way Down in the Hole",
    }),
    "Way Down in the Hole",
  ),

  "Downtown Train": assertProgression(
    parseProgression("| F | C | Bb | C | F | C | Bb | C |", {
      name: "Downtown Train",
    }),
    "Downtown Train",
  ),

  "Hold On": assertProgression(
    createProgression(["Cm", "Bb", "Ab", "Bb"], {
      name: "Hold On",
    }),
    "Hold On",
  ),

  // Modal Vamps
  "Dorian Vamp": assertProgression(
    createProgression(["Dm7", "Em7", "Dm7", "Dm7"], {
      name: "Dorian Vamp",
    }),
    "Dorian Vamp",
  ),

  "Mixolydian Vamp": assertProgression(
    createProgression(["G7", "F", "G7", "G7"], {
      name: "Mixolydian Vamp",
    }),
    "Mixolydian Vamp",
  ),

  "Phrygian Vamp": assertProgression(
    createProgression(["Em", "Fmaj7", "Em", "Em"], {
      name: "Phrygian Vamp",
    }),
    "Phrygian Vamp",
  ),

  "Lydian Vamp": assertProgression(
    createProgression(["Fmaj7", "G", "Fmaj7", "Fmaj7"], {
      name: "Lydian Vamp",
    }),
    "Lydian Vamp",
  ),

  "Aeolian Vamp": assertProgression(
    createProgression(["Am", "F", "G", "Am"], {
      name: "Aeolian Vamp",
    }),
    "Aeolian Vamp",
  ),

  "Locrian Vamp": assertProgression(
    createProgression(["Bm7b5", "Cmaj7", "Bm7b5", "Bm7b5"], {
      name: "Locrian Vamp",
    }),
    "Locrian Vamp",
  ),

  "Dorian Funk": assertProgression(
    createProgression(["Am7", "D7", "Am7", "Am7"], {
      name: "Dorian Funk",
    }),
    "Dorian Funk",
  ),

  "Mixolydian Blues": assertProgression(
    createProgression(["E7", "D", "A", "E7"], {
      name: "Mixolydian Blues",
    }),
    "Mixolydian Blues",
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
  "ii-V-I": {
    key: "ii-V-I",
    label: "ii–V–I",
    description: "The most common jazz cadence",
    category: "jazz",
    difficulty: "beginner",
    barCount: 4,
  },
  "Autumn Leaves (A section)": {
    key: "Autumn Leaves (A section)",
    label: "Autumn Leaves",
    description: "Classic jazz standard",
    category: "jazz",
    difficulty: "intermediate",
    barCount: 8,
  },
  "Rhythm Changes (A)": {
    key: "Rhythm Changes (A)",
    label: "Rhythm Changes",
    description: "Based on 'I Got Rhythm'",
    category: "jazz",
    difficulty: "advanced",
    barCount: 8,
  },
  "All The Things You Are (A)": {
    key: "All The Things You Are (A)",
    label: "All The Things",
    description: "Jerome Kern classic",
    category: "jazz",
    difficulty: "advanced",
    barCount: 8,
  },

  "Blue Bossa": {
    key: "Blue Bossa",
    label: "Blue Bossa",
    description: "Latin jazz classic",
    category: "jazz",
    difficulty: "intermediate",
    barCount: 16,
  },
  "Fly Me to the Moon (A)": {
    key: "Fly Me to the Moon (A)",
    label: "Fly Me to the Moon",
    description: "Circle-of-fourths jazz standard",
    category: "jazz",
    difficulty: "intermediate",
    barCount: 8,
  },
  "So What": {
    key: "So What",
    label: "So What",
    description: "Miles Davis modal jazz classic",
    category: "jazz",
    difficulty: "beginner",
    barCount: 16,
  },
  "iii-vi-ii-V": {
    key: "iii-vi-ii-V",
    label: "iii–vi–ii–V",
    description: "Extended turnaround progression",
    category: "jazz",
    difficulty: "intermediate",
    barCount: 4,
  },
  "On the Sunny Side of the Street": {
    key: "On the Sunny Side of the Street",
    label: "Sunny Side of the Street",
    description: "Classic Jimmy McHugh standard",
    category: "jazz",
    difficulty: "intermediate",
    barCount: 8,
  },
  "Sonnymoon for Two": {
    key: "Sonnymoon for Two",
    label: "Sonnymoon for Two",
    description: "Sonny Rollins blues head",
    category: "jazz",
    difficulty: "intermediate",
    barCount: 12,
  },
  "Afro Blue": {
    key: "Afro Blue",
    label: "Afro Blue",
    description: "Mongo Santamaria's Afro-Cuban classic",
    category: "jazz",
    difficulty: "intermediate",
    barCount: 12,
  },
  "Song for Bilbao": {
    key: "Song for Bilbao",
    label: "Song for Bilbao",
    description: "Pat Metheny modal composition",
    category: "jazz",
    difficulty: "intermediate",
    barCount: 8,
  },

  // Pop
  "I-V-vi-IV": {
    key: "I-V-vi-IV",
    label: "I–V–vi–IV",
    description: "Most popular pop progression",
    category: "pop",
    difficulty: "beginner",
    barCount: 4,
  },
  "vi-IV-I-V": {
    key: "vi-IV-I-V",
    label: "vi–IV–I–V",
    description: "Sensitive/emotional progression",
    category: "pop",
    difficulty: "beginner",
    barCount: 4,
  },
  "I-vi-IV-V": {
    key: "I-vi-IV-V",
    label: "I–vi–IV–V",
    description: "'50s doo-wop progression",
    category: "pop",
    difficulty: "beginner",
    barCount: 4,
  },
  "I-IV-V-IV": {
    key: "I-IV-V-IV",
    label: "I–IV–V–IV",
    description: "Classic rock progression",
    category: "pop",
    difficulty: "beginner",
    barCount: 4,
  },

  "I-IV-vi-V": {
    key: "I-IV-vi-V",
    label: "I–IV–vi–V",
    description: "Modern pop/worship progression",
    category: "pop",
    difficulty: "beginner",
    barCount: 4,
  },
  "i-bVI-bIII-bVII": {
    key: "i-bVI-bIII-bVII",
    label: "i–bVI–bIII–bVII",
    description: "Andalusian cadence / epic minor",
    category: "pop",
    difficulty: "beginner",
    barCount: 4,
  },
  "I-iii-IV-V": {
    key: "I-iii-IV-V",
    label: "I–iii–IV–V",
    description: "Bright folk/pop progression",
    category: "pop",
    difficulty: "beginner",
    barCount: 4,
  },
  "IV-V-iii-vi": {
    key: "IV-V-iii-vi",
    label: "IV–V–iii–vi",
    description: "Royal road progression (J-pop staple)",
    category: "pop",
    difficulty: "beginner",
    barCount: 4,
  },

  // Blues
  "12-Bar Blues": {
    key: "12-Bar Blues",
    label: "12-Bar Blues",
    description: "Standard blues form",
    category: "blues",
    difficulty: "beginner",
    barCount: 12,
  },
  "Minor Blues": {
    key: "Minor Blues",
    label: "Minor Blues",
    description: "12-bar minor blues",
    category: "blues",
    difficulty: "intermediate",
    barCount: 12,
  },
  "Jazz Blues": {
    key: "Jazz Blues",
    label: "Jazz Blues",
    description: "Blues with jazz substitutions",
    category: "blues",
    difficulty: "advanced",
    barCount: 12,
  },
  "8-Bar Blues": {
    key: "8-Bar Blues",
    label: "8-Bar Blues",
    description: "Shorter blues form",
    category: "blues",
    difficulty: "beginner",
    barCount: 8,
  },

  "Slow Blues": {
    key: "Slow Blues",
    label: "Slow Blues",
    description: "Laid-back blues with passing chords",
    category: "blues",
    difficulty: "intermediate",
    barCount: 12,
  },
  "Blues Shuffle": {
    key: "Blues Shuffle",
    label: "Blues Shuffle",
    description: "Classic shuffle feel",
    category: "blues",
    difficulty: "beginner",
    barCount: 12,
  },
  "Stormy Monday": {
    key: "Stormy Monday",
    label: "Stormy Monday",
    description: "T-Bone Walker style with chromatic movement",
    category: "blues",
    difficulty: "advanced",
    barCount: 12,
  },
  "Quick Change Blues": {
    key: "Quick Change Blues",
    label: "Quick Change Blues",
    description: "Blues with IV chord in bar 2",
    category: "blues",
    difficulty: "beginner",
    barCount: 12,
  },
  "Jockey Full of Bourbon": {
    key: "Jockey Full of Bourbon",
    label: "Jockey Full of Bourbon",
    description: "Tom Waits i–bVII–bVI–bVII riff",
    category: "blues",
    difficulty: "beginner",
    barCount: 4,
  },
  "Way Down in the Hole": {
    key: "Way Down in the Hole",
    label: "Way Down in the Hole",
    description: "Tom Waits dark gospel blues",
    category: "blues",
    difficulty: "intermediate",
    barCount: 8,
  },
  "Downtown Train": {
    key: "Downtown Train",
    label: "Downtown Train",
    description: "Tom Waits bittersweet pop-rock",
    category: "blues",
    difficulty: "beginner",
    barCount: 8,
  },
  "Hold On": {
    key: "Hold On",
    label: "Hold On",
    description: "Tom Waits gritty minor vamp",
    category: "blues",
    difficulty: "beginner",
    barCount: 4,
  },

  // Modal
  "Dorian Vamp": {
    key: "Dorian Vamp",
    label: "Dorian Vamp",
    description: "Dorian mode vamp",
    category: "modal",
    difficulty: "beginner",
    barCount: 4,
  },
  "Mixolydian Vamp": {
    key: "Mixolydian Vamp",
    label: "Mixolydian Vamp",
    description: "Mixolydian mode vamp",
    category: "modal",
    difficulty: "beginner",
    barCount: 4,
  },
  "Phrygian Vamp": {
    key: "Phrygian Vamp",
    label: "Phrygian Vamp",
    description: "Phrygian mode vamp",
    category: "modal",
    difficulty: "intermediate",
    barCount: 4,
  },
  "Lydian Vamp": {
    key: "Lydian Vamp",
    label: "Lydian Vamp",
    description: "Lydian mode vamp",
    category: "modal",
    difficulty: "intermediate",
    barCount: 4,
  },
  "Aeolian Vamp": {
    key: "Aeolian Vamp",
    label: "Aeolian Vamp",
    description: "Natural minor mode vamp",
    category: "modal",
    difficulty: "beginner",
    barCount: 4,
  },
  "Locrian Vamp": {
    key: "Locrian Vamp",
    label: "Locrian Vamp",
    description: "Rare Locrian mode exploration",
    category: "modal",
    difficulty: "advanced",
    barCount: 4,
  },
  "Dorian Funk": {
    key: "Dorian Funk",
    label: "Dorian Funk",
    description: "Dorian with funk feel",
    category: "modal",
    difficulty: "beginner",
    barCount: 4,
  },
  "Mixolydian Blues": {
    key: "Mixolydian Blues",
    label: "Mixolydian Blues",
    description: "Mixolydian with bluesy motion",
    category: "modal",
    difficulty: "intermediate",
    barCount: 4,
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
