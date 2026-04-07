import { beforeEach, describe, expect, it, vi } from "vitest";

const toneMock = vi.hoisted(() => {
  const scheduled: Array<{
    callback: (audioTime: number) => void;
    time: string;
  }> = [];

  const transport = {
    schedule: vi.fn((callback: (audioTime: number) => void, time: string) => {
      scheduled.push({ callback, time });
      return scheduled.length;
    }),
    clear: vi.fn(),
  };

  return {
    scheduled,
    transport,
  };
});

vi.mock("tone", () => ({
  Draw: {
    schedule: vi.fn((callback: () => void) => {
      callback();
    }),
  },
  getTransport: () => toneMock.transport,
  now: () => 0,
}));

import { scheduleProgression } from "@/lib/audio";
import { parseTimeToBeats } from "@/lib/audio/scheduler";
import { jazzSwingStyle } from "@/lib/audio/styles/jazzSwing";
import { parseProgression } from "@/lib/theory/progression";

function collectChordEventBeats(progressionText: string): number[] {
  const progression = parseProgression(progressionText);
  expect(progression).not.toBeNull();
  if (!progression) {
    throw new Error(`Expected progression to parse: ${progressionText}`);
  }

  const chordInstrument = {
    dispose: vi.fn(),
    triggerAttackRelease: vi.fn(),
    volume: { value: -16 },
  };
  const bassInstrument = {
    dispose: vi.fn(),
    triggerAttackRelease: vi.fn(),
    volume: { value: -8 },
  };

  scheduleProgression(
    progression,
    jazzSwingStyle,
    {
      bass: bassInstrument,
      chord: chordInstrument,
    },
    vi.fn(),
    {
      bpm: 120,
      compingVariations: true,
    },
  );

  const chordEventBeats: number[] = [];

  for (const scheduledEvent of toneMock.scheduled) {
    const beforeCalls = chordInstrument.triggerAttackRelease.mock.calls.length;
    scheduledEvent.callback(0);
    if (chordInstrument.triggerAttackRelease.mock.calls.length > beforeCalls) {
      chordEventBeats.push(parseTimeToBeats(scheduledEvent.time));
    }
  }

  return chordEventBeats.sort((left, right) => left - right);
}

describe("scheduleProgression comping placement", () => {
  beforeEach(() => {
    toneMock.scheduled.length = 0;
    toneMock.transport.schedule.mockClear();
    toneMock.transport.clear.mockClear();
  });

  it("states each full-bar chord within the first beat of its bar", () => {
    const chordEventBeats = collectChordEventBeats(
      "| Dm7 | G7 | Cmaj7 | Cmaj7 |",
    );

    for (let barIndex = 0; barIndex < 4; barIndex++) {
      const barStartBeat = barIndex * 4;
      const relativeChordBeats = chordEventBeats
        .filter((beat) => beat >= barStartBeat && beat < barStartBeat + 4)
        .map((beat) => beat - barStartBeat);

      expect(relativeChordBeats.length).toBeGreaterThan(0);
      expect(relativeChordBeats[0]).toBeLessThanOrEqual(1);
    }
  });

  it("restarts comping from the top of each half-bar chord slot", () => {
    const chordEventBeats = collectChordEventBeats("| Dm7 G7 | Cmaj7 |");

    const firstHalfRelativeBeats = chordEventBeats
      .filter((beat) => beat >= 0 && beat < 2)
      .map((beat) => beat);
    const secondHalfRelativeBeats = chordEventBeats
      .filter((beat) => beat >= 2 && beat < 4)
      .map((beat) => beat - 2);

    expect(firstHalfRelativeBeats.length).toBeGreaterThan(0);
    expect(secondHalfRelativeBeats.length).toBeGreaterThan(0);
    expect(firstHalfRelativeBeats[0]).toBeLessThanOrEqual(1);
    expect(secondHalfRelativeBeats[0]).toBeLessThanOrEqual(1);
  });
});
