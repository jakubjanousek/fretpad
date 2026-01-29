import { Interval, Note, Chord as TonalChord } from "tonal";
import type { ChordSymbol, Progression } from "@/lib/types";

/**
 * Transpose a chord symbol by a number of semitones.
 * Preserves the chord quality (e.g. "Dm7" + 2 → "Em7").
 */
export function transposeChordSymbol(
  symbol: ChordSymbol,
  semitones: number,
): ChordSymbol {
  const parsed = TonalChord.get(symbol);
  if (!parsed.tonic) return symbol;

  const interval = Interval.fromSemitones(semitones);
  const transposed = Note.transpose(parsed.tonic, interval);
  const simplified = Note.simplify(transposed);
  if (!simplified) return symbol;

  // Reconstruct: new root + original chord type suffix
  // parsed.symbol is the full canonical symbol (e.g. "Dm7")
  // We need the part after the root — use aliases[0] or rebuild from type
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
