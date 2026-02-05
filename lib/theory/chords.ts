import { Interval, Note, Chord as TonalChord } from "tonal";
import type { Chord, ChordQuality, ChordSymbol, NoteName } from "@/lib/types";

/**
 * Scale suggestions based on chord quality
 */
const SCALE_SUGGESTIONS: Record<ChordQuality, string[]> = {
  maj: ["Major", "Lydian"],
  min: ["Dorian", "Aeolian"],
  maj7: ["Major", "Lydian"],
  min7: ["Dorian", "Aeolian"],
  "7": ["Mixolydian", "Lydian Dominant"],
  min7b5: ["Locrian", "Locrian 6"],
  dim: ["Diminished", "Whole Tone"],
  dim7: ["Diminished"],
  aug: ["Whole Tone", "Lydian Augmented"],
  sus2: ["Major", "Mixolydian"],
  sus4: ["Mixolydian", "Dorian"],
  "6": ["Major", "Lydian"],
  min6: ["Dorian", "Melodic Minor"],
  "9": ["Mixolydian", "Lydian Dominant"],
  maj9: ["Major", "Lydian"],
  min9: ["Dorian", "Aeolian"],
  add9: ["Major", "Lydian"],
  other: ["Major"],
};

/**
 * Maps tonal chord type strings to our ChordQuality type
 * Uses the 'type' field from tonal (e.g., "dominant seventh", "minor seventh")
 */
function mapChordType(tonalType: string): ChordQuality {
  const typeMap: Record<string, ChordQuality> = {
    major: "maj",
    "": "maj",
    minor: "min",
    "major seventh": "maj7",
    "minor seventh": "min7",
    "dominant seventh": "7",
    "half-diminished seventh": "min7b5",
    "half-diminished": "min7b5",
    diminished: "dim",
    "diminished seventh": "dim7",
    augmented: "aug",
    "suspended second": "sus2",
    "suspended fourth": "sus4",
    "suspended fourth seventh": "7",
    "major sixth": "6",
    sixth: "6",
    "minor sixth": "min6",
    "dominant ninth": "9",
    "major ninth": "maj9",
    "minor ninth": "min9",
    "added ninth": "add9",
  };

  return typeMap[tonalType.toLowerCase()] || "other";
}

/**
 * Normalizes a note name to our NoteName type (handles enharmonics)
 */
function normalizeNoteName(note: string): NoteName {
  // tonal returns notes like "C", "C#", "Db", etc.
  // We need to ensure it matches our NoteName type
  const pc = Note.pitchClass(note);
  if (!pc) return "C"; // fallback

  // Keep the original spelling from tonal
  return pc as NoteName;
}

/**
 * Gets the guide tones (3rd and 7th) from a chord
 * For 6 chords, uses 3rd and 6th instead
 */
export function getGuideTones(
  notes: string[],
  intervals: string[],
  quality: ChordQuality,
): NoteName[] {
  const guideTones: NoteName[] = [];

  // Find the 3rd (or sus2/sus4 equivalent)
  const thirdIndex = intervals.findIndex(
    (i) => i === "3M" || i === "3m" || i === "2M" || i === "4P",
  );
  if (thirdIndex !== -1 && notes[thirdIndex]) {
    guideTones.push(normalizeNoteName(notes[thirdIndex]));
  }

  // Find the 7th (or 6th for 6 chords)
  if (quality === "6" || quality === "min6") {
    const sixthIndex = intervals.findIndex((i) => i === "6M" || i === "6m");
    if (sixthIndex !== -1 && notes[sixthIndex]) {
      guideTones.push(normalizeNoteName(notes[sixthIndex]));
    }
  } else {
    const seventhIndex = intervals.findIndex(
      (i) => i === "7M" || i === "7m" || i === "7d",
    );
    if (seventhIndex !== -1 && notes[seventhIndex]) {
      guideTones.push(normalizeNoteName(notes[seventhIndex]));
    }
  }

  return guideTones;
}

/**
 * Parses a chord symbol string into a Chord object
 * Supports slash chords (e.g., "C/G", "Cmaj7/B", "F/G")
 * Returns null if the chord cannot be parsed
 */
export function parseChordSymbol(symbol: ChordSymbol): Chord | null {
  // Detect slash chord notation
  let bassNote: NoteName | undefined;
  let upperSymbol = symbol;

  const slashIndex = symbol.indexOf("/");
  if (slashIndex > 0) {
    const potentialBass = symbol.slice(slashIndex + 1);
    const bassPC = Note.pitchClass(potentialBass);
    if (bassPC) {
      bassNote = normalizeNoteName(bassPC);
      upperSymbol = symbol.slice(0, slashIndex);
    }
  }

  // Parse the upper structure chord (without the slash)
  const parsed = TonalChord.get(upperSymbol);

  // Check if parsing was successful
  if (!parsed.tonic || parsed.notes.length === 0) {
    return null;
  }

  const root = normalizeNoteName(parsed.tonic);
  const quality = mapChordType(parsed.type);
  const notes = parsed.notes.map(normalizeNoteName);
  const guideTones = getGuideTones(parsed.notes, parsed.intervals, quality);

  // Get suggested scales based on chord quality
  const scaleNames = SCALE_SUGGESTIONS[quality] || ["Major"];
  const suggestedScales = scaleNames.map(
    (scaleName: string) => `${root} ${scaleName}`,
  );

  return {
    symbol,
    root,
    quality,
    notes,
    guideTones,
    suggestedScales,
    ...(bassNote && { bassNote }),
  };
}

/**
 * Gets the interval name between a root note and another note
 * Returns a display-friendly interval name (e.g., "1", "b3", "5", "b7")
 */
export function getIntervalName(root: NoteName, note: NoteName): string {
  // Convert tonal interval notation to display format
  const intervalMap: Record<string, string> = {
    "1P": "1",
    "2m": "b2",
    "2M": "2",
    "3m": "b3",
    "3M": "3",
    "4P": "4",
    "4A": "#4",
    "5d": "b5",
    "5P": "5",
    "5A": "#5",
    "6m": "b6",
    "6M": "6",
    "7m": "b7",
    "7M": "7",
  };

  // Try with original note spelling first
  const interval = Interval.distance(root, note);
  if (interval && intervalMap[interval]) {
    return intervalMap[interval];
  }

  // The fretboard uses sharps (e.g. "A#") but chord roots may be flat-spelled (e.g. "Bb").
  // Interval.distance("Bb", "A#") returns "1A" instead of "1P", so try the enharmonic.
  const enharmonicNote = Note.enharmonic(note);
  if (enharmonicNote) {
    const enharmonicInterval = Interval.distance(root, enharmonicNote);
    if (enharmonicInterval && intervalMap[enharmonicInterval]) {
      return intervalMap[enharmonicInterval];
    }
  }

  // Return the raw interval if no clean mapping found
  return interval || "?";
}

/**
 * Compares two notes by chroma (0-11) to handle enharmonic equivalents.
 * Note.pitchClass returns strings ("Bb" vs "A#") which don't match,
 * but Note.chroma returns numbers (both = 10).
 */
function sameChroma(a: string, b: string): boolean {
  return Note.chroma(a) === Note.chroma(b);
}

/**
 * Checks if a note is a chord tone for the given chord
 */
export function isChordTone(chord: Chord, note: NoteName): boolean {
  return chord.notes.some((chordNote) => sameChroma(chordNote, note));
}

/**
 * Checks if a note is a guide tone (3rd or 7th) for the given chord
 */
export function isGuideTone(chord: Chord, note: NoteName): boolean {
  return chord.guideTones.some((guideTone) => sameChroma(guideTone, note));
}

/**
 * Checks if a note is the root of the chord
 */
export function isRoot(chord: Chord, note: NoteName): boolean {
  return sameChroma(chord.root, note);
}
