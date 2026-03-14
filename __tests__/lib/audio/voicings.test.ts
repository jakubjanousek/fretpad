import { describe, expect, it } from "vitest";
import { getRootlessVoicing, getWalkingBassLine } from "@/lib/audio/voicings";
import { parseChordSymbol } from "@/lib/theory/chords";

describe("audio voicings", () => {
  it("builds a deterministic walking line toward the next chord", () => {
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

    expect(line).toEqual(["D2", "F2", "A2"]);
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
