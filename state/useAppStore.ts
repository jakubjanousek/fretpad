import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_STYLE_ID } from "@/lib/audio/styles";
import type { ErrorInfo } from "@/lib/errors";
import { toErrorInfo } from "@/lib/errors";
import { generateId } from "@/lib/id";
import { parseChordSymbol } from "@/lib/theory/chords";
import { PRESET_PROGRESSIONS, parseBar } from "@/lib/theory/progression";
import type {
  BackingTrackConfig,
  Chord,
  MetronomeConfig,
  NoteLabelMode,
  Progression,
  ProgressionBar,
  StyleId,
} from "@/lib/types";

interface AppState {
  // Progression state
  progression: Progression;
  currentBarIndex: number;
  currentChordIndex: number; // Index within current bar's chords array
  currentChord: Chord | null;

  // Playback state
  tempo: number;
  isPlaying: boolean;
  selectedStyle: StyleId;

  // Metronome state
  metronome: MetronomeConfig;

  // Backing track state
  backingTrack: BackingTrackConfig;

  // Fretboard display state
  showScaleTones: boolean;
  showVoiceLeading: boolean;
  noteLabelMode: NoteLabelMode;

  // Error state
  error: ErrorInfo | null;

  // Actions
  setProgression: (progression: Progression) => void;
  loadPreset: (presetName: keyof typeof PRESET_PROGRESSIONS) => void;
  setCurrentPosition: (barIndex: number, chordIndex: number) => void;
  setTempo: (tempo: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setSelectedStyle: (style: StyleId) => void;

  // Error actions
  setError: (error: unknown) => void;
  clearError: () => void;

  // Bar manipulation
  updateBar: (barIndex: number, barString: string) => boolean;
  addBar: () => void;
  removeBar: (barIndex: number) => void;

  // Metronome actions
  setMetronomeEnabled: (enabled: boolean) => void;
  setMetronomeVolume: (volume: number) => void;
  setMetronomeCountIn: (countIn: 0 | 1 | 2) => void;

  // Backing track actions
  setBackingTrackVolume: (type: "bass" | "chord", volume: number) => void;
  setBackingTrackMuted: (type: "bass" | "chord", muted: boolean) => void;

  // Fretboard display actions
  setShowScaleTones: (show: boolean) => void;
  setShowVoiceLeading: (show: boolean) => void;
  setNoteLabelMode: (mode: NoteLabelMode) => void;

  // Helper to advance to next chord (for playback)
  advanceToNextChord: () => void;
}

/**
 * Gets the chord at a specific position in the progression
 */
function getChordAtPosition(
  progression: Progression,
  barIndex: number,
  chordIndex: number,
): Chord | null {
  const bar = progression.bars[barIndex];
  if (!bar) return null;

  const barChord = bar.chords[chordIndex];
  if (!barChord) return null;

  return parseChordSymbol(barChord.chord);
}

// Default progression: ii-V-I in C
const defaultProgression = PRESET_PROGRESSIONS["ii-V-I in C"];
const defaultChord = getChordAtPosition(defaultProgression, 0, 0);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      progression: defaultProgression,
      currentBarIndex: 0,
      currentChordIndex: 0,
      currentChord: defaultChord,
      tempo: 120,
      isPlaying: false,
      selectedStyle: DEFAULT_STYLE_ID,
      metronome: {
        enabled: false,
        volume: -6,
        accentDownbeat: true,
        countIn: 0,
      },
      backingTrack: {
        bassVolume: -6,
        chordVolume: -14,
        bassMuted: false,
        chordMuted: false,
      },
      showScaleTones: false,
      showVoiceLeading: false,
      noteLabelMode: "notes",
      error: null,

      // Error actions
      setError: (error) => {
        set({ error: toErrorInfo(error) });
      },

      clearError: () => {
        set({ error: null });
      },

      // Actions
      setProgression: (progression) => {
        const chord = getChordAtPosition(progression, 0, 0);
        set({
          progression,
          currentBarIndex: 0,
          currentChordIndex: 0,
          currentChord: chord,
        });
      },

      loadPreset: (presetName) => {
        const progression = PRESET_PROGRESSIONS[presetName];
        const chord = getChordAtPosition(progression, 0, 0);
        set({
          progression,
          currentBarIndex: 0,
          currentChordIndex: 0,
          currentChord: chord,
        });
      },

      setCurrentPosition: (barIndex, chordIndex) => {
        const { progression } = get();
        const chord = getChordAtPosition(progression, barIndex, chordIndex);
        set({
          currentBarIndex: barIndex,
          currentChordIndex: chordIndex,
          currentChord: chord,
        });
      },

      setTempo: (tempo) => {
        // Clamp tempo between 40 and 200 BPM
        const clampedTempo = Math.max(40, Math.min(200, tempo));
        set({ tempo: clampedTempo });
      },

      setIsPlaying: (isPlaying) => {
        set({ isPlaying });
      },

      setSelectedStyle: (style) => {
        set({ selectedStyle: style });
      },

      // Metronome actions
      setMetronomeEnabled: (enabled) => {
        set((state) => ({
          metronome: { ...state.metronome, enabled },
        }));
      },

      setMetronomeVolume: (volume) => {
        // Clamp volume between -20 and 0 dB
        const clampedVolume = Math.max(-20, Math.min(0, volume));
        set((state) => ({
          metronome: { ...state.metronome, volume: clampedVolume },
        }));
      },

      setMetronomeCountIn: (countIn) => {
        set((state) => ({
          metronome: { ...state.metronome, countIn },
        }));
      },

      // Backing track actions
      setBackingTrackVolume: (type, volume) => {
        // Clamp volume between -30 and 0 dB
        const clampedVolume = Math.max(-30, Math.min(0, volume));
        set((state) => ({
          backingTrack: {
            ...state.backingTrack,
            [type === "bass" ? "bassVolume" : "chordVolume"]: clampedVolume,
          },
        }));
      },

      setBackingTrackMuted: (type, muted) => {
        set((state) => ({
          backingTrack: {
            ...state.backingTrack,
            [type === "bass" ? "bassMuted" : "chordMuted"]: muted,
          },
        }));
      },

      setShowScaleTones: (show) => {
        set({ showScaleTones: show });
      },

      setShowVoiceLeading: (show) => {
        set({ showVoiceLeading: show });
      },

      setNoteLabelMode: (mode) => {
        set({ noteLabelMode: mode });
      },

      updateBar: (barIndex, barString) => {
        const { progression } = get();
        const newBar = parseBar(barString, progression.timeSignature.numerator);

        if (!newBar) {
          // Invalid chord input
          return false;
        }

        // Preserve the bar's ID
        const existingBar = progression.bars[barIndex];
        if (existingBar) {
          newBar.id = existingBar.id;
        }

        const newBars = [...progression.bars];
        newBars[barIndex] = newBar;

        const newProgression: Progression = {
          ...progression,
          bars: newBars,
        };

        // Update current chord if we're editing the current bar
        const { currentBarIndex, currentChordIndex } = get();
        let newCurrentChord = get().currentChord;
        let newChordIndex = currentChordIndex;

        if (barIndex === currentBarIndex) {
          // Adjust chord index if it's now out of bounds
          if (currentChordIndex >= newBar.chords.length) {
            newChordIndex = newBar.chords.length - 1;
          }
          newCurrentChord = getChordAtPosition(
            newProgression,
            barIndex,
            newChordIndex,
          );
        }

        set({
          progression: newProgression,
          currentChordIndex: newChordIndex,
          currentChord: newCurrentChord,
        });

        return true;
      },

      addBar: () => {
        const { progression } = get();

        // Create a new empty bar with a default chord
        const newBar: ProgressionBar = {
          id: generateId(),
          totalBeats: progression.timeSignature.numerator,
          chords: [{ chord: "C", beats: progression.timeSignature.numerator }],
        };

        const newProgression: Progression = {
          ...progression,
          bars: [...progression.bars, newBar],
        };

        set({ progression: newProgression });
      },

      removeBar: (barIndex) => {
        const { progression, currentBarIndex, currentChordIndex } = get();

        // Don't remove if only one bar left
        if (progression.bars.length <= 1) return;

        const newBars = progression.bars.filter((_, idx) => idx !== barIndex);
        const newProgression: Progression = {
          ...progression,
          bars: newBars,
        };

        // Adjust current position if needed
        let newBarIndex = currentBarIndex;
        let newChordIndex = currentChordIndex;

        if (barIndex < currentBarIndex) {
          // Removed bar is before current, shift index down
          newBarIndex = currentBarIndex - 1;
        } else if (barIndex === currentBarIndex) {
          // Removed the current bar, select previous or first
          newBarIndex = Math.max(0, currentBarIndex - 1);
          newChordIndex = 0;
        }

        // Ensure index is valid
        newBarIndex = Math.min(newBarIndex, newBars.length - 1);

        const newCurrentChord = getChordAtPosition(
          newProgression,
          newBarIndex,
          newChordIndex,
        );

        set({
          progression: newProgression,
          currentBarIndex: newBarIndex,
          currentChordIndex: newChordIndex,
          currentChord: newCurrentChord,
        });
      },

      advanceToNextChord: () => {
        const { progression, currentBarIndex, currentChordIndex } = get();
        const currentBar = progression.bars[currentBarIndex];

        if (!currentBar) return;

        // Try to advance within the current bar
        if (currentChordIndex < currentBar.chords.length - 1) {
          const newChordIndex = currentChordIndex + 1;
          const chord = getChordAtPosition(
            progression,
            currentBarIndex,
            newChordIndex,
          );
          set({
            currentChordIndex: newChordIndex,
            currentChord: chord,
          });
          return;
        }

        // Move to next bar
        if (currentBarIndex < progression.bars.length - 1) {
          const newBarIndex = currentBarIndex + 1;
          const chord = getChordAtPosition(progression, newBarIndex, 0);
          set({
            currentBarIndex: newBarIndex,
            currentChordIndex: 0,
            currentChord: chord,
          });
          return;
        }

        // Loop back to beginning
        const chord = getChordAtPosition(progression, 0, 0);
        set({
          currentBarIndex: 0,
          currentChordIndex: 0,
          currentChord: chord,
        });
      },
    }),
    {
      name: "fretflow-state",
      partialize: (state) => ({
        progression: state.progression,
        tempo: state.tempo,
        selectedStyle: state.selectedStyle,
        metronome: state.metronome,
        backingTrack: state.backingTrack,
        showScaleTones: state.showScaleTones,
        showVoiceLeading: state.showVoiceLeading,
        noteLabelMode: state.noteLabelMode,
      }),
      onRehydrateStorage: () => (state) => {
        // Recalculate currentChord after rehydration
        if (state) {
          const chord = getChordAtPosition(state.progression, 0, 0);
          state.currentChord = chord;
        }
      },
    },
  ),
);
