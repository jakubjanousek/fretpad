import type { ChordQuality, VoicingTemplate } from "@/lib/types";

/**
 * Voicing templates define chord shapes relative to the root fret.
 *
 * relativePositions: [string1(highE), string2(B), string3(G), string4(D), string5(A), string6(lowE)]
 * null = muted, number = fret offset from root fret on rootString
 *
 * rootString: index into STANDARD_TUNING (0=highE, 5=lowE)
 */

// ============================================
// Shell voicings — Root on string 6
// R-7-3 on strings 6-4-3
// ============================================

const shellMaj7Str6: VoicingTemplate = {
  name: "Shell R-7-3 (6th string)",
  type: "shell",
  quality: "maj7",
  relativePositions: [null, null, 1, 1, null, 0],
  rootString: 5,
  rootFretOffset: 0,
  difficulty: "beginner",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

const shellMin7Str6: VoicingTemplate = {
  name: "Shell R-b7-b3 (6th string)",
  type: "shell",
  quality: "min7",
  relativePositions: [null, null, 0, 0, null, 0],
  rootString: 5,
  rootFretOffset: 0,
  difficulty: "beginner",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

const shellDom7Str6: VoicingTemplate = {
  name: "Shell R-b7-3 (6th string)",
  type: "shell",
  quality: "7",
  relativePositions: [null, null, 1, 0, null, 0],
  rootString: 5,
  rootFretOffset: 0,
  difficulty: "beginner",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

const shellMin7b5Str6: VoicingTemplate = {
  name: "Shell R-b7-b3+b5 (6th string)",
  type: "shell",
  quality: "min7b5",
  relativePositions: [null, null, 0, 0, 1, 0],
  rootString: 5,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

// ============================================
// Shell voicings — Root on string 5
// R-3-7 on strings 5-4-3
// ============================================

const shellMaj7Str5: VoicingTemplate = {
  name: "Shell R-3-7 (5th string)",
  type: "shell",
  quality: "maj7",
  relativePositions: [null, null, 1, -1, 0, null],
  rootString: 4,
  rootFretOffset: 0,
  difficulty: "beginner",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

const shellMin7Str5: VoicingTemplate = {
  name: "Shell R-b3-b7 (5th string)",
  type: "shell",
  quality: "min7",
  relativePositions: [null, null, 0, -2, 0, null],
  rootString: 4,
  rootFretOffset: 0,
  difficulty: "beginner",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

const shellDom7Str5: VoicingTemplate = {
  name: "Shell R-3-b7 (5th string)",
  type: "shell",
  quality: "7",
  relativePositions: [null, null, 0, -1, 0, null],
  rootString: 4,
  rootFretOffset: 0,
  difficulty: "beginner",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

const shellMin7b5Str5: VoicingTemplate = {
  name: "Shell R-b3-b7+b5 (5th string)",
  type: "shell",
  quality: "min7b5",
  relativePositions: [null, null, 0, -2, 0, -1],
  rootString: 4,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

// ============================================
// Drop 2 voicings — Root on string 3
// Strings 4-3-2-1 (top4)
// ============================================

const drop2Maj7Str3: VoicingTemplate = {
  name: "Drop 2 maj7 (top 4)",
  type: "drop2",
  quality: "maj7",
  relativePositions: [2, 0, 0, 0, null, null],
  rootString: 2,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "drop2",
};

const drop2Min7Str3: VoicingTemplate = {
  name: "Drop 2 min7 (top 4)",
  type: "drop2",
  quality: "min7",
  relativePositions: [1, -1, 0, 0, null, null],
  rootString: 2,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "drop2",
};

const drop2Dom7Str3: VoicingTemplate = {
  name: "Drop 2 dom7 (top 4)",
  type: "drop2",
  quality: "7",
  relativePositions: [1, 0, 0, 0, null, null],
  rootString: 2,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "drop2",
};

const drop2Min7b5Str3: VoicingTemplate = {
  name: "Drop 2 min7b5 (top 4)",
  type: "drop2",
  quality: "min7b5",
  relativePositions: [1, -1, 0, -1, null, null],
  rootString: 2,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "drop2",
};

// ============================================
// Drop 2 voicings — Root on string 4
// Strings 5-4-3-2 (inner4)
// ============================================

const drop2Maj7Str4: VoicingTemplate = {
  name: "Drop 2 maj7 (inner 4)",
  type: "drop2",
  quality: "maj7",
  relativePositions: [null, 2, -1, 0, 0, null],
  rootString: 3,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "drop2",
};

const drop2Min7Str4: VoicingTemplate = {
  name: "Drop 2 min7 (inner 4)",
  type: "drop2",
  quality: "min7",
  relativePositions: [null, 1, -2, 0, 0, null],
  rootString: 3,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "drop2",
};

const drop2Dom7Str4: VoicingTemplate = {
  name: "Drop 2 dom7 (inner 4)",
  type: "drop2",
  quality: "7",
  relativePositions: [null, 1, -1, 0, 0, null],
  rootString: 3,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "drop2",
};

const drop2Min7b5Str4: VoicingTemplate = {
  name: "Drop 2 min7b5 (inner 4)",
  type: "drop2",
  quality: "min7b5",
  relativePositions: [null, 1, -2, 0, -1, null],
  rootString: 3,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "drop2",
};

// ============================================
// Drop 2 inversions — 1st inversion, top 4
// Strings 4-3-2-1 (top4), bass note = 7th
// ============================================

const drop2Maj7Str3Inv1: VoicingTemplate = {
  name: "Drop 2 maj7 1st inv (top 4)",
  type: "drop2",
  quality: "maj7",
  relativePositions: [0, 0, 1, 1, null, null],
  rootString: 0,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 1,
  voicingStructure: "drop2",
};

const drop2Min7Str3Inv1: VoicingTemplate = {
  name: "Drop 2 min7 1st inv (top 4)",
  type: "drop2",
  quality: "min7",
  relativePositions: [0, 0, 0, 0, null, null],
  rootString: 0,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: true,
  inversion: 1,
  voicingStructure: "drop2",
};

const drop2Dom7Str3Inv1: VoicingTemplate = {
  name: "Drop 2 dom7 1st inv (top 4)",
  type: "drop2",
  quality: "7",
  relativePositions: [0, 0, 1, 0, null, null],
  rootString: 0,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 1,
  voicingStructure: "drop2",
};

const drop2Min7b5Str3Inv1: VoicingTemplate = {
  name: "Drop 2 min7b5 1st inv (top 4)",
  type: "drop2",
  quality: "min7b5",
  relativePositions: [-1, 0, 0, 0, null, null],
  rootString: 0,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 1,
  voicingStructure: "drop2",
};

// ============================================
// Drop 2 inversions — 2nd inversion, top 4
// Strings 4-3-2-1 (top4), bass note = root
// ============================================

const drop2Maj7Str3Inv2: VoicingTemplate = {
  name: "Drop 2 maj7 2nd inv (top 4)",
  type: "drop2",
  quality: "maj7",
  relativePositions: [2, 2, 2, 0, null, null],
  rootString: 3,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 2,
  voicingStructure: "drop2",
};

const drop2Min7Str3Inv2: VoicingTemplate = {
  name: "Drop 2 min7 2nd inv (top 4)",
  type: "drop2",
  quality: "min7",
  relativePositions: [1, 1, 2, 0, null, null],
  rootString: 3,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 2,
  voicingStructure: "drop2",
};

const drop2Dom7Str3Inv2: VoicingTemplate = {
  name: "Drop 2 dom7 2nd inv (top 4)",
  type: "drop2",
  quality: "7",
  relativePositions: [2, 1, 2, 0, null, null],
  rootString: 3,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 2,
  voicingStructure: "drop2",
};

const drop2Min7b5Str3Inv2: VoicingTemplate = {
  name: "Drop 2 min7b5 2nd inv (top 4)",
  type: "drop2",
  quality: "min7b5",
  relativePositions: [1, 1, 1, 0, null, null],
  rootString: 3,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 2,
  voicingStructure: "drop2",
};

// ============================================
// Drop 2 inversions — 3rd inversion, top 4
// Strings 4-3-2-1 (top4), bass note = 3rd
// ============================================

const drop2Maj7Str3Inv3: VoicingTemplate = {
  name: "Drop 2 maj7 3rd inv (top 4)",
  type: "drop2",
  quality: "maj7",
  relativePositions: [2, 0, 3, 1, null, null],
  rootString: 1,
  rootFretOffset: 0,
  difficulty: "advanced",
  isBarreChord: false,
  inversion: 3,
  voicingStructure: "drop2",
};

const drop2Min7Str3Inv3: VoicingTemplate = {
  name: "Drop 2 min7 3rd inv (top 4)",
  type: "drop2",
  quality: "min7",
  relativePositions: [2, 0, 2, 0, null, null],
  rootString: 1,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 3,
  voicingStructure: "drop2",
};

const drop2Dom7Str3Inv3: VoicingTemplate = {
  name: "Drop 2 dom7 3rd inv (top 4)",
  type: "drop2",
  quality: "7",
  relativePositions: [2, 0, 2, 1, null, null],
  rootString: 1,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 3,
  voicingStructure: "drop2",
};

const drop2Min7b5Str3Inv3: VoicingTemplate = {
  name: "Drop 2 min7b5 3rd inv (top 4)",
  type: "drop2",
  quality: "min7b5",
  relativePositions: [1, 0, 2, 0, null, null],
  rootString: 1,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 3,
  voicingStructure: "drop2",
};

// ============================================
// Drop 2 inversions — 1st inversion, inner 4
// Strings 5-4-3-2 (inner4), bass note = 7th
// ============================================

const drop2Maj7Str4Inv1: VoicingTemplate = {
  name: "Drop 2 maj7 1st inv (inner 4)",
  type: "drop2",
  quality: "maj7",
  relativePositions: [null, 0, -1, 1, 1, null],
  rootString: 1,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 1,
  voicingStructure: "drop2",
};

const drop2Min7Str4Inv1: VoicingTemplate = {
  name: "Drop 2 min7 1st inv (inner 4)",
  type: "drop2",
  quality: "min7",
  relativePositions: [null, 0, -1, 0, 0, null],
  rootString: 1,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 1,
  voicingStructure: "drop2",
};

const drop2Dom7Str4Inv1: VoicingTemplate = {
  name: "Drop 2 dom7 1st inv (inner 4)",
  type: "drop2",
  quality: "7",
  relativePositions: [null, 0, -1, 1, 0, null],
  rootString: 1,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 1,
  voicingStructure: "drop2",
};

const drop2Min7b5Str4Inv1: VoicingTemplate = {
  name: "Drop 2 min7b5 1st inv (inner 4)",
  type: "drop2",
  quality: "min7b5",
  relativePositions: [null, 0, -2, 0, 0, null],
  rootString: 1,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 1,
  voicingStructure: "drop2",
};

// ============================================
// Drop 2 inversions — 2nd inversion, inner 4
// Strings 5-4-3-2 (inner4), bass note = root
// ============================================

const drop2Maj7Str4Inv2: VoicingTemplate = {
  name: "Drop 2 maj7 2nd inv (inner 4)",
  type: "drop2",
  quality: "maj7",
  relativePositions: [null, 2, 1, 2, 0, null],
  rootString: 4,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 2,
  voicingStructure: "drop2",
};

const drop2Min7Str4Inv2: VoicingTemplate = {
  name: "Drop 2 min7 2nd inv (inner 4)",
  type: "drop2",
  quality: "min7",
  relativePositions: [null, 1, 0, 2, 0, null],
  rootString: 4,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 2,
  voicingStructure: "drop2",
};

const drop2Dom7Str4Inv2: VoicingTemplate = {
  name: "Drop 2 dom7 2nd inv (inner 4)",
  type: "drop2",
  quality: "7",
  relativePositions: [null, 2, 0, 2, 0, null],
  rootString: 4,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 2,
  voicingStructure: "drop2",
};

const drop2Min7b5Str4Inv2: VoicingTemplate = {
  name: "Drop 2 min7b5 2nd inv (inner 4)",
  type: "drop2",
  quality: "min7b5",
  relativePositions: [null, 1, 0, 1, 0, null],
  rootString: 4,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 2,
  voicingStructure: "drop2",
};

// ============================================
// Drop 2 inversions — 3rd inversion, inner 4
// Strings 5-4-3-2 (inner4), bass note = 3rd
// ============================================

const drop2Maj7Str4Inv3: VoicingTemplate = {
  name: "Drop 2 maj7 3rd inv (inner 4)",
  type: "drop2",
  quality: "maj7",
  relativePositions: [null, 3, 0, 4, 2, null],
  rootString: 2,
  rootFretOffset: 0,
  difficulty: "advanced",
  isBarreChord: false,
  inversion: 3,
  voicingStructure: "drop2",
};

const drop2Min7Str4Inv3: VoicingTemplate = {
  name: "Drop 2 min7 3rd inv (inner 4)",
  type: "drop2",
  quality: "min7",
  relativePositions: [null, 3, 0, 3, 1, null],
  rootString: 2,
  rootFretOffset: 0,
  difficulty: "advanced",
  isBarreChord: false,
  inversion: 3,
  voicingStructure: "drop2",
};

const drop2Dom7Str4Inv3: VoicingTemplate = {
  name: "Drop 2 dom7 3rd inv (inner 4)",
  type: "drop2",
  quality: "7",
  relativePositions: [null, 3, 0, 3, 2, null],
  rootString: 2,
  rootFretOffset: 0,
  difficulty: "advanced",
  isBarreChord: false,
  inversion: 3,
  voicingStructure: "drop2",
};

const drop2Min7b5Str4Inv3: VoicingTemplate = {
  name: "Drop 2 min7b5 3rd inv (inner 4)",
  type: "drop2",
  quality: "min7b5",
  relativePositions: [null, 2, 0, 3, 1, null],
  rootString: 2,
  rootFretOffset: 0,
  difficulty: "advanced",
  isBarreChord: false,
  inversion: 3,
  voicingStructure: "drop2",
};

// ============================================
// Exports
// ============================================

export const VOICING_TEMPLATES: VoicingTemplate[] = [
  // Shell — 6th string root
  shellMaj7Str6,
  shellMin7Str6,
  shellDom7Str6,
  shellMin7b5Str6,
  // Shell — 5th string root
  shellMaj7Str5,
  shellMin7Str5,
  shellDom7Str5,
  shellMin7b5Str5,
  // Drop 2 — root position, top 4 strings
  drop2Maj7Str3,
  drop2Min7Str3,
  drop2Dom7Str3,
  drop2Min7b5Str3,
  // Drop 2 — root position, inner 4 strings
  drop2Maj7Str4,
  drop2Min7Str4,
  drop2Dom7Str4,
  drop2Min7b5Str4,
  // Drop 2 — 1st inversion, top 4 strings
  drop2Maj7Str3Inv1,
  drop2Min7Str3Inv1,
  drop2Dom7Str3Inv1,
  drop2Min7b5Str3Inv1,
  // Drop 2 — 1st inversion, inner 4 strings
  drop2Maj7Str4Inv1,
  drop2Min7Str4Inv1,
  drop2Dom7Str4Inv1,
  drop2Min7b5Str4Inv1,
  // Drop 2 — 2nd inversion, top 4 strings
  drop2Maj7Str3Inv2,
  drop2Min7Str3Inv2,
  drop2Dom7Str3Inv2,
  drop2Min7b5Str3Inv2,
  // Drop 2 — 2nd inversion, inner 4 strings
  drop2Maj7Str4Inv2,
  drop2Min7Str4Inv2,
  drop2Dom7Str4Inv2,
  drop2Min7b5Str4Inv2,
  // Drop 2 — 3rd inversion, top 4 strings
  drop2Maj7Str3Inv3,
  drop2Min7Str3Inv3,
  drop2Dom7Str3Inv3,
  drop2Min7b5Str3Inv3,
  // Drop 2 — 3rd inversion, inner 4 strings
  drop2Maj7Str4Inv3,
  drop2Min7Str4Inv3,
  drop2Dom7Str4Inv3,
  drop2Min7b5Str4Inv3,
];

export function getTemplatesForQuality(
  quality: ChordQuality,
): VoicingTemplate[] {
  return VOICING_TEMPLATES.filter((t) =>
    Array.isArray(t.quality)
      ? t.quality.includes(quality)
      : t.quality === quality,
  );
}
