import type { StyleDefinition } from "@/lib/types";

/**
 * Jazz Swing style with walking bass and syncopated piano comping
 *
 * Bass pattern: Root (1) - 3rd (2) - 5th (3) - Approach to next root (4)
 * Chord pattern: Off-beat hits on beat 2-and and beat 4
 */
export const jazzSwingStyle: StyleDefinition = {
  id: "jazzSwing",
  name: "Jazz Swing",
  description: "Walking bass with piano comping",
  swing: 0.5, // Medium swing feel
  instruments: {
    bass: {
      octave: 2,
      volume: -6,
      oscillatorType: "triangle",
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.4,
        release: 0.3,
      },
    },
    chord: {
      octave: 4,
      volume: -14,
      oscillatorType: "triangle",
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.1,
        release: 0.4,
      },
    },
  },
  patterns: {
    bass: {
      name: "walking",
      events: [
        // Beat 1: Root
        { time: "0:0", duration: "4n", degree: 1, type: "root", velocity: 0.9 },
        // Beat 2: 3rd
        {
          time: "0:1",
          duration: "4n",
          degree: 3,
          type: "chord",
          velocity: 0.7,
        },
        // Beat 3: 5th
        {
          time: "0:2",
          duration: "4n",
          degree: 5,
          type: "chord",
          velocity: 0.7,
        },
        // Beat 4: Approach note to next chord
        { time: "0:3", duration: "4n", type: "approach", velocity: 0.8 },
      ],
    },
    chord: {
      name: "comping",
      events: [
        // Beat 2-and: Shell voicing
        { time: "0:1:2", duration: "8n", voicingType: "shell", velocity: 0.5 },
        // Beat 4: Shell voicing
        { time: "0:3", duration: "8n", voicingType: "shell", velocity: 0.45 },
      ],
    },
    drums: {
      name: "swing-ride",
      events: [
        // Ride cymbal pattern (swung) - hihat on every beat with swing feel
        { time: "0:0", sound: "hihat", velocity: 0.6 },
        { time: "0:0:2", sound: "hihat", velocity: 0.35 },
        { time: "0:1", sound: "hihat", velocity: 0.5 },
        { time: "0:1:2", sound: "hihat", velocity: 0.35 },
        { time: "0:2", sound: "hihat", velocity: 0.55 },
        { time: "0:2:2", sound: "hihat", velocity: 0.35 },
        { time: "0:3", sound: "hihat", velocity: 0.5 },
        { time: "0:3:2", sound: "hihat", velocity: 0.35 },
        // Kick on 1
        { time: "0:0", sound: "kick", velocity: 0.6 },
        // Light kick on 3
        { time: "0:2", sound: "kick", velocity: 0.35 },
        // Snare cross-stick on 4 (ghost)
        { time: "0:3", sound: "snare", velocity: 0.25 },
      ],
    },
  },
};
