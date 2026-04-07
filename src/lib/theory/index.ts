// Chords

// Arpeggios
export { getArpeggioConnections, getArpeggioNotes } from "./arpeggios";
export {
  getGuideTones,
  getIntervalName,
  isChordTone,
  isGuideTone,
  isRoot,
  parseChordSymbol,
} from "./chords";
export type { ProgressionAnalysis } from "./harmonicAnalysis";
// Harmonic Analysis
export { analyzeProgression, getAnalysisSummary } from "./harmonicAnalysis";
export type { DetectedKey } from "./keyDetection";
// Key Detection
export { detectKey } from "./keyDetection";
// Pentatonic / Overlays
export { getOverlayNotes } from "./pentatonic";
export type {
  PresetCategory,
  PresetDifficulty,
  PresetMetadata,
} from "./presets";
// Presets
export {
  getPresetsByCategory,
  PRESET_METADATA,
  PRESET_PROGRESSIONS,
} from "./presets";
// Progression
export {
  createProgression,
  getAllChordsFromProgression,
  getNextChord,
  getProgressionTotalBeats,
  parseBar,
  parseProgression,
} from "./progression";
// Scales
export {
  getPrimaryScale,
  getScaleNotes,
  getScaleTypeName,
  getSuggestedScalesForChord,
  isInScale,
} from "./scales";
// Target Notes
export {
  filterApproachNotesFromChordTones,
  getChromaticApproachNotes,
  getDiatonicApproachNotes,
  getTargetNotes,
  getTargetStrength,
} from "./targetNotes";
// Transpose
export { transposeChordSymbol, transposeProgression } from "./transpose";
