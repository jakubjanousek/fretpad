import { describe, expect, it } from "vitest";
import { Note } from "tonal";
import { getRootlessVoicing, getWalkingBassLine } from "@/lib/audio/voicings";
import { parseChordSymbol } from "@/lib/theory/chords";

describe("audio voicings", () => {
  it("builds a deterministic walking line with diatonic and chromatic connectors", () => {
    const chord = parseChordSymbol("Dm7");
    const nextChord = parseChordSymbol("G7");

    if (!chord || !nextChord) {
      throw new Error("Expected test chords to parse");
    }

    const line = getWalkingBassLine(chord, {
      octave: 2,
      steps: 3,
      variationIndex: 1,
      nextChord,
    });

    expect(line).toEqual(["D2", "E2", "Gb2"]);
  });

  it("varies the walking direction across repeated harmony deterministically", () => {
    const chord = parseChordSymbol("Cmaj7");

    if (!chord) {
      throw new Error("Expected test chord to parse");
    }

    const ascendingLine = getWalkingBassLine(chord, {
      octave: 2,
      steps: 4,
      variationIndex: 0,
      nextChord: chord,
    });
    const descendingLine = getWalkingBassLine(chord, {
      octave: 2,
      steps: 4,
      variationIndex: 1,
      nextChord: chord,
    });

    expect(Note.midi(ascendingLine[1]!) ?? 0).toBeGreaterThan(
      Note.midi(ascendingLine[0]!) ?? 0,
    );
    expect(Note.midi(descendingLine[1]!) ?? 0).toBeLessThan(
      Note.midi(descendingLine[0]!) ?? 0,
    );
  });

  it("aims the final walking note as a chromatic approach to the next bass", () => {
    const chord = parseChordSymbol("G7");
    const nextChord = parseChordSymbol("Cmaj7");

    if (!chord || !nextChord) {
      throw new Error("Expected test chords to parse");
    }

    const line = getWalkingBassLine(chord, {
      octave: 2,
      steps: 4,
      variationIndex: 2,
      nextChord,
    });

    expect(line).toEqual(["G2", "Gb2", "D2", "Db2"]);
    expect(
      Math.abs(
        (Note.midi(`${nextChord.root}2`) ?? 0) - (Note.midi(line[3]!) ?? 0),
      ),
    ).toBe(1);
  });

  it("creates rootless comping voicings without doubling the root", () => {
    const chord = parseChordSymbol("Cmaj7");

    if (!chord) {
      throw new Error("Expected test chord to parse");
    }

    const voicing = getRootlessVoicing(chord, 4);

    expect(voicing.notes).toEqual(["E4", "B4", "G5"]);
    expect(voicing.bassNote).toBe("C2");
  });
});
