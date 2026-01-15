import { Note } from "tonal";
import type { Chord, FretNote, NoteName, Progression } from "@/lib/types";
import { parseChordSymbol } from "./chords";
import { getFretNotesForChord } from "@/lib/fretboard";

/**
 * Represents a voice leading connection between two fret positions
 */
export interface VoiceLeadingPath {
  from: FretNote;
  to: FretNote;
  type: "guide-tone" | "common-tone" | "resolution";
  semitoneDistance: number; // How far the voice moves (0 = common tone)
}

/**
 * Gets the semitone distance between two notes
 */
function getSemitoneDistance(from: NoteName, to: NoteName): number {
  const fromMidi = Note.midi(`${from}4`) ?? 0;
  const toMidi = Note.midi(`${to}4`) ?? 0;
  // Calculate minimum distance (considering enharmonic equivalence)
  const diff = Math.abs(toMidi - fromMidi);
  return Math.min(diff, 12 - diff);
}

/**
 * Checks if two notes are enharmonically equivalent
 */
function enharmonicEqual(note1: NoteName, note2: NoteName): boolean {
  return Note.pitchClass(note1) === Note.pitchClass(note2);
}

/**
 * Gets the next chord in the progression given current position
 */
export function getNextChord(
  progression: Progression,
  currentBarIndex: number,
  currentChordIndex: number,
): Chord | null {
  const currentBar = progression.bars[currentBarIndex];
  if (!currentBar) return null;

  // Try next chord in current bar
  if (currentChordIndex < currentBar.chords.length - 1) {
    const nextBarChord = currentBar.chords[currentChordIndex + 1];
    if (nextBarChord) {
      return parseChordSymbol(nextBarChord.chord);
    }
  }

  // Try first chord of next bar
  const nextBarIndex = (currentBarIndex + 1) % progression.bars.length;
  const nextBar = progression.bars[nextBarIndex];
  if (nextBar?.chords[0]) {
    return parseChordSymbol(nextBar.chords[0].chord);
  }

  return null;
}

/**
 * Finds common tones between two chords
 */
export function findCommonTones(chord1: Chord, chord2: Chord): NoteName[] {
  const commonTones: NoteName[] = [];

  for (const note1 of chord1.notes) {
    for (const note2 of chord2.notes) {
      if (
        enharmonicEqual(note1, note2) &&
        !commonTones.some((n) => enharmonicEqual(n, note1))
      ) {
        commonTones.push(note1);
      }
    }
  }

  return commonTones;
}

/**
 * Calculates the optimal voice leading paths between two chords
 * Focuses on guide tones (3rd and 7th) and their smooth motion
 */
export function calculateVoiceLeadingPaths(
  currentChord: Chord,
  nextChord: Chord,
  numFrets: number = 12,
): VoiceLeadingPath[] {
  const paths: VoiceLeadingPath[] = [];

  // Get fret positions for both chords
  const currentFretNotes = getFretNotesForChord(currentChord, { numFrets });
  const nextFretNotes = getFretNotesForChord(nextChord, { numFrets });

  // Filter to guide tones only for voice leading visualization
  const currentGuideFrets = currentFretNotes.filter((n) => n.isGuideTone);
  const nextGuideFrets = nextFretNotes.filter((n) => n.isGuideTone);

  // Find common tones between chords
  const commonTones = findCommonTones(currentChord, nextChord);

  // For each current guide tone position, find the closest target in the next chord
  for (const fromNote of currentGuideFrets) {
    // Check if this is a common tone
    const isCommonTone = commonTones.some((ct) =>
      enharmonicEqual(ct, fromNote.note),
    );

    if (isCommonTone) {
      // Find matching position in next chord (same string, closest fret)
      const matchingNextNotes = nextFretNotes.filter(
        (n) =>
          enharmonicEqual(n.note, fromNote.note) &&
          n.string === fromNote.string,
      );

      // Find closest fret on same string
      let closestMatch = matchingNextNotes[0];
      let minFretDistance = Infinity;

      for (const match of matchingNextNotes) {
        const fretDistance = Math.abs(match.fret - fromNote.fret);
        if (fretDistance < minFretDistance) {
          minFretDistance = fretDistance;
          closestMatch = match;
        }
      }

      if (closestMatch) {
        paths.push({
          from: fromNote,
          to: closestMatch,
          type: "common-tone",
          semitoneDistance: 0,
        });
      }
    } else {
      // Find the closest guide tone in the next chord
      // Prioritize: same string, minimal fret movement
      let bestTarget: FretNote | null = null;
      let bestScore = Infinity;

      for (const toNote of nextGuideFrets) {
        // Calculate a score based on string distance and fret distance
        const stringDistance = Math.abs(toNote.string - fromNote.string);
        const fretDistance = Math.abs(toNote.fret - fromNote.fret);
        const semitoneDistance = getSemitoneDistance(
          fromNote.note,
          toNote.note,
        );

        // Favor same string, minimal movement
        // Weight: same string is better, small semitone moves are better
        const score = stringDistance * 10 + fretDistance + semitoneDistance * 2;

        if (score < bestScore) {
          bestScore = score;
          bestTarget = toNote;
        }
      }

      if (bestTarget) {
        const semitoneDistance = getSemitoneDistance(
          fromNote.note,
          bestTarget.note,
        );

        // Determine if this is a typical resolution (7th to 3rd motion)
        const isResolution = isTypicalResolution(
          fromNote,
          bestTarget,
          currentChord,
          nextChord,
        );

        paths.push({
          from: fromNote,
          to: bestTarget,
          type: isResolution ? "resolution" : "guide-tone",
          semitoneDistance,
        });
      }
    }
  }

  return paths;
}

/**
 * Checks if a voice motion represents a typical jazz resolution
 * (e.g., 7th resolving down by step to 3rd)
 */
function isTypicalResolution(
  from: FretNote,
  to: FretNote,
  _currentChord: Chord,
  _nextChord: Chord,
): boolean {
  // Check for b7 -> 3 resolution (common in ii-V-I)
  // The 7th of the V chord resolves down to the 3rd of the I chord
  const fromInterval = from.interval;
  const toInterval = to.interval;

  // b7 resolving to 3 (half step down)
  if (
    (fromInterval === "b7" || fromInterval === "7") &&
    (toInterval === "3" || toInterval === "b3")
  ) {
    const semitones = getSemitoneDistance(from.note, to.note);
    if (semitones <= 2) {
      return true;
    }
  }

  // 3 resolving to b7 or 7 (in certain progressions)
  if (
    (fromInterval === "3" || fromInterval === "b3") &&
    (toInterval === "b7" || toInterval === "7")
  ) {
    const semitones = getSemitoneDistance(from.note, to.note);
    if (semitones <= 2) {
      return true;
    }
  }

  return false;
}

/**
 * Filters voice leading paths to show only the most relevant ones
 * per string region to avoid visual clutter
 */
export function filterBestPaths(
  paths: VoiceLeadingPath[],
  maxPathsPerRegion: number = 2,
): VoiceLeadingPath[] {
  // Group paths by string region (high strings 1-2, middle 3-4, low 5-6)
  const regions: Map<string, VoiceLeadingPath[]> = new Map();

  for (const path of paths) {
    const region =
      path.from.string <= 2 ? "high" : path.from.string <= 4 ? "mid" : "low";
    if (!regions.has(region)) {
      regions.set(region, []);
    }
    regions.get(region)?.push(path);
  }

  // Sort paths within each region by priority:
  // 1. Common tones (stay in place)
  // 2. Resolutions (musically significant)
  // 3. Guide tones (smallest movement first)
  const filteredPaths: VoiceLeadingPath[] = [];

  for (const [, regionPaths] of regions) {
    const sorted = [...regionPaths].sort((a, b) => {
      // Common tones first
      if (a.type === "common-tone" && b.type !== "common-tone") return -1;
      if (b.type === "common-tone" && a.type !== "common-tone") return 1;

      // Resolutions second
      if (a.type === "resolution" && b.type !== "resolution") return -1;
      if (b.type === "resolution" && a.type !== "resolution") return 1;

      // Then by smallest semitone distance
      return a.semitoneDistance - b.semitoneDistance;
    });

    filteredPaths.push(...sorted.slice(0, maxPathsPerRegion));
  }

  return filteredPaths;
}
