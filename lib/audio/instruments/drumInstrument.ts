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
  const drumBus = new Tone.Gain();
  const highCut = new Tone.Filter(7200, "lowpass");
  const room = new Tone.Reverb({
    decay: 0.9,
    wet: 0.12,
    preDelay: 0.01,
  });
  const compressor = new Tone.Compressor(-20, 3);

  drumBus.chain(highCut, compressor, room, Tone.Destination);

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
  }).connect(drumBus);

  // Snare drum: noise + triangle oscillator
  const snareNoise = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0,
      release: 0.05,
    },
  }).connect(drumBus);

  const snareBody = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      release: 0.05,
    },
  }).connect(drumBus);

  // Closed hihat: filtered noise, very short
  const hihat = new Tone.MetalSynth({
    envelope: {
      attack: 0.001,
      decay: 0.12,
      release: 0.04,
    },
    harmonicity: 3.6,
    modulationIndex: 18,
    resonance: 2200,
    octaves: 1.2,
  }).connect(drumBus);

  // Open hihat: filtered noise, longer decay
  const hihatOpen = new Tone.MetalSynth({
    envelope: {
      attack: 0.001,
      decay: 0.28,
      release: 0.08,
    },
    harmonicity: 4.2,
    modulationIndex: 22,
    resonance: 2800,
    octaves: 1.3,
  }).connect(drumBus);

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
      drumBus.dispose();
      highCut.dispose();
      room.dispose();
      compressor.dispose();
    },
  };
}
