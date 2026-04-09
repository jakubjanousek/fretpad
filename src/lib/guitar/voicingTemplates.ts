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
// Drop 3 voicings — strings 6-4-3-2 (skip A)
// Root position: 3-R-5-7 (or b3/b5/b7 variants)
// ============================================

const drop3Maj7: VoicingTemplate = {
  name: "Drop 3 maj7 (6-4-3-2)",
  type: "drop3",
  quality: "maj7",
  relativePositions: [null, 2, 2, 0, null, 2],
  rootString: 3,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "drop3",
};

const drop3Min7: VoicingTemplate = {
  name: "Drop 3 min7 (6-4-3-2)",
  type: "drop3",
  quality: "min7",
  relativePositions: [null, 1, 2, 0, null, 1],
  rootString: 3,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "drop3",
};

const drop3Dom7: VoicingTemplate = {
  name: "Drop 3 dom7 (6-4-3-2)",
  type: "drop3",
  quality: "7",
  relativePositions: [null, 1, 2, 0, null, 2],
  rootString: 3,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "drop3",
};

const drop3Min7b5: VoicingTemplate = {
  name: "Drop 3 min7b5 (6-4-3-2)",
  type: "drop3",
  quality: "min7b5",
  relativePositions: [null, 1, 1, 0, null, 1],
  rootString: 3,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "drop3",
};

// ============================================
// dim7 voicings
// ============================================

const shellDim7Str6: VoicingTemplate = {
  name: "Shell R-bb7-b3 dim7 (6th string)",
  type: "shell",
  quality: "dim7",
  relativePositions: [null, null, 0, -1, null, 0],
  rootString: 5,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

const shellDim7Str5: VoicingTemplate = {
  name: "Shell R-b3-bb7 dim7 (5th string)",
  type: "shell",
  quality: "dim7",
  relativePositions: [null, null, -1, -2, 0, null],
  rootString: 4,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

const drop2Dim7Str3: VoicingTemplate = {
  name: "Drop 2 dim7 (top 4)",
  type: "drop2",
  quality: "dim7",
  relativePositions: [0, -1, 0, -1, null, null],
  rootString: 2,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "drop2",
};

const drop2Dim7Str4: VoicingTemplate = {
  name: "Drop 2 dim7 (inner 4)",
  type: "drop2",
  quality: "dim7",
  relativePositions: [null, 0, -2, 0, -1, null],
  rootString: 3,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "drop2",
};

// ============================================
// 6 chord voicings
// ============================================

const shell6Str6: VoicingTemplate = {
  name: "Shell R-6-3 (6th string)",
  type: "shell",
  quality: "6",
  relativePositions: [null, null, 1, -1, null, 0],
  rootString: 5,
  rootFretOffset: 0,
  difficulty: "beginner",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

const shell6Str5: VoicingTemplate = {
  name: "Shell R-3-6 (5th string)",
  type: "shell",
  quality: "6",
  relativePositions: [null, null, -1, -1, 0, null],
  rootString: 4,
  rootFretOffset: 0,
  difficulty: "beginner",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

const drop2Chord6Str3: VoicingTemplate = {
  name: "Drop 2 6 (top 4)",
  type: "drop2",
  quality: "6",
  relativePositions: [0, 0, 0, 0, null, null],
  rootString: 2,
  rootFretOffset: 0,
  difficulty: "beginner",
  isBarreChord: true,
  inversion: 0,
  voicingStructure: "drop2",
};

const drop2Chord6Str4: VoicingTemplate = {
  name: "Drop 2 6 (inner 4)",
  type: "drop2",
  quality: "6",
  relativePositions: [null, 0, -1, 0, 0, null],
  rootString: 3,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "drop2",
};

// ============================================
// min6 chord voicings
// ============================================

const shellMin6Str6: VoicingTemplate = {
  name: "Shell R-6-b3 min6 (6th string)",
  type: "shell",
  quality: "min6",
  relativePositions: [null, null, 0, -1, null, 0],
  rootString: 5,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

const shellMin6Str5: VoicingTemplate = {
  name: "Shell R-b3-6 min6 (5th string)",
  type: "shell",
  quality: "min6",
  relativePositions: [null, null, -1, -2, 0, null],
  rootString: 4,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

const drop2Min6Str3: VoicingTemplate = {
  name: "Drop 2 min6 (top 4)",
  type: "drop2",
  quality: "min6",
  relativePositions: [0, -1, 0, 0, null, null],
  rootString: 2,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "drop2",
};

const drop2Min6Str4: VoicingTemplate = {
  name: "Drop 2 min6 (inner 4)",
  type: "drop2",
  quality: "min6",
  relativePositions: [null, 0, -2, 0, 0, null],
  rootString: 3,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "drop2",
};

// ============================================
// 9 chord voicings (dominant 9th, drop the 5th)
// ============================================

const shell9Str6: VoicingTemplate = {
  name: "Shell R-b7-9 (6th string)",
  type: "shell",
  quality: "9",
  relativePositions: [null, null, -1, 0, null, 0],
  rootString: 5,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

const voicing9Str5: VoicingTemplate = {
  name: "R-3-b7-9 (5th string)",
  type: "shell",
  quality: "9",
  relativePositions: [null, 0, 0, -1, 0, null],
  rootString: 4,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

// ============================================
// dim triad voicing
// ============================================

const triadDimTop3: VoicingTemplate = {
  name: "Close triad dim (top 3)",
  type: "triadic",
  quality: "dim",
  relativePositions: [-3, -1, 0, null, null, null],
  rootString: 2,
  rootFretOffset: 0,
  difficulty: "intermediate",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

// ============================================
// Barre chords — E-form (6th string root)
// ============================================

const barreMajStr6: VoicingTemplate = {
  name: "E-form barre major (6th string)",
  type: "barre",
  quality: "maj",
  relativePositions: [0, 0, 1, 2, 2, 0],
  rootString: 5,
  rootFretOffset: 0,
  difficulty: "beginner",
  isBarreChord: true,
  inversion: 0,
  voicingStructure: "close",
};

const barreMinStr6: VoicingTemplate = {
  name: "E-form barre minor (6th string)",
  type: "barre",
  quality: "min",
  relativePositions: [0, 0, 0, 2, 2, 0],
  rootString: 5,
  rootFretOffset: 0,
  difficulty: "beginner",
  isBarreChord: true,
  inversion: 0,
  voicingStructure: "close",
};

// ============================================
// Barre chords — A-form (5th string root)
// ============================================

const barreMajStr5: VoicingTemplate = {
  name: "A-form barre major (5th string)",
  type: "barre",
  quality: "maj",
  relativePositions: [0, 2, 2, 2, 0, null],
  rootString: 4,
  rootFretOffset: 0,
  difficulty: "beginner",
  isBarreChord: true,
  inversion: 0,
  voicingStructure: "close",
};

const barreMinStr5: VoicingTemplate = {
  name: "A-form barre minor (5th string)",
  type: "barre",
  quality: "min",
  relativePositions: [0, 1, 2, 2, 0, null],
  rootString: 4,
  rootFretOffset: 0,
  difficulty: "beginner",
  isBarreChord: true,
  inversion: 0,
  voicingStructure: "close",
};

// ============================================
// Close triads — top 3 strings (highE, B, G)
// ============================================

const triadMajTop3: VoicingTemplate = {
  name: "Close triad major (top 3)",
  type: "triadic",
  quality: "maj",
  relativePositions: [-2, 0, 0, null, null, null],
  rootString: 2,
  rootFretOffset: 0,
  difficulty: "beginner",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
};

const triadMinTop3: VoicingTemplate = {
  name: "Close triad minor (top 3)",
  type: "triadic",
  quality: "min",
  relativePositions: [-2, -1, 0, null, null, null],
  rootString: 2,
  rootFretOffset: 0,
  difficulty: "beginner",
  isBarreChord: false,
  inversion: 0,
  voicingStructure: "close",
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
  // dim7
  shellDim7Str6,
  shellDim7Str5,
  drop2Dim7Str3,
  drop2Dim7Str4,
  // 6 chords
  shell6Str6,
  shell6Str5,
  drop2Chord6Str3,
  drop2Chord6Str4,
  // min6
  shellMin6Str6,
  shellMin6Str5,
  drop2Min6Str3,
  drop2Min6Str4,
  // 9 chords
  shell9Str6,
  voicing9Str5,
  // dim triad
  triadDimTop3,
  // Drop 3 — strings 6-4-3-2
  drop3Maj7,
  drop3Min7,
  drop3Dom7,
  drop3Min7b5,
  // Barre chords — E-form (6th string)
  barreMajStr6,
  barreMinStr6,
  // Barre chords — A-form (5th string)
  barreMajStr5,
  barreMinStr5,
  // Close triads — top 3 strings
  triadMajTop3,
  triadMinTop3,
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
