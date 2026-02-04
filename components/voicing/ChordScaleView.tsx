"use client";

import { useMemo } from "react";
import { Note } from "tonal";
import type { ChordQuality, GuitarVoicing, NoteName } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChordDiagram } from "./ChordDiagram";

interface ChordScaleViewProps {
  /** The base voicing to transpose */
  voicing: GuitarVoicing;
  /** The original chord root */
  originalRoot: NoteName;
  /** The original chord quality */
  originalQuality: ChordQuality;
  /** Number of positions to show (default: 5) */
  numPositions?: number;
  /** Maximum fret to go up to (default: 12) */
  maxFret?: number;
  /** Whether to show the diagram in compact mode */
  compact?: boolean;
  /** Currently selected fret offset (0-based) */
  selectedOffset?: number;
  /** Callback when a position is selected */
  onSelectPosition?: (offset: number) => void;
}

// Note names in chromatic order for transposition
const CHROMATIC_NOTES: NoteName[] = [
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

// Quality symbols for display
const QUALITY_SYMBOLS: Partial<Record<ChordQuality, string>> = {
  maj: "",
  min: "m",
  maj7: "maj7",
  min7: "m7",
  "7": "7",
  min7b5: "m7b5",
  dim: "dim",
  dim7: "dim7",
  aug: "+",
  sus2: "sus2",
  sus4: "sus4",
  "6": "6",
  min6: "m6",
  "9": "9",
  maj9: "maj9",
  min9: "m9",
  add9: "add9",
};

/**
 * Transpose a note by a number of semitones
 */
function transposeNote(note: NoteName, semitones: number): NoteName {
  const noteInfo = Note.get(note);
  const chroma = noteInfo.chroma;
  const noteIndex = CHROMATIC_NOTES.indexOf(
    chroma !== undefined ? (CHROMATIC_NOTES[chroma] ?? note) : note,
  );

  if (noteIndex === -1) {
    // Fallback using tonal
    const transposed = Note.transpose(note, `${semitones}m`) as string;
    return (Note.simplify(transposed) as NoteName) || note;
  }

  const newIndex = (noteIndex + semitones + 12) % 12;
  return CHROMATIC_NOTES[newIndex] ?? note;
}

/**
 * Create a transposed version of a voicing
 */
function transposeVoicing(
  voicing: GuitarVoicing,
  semitones: number,
): GuitarVoicing {
  return {
    ...voicing,
    id: `${voicing.id}-t${semitones}`,
    baseFret: voicing.baseFret + semitones,
    barreFret: voicing.barreFret ? voicing.barreFret + semitones : undefined,
    positions: voicing.positions.map((pos) => ({
      ...pos,
      fret: pos.fret > 0 ? pos.fret + semitones : pos.fret,
      note: pos.note ? transposeNote(pos.note, semitones) : undefined,
    })),
  };
}

/**
 * ChordScaleView shows how a voicing shape moves chromatically up the neck.
 * This helps visualize the movable nature of chord shapes.
 */
export function ChordScaleView({
  voicing,
  originalRoot,
  originalQuality,
  numPositions = 5,
  maxFret = 12,
  compact = true,
  selectedOffset,
  onSelectPosition,
}: ChordScaleViewProps) {
  // Generate transposed voicings
  const transposedVoicings = useMemo(() => {
    const voicings: Array<{
      voicing: GuitarVoicing;
      chordName: string;
      offset: number;
    }> = [];

    for (let offset = 0; offset < numPositions; offset++) {
      const transposed = transposeVoicing(voicing, offset);

      // Check if the highest fret is within range
      const highestFret = Math.max(
        ...transposed.positions.filter((p) => p.fret > 0).map((p) => p.fret),
      );

      if (highestFret > maxFret) break;

      // Calculate the new root note
      const newRoot = transposeNote(originalRoot, offset);
      const qualitySymbol = QUALITY_SYMBOLS[originalQuality] ?? originalQuality;
      const chordName = `${newRoot}${qualitySymbol}`;

      voicings.push({
        voicing: transposed,
        chordName,
        offset,
      });
    }

    return voicings;
  }, [voicing, originalRoot, originalQuality, numPositions, maxFret]);

  if (transposedVoicings.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Voicing cannot be transposed further up the neck.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-muted-foreground">
        Shape moving up the neck:
      </div>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {transposedVoicings.map(({ voicing: v, chordName, offset }) => (
          <button
            type="button"
            key={v.id}
            onClick={() => onSelectPosition?.(offset)}
            className={cn(
              "shrink-0 p-1 rounded-md transition-colors",
              selectedOffset === offset
                ? "bg-violet-500/20 ring-1 ring-violet-500"
                : "hover:bg-muted/50",
              onSelectPosition && "cursor-pointer",
            )}
            disabled={!onSelectPosition}
          >
            <ChordDiagram
              voicing={v}
              chordName={chordName}
              width={compact ? 60 : 80}
              showFingers={!compact}
              showFretNumbers={true}
              compact={compact}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
