import type { StyleDefinition } from "@/lib/types";

/**
 * Bossa Nova style with syncopated bass and fingerpicked guitar feel
 *
 * Bass pattern: Classic bossa bass with root on 1, fifth on 2-and
 * Chord pattern: Soft arpeggiated off-beat fingerpicking
 */
export const bossaNovaStyle: StyleDefinition = {
  id: "bossaNova",
  name: "Bossa Nova",
  description: "Syncopated bass with fingerpicked chords",
  swing: 0, // Straight feel (bossa is played with straight 8ths)
  instruments: {
    bass: {
      octave: 2,
      volume: -8,
      oscillatorType: "triangle",
      envelope: {
        attack: 0.03,
        decay: 0.15,
        sustain: 0.3,
        release: 0.4,
      },
    },
    chord: {
      octave: 4,
      volume: -16,
      oscillatorType: "sine",
      envelope: {
        attack: 0.02,
        decay: 0.3,
        sustain: 0.2,
        release: 0.5,
      },
    },
  },
  patterns: {
    bass: {
      name: "bossa",
      events: [
        // Classic bossa bass pattern
        // Beat 1: Root
        {
          time: "0:0",
          duration: "4n.",
          degree: 1,
          type: "root",
          velocity: 0.8,
        },
        // Beat 2-and: Fifth (the signature syncopation)
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
          duration: "4n.",
          degree: 1,
          type: "root",
          velocity: 0.7,
        },
        // Beat 4-and: Fifth
        {
          time: "0:3:2",
          duration: "8n",
          degree: 5,
          type: "fifth",
          velocity: 0.55,
        },
      ],
    },
    chord: {
      name: "fingerpicked",
      events: [
        // Light fingerpicked pattern - soft arpeggiations
        // Beat 1-and: Soft chord
        { time: "0:0:2", duration: "8n", voicingType: "triad", velocity: 0.35 },
        // Beat 2: Light hit
        { time: "0:1", duration: "8n", voicingType: "shell", velocity: 0.4 },
        // Beat 3-and: Soft chord
        { time: "0:2:2", duration: "8n", voicingType: "triad", velocity: 0.35 },
        // Beat 4: Light hit
        { time: "0:3", duration: "8n", voicingType: "shell", velocity: 0.4 },
      ],
    },
    drums: {
      name: "bossa-brushes",
      events: [
        // Bossa nova: cross-stick on 2, light kick pattern, soft shaker-like hihats
        { time: "0:0", sound: "kick", velocity: 0.5 },
        { time: "0:2", sound: "kick", velocity: 0.35 },
        // Cross-stick style snare on beat 2 and ghost on 4-and
        { time: "0:1", sound: "snare", velocity: 0.3 },
        { time: "0:3:2", sound: "snare", velocity: 0.2 },
        // Soft shaker-like hihats on 8ths
        { time: "0:0", sound: "hihat", velocity: 0.3 },
        { time: "0:0:2", sound: "hihat", velocity: 0.2 },
        { time: "0:1", sound: "hihat", velocity: 0.3 },
        { time: "0:1:2", sound: "hihat", velocity: 0.2 },
        { time: "0:2", sound: "hihat", velocity: 0.3 },
        { time: "0:2:2", sound: "hihat", velocity: 0.2 },
        { time: "0:3", sound: "hihat", velocity: 0.3 },
        { time: "0:3:2", sound: "hihat", velocity: 0.2 },
      ],
    },
  },
};
