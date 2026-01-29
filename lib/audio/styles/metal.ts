import type { StyleDefinition } from "@/lib/types";

/**
 * Metal style with power-chord chugs and aggressive double-kick drumming
 *
 * Bass pattern: Tight root-driven 8th-note chugging, locked to the kick drum
 * Chord pattern: Heavy power-chord chugs with palm-mute staccato feel
 */
export const metalStyle: StyleDefinition = {
  id: "metal",
  name: "Metal",
  description: "Power-chord chugs with double kick",
  swing: 0, // Straight, tight feel
  instruments: {
    bass: {
      octave: 2,
      volume: -5,
      oscillatorType: "square",
      envelope: {
        attack: 0.005,
        decay: 0.06,
        sustain: 0.3,
        release: 0.1,
      },
    },
    chord: {
      octave: 3, // Lower octave for heavy power chords
      volume: -10,
      oscillatorType: "triangle",
      envelope: {
        attack: 0.005,
        decay: 0.06,
        sustain: 0.15,
        release: 0.1,
      },
    },
  },
  patterns: {
    bass: {
      name: "chug",
      events: [
        // Aggressive 8th-note chugging pattern
        {
          time: "0:0",
          duration: "8n",
          degree: 1,
          type: "root",
          velocity: 0.95,
        },
        {
          time: "0:0:2",
          duration: "8n",
          degree: 1,
          type: "root",
          velocity: 0.7,
        },
        {
          time: "0:1",
          duration: "8n",
          degree: 1,
          type: "root",
          velocity: 0.85,
        },
        {
          time: "0:1:2",
          duration: "8n",
          degree: 1,
          type: "root",
          velocity: 0.65,
        },
        { time: "0:2", duration: "8n", degree: 1, type: "root", velocity: 0.9 },
        {
          time: "0:2:2",
          duration: "8n",
          degree: 5,
          type: "fifth",
          velocity: 0.7,
        },
        {
          time: "0:3",
          duration: "8n",
          degree: 1,
          type: "root",
          velocity: 0.85,
        },
        {
          time: "0:3:2",
          duration: "8n",
          degree: 1,
          type: "root",
          velocity: 0.65,
        },
      ],
    },
    chord: {
      name: "power-chug",
      events: [
        // Heavy staccato power chord hits — palm muted chugging
        { time: "0:0", duration: "16n", voicingType: "triad", velocity: 0.8 },
        { time: "0:0:2", duration: "16n", voicingType: "triad", velocity: 0.5 },
        { time: "0:1", duration: "16n", voicingType: "triad", velocity: 0.7 },
        {
          time: "0:1:2",
          duration: "16n",
          voicingType: "triad",
          velocity: 0.45,
        },
        { time: "0:2", duration: "16n", voicingType: "triad", velocity: 0.75 },
        { time: "0:2:2", duration: "16n", voicingType: "triad", velocity: 0.5 },
        { time: "0:3", duration: "16n", voicingType: "triad", velocity: 0.7 },
        {
          time: "0:3:2",
          duration: "16n",
          voicingType: "triad",
          velocity: 0.45,
        },
      ],
    },
    drums: {
      name: "metal-double-kick",
      events: [
        // Double kick pattern: 8th notes on kick
        { time: "0:0", sound: "kick", velocity: 0.9 },
        { time: "0:0:2", sound: "kick", velocity: 0.7 },
        { time: "0:1", sound: "kick", velocity: 0.85 },
        { time: "0:1:2", sound: "kick", velocity: 0.7 },
        { time: "0:2", sound: "kick", velocity: 0.9 },
        { time: "0:2:2", sound: "kick", velocity: 0.7 },
        { time: "0:3", sound: "kick", velocity: 0.85 },
        { time: "0:3:2", sound: "kick", velocity: 0.7 },
        // Snare: hard hits on 2 and 4
        { time: "0:1", sound: "snare", velocity: 0.9 },
        { time: "0:3", sound: "snare", velocity: 0.9 },
        // Hihats / crash: open hihat on downbeats for aggression
        { time: "0:0", sound: "hihatOpen", velocity: 0.6 },
        { time: "0:1", sound: "hihat", velocity: 0.55 },
        { time: "0:2", sound: "hihatOpen", velocity: 0.55 },
        { time: "0:3", sound: "hihat", velocity: 0.55 },
      ],
    },
  },
};
