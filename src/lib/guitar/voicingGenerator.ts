import { getNoteAtFret } from "@/lib/fretboard";
import type {
  Chord,
  GuitarFretPosition,
  GuitarVoicing,
  NoteName,
  VoicingTemplate,
} from "@/lib/types";
import { STANDARD_TUNING } from "@/lib/types";
import { getTemplatesForQuality } from "./voicingTemplates";

const MAX_FRET = 14;
const MAX_STRETCH = 4;

/** Pitch class (0-11) for enharmonic comparison */
function getPitchClass(note: string): number {
  const map: Record<string, number> = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
    // Enharmonics that tonal may return
    Cb: 11,
    "E#": 5,
    Fb: 4,
    "B#": 0,
  };
  return map[note] ?? 0;
}

/** Find all frets where a note appears on a given open string (0..maxFret) */
function findNoteFrets(
  openString: NoteName,
  target: NoteName,
  maxFret: number = MAX_FRET,
): number[] {
  const targetPC = getPitchClass(target);
  const frets: number[] = [];
  for (let fret = 0; fret <= maxFret; fret++) {
    if (getPitchClass(getNoteAtFret(openString, fret)) === targetPC) {
      frets.push(fret);
    }
  }
  return frets;
}

/** Check if a voicing is physically playable */
function isPlayable(positions: GuitarFretPosition[]): boolean {
  const frettedFrets = positions.filter((p) => p.fret > 0).map((p) => p.fret);
  if (frettedFrets.length === 0) return true;
  const stretch = Math.max(...frettedFrets) - Math.min(...frettedFrets);
  return stretch <= MAX_STRETCH;
}

/** Check if all frets are in valid range */
function fretsInRange(positions: GuitarFretPosition[]): boolean {
  return positions.every((p) => p.fret >= -1 && p.fret <= MAX_FRET);
}

/** Instantiate a template at a specific root fret */
function instantiateTemplate(
  template: VoicingTemplate,
  chord: Chord,
  rootFret: number,
): GuitarVoicing | null {
  const rootPC = getPitchClass(chord.root);
  const positions: GuitarFretPosition[] = template.relativePositions.map(
    (offset, i) => {
      const stringNum = i + 1; // 1-based
      if (offset === null) {
        return { string: stringNum, fret: -1 };
      }

      const absoluteFret = rootFret + offset;
      const openString = STANDARD_TUNING[i];
      if (!openString) return { string: stringNum, fret: -1 };
      const note = getNoteAtFret(openString, absoluteFret);

      return {
        string: stringNum,
        fret: absoluteFret,
        note,
        isRoot: getPitchClass(note) === rootPC,
      };
    },
  );

  if (!fretsInRange(positions)) return null;
  if (!isPlayable(positions)) return null;

  // Verify all sounding notes belong to the chord
  const chordPCs = new Set(chord.notes.map(getPitchClass));
  const soundingPositions = positions.filter((p) => p.fret >= 0);
  if (
    !soundingPositions.every(
      (p) => p.note && chordPCs.has(getPitchClass(p.note)),
    )
  ) {
    return null;
  }

  const frettedFrets = positions.filter((p) => p.fret > 0).map((p) => p.fret);
  const baseFret = frettedFrets.length > 0 ? Math.min(...frettedFrets) : 0;

  return {
    id: `${template.name}-${chord.root}-f${rootFret}`,
    name: template.name,
    type: template.type,
    positions,
    baseFret,
    isBarreChord: template.isBarreChord,
    difficulty: template.difficulty,
    voicingStructure: template.voicingStructure,
    inversion: template.inversion,
  };
}

export interface VoicingGeneratorOptions {
  maxFret?: number;
}

/** Generate all valid voicings for a chord */
export function generateVoicingsForChord(
  chord: Chord,
  _options?: VoicingGeneratorOptions,
): GuitarVoicing[] {
  const templates = getTemplatesForQuality(chord.quality);
  const voicings: GuitarVoicing[] = [];
  const seenIds = new Set<string>();

  for (const template of templates) {
    const openString = STANDARD_TUNING[template.rootString];
    if (!openString) continue;
    const rootFrets = findNoteFrets(openString, chord.root);

    for (const rootFret of rootFrets) {
      const voicing = instantiateTemplate(template, chord, rootFret);
      if (voicing && !seenIds.has(voicing.id)) {
        seenIds.add(voicing.id);
        voicings.push(voicing);
      }
    }
  }

  // Sort by baseFret for predictable ordering
  voicings.sort((a, b) => a.baseFret - b.baseFret);
  return voicings;
}
