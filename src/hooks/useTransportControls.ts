"use client";

import { track } from "@vercel/analytics";
import { useCallback } from "react";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { getStyle } from "@/lib/audio";
import { useAppStore } from "@/state/useAppStore";

/**
 * Shared transport control logic used by TransportBar and TransportDrawer.
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
  const tempoRamp = useAppStore((state) => state.tempoRamp);
  const setTempo = useAppStore((state) => state.setTempo);
  const setIsPlaying = useAppStore((state) => state.setIsPlaying);
  const setCurrentPosition = useAppStore((state) => state.setCurrentPosition);
  const setMetronomeEnabled = useAppStore((state) => state.setMetronomeEnabled);
  const activeMode = useAppStore((state) => state.activeMode);
  const loopCount = useAppStore((state) => state.loopCount);
  const incrementLoopCount = useAppStore((state) => state.incrementLoopCount);
  const resetLoopCount = useAppStore((state) => state.resetLoopCount);

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
    resetLoopCount();
  }, [setCurrentPosition, setIsPlaying, resetLoopCount]);

  const handleLoop = useCallback(() => {
    incrementLoopCount();
  }, [incrementLoopCount]);

  const { start, stop, resume } = useAudioEngine({
    progression,
    tempo,
    style,
    metronome,
    backingTrack,
    tempoRamp,
    onChordChange: handleChordChange,
    onLoop: handleLoop,
    onStop: handleStop,
  });

  const handlePlay = useCallback(async () => {
    resetLoopCount();
    await start();
    setIsPlaying(true);
    track("session_start", { mode: activeMode ?? "unknown", tempo });
  }, [start, setIsPlaying, resetLoopCount, activeMode, tempo]);

  const handleStopClick = useCallback(() => {
    const sessionLoopCount = loopCount;
    stop();
    setIsPlaying(false);
    track("session_stop", {
      mode: activeMode ?? "unknown",
      tempo,
      loopCount: sessionLoopCount,
    });
    resetLoopCount();
  }, [stop, setIsPlaying, resetLoopCount, activeMode, tempo, loopCount]);

  useKeyboardShortcuts({
    onPlay: handlePlay,
    onStop: handleStopClick,
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

  const handleResume = useCallback(async () => {
    await resume();
  }, [resume]);

  return {
    isPlaying,
    tempo,
    tempoRamp,
    metronome,
    loopCount,
    handlePlay,
    handleStopClick,
    handleResume,
    handleTempoChange,
    handleMetronomeToggle,
  };
}
