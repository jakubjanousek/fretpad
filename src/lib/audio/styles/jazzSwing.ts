import type { StyleDefinition } from "@/lib/types";

/**
 * Jazz Swing style with walking bass, syncopated piano comping, and ride cymbal.
 *
 * Swing is applied per-instrument in the scheduler with tempo-adaptive ratios.
 * Patterns are written on a straight grid; upbeat 8ths get shifted automatically.
 *
 * Bass: Walking quarter notes (straight, no swing)
 * Drums: Ride cymbal pattern with skip notes, hi-hat chick on 2 & 4, soft kick on 1
 * Comping: Slot-aware rootless voicings that state each harmony early
 */
export const jazzSwingStyle: StyleDefinition = {
  id: "jazzSwing",
  name: "Jazz Swing",
  description: "Walking bass with piano comping",
  swing: {
    bass: 0,
    chord: 1,
    drums: 1,
  },
  timing: {
    instrumentOffsets: {
      bass: 0.012, // Bass lays back a touch
      chord: 0.055,
      drums: 0,
    },
    pocket: {
      weight: 0.6,
    },
    phraseDynamics: {
      phraseLengthBars: 4,
      velocityContour: [0.95, 1.0, 1.05, 0.98],
    },
    humanization: {
      bass: {
        timingBeats: 0.05,
        timingDirection: "late",
        velocityDelta: 0.1,
        durationBeats: 0.06,
        correlation: 0.55,
      },
      chord: {
        timingBeats: 0.05,
        timingDirection: "centered",
        velocityDelta: 0.1,
        durationBeats: 0.08,
        correlation: 0.35,
      },
      drums: {
        timingBeats: 0.03,
        timingDirection: "centered",
        velocityDelta: 0.08,
        durationBeats: 0,
        correlation: 0.4,
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
        {
          time: "0:0",
          duration: "8n",
          voicingType: "rootless",
          velocity: 0.34,
        },
        {
          time: "0:1:2",
          duration: "8n",
          voicingType: "rootless",
          velocity: 0.28,
        },
        {
          time: "0:3",
          duration: "8n",
          voicingType: "rootless",
          velocity: 0.32,
        },
      ],
      variants: [
        // Beat 1, upbeat of 2, beat 4
        [
          {
            time: "0:0",
            duration: "8n",
            voicingType: "rootless",
            velocity: 0.34,
          },
          {
            time: "0:1:2",
            duration: "8n",
            voicingType: "rootless",
            velocity: 0.28,
          },
          {
            time: "0:3",
            duration: "8n",
            voicingType: "rootless",
            velocity: 0.32,
          },
        ],
        // Upbeat of 1, beat 3, upbeat of 4
        [
          {
            time: "0:0:2",
            duration: "8n",
            voicingType: "rootless",
            velocity: 0.28,
          },
          {
            time: "0:2",
            duration: "8n",
            voicingType: "rootless",
            velocity: 0.34,
          },
          {
            time: "0:3:2",
            duration: "8n",
            voicingType: "rootless",
            velocity: 0.26,
          },
        ],
        // Beat 1 with a late two-beat answer
        [
          {
            time: "0:0",
            duration: "8n",
            voicingType: "rootless",
            velocity: 0.34,
          },
          {
            time: "0:2:2",
            duration: "8n",
            voicingType: "rootless",
            velocity: 0.3,
          },
        ],
        // Upbeat pickup with beat-2 answer
        [
          {
            time: "0:0:2",
            duration: "8n",
            voicingType: "rootless",
            velocity: 0.28,
          },
          {
            time: "0:1",
            duration: "8n",
            voicingType: "rootless",
            velocity: 0.33,
          },
          {
            time: "0:3",
            duration: "8n",
            voicingType: "rootless",
            velocity: 0.3,
          },
        ],
      ],
      slotVariants: [
        {
          slotBeats: 2,
          events: [
            {
              time: "0:0",
              duration: "8n",
              voicingType: "rootless",
              velocity: 0.32,
            },
            {
              time: "0:1:2",
              duration: "8n",
              voicingType: "rootless",
              velocity: 0.24,
            },
          ],
          variants: [
            // Beat 1 with an upbeat release
            [
              {
                time: "0:0",
                duration: "8n",
                voicingType: "rootless",
                velocity: 0.32,
              },
              {
                time: "0:1:2",
                duration: "8n",
                voicingType: "rootless",
                velocity: 0.24,
              },
            ],
            // Upbeat pickup, but still inside the first beat
            [
              {
                time: "0:0:2",
                duration: "8n",
                voicingType: "rootless",
                velocity: 0.26,
              },
              {
                time: "0:1",
                duration: "8n",
                voicingType: "rootless",
                velocity: 0.3,
              },
            ],
            // Short two-hit answer
            [
              {
                time: "0:0",
                duration: "8n",
                voicingType: "rootless",
                velocity: 0.32,
              },
              {
                time: "0:1",
                duration: "8n",
                voicingType: "rootless",
                velocity: 0.28,
              },
            ],
            // Single clear statement for dense progressions
            [
              {
                time: "0:0:2",
                duration: "8n",
                voicingType: "rootless",
                velocity: 0.26,
              },
            ],
          ],
        },
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
        // Hi-hat pedal "chick" on 2 and 4
        { time: "0:1", sound: "hihat", velocity: 0.28 },
        { time: "0:3", sound: "hihat", velocity: 0.28 },
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
          { time: "0:1", sound: "hihat", velocity: 0.28 },
          { time: "0:3", sound: "hihat", velocity: 0.28 },
        ],
        // Variant 1: Skip note only on 4-and — slightly open
        [
          { time: "0:0", sound: "ride", velocity: 0.48 },
          { time: "0:1", sound: "ride", velocity: 0.35 },
          { time: "0:2", sound: "ride", velocity: 0.42 },
          { time: "0:3", sound: "ride", velocity: 0.35 },
          { time: "0:3:2", sound: "ride", velocity: 0.18 },
          { time: "0:1", sound: "hihat", velocity: 0.28 },
          { time: "0:3", sound: "hihat", velocity: 0.28 },
        ],
        // Variant 2: Skip note only on 2-and + feathered kick on 1
        [
          { time: "0:0", sound: "ride", velocity: 0.48 },
          { time: "0:1", sound: "ride", velocity: 0.35 },
          { time: "0:1:2", sound: "ride", velocity: 0.2 },
          { time: "0:2", sound: "ride", velocity: 0.42 },
          { time: "0:3", sound: "ride", velocity: 0.35 },
          { time: "0:1", sound: "hihat", velocity: 0.28 },
          { time: "0:3", sound: "hihat", velocity: 0.28 },
          { time: "0:0", sound: "kick", velocity: 0.18 },
        ],
        // Variant 3: Both skip notes + soft snare on 4
        [
          { time: "0:0", sound: "ride", velocity: 0.48 },
          { time: "0:1", sound: "ride", velocity: 0.35 },
          { time: "0:1:2", sound: "ride", velocity: 0.2 },
          { time: "0:2", sound: "ride", velocity: 0.42 },
          { time: "0:3", sound: "ride", velocity: 0.35 },
          { time: "0:3:2", sound: "ride", velocity: 0.2 },
          { time: "0:1", sound: "hihat", velocity: 0.28 },
          { time: "0:3", sound: "hihat", velocity: 0.28 },
          { time: "0:3", sound: "snare", velocity: 0.12 },
        ],
      ],
    },
  },
};
