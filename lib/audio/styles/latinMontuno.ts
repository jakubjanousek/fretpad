import type { StyleDefinition } from "@/lib/types";

/**
 * Latin Montuno style with tumbao bass and montuno piano pattern
 *
 * Bass pattern: Classic tumbao — anticipated bass hits (plays on "and" of beat 4 before resolving)
 * Chord pattern: Montuno guajeo — syncopated repeated pattern typical of salsa/son
 */
export const latinMontunoStyle: StyleDefinition = {
  id: "latinMontuno",
  name: "Latin Montuno",
  description: "Tumbao bass with montuno piano pattern",
  swing: 0, // Straight feel (Latin music uses straight 8ths)
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
        decay: 0.15,
        sustain: 0.15,
        release: 0.3,
      },
    },
  },
  patterns: {
    bass: {
      name: "tumbao",
      events: [
        // Classic tumbao pattern: anticipated rhythm
        // Beat 1: Rest (or tie from previous bar)
        // Beat 2-and: Root hit (anticipation)
        {
          time: "0:1:2",
          duration: "4n",
          degree: 1,
          type: "root",
          velocity: 0.85,
        },
        // Beat 3-and: Fifth
        {
          time: "0:2:2",
          duration: "8n",
          degree: 5,
          type: "fifth",
          velocity: 0.7,
        },
        // Beat 4: Root
        {
          time: "0:3",
          duration: "8n",
          degree: 1,
          type: "root",
          velocity: 0.75,
        },
        // Beat 4-and: Anticipated next bar root
        { time: "0:3:2", duration: "8n", type: "approach", velocity: 0.8 },
      ],
    },
    chord: {
      name: "montuno",
      events: [
        // Montuno guajeo pattern — syncopated repeated figure
        { time: "0:0", duration: "8n", voicingType: "shell", velocity: 0.5 },
        { time: "0:0:2", duration: "8n", voicingType: "triad", velocity: 0.45 },
        { time: "0:1:2", duration: "8n", voicingType: "shell", velocity: 0.55 },
        { time: "0:2", duration: "8n", voicingType: "triad", velocity: 0.5 },
        { time: "0:2:2", duration: "8n", voicingType: "shell", velocity: 0.45 },
        { time: "0:3:2", duration: "8n", voicingType: "triad", velocity: 0.55 },
      ],
    },
    drums: {
      name: "latin-clave",
      events: [
        // Kick: tumbao-aligned
        { time: "0:0", sound: "kick", velocity: 0.7 },
        { time: "0:1:2", sound: "kick", velocity: 0.65 },
        { time: "0:3", sound: "kick", velocity: 0.6 },
        // Snare: clave-inspired pattern (3-2 son clave feel)
        { time: "0:0", sound: "snare", velocity: 0.5 },
        { time: "0:1:2", sound: "snare", velocity: 0.6 },
        { time: "0:2:2", sound: "snare", velocity: 0.55 },
        // Hihats: steady 8ths as shaker
        { time: "0:0", sound: "hihat", velocity: 0.45 },
        { time: "0:0:2", sound: "hihat", velocity: 0.35 },
        { time: "0:1", sound: "hihat", velocity: 0.45 },
        { time: "0:1:2", sound: "hihat", velocity: 0.35 },
        { time: "0:2", sound: "hihat", velocity: 0.45 },
        { time: "0:2:2", sound: "hihat", velocity: 0.35 },
        { time: "0:3", sound: "hihat", velocity: 0.45 },
        { time: "0:3:2", sound: "hihat", velocity: 0.35 },
      ],
    },
  },
};
