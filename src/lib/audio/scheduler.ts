import * as Tone from "tone";
import type { BassInstrument } from "@/lib/audio/instruments/bassInstrument";
import type { ChordInstrument } from "@/lib/audio/instruments/chordInstrument";
import type { DrumInstrument } from "@/lib/audio/instruments/drumInstrument";
import {
  METRONOME_ACCENT_NOTE,
  METRONOME_CLICK_NOTE,
  type MetronomeInstrument,
} from "@/lib/audio/instruments/metronomeInstrument";
import { clamp } from "@/lib/clamp";
import { parseChordSymbol } from "@/lib/theory";
import type {
  Chord,
  ChordPatternEvent,
  DrumPatternEvent,
  GrooveTemplate,
  MetronomeConfig,
  PatternEvent,
  Progression,
  StyleDefinition,
} from "@/lib/types";
import {
  applyGrooveTemplate,
  getGrooveVelocityMultiplier,
} from "./grooveTemplates";
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

interface ResolvedChordPattern {
  events: ChordPatternEvent[];
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
 * Applies groove template if available, otherwise falls back to swing.
 */
function applyTimingFeel(
  beatInBar: number,
  swingRatio: number,
  grooveTemplate?: GrooveTemplate,
): number {
  if (grooveTemplate) {
    return applyGrooveTemplate(beatInBar, grooveTemplate);
  }
  return applySwing(beatInBar, swingRatio);
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

function getChordPatternForSlot(
  pattern: StyleDefinition["patterns"]["chord"],
  chordBeats: number,
  barIndex: number,
  chordIndex: number,
  loopIteration: number,
  useVariations: boolean,
): ResolvedChordPattern {
  const slotPattern = pattern.slotVariants?.find(
    (candidate) => candidate.slotBeats === chordBeats,
  );

  if (slotPattern) {
    const variants = useVariations ? slotPattern.variants : undefined;
    return {
      events:
        variants?.[
          getPatternVariantIndex(
            barIndex,
            chordIndex,
            variants.length,
            loopIteration,
          )
        ] ?? slotPattern.events,
    };
  }

  const variants = useVariations ? pattern.variants : undefined;
  return {
    events:
      variants?.[
        getPatternVariantIndex(
          barIndex,
          chordIndex,
          variants.length,
          loopIteration,
        )
      ] ?? pattern.events,
  };
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

/**
 * Computes correlated humanization for a sequence of events using an AR(1) drift model.
 * Each event's offset is a blend of the previous drift and new noise, creating
 * natural push-pull timing instead of independent scatter.
 *
 * drift[n] = correlation * drift[n-1] + (1 - correlation) * noise[n]
 *
 * With correlation=0, output matches independent getHumanization exactly.
 */
export function getCorrelatedHumanization(
  profile: HumanizationProfile | undefined,
  instrument: "bass" | "chord" | "drums",
  context: Omit<HumanizationContext, "eventIndex">,
  eventCount: number,
): HumanizationResult[] {
  if (!profile || eventCount === 0) {
    return Array.from({ length: eventCount }, () => ({
      timingOffsetBeats: 0,
      velocityOffset: 0,
      durationOffsetBeats: 0,
    }));
  }

  const correlation = profile.correlation ?? 0;
  const results: HumanizationResult[] = [];
  let timingDrift = 0;
  let velocityDrift = 0;
  let durationDrift = 0;

  for (let i = 0; i < eventCount; i++) {
    const independent = getHumanization(profile, instrument, {
      ...context,
      eventIndex: i,
    });

    if (correlation === 0) {
      results.push(independent);
      continue;
    }

    // AR(1): blend previous drift with new noise
    timingDrift =
      correlation * timingDrift +
      (1 - correlation) * independent.timingOffsetBeats;
    velocityDrift =
      correlation * velocityDrift +
      (1 - correlation) * independent.velocityOffset;
    durationDrift =
      correlation * durationDrift +
      (1 - correlation) * independent.durationOffsetBeats;

    // Clamp to profile bounds
    const timingBeats = profile.timingBeats ?? 0;
    const velocityDelta = profile.velocityDelta ?? 0;
    const durationBeats = profile.durationBeats ?? 0;

    results.push({
      timingOffsetBeats: clamp(timingDrift, -timingBeats, timingBeats),
      velocityOffset: clamp(velocityDrift, -velocityDelta, velocityDelta),
      durationOffsetBeats: clamp(durationDrift, -durationBeats, durationBeats),
    });
  }

  return results;
}

/**
 * Returns a velocity multiplier for the given bar based on a phrase contour.
 * Creates musical arcs (e.g., build over 4 bars then reset).
 */
export function getPhraseVelocityMultiplier(
  barIndex: number,
  phraseDynamics?: { phraseLengthBars: number; velocityContour: number[] },
): number {
  if (!phraseDynamics) return 1.0;
  const position = barIndex % phraseDynamics.phraseLengthBars;
  return phraseDynamics.velocityContour[position] ?? 1.0;
}

/**
 * Generates a deterministic per-beat timing offset shared between bass and drums
 * (the "pocket"). Both instruments reference this offset so they move together.
 */
export function getPocketOffset(
  barIndex: number,
  beatIndex: number,
  loopIteration: number,
  scale: number,
): number {
  const seed = `pocket:${barIndex}:${beatIndex}:loop:${loopIteration}`;
  return getDeterministicCenteredValue(seed) * scale;
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
  grooveTemplate?: GrooveTemplate,
  pocketWeight = 0,
  velocityMultiplier = 1,
): number[] {
  const eventIds: number[] = [];
  const activePattern = pattern
    .map((event, patternEventIndex) => ({
      event,
      patternEventIndex,
      eventBeat: applyTimingFeel(
        resolveBarEventBeat(event, instrumentOffsetBeats),
        swingRatio,
        grooveTemplate,
      ),
    }))
    .filter(({ eventBeat }) => eventBeat < beatsPerBar);

  // Pre-compute correlated humanization for all events in the bar
  const barHumanization = getCorrelatedHumanization(
    humanizationProfile,
    "bass",
    { loopIteration, barIndex, chordIndex: 0 },
    activePattern.length,
  );

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
      const humanization = barHumanization[
        activePattern.findIndex(
          (p) => p.patternEventIndex === patternEventIndex,
        )
      ] ?? { timingOffsetBeats: 0, velocityOffset: 0, durationOffsetBeats: 0 };

      // Blend pocket offset with individual humanization
      const beatIndex = Math.floor(baseEventBeat);
      const pocketScale = humanizationProfile?.timingBeats ?? 0;
      const pocket = getPocketOffset(
        barIndex,
        beatIndex,
        loopIteration,
        pocketScale,
      );
      const timingOffset =
        pocketWeight * pocket +
        (1 - pocketWeight) * humanization.timingOffsetBeats;

      const maxDrift = (humanizationProfile?.timingBeats ?? 0) * 2;
      const eventBeat = clamp(
        baseEventBeat + timingOffset,
        Math.max(0, baseEventBeat - maxDrift),
        Math.min(beatsPerBar - 0.01, baseEventBeat + maxDrift),
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
          ((event.velocity ?? 0.8) + humanization.velocityOffset) *
            velocityMultiplier,
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
  grooveTemplate?: GrooveTemplate,
  velocityMultiplier = 1,
): number[] {
  const eventIds: number[] = [];

  // Pre-compute correlated humanization for chord events
  const chordHumanization = getCorrelatedHumanization(
    humanizationProfile,
    "chord",
    {
      loopIteration,
      barIndex: scheduleContext?.barIndex ?? 0,
      chordIndex: scheduleContext?.chordIndex ?? 0,
    },
    pattern.length,
  );

  for (const [eventIndex, event] of pattern.entries()) {
    const humanization = chordHumanization[eventIndex] ?? {
      timingOffsetBeats: 0,
      velocityOffset: 0,
      durationOffsetBeats: 0,
    };
    const baseChordBeat = applyTimingFeel(
      resolveBarEventBeat(event, instrumentOffsetBeats),
      swingRatio,
      grooveTemplate,
    );
    const maxChordDrift = (humanizationProfile?.timingBeats ?? 0) * 2;
    const eventBeat = clamp(
      baseChordBeat + humanization.timingOffsetBeats,
      Math.max(0, baseChordBeat - maxChordDrift),
      Math.min(chordBeats - 0.01, baseChordBeat + maxChordDrift),
    );
    const absoluteBeat = startBeat + eventBeat;

    if (eventBeat >= chordBeats) continue;

    const time = beatsToTime(absoluteBeat);
    const duration = resolveHumanizedDuration(
      event.duration,
      humanization.durationOffsetBeats,
    );

    const rawEventBeat = resolveBarEventBeat(event, instrumentOffsetBeats);
    const grooveVelocity = getGrooveVelocityMultiplier(
      rawEventBeat,
      grooveTemplate,
    );
    const eventId = transport.schedule((audioTime) => {
      const safeTime = Math.max(audioTime, Tone.now());
      const voicing = getVoicing(chord, event.voicingType, chordOctave);
      const velocity = clamp(
        ((event.velocity ?? 0.6) + humanization.velocityOffset) *
          velocityMultiplier *
          grooveVelocity,
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
  grooveTemplate?: GrooveTemplate,
  pocketWeight = 0,
  velocityMultiplier = 1,
): number[] {
  const eventIds: number[] = [];
  const activePattern = pattern
    .map((event, eventIndex) => ({
      event,
      eventIndex,
      eventBeat: applyTimingFeel(
        resolveBarEventBeat(event, instrumentOffsetBeats),
        swingRatio,
        grooveTemplate,
      ),
    }))
    .filter(({ eventBeat }) => eventBeat < beatsPerBar);

  // Pre-compute correlated humanization for all drum events in the bar
  const barHumanization = getCorrelatedHumanization(
    humanizationProfile,
    "drums",
    { loopIteration, barIndex: scheduleContext?.barIndex ?? 0, chordIndex: 0 },
    activePattern.length,
  );

  for (const [
    i,
    { event, eventBeat: baseEventBeat },
  ] of activePattern.entries()) {
    const humanization = barHumanization[i] ?? {
      timingOffsetBeats: 0,
      velocityOffset: 0,
      durationOffsetBeats: 0,
    };

    // Blend pocket offset with individual humanization
    const beatIndex = Math.floor(baseEventBeat);
    const barIndex = scheduleContext?.barIndex ?? 0;
    const pocketScale = humanizationProfile?.timingBeats ?? 0;
    const pocket = getPocketOffset(
      barIndex,
      beatIndex,
      loopIteration,
      pocketScale,
    );
    const timingOffset =
      pocketWeight * pocket +
      (1 - pocketWeight) * humanization.timingOffsetBeats;

    const maxDrift = (humanizationProfile?.timingBeats ?? 0) * 2;
    const eventBeat = clamp(
      baseEventBeat + timingOffset,
      Math.max(0, baseEventBeat - maxDrift),
      Math.min(beatsPerBar - 0.01, baseEventBeat + maxDrift),
    );
    const absoluteBeat = startBeat + eventBeat;
    const time = beatsToTime(absoluteBeat);

    const grooveVelocity = getGrooveVelocityMultiplier(
      baseEventBeat,
      grooveTemplate,
    );
    const eventId = transport.schedule((audioTime) => {
      const velocity = clamp(
        ((event.velocity ?? 0.7) + humanization.velocityOffset) *
          velocityMultiplier *
          grooveVelocity,
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

  const pocketWeight = style.timing?.pocket?.weight ?? 0;
  const phraseDynamics = style.timing?.phraseDynamics;
  const countInOffset = (options?.countInBars ?? 0) * beatsPerBar;
  let currentBeat = countInOffset;

  for (let barIndex = 0; barIndex < progression.bars.length; barIndex++) {
    const bar = progression.bars[barIndex];
    if (!bar) continue;
    const barStartBeat = currentBeat;
    const parsedBarChords: ParsedBarChordSlot[] = [];
    let barBeatCursor = 0;
    const barVelocityMultiplier = getPhraseVelocityMultiplier(
      barIndex,
      phraseDynamics,
    );

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
      const chordPatternEvents = getChordPatternForSlot(
        style.patterns.chord,
        barChord.beats,
        barIndex,
        chordIndex,
        loopIteration,
        options?.compingVariations !== false,
      ).events;
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
        style.grooveTemplates?.chord,
        barVelocityMultiplier,
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
        style.grooveTemplates?.bass,
        pocketWeight,
        barVelocityMultiplier,
      );
      eventIds.push(...bassEventIds);

      if (instruments.drums) {
        const drumPatternEvents = (() => {
          const drumVariants =
            options?.compingVariations !== false
              ? style.patterns.drums.variants
              : undefined;
          return (
            drumVariants?.[
              getPatternVariantIndex(
                barIndex,
                0,
                drumVariants.length,
                loopIteration,
              )
            ] ?? style.patterns.drums.events
          );
        })();
        const drumEventIds = scheduleDrumsForBar(
          transport,
          drumPatternEvents,
          barStartBeat,
          beatsPerBar,
          instruments.drums,
          instrumentOffsets?.drums ?? 0,
          humanization?.drums,
          { barIndex },
          loopIteration,
          drumsSwingRatio,
          style.grooveTemplates?.drums,
          pocketWeight,
          barVelocityMultiplier,
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
