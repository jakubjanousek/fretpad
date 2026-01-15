import * as Tone from "tone";
import type { BassInstrumentConfig } from "@/lib/types";

/**
 * Creates a bass synth instrument based on the provided configuration
 */
export function createBassInstrument(config: BassInstrumentConfig): Tone.Synth {
  const synth = new Tone.Synth({
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

  synth.volume.value = config.volume;

  return synth;
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
