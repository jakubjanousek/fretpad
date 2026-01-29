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
  degree?: number; // Scale degree for bass (1, 3, 5, 7)
  type?: "root" | "fifth" | "chord" | "approach";
}

export interface ChordPatternEvent {
  time: string;
  duration: string;
  velocity?: number;
  voicingType: "shell" | "full" | "triad";
}

export interface BassPattern {
  name: string;
  events: PatternEvent[];
}

export interface ChordPattern {
  name: string;
  events: ChordPatternEvent[];
}

export type DrumSound = "kick" | "snare" | "hihat" | "hihatOpen";

export interface DrumPatternEvent {
  time: string; // Tone.js time format
  sound: DrumSound;
  velocity?: number; // 0-1
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
  | "threeNotePerString";

export type CAGEDPosition = 1 | 2 | 3 | 4 | 5;

export const CAGED_POSITION_LABELS: Record<CAGEDPosition, string> = {
  1: "E",
  2: "D",
  3: "C",
  4: "A",
  5: "G",
};

// ============================================
// Quiz Types
// ============================================

export interface QuizQuestion {
  targetNote: FretNote;
  chord: Chord;
  availableIntervals: string[]; // unique intervals like ["1", "b3", "5", "b7"]
}
