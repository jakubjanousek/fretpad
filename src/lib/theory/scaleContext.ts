import { Note, Scale } from "tonal";
import type { Progression } from "@/lib/types";
import { parseChordSymbol } from "./chords";
import { detectKey } from "./keyDetection";
import { getAllChordsFromProgression } from "./progression";

export interface ParentScale {
  root: string;
  name: string;
}

export interface ChordScaleContext {
  chordSymbol: string;
  suggestedScale: string;
  parentScale: string;
  scaleChangesFromKey: boolean;
  modeLabel: string | null;
}

/**
 * Parent scale families to search through, in priority order.
 * We try Major first, then Melodic Minor, then Harmonic Minor.
 */
const PARENT_FAMILIES = ["Major", "Melodic Minor", "Harmonic Minor"];

/**
 * All 12 possible roots for searching parent scales.
 */
const ALL_ROOTS = [
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

/**
 * Gets the chroma set (pitch class numbers 0-11) of a scale.
 */
function getChromaSet(scaleName: string): Set<number> {
  const scale = Scale.get(scaleName);
  if (!scale.notes || scale.notes.length === 0) return new Set();
  return new Set(scale.notes.map((n) => Note.chroma(n) ?? -1));
}

/**
 * Checks if two chroma sets are identical.
 */
function chromaSetsEqual(a: Set<number>, b: Set<number>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) {
    if (!b.has(v)) return false;
  }
  return true;
}

/**
 * Gets the mode number (1-based) of a scale within its parent.
 * Returns the index of the scale's root in the parent scale's notes.
 */
function getModeNumber(
  scaleRoot: string,
  parentRoot: string,
  parentName: string,
): number | null {
  const parentScale = Scale.get(`${parentRoot} ${parentName.toLowerCase()}`);
  if (!parentScale.notes || parentScale.notes.length === 0) return null;

  const scaleChroma = Note.chroma(scaleRoot);
  for (let i = 0; i < parentScale.notes.length; i++) {
    const noteChroma = Note.chroma(parentScale.notes[i] as string);
    if (noteChroma === scaleChroma) return i + 1;
  }
  return null;
}

/**
 * Finds the parent scale for a given scale name.
 *
 * Algorithm:
 * 1. Get the scale's chroma set
 * 2. For each parent family (Major, Melodic Minor, Harmonic Minor),
 *    check all 12 roots to find a match
 * 3. Return the first match found
 * 4. Fallback: return the scale's own root + type
 */
export function getParentScale(scaleName: string): ParentScale {
  const scaleChroma = getChromaSet(scaleName);
  if (scaleChroma.size === 0) {
    const parts = scaleName.split(" ");
    return { root: parts[0] || "C", name: parts.slice(1).join(" ") || "Major" };
  }

  for (const family of PARENT_FAMILIES) {
    for (const root of ALL_ROOTS) {
      const candidateName = `${root} ${family.toLowerCase()}`;
      const candidateChroma = getChromaSet(candidateName);
      if (
        candidateChroma.size > 0 &&
        chromaSetsEqual(scaleChroma, candidateChroma)
      ) {
        return { root, name: family };
      }
    }
  }

  // Fallback: the scale is its own parent
  const parts = scaleName.split(" ");
  return { root: parts[0] || "C", name: parts.slice(1).join(" ") || "Major" };
}

/**
 * Checks whether two scales are modes of the same parent scale.
 */
export function areModesOfSameParent(scale1: string, scale2: string): boolean {
  const parent1 = getParentScale(scale1);
  const parent2 = getParentScale(scale2);
  return parent1.root === parent2.root && parent1.name === parent2.name;
}

/**
 * Gets the mode label for a scale within its parent.
 * Returns null if the scale IS the parent (root position).
 */
function getModeLabel(scaleName: string, parent: ParentScale): string | null {
  const parts = scaleName.split(" ");
  const scaleRoot = parts[0] || "C";

  // If this scale's root is the same as the parent, it IS the parent
  const scaleChroma = Note.chroma(scaleRoot);
  const parentChroma = Note.chroma(parent.root);
  if (scaleChroma === parentChroma) return null;

  const modeNum = getModeNumber(scaleRoot, parent.root, parent.name);
  if (!modeNum) return null;

  return `mode ${modeNum} of ${parent.root} ${parent.name}`;
}

/**
 * Analyzes scale context for each chord in a progression.
 *
 * Algorithm:
 * 1. Detect the progression's key
 * 2. Get the key's chroma set
 * 3. For each chord, get its suggested scale and compare chroma sets
 * 4. Mark whether the chord's scale changes from the key
 */
export function getProgressionScaleContext(
  progression: Progression,
): ChordScaleContext[] {
  const keys = detectKey(progression, 1);
  const detectedKey = keys[0];
  if (!detectedKey) return [];

  const keyScaleName =
    detectedKey.mode === "major"
      ? `${detectedKey.root} major`
      : `${detectedKey.root} minor`;
  const keyChroma = getChromaSet(keyScaleName);

  const chordSymbols = getAllChordsFromProgression(progression);

  return chordSymbols.map((symbol) => {
    const chord = parseChordSymbol(symbol);
    if (!chord) {
      return {
        chordSymbol: symbol,
        suggestedScale: "",
        parentScale: detectedKey.label,
        scaleChangesFromKey: false,
        modeLabel: null,
      };
    }

    const suggestedScale =
      chord.suggestedScales.find((s) =>
        chromaSetsEqual(getChromaSet(s), keyChroma),
      ) ||
      chord.suggestedScales[0] ||
      `${chord.root} Major`;
    const scaleChroma = getChromaSet(suggestedScale);
    const scaleChangesFromKey = !chromaSetsEqual(scaleChroma, keyChroma);

    const parent = getParentScale(suggestedScale);
    const parentScale = `${parent.root} ${parent.name}`;
    const modeLabel = getModeLabel(suggestedScale, parent);

    return {
      chordSymbol: symbol,
      suggestedScale,
      parentScale,
      scaleChangesFromKey,
      modeLabel,
    };
  });
}
