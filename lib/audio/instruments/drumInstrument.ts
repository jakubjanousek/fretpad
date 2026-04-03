import * as Tone from "tone";
import type { DrumSound } from "@/lib/types";

export interface DrumInstrument {
  trigger: (sound: DrumSound, time: number, velocity: number) => void;
  setVolume: (volume: number) => void;
  dispose: () => void;
}

/**
 * Creates a synthesized drum kit instrument using Tone.js synths.
 * Cymbals use filtered noise (not MetalSynth) for a soft, non-metallic sound.
 */
export function createDrumInstrument(volume: number): DrumInstrument {
  const drumBus = new Tone.Gain();
  const highCut = new Tone.Filter(5000, "lowpass");
  const room = new Tone.Reverb({
    decay: 0.9,
    wet: 0.15,
    preDelay: 0.01,
  });
  const compressor = new Tone.Compressor(-24, 4);

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

  // Closed hihat: bandpass-filtered noise, very short — a soft "tik"
  const hihatFilter = new Tone.Filter(8000, "bandpass", -12);
  const hihat = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.04,
      sustain: 0,
      release: 0.01,
    },
  });
  hihat.chain(hihatFilter, drumBus);

  // Open hihat: wider bandpass, longer decay — a soft "tssh"
  const hihatOpenFilter = new Tone.Filter(7000, "bandpass", -12);
  const hihatOpen = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.14,
      sustain: 0,
      release: 0.04,
    },
  });
  hihatOpen.chain(hihatOpenFilter, drumBus);

  // Ride cymbal: highpass-filtered noise, longer sustain — a soft wash
  const rideFilter = new Tone.Filter(6000, "highpass", -24);
  const ride = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: {
      attack: 0.002,
      decay: 0.35,
      sustain: 0,
      release: 0.08,
    },
  });
  ride.chain(rideFilter, drumBus);

  // Set initial volumes — drums sit behind bass and chords in the mix
  kick.volume.value = volume - 6;
  snareNoise.volume.value = volume - 8;
  snareBody.volume.value = volume - 10;
  hihat.volume.value = volume - 10;
  hihatOpen.volume.value = volume - 8;
  ride.volume.value = volume - 6;

  return {
    trigger: (sound: DrumSound, time: number, velocity: number) => {
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
          hihat.triggerAttackRelease("32n", safeTime, velocity);
          break;
        case "hihatOpen":
          hihatOpen.triggerAttackRelease("8n", safeTime, velocity);
          break;
        case "ride":
          ride.triggerAttackRelease("8n", safeTime, velocity);
          break;
      }
    },
    setVolume: (newVolume: number) => {
      kick.volume.value = newVolume - 6;
      snareNoise.volume.value = newVolume - 8;
      snareBody.volume.value = newVolume - 10;
      hihat.volume.value = newVolume - 10;
      hihatOpen.volume.value = newVolume - 8;
      ride.volume.value = newVolume - 6;
    },
    dispose: () => {
      kick.dispose();
      snareNoise.dispose();
      snareBody.dispose();
      hihat.dispose();
      hihatFilter.dispose();
      hihatOpen.dispose();
      hihatOpenFilter.dispose();
      ride.dispose();
      rideFilter.dispose();
      drumBus.dispose();
      highCut.dispose();
      room.dispose();
      compressor.dispose();
    },
  };
}
