import type { StyleDefinition } from "@/lib/types";

/**
 * Neo-Soul style with warm sustained bass and lush Rhodes-like chord voicings
 *
 * Bass pattern: Laid-back root-fifth movement with chromatic passing tones
 * Chord pattern: Warm, sustained full voicings with gentle rhythmic movement
 */
export const neoSoulStyle: StyleDefinition = {
  id: "neoSoul",
  name: "Neo-Soul",
  description: "Warm bass with lush chord voicings",
  swing: 0.3, // Slight swing / laid-back feel
  instruments: {
    bass: {
      octave: 2,
      volume: -8,
      oscillatorType: "sine",
      envelope: {
        attack: 0.05,
        decay: 0.15,
        sustain: 0.5,
        release: 0.5,
      },
    },
    chord: {
      octave: 4,
      volume: -16,
      oscillatorType: "sine",
      envelope: {
        attack: 0.04,
        decay: 0.3,
        sustain: 0.4,
        release: 0.6,
      },
    },
  },
  patterns: {
    bass: {
      name: "neo-soul-bass",
      events: [
        // Beat 1: Root (sustained)
        {
          time: "0:0",
          duration: "4n.",
          degree: 1,
          type: "root",
          velocity: 0.8,
        },
        // Beat 2-and: Chromatic approach / third
        {
          time: "0:1:2",
          duration: "8n",
          degree: 3,
          type: "chord",
          velocity: 0.55,
        },
        // Beat 3: Fifth (sustained)
        {
          time: "0:2",
          duration: "4n",
          degree: 5,
          type: "fifth",
          velocity: 0.7,
        },
        // Beat 4: Root octave down feel
        { time: "0:3", duration: "4n", degree: 1, type: "root", velocity: 0.6 },
      ],
    },
    chord: {
      name: "lush-pads",
      events: [
        // Sustained, gentle chord movement — Rhodes-like voicings
        { time: "0:0", duration: "4n.", voicingType: "full", velocity: 0.4 },
        { time: "0:1:2", duration: "8n", voicingType: "shell", velocity: 0.3 },
        { time: "0:2", duration: "4n", voicingType: "full", velocity: 0.38 },
        { time: "0:3", duration: "8n", voicingType: "shell", velocity: 0.3 },
        { time: "0:3:2", duration: "8n", voicingType: "full", velocity: 0.35 },
      ],
    },
    drums: {
      name: "neo-soul-groove",
      events: [
        // Laid-back kick
        { time: "0:0", sound: "kick", velocity: 0.7 },
        { time: "0:1:2", sound: "kick", velocity: 0.45 },
        { time: "0:2", sound: "kick", velocity: 0.6 },
        // Snare: ghost-heavy with accent on 2 and 4
        { time: "0:1", sound: "snare", velocity: 0.65 },
        { time: "0:2:2", sound: "snare", velocity: 0.2 },
        { time: "0:3", sound: "snare", velocity: 0.65 },
        // Hihats: mix of closed and open for texture
        { time: "0:0", sound: "hihat", velocity: 0.45 },
        { time: "0:0:2", sound: "hihat", velocity: 0.25 },
        { time: "0:1", sound: "hihat", velocity: 0.4 },
        { time: "0:1:2", sound: "hihatOpen", velocity: 0.3 },
        { time: "0:2", sound: "hihat", velocity: 0.45 },
        { time: "0:2:2", sound: "hihat", velocity: 0.25 },
        { time: "0:3", sound: "hihat", velocity: 0.4 },
        { time: "0:3:2", sound: "hihatOpen", velocity: 0.3 },
      ],
    },
  },
};
