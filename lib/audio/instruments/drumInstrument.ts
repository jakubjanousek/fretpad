import * as Tone from "tone";
import type { DrumSound } from "@/lib/types";

export interface DrumInstrument {
  trigger: (sound: DrumSound, time: number, velocity: number) => void;
  setVolume: (volume: number) => void;
  dispose: () => void;
}

/**
 * Creates a synthesized drum kit instrument using Tone.js synths.
 * Uses noise + oscillator combinations to approximate kick, snare, and hihat.
 */
export function createDrumInstrument(volume: number): DrumInstrument {
  // Kick drum: low sine wave with fast pitch envelope
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0,
      release: 0.1,
    },
  }).toDestination();

  // Snare drum: noise + triangle oscillator
  const snareNoise = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0,
      release: 0.05,
    },
  }).toDestination();

  const snareBody = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      release: 0.05,
    },
  }).toDestination();

  // Closed hihat: filtered noise, very short
  const hihat = new Tone.MetalSynth({
    envelope: {
      attack: 0.001,
      decay: 0.05,
      release: 0.01,
    },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  }).toDestination();

  // Open hihat: filtered noise, longer decay
  const hihatOpen = new Tone.MetalSynth({
    envelope: {
      attack: 0.001,
      decay: 0.2,
      release: 0.05,
    },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  }).toDestination();

  // Set initial volumes
  kick.volume.value = volume;
  snareNoise.volume.value = volume - 4;
  snareBody.volume.value = volume - 6;
  hihat.volume.value = volume - 10;
  hihatOpen.volume.value = volume - 8;

  return {
    trigger: (sound: DrumSound, time: number, velocity: number) => {
      // Guard against stale times that have already passed in the audio context
      const safeTime = Math.max(time, Tone.now());
      switch (sound) {
        case "kick":
          kick.triggerAttackRelease("C1", "8n", safeTime, velocity);
          break;
        case "snare":
          snareNoise.triggerAttackRelease("16n", safeTime, velocity * 0.7);
          snareBody.triggerAttackRelease("E3", "16n", safeTime, velocity * 0.5);
          break;
        case "hihat":
          hihat.triggerAttackRelease("16n", safeTime, velocity * 0.5);
          break;
        case "hihatOpen":
          hihatOpen.triggerAttackRelease("8n", safeTime, velocity * 0.5);
          break;
      }
    },
    setVolume: (newVolume: number) => {
      kick.volume.value = newVolume;
      snareNoise.volume.value = newVolume - 4;
      snareBody.volume.value = newVolume - 6;
      hihat.volume.value = newVolume - 10;
      hihatOpen.volume.value = newVolume - 8;
    },
    dispose: () => {
      kick.dispose();
      snareNoise.dispose();
      snareBody.dispose();
      hihat.dispose();
      hihatOpen.dispose();
    },
  };
}
