import * as Tone from "tone";
import type { DrumInstrument } from "@/lib/audio/instruments/drumInstrument";
import {
  METRONOME_ACCENT_NOTE,
  METRONOME_CLICK_NOTE,
  type MetronomeInstrument,
} from "@/lib/audio/instruments/metronomeInstrument";
import { parseChordSymbol } from "@/lib/theory/chords";
import type {
  Chord,
  ChordPatternEvent,
  DrumPatternEvent,
  MetronomeConfig,
  PatternEvent,
  Progression,
  StyleDefinition,
} from "@/lib/types";
import { getApproachNote, getBassNote, getVoicing } from "./voicings";

interface SchedulerInstruments {
  bass: Tone.Synth;
  chord: Tone.PolySynth;
  metronome?: MetronomeInstrument;
  drums?: DrumInstrument;
}

interface ScheduleResult {
  eventIds: number[];
  totalBars: number;
}

interface ScheduleOptions {
  metronomeConfig?: MetronomeConfig;
  countInBars?: number;
}

/**
 * Parses a Tone.js time string like "0:2" or "0:1:2" into total beats
 */
function parseTimeToBeats(time: string): number {
  const parts = time.split(":").map(Number);
  if (parts.length === 2) {
    // "bars:beats" format
    const bars = parts[0] ?? 0;
    const beats = parts[1] ?? 0;
    return bars * 4 + beats;
  } else if (parts.length === 3) {
    // "bars:beats:sixteenths" format
    const bars = parts[0] ?? 0;
    const beats = parts[1] ?? 0;
    const sixteenths = parts[2] ?? 0;
    return bars * 4 + beats + sixteenths / 4;
  }
  return 0;
}

/**
 * Converts beats to Tone.js time format
 */
function beatsToTime(beats: number): string {
  const wholeBars = Math.floor(beats / 4);
  const remainingBeats = beats % 4;
  const wholeBeats = Math.floor(remainingBeats);
  const sixteenths = Math.round((remainingBeats - wholeBeats) * 4);

  if (sixteenths > 0) {
    return `${wholeBars}:${wholeBeats}:${sixteenths}`;
  }
  return `${wholeBars}:${wholeBeats}`;
}

/**
 * Schedules bass pattern events for a single chord
 */
function scheduleBassPattern(
  transport: typeof Tone.Transport,
  pattern: PatternEvent[],
  chord: Chord,
  nextChord: Chord | null,
  startBeat: number,
  chordBeats: number,
  bassInstrument: Tone.Synth,
  bassOctave: number,
): number[] {
  const eventIds: number[] = [];
  const patternBeats = 4; // Patterns are defined for 4 beats

  // Scale factor for multi-chord bars (e.g., 2 chords = 0.5 scale)
  const scale = chordBeats / patternBeats;

  for (const event of pattern) {
    const eventBeat = parseTimeToBeats(event.time) * scale;
    const absoluteBeat = startBeat + eventBeat;

    // Skip if event falls outside this chord's duration
    if (eventBeat >= chordBeats) continue;

    const time = beatsToTime(absoluteBeat);

    const eventId = transport.schedule((audioTime) => {
      let noteToPlay: string;

      if (event.type === "approach" && nextChord) {
        // Approach note to next chord
        noteToPlay = getApproachNote(nextChord, bassOctave);
      } else {
        // Regular bass note based on degree
        const degree = event.degree ?? 1;
        noteToPlay = getBassNote(
          chord,
          degree,
          bassOctave,
          nextChord ?? undefined,
        );
      }

      const velocity = event.velocity ?? 0.8;
      bassInstrument.triggerAttackRelease(
        noteToPlay,
        event.duration,
        audioTime,
        velocity,
      );
    }, time);

    eventIds.push(eventId);
  }

  return eventIds;
}

/**
 * Schedules chord pattern events for a single chord
 */
function scheduleChordPattern(
  transport: typeof Tone.Transport,
  pattern: ChordPatternEvent[],
  chord: Chord,
  startBeat: number,
  chordBeats: number,
  chordInstrument: Tone.PolySynth,
  chordOctave: number,
): number[] {
  const eventIds: number[] = [];
  const patternBeats = 4;

  const scale = chordBeats / patternBeats;

  for (const event of pattern) {
    const eventBeat = parseTimeToBeats(event.time) * scale;
    const absoluteBeat = startBeat + eventBeat;

    if (eventBeat >= chordBeats) continue;

    const time = beatsToTime(absoluteBeat);

    const eventId = transport.schedule((audioTime) => {
      const voicing = getVoicing(chord, event.voicingType, chordOctave);
      const velocity = event.velocity ?? 0.6;

      chordInstrument.triggerAttackRelease(
        voicing.notes,
        event.duration,
        audioTime,
        velocity,
      );
    }, time);

    eventIds.push(eventId);
  }

  return eventIds;
}

/**
 * Schedules drum pattern events for a single chord
 */
function scheduleDrumPattern(
  transport: typeof Tone.Transport,
  pattern: DrumPatternEvent[],
  startBeat: number,
  chordBeats: number,
  drumInstrument: DrumInstrument,
): number[] {
  const eventIds: number[] = [];
  const patternBeats = 4;

  const scale = chordBeats / patternBeats;

  for (const event of pattern) {
    const eventBeat = parseTimeToBeats(event.time) * scale;
    const absoluteBeat = startBeat + eventBeat;

    if (eventBeat >= chordBeats) continue;

    const time = beatsToTime(absoluteBeat);

    const eventId = transport.schedule((audioTime) => {
      const velocity = event.velocity ?? 0.7;
      drumInstrument.trigger(event.sound, audioTime, velocity);
    }, time);

    eventIds.push(eventId);
  }

  return eventIds;
}

/**
 * Schedules metronome clicks for the entire progression
 */
function scheduleMetronome(
  transport: typeof Tone.Transport,
  totalBeats: number,
  beatsPerBar: number,
  metronomeInstrument: MetronomeInstrument,
  accentDownbeat: boolean,
  startBeat = 0,
): number[] {
  const eventIds: number[] = [];

  for (let beat = 0; beat < totalBeats; beat++) {
    const absoluteBeat = startBeat + beat;
    const time = beatsToTime(absoluteBeat);
    const isDownbeat = beat % beatsPerBar === 0;

    const eventId = transport.schedule((audioTime) => {
      if (isDownbeat && accentDownbeat) {
        // Accented downbeat
        metronomeInstrument.accent.triggerAttackRelease(
          METRONOME_ACCENT_NOTE,
          "32n",
          audioTime,
          0.9,
        );
      } else {
        // Regular click
        metronomeInstrument.click.triggerAttackRelease(
          METRONOME_CLICK_NOTE,
          "32n",
          audioTime,
          0.7,
        );
      }
    }, time);

    eventIds.push(eventId);
  }

  return eventIds;
}

/**
 * Schedules a count-in before the progression starts
 */
export function scheduleCountIn(
  transport: typeof Tone.Transport,
  countInBars: number,
  beatsPerBar: number,
  metronomeInstrument: MetronomeInstrument,
  accentDownbeat: boolean,
): number[] {
  const totalBeats = countInBars * beatsPerBar;
  return scheduleMetronome(
    transport,
    totalBeats,
    beatsPerBar,
    metronomeInstrument,
    accentDownbeat,
    0,
  );
}

/**
 * Main scheduling function that schedules the entire progression
 */
export function scheduleProgression(
  progression: Progression,
  style: StyleDefinition,
  instruments: SchedulerInstruments,
  onChordChange: (barIndex: number, chordIndex: number) => void,
  options?: ScheduleOptions,
): ScheduleResult {
  const transport = Tone.getTransport();
  const eventIds: number[] = [];
  const beatsPerBar = progression.timeSignature.numerator;

  // Offset all events by count-in bars if specified
  const countInOffset = (options?.countInBars ?? 0) * beatsPerBar;

  let currentBeat = countInOffset;

  // Iterate through each bar
  for (let barIndex = 0; barIndex < progression.bars.length; barIndex++) {
    const bar = progression.bars[barIndex];
    if (!bar) continue;

    // Iterate through each chord in the bar
    for (let chordIndex = 0; chordIndex < bar.chords.length; chordIndex++) {
      const barChord = bar.chords[chordIndex];
      if (!barChord) continue;
      const chord = parseChordSymbol(barChord.chord);

      if (!chord) continue;

      // Get the next chord for approach notes
      const nextChordInfo = getNextChord(progression, barIndex, chordIndex);
      const nextChord = nextChordInfo
        ? parseChordSymbol(nextChordInfo.chord)
        : null;

      // Schedule chord change callback
      const changeEventId = transport.schedule(() => {
        onChordChange(barIndex, chordIndex);
      }, beatsToTime(currentBeat));
      eventIds.push(changeEventId);

      // Schedule bass pattern
      const bassEventIds = scheduleBassPattern(
        transport,
        style.patterns.bass.events,
        chord,
        nextChord,
        currentBeat,
        barChord.beats,
        instruments.bass,
        style.instruments.bass.octave,
      );
      eventIds.push(...bassEventIds);

      // Schedule chord pattern
      const chordEventIds = scheduleChordPattern(
        transport,
        style.patterns.chord.events,
        chord,
        currentBeat,
        barChord.beats,
        instruments.chord,
        style.instruments.chord.octave,
      );
      eventIds.push(...chordEventIds);

      // Schedule drum pattern
      if (instruments.drums) {
        const drumEventIds = scheduleDrumPattern(
          transport,
          style.patterns.drums.events,
          currentBeat,
          barChord.beats,
          instruments.drums,
        );
        eventIds.push(...drumEventIds);
      }

      currentBeat += barChord.beats;
    }
  }

  // Calculate total bars (excluding count-in offset)
  const progressionBeats = currentBeat - countInOffset;
  const totalBars = Math.ceil(progressionBeats / beatsPerBar);

  // Schedule metronome if enabled
  if (options?.metronomeConfig?.enabled && instruments.metronome) {
    const metronomeEventIds = scheduleMetronome(
      transport,
      progressionBeats,
      beatsPerBar,
      instruments.metronome,
      options.metronomeConfig.accentDownbeat,
      countInOffset,
    );
    eventIds.push(...metronomeEventIds);
  }

  return { eventIds, totalBars };
}

/**
 * Gets the next chord in the progression (wraps around)
 */
function getNextChord(
  progression: Progression,
  currentBarIndex: number,
  currentChordIndex: number,
): { chord: string } | null {
  const currentBar = progression.bars[currentBarIndex];
  if (!currentBar) return null;

  // Check if there's another chord in the same bar
  if (currentChordIndex < currentBar.chords.length - 1) {
    return currentBar.chords[currentChordIndex + 1] ?? null;
  }

  // Check if there's another bar
  if (currentBarIndex < progression.bars.length - 1) {
    const nextBar = progression.bars[currentBarIndex + 1];
    return nextBar?.chords[0] ?? null;
  }

  // Wrap around to the first chord
  const firstBar = progression.bars[0];
  return firstBar?.chords[0] ?? null;
}

/**
 * Clears all scheduled events
 */
export function clearScheduledEvents(eventIds: number[]): void {
  const transport = Tone.getTransport();
  for (const eventId of eventIds) {
    transport.clear(eventId);
  }
}
