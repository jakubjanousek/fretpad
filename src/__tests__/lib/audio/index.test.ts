import { describe, expect, it } from "vitest";
/**
 * Tests that the audio barrel export exposes all public API functions
 * needed by external consumers.
 */
import {
  // Styles
  AVAILABLE_STYLES,
  clearScheduledEvents,
  // Instruments
  createBassInstrument,
  createChordInstrument,
  createDrumInstrument,
  createMetronomeInstrument,
  DEFAULT_STYLE_ID,
  disposePreview,
  getStyle,
  // Preview
  playChordPreview,
  playScalePreview,
  scheduleCountIn,
  // Scheduler
  scheduleProgression,
  stopPreview,
} from "@/lib/audio";

describe("lib/audio barrel export", () => {
  it("exports preview functions", () => {
    expect(playChordPreview).toBeTypeOf("function");
    expect(playScalePreview).toBeTypeOf("function");
    expect(stopPreview).toBeTypeOf("function");
    expect(disposePreview).toBeTypeOf("function");
  });

  it("exports style definitions", () => {
    expect(AVAILABLE_STYLES).toHaveLength(1);
    expect(DEFAULT_STYLE_ID).toBe("jazzSwing");
    const style = getStyle("jazzSwing");
    expect(style.name).toBeTruthy();
  });

  it("exports scheduler functions", () => {
    expect(scheduleProgression).toBeTypeOf("function");
    expect(scheduleCountIn).toBeTypeOf("function");
    expect(clearScheduledEvents).toBeTypeOf("function");
  });

  it("exports instrument factories", () => {
    expect(createBassInstrument).toBeTypeOf("function");
    expect(createChordInstrument).toBeTypeOf("function");
    expect(createDrumInstrument).toBeTypeOf("function");
    expect(createMetronomeInstrument).toBeTypeOf("function");
  });
});
