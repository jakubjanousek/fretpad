import { useAppStore } from "./useAppStore";

// Progression selectors
export const useProgression = () => useAppStore((s) => s.progression);
export const useCurrentChord = () => useAppStore((s) => s.currentChord);
export const useCurrentBarIndex = () => useAppStore((s) => s.currentBarIndex);
export const useCurrentChordIndex = () =>
  useAppStore((s) => s.currentChordIndex);

// Playback selectors
export const useTempo = () => useAppStore((s) => s.tempo);
export const useIsPlaying = () => useAppStore((s) => s.isPlaying);
export const useSelectedStyle = () => useAppStore((s) => s.selectedStyle);

// Metronome selectors
export const useMetronome = () => useAppStore((s) => s.metronome);

// Backing track selectors
export const useBackingTrack = () => useAppStore((s) => s.backingTrack);

// Display selectors
export const useShowScaleTones = () => useAppStore((s) => s.showScaleTones);
export const useShowVoiceLeading = () => useAppStore((s) => s.showVoiceLeading);
export const useNoteLabelMode = () => useAppStore((s) => s.noteLabelMode);
export const usePreviewScale = () => useAppStore((s) => s.previewScale);

// Error selectors
export const useError = () => useAppStore((s) => s.error);
