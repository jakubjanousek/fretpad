export type NoteName =
  | "C"
  | "C#"
  | "Db"
  | "D"
  | "D#"
  | "Eb"
  | "E"
  | "F"
  | "F#"
  | "Gb"
  | "G"
  | "G#"
  | "Ab"
  | "A"
  | "A#"
  | "Bb"
  | "B";

export type ChordSymbol = string; // e.g. "Cmaj7", "Dm7", "G7"

// Common chord qualities - use tonal for parsing, this is for display/logic
export type ChordQuality =
  | "maj" // C, Cmaj
  | "min" // Cm, Cmin
  | "maj7" // Cmaj7
  | "min7" // Cm7, Cmin7
  | "7" // C7 (dominant)
  | "min7b5" // Cm7b5, Cø
  | "dim" // Cdim
  | "dim7" // Cdim7
  | "aug" // Caug, C+
  | "sus2" // Csus2
  | "sus4" // Csus4
  | "6" // C6
  | "min6" // Cm6
  | "9" // C9
  | "maj9" // Cmaj9
  | "min9" // Cm9
  | "add9" // Cadd9
  | "other"; // fallback for complex chords

export interface Chord {
  symbol: ChordSymbol;
  root: NoteName;
  quality: ChordQuality;
  notes: NoteName[];
  guideTones: NoteName[]; // usually 3rd & 7th (or 3rd & 6th for 6 chords)
  suggestedScales: string[]; // ["C Ionian"], etc.
  bassNote?: NoteName; // Slash chord bass note (e.g., "G" in "C/G")
}

export interface BarChord {
  chord: ChordSymbol;
  beats: number; // how many beats this chord occupies in the bar
}

export interface ProgressionBar {
  id: string;
  totalBeats: number; // e.g. 4 for 4/4 time
  chords: BarChord[]; // 1-2 chords per bar, beats should sum to totalBeats
}

export interface Progression {
  id: string;
  name: string;
  timeSignature: { numerator: number; denominator: number }; // e.g. { 4, 4 }
  bars: ProgressionBar[];
}

export interface FretPosition {
  string: number; // 1 = high E, 6 = low E (standard guitar convention)
  fret: number; // 0 = open
}

export interface FretNote extends FretPosition {
  note: NoteName;
  interval: string; // e.g. "1", "b3", "5", "b7"
  isRoot: boolean;
  isChordTone: boolean;
  isGuideTone: boolean;
  isScaleTone: boolean;
  cagedPosition?: CAGEDPosition;
  threeNPSPosition?: ThreeNPSPosition;
}

export type ThreeNPSPosition = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Standard tuning - can be extended later for alternate tunings
export const STANDARD_TUNING: NoteName[] = ["E", "B", "G", "D", "A", "E"]; // high to low (string 1-6)

// ============================================
// Backing Track Types
// ============================================

export type StyleId =
  | "jazzSwing"
  | "popRock"
  | "bossaNova"
  | "ballad"
  | "funk"
  | "reggae"
  | "latinMontuno"
  | "neoSoul"
  | "country"
  | "metal";

export interface PatternEvent {
  time: string; // Tone.js time format: "0:0", "0:1", "0:2:2"
  duration: string; // Note duration: "4n", "8n", "2n"
  velocity?: number; // 0-1, defaults to 0.8
  offsetBeats?: number; // Explicit beat offset for swing feel or laid-back placement
  degree?: number; // Scale degree for bass (1, 3, 5, 7)
  type?: "root" | "fifth" | "chord" | "approach" | "walk";
}

export interface ChordPatternEvent {
  time: string;
  duration: string;
  velocity?: number;
  offsetBeats?: number;
  voicingType: "shell" | "full" | "triad" | "rootless";
}

export interface BassPattern {
  name: string;
  events: PatternEvent[];
}

export interface ChordPattern {
  name: string;
  events: ChordPatternEvent[];
  variants?: ChordPatternEvent[][];
}

export type DrumSound = "kick" | "snare" | "hihat" | "hihatOpen";

export interface DrumPatternEvent {
  time: string; // Tone.js time format
  sound: DrumSound;
  velocity?: number; // 0-1
  offsetBeats?: number;
}

export interface DrumPattern {
  name: string;
  events: DrumPatternEvent[];
}

export interface BassInstrumentConfig {
  octave: number;
  volume: number; // dB
  oscillatorType: "triangle" | "sine" | "square";
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

export interface ChordInstrumentConfig {
  octave: number;
  volume: number;
  oscillatorType: "triangle" | "sine";
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

export interface TempoRampConfig {
  enabled: boolean;
  increment: number; // BPM to add each ramp (1-20)
  everyNLoops: number; // ramp after N loops (1, 2, 4, 8)
  maxTempo: number; // ceiling BPM
}

export interface MetronomeConfig {
  enabled: boolean;
  volume: number; // dB, -20 to 0
  accentDownbeat: boolean; // Accent beat 1
  countIn: 0 | 1 | 2; // 0 = no count-in, 1 = 1 bar, 2 = 2 bars
}

export interface BackingTrackConfig {
  bassVolume: number; // dB, -30 to 0
  chordVolume: number; // dB, -30 to 0
  drumsVolume: number; // dB, -30 to 0
  bassMuted: boolean;
  chordMuted: boolean;
  drumsMuted: boolean;
}

export interface StyleDefinition {
  id: StyleId;
  name: string;
  description: string;
  swing: number; // 0-1, 0 = straight, 1 = full triplet swing
  timing?: {
    useTransportSwing?: boolean;
    instrumentOffsets?: {
      bass?: number;
      chord?: number;
      drums?: number;
    };
    humanization?: {
      bass?: {
        timingBeats?: number;
        timingDirection?: "centered" | "late" | "early";
        velocityDelta?: number;
        durationBeats?: number;
      };
      chord?: {
        timingBeats?: number;
        timingDirection?: "centered" | "late" | "early";
        velocityDelta?: number;
        durationBeats?: number;
      };
      drums?: {
        timingBeats?: number;
        timingDirection?: "centered" | "late" | "early";
        velocityDelta?: number;
        durationBeats?: number;
      };
    };
  };
  instruments: {
    bass: BassInstrumentConfig;
    chord: ChordInstrumentConfig;
  };
  patterns: {
    bass: BassPattern;
    chord: ChordPattern;
    drums: DrumPattern;
  };
}

// ============================================
// Fretboard Display Types
// ============================================

export type NoteLabelMode = "notes" | "degrees" | "none";

export type FretboardOverlay =
  | "none"
  | "pentatonicMinor"
  | "pentatonicMajor"
  | "blues"
  | "arpeggio";

export type CAGEDPosition = 1 | 2 | 3 | 4 | 5;

// ============================================
// Target Notes & Approach Types
// ============================================

export type TargetNoteMode =
  | "none"
  | "root"
  | "root-and-guides"
  | "chord-tones"
  | "all"
  | "strong-beats";

export type TargetStrength = "primary" | "secondary";

export type ApproachDirection = "ascending" | "descending";

export type ApproachType = "chromatic" | "diatonic";

export interface ApproachNote {
  note: NoteName;
  fret: number;
  string: number;
  targetFret: number;
  targetString: number;
  direction: ApproachDirection;
  type: ApproachType;
}

export interface EnclosurePattern {
  target: FretNote;
  above: FretPosition;
  below: FretPosition;
  aboveNote: NoteName;
  belowNote: NoteName;
}

export const CAGED_POSITION_LABELS: Record<CAGEDPosition, string> = {
  1: "E",
  2: "D",
  3: "C",
  4: "A",
  5: "G",
};

// ============================================
// Arpeggio Types
// ============================================

export interface ArpeggioConnection {
  from: FretPosition;
  to: FretPosition;
  fromDegree: string; // "1", "3", "5", "7"
  toDegree: string;
  cagedPosition: CAGEDPosition;
}

// ============================================
// Quiz Types
// ============================================

export interface QuizQuestion {
  targetNote: FretNote;
  chord: Chord;
  availableIntervals: string[]; // unique intervals like ["1", "b3", "5", "b7"]
}

// ============================================
// Guitar Voicing Types
// ============================================

/**
 * Ted Greene's V-System: categorizes voicings by which string has the root
 */
export type VSystemPosition =
  | "V-1" // Root on string 1 (high E)
  | "V-2" // Root on string 2 (B)
  | "V-3" // Root on string 3 (G)
  | "V-4" // Root on string 4 (D)
  | "V-5" // Root on string 5 (A)
  | "V-6"; // Root on string 6 (low E)

/**
 * String groups for organizing voicing families
 */
export type StringGroup =
  | "top4" // Strings 1-2-3-4 (high E to D)
  | "inner4" // Strings 2-3-4-5 (B to A)
  | "bottom4" // Strings 3-4-5-6 (G to low E)
  | "spread"; // Non-adjacent strings

/**
 * Voicing structure types
 */
export type VoicingStructure =
  | "close" // All voices within an octave
  | "drop2" // Second voice from top dropped an octave
  | "drop3" // Third voice from top dropped an octave
  | "drop24" // 2nd and 4th voices dropped
  | "spread"; // Voices spread across multiple octaves

/**
 * Guitar voicing type categories
 */
export type GuitarVoicingType =
  | "open" // Open chord shapes (cowboy chords)
  | "barre" // Movable barre chord shapes
  | "shell" // Root + 3rd + 7th (jazz voicings)
  | "drop2" // Drop 2 voicings
  | "drop3" // Drop 3 voicings
  | "triadic" // Simple 3-note shapes
  | "rootless"; // No root (jazz comping)

/**
 * Position on the fretboard for a single string
 */
export interface GuitarFretPosition {
  string: number; // 1-6 (1 = high E, 6 = low E)
  fret: number; // 0 = open, -1 = muted
  finger?: 1 | 2 | 3 | 4 | "T"; // Optional fingering suggestion (T = thumb)
  isRoot?: boolean;
  note?: NoteName;
}

/**
 * A playable guitar chord voicing
 */
export interface GuitarVoicing {
  id: string;
  name: string; // e.g., "Open C", "Barre (5th fret)", "Shell"
  type: GuitarVoicingType;
  positions: GuitarFretPosition[]; // 6 positions, one per string (can include muted)
  baseFret: number; // Lowest fret in voicing (0 for open chords)
  isBarreChord: boolean;
  barreFret?: number; // The fret where the barre is played
  barreStrings?: [number, number]; // Range of strings covered by barre [from, to]
  difficulty: "beginner" | "intermediate" | "advanced";

  // Ted Greene-inspired categorization
  vSystem?: VSystemPosition; // Which string has the root (V-1 to V-6)
  stringGroup?: StringGroup; // Which 4-string set is used
  voicingStructure?: VoicingStructure; // Close, drop2, drop3, etc.
  inversion: 0 | 1 | 2 | 3; // Root position, 1st, 2nd, 3rd inversion
}

/**
 * Template for generating voicings - defines shape relative to root
 */
export interface VoicingTemplate {
  name: string;
  type: GuitarVoicingType;
  quality: ChordQuality | ChordQuality[]; // Which chord qualities this template works for
  // Positions relative to root fret, null = muted
  // Index 0 = string 1 (high E), Index 5 = string 6 (low E)
  relativePositions: (number | null)[];
  // Which position is the root (0-5, corresponding to string 1-6)
  rootString: number;
  // Base fret offset (for open shapes, the root fret position)
  rootFretOffset: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  isBarreChord: boolean;
  barreOffset?: number; // Relative position of barre from root
  barreStrings?: [number, number];
  voicingStructure?: VoicingStructure;
  inversion: 0 | 1 | 2 | 3;
}

// Mode Comparison Types
// ============================================

export interface ModeComparisonState {
  mode1: string | null; // Full scale name, e.g., "D Dorian"
  mode2: string | null; // Full scale name, e.g., "D Aeolian"
}

export interface ModeIntervalDiff {
  degree: number; // 1-7
  degreeLabel: string; // "1", "2", "♭3", etc.
  mode1Note: NoteName;
  mode2Note: NoteName;
  mode1Interval: string; // "M2", "m3", etc.
  mode2Interval: string;
  isDifferent: boolean;
  differenceDescription?: string; // "Raised 6th", "Lowered 2nd"
}

export interface ModeComparisonResult {
  mode1Name: string;
  mode2Name: string;
  mode1Root: NoteName;
  mode2Root: NoteName;
  intervals: ModeIntervalDiff[];
  sharedNotes: NoteName[];
  mode1UniqueNotes: NoteName[];
  mode2UniqueNotes: NoteName[];
  keyDifference: string; // e.g., "Dorian has a natural 6th"
}

export type ModeComparisonFretboardView = "both" | "mode1" | "mode2";

// ============================================
// Practice Mode Types
// ============================================

export type PracticeModeId =
  | "learn-the-neck"
  | "outline-chord-changes"
  | "comp-with-voicings";

export type TheoryTabId = "chord" | "modes" | "subs" | "analysis";

export interface PracticeModeConfig {
  id: PracticeModeId;
  label: string;
  description: string;
  defaultTempo: number;
  defaultStyle: StyleId;

  // Display constraints — which controls are visible
  showOverlayDropdown: boolean;
  showLabels: boolean;
  showVoicingsButton: boolean;
  showLayersDropdown: boolean;
  showTargetsDropdown: boolean;
  showQuiz: boolean;
  showCAGED: boolean;
  showMicToggle: boolean;
  theoryTabs: TheoryTabId[];
}
