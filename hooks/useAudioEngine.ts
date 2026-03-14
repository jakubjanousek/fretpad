"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import {
  type BassInstrument,
  createBassInstrument,
} from "@/lib/audio/instruments/bassInstrument";
import {
  type ChordInstrument,
  createChordInstrument,
} from "@/lib/audio/instruments/chordInstrument";
import {
  createDrumInstrument,
  type DrumInstrument,
} from "@/lib/audio/instruments/drumInstrument";
import {
  createMetronomeInstrument,
  type MetronomeInstrument,
} from "@/lib/audio/instruments/metronomeInstrument";
import {
  clearScheduledEvents,
  scheduleCountIn,
  scheduleProgression,
} from "@/lib/audio/scheduler";
import type {
  BackingTrackConfig,
  MetronomeConfig,
  Progression,
  StyleDefinition,
  TempoRampConfig,
} from "@/lib/types";
import { useAppStore } from "@/state/useAppStore";

type AudioContextState = "suspended" | "running" | "closed";

interface UseAudioEngineOptions {
  progression: Progression;
  tempo: number;
  style: StyleDefinition;
  metronome: MetronomeConfig;
  backingTrack: BackingTrackConfig;
  tempoRamp: TempoRampConfig;
  onChordChange: (barIndex: number, chordIndex: number) => void;
  onLoop: () => void;
  onStop: () => void;
}

interface AudioEngineReturn {
  start: () => Promise<void>;
  stop: () => void;
  resume: () => Promise<void>;
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
  metronome,
  backingTrack,
  onChordChange,
  onLoop,
  onStop,
}: UseAudioEngineOptions): AudioEngineReturn {
  const bassRef = useRef<BassInstrument | null>(null);
  const chordRef = useRef<ChordInstrument | null>(null);
  const drumsRef = useRef<DrumInstrument | null>(null);
  const metronomeRef = useRef<MetronomeInstrument | null>(null);
  const countInEventIdsRef = useRef<number[]>([]);
  const scheduledEventsRef = useRef<number[]>([]);
  const isReadyRef = useRef(false);
  const isPlayingRef = useRef(false);
  const loopIterationRef = useRef(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [audioContextState, setAudioContextState] =
    useState<AudioContextState>("suspended");
  // Counter that increments when instruments are recreated, triggering volume effect
  const [instrumentVersion, setInstrumentVersion] = useState(0);

  const setIsInterrupted = useAppStore((state) => state.setIsInterrupted);

  // Track audio context state and detect interruptions
  useEffect(() => {
    const updateState = () => {
      const context = Tone.getContext();
      const newState = context.state as AudioContextState;
      setAudioContextState(newState);

      // Detect interruption: context suspended/interrupted while we were playing
      if (
        (newState === "suspended" || newState === ("interrupted" as string)) &&
        isPlayingRef.current
      ) {
        setIsInterrupted(true);
      }
    };

    // Update on mount
    updateState();

    // Listen for state changes
    const context = Tone.getContext();
    context.rawContext.addEventListener("statechange", updateState);

    return () => {
      context.rawContext.removeEventListener("statechange", updateState);
    };
  }, [setIsInterrupted]);

  // Re-acquire wake lock when tab becomes visible again (Safari releases it on background)
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;

    const onVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        isPlayingRef.current &&
        (!wakeLockRef.current || wakeLockRef.current.released)
      ) {
        navigator.wakeLock.request("screen").then(
          (sentinel) => {
            wakeLockRef.current = sentinel;
          },
          () => {},
        );
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // Initialize instruments based on style
  useEffect(() => {
    // Dispose previous instruments if they exist
    bassRef.current?.dispose();
    chordRef.current?.dispose();
    drumsRef.current?.dispose();
    metronomeRef.current?.dispose();

    // Create new instruments based on style configuration
    bassRef.current = createBassInstrument(style.instruments.bass);
    chordRef.current = createChordInstrument(style.instruments.chord);
    drumsRef.current = createDrumInstrument(backingTrack.drumsVolume);
    metronomeRef.current = createMetronomeInstrument(metronome.volume);

    isReadyRef.current = true;
    // Increment version to trigger volume effect after instrument recreation
    setInstrumentVersion((v) => v + 1);

    return () => {
      // Cleanup on unmount or style change
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
      bassRef.current?.dispose();
      chordRef.current?.dispose();
      drumsRef.current?.dispose();
      metronomeRef.current?.dispose();
      bassRef.current = null;
      chordRef.current = null;
      drumsRef.current = null;
      metronomeRef.current = null;
      isReadyRef.current = false;
    };
  }, [style, metronome.volume, backingTrack.drumsVolume]);

  // Handle style/metronome change during playback - reschedule events
  const rescheduleProgression = useCallback(
    (loopIteration: number) => {
      if (!bassRef.current || !chordRef.current) return null;

      clearScheduledEvents(scheduledEventsRef.current);
      scheduledEventsRef.current = [];

      const { eventIds, totalBars } = scheduleProgression(
        progression,
        style,
        {
          bass: bassRef.current,
          chord: chordRef.current,
          metronome: metronomeRef.current ?? undefined,
          drums: drumsRef.current ?? undefined,
        },
        onChordChange,
        {
          metronomeConfig: metronome,
          countInBars: metronome.countIn,
          loopIteration,
        },
      );

      scheduledEventsRef.current = eventIds;
      return totalBars;
    },
    [progression, style, onChordChange, metronome],
  );

  useEffect(() => {
    if (!isPlayingRef.current || !bassRef.current || !chordRef.current) return;

    const transport = Tone.getTransport();

    // Save current position before rescheduling
    const currentPosition = transport.position;

    const totalBars = rescheduleProgression(loopIterationRef.current);
    if (totalBars === null) return;

    // Update loop end if needed
    transport.loopEnd = `${metronome.countIn + totalBars}:0:0`;

    // Restore position
    transport.position = currentPosition;
  }, [metronome.countIn, rescheduleProgression]);

  // Update tempo when it changes (no reschedule needed - Tone.js handles this)
  useEffect(() => {
    Tone.getTransport().bpm.value = tempo;
  }, [tempo]);

  // Handle loop event for tempo ramp
  const onLoopRef = useRef(onLoop);
  onLoopRef.current = onLoop;

  useEffect(() => {
    const transport = Tone.getTransport();
    const handler = () => {
      if (!isPlayingRef.current) return;
      loopIterationRef.current += 1;
      rescheduleProgression(loopIterationRef.current);
      onLoopRef.current();
    };
    transport.on("loop", handler);

    return () => {
      transport.off("loop", handler);
    };
  }, [rescheduleProgression]);

  // Update swing setting when style changes
  useEffect(() => {
    const transport = Tone.getTransport();
    const useTransportSwing =
      style.timing?.useTransportSwing ?? style.swing > 0;
    transport.swing = useTransportSwing ? style.swing : 0;
    transport.swingSubdivision = "8n";
  }, [style.swing, style.timing?.useTransportSwing]);

  // Update backing track volume and mute state dynamically
  // Also runs when instrumentVersion changes (after instrument recreation)
  // biome-ignore lint/correctness/useExhaustiveDependencies: instrumentVersion is intentionally included to trigger re-run after instrument recreation
  useEffect(() => {
    if (bassRef.current) {
      bassRef.current.volume.value = backingTrack.bassMuted
        ? -Infinity
        : backingTrack.bassVolume;
    }
    if (chordRef.current) {
      chordRef.current.volume.value = backingTrack.chordMuted
        ? -Infinity
        : backingTrack.chordVolume;
    }
    if (drumsRef.current) {
      drumsRef.current.setVolume(
        backingTrack.drumsMuted ? -Infinity : backingTrack.drumsVolume,
      );
    }
  }, [
    instrumentVersion,
    backingTrack.bassVolume,
    backingTrack.chordVolume,
    backingTrack.drumsVolume,
    backingTrack.bassMuted,
    backingTrack.chordMuted,
    backingTrack.drumsMuted,
  ]);

  const start = useCallback(async () => {
    if (!bassRef.current || !chordRef.current) return;

    // Ensure audio context is started (required for browser autoplay policy)
    await Tone.start();

    const transport = Tone.getTransport();

    // Stop and reset if already playing
    transport.stop();
    transport.cancel();
    transport.position = 0;
    loopIterationRef.current = 0;

    // Clear previously scheduled events
    clearScheduledEvents(countInEventIdsRef.current);
    countInEventIdsRef.current = [];
    clearScheduledEvents(scheduledEventsRef.current);
    scheduledEventsRef.current = [];

    const beatsPerBar = progression.timeSignature.numerator;
    const countInBars = metronome.countIn;

    // Schedule count-in if enabled and metronome exists
    if (countInBars > 0 && metronomeRef.current) {
      const countInEventIds = scheduleCountIn(
        transport,
        countInBars,
        beatsPerBar,
        metronomeRef.current,
        metronome.accentDownbeat,
      );
      countInEventIdsRef.current = countInEventIds;
    }

    const totalBars = rescheduleProgression(0);
    if (totalBars === null) return;

    // Set up looping - loop only covers the progression, not count-in
    transport.loop = true;
    transport.loopStart = `${countInBars}:0:0`;
    transport.loopEnd = `${countInBars + totalBars}:0:0`;

    // Trigger first chord immediately (or after count-in delay)
    if (countInBars === 0) {
      onChordChange(0, 0);
    } else {
      // Schedule first chord change after count-in
      transport.schedule(() => {
        onChordChange(0, 0);
      }, `${countInBars}:0:0`);
    }

    // Mark as playing
    isPlayingRef.current = true;

    // Request wake lock to prevent screen dimming during practice
    if ("wakeLock" in navigator) {
      navigator.wakeLock.request("screen").then(
        (sentinel) => {
          wakeLockRef.current = sentinel;
        },
        () => {
          // Fail silently — wake lock not available or denied
        },
      );
    }

    // Start playback
    transport.start();
  }, [progression, onChordChange, metronome, rescheduleProgression]);

  const resume = useCallback(async () => {
    // Resume the AudioContext after iOS interruption
    await Tone.start();
    await Tone.getContext().resume();

    const transport = Tone.getTransport();

    // If transport was playing before interruption, restart it
    if (isPlayingRef.current && transport.state !== "started") {
      transport.start();
    }

    // Re-acquire wake lock
    if ("wakeLock" in navigator) {
      navigator.wakeLock.request("screen").then(
        (sentinel) => {
          wakeLockRef.current = sentinel;
        },
        () => {},
      );
    }

    setIsInterrupted(false);
  }, [setIsInterrupted]);

  const stop = useCallback(() => {
    const transport = Tone.getTransport();
    transport.stop();
    transport.cancel();
    transport.position = 0;
    loopIterationRef.current = 0;

    // Mark as not playing
    isPlayingRef.current = false;

    // Clear interruption state
    setIsInterrupted(false);

    // Release wake lock
    wakeLockRef.current?.release();
    wakeLockRef.current = null;

    // Clear scheduled events
    clearScheduledEvents(countInEventIdsRef.current);
    countInEventIdsRef.current = [];
    clearScheduledEvents(scheduledEventsRef.current);
    scheduledEventsRef.current = [];

    // Reset to first chord
    onStop();
  }, [onStop, setIsInterrupted]);

  return {
    start,
    stop,
    resume,
    isReady: isReadyRef.current,
    audioContextState,
  };
}
