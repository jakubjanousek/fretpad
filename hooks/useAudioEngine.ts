"use client";

import { useCallback, useEffect, useRef } from "react";
import * as Tone from "tone";
import type { Progression } from "@/lib/types";

interface UseAudioEngineOptions {
  progression: Progression;
  tempo: number;
  onChordChange: (barIndex: number, chordIndex: number) => void;
  onStop: () => void;
}

interface AudioEngineReturn {
  start: () => Promise<void>;
  stop: () => void;
  isReady: boolean;
}

/**
 * Audio engine hook using Tone.js for playback control.
 * Schedules chord changes based on the progression and tempo.
 */
export function useAudioEngine({
  progression,
  tempo,
  onChordChange,
  onStop,
}: UseAudioEngineOptions): AudioEngineReturn {
  const synthRef = useRef<Tone.Synth | null>(null);
  const scheduledEventsRef = useRef<number[]>([]);
  const isReadyRef = useRef(false);

  // Initialize synth on mount
  useEffect(() => {
    synthRef.current = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.3,
        release: 0.3,
      },
    }).toDestination();

    synthRef.current.volume.value = -12; // Quieter for background

    isReadyRef.current = true;

    return () => {
      // Cleanup on unmount
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
      synthRef.current?.dispose();
      synthRef.current = null;
      isReadyRef.current = false;
    };
  }, []);

  // Update tempo when it changes
  useEffect(() => {
    Tone.getTransport().bpm.value = tempo;
  }, [tempo]);

  /**
   * Schedules all chord change events for the progression.
   * Returns the total duration in bars.
   */
  const scheduleProgression = useCallback(() => {
    const transport = Tone.getTransport();

    // Clear any previously scheduled events
    for (const eventId of scheduledEventsRef.current) {
      transport.clear(eventId);
    }
    scheduledEventsRef.current = [];

    const beatsPerBar = progression.timeSignature.numerator;
    let currentBeat = 0;

    // Schedule each chord in the progression
    for (let barIndex = 0; barIndex < progression.bars.length; barIndex++) {
      const bar = progression.bars[barIndex];

      for (let chordIndex = 0; chordIndex < bar.chords.length; chordIndex++) {
        const barChord = bar.chords[chordIndex];
        const timeInBars = `0:${currentBeat}`;

        // Schedule chord change callback
        const eventId = transport.schedule((time) => {
          onChordChange(barIndex, chordIndex);

          // Play root note as audio cue
          if (synthRef.current) {
            // Get root note from chord symbol (first character(s))
            const rootMatch = barChord.chord.match(/^[A-G][#b]?/);
            if (rootMatch) {
              const rootNote = `${rootMatch[0]}3`; // Play in octave 3
              synthRef.current.triggerAttackRelease(rootNote, "8n", time);
            }
          }
        }, timeInBars);

        scheduledEventsRef.current.push(eventId);
        currentBeat += barChord.beats;
      }
    }

    // Calculate total bars for loop
    const totalBeats = currentBeat;
    const totalBars = Math.ceil(totalBeats / beatsPerBar);

    return totalBars;
  }, [progression, onChordChange]);

  const start = useCallback(async () => {
    // Ensure audio context is started (required for browser autoplay policy)
    await Tone.start();

    const transport = Tone.getTransport();

    // Stop and reset if already playing
    transport.stop();
    transport.cancel();
    transport.position = 0;

    // Schedule the progression
    const totalBars = scheduleProgression();

    // Set up looping
    transport.loop = true;
    transport.loopStart = 0;
    transport.loopEnd = `${totalBars}:0:0`;

    // Trigger first chord immediately
    onChordChange(0, 0);

    // Start playback
    transport.start();
  }, [scheduleProgression, onChordChange]);

  const stop = useCallback(() => {
    const transport = Tone.getTransport();
    transport.stop();
    transport.cancel();
    transport.position = 0;

    // Clear scheduled events
    for (const eventId of scheduledEventsRef.current) {
      transport.clear(eventId);
    }
    scheduledEventsRef.current = [];

    // Reset to first chord
    onStop();
  }, [onStop]);

  return {
    start,
    stop,
    isReady: isReadyRef.current,
  };
}
