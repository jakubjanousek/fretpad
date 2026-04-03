import * as Tone from "tone";
import type { DrumSound } from "@/lib/types";
import type { DrumInstrument } from "./drumInstrument";

interface VelocityLayer {
  player: Tone.Player;
  maxVelocity: number;
}

type SampleMap = Record<DrumSound, Array<{ url: string; maxVelocity: number }>>;

/** Per-sound volume offsets in dB (relative to master), matching synth drum balance */
const SOUND_VOLUME_OFFSETS: Record<DrumSound, number> = {
  kick: -8,
  snare: -10,
  hihat: -12,
  hihatOpen: -10,
  ride: -8,
};

const BRUSH_SAMPLES: SampleMap = {
  kick: [
    { url: "/samples/drums/brushes/kick-soft.mp3", maxVelocity: 0.6 },
    { url: "/samples/drums/brushes/kick-hard.mp3", maxVelocity: 1.0 },
  ],
  snare: [
    { url: "/samples/drums/brushes/snare-soft.mp3", maxVelocity: 0.6 },
    { url: "/samples/drums/brushes/snare-hard.mp3", maxVelocity: 1.0 },
  ],
  hihat: [
    { url: "/samples/drums/brushes/hihat-soft.mp3", maxVelocity: 0.6 },
    { url: "/samples/drums/brushes/hihat-hard.mp3", maxVelocity: 1.0 },
  ],
  hihatOpen: [
    { url: "/samples/drums/brushes/hihat-open-soft.mp3", maxVelocity: 0.6 },
    { url: "/samples/drums/brushes/hihat-open-hard.mp3", maxVelocity: 1.0 },
  ],
  ride: [
    { url: "/samples/drums/brushes/ride-soft.mp3", maxVelocity: 0.6 },
    { url: "/samples/drums/brushes/ride-hard.mp3", maxVelocity: 1.0 },
  ],
};

/**
 * Creates a sample-based drum kit instrument.
 * Uses multi-velocity audio samples for a natural sound.
 * Returns the same DrumInstrument interface as the synth version.
 */
export async function createSampleDrumInstrument(
  volume: number,
  sampleKit: SampleMap = BRUSH_SAMPLES,
): Promise<DrumInstrument> {
  const drumBus = new Tone.Gain();
  const highCut = new Tone.Filter(5000, "lowpass");
  const room = new Tone.Reverb({
    decay: 0.9,
    wet: 0.15,
    preDelay: 0.01,
  });
  const compressor = new Tone.Compressor(-24, 4);

  drumBus.chain(highCut, compressor, room, Tone.Destination);

  // Build velocity layers for each sound
  const layers: Record<string, VelocityLayer[]> = {};

  for (const [sound, samples] of Object.entries(sampleKit)) {
    const soundLayers: VelocityLayer[] = [];
    const soundOffset = SOUND_VOLUME_OFFSETS[sound as DrumSound] ?? -8;
    for (const sample of samples) {
      const player = new Tone.Player(sample.url);
      player.volume.value = soundOffset;
      player.connect(drumBus);
      soundLayers.push({ player, maxVelocity: sample.maxVelocity });
    }
    // Sort by maxVelocity ascending so we pick the first matching layer
    soundLayers.sort((a, b) => a.maxVelocity - b.maxVelocity);
    layers[sound] = soundLayers;
  }

  // Wait for all samples to load
  await Tone.loaded();

  // Set initial volume
  drumBus.gain.value = Tone.dbToGain(volume);

  return {
    trigger: (sound: DrumSound, time: number, velocity: number) => {
      const soundLayers = layers[sound];
      if (!soundLayers) return;

      // Pick the velocity layer: first one where velocity <= maxVelocity
      const layer =
        soundLayers.find((l) => velocity <= l.maxVelocity) ??
        soundLayers[soundLayers.length - 1];
      if (!layer) return;

      const safeTime = Math.max(time, Tone.now());
      // Stop any currently playing instance to avoid overlap
      layer.player.stop(safeTime);
      layer.player.start(safeTime);
    },
    setVolume: (newVolume: number) => {
      drumBus.gain.value = Tone.dbToGain(newVolume);
    },
    dispose: () => {
      for (const soundLayers of Object.values(layers)) {
        for (const layer of soundLayers) {
          layer.player.dispose();
        }
      }
      drumBus.dispose();
      highCut.dispose();
      room.dispose();
      compressor.dispose();
    },
  };
}
