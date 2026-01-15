"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { createBassInstrument } from "@/lib/audio/instruments/bassInstrument";
import { createChordInstrument } from "@/lib/audio/instruments/chordInstrument";
import {
  clearScheduledEvents,
  scheduleProgression,
} from "@/lib/audio/scheduler";
import type { Progression, StyleDefinition } from "@/lib/types";

type AudioContextState = "suspended" | "running" | "closed";

interface UseAudioEngineOptions {
  progression: Progression;
  tempo: number;
  style: StyleDefinition;
  onChordChange: (barIndex: number, chordIndex: number) => void;
  onStop: () => void;
}

interface AudioEngineReturn {
  start: () => Promise<void>;
  stop: () => void;
  isReady: boolean;
  audioContextState: AudioContextState;
}

/**
 * Audio engine hook using Tone.js for playback control.
 * Schedules backing track patterns based on the progression, style, and tempo.
 */
export function useAudioEngine({
  progression,
  tempo,
  style,
  onChordChange,
  onStop,
}: UseAudioEngineOptions): AudioEngineReturn {
  const bassRef = useRef<Tone.Synth | null>(null);
  const chordRef = useRef<Tone.PolySynth | null>(null);
  const scheduledEventsRef = useRef<number[]>([]);
  const isReadyRef = useRef(false);
  const isPlayingRef = useRef(false);
  const [audioContextState, setAudioContextState] =
    useState<AudioContextState>("suspended");

  // Track audio context state
  useEffect(() => {
    const updateState = () => {
      const context = Tone.getContext();
      setAudioContextState(context.state as AudioContextState);
    };

    // Update on mount
    updateState();

    // Listen for state changes
    const context = Tone.getContext();
    context.rawContext.addEventListener("statechange", updateState);

    return () => {
      context.rawContext.removeEventListener("statechange", updateState);
    };
  }, []);

  // Initialize instruments based on style
  useEffect(() => {
    // Dispose previous instruments if they exist
    bassRef.current?.dispose();
    chordRef.current?.dispose();

    // Create new instruments based on style configuration
    bassRef.current = createBassInstrument(style.instruments.bass);
    chordRef.current = createChordInstrument(style.instruments.chord);

    isReadyRef.current = true;

    return () => {
      // Cleanup on unmount or style change
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
      bassRef.current?.dispose();
      chordRef.current?.dispose();
      bassRef.current = null;
      chordRef.current = null;
      isReadyRef.current = false;
    };
  }, [style]);

  // Handle style change during playback - reschedule events
  useEffect(() => {
    if (!isPlayingRef.current || !bassRef.current || !chordRef.current) return;

    const transport = Tone.getTransport();

    // Save current position before rescheduling
    const currentPosition = transport.position;

    // Clear old events and reschedule with new style
    clearScheduledEvents(scheduledEventsRef.current);
    scheduledEventsRef.current = [];

    // Cancel all transport events
    transport.cancel();

    // Reschedule with new style
    const { eventIds, totalBars } = scheduleProgression(
      progression,
      style,
      {
        bass: bassRef.current,
        chord: chordRef.current,
      },
      onChordChange,
    );

    scheduledEventsRef.current = eventIds;

    // Update loop end if needed
    transport.loopEnd = `${totalBars}:0:0`;

    // Restore position
    transport.position = currentPosition;
  }, [style, progression, onChordChange]);

  // Update tempo when it changes (no reschedule needed - Tone.js handles this)
  useEffect(() => {
    Tone.getTransport().bpm.value = tempo;
  }, [tempo]);

  // Update swing setting when style changes
  useEffect(() => {
    const transport = Tone.getTransport();
    transport.swing = style.swing;
    transport.swingSubdivision = "8n";
  }, [style.swing]);

  const start = useCallback(async () => {
    if (!bassRef.current || !chordRef.current) return;

    // Ensure audio context is started (required for browser autoplay policy)
    await Tone.start();

    const transport = Tone.getTransport();

    // Stop and reset if already playing
    transport.stop();
    transport.cancel();
    transport.position = 0;

    // Clear previously scheduled events
    clearScheduledEvents(scheduledEventsRef.current);
    scheduledEventsRef.current = [];

    // Schedule the progression with backing track patterns
    const { eventIds, totalBars } = scheduleProgression(
      progression,
      style,
      {
        bass: bassRef.current,
        chord: chordRef.current,
      },
      onChordChange,
    );

    scheduledEventsRef.current = eventIds;

    // Set up looping
    transport.loop = true;
    transport.loopStart = 0;
    transport.loopEnd = `${totalBars}:0:0`;

    // Trigger first chord immediately
    onChordChange(0, 0);

    // Mark as playing
    isPlayingRef.current = true;

    // Start playback
    transport.start();
  }, [progression, style, onChordChange]);

  const stop = useCallback(() => {
    const transport = Tone.getTransport();
    transport.stop();
    transport.cancel();
    transport.position = 0;

    // Mark as not playing
    isPlayingRef.current = false;

    // Clear scheduled events
    clearScheduledEvents(scheduledEventsRef.current);
    scheduledEventsRef.current = [];

    // Reset to first chord
    onStop();
  }, [onStop]);

  return {
    start,
    stop,
    isReady: isReadyRef.current,
    audioContextState,
  };
}
