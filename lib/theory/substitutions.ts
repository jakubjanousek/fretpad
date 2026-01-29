import { Note } from "tonal";
import type { Chord, ChordQuality, ChordSymbol } from "@/lib/types";
import { parseChordSymbol } from "./chords";

/**
 * Represents a chord substitution suggestion
 */
export interface ChordSubstitution {
  /** The substituted chord symbol */
  symbol: ChordSymbol;
  /** Parsed chord (null if symbol doesn't parse) */
  chord: Chord | null;
  /** Short label describing the substitution type */
  type: string;
  /** Brief explanation of why this substitution works */
  description: string;
}

/**
 * Transpose a note name by a number of semitones
 */
function transposeNote(note: string, semitones: number): string {
  const transposed = Note.transpose(
    note,
    `${semitones > 0 ? semitones : semitones}s`,
  );
  if (transposed) return Note.simplify(transposed) || note;
  // Fallback: manual transpose
  const chroma = ((Note.chroma(note) ?? 0) + semitones + 12) % 12;
  const noteNames = [
    "C",
    "Db",
    "D",
    "Eb",
    "E",
    "F",
    "Gb",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
  ];
  return noteNames[chroma] ?? "C";
}

/**
 * Build a chord symbol from root + quality suffix
 */
function buildSymbol(root: string, quality: ChordQuality): ChordSymbol {
  const suffixMap: Record<ChordQuality, string> = {
    maj: "",
    min: "m",
    maj7: "maj7",
    min7: "m7",
    "7": "7",
    min7b5: "m7b5",
    dim: "dim",
    dim7: "dim7",
    aug: "aug",
    sus2: "sus2",
    sus4: "sus4",
    "6": "6",
    min6: "m6",
    "9": "9",
    maj9: "maj9",
    min9: "m9",
    add9: "add9",
    other: "",
  };
  return `${root}${suffixMap[quality] ?? ""}`;
}

/**
 * Gets chord substitution suggestions for a given chord.
 *
 * Substitution types:
 * - **Tritone substitution**: Replace a dominant 7th chord with the dom7 a tritone away.
 *   Works because both share the same guide tones (3rd & 7th swap).
 * - **Relative major/minor**: Swap between relative major/minor (3 semitones apart).
 * - **Parallel major/minor**: Change quality between major and minor on same root.
 * - **Diminished approach**: Use a dim7 chord a half-step below to approach target.
 * - **Secondary dominant**: Add a V7 that resolves to the current chord.
 */
export function getSubstitutions(chord: Chord): ChordSubstitution[] {
  const subs: ChordSubstitution[] = [];

  // Tritone substitution (dominant 7th chords only)
  if (chord.quality === "7" || chord.quality === "9") {
    const tritoneRoot = transposeNote(chord.root, 6);
    const tritoneSuffix = chord.quality === "9" ? "9" : "7";
    const tritoneSymbol = buildSymbol(tritoneRoot, tritoneSuffix);
    const tritoneParsed = parseChordSymbol(tritoneSymbol);
    if (tritoneParsed) {
      subs.push({
        symbol: tritoneSymbol,
        chord: tritoneParsed,
        type: "Tritone sub",
        description: `${tritoneSymbol} shares the same guide tones (3rd & 7th swap)`,
      });
    }
  }

  // Relative major/minor swap
  if (
    chord.quality === "min7" ||
    chord.quality === "min" ||
    chord.quality === "min9"
  ) {
    // Minor → relative major (up 3 semitones)
    const relMajRoot = transposeNote(chord.root, 3);
    const relQuality: ChordQuality =
      chord.quality === "min7"
        ? "maj7"
        : chord.quality === "min9"
          ? "maj9"
          : "maj";
    const relSymbol = buildSymbol(relMajRoot, relQuality);
    const relParsed = parseChordSymbol(relSymbol);
    if (relParsed) {
      subs.push({
        symbol: relSymbol,
        chord: relParsed,
        type: "Relative major",
        description: `${relSymbol} shares the same key signature`,
      });
    }
  } else if (
    chord.quality === "maj7" ||
    chord.quality === "maj" ||
    chord.quality === "maj9"
  ) {
    // Major → relative minor (down 3 semitones)
    const relMinRoot = transposeNote(chord.root, -3);
    const relQuality: ChordQuality =
      chord.quality === "maj7"
        ? "min7"
        : chord.quality === "maj9"
          ? "min9"
          : "min";
    const relSymbol = buildSymbol(relMinRoot, relQuality);
    const relParsed = parseChordSymbol(relSymbol);
    if (relParsed) {
      subs.push({
        symbol: relSymbol,
        chord: relParsed,
        type: "Relative minor",
        description: `${relSymbol} shares the same key signature`,
      });
    }
  }

  // Parallel major/minor (same root, toggle quality)
  if (
    chord.quality === "maj" ||
    chord.quality === "maj7" ||
    chord.quality === "maj9"
  ) {
    const parQuality: ChordQuality =
      chord.quality === "maj7"
        ? "min7"
        : chord.quality === "maj9"
          ? "min9"
          : "min";
    const parSymbol = buildSymbol(chord.root, parQuality);
    const parParsed = parseChordSymbol(parSymbol);
    if (parParsed) {
      subs.push({
        symbol: parSymbol,
        chord: parParsed,
        type: "Parallel minor",
        description: `Same root, minor quality adds a darker color`,
      });
    }
  } else if (
    chord.quality === "min" ||
    chord.quality === "min7" ||
    chord.quality === "min9"
  ) {
    const parQuality: ChordQuality =
      chord.quality === "min7"
        ? "maj7"
        : chord.quality === "min9"
          ? "maj9"
          : "maj";
    const parSymbol = buildSymbol(chord.root, parQuality);
    const parParsed = parseChordSymbol(parSymbol);
    if (parParsed) {
      subs.push({
        symbol: parSymbol,
        chord: parParsed,
        type: "Parallel major",
        description: `Same root, major quality brightens the sound`,
      });
    }
  }

  // Diminished approach (half-step below, dim7)
  {
    const dimRoot = transposeNote(chord.root, -1);
    const dimSymbol = buildSymbol(dimRoot, "dim7");
    const dimParsed = parseChordSymbol(dimSymbol);
    if (dimParsed) {
      subs.push({
        symbol: dimSymbol,
        chord: dimParsed,
        type: "Diminished approach",
        description: `${dimSymbol} resolves up by half-step to ${chord.symbol}`,
      });
    }
  }

  // Secondary dominant (V7 of this chord)
  {
    const secDomRoot = transposeNote(chord.root, 7);
    const secDomSymbol = buildSymbol(secDomRoot, "7");
    const secDomParsed = parseChordSymbol(secDomSymbol);
    if (secDomParsed) {
      subs.push({
        symbol: secDomSymbol,
        chord: secDomParsed,
        type: "Secondary dominant",
        description: `V7/${chord.symbol} — creates a strong resolution`,
      });
    }
  }

  return subs;
}
