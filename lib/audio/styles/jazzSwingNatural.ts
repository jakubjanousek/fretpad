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
    // Bass: not dead-straight — slight push on beat 3, lay back on 2 and 4
    bass: {
      name: "Walking Bass",
      subdivisions: 8,
      offsets: [0, 0, 0.01, 0, -0.01, 0, 0.015, 0],
    },
    // Chords: upbeats pushed late with non-uniform feel per beat
    // Beat 1 upbeat swings hardest, beat 4 upbeat least
    chord: {
      name: "Jazz Comping",
      subdivisions: 8,
      offsets: [0, 0.17, 0, 0.13, 0, 0.15, 0, 0.1],
      velocityShape: [1.0, 0.7, 0.85, 0.65, 1.0, 0.75, 0.85, 0.6],
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
      bass: 0.015, // Bass lays back slightly behind the beat
      chord: 0.02, // Comping further behind — relaxed feel
      drums: 0, // Drums are the time reference
    },
    humanization: {
      bass: {
        timingBeats: 0.06, // ±30ms at 120bpm — noticeable but musical
        timingDirection: "late", // Bass players tend to lay back
        velocityDelta: 0.12, // Wider dynamic range
        durationBeats: 0.08, // Some notes ring, some are clipped
      },
      chord: {
        timingBeats: 0.08, // ±40ms — comping is intentionally loose
        timingDirection: "centered", // Pushes and pulls
        velocityDelta: 0.15, // Big dynamic contrast in comping
        durationBeats: 0.1, // Staccato vs legato variety
      },
      drums: {
        timingBeats: 0.04, // ±20ms — drums are tightest but not robotic
        timingDirection: "centered",
        velocityDelta: 0.1, // Ghost notes vs accents
        durationBeats: 0,
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
      name: "swing-ride-minimal",
      // Default: ride on 1 and 3 with one skip note, hi-hat on 2 and 4
      events: [
        { time: "0:0", sound: "ride", velocity: 0.48 },
        { time: "0:2", sound: "ride", velocity: 0.42 },
        { time: "0:0:2", sound: "ride", velocity: 0.2 },
        { time: "0:1", sound: "hihat", velocity: 0.25 },
        { time: "0:3", sound: "hihat", velocity: 0.25 },
      ],
      variants: [
        // Variant 0: Ride on 1 and 3, skip note on 1
        [
          { time: "0:0", sound: "ride", velocity: 0.48 },
          { time: "0:2", sound: "ride", velocity: 0.42 },
          { time: "0:0:2", sound: "ride", velocity: 0.2 },
          { time: "0:1", sound: "hihat", velocity: 0.25 },
          { time: "0:3", sound: "hihat", velocity: 0.25 },
        ],
        // Variant 1: Just quarters on 1 and 3, no skip — very open
        [
          { time: "0:0", sound: "ride", velocity: 0.45 },
          { time: "0:2", sound: "ride", velocity: 0.4 },
          { time: "0:1", sound: "hihat", velocity: 0.22 },
          { time: "0:3", sound: "hihat", velocity: 0.22 },
        ],
        // Variant 2: All four quarters, skip on 3 — slightly fuller
        [
          { time: "0:0", sound: "ride", velocity: 0.48 },
          { time: "0:1", sound: "ride", velocity: 0.32 },
          { time: "0:2", sound: "ride", velocity: 0.42 },
          { time: "0:3", sound: "ride", velocity: 0.32 },
          { time: "0:2:2", sound: "ride", velocity: 0.18 },
          { time: "0:1", sound: "hihat", velocity: 0.25 },
          { time: "0:3", sound: "hihat", velocity: 0.25 },
        ],
        // Variant 3: Ride on 1 and 3, feathered kick on 1, soft snare on 4
        [
          { time: "0:0", sound: "ride", velocity: 0.48 },
          { time: "0:2", sound: "ride", velocity: 0.42 },
          { time: "0:2:2", sound: "ride", velocity: 0.18 },
          { time: "0:1", sound: "hihat", velocity: 0.25 },
          { time: "0:3", sound: "hihat", velocity: 0.25 },
          { time: "0:0", sound: "kick", velocity: 0.2 },
          { time: "0:3", sound: "snare", velocity: 0.14 },
        ],
      ],
    },
  },
};
