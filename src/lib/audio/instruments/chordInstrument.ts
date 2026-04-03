import * as Tone from "tone";
import type { ChordInstrumentConfig } from "@/lib/types";

export interface ChordInstrument {
  volume: { value: number };
  triggerAttackRelease: (
    notes: string[],
    duration: Tone.Unit.Time,
    time?: Tone.Unit.Time,
    velocity?: number,
  ) => void;
  dispose: () => void;
}

/**
 * Creates a polyphonic synth for chord playback
 */
export function createChordInstrument(
  config: ChordInstrumentConfig,
): ChordInstrument {
  const polySynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: config.oscillatorType,
    },
    envelope: {
      attack: config.envelope.attack,
      decay: config.envelope.decay,
      sustain: config.envelope.sustain,
      release: config.envelope.release,
    },
  });
  const tone = new Tone.Filter(2400, "lowpass");
  const compressor = new Tone.Compressor(-28, 2);
  const reverb = new Tone.Reverb({
    decay: 1.2,
    wet: 0.16,
    preDelay: 0.01,
  });
  const chorus = new Tone.Chorus({
    frequency: 0.8,
    delayTime: 2.5,
    depth: 0.15,
    wet: 0.08,
  }).start();

  polySynth.chain(tone, chorus, compressor, reverb, Tone.Destination);

  polySynth.volume.value = config.volume;

  return {
    volume: polySynth.volume,
    triggerAttackRelease: (notes, duration, time, velocity) => {
      polySynth.triggerAttackRelease(notes, duration, time, velocity);
    },
    dispose: () => {
      polySynth.dispose();
      tone.dispose();
      compressor.dispose();
      reverb.dispose();
      chorus.dispose();
    },
  };
}

/**
 * Default chord configuration for a soft piano-like sound
 */
export const defaultChordConfig: ChordInstrumentConfig = {
  octave: 3,
  volume: -12,
  oscillatorType: "triangle",
  envelope: {
    attack: 0.02,
    decay: 0.3,
    sustain: 0.2,
    release: 0.5,
  },
};
