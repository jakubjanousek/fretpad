import { Interval, Note, Chord as TonalChord } from "tonal";
import type { ChordSymbol, Progression } from "@/lib/types";

/**
 * Transpose a chord symbol by a number of semitones.
 * Preserves the chord quality (e.g. "Dm7" + 2 → "Em7").
 * Handles slash chords (e.g. "C/G" + 2 → "D/A").
 */
export function transposeChordSymbol(
  symbol: ChordSymbol,
  semitones: number,
): ChordSymbol {
  const interval = Interval.fromSemitones(semitones);

  // Handle slash chords: transpose both root and bass
  const slashIndex = symbol.indexOf("/");
  if (slashIndex > 0) {
    const upperSymbol = symbol.slice(0, slashIndex);
    const bassPart = symbol.slice(slashIndex + 1);

    const parsed = TonalChord.get(upperSymbol);
    if (!parsed.tonic) return symbol;

    const transposedRoot = Note.simplify(
      Note.transpose(parsed.tonic, interval),
    );
    if (!transposedRoot) return symbol;

    const bassPC = Note.pitchClass(bassPart);
    if (!bassPC) return symbol;

    const transposedBass = Note.simplify(Note.transpose(bassPC, interval));
    if (!transposedBass) return symbol;

    const suffix = upperSymbol.slice(parsed.tonic.length);
    return `${transposedRoot}${suffix}/${transposedBass}`;
  }

  // Non-slash chord
  const parsed = TonalChord.get(symbol);
  if (!parsed.tonic) return symbol;

  const transposed = Note.transpose(parsed.tonic, interval);
  const simplified = Note.simplify(transposed);
  if (!simplified) return symbol;

  const suffix = symbol.slice(parsed.tonic.length);
  return `${simplified}${suffix}`;
}

/**
 * Transpose an entire progression by a number of semitones.
 * Returns a new Progression with all chords transposed.
 */
export function transposeProgression(
  progression: Progression,
  semitones: number,
): Progression {
  return {
    ...progression,
    bars: progression.bars.map((bar) => ({
      ...bar,
      chords: bar.chords.map((bc) => ({
        ...bc,
        chord: transposeChordSymbol(bc.chord, semitones),
      })),
    })),
  };
}
