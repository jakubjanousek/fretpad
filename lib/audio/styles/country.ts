import type { StyleDefinition } from "@/lib/types";

/**
 * Country style with boom-chick bass pattern and bright chord strums
 *
 * Bass pattern: Classic boom-chick — root on beats 1 & 3, fifth on beats 2 & 4
 * Chord pattern: Bright strums on beats 2 and 4 (chicken pickin' feel)
 */
export const countryStyle: StyleDefinition = {
  id: "country",
  name: "Country",
  description: "Boom-chick bass with bright strums",
  swing: 0, // Straight feel
  instruments: {
    bass: {
      octave: 2,
      volume: -7,
      oscillatorType: "triangle",
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.4,
        release: 0.25,
      },
    },
    chord: {
      octave: 4,
      volume: -11,
      oscillatorType: "triangle",
      envelope: {
        attack: 0.008,
        decay: 0.12,
        sustain: 0.2,
        release: 0.25,
      },
    },
  },
  patterns: {
    bass: {
      name: "boom-chick",
      events: [
        // Beat 1: Root "boom"
        { time: "0:0", duration: "4n", degree: 1, type: "root", velocity: 0.9 },
        // Beat 2: Fifth "chick"
        {
          time: "0:1",
          duration: "4n",
          degree: 5,
          type: "fifth",
          velocity: 0.65,
        },
        // Beat 3: Root
        { time: "0:2", duration: "4n", degree: 1, type: "root", velocity: 0.8 },
        // Beat 4: Fifth
        {
          time: "0:3",
          duration: "4n",
          degree: 5,
          type: "fifth",
          velocity: 0.6,
        },
      ],
    },
    chord: {
      name: "country-strum",
      events: [
        // Strums on beats 2 and 4 (backbeat), with a lighter hit on beat 3-and
        { time: "0:1", duration: "8n", voicingType: "full", velocity: 0.65 },
        { time: "0:2:2", duration: "8n", voicingType: "triad", velocity: 0.35 },
        { time: "0:3", duration: "8n", voicingType: "full", velocity: 0.6 },
      ],
    },
    drums: {
      name: "train-beat",
      events: [
        // Kick on 1 and 3
        { time: "0:0", sound: "kick", velocity: 0.8 },
        { time: "0:2", sound: "kick", velocity: 0.7 },
        // Snare on 2 and 4
        { time: "0:1", sound: "snare", velocity: 0.75 },
        { time: "0:3", sound: "snare", velocity: 0.75 },
        // Hihats: steady 8ths with slight accent on downbeats
        { time: "0:0", sound: "hihat", velocity: 0.55 },
        { time: "0:0:2", sound: "hihat", velocity: 0.35 },
        { time: "0:1", sound: "hihat", velocity: 0.5 },
        { time: "0:1:2", sound: "hihat", velocity: 0.35 },
        { time: "0:2", sound: "hihat", velocity: 0.55 },
        { time: "0:2:2", sound: "hihat", velocity: 0.35 },
        { time: "0:3", sound: "hihat", velocity: 0.5 },
        { time: "0:3:2", sound: "hihat", velocity: 0.35 },
      ],
    },
  },
};
