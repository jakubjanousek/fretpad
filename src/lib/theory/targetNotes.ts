import { Note } from "tonal";
import { getNoteAtFret } from "@/lib/fretboard";
import type {
  ApproachNote,
  Chord,
  EnclosurePattern,
  FretNote,
  NoteName,
  TargetNoteMode,
  TargetStrength,
} from "@/lib/types";
import { STANDARD_TUNING } from "@/lib/types";
import { assertNever } from "@/lib/utils";
import { getScaleNotes } from "./scales";

/**
 * Determines the target strength of a chord tone.
 * Root, 3rd, 7th = primary (pulsing); 5th, extensions = secondary (steady)
 */
export function getTargetStrength(note: FretNote): TargetStrength {
  if (note.isRoot || note.isGuideTone) {
    return "primary";
  }
  return "secondary";
}

/**
 * Gets target notes based on the selected mode.
 */
export function getTargetNotes(
  mode: TargetNoteMode,
  fretNotes: FretNote[],
): FretNote[] {
  if (mode === "none") return [];

  return fretNotes.filter((note) => {
    switch (mode) {
      case "root":
        return note.isRoot;
      case "root-and-guides":
        return note.isGuideTone || note.isRoot;
      case "chord-tones":
      case "strong-beats":
        return note.isChordTone;
      case "all":
        return true;
      default:
        return assertNever(mode);
    }
  });
}

/**
 * Helper to get open string note from string number
 */
function getOpenString(stringNum: number): NoteName {
  return STANDARD_TUNING[stringNum - 1] ?? "E";
}

/**
 * Calculates chromatic approach notes for chord tones.
 * Returns notes 1 semitone above and below each target on the same string.
 */
export function getChromaticApproachNotes(
  targets: FretNote[],
  numFrets: number = 12,
  guideToneOnly: boolean = false,
): ApproachNote[] {
  const approaches: ApproachNote[] = [];

  const filteredTargets = guideToneOnly
    ? targets.filter((t) => t.isGuideTone || t.isRoot)
    : targets;

  for (const target of filteredTargets) {
    // Approach from below (ascending)
    if (target.fret > 0) {
      const belowFret = target.fret - 1;
      const belowNote = getNoteAtFret(getOpenString(target.string), belowFret);
      approaches.push({
        note: belowNote,
        fret: belowFret,
        string: target.string,
        targetFret: target.fret,
        targetString: target.string,
        direction: "ascending",
        type: "chromatic",
      });
    }

    // Approach from above (descending)
    if (target.fret < numFrets) {
      const aboveFret = target.fret + 1;
      const aboveNote = getNoteAtFret(getOpenString(target.string), aboveFret);
      approaches.push({
        note: aboveNote,
        fret: aboveFret,
        string: target.string,
        targetFret: target.fret,
        targetString: target.string,
        direction: "descending",
        type: "chromatic",
      });
    }
  }

  return approaches;
}

/**
 * Calculates diatonic approach notes using the active scale.
 * Returns scale tones adjacent to each target that aren't chord tones.
 */
export function getDiatonicApproachNotes(
  chord: Chord,
  targets: FretNote[],
  scaleName: string | undefined,
  numFrets: number = 12,
): ApproachNote[] {
  const approaches: ApproachNote[] = [];

  if (!scaleName) return [];

  // Extract scale type from full scale name (e.g., "D Dorian" -> "Dorian")
  const scaleType = scaleName.includes(" ")
    ? scaleName.split(" ").slice(1).join(" ")
    : scaleName;
  const scaleNotes = getScaleNotes(chord.root, scaleType);

  if (scaleNotes.length === 0) return [];

  // Build a set of chord tone chromas for fast lookup
  const chordChromas = new Set(
    chord.notes.map((n) => Note.chroma(n)).filter((c) => c !== undefined),
  );
  const scaleChromas = new Set(
    scaleNotes.map((n) => Note.chroma(n)).filter((c) => c !== undefined),
  );

  for (const target of targets) {
    // Check frets around the target for diatonic non-chord tones
    for (let fretOffset = -2; fretOffset <= 2; fretOffset++) {
      if (fretOffset === 0) continue;

      const candidateFret = target.fret + fretOffset;
      if (candidateFret < 0 || candidateFret > numFrets) continue;

      const candidateNote = getNoteAtFret(
        getOpenString(target.string),
        candidateFret,
      );
      const candidateChroma = Note.chroma(candidateNote);

      if (candidateChroma === undefined) continue;

      // Check if it's in the scale but not a chord tone
      const isInScale = scaleChromas.has(candidateChroma);
      const isChordTone = chordChromas.has(candidateChroma);

      if (isInScale && !isChordTone) {
        const direction = fretOffset < 0 ? "ascending" : "descending";

        approaches.push({
          note: candidateNote,
          fret: candidateFret,
          string: target.string,
          targetFret: target.fret,
          targetString: target.string,
          direction,
          type: "diatonic",
        });
      }
    }
  }

  // Remove duplicates (same fret/string can appear from multiple targets)
  const seen = new Set<string>();
  return approaches.filter((a) => {
    const key = `${a.string}-${a.fret}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Calculates enclosure patterns for target chord tones.
 * An enclosure surrounds the target with chromatic neighbors above and below.
 */
export function getEnclosurePatterns(
  targets: FretNote[],
  numFrets: number = 12,
): EnclosurePattern[] {
  const enclosures: EnclosurePattern[] = [];

  for (const target of targets) {
    // Need both above and below positions to form an enclosure
    if (target.fret < 1 || target.fret >= numFrets) continue;

    const belowFret = target.fret - 1;
    const aboveFret = target.fret + 1;

    const belowNote = getNoteAtFret(getOpenString(target.string), belowFret);
    const aboveNote = getNoteAtFret(getOpenString(target.string), aboveFret);

    enclosures.push({
      target,
      above: { string: target.string, fret: aboveFret },
      below: { string: target.string, fret: belowFret },
      aboveNote,
      belowNote,
    });
  }

  return enclosures;
}

/**
 * Filters approach notes to remove those that overlap with existing chord tones
 */
export function filterApproachNotesFromChordTones(
  approaches: ApproachNote[],
  chordNotes: FretNote[],
): ApproachNote[] {
  const chordPositions = new Set(
    chordNotes.map((n) => `${n.string}-${n.fret}`),
  );
  return approaches.filter((a) => !chordPositions.has(`${a.string}-${a.fret}`));
}
