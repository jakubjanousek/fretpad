import type { StyleDefinition } from "@/lib/types";

/**
 * Jazz Swing Natural — sample-based drums with groove templates.
 *
 * Uses groove templates instead of fixed swing ratios for timing.
 * Offsets derived from Friberg & Sundström jazz timing research,
 * with per-beat variation (not uniform swing).
 *
 * Drums use audio samples (brushes kit) for natural sound.
 * Drum patterns include variants for rhythmic variation across bars.
 */
export const jazzSwingNaturalStyle: StyleDefinition = {
  id: "jazzSwingNatural",
  name: "Jazz Swing (Natural)",
  description: "Sample-based drums with groove templates",
  swing: {
    // Swing ratios are ignored when grooveTemplates are present,
    // but kept as fallback values
    bass: 0,
    chord: 0.85,
    drums: 1,
  },
  grooveTemplates: {
    // Bass: lay-back offset (0.015) folded in + slight push on beat 3, lay back on 2 and 4
    bass: {
      name: "Walking Bass",
      subdivisions: 8,
      offsets: [0.015, 0.015, 0.025, 0.015, 0.005, 0.015, 0.03, 0.015],
    },
    // Chords: comping offset (0.02) folded in + upbeats pushed late
    // Reduced swing offsets — comping should sit close to the pocket, not drag behind it
    chord: {
      name: "Jazz Comping",
      subdivisions: 8,
      offsets: [0.02, 0.14, 0.02, 0.11, 0.02, 0.13, 0.02, 0.1],
    },
    // Drums: classic jazz ride feel — skip notes on 1 and 3 swing harder
    drums: {
      name: "Jazz Ride",
      subdivisions: 8,
      offsets: [0, 0.18, 0.01, 0.12, 0, 0.16, 0.01, 0.11],
      velocityShape: [1.0, 0.5, 0.8, 0.45, 0.9, 0.55, 0.8, 0.4],
    },
  },
  timing: {
    instrumentOffsets: {
      // Bass and chord offsets folded into groove templates below
      bass: 0,
      chord: 0,
      drums: 0,
    },
    pocket: {
      weight: 0.6, // Bass and drums share 60% of their timing deviation
    },
    phraseDynamics: {
      phraseLengthBars: 4,
      velocityContour: [0.95, 1.0, 1.05, 0.98],
    },
    humanization: {
      bass: {
        timingBeats: 0.06, // ±30ms at 120bpm — noticeable but musical
        timingDirection: "late", // Bass players tend to lay back
        velocityDelta: 0.12, // Wider dynamic range
        durationBeats: 0.08, // Some notes ring, some are clipped
        correlation: 0.55, // Walking bass has momentum
      },
      chord: {
        timingBeats: 0.05, // ±25ms — tighter, sits closer to the pocket
        timingDirection: "centered", // Pushes and pulls
        velocityDelta: 0.1, // Moderate dynamic contrast
        durationBeats: 0.08, // Staccato vs legato variety
        correlation: 0.35, // Slight drift momentum
      },
      drums: {
        timingBeats: 0.04, // ±20ms — drums are tightest but not robotic
        timingDirection: "centered",
        velocityDelta: 0.1, // Ghost notes vs accents
        durationBeats: 0,
        correlation: 0.4, // Tight mean reversion
      },
    },
  },
  instruments: {
    bass: {
      octave: 2,
      volume: -7,
      oscillatorType: "triangle",
      envelope: {
        attack: 0.015,
        decay: 0.16,
        sustain: 0.35,
        release: 0.24,
      },
    },
    chord: {
      octave: 4,
      volume: -16,
      oscillatorType: "triangle",
      envelope: {
        attack: 0.02,
        decay: 0.28,
        sustain: 0.08,
        release: 0.6,
      },
    },
    drums: {
      type: "sample",
      sampleKit: "brushes",
    },
  },
  patterns: {
    bass: {
      name: "walking",
      events: [
        { time: "0:0", duration: "4n", type: "walk", velocity: 0.92 },
        { time: "0:1", duration: "4n", type: "walk", velocity: 0.76 },
        { time: "0:2", duration: "4n", type: "walk", velocity: 0.7 },
        { time: "0:3", duration: "4n", type: "approach", velocity: 0.82 },
      ],
    },
    chord: {
      name: "comping",
      events: [
        { time: "0:0:2", duration: "8n", voicingType: "shell", velocity: 0.38 },
        { time: "0:2:2", duration: "8n", voicingType: "shell", velocity: 0.42 },
      ],
      variants: [
        // Upbeats of 1 and 3
        [
          {
            time: "0:0:2",
            duration: "8n",
            voicingType: "shell",
            velocity: 0.38,
          },
          {
            time: "0:2:2",
            duration: "8n",
            voicingType: "shell",
            velocity: 0.42,
          },
        ],
        // Upbeat of 2 only — sparse
        [
          {
            time: "0:1:2",
            duration: "8n",
            voicingType: "shell",
            velocity: 0.4,
          },
        ],
        // Beat 2 and upbeat of 3 — Charleston rhythm
        [
          { time: "0:1", duration: "8n", voicingType: "shell", velocity: 0.42 },
          {
            time: "0:2:2",
            duration: "8n",
            voicingType: "shell",
            velocity: 0.36,
          },
        ],
        // Upbeats of 2 and 4 — anticipation
        [
          {
            time: "0:1:2",
            duration: "8n",
            voicingType: "shell",
            velocity: 0.36,
          },
          {
            time: "0:3:2",
            duration: "8n",
            voicingType: "shell",
            velocity: 0.4,
          },
        ],
      ],
    },
    drums: {
      name: "swing-ride",
      // Spang-a-lang: ride on all 4 quarters + skip notes on 2-and and 4-and
      events: [
        { time: "0:0", sound: "ride", velocity: 0.48 },
        { time: "0:1", sound: "ride", velocity: 0.35 },
        { time: "0:1:2", sound: "ride", velocity: 0.2 },
        { time: "0:2", sound: "ride", velocity: 0.42 },
        { time: "0:3", sound: "ride", velocity: 0.35 },
        { time: "0:3:2", sound: "ride", velocity: 0.2 },
        { time: "0:1", sound: "hihat", velocity: 0.25 },
        { time: "0:3", sound: "hihat", velocity: 0.25 },
      ],
      variants: [
        // Variant 0: Full spang-a-lang — skip notes on 2-and and 4-and
        [
          { time: "0:0", sound: "ride", velocity: 0.48 },
          { time: "0:1", sound: "ride", velocity: 0.35 },
          { time: "0:1:2", sound: "ride", velocity: 0.2 },
          { time: "0:2", sound: "ride", velocity: 0.42 },
          { time: "0:3", sound: "ride", velocity: 0.35 },
          { time: "0:3:2", sound: "ride", velocity: 0.2 },
          { time: "0:1", sound: "hihat", velocity: 0.25 },
          { time: "0:3", sound: "hihat", velocity: 0.25 },
        ],
        // Variant 1: Skip note only on 4-and — slightly open
        [
          { time: "0:0", sound: "ride", velocity: 0.48 },
          { time: "0:1", sound: "ride", velocity: 0.35 },
          { time: "0:2", sound: "ride", velocity: 0.42 },
          { time: "0:3", sound: "ride", velocity: 0.35 },
          { time: "0:3:2", sound: "ride", velocity: 0.18 },
          { time: "0:1", sound: "hihat", velocity: 0.25 },
          { time: "0:3", sound: "hihat", velocity: 0.25 },
        ],
        // Variant 2: Skip note only on 2-and + feathered kick on 1
        [
          { time: "0:0", sound: "ride", velocity: 0.48 },
          { time: "0:1", sound: "ride", velocity: 0.35 },
          { time: "0:1:2", sound: "ride", velocity: 0.2 },
          { time: "0:2", sound: "ride", velocity: 0.42 },
          { time: "0:3", sound: "ride", velocity: 0.35 },
          { time: "0:1", sound: "hihat", velocity: 0.25 },
          { time: "0:3", sound: "hihat", velocity: 0.25 },
          { time: "0:0", sound: "kick", velocity: 0.18 },
        ],
        // Variant 3: Both skip notes + feathered kick on 1, soft snare on 4
        [
          { time: "0:0", sound: "ride", velocity: 0.48 },
          { time: "0:1", sound: "ride", velocity: 0.35 },
          { time: "0:1:2", sound: "ride", velocity: 0.2 },
          { time: "0:2", sound: "ride", velocity: 0.42 },
          { time: "0:3", sound: "ride", velocity: 0.35 },
          { time: "0:3:2", sound: "ride", velocity: 0.2 },
          { time: "0:1", sound: "hihat", velocity: 0.25 },
          { time: "0:3", sound: "hihat", velocity: 0.25 },
          { time: "0:0", sound: "kick", velocity: 0.18 },
          { time: "0:3", sound: "snare", velocity: 0.12 },
        ],
      ],
    },
  },
};
