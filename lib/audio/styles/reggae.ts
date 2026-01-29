import type { StyleDefinition } from "@/lib/types";

/**
 * Reggae style with one-drop rhythm and off-beat chord skank
 *
 * Bass pattern: Root-heavy with melodic movement on beat 3
 * Chord pattern: Classic off-beat "skank" on the and of every beat
 */
export const reggaeStyle: StyleDefinition = {
  id: "reggae",
  name: "Reggae",
  description: "One-drop rhythm with off-beat skank",
  swing: 0, // Straight feel
  instruments: {
    bass: {
      octave: 2,
      volume: -6,
      oscillatorType: "triangle",
      envelope: {
        attack: 0.03,
        decay: 0.15,
        sustain: 0.5,
        release: 0.4,
      },
    },
    chord: {
      octave: 4,
      volume: -14,
      oscillatorType: "triangle",
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.05,
        release: 0.2,
      },
    },
  },
  patterns: {
    bass: {
      name: "reggae-bass",
      events: [
        // Beat 1: Root (long)
        {
          time: "0:0",
          duration: "4n.",
          degree: 1,
          type: "root",
          velocity: 0.85,
        },
        // Beat 2-and: Fifth pickup
        {
          time: "0:1:2",
          duration: "8n",
          degree: 5,
          type: "fifth",
          velocity: 0.6,
        },
        // Beat 3: Root
        {
          time: "0:2",
          duration: "4n",
          degree: 1,
          type: "root",
          velocity: 0.75,
        },
        // Beat 4: Approach
        { time: "0:3", duration: "4n", type: "approach", velocity: 0.65 },
      ],
    },
    chord: {
      name: "skank",
      events: [
        // Classic off-beat "skank" — short staccato hits on the "and" of each beat
        {
          time: "0:0:2",
          duration: "16n",
          voicingType: "triad",
          velocity: 0.55,
        },
        { time: "0:1:2", duration: "16n", voicingType: "triad", velocity: 0.6 },
        {
          time: "0:2:2",
          duration: "16n",
          voicingType: "triad",
          velocity: 0.55,
        },
        { time: "0:3:2", duration: "16n", voicingType: "triad", velocity: 0.6 },
      ],
    },
    drums: {
      name: "one-drop",
      events: [
        // One-drop: kick + snare together on beat 3 (no kick on beat 1)
        { time: "0:2", sound: "kick", velocity: 0.8 },
        { time: "0:2", sound: "snare", velocity: 0.75 },
        // Cross-stick on beat 4 (ghost)
        { time: "0:3", sound: "snare", velocity: 0.3 },
        // Hihats: off-beat pattern matching the skank
        { time: "0:0", sound: "hihat", velocity: 0.4 },
        { time: "0:0:2", sound: "hihat", velocity: 0.55 },
        { time: "0:1", sound: "hihat", velocity: 0.35 },
        { time: "0:1:2", sound: "hihat", velocity: 0.55 },
        { time: "0:2", sound: "hihat", velocity: 0.4 },
        { time: "0:2:2", sound: "hihat", velocity: 0.55 },
        { time: "0:3", sound: "hihat", velocity: 0.35 },
        { time: "0:3:2", sound: "hihat", velocity: 0.55 },
      ],
    },
  },
};
