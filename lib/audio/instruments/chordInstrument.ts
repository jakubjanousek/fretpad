import * as Tone from "tone";
import type { ChordInstrumentConfig } from "@/lib/types";

/**
 * Creates a polyphonic synth for chord playback
 */
export function createChordInstrument(
  config: ChordInstrumentConfig,
): Tone.PolySynth {
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
  }).toDestination();

  polySynth.volume.value = config.volume;

  return polySynth;
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
