import type { StyleDefinition } from "@/lib/types";

/**
 * Pop/Rock style with steady bass and chord hits on downbeats
 *
 * Bass pattern: Root-Root-5th-5th in 8th notes
 * Chord pattern: Quarter note chord hits on each beat
 */
export const popRockStyle: StyleDefinition = {
  id: "popRock",
  name: "Pop/Rock",
  description: "Steady bass with chord hits",
  swing: 0, // Straight feel
  instruments: {
    bass: {
      octave: 2,
      volume: -8,
      oscillatorType: "triangle",
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.2,
      },
    },
    chord: {
      octave: 4,
      volume: -12,
      oscillatorType: "sine",
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.3,
        release: 0.3,
      },
    },
  },
  patterns: {
    bass: {
      name: "steady",
      events: [
        // 8th notes: Root-Root-5th-5th pattern per 2 beats
        { time: "0:0", duration: "8n", degree: 1, type: "root", velocity: 0.9 },
        {
          time: "0:0:2",
          duration: "8n",
          degree: 1,
          type: "root",
          velocity: 0.6,
        },
        {
          time: "0:1",
          duration: "8n",
          degree: 5,
          type: "fifth",
          velocity: 0.7,
        },
        {
          time: "0:1:2",
          duration: "8n",
          degree: 5,
          type: "fifth",
          velocity: 0.5,
        },
        { time: "0:2", duration: "8n", degree: 1, type: "root", velocity: 0.8 },
        {
          time: "0:2:2",
          duration: "8n",
          degree: 1,
          type: "root",
          velocity: 0.5,
        },
        {
          time: "0:3",
          duration: "8n",
          degree: 5,
          type: "fifth",
          velocity: 0.7,
        },
        {
          time: "0:3:2",
          duration: "8n",
          degree: 5,
          type: "fifth",
          velocity: 0.5,
        },
      ],
    },
    chord: {
      name: "downbeats",
      events: [
        // Chord hits on beats 1 and 3 (stronger), 2 and 4 (lighter)
        { time: "0:0", duration: "8n", voicingType: "triad", velocity: 0.7 },
        { time: "0:1", duration: "8n", voicingType: "triad", velocity: 0.4 },
        { time: "0:2", duration: "8n", voicingType: "triad", velocity: 0.6 },
        { time: "0:3", duration: "8n", voicingType: "triad", velocity: 0.4 },
      ],
    },
  },
};
