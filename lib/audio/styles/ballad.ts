import type { StyleDefinition } from "@/lib/types";

/**
 * Ballad style with slow arpeggiated chords and sustained bass
 *
 * Bass pattern: Long sustained notes, mainly root and fifth
 * Chord pattern: Gentle broken chord arpeggios
 */
export const balladStyle: StyleDefinition = {
  id: "ballad",
  name: "Ballad",
  description: "Arpeggiated chords with sustained bass",
  swing: 0, // Straight feel
  instruments: {
    bass: {
      octave: 2,
      volume: -10,
      oscillatorType: "sine",
      envelope: {
        attack: 0.08,
        decay: 0.2,
        sustain: 0.6,
        release: 0.8,
      },
    },
    chord: {
      octave: 4,
      volume: -18,
      oscillatorType: "sine",
      envelope: {
        attack: 0.05,
        decay: 0.4,
        sustain: 0.3,
        release: 0.7,
      },
    },
  },
  patterns: {
    bass: {
      name: "sustained",
      events: [
        // Beat 1: Sustained root (held for 2 beats)
        { time: "0:0", duration: "2n", degree: 1, type: "root", velocity: 0.7 },
        // Beat 3: Fifth (held for 2 beats)
        {
          time: "0:2",
          duration: "2n",
          degree: 5,
          type: "fifth",
          velocity: 0.55,
        },
      ],
    },
    chord: {
      name: "arpeggiated",
      events: [
        // Gentle arpeggiated pattern spreading across the bar
        // Beat 1: Soft chord hit
        { time: "0:0", duration: "4n", voicingType: "triad", velocity: 0.4 },
        // Beat 2: Shell voicing (lighter)
        { time: "0:1", duration: "4n", voicingType: "shell", velocity: 0.3 },
        // Beat 2-and: Soft touch
        { time: "0:1:2", duration: "8n", voicingType: "triad", velocity: 0.25 },
        // Beat 3: Chord rebuild
        { time: "0:2", duration: "4n", voicingType: "triad", velocity: 0.35 },
        // Beat 4: Shell voicing
        { time: "0:3", duration: "4n", voicingType: "shell", velocity: 0.3 },
        // Beat 4-and: Trailing touch
        { time: "0:3:2", duration: "8n", voicingType: "triad", velocity: 0.25 },
      ],
    },
  },
};
