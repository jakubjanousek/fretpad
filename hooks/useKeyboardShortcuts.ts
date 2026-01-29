"use client";

import { useEffect } from "react";
import { PRESET_PROGRESSIONS } from "@/lib/theory/presets";
import { useAppStore } from "@/state/useAppStore";

interface KeyboardShortcutHandlers {
  onPlay: () => void;
  onStop: () => void;
  onReset: () => void;
}

const PRESET_KEYS = Object.keys(PRESET_PROGRESSIONS) as Array<
  keyof typeof PRESET_PROGRESSIONS
>;

/**
 * Keyboard shortcuts hook for transport controls and common actions.
 *
 * Shortcuts:
 * - Space: Play/Stop toggle
 * - R: Reset to beginning
 * - ↑/↓: Adjust tempo by 5 BPM
 * - M: Toggle metronome
 * - 1-3: Quick load first 3 presets (ii-V-I, Autumn Leaves, Rhythm Changes)
 */
export function useKeyboardShortcuts({
  onPlay,
  onStop,
}: KeyboardShortcutHandlers): void {
  const isPlaying = useAppStore((state) => state.isPlaying);
  const tempo = useAppStore((state) => state.tempo);
  const metronome = useAppStore((state) => state.metronome);
  const setTempo = useAppStore((state) => state.setTempo);
  const setMetronomeEnabled = useAppStore((state) => state.setMetronomeEnabled);
  const loadPreset = useAppStore((state) => state.loadPreset);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.code) {
        case "Space":
          event.preventDefault();
          if (isPlaying) {
            onStop();
          } else {
            onPlay();
          }
          break;

        case "ArrowUp":
          event.preventDefault();
          setTempo(Math.min(200, tempo + 5));
          break;

        case "ArrowDown":
          event.preventDefault();
          setTempo(Math.max(40, tempo - 5));
          break;

        case "KeyM":
          // Allow CMD+M / Ctrl+M for browser/OS shortcuts
          if (event.metaKey || event.ctrlKey) {
            return;
          }
          event.preventDefault();
          setMetronomeEnabled(!metronome.enabled);
          break;

        case "Digit1":
        case "Numpad1":
          if (!event.metaKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault();
            const preset = PRESET_KEYS[0];
            if (preset) loadPreset(preset);
          }
          break;

        case "Digit2":
        case "Numpad2":
          if (!event.metaKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault();
            const preset = PRESET_KEYS[1];
            if (preset) loadPreset(preset);
          }
          break;

        case "Digit3":
        case "Numpad3":
          if (!event.metaKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault();
            const preset = PRESET_KEYS[2];
            if (preset) loadPreset(preset);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isPlaying,
    tempo,
    metronome.enabled,
    onPlay,
    onStop,
    setTempo,
    setMetronomeEnabled,
    loadPreset,
  ]);
}
