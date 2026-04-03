// Preview

// Instruments
export {
  type BassInstrument,
  createBassInstrument,
} from "./instruments/bassInstrument";
export {
  type ChordInstrument,
  createChordInstrument,
} from "./instruments/chordInstrument";
export {
  createDrumInstrument,
  type DrumInstrument,
} from "./instruments/drumInstrument";
export {
  createMetronomeInstrument,
  METRONOME_ACCENT_NOTE,
  METRONOME_CLICK_NOTE,
  type MetronomeInstrument,
} from "./instruments/metronomeInstrument";
export { createSampleDrumInstrument } from "./instruments/sampleDrumInstrument";
export {
  disposePreview,
  playChordArpeggio,
  playChordPreview,
  playScalePreview,
  stopPreview,
} from "./preview";
// Scheduler
export {
  clearScheduledEvents,
  scheduleCountIn,
  scheduleProgression,
} from "./scheduler";
// Styles
export { AVAILABLE_STYLES, DEFAULT_STYLE_ID, getStyle } from "./styles";
