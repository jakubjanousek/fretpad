import { useMemo } from "react";
import { computeVoiceLeadingPath } from "@/lib/guitar/voiceLeading";
import { generateVoicingsForChord } from "@/lib/guitar/voicingGenerator";
import { parseChordSymbol } from "@/lib/theory/chords";
import { getAllChordsFromProgression } from "@/lib/theory/progression";
import type { Chord, GuitarVoicing, Progression } from "@/lib/types";

export interface VoicingData {
  /** Parsed chord objects in progression order */
  chords: Chord[];
  /** All candidate voicings per chord position */
  voicingsPerChord: GuitarVoicing[][];
  /** Optimized voice-leading path (one voicing per chord) */
  path: GuitarVoicing[];
}

export function useVoicingData(progression: Progression): VoicingData {
  return useMemo(() => {
    const symbols = getAllChordsFromProgression(progression);

    const chords: Chord[] = [];
    for (const sym of symbols) {
      const parsed = parseChordSymbol(sym);
      if (parsed) chords.push(parsed);
    }

    const voicingsPerChord = chords.map((c) => generateVoicingsForChord(c));
    const path = computeVoiceLeadingPath(chords, voicingsPerChord);

    return { chords, voicingsPerChord, path };
  }, [progression]);
}

/**
 * Converts bar/chord indices to a flat index into the voice-leading path.
 */
export function toFlatChordIndex(
  progression: Progression,
  barIndex: number,
  chordIndex: number,
): number {
  let flat = 0;
  for (let b = 0; b < barIndex && b < progression.bars.length; b++) {
    const bar = progression.bars[b];
    if (bar) flat += bar.chords.length;
  }
  return flat + chordIndex;
}
