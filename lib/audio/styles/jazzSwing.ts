import type { StyleDefinition } from "@/lib/types";

/**
 * Jazz Swing style with walking bass, syncopated piano comping, and ride cymbal.
 *
 * Swing is applied per-instrument in the scheduler with tempo-adaptive ratios.
 * Patterns are written on a straight grid; upbeat 8ths get shifted automatically.
 *
 * Bass: Walking quarter notes (straight, no swing)
 * Drums: Ride cymbal pattern with skip notes, hi-hat chick on 2 & 4, soft kick on 1
 * Comping: Sparse shell voicings on swung upbeats with rhythmic variants
 */
export const jazzSwingStyle: StyleDefinition = {
  id: "jazzSwing",
  name: "Jazz Swing",
  description: "Walking bass with piano comping",
  swing: {
    bass: 0,
    chord: 0.85,
    drums: 1,
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
      // Default: upbeats of 1 and 3
      events: [
        { time: "0:0:2", duration: "8n", voicingType: "shell", velocity: 0.38 },
        { time: "0:2:2", duration: "8n", voicingType: "shell", velocity: 0.42 },
      ],
      // Variants cycle per bar/chord for rhythmic variety
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
      events: [
        // Ride cymbal: quarter notes on every beat
        { time: "0:0", sound: "ride", velocity: 0.55 },
        { time: "0:1", sound: "ride", velocity: 0.42 },
        { time: "0:2", sound: "ride", velocity: 0.5 },
        { time: "0:3", sound: "ride", velocity: 0.42 },
        // Ride skip notes on upbeats (swung by scheduler)
        { time: "0:0:2", sound: "ride", velocity: 0.28 },
        { time: "0:1:2", sound: "ride", velocity: 0.22 },
        { time: "0:2:2", sound: "ride", velocity: 0.28 },
        { time: "0:3:2", sound: "ride", velocity: 0.22 },

        // Hi-hat pedal "chick" on 2 and 4
        { time: "0:1", sound: "hihat", velocity: 0.3 },
        { time: "0:3", sound: "hihat", velocity: 0.3 },

        // Soft kick on beat 1
        { time: "0:0", sound: "kick", velocity: 0.35 },
      ],
    },
  },
};
