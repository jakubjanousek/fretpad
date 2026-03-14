import * as Tone from "tone";
import type { BassInstrument } from "@/lib/audio/instruments/bassInstrument";
import type { ChordInstrument } from "@/lib/audio/instruments/chordInstrument";
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
import {
  getApproachNote,
  getBassNote,
  getVoicing,
  getWalkingBassLine,
} from "./voicings";

interface SchedulerInstruments {
  bass: BassInstrument;
  chord: ChordInstrument;
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

type HumanizationProfile = NonNullable<
  NonNullable<StyleDefinition["timing"]>["humanization"]
>[keyof NonNullable<NonNullable<StyleDefinition["timing"]>["humanization"]>];

interface HumanizationContext {
  barIndex: number;
  chordIndex: number;
  eventIndex: number;
}

interface HumanizationResult {
  timingOffsetBeats: number;
  velocityOffset: number;
  durationOffsetBeats: number;
}

/**
 * Parses a Tone.js time string like "0:2" or "0:1:2" into total beats
 */
export function parseTimeToBeats(time: string): number {
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
export function beatsToTime(beats: number): string {
  const wholeBars = Math.floor(beats / 4);
  const remainingBeats = beats % 4;
  const wholeBeats = Math.floor(remainingBeats);
  const sixteenths = Math.round((remainingBeats - wholeBeats) * 4);

  if (sixteenths > 0) {
    return `${wholeBars}:${wholeBeats}:${sixteenths}`;
  }
  return `${wholeBars}:${wholeBeats}`;
}

interface EventTimingInput {
  time: string;
  offsetBeats?: number;
}

export function resolveEventBeat(
  event: EventTimingInput,
  chordBeats: number,
  instrumentOffsetBeats = 0,
): number {
  const patternBeats = 4;
  const scale = chordBeats / patternBeats;
  const baseBeat = parseTimeToBeats(event.time) * scale;
  const explicitOffset = (event.offsetBeats ?? 0) * scale;

  return baseBeat + explicitOffset + instrumentOffsetBeats;
}

function hashHumanizationSeed(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index++) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function getDeterministicCenteredValue(seed: string): number {
  const hash = hashHumanizationSeed(seed);
  return (hash / 0xffffffff) * 2 - 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getHumanization(
  profile: HumanizationProfile | undefined,
  instrument: "bass" | "chord" | "drums",
  context: HumanizationContext,
): HumanizationResult {
  if (!profile) {
    return {
      timingOffsetBeats: 0,
      velocityOffset: 0,
      durationOffsetBeats: 0,
    };
  }

  const baseSeed = `${instrument}:${context.barIndex}:${context.chordIndex}:${context.eventIndex}`;

  return {
    timingOffsetBeats:
      getDeterministicCenteredValue(`${baseSeed}:timing`) *
      (profile.timingBeats ?? 0),
    velocityOffset:
      getDeterministicCenteredValue(`${baseSeed}:velocity`) *
      (profile.velocityDelta ?? 0),
    durationOffsetBeats:
      getDeterministicCenteredValue(`${baseSeed}:duration`) *
      (profile.durationBeats ?? 0),
  };
}

function getDurationInBeats(duration: string): number {
  if (duration.includes(":")) {
    return parseTimeToBeats(duration);
  }

  const noteMatch = duration.match(/^(\d+)n$/);
  if (noteMatch) {
    const denominator = Number(noteMatch[1]);
    return 4 / denominator;
  }

  return 1;
}

export function resolveHumanizedDuration(
  duration: string,
  durationOffsetBeats = 0,
): string {
  if (durationOffsetBeats === 0) return duration;

  const baseBeats = getDurationInBeats(duration);
  const minBeats = Math.min(baseBeats, 0.125);
  const resolvedBeats = Math.max(minBeats, baseBeats + durationOffsetBeats);

  return beatsToTime(resolvedBeats);
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
  bassInstrument: BassInstrument,
  bassOctave: number,
  instrumentOffsetBeats = 0,
  variationIndex = 0,
  humanizationProfile?: HumanizationProfile,
  scheduleContext?: Pick<HumanizationContext, "barIndex" | "chordIndex">,
): number[] {
  const eventIds: number[] = [];
  const activePattern = pattern.filter((event) => {
    const eventBeat = resolveEventBeat(
      event,
      chordBeats,
      instrumentOffsetBeats,
    );
    return eventBeat < chordBeats;
  });
  const walkEvents = activePattern.filter((event) => event.type === "walk");
  const walkingLine = getWalkingBassLine(chord, {
    octave: bassOctave,
    steps: walkEvents.length,
    variationIndex,
    nextChord,
  });
  let walkingLineIndex = 0;

  for (const [eventIndex, event] of activePattern.entries()) {
    const humanization = getHumanization(humanizationProfile, "bass", {
      barIndex: scheduleContext?.barIndex ?? 0,
      chordIndex: scheduleContext?.chordIndex ?? 0,
      eventIndex,
    });
    const eventBeat = clamp(
      resolveEventBeat(event, chordBeats, instrumentOffsetBeats) +
        humanization.timingOffsetBeats,
      0,
      Math.max(chordBeats - 0.01, 0),
    );
    const duration = resolveHumanizedDuration(
      event.duration,
      humanization.durationOffsetBeats,
    );
    const absoluteBeat = startBeat + eventBeat;

    // Skip if event falls outside this chord's duration
    if (eventBeat >= chordBeats) continue;

    const time = beatsToTime(absoluteBeat);

    const eventId = transport.schedule((audioTime) => {
      const safeTime = Math.max(audioTime, Tone.now());
      let noteToPlay: string;

      if (event.type === "approach" && nextChord) {
        // Approach note to next chord
        noteToPlay = getApproachNote(nextChord, bassOctave);
      } else if (event.type === "walk") {
        noteToPlay =
          walkingLine[walkingLineIndex] ?? getBassNote(chord, 1, bassOctave);
        walkingLineIndex += 1;
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

      const velocity = clamp(
        (event.velocity ?? 0.8) + humanization.velocityOffset,
        0.05,
        1,
      );
      bassInstrument.triggerAttackRelease(
        noteToPlay,
        duration,
        safeTime,
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
  chordInstrument: ChordInstrument,
  chordOctave: number,
  instrumentOffsetBeats = 0,
  humanizationProfile?: HumanizationProfile,
  scheduleContext?: Pick<HumanizationContext, "barIndex" | "chordIndex">,
): number[] {
  const eventIds: number[] = [];

  for (const [eventIndex, event] of pattern.entries()) {
    const humanization = getHumanization(humanizationProfile, "chord", {
      barIndex: scheduleContext?.barIndex ?? 0,
      chordIndex: scheduleContext?.chordIndex ?? 0,
      eventIndex,
    });
    const eventBeat = clamp(
      resolveEventBeat(event, chordBeats, instrumentOffsetBeats) +
        humanization.timingOffsetBeats,
      0,
      Math.max(chordBeats - 0.01, 0),
    );
    const absoluteBeat = startBeat + eventBeat;

    if (eventBeat >= chordBeats) continue;

    const time = beatsToTime(absoluteBeat);
    const duration = resolveHumanizedDuration(
      event.duration,
      humanization.durationOffsetBeats,
    );

    const eventId = transport.schedule((audioTime) => {
      const safeTime = Math.max(audioTime, Tone.now());
      const voicing = getVoicing(chord, event.voicingType, chordOctave);
      const velocity = clamp(
        (event.velocity ?? 0.6) + humanization.velocityOffset,
        0.05,
        1,
      );

      chordInstrument.triggerAttackRelease(
        voicing.notes,
        duration,
        safeTime,
        velocity,
      );
    }, time);

    eventIds.push(eventId);
  }

  return eventIds;
}

export function getPatternVariantIndex(
  barIndex: number,
  chordIndex: number,
  variantCount: number,
): number {
  if (variantCount <= 1) return 0;
  return (barIndex * 3 + chordIndex) % variantCount;
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
  instrumentOffsetBeats = 0,
  humanizationProfile?: HumanizationProfile,
  scheduleContext?: Pick<HumanizationContext, "barIndex" | "chordIndex">,
): number[] {
  const eventIds: number[] = [];

  for (const [eventIndex, event] of pattern.entries()) {
    const humanization = getHumanization(humanizationProfile, "drums", {
      barIndex: scheduleContext?.barIndex ?? 0,
      chordIndex: scheduleContext?.chordIndex ?? 0,
      eventIndex,
    });
    const eventBeat = clamp(
      resolveEventBeat(event, chordBeats, instrumentOffsetBeats) +
        humanization.timingOffsetBeats,
      0,
      Math.max(chordBeats - 0.01, 0),
    );
    const absoluteBeat = startBeat + eventBeat;

    if (eventBeat >= chordBeats) continue;

    const time = beatsToTime(absoluteBeat);

    const eventId = transport.schedule((audioTime) => {
      const velocity = clamp(
        (event.velocity ?? 0.7) + humanization.velocityOffset,
        0.05,
        1,
      );
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
      const safeTime = Math.max(audioTime, Tone.now());
      if (isDownbeat && accentDownbeat) {
        // Accented downbeat
        metronomeInstrument.accent.triggerAttackRelease(
          METRONOME_ACCENT_NOTE,
          "32n",
          safeTime,
          0.9,
        );
      } else {
        // Regular click
        metronomeInstrument.click.triggerAttackRelease(
          METRONOME_CLICK_NOTE,
          "32n",
          safeTime,
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
  const instrumentOffsets = style.timing?.instrumentOffsets;
  const humanization = style.timing?.humanization;

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
        instrumentOffsets?.bass ?? 0,
        getPatternVariantIndex(barIndex, chordIndex, 4),
        humanization?.bass,
        { barIndex, chordIndex },
      );
      eventIds.push(...bassEventIds);

      // Schedule chord pattern
      const chordPatternEvents =
        style.patterns.chord.variants?.[
          getPatternVariantIndex(
            barIndex,
            chordIndex,
            style.patterns.chord.variants.length,
          )
        ] ?? style.patterns.chord.events;
      const chordEventIds = scheduleChordPattern(
        transport,
        chordPatternEvents,
        chord,
        currentBeat,
        barChord.beats,
        instruments.chord,
        style.instruments.chord.octave,
        instrumentOffsets?.chord ?? 0,
        humanization?.chord,
        { barIndex, chordIndex },
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
          instrumentOffsets?.drums ?? 0,
          humanization?.drums,
          { barIndex, chordIndex },
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
