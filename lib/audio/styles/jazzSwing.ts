import type { StyleDefinition } from "@/lib/types";

/**
 * Jazz Swing style with walking bass and syncopated piano comping
 *
 * Bass pattern: Root-led walking line with deterministic connectors
 * Chord pattern: Rotating comping cells with shell/rootless contrast
 */
export const jazzSwingStyle: StyleDefinition = {
  id: "jazzSwing",
  name: "Jazz Swing",
  description: "Walking bass with piano comping",
  swing: 0,
  timing: {
    useTransportSwing: false,
    instrumentOffsets: {
      bass: 0.01,
      chord: 0.03,
      drums: 0,
    },
    humanization: {
      bass: {
        timingBeats: 0.006,
        timingDirection: "late",
        velocityDelta: 0.05,
        durationBeats: 0.04,
      },
      chord: {
        timingBeats: 0.012,
        timingDirection: "late",
        velocityDelta: 0.08,
        durationBeats: 0.08,
      },
      drums: {
        timingBeats: 0.002,
        timingDirection: "late",
        velocityDelta: 0.05,
      },
    },
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
        {
          time: "0:1",
          duration: "4n",
          type: "walk",
          velocity: 0.76,
        },
        {
          time: "0:2",
          duration: "4n",
          type: "walk",
          velocity: 0.7,
        },
        {
          time: "0:3",
          duration: "4n",
          type: "approach",
          velocity: 0.82,
          offsetBeats: -0.03,
        },
      ],
    },
    chord: {
      name: "comping",
      events: [
        {
          time: "0:0",
          duration: "8n",
          voicingType: "shell",
          velocity: 0.36,
          offsetBeats: 2 / 3,
        },
        {
          time: "0:1",
          duration: "8n",
          voicingType: "shell",
          velocity: 0.48,
          offsetBeats: 0.56,
        },
        {
          time: "0:3",
          duration: "8n",
          voicingType: "shell",
          velocity: 0.42,
          offsetBeats: -0.08,
        },
      ],
      variants: [
        [
          {
            time: "0:0",
            duration: "8n",
            voicingType: "shell",
            velocity: 0.36,
            offsetBeats: 2 / 3,
          },
          {
            time: "0:1",
            duration: "8n",
            voicingType: "rootless",
            velocity: 0.5,
            offsetBeats: 0.56,
          },
          {
            time: "0:3",
            duration: "8n",
            voicingType: "shell",
            velocity: 0.42,
            offsetBeats: -0.08,
          },
        ],
        [
          {
            time: "0:1",
            duration: "8n",
            voicingType: "shell",
            velocity: 0.38,
            offsetBeats: 0.62,
          },
          {
            time: "0:2",
            duration: "8n",
            voicingType: "rootless",
            velocity: 0.34,
            offsetBeats: 2 / 3,
          },
        ],
        [
          {
            time: "0:0",
            duration: "8n",
            voicingType: "rootless",
            velocity: 0.32,
            offsetBeats: 2 / 3,
          },
          {
            time: "0:2",
            duration: "8n",
            voicingType: "shell",
            velocity: 0.44,
            offsetBeats: 2 / 3,
          },
          {
            time: "0:3",
            duration: "8n",
            voicingType: "rootless",
            velocity: 0.28,
            offsetBeats: 0.12,
          },
        ],
        [
          {
            time: "0:1",
            duration: "8n",
            voicingType: "rootless",
            velocity: 0.46,
            offsetBeats: 0.58,
          },
          {
            time: "0:3",
            duration: "8n",
            voicingType: "shell",
            velocity: 0.4,
            offsetBeats: 0.05,
          },
        ],
      ],
    },
    drums: {
      name: "swing-ride",
      events: [
        { time: "0:0", sound: "hihat", velocity: 0.62 },
        { time: "0:0", sound: "hihat", velocity: 0.34, offsetBeats: 2 / 3 },
        { time: "0:1", sound: "hihat", velocity: 0.48 },
        { time: "0:2", sound: "hihat", velocity: 0.56 },
        { time: "0:2", sound: "hihat", velocity: 0.32, offsetBeats: 2 / 3 },
        { time: "0:3", sound: "hihat", velocity: 0.46 },
        { time: "0:0", sound: "kick", velocity: 0.58 },
        { time: "0:2", sound: "kick", velocity: 0.28, offsetBeats: 0.08 },
        { time: "0:1", sound: "snare", velocity: 0.16, offsetBeats: 0.58 },
        { time: "0:3", sound: "snare", velocity: 0.22, offsetBeats: 0.05 },
      ],
    },
  },
};
