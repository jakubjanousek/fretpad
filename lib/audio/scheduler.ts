import * as Tone from "tone";
import type { BassInstrument } from "@/lib/audio/instruments/bassInstrument";
import type { ChordInstrument } from "@/lib/audio/instruments/chordInstrument";
import type { DrumInstrument } from "@/lib/audio/instruments/drumInstrument";
import {
  METRONOME_ACCENT_NOTE,
  METRONOME_CLICK_NOTE,
  type MetronomeInstrument,
} from "@/lib/audio/instruments/metronomeInstrument";
import { parseChordSymbol } from "@/lib/theory";
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
  loopIteration?: number;
  bpm?: number;
  compingVariations?: boolean;
}

type HumanizationProfile = NonNullable<
  NonNullable<StyleDefinition["timing"]>["humanization"]
>[keyof NonNullable<NonNullable<StyleDefinition["timing"]>["humanization"]>];

interface HumanizationContext {
  loopIteration: number;
  barIndex: number;
  chordIndex: number;
  eventIndex: number;
}

interface HumanizationResult {
  timingOffsetBeats: number;
  velocityOffset: number;
  durationOffsetBeats: number;
}

interface ParsedBarChordSlot {
  chord: Chord;
  chordIndex: number;
  startBeat: number;
  endBeat: number;
}

/**
 * Parses a Tone.js time string like "0:2" or "0:1:2" into total beats
 */
export function parseTimeToBeats(time: string): number {
  const parts = time.split(":").map(Number);
  if (parts.length === 2) {
    const bars = parts[0] ?? 0;
    const beats = parts[1] ?? 0;
    return bars * 4 + beats;
  } else if (parts.length === 3) {
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
  const fractionalSixteenths = (remainingBeats - wholeBeats) * 4;
  const sixteenths = Number(fractionalSixteenths.toFixed(6));

  if (sixteenths > 0) {
    return `${wholeBars}:${wholeBeats}:${sixteenths}`;
  }
  return `${wholeBars}:${wholeBeats}`;
}

interface EventTimingInput {
  time: string;
}

/**
 * Computes tempo-adaptive swing ratio based on Friberg & Sundström research.
 * The offbeat duration stays roughly constant at ~100ms across tempos,
 * so faster tempos compress toward straight and slower tempos widen toward triplet+.
 */
export function getTempoSwingRatio(bpm: number): number {
  const offbeatMs = 170; // empirical constant from Friberg & Sundström research
  const beatMs = 60000 / bpm;
  const naturalRatio = 1 - offbeatMs / beatMs;
  return Math.max(0.52, Math.min(0.75, naturalRatio));
}

/**
 * Applies swing to a beat position. Only upbeat 8th notes (x.5 positions)
 * are shifted; downbeats and other subdivisions pass through unchanged.
 */
export function applySwing(beatInBar: number, swingRatio: number): number {
  const beatFraction = beatInBar % 1;
  if (Math.abs(beatFraction - 0.5) < 0.001) {
    return beatInBar + (swingRatio - 0.5);
  }
  return beatInBar;
}

/**
 * Resolves event beat position on the full bar grid (no scaling).
 */
export function resolveBarEventBeat(
  event: EventTimingInput,
  instrumentOffsetBeats = 0,
): number {
  return parseTimeToBeats(event.time) + instrumentOffsetBeats;
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

  const baseSeed = `${instrument}:${context.barIndex}:${context.chordIndex}:${context.eventIndex}:loop:${context.loopIteration}`;
  const timingSeed = getDeterministicCenteredValue(`${baseSeed}:timing`);
  const timingOffsetBeats = (() => {
    const timingBeats = profile.timingBeats ?? 0;

    switch (profile.timingDirection) {
      case "late":
        return ((timingSeed + 1) / 2) * timingBeats;
      case "early":
        return ((timingSeed - 1) / 2) * timingBeats;
      default:
        return timingSeed * timingBeats;
    }
  })();

  return {
    timingOffsetBeats,
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

export function getPatternVariantIndex(
  barIndex: number,
  chordIndex: number,
  variantCount: number,
  loopIteration = 0,
): number {
  if (variantCount <= 1) return 0;
  return (barIndex * 3 + chordIndex + loopIteration) % variantCount;
}

/**
 * Schedules bass pattern events for a bar, with walking bass across chord changes.
 */
function scheduleBassForBar(
  transport: typeof Tone.Transport,
  pattern: PatternEvent[],
  progression: Progression,
  barIndex: number,
  barChords: ParsedBarChordSlot[],
  startBeat: number,
  beatsPerBar: number,
  bassInstrument: BassInstrument,
  bassOctave: number,
  instrumentOffsetBeats = 0,
  variationIndex = 0,
  humanizationProfile?: HumanizationProfile,
  loopIteration = 0,
  swingRatio = 0.5,
): number[] {
  const eventIds: number[] = [];
  const activePattern = pattern
    .map((event, patternEventIndex) => ({
      event,
      patternEventIndex,
      eventBeat: applySwing(
        resolveBarEventBeat(event, instrumentOffsetBeats),
        swingRatio,
      ),
    }))
    .filter(({ eventBeat }) => eventBeat < beatsPerBar);

  for (const slot of barChords) {
    const slotEvents = activePattern.filter(
      ({ eventBeat }) =>
        eventBeat >= slot.startBeat && eventBeat < slot.endBeat,
    );
    const nextChordInfo = getNextChord(progression, barIndex, slot.chordIndex);
    const nextChord = nextChordInfo
      ? parseChordSymbol(nextChordInfo.chord)
      : null;
    const walkEvents = slotEvents.filter(({ event }) => event.type === "walk");
    const walkingLine = getWalkingBassLine(slot.chord, {
      octave: bassOctave,
      steps: walkEvents.length,
      variationIndex: variationIndex + slot.chordIndex,
      nextChord,
    });
    let walkingLineIndex = 0;

    for (const {
      event,
      eventBeat: baseEventBeat,
      patternEventIndex,
    } of slotEvents) {
      const humanization = getHumanization(humanizationProfile, "bass", {
        loopIteration,
        barIndex,
        chordIndex: slot.chordIndex,
        eventIndex: patternEventIndex,
      });
      const eventBeat = clamp(
        baseEventBeat + humanization.timingOffsetBeats,
        0,
        Math.max(beatsPerBar - 0.01, 0),
      );
      const duration = resolveHumanizedDuration(
        event.duration,
        humanization.durationOffsetBeats,
      );
      const absoluteBeat = startBeat + eventBeat;
      const time = beatsToTime(absoluteBeat);

      const eventId = transport.schedule((audioTime) => {
        const safeTime = Math.max(audioTime, Tone.now());
        let noteToPlay: string;

        if (event.type === "approach" && nextChord) {
          noteToPlay = getApproachNote(nextChord, bassOctave);
        } else if (event.type === "walk") {
          noteToPlay =
            walkingLine[walkingLineIndex] ??
            getBassNote(slot.chord, 1, bassOctave, nextChord ?? undefined);
          walkingLineIndex += 1;
        } else {
          const degree = event.degree ?? 1;
          noteToPlay = getBassNote(
            slot.chord,
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
  loopIteration = 0,
  swingRatio = 0.5,
): number[] {
  const eventIds: number[] = [];

  for (const [eventIndex, event] of pattern.entries()) {
    const humanization = getHumanization(humanizationProfile, "chord", {
      loopIteration,
      barIndex: scheduleContext?.barIndex ?? 0,
      chordIndex: scheduleContext?.chordIndex ?? 0,
      eventIndex,
    });
    const eventBeat = clamp(
      applySwing(
        resolveBarEventBeat(event, instrumentOffsetBeats),
        swingRatio,
      ) + humanization.timingOffsetBeats,
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

/**
 * Schedules drum pattern events for a bar
 */
function scheduleDrumsForBar(
  transport: typeof Tone.Transport,
  pattern: DrumPatternEvent[],
  startBeat: number,
  beatsPerBar: number,
  drumInstrument: DrumInstrument,
  instrumentOffsetBeats = 0,
  humanizationProfile?: HumanizationProfile,
  scheduleContext?: Pick<HumanizationContext, "barIndex">,
  loopIteration = 0,
  swingRatio = 0.5,
): number[] {
  const eventIds: number[] = [];
  const activePattern = pattern
    .map((event, eventIndex) => ({
      event,
      eventIndex,
      eventBeat: applySwing(
        resolveBarEventBeat(event, instrumentOffsetBeats),
        swingRatio,
      ),
    }))
    .filter(({ eventBeat }) => eventBeat < beatsPerBar);

  for (const { event, eventBeat: baseEventBeat, eventIndex } of activePattern) {
    const humanization = getHumanization(humanizationProfile, "drums", {
      loopIteration,
      barIndex: scheduleContext?.barIndex ?? 0,
      chordIndex: 0,
      eventIndex,
    });
    const eventBeat = clamp(
      baseEventBeat + humanization.timingOffsetBeats,
      0,
      Math.max(beatsPerBar - 0.01, 0),
    );
    const absoluteBeat = startBeat + eventBeat;
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
        metronomeInstrument.accent.triggerAttackRelease(
          METRONOME_ACCENT_NOTE,
          "32n",
          safeTime,
          0.9,
        );
      } else {
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
 * Main scheduling function that schedules the entire progression.
 * All instruments use bar-level scheduling (patterns stay on the full bar grid).
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
  const loopIteration = options?.loopIteration ?? 0;
  const baseSwingRatio = getTempoSwingRatio(options?.bpm ?? 120);
  const bassSwingRatio = 0.5 + (baseSwingRatio - 0.5) * (style.swing.bass ?? 0);
  const chordSwingRatio =
    0.5 + (baseSwingRatio - 0.5) * (style.swing.chord ?? 1);
  const drumsSwingRatio =
    0.5 + (baseSwingRatio - 0.5) * (style.swing.drums ?? 1);

  const countInOffset = (options?.countInBars ?? 0) * beatsPerBar;
  let currentBeat = countInOffset;

  for (let barIndex = 0; barIndex < progression.bars.length; barIndex++) {
    const bar = progression.bars[barIndex];
    if (!bar) continue;
    const barStartBeat = currentBeat;
    const parsedBarChords: ParsedBarChordSlot[] = [];
    let barBeatCursor = 0;

    // Parse chords and schedule chord change callbacks
    for (let chordIndex = 0; chordIndex < bar.chords.length; chordIndex++) {
      const barChord = bar.chords[chordIndex];
      if (!barChord) continue;
      const chord = parseChordSymbol(barChord.chord);
      if (!chord) continue;

      parsedBarChords.push({
        chord,
        chordIndex,
        startBeat: barBeatCursor,
        endBeat: barBeatCursor + barChord.beats,
      });

      // Schedule chord change callback
      const changeEventId = transport.schedule((time) => {
        Tone.Draw.schedule(() => {
          onChordChange(barIndex, chordIndex);
        }, time);
      }, beatsToTime(currentBeat));
      eventIds.push(changeEventId);

      // Schedule chord voicings per chord
      const variants =
        options?.compingVariations !== false
          ? style.patterns.chord.variants
          : undefined;
      const chordPatternEvents =
        variants?.[
          getPatternVariantIndex(
            barIndex,
            chordIndex,
            variants.length,
            loopIteration,
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
        loopIteration,
        chordSwingRatio,
      );
      eventIds.push(...chordEventIds);

      currentBeat += barChord.beats;
      barBeatCursor += barChord.beats;
    }

    // Schedule bass and drums at bar level (walking bass spans chord changes)
    if (parsedBarChords.length > 0) {
      const bassEventIds = scheduleBassForBar(
        transport,
        style.patterns.bass.events,
        progression,
        barIndex,
        parsedBarChords,
        barStartBeat,
        beatsPerBar,
        instruments.bass,
        style.instruments.bass.octave,
        instrumentOffsets?.bass ?? 0,
        getPatternVariantIndex(barIndex, 0, 4, loopIteration),
        humanization?.bass,
        loopIteration,
        bassSwingRatio,
      );
      eventIds.push(...bassEventIds);

      if (instruments.drums) {
        const drumEventIds = scheduleDrumsForBar(
          transport,
          style.patterns.drums.events,
          barStartBeat,
          beatsPerBar,
          instruments.drums,
          instrumentOffsets?.drums ?? 0,
          humanization?.drums,
          { barIndex },
          loopIteration,
          drumsSwingRatio,
        );
        eventIds.push(...drumEventIds);
      }
    }
  }

  // Calculate total bars
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

  if (currentChordIndex < currentBar.chords.length - 1) {
    return currentBar.chords[currentChordIndex + 1] ?? null;
  }

  if (currentBarIndex < progression.bars.length - 1) {
    const nextBar = progression.bars[currentBarIndex + 1];
    return nextBar?.chords[0] ?? null;
  }

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
