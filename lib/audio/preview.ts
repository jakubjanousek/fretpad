import { Scale } from "tonal";
import * as Tone from "tone";
import { parseChordSymbol } from "@/lib/theory/chords";
import { getFullVoicing } from "./voicings";

/**
 * Audio preview singleton for playing chord and scale previews
 * Uses a dedicated synth to avoid interfering with the main playback
 */

let previewSynth: Tone.PolySynth | null = null;
let isInitialized = false;

/**
 * Initialize the preview synth (call this on user interaction)
 */
async function ensureInitialized(): Promise<boolean> {
  if (isInitialized && previewSynth) return true;

  try {
    await Tone.start();

    previewSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "triangle",
      },
      envelope: {
        attack: 0.02,
        decay: 0.2,
        sustain: 0.3,
        release: 0.8,
      },
    }).toDestination();

    previewSynth.volume.value = -8;
    isInitialized = true;
    return true;
  } catch (error) {
    console.warn("Failed to initialize audio preview:", error);
    return false;
  }
}

/**
 * Play a chord preview
 * @param chordSymbol - Chord symbol like "Cmaj7", "Dm7", etc.
 * @param duration - Duration in seconds (default 1.5s)
 */
export async function playChordPreview(
  chordSymbol: string,
  duration: number = 1.5,
): Promise<void> {
  const initialized = await ensureInitialized();
  if (!initialized || !previewSynth) return;

  const chord = parseChordSymbol(chordSymbol);
  if (!chord) return;

  // Get a full voicing at octave 4 for a nice playable range
  const voicing = getFullVoicing(chord, 4);

  // Stop any currently playing notes
  previewSynth.releaseAll();

  // Play the chord
  previewSynth.triggerAttackRelease(voicing.notes, duration);
}

/**
 * Play a scale preview as an ascending arpeggio
 * @param scaleName - Full scale name like "C major", "D dorian"
 * @param duration - Total duration for the scale (default 2s)
 */
export async function playScalePreview(
  scaleName: string,
  duration: number = 2,
): Promise<void> {
  const initialized = await ensureInitialized();
  if (!initialized || !previewSynth) return;

  // Parse scale name (format: "C major", "D dorian", etc.)
  const parts = scaleName.split(" ");
  const root = parts[0];
  const scaleType = parts.slice(1).join(" ");

  // Get scale notes from tonal
  const scaleNotes = Scale.get(`${root} ${scaleType}`).notes;
  if (!scaleNotes || scaleNotes.length === 0) return;

  // Stop any currently playing notes
  previewSynth.releaseAll();

  // Add octave to notes
  const notesWithOctave = scaleNotes.map((note, index) => {
    // Start at octave 4, wrap to octave 5 for higher notes
    const octave = index < 4 ? 4 : 5;
    return `${note}${octave}`;
  });

  // Add root note an octave up to complete the scale
  notesWithOctave.push(`${root}5`);

  // Calculate timing
  const noteDelay = duration / notesWithOctave.length;
  const noteDuration = noteDelay * 1.5; // Slight overlap for smoother sound

  // Play each note with delay
  const now = Tone.now();
  for (let i = 0; i < notesWithOctave.length; i++) {
    const note = notesWithOctave[i];
    if (note) {
      previewSynth.triggerAttackRelease(
        note,
        noteDuration,
        now + i * noteDelay,
      );
    }
  }
}

/**
 * Play a chord as an arpeggio (notes one by one)
 * @param chordSymbol - Chord symbol like "Cmaj7", "Dm7", etc.
 * @param duration - Total duration for the arpeggio (default 1.5s)
 */
export async function playChordArpeggio(
  chordSymbol: string,
  duration: number = 1.5,
): Promise<void> {
  const initialized = await ensureInitialized();
  if (!initialized || !previewSynth) return;

  const chord = parseChordSymbol(chordSymbol);
  if (!chord) return;

  const voicing = getFullVoicing(chord, 4);

  // Stop any currently playing notes
  previewSynth.releaseAll();

  // Calculate timing
  const noteDelay = duration / voicing.notes.length;
  const noteDuration = noteDelay * 2; // Hold notes longer for smoother sound

  // Play each note with delay
  const now = Tone.now();
  for (let i = 0; i < voicing.notes.length; i++) {
    const note = voicing.notes[i];
    if (note) {
      previewSynth.triggerAttackRelease(
        note,
        noteDuration,
        now + i * noteDelay,
      );
    }
  }
}

/**
 * Stop all preview playback
 */
export function stopPreview(): void {
  if (previewSynth) {
    previewSynth.releaseAll();
  }
}

/**
 * Cleanup preview resources
 */
export function disposePreview(): void {
  if (previewSynth) {
    previewSynth.releaseAll();
    previewSynth.dispose();
    previewSynth = null;
  }
  isInitialized = false;
}
