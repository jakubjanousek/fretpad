import type { StyleDefinition } from "@/lib/types";

/**
 * Funk style with syncopated slap bass and scratchy chord stabs
 *
 * Bass pattern: Syncopated 16th-note-feel root-octave hits with ghost notes
 * Chord pattern: Choppy off-beat stabs (classic funk guitar scratches)
 */
export const funkStyle: StyleDefinition = {
  id: "funk",
  name: "Funk",
  description: "Syncopated bass with scratchy chord stabs",
  swing: 0, // Straight 16th feel
  instruments: {
    bass: {
      octave: 2,
      volume: -6,
      oscillatorType: "triangle",
      envelope: {
        attack: 0.005,
        decay: 0.08,
        sustain: 0.3,
        release: 0.15,
      },
    },
    chord: {
      octave: 4,
      volume: -12,
      oscillatorType: "triangle",
      envelope: {
        attack: 0.005,
        decay: 0.08,
        sustain: 0.05,
        release: 0.15,
      },
    },
  },
  patterns: {
    bass: {
      name: "slap-funk",
      events: [
        // Beat 1: Strong root
        {
          time: "0:0",
          duration: "8n",
          degree: 1,
          type: "root",
          velocity: 0.95,
        },
        // Beat 1 "e" (16th): Ghost octave
        {
          time: "0:0:1",
          duration: "16n",
          degree: 1,
          type: "root",
          velocity: 0.4,
        },
        // Beat 2 "and": Syncopated fifth
        {
          time: "0:1:2",
          duration: "16n",
          degree: 5,
          type: "fifth",
          velocity: 0.75,
        },
        // Beat 3: Root
        {
          time: "0:2",
          duration: "8n",
          degree: 1,
          type: "root",
          velocity: 0.85,
        },
        // Beat 3 "a" (last 16th): Ghost approach
        {
          time: "0:2:3",
          duration: "16n",
          degree: 5,
          type: "fifth",
          velocity: 0.4,
        },
        // Beat 4 "and": Syncopated hit
        {
          time: "0:3:2",
          duration: "16n",
          degree: 3,
          type: "chord",
          velocity: 0.7,
        },
      ],
    },
    chord: {
      name: "choppy-stabs",
      events: [
        // Off-beat scratchy stabs — classic funk guitar pattern
        { time: "0:0:2", duration: "16n", voicingType: "triad", velocity: 0.6 },
        { time: "0:1", duration: "16n", voicingType: "triad", velocity: 0.55 },
        {
          time: "0:1:2",
          duration: "16n",
          voicingType: "triad",
          velocity: 0.65,
        },
        { time: "0:2:2", duration: "16n", voicingType: "triad", velocity: 0.6 },
        { time: "0:3", duration: "16n", voicingType: "triad", velocity: 0.5 },
        {
          time: "0:3:2",
          duration: "16n",
          voicingType: "triad",
          velocity: 0.65,
        },
      ],
    },
    drums: {
      name: "funk-groove",
      events: [
        // Kick: syncopated pattern
        { time: "0:0", sound: "kick", velocity: 0.9 },
        { time: "0:1:2", sound: "kick", velocity: 0.6 },
        { time: "0:2", sound: "kick", velocity: 0.75 },
        { time: "0:3:2", sound: "kick", velocity: 0.55 },
        // Snare: 2 and 4
        { time: "0:1", sound: "snare", velocity: 0.8 },
        { time: "0:3", sound: "snare", velocity: 0.8 },
        // Hihats: tight 16th-note feel
        { time: "0:0", sound: "hihat", velocity: 0.6 },
        { time: "0:0:2", sound: "hihat", velocity: 0.3 },
        { time: "0:1", sound: "hihat", velocity: 0.5 },
        { time: "0:1:2", sound: "hihat", velocity: 0.3 },
        { time: "0:2", sound: "hihat", velocity: 0.6 },
        { time: "0:2:2", sound: "hihat", velocity: 0.3 },
        { time: "0:3", sound: "hihat", velocity: 0.5 },
        { time: "0:3:2", sound: "hihat", velocity: 0.3 },
        // Open hihat accent
        { time: "0:1:2", sound: "hihatOpen", velocity: 0.4 },
      ],
    },
  },
};
