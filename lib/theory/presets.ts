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

  "iii-vi-ii-V in C": assertProgression(
    parseProgression("| Em7 | Am7 | Dm7 | G7 |", { name: "iii-vi-ii-V in C" }),
    "iii-vi-ii-V in C",
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

  "I-IV-vi-V in G": assertProgression(
    createProgression(["G", "C", "Em", "D"], {
      name: "I-IV-vi-V in G",
    }),
    "I-IV-vi-V in G",
  ),

  "i-bVI-bIII-bVII in Am": assertProgression(
    createProgression(["Am", "F", "C", "G"], {
      name: "i-bVI-bIII-bVII in Am",
    }),
    "i-bVI-bIII-bVII in Am",
  ),

  "I-iii-IV-V in D": assertProgression(
    createProgression(["D", "F#m", "G", "A"], {
      name: "I-iii-IV-V in D",
    }),
    "I-iii-IV-V in D",
  ),

  "IV-V-iii-vi in C": assertProgression(
    createProgression(["F", "G", "Em", "Am"], {
      name: "IV-V-iii-vi in C",
    }),
    "IV-V-iii-vi in C",
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

  "Slow Blues in G": assertProgression(
    parseProgression(
      "| G7 | C7 | G7 | G7 | C7 | C7 | G7 | Em7 | Am7 | D7 | G7 D7 | G7 D7 |",
      { name: "Slow Blues in G" },
    ),
    "Slow Blues in G",
  ),

  "Blues Shuffle in E": assertProgression(
    parseProgression(
      "| E7 | E7 | E7 | E7 | A7 | A7 | E7 | E7 | B7 | A7 | E7 | B7 |",
      { name: "Blues Shuffle in E" },
    ),
    "Blues Shuffle in E",
  ),

  "Stormy Monday in G": assertProgression(
    parseProgression(
      "| G7 | C7 | G7 | Gm7 C7 | C7 | C#dim7 | G7 | Am7 D7 | Am7 | D7 | G7 C7 | G7 D7 |",
      { name: "Stormy Monday in G" },
    ),
    "Stormy Monday in G",
  ),

  "Quick Change Blues in A": assertProgression(
    parseProgression(
      "| A7 | D7 | A7 | A7 | D7 | D7 | A7 | A7 | E7 | D7 | A7 | E7 |",
      { name: "Quick Change Blues in A" },
    ),
    "Quick Change Blues in A",
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

  "Aeolian Vamp (Am)": assertProgression(
    createProgression(["Am", "F", "G", "Am"], {
      name: "Aeolian Vamp (Am)",
    }),
    "Aeolian Vamp (Am)",
  ),

  "Locrian Vamp (Bm7b5)": assertProgression(
    createProgression(["Bm7b5", "Cmaj7", "Bm7b5", "Bm7b5"], {
      name: "Locrian Vamp (Bm7b5)",
    }),
    "Locrian Vamp (Bm7b5)",
  ),

  "Dorian Funk (Am7)": assertProgression(
    createProgression(["Am7", "D7", "Am7", "Am7"], {
      name: "Dorian Funk (Am7)",
    }),
    "Dorian Funk (Am7)",
  ),

  "Mixolydian Blues (E7)": assertProgression(
    createProgression(["E7", "D", "A", "E7"], {
      name: "Mixolydian Blues (E7)",
    }),
    "Mixolydian Blues (E7)",
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
    difficulty: "beginner",
    barCount: 4,
  },
  "Autumn Leaves (A section)": {
    key: "Autumn Leaves (A section)",
    label: "Autumn Leaves",
    description: "Classic jazz standard in G major",
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
    description: "Latin jazz classic in C minor",
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
  "iii-vi-ii-V in C": {
    key: "iii-vi-ii-V in C",
    label: "iii–vi–ii–V",
    description: "Extended turnaround progression",
    category: "jazz",
    difficulty: "intermediate",
    barCount: 4,
  },

  // Pop
  "I-V-vi-IV in C": {
    key: "I-V-vi-IV in C",
    label: "I–V–vi–IV",
    description: "Most popular pop progression",
    category: "pop",
    difficulty: "beginner",
    barCount: 4,
  },
  "vi-IV-I-V in C": {
    key: "vi-IV-I-V in C",
    label: "vi–IV–I–V",
    description: "Sensitive/emotional progression",
    category: "pop",
    difficulty: "beginner",
    barCount: 4,
  },
  "I-vi-IV-V in C": {
    key: "I-vi-IV-V in C",
    label: "I–vi–IV–V",
    description: "'50s doo-wop progression",
    category: "pop",
    difficulty: "beginner",
    barCount: 4,
  },
  "I-IV-V-IV in G": {
    key: "I-IV-V-IV in G",
    label: "I–IV–V–IV",
    description: "Classic rock progression",
    category: "pop",
    difficulty: "beginner",
    barCount: 4,
  },

  "I-IV-vi-V in G": {
    key: "I-IV-vi-V in G",
    label: "I–IV–vi–V",
    description: "Modern pop/worship progression",
    category: "pop",
    difficulty: "beginner",
    barCount: 4,
  },
  "i-bVI-bIII-bVII in Am": {
    key: "i-bVI-bIII-bVII in Am",
    label: "i–bVI–bIII–bVII",
    description: "Andalusian cadence / epic minor",
    category: "pop",
    difficulty: "beginner",
    barCount: 4,
  },
  "I-iii-IV-V in D": {
    key: "I-iii-IV-V in D",
    label: "I–iii–IV–V",
    description: "Bright folk/pop progression in D",
    category: "pop",
    difficulty: "beginner",
    barCount: 4,
  },
  "IV-V-iii-vi in C": {
    key: "IV-V-iii-vi in C",
    label: "IV–V–iii–vi",
    description: "Royal road progression (J-pop staple)",
    category: "pop",
    difficulty: "beginner",
    barCount: 4,
  },

  // Blues
  "12-bar blues in A": {
    key: "12-bar blues in A",
    label: "12-Bar Blues",
    description: "Standard blues form in A",
    category: "blues",
    difficulty: "beginner",
    barCount: 12,
  },
  "Minor Blues in Am": {
    key: "Minor Blues in Am",
    label: "Minor Blues",
    description: "12-bar minor blues",
    category: "blues",
    difficulty: "intermediate",
    barCount: 12,
  },
  "Jazz Blues in Bb": {
    key: "Jazz Blues in Bb",
    label: "Jazz Blues",
    description: "Blues with jazz substitutions",
    category: "blues",
    difficulty: "advanced",
    barCount: 12,
  },
  "8-bar Blues in E": {
    key: "8-bar Blues in E",
    label: "8-Bar Blues",
    description: "Shorter blues form",
    category: "blues",
    difficulty: "beginner",
    barCount: 8,
  },

  "Slow Blues in G": {
    key: "Slow Blues in G",
    label: "Slow Blues",
    description: "Laid-back blues with passing chords",
    category: "blues",
    difficulty: "intermediate",
    barCount: 12,
  },
  "Blues Shuffle in E": {
    key: "Blues Shuffle in E",
    label: "Blues Shuffle",
    description: "Classic shuffle feel in E",
    category: "blues",
    difficulty: "beginner",
    barCount: 12,
  },
  "Stormy Monday in G": {
    key: "Stormy Monday in G",
    label: "Stormy Monday",
    description: "T-Bone Walker style with chromatic movement",
    category: "blues",
    difficulty: "advanced",
    barCount: 12,
  },
  "Quick Change Blues in A": {
    key: "Quick Change Blues in A",
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
  "Dorian Vamp (Dm7)": {
    key: "Dorian Vamp (Dm7)",
    label: "Dorian (Dm7)",
    description: "D Dorian mode vamp",
    category: "modal",
    difficulty: "beginner",
    barCount: 4,
  },
  "Mixolydian Vamp (G7)": {
    key: "Mixolydian Vamp (G7)",
    label: "Mixolydian (G7)",
    description: "G Mixolydian mode vamp",
    category: "modal",
    difficulty: "beginner",
    barCount: 4,
  },
  "Phrygian Vamp (Em)": {
    key: "Phrygian Vamp (Em)",
    label: "Phrygian (Em)",
    description: "E Phrygian mode vamp",
    category: "modal",
    difficulty: "intermediate",
    barCount: 4,
  },
  "Lydian Vamp (Fmaj7)": {
    key: "Lydian Vamp (Fmaj7)",
    label: "Lydian (Fmaj7)",
    description: "F Lydian mode vamp",
    category: "modal",
    difficulty: "intermediate",
    barCount: 4,
  },
  "Aeolian Vamp (Am)": {
    key: "Aeolian Vamp (Am)",
    label: "Aeolian (Am)",
    description: "A natural minor mode vamp",
    category: "modal",
    difficulty: "beginner",
    barCount: 4,
  },
  "Locrian Vamp (Bm7b5)": {
    key: "Locrian Vamp (Bm7b5)",
    label: "Locrian (Bm7b5)",
    description: "Rare Locrian mode exploration",
    category: "modal",
    difficulty: "advanced",
    barCount: 4,
  },
  "Dorian Funk (Am7)": {
    key: "Dorian Funk (Am7)",
    label: "Dorian Funk (Am7)",
    description: "A Dorian with funk feel",
    category: "modal",
    difficulty: "beginner",
    barCount: 4,
  },
  "Mixolydian Blues (E7)": {
    key: "Mixolydian Blues (E7)",
    label: "Mixolydian Blues (E7)",
    description: "E Mixolydian with bluesy motion",
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
