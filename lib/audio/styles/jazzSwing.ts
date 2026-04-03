import type { StyleDefinition } from "@/lib/types";

/**
 * Jazz Swing style with walking bass, syncopated piano comping, and ride cymbal.
 *
 * Swing feel is created by placing upbeat events at the triplet position
 * (offsetBeats: 2/3) rather than the straight 8th (0.5). This is explicit
 * and doesn't depend on Tone.js transport swing.
 *
 * Bass: Walking quarter notes (straight, on the beat)
 * Drums: Ride pattern with triplet skip notes, hi-hat on 2 & 4
 * Comping: Sparse hits on swung upbeats
 */
export const jazzSwingStyle: StyleDefinition = {
  id: "jazzSwing",
  name: "Jazz Swing",
  description: "Walking bass with piano comping",
  swing: 0,
  timing: {
    useTransportSwing: false,
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
      // Swung upbeats of 1 and 3 — consistent every bar
      events: [
        {
          time: "0:0",
          duration: "8n",
          voicingType: "shell",
          velocity: 0.38,
          offsetBeats: 2 / 3,
        },
        {
          time: "0:2",
          duration: "8n",
          voicingType: "shell",
          velocity: 0.42,
          offsetBeats: 2 / 3,
        },
      ],
    },
    drums: {
      name: "swing-ride",
      events: [
        // Ride cymbal: quarter note on every beat
        { time: "0:0", sound: "hihat", velocity: 0.6 },
        { time: "0:1", sound: "hihat", velocity: 0.5 },
        { time: "0:2", sound: "hihat", velocity: 0.58 },
        { time: "0:3", sound: "hihat", velocity: 0.5 },
        // Ride "skip" notes at triplet position on every beat (consistent swing)
        { time: "0:0", sound: "hihat", velocity: 0.3, offsetBeats: 2 / 3 },
        { time: "0:1", sound: "hihat", velocity: 0.26, offsetBeats: 2 / 3 },
        { time: "0:2", sound: "hihat", velocity: 0.3, offsetBeats: 2 / 3 },
        { time: "0:3", sound: "hihat", velocity: 0.26, offsetBeats: 2 / 3 },

        // Hi-hat pedal "chick" on 2 and 4
        { time: "0:1", sound: "hihat", velocity: 0.22 },
        { time: "0:3", sound: "hihat", velocity: 0.22 },
      ],
    },
  },
};
