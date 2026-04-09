import { describe, expect, it } from "vitest";
import {
  computeVoiceLeadingPath,
  voicingTransitionCost,
} from "@/lib/guitar/voiceLeading";
import { generateVoicingsForChord } from "@/lib/guitar/voicingGenerator";
import { parseChordSymbol } from "@/lib/theory/chords";
import type { Chord, GuitarVoicing } from "@/lib/types";

function chord(symbol: string): Chord {
  const c = parseChordSymbol(symbol);
  if (!c) throw new Error(`Failed to parse: ${symbol}`);
  return c;
}

/** Helper: create a minimal voicing for testing cost function */
function makeVoicing(
  frets: (number | null)[],
  overrides?: Partial<GuitarVoicing>,
): GuitarVoicing {
  return {
    id: `test-${frets.join("-")}`,
    name: "test",
    type: "shell",
    positions: frets.map((f, i) => ({
      string: i + 1,
      fret: f === null ? -1 : f,
      note: "C",
    })),
    baseFret: Math.min(
      ...frets.filter((f): f is number => f !== null && f > 0),
    ),
    isBarreChord: false,
    difficulty: "intermediate",
    inversion: 0,
    ...overrides,
  };
}

describe("voicingTransitionCost", () => {
  it("returns 0 for identical voicings", () => {
    const v = makeVoicing([null, null, 5, 5, null, 5]);
    expect(voicingTransitionCost(v, v)).toBe(0);
  });

  it("returns low cost for nearby voicings", () => {
    const v1 = makeVoicing([null, null, 5, 5, null, 5]);
    const v2 = makeVoicing([null, null, 6, 5, null, 6]);
    const cost = voicingTransitionCost(v1, v2);
    expect(cost).toBeGreaterThan(0);
    expect(cost).toBeLessThan(10);
  });

  it("returns higher cost for distant voicings", () => {
    const v1 = makeVoicing([null, null, 3, 3, null, 3]);
    const v2 = makeVoicing([null, null, 10, 10, null, 10]);
    const cost = voicingTransitionCost(v1, v2);
    expect(cost).toBeGreaterThan(15);
  });

  it("is symmetric", () => {
    const v1 = makeVoicing([null, null, 3, 4, null, 5]);
    const v2 = makeVoicing([null, null, 7, 8, null, 7]);
    expect(voicingTransitionCost(v1, v2)).toBe(voicingTransitionCost(v2, v1));
  });

  it("penalizes muted-to-sounding string changes", () => {
    const v1 = makeVoicing([null, null, 5, 5, null, 5]);
    const v2Same = makeVoicing([null, null, 6, 6, null, 6]);
    const v2Different = makeVoicing([null, 6, 6, null, null, 6]);
    // v2Different has different sounding strings than v1, should cost more
    expect(voicingTransitionCost(v1, v2Different)).toBeGreaterThan(
      voicingTransitionCost(v1, v2Same),
    );
  });
});

describe("computeVoiceLeadingPath", () => {
  function makeIIVI() {
    const chords = [chord("Dm7"), chord("G7"), chord("Cmaj7")];
    const voicingsPerChord = chords.map((c) => generateVoicingsForChord(c));
    return { chords, voicingsPerChord };
  }

  it("returns one voicing per chord", () => {
    const { chords, voicingsPerChord } = makeIIVI();
    const path = computeVoiceLeadingPath(chords, voicingsPerChord);
    expect(path).toHaveLength(3);
  });

  it("returns valid voicings (each belongs to its chord's candidates)", () => {
    const { chords, voicingsPerChord } = makeIIVI();
    const path = computeVoiceLeadingPath(chords, voicingsPerChord);

    for (let i = 0; i < path.length; i++) {
      const candidates = voicingsPerChord[i];
      const selected = path[i];
      expect(candidates?.some((c) => c.id === selected?.id)).toBe(true);
    }
  });

  it("minimizes movement for ii-V-I", () => {
    const { chords, voicingsPerChord } = makeIIVI();
    const path = computeVoiceLeadingPath(chords, voicingsPerChord);

    const p0 = path[0];
    const p1 = path[1];
    const p2 = path[2];
    if (!p0 || !p1 || !p2) throw new Error("path incomplete");

    const pathCost =
      voicingTransitionCost(p0, p1) + voicingTransitionCost(p1, p2);

    // Pick an arbitrary (likely worse) combination
    const w0 = voicingsPerChord[0]?.[0];
    const w1Last = voicingsPerChord[1]?.[voicingsPerChord[1].length - 1];
    const w2 = voicingsPerChord[2]?.[0];
    if (!w0 || !w1Last || !w2) throw new Error("missing voicings");

    const worstCost =
      voicingTransitionCost(w0, w1Last) + voicingTransitionCost(w1Last, w2);

    expect(pathCost).toBeLessThanOrEqual(worstCost);
  });

  it("keeps voicings in a similar fretboard region", () => {
    const { chords, voicingsPerChord } = makeIIVI();
    const path = computeVoiceLeadingPath(chords, voicingsPerChord);

    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      if (!current || !next) throw new Error("path incomplete");
      const diff = Math.abs(current.baseFret - next.baseFret);
      expect(diff).toBeLessThanOrEqual(5);
    }
  });

  it("handles single chord progression", () => {
    const chords = [chord("Cmaj7")];
    const voicingsPerChord = chords.map((c) => generateVoicingsForChord(c));
    const path = computeVoiceLeadingPath(chords, voicingsPerChord);
    expect(path).toHaveLength(1);
  });

  it("handles repeated chords", () => {
    const chords = [chord("Cmaj7"), chord("Cmaj7"), chord("Cmaj7")];
    const voicingsPerChord = chords.map((c) => generateVoicingsForChord(c));
    const path = computeVoiceLeadingPath(chords, voicingsPerChord);
    expect(path).toHaveLength(3);
    // For repeated chords, should pick the same voicing
    expect(path[0]?.id).toBe(path[1]?.id);
    expect(path[1]?.id).toBe(path[2]?.id);
  });

  it("preserves path length when some groups are empty", () => {
    const chords = [chord("Cmaj7"), chord("C"), chord("Dm7")];
    // Simulate a filter that removes all voicings for the middle chord
    const voicingsPerChord = [
      generateVoicingsForChord(chords[0]!),
      [], // empty group
      generateVoicingsForChord(chords[2]!),
    ];
    const path = computeVoiceLeadingPath(chords, voicingsPerChord);
    expect(path).toHaveLength(3);
    expect(path[0]).toBeDefined();
    expect(path[1]).toBeUndefined();
    expect(path[2]).toBeDefined();
  });

  it("returns correct length when all groups are empty", () => {
    const chords = [chord("Cmaj7"), chord("Dm7")];
    const path = computeVoiceLeadingPath(chords, [[], []]);
    expect(path).toHaveLength(2);
  });
});
