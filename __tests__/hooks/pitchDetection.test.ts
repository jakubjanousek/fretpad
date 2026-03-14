import { Note } from "tonal";
import { describe, expect, it } from "vitest";

import { evaluateHit, getTargetChromas } from "@/hooks/usePitchDetection";
import type { Chord, NoteName } from "@/lib/types";

/** Safe chroma lookup — throws if note is invalid (catches test typos) */
function chroma(note: string): number {
  const c = Note.chroma(note);
  if (c === undefined) throw new Error(`Invalid note: ${note}`);
  return c;
}

function makeChord(
  root: NoteName,
  notes: NoteName[],
  guideTones: NoteName[],
): Chord {
  return {
    symbol: `${root}maj7`,
    root,
    quality: "maj7",
    notes,
    guideTones,
    suggestedScales: [],
  };
}

const Cmaj7 = makeChord("C", ["C", "E", "G", "B"], ["E", "B"]);
const Dm7 = makeChord("D", ["D", "F", "A", "C"], ["F", "C"]);

describe("getTargetChromas", () => {
  it("returns all chord tone chromas for chord-tones mode", () => {
    const chromas = getTargetChromas(Cmaj7, "chord-tones");
    expect(chromas.size).toBe(4);
    expect(chromas.has(chroma("C"))).toBe(true);
    expect(chromas.has(chroma("E"))).toBe(true);
    expect(chromas.has(chroma("G"))).toBe(true);
    expect(chromas.has(chroma("B"))).toBe(true);
  });

  it("returns root + guide tones for guide-tones-only mode", () => {
    const chromas = getTargetChromas(Cmaj7, "guide-tones-only");
    expect(chromas.size).toBe(3);
    expect(chromas.has(chroma("C"))).toBe(true);
    expect(chromas.has(chroma("E"))).toBe(true);
    expect(chromas.has(chroma("B"))).toBe(true);
    // G (5th) is not included
    expect(chromas.has(chroma("G"))).toBe(false);
  });

  it("falls back to all chord tones for 'none' mode", () => {
    const result = getTargetChromas(Cmaj7, "none");
    expect(result.size).toBe(4);
  });

  it("falls back to all chord tones for 'strong-beats' mode", () => {
    const result = getTargetChromas(Dm7, "strong-beats");
    expect(result.size).toBe(4);
  });
});

describe("evaluateHit", () => {
  const BUFFER_SIZE = 128;

  function makeBuffers() {
    return {
      chromaBuf: new Uint8Array(BUFFER_SIZE),
      clarityBuf: new Float32Array(BUFFER_SIZE),
      timestampBuf: new Float64Array(BUFFER_SIZE),
    };
  }

  it("returns true when target chroma detected within window", () => {
    const { chromaBuf, clarityBuf, timestampBuf } = makeBuffers();
    const c = chroma("C");

    chromaBuf[0] = c;
    clarityBuf[0] = 0.9;
    timestampBuf[0] = 500;

    const targets = new Set([c]);
    const hit = evaluateHit(
      chromaBuf,
      clarityBuf,
      timestampBuf,
      1,
      BUFFER_SIZE,
      400,
      600,
      targets,
    );
    expect(hit).toBe(true);
  });

  it("returns false when detection is outside window", () => {
    const { chromaBuf, clarityBuf, timestampBuf } = makeBuffers();
    const c = chroma("C");

    chromaBuf[0] = c;
    clarityBuf[0] = 0.9;
    timestampBuf[0] = 300;

    const targets = new Set([c]);
    const hit = evaluateHit(
      chromaBuf,
      clarityBuf,
      timestampBuf,
      1,
      BUFFER_SIZE,
      400,
      600,
      targets,
    );
    expect(hit).toBe(false);
  });

  it("returns false when non-target note is detected", () => {
    const { chromaBuf, clarityBuf, timestampBuf } = makeBuffers();
    const d = chroma("D");

    chromaBuf[0] = d;
    clarityBuf[0] = 0.9;
    timestampBuf[0] = 500;

    const targets = new Set([chroma("C")]);
    const hit = evaluateHit(
      chromaBuf,
      clarityBuf,
      timestampBuf,
      1,
      BUFFER_SIZE,
      400,
      600,
      targets,
    );
    expect(hit).toBe(false);
  });

  it("filters out low-confidence detections", () => {
    const { chromaBuf, clarityBuf, timestampBuf } = makeBuffers();
    const c = chroma("C");

    chromaBuf[0] = c;
    clarityBuf[0] = 0.5;
    timestampBuf[0] = 500;

    const targets = new Set([c]);
    const hit = evaluateHit(
      chromaBuf,
      clarityBuf,
      timestampBuf,
      1,
      BUFFER_SIZE,
      400,
      600,
      targets,
    );
    expect(hit).toBe(false);
  });

  it("returns false for empty buffer (silence)", () => {
    const { chromaBuf, clarityBuf, timestampBuf } = makeBuffers();
    const targets = new Set([chroma("C")]);

    const hit = evaluateHit(
      chromaBuf,
      clarityBuf,
      timestampBuf,
      0,
      BUFFER_SIZE,
      400,
      600,
      targets,
    );
    expect(hit).toBe(false);
  });

  it("handles ring buffer wraparound correctly", () => {
    const { chromaBuf, clarityBuf, timestampBuf } = makeBuffers();
    const c = chroma("C");

    const writeIndex = BUFFER_SIZE + 5;
    const idx = (writeIndex - 1) % BUFFER_SIZE;
    chromaBuf[idx] = c;
    clarityBuf[idx] = 0.9;
    timestampBuf[idx] = 500;

    const targets = new Set([c]);
    const hit = evaluateHit(
      chromaBuf,
      clarityBuf,
      timestampBuf,
      writeIndex,
      BUFFER_SIZE,
      400,
      600,
      targets,
    );
    expect(hit).toBe(true);
  });

  it("matches octave-agnostic (chroma-only)", () => {
    const { chromaBuf, clarityBuf, timestampBuf } = makeBuffers();
    const c3 = chroma("C3");
    const c4 = chroma("C4");
    expect(c3).toBe(c4);

    chromaBuf[0] = c3;
    clarityBuf[0] = 0.9;
    timestampBuf[0] = 500;

    const targets = new Set([c4]);
    const hit = evaluateHit(
      chromaBuf,
      clarityBuf,
      timestampBuf,
      1,
      BUFFER_SIZE,
      400,
      600,
      targets,
    );
    expect(hit).toBe(true);
  });

  it("scans multiple entries and finds a match", () => {
    const { chromaBuf, clarityBuf, timestampBuf } = makeBuffers();
    const c = chroma("C");
    const d = chroma("D");

    chromaBuf[0] = d;
    clarityBuf[0] = 0.9;
    timestampBuf[0] = 450;

    chromaBuf[1] = c;
    clarityBuf[1] = 0.9;
    timestampBuf[1] = 480;

    chromaBuf[2] = d;
    clarityBuf[2] = 0.9;
    timestampBuf[2] = 520;

    const targets = new Set([c]);
    const hit = evaluateHit(
      chromaBuf,
      clarityBuf,
      timestampBuf,
      3,
      BUFFER_SIZE,
      400,
      600,
      targets,
    );
    expect(hit).toBe(true);
  });
});
