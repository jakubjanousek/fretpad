import * as Tone from "tone";
import type { BassInstrumentConfig } from "@/lib/types";

export interface BassInstrument {
  volume: { value: number };
  triggerAttackRelease: (
    note: string,
    duration: Tone.Unit.Time,
    time?: Tone.Unit.Time,
    velocity?: number,
  ) => void;
  dispose: () => void;
}

/**
 * Creates a bass synth instrument based on the provided configuration
 */
export function createBassInstrument(
  config: BassInstrumentConfig,
): BassInstrument {
  const synth = new Tone.MonoSynth({
    oscillator: {
      type: config.oscillatorType,
    },
    envelope: {
      attack: config.envelope.attack,
      decay: config.envelope.decay,
      sustain: config.envelope.sustain,
      release: config.envelope.release,
    },
    filter: {
      Q: 1.5,
      type: "lowpass",
      rolloff: -24,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.18,
      sustain: 0.4,
      release: 0.25,
      baseFrequency: 110,
      octaves: 2.4,
    },
  });
  const tone = new Tone.Filter(700, "lowpass");
  const saturation = new Tone.Distortion(0.08);
  const compressor = new Tone.Compressor(-24, 3);

  synth.chain(tone, saturation, compressor, Tone.Destination);

  synth.volume.value = config.volume;

  return {
    volume: synth.volume,
    triggerAttackRelease: (note, duration, time, velocity) => {
      synth.triggerAttackRelease(note, duration, time, velocity);
    },
    dispose: () => {
      synth.dispose();
      tone.dispose();
      saturation.dispose();
      compressor.dispose();
    },
  };
}

/**
 * Default bass configuration for a warm, round bass sound
 */
export const defaultBassConfig: BassInstrumentConfig = {
  octave: 2,
  volume: -8,
  oscillatorType: "triangle",
  envelope: {
    attack: 0.02,
    decay: 0.1,
    sustain: 0.4,
    release: 0.3,
  },
};
