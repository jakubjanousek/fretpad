"use client";

import { useCallback } from "react";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { getStyle } from "@/lib/audio/styles";
import { useAppStore } from "@/state/useAppStore";

/**
 * Shared transport control logic used by both TransportBar and TransportControls.
 * Manages audio engine integration, play/stop/reset actions, tempo changes,
 * metronome toggle, and keyboard shortcuts.
 */
export function useTransportControls() {
  const progression = useAppStore((state) => state.progression);
  const tempo = useAppStore((state) => state.tempo);
  const isPlaying = useAppStore((state) => state.isPlaying);
  const selectedStyle = useAppStore((state) => state.selectedStyle);
  const metronome = useAppStore((state) => state.metronome);
  const backingTrack = useAppStore((state) => state.backingTrack);
  const setTempo = useAppStore((state) => state.setTempo);
  const setIsPlaying = useAppStore((state) => state.setIsPlaying);
  const setCurrentPosition = useAppStore((state) => state.setCurrentPosition);
  const setMetronomeEnabled = useAppStore((state) => state.setMetronomeEnabled);

  const style = getStyle(selectedStyle);

  const handleChordChange = useCallback(
    (barIndex: number, chordIndex: number) => {
      setCurrentPosition(barIndex, chordIndex);
    },
    [setCurrentPosition],
  );

  const handleStop = useCallback(() => {
    setCurrentPosition(0, 0);
    setIsPlaying(false);
  }, [setCurrentPosition, setIsPlaying]);

  const { start, stop } = useAudioEngine({
    progression,
    tempo,
    style,
    metronome,
    backingTrack,
    onChordChange: handleChordChange,
    onStop: handleStop,
  });

  const handlePlay = useCallback(async () => {
    await start();
    setIsPlaying(true);
  }, [start, setIsPlaying]);

  const handleStopClick = useCallback(() => {
    stop();
    setIsPlaying(false);
  }, [stop, setIsPlaying]);

  const handleReset = useCallback(() => {
    stop();
    setCurrentPosition(0, 0);
    setIsPlaying(false);
  }, [stop, setCurrentPosition, setIsPlaying]);

  useKeyboardShortcuts({
    onPlay: handlePlay,
    onStop: handleStopClick,
    onReset: handleReset,
  });

  const handleTempoChange = useCallback(
    (value: number[]) => {
      const newTempo = value[0];
      if (newTempo !== undefined) {
        setTempo(newTempo);
      }
    },
    [setTempo],
  );

  const handleMetronomeToggle = useCallback(() => {
    setMetronomeEnabled(!metronome.enabled);
  }, [metronome.enabled, setMetronomeEnabled]);

  return {
    isPlaying,
    tempo,
    metronome,
    handlePlay,
    handleStopClick,
    handleReset,
    handleTempoChange,
    handleMetronomeToggle,
  };
}
