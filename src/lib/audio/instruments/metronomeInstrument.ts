import * as Tone from "tone";

export interface MetronomeInstrument {
  click: Tone.Synth;
  accent: Tone.Synth;
  setVolume: (volume: number) => void;
  dispose: () => void;
}

/**
 * Creates a metronome instrument with regular click and accented click sounds.
 * Uses short, percussive sine waves for clean metronome clicks.
 */
export function createMetronomeInstrument(volume: number): MetronomeInstrument {
  // Regular click - higher pitch, shorter
  const click = new Tone.Synth({
    oscillator: {
      type: "sine",
    },
    envelope: {
      attack: 0.001,
      decay: 0.05,
      sustain: 0,
      release: 0.01,
    },
  }).toDestination();

  // Accent click - slightly lower pitch, slightly louder
  const accent = new Tone.Synth({
    oscillator: {
      type: "sine",
    },
    envelope: {
      attack: 0.001,
      decay: 0.08,
      sustain: 0,
      release: 0.01,
    },
  }).toDestination();

  click.volume.value = volume;
  accent.volume.value = volume + 3; // Accent is slightly louder

  return {
    click,
    accent,
    setVolume: (newVolume: number) => {
      click.volume.value = newVolume;
      accent.volume.value = newVolume + 3;
    },
    dispose: () => {
      click.dispose();
      accent.dispose();
    },
  };
}

/** Default metronome click pitch (woodblock-like) */
export const METRONOME_CLICK_NOTE = "G5";

/** Default metronome accent pitch (slightly lower) */
export const METRONOME_ACCENT_NOTE = "G4";
