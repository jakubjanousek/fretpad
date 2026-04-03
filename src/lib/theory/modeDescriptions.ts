/**
 * Mode descriptions and characteristic information
 * For educational display in Mode Comparison View
 */

export interface ModeDescription {
  name: string;
  character: string; // Brief emotional/sound description
  characteristicInterval: string; // The interval that defines the mode
  commonUses: string[];
  formula: string; // Interval formula like "1 2 ♭3 4 5 6 ♭7"
}

/**
 * Detailed descriptions for each mode
 */
export const MODE_DESCRIPTIONS: Record<string, ModeDescription> = {
  major: {
    name: "Major (Ionian)",
    character: "Bright, happy, resolved",
    characteristicInterval: "Natural 7th (leading tone)",
    commonUses: ["Pop", "Classical", "Folk", "Uplifting melodies"],
    formula: "1 2 3 4 5 6 7",
  },
  ionian: {
    name: "Ionian (Major)",
    character: "Bright, happy, resolved",
    characteristicInterval: "Natural 7th (leading tone)",
    commonUses: ["Pop", "Classical", "Folk", "Uplifting melodies"],
    formula: "1 2 3 4 5 6 7",
  },
  dorian: {
    name: "Dorian",
    character: "Minor with a bright, jazzy quality — hopeful yet melancholic",
    characteristicInterval: "Natural 6th over minor 3rd",
    commonUses: ["Jazz", "Funk", "Rock solos", "Minor blues"],
    formula: "1 2 ♭3 4 5 6 ♭7",
  },
  phrygian: {
    name: "Phrygian",
    character: "Dark, Spanish/flamenco, exotic tension",
    characteristicInterval: "Flat 2nd (♭2)",
    commonUses: ["Flamenco", "Metal", "Exotic textures", "Spanish guitar"],
    formula: "1 ♭2 ♭3 4 5 ♭6 ♭7",
  },
  lydian: {
    name: "Lydian",
    character: "Dreamy, floating, ethereal brightness",
    characteristicInterval: "Raised 4th (♯4)",
    commonUses: ["Film scores", "Jazz fusion", "Ambient", "Cinematic"],
    formula: "1 2 3 ♯4 5 6 7",
  },
  mixolydian: {
    name: "Mixolydian",
    character: "Bluesy dominant sound — major with attitude",
    characteristicInterval: "Flat 7th (♭7)",
    commonUses: ["Blues", "Rock", "Country", "Funk", "Dominant chords"],
    formula: "1 2 3 4 5 6 ♭7",
  },
  aeolian: {
    name: "Aeolian (Natural Minor)",
    character: "Melancholic, dark, emotionally deep",
    characteristicInterval: "Flat 6th and 7th — no leading tone",
    commonUses: ["Rock", "Pop ballads", "Heavy metal", "Sad songs"],
    formula: "1 2 ♭3 4 5 ♭6 ♭7",
  },
  locrian: {
    name: "Locrian",
    character: "Unstable, dissonant, rarely used melodically",
    characteristicInterval: "Flat 2nd and flat 5th — no stable root",
    commonUses: ["Jazz over m7♭5", "Metal tension", "Experimental"],
    formula: "1 ♭2 ♭3 4 ♭5 ♭6 ♭7",
  },
  "harmonic minor": {
    name: "Harmonic Minor",
    character: "Classical minor with dramatic leading tone",
    characteristicInterval: "Natural 7th with ♭6 — creates augmented 2nd",
    commonUses: ["Classical", "Metal neoclassical", "Jazz minor ii-V-i"],
    formula: "1 2 ♭3 4 5 ♭6 7",
  },
  "melodic minor": {
    name: "Melodic Minor",
    character: "Jazz minor — smooth, sophisticated tension",
    characteristicInterval: "Natural 6th and 7th over minor 3rd",
    commonUses: ["Jazz", "Fusion", "Over altered dominants"],
    formula: "1 2 ♭3 4 5 6 7",
  },
  "pentatonic major": {
    name: "Major Pentatonic",
    character: "Open, clean, universally pleasant",
    characteristicInterval: "No 4th or 7th — no tension",
    commonUses: ["Country", "Rock", "Folk", "Pop hooks"],
    formula: "1 2 3 5 6",
  },
  "pentatonic minor": {
    name: "Minor Pentatonic",
    character: "Bluesy, raw, soulful simplicity",
    characteristicInterval: "No 2nd or 6th — pure minor feel",
    commonUses: ["Blues", "Rock", "Pop", "R&B"],
    formula: "1 ♭3 4 5 ♭7",
  },
  blues: {
    name: "Blues Scale",
    character: "Gritty, expressive, blues essence",
    characteristicInterval: "Blue note (♭5) adds tension",
    commonUses: ["Blues", "Rock", "Jazz blues", "Soul"],
    formula: "1 ♭3 4 ♭5 5 ♭7",
  },
};

/**
 * Gets the description for a mode type
 */
export function getModeDescription(modeType: string): ModeDescription | null {
  const normalizedMode = modeType.toLowerCase();
  return MODE_DESCRIPTIONS[normalizedMode] || null;
}

/**
 * Gets a short characteristic description for a mode
 */
export function getModeCharacter(modeType: string): string {
  const description = getModeDescription(modeType);
  return description?.character || "Standard scale";
}

/**
 * Gets the common uses for a mode
 */
export function getModeUses(modeType: string): string[] {
  const description = getModeDescription(modeType);
  return description?.commonUses || [];
}
