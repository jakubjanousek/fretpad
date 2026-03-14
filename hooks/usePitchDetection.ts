"use client";

import { useCallback, useEffect, useRef } from "react";
import { Note } from "tonal";
import * as Tone from "tone";
import { MicPermissionError } from "@/lib/errors";
import type { Chord, TargetNoteMode } from "@/lib/types";
import { assertNever } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

// --- Constants ---

const PITCH_CONFIG = {
  bufferSize: 2048,
  minVolumeDecibels: -30,
  clarityThreshold: 0.9, // Internal MPM parameter (Pitchy default)
  appClarityThreshold: 0.85, // Application-level filter
  minFrequency: 70,
  maxFrequency: 1400,
} as const;

const RING_BUFFER_SIZE = 128; // ~4 seconds at 30fps

// --- Evaluation helpers (exported for testing) ---

export interface DetectionEntry {
  chroma: number;
  clarity: number;
  timestamp: number;
}

/**
 * Gets the set of target chromas for evaluation based on the target note mode.
 * If mode is "none", falls back to all chord tones.
 */
export function getTargetChromas(
  chord: Chord,
  targetNoteMode: TargetNoteMode,
): Set<number> {
  const chromas = new Set<number>();

  switch (targetNoteMode) {
    case "root": {
      const rootChroma = Note.chroma(chord.root);
      if (rootChroma !== undefined) chromas.add(rootChroma);
      break;
    }
    case "root-and-guides": {
      const rootChroma = Note.chroma(chord.root);
      if (rootChroma !== undefined) chromas.add(rootChroma);
      for (const guideTone of chord.guideTones) {
        const chroma = Note.chroma(guideTone);
        if (chroma !== undefined) chromas.add(chroma);
      }
      break;
    }
    case "none":
    case "all":
    case "chord-tones":
    case "strong-beats":
      for (const note of chord.notes) {
        const chroma = Note.chroma(note);
        if (chroma !== undefined) chromas.add(chroma);
      }
      break;
    default:
      assertNever(targetNoteMode);
  }

  return chromas;
}

/**
 * Evaluates the detection ring buffer for a chord change.
 * Returns true if any detection within the timing window matches a target chroma.
 */
export function evaluateHit(
  chromaBuffer: Uint8Array,
  clarityBuffer: Float32Array,
  timestampBuffer: Float64Array,
  writeIndex: number,
  bufferSize: number,
  windowStartTime: number,
  windowEndTime: number,
  targetChromas: Set<number>,
): boolean {
  const entries = Math.min(writeIndex, bufferSize);

  for (let i = 0; i < entries; i++) {
    const idx = (writeIndex - 1 - i + bufferSize) % bufferSize;
    const ts = timestampBuffer[idx];
    if (ts === undefined) continue;

    // Stop scanning once we're before the window
    if (ts < windowStartTime) break;
    // Skip entries after the window
    if (ts > windowEndTime) continue;

    const cl = clarityBuffer[idx];
    const ch = chromaBuffer[idx];
    if (
      cl !== undefined &&
      ch !== undefined &&
      cl >= PITCH_CONFIG.appClarityThreshold &&
      targetChromas.has(ch)
    ) {
      return true;
    }
  }

  return false;
}

// --- Hook ---

type MicState = "idle" | "requesting" | "active" | "stopping";

interface UsePitchDetectionOptions {
  enabled: boolean;
}

export function usePitchDetection({ enabled }: UsePitchDetectionOptions) {
  const setMicActive = useAppStore((s) => s.setMicActive);
  const updateScore = useAppStore((s) => s.updateScore);
  const resetScore = useAppStore((s) => s.resetScore);
  const setError = useAppStore((s) => s.setError);

  // Refs for mic lifecycle
  const micStateRef = useRef<MicState>("idle");
  const activationNonceRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const cancelTokenRef = useRef({ canceled: false });

  // Refs for pitch detection
  const detectorRef = useRef<{
    findPitch: (
      input: Float32Array<ArrayBuffer>,
      sampleRate: number,
    ) => [number, number];
    minVolumeDecibels: number;
  } | null>(null);
  const inputBufferRef = useRef<Float32Array<ArrayBuffer> | null>(null);

  // Ring buffer refs (pre-allocated typed arrays)
  const chromaBufferRef = useRef(new Uint8Array(RING_BUFFER_SIZE));
  const clarityBufferRef = useRef(new Float32Array(RING_BUFFER_SIZE));
  const timestampBufferRef = useRef(new Float64Array(RING_BUFFER_SIZE));
  const writeIndexRef = useRef(0);

  // Signal indicator ref (for UI — not store-driven)
  const lastSignalTimeRef = useRef(0);
  const signalActiveRef = useRef(false);
  const signalElementRef = useRef<HTMLElement | null>(null);

  // Track the current transport position to avoid double-evaluation
  const prevPositionRef = useRef({ barIndex: 0, chordIndex: 0 });
  // Track last evaluated position to avoid double-evaluation
  const lastEvalPositionRef = useRef<string | null>(null);

  const resetEvaluationTracking = useCallback(() => {
    const { currentBarIndex, currentChordIndex } = useAppStore.getState();
    prevPositionRef.current = {
      barIndex: currentBarIndex,
      chordIndex: currentChordIndex,
    };
    lastEvalPositionRef.current = null;
  }, []);

  const stopMicStream = useCallback(() => {
    cancelTokenRef.current.canceled = true;
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    detectorRef.current = null;
    inputBufferRef.current = null;
  }, []);

  const startDetectionLoop = useCallback(
    (analyser: AnalyserNode, sampleRate: number) => {
      const token = { canceled: false };
      cancelTokenRef.current = token;
      let frameCount = 0;

      const detect = () => {
        if (token.canceled) return;
        frameCount++;

        // Run at ~30fps (skip every other frame)
        if (
          frameCount % 2 === 0 &&
          detectorRef.current &&
          inputBufferRef.current
        ) {
          analyser.getFloatTimeDomainData(inputBufferRef.current);
          const [pitch, clarity] = detectorRef.current.findPitch(
            inputBufferRef.current,
            sampleRate,
          );

          // Update signal indicator
          const hasSignal = clarity >= 0.5;
          if (hasSignal) lastSignalTimeRef.current = performance.now();
          const isActive = performance.now() - lastSignalTimeRef.current < 300;
          if (isActive !== signalActiveRef.current) {
            signalActiveRef.current = isActive;
            if (signalElementRef.current) {
              signalElementRef.current.classList.toggle(
                "signal-active",
                isActive,
              );
            }
          }

          // Filter by confidence and frequency range
          if (
            clarity >= PITCH_CONFIG.appClarityThreshold &&
            pitch >= PITCH_CONFIG.minFrequency &&
            pitch <= PITCH_CONFIG.maxFrequency
          ) {
            const noteName = Note.fromFreq(pitch);
            const chroma = Note.chroma(noteName);
            if (chroma !== undefined) {
              const idx = writeIndexRef.current % RING_BUFFER_SIZE;
              chromaBufferRef.current[idx] = chroma;
              clarityBufferRef.current[idx] = clarity;
              timestampBufferRef.current[idx] = performance.now();
              writeIndexRef.current++;
            }
          }
        }

        if (!token.canceled) {
          requestAnimationFrame(detect);
        }
      };

      requestAnimationFrame(detect);
    },
    [],
  );

  const toggleMic = useCallback(async () => {
    if (!enabled) return;

    // Stop mic
    if (micStateRef.current === "active") {
      micStateRef.current = "stopping";
      stopMicStream();
      micStateRef.current = "idle";
      resetEvaluationTracking();
      setMicActive(false);
      return;
    }

    // Refuse during pending request
    if (micStateRef.current === "requesting") return;

    // Check browser support
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        new MicPermissionError(
          "unavailable",
          "getUserMedia is not supported in this browser",
        ),
      );
      return;
    }

    const nonce = ++activationNonceRef.current;
    micStateRef.current = "requesting";

    try {
      // Ensure AudioContext is running before getUserMedia (iOS requirement)
      await Tone.start();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      // Check if user toggled off or component unmounted while waiting
      if (nonce !== activationNonceRef.current) {
        for (const track of stream.getTracks()) track.stop();
        return;
      }

      streamRef.current = stream;

      // Listen for iOS track interruption
      const track = stream.getAudioTracks()[0];
      if (track) {
        track.addEventListener("ended", () => {
          micStateRef.current = "idle";
          stopMicStream();
          setMicActive(false);
        });
      }

      // Set up AnalyserNode using Tone.js AudioContext
      const audioContext = Tone.getContext().rawContext as AudioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = PITCH_CONFIG.bufferSize * 2;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);

      sourceRef.current = source;
      analyserRef.current = analyser;

      // Dynamic import Pitchy (not in main bundle)
      const { PitchDetector } = await import("pitchy");

      // Check nonce again after async import
      if (nonce !== activationNonceRef.current) {
        source.disconnect();
        for (const t of stream.getTracks()) t.stop();
        return;
      }

      const detector = PitchDetector.forFloat32Array(PITCH_CONFIG.bufferSize);
      detector.minVolumeDecibels = PITCH_CONFIG.minVolumeDecibels;
      detectorRef.current = detector;
      inputBufferRef.current = new Float32Array(PITCH_CONFIG.bufferSize);

      // Reset ring buffer
      writeIndexRef.current = 0;

      micStateRef.current = "active";
      setMicActive(true);
      resetScore();

      startDetectionLoop(analyser, audioContext.sampleRate);
    } catch (err) {
      if (nonce !== activationNonceRef.current) return;
      stopMicStream();
      micStateRef.current = "idle";
      resetEvaluationTracking();
      setMicActive(false);

      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError(
            new MicPermissionError("denied", "Microphone access was denied"),
          );
        } else if (err.name === "NotFoundError") {
          setError(new MicPermissionError("not-found", "No microphone found"));
        } else {
          setError(new MicPermissionError("unavailable", err.message));
        }
      }
    }
  }, [
    enabled,
    resetEvaluationTracking,
    stopMicStream,
    startDetectionLoop,
    setMicActive,
    resetScore,
    setError,
  ]);

  // Evaluate hits on chord changes by subscribing to position changes
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = useAppStore.subscribe((state) => {
      const barIndex = state.currentBarIndex;
      const chordIndex = state.currentChordIndex;
      const prev = prevPositionRef.current;

      // Only evaluate when position actually changes during playback with mic active
      if (
        !state.isPlaying ||
        micStateRef.current !== "active" ||
        !state.currentChord
      ) {
        prevPositionRef.current = { barIndex, chordIndex };
        lastEvalPositionRef.current = null;
        return;
      }

      const posKey = `${barIndex}-${chordIndex}`;
      if (posKey === lastEvalPositionRef.current) return;

      // Don't evaluate if position hasn't changed
      if (prev.barIndex === barIndex && prev.chordIndex === chordIndex) {
        return;
      }

      // Reset score on first chord of new loop
      if (barIndex === 0 && chordIndex === 0) {
        if (prev.barIndex !== 0 || prev.chordIndex !== 0) {
          resetScore();
        }
      }

      prevPositionRef.current = { barIndex, chordIndex };
      lastEvalPositionRef.current = posKey;

      // Calculate 1-beat lookback window
      const now = performance.now();
      const bpm = Tone.getTransport().bpm.value;
      const beatDurationMs = (60 / bpm) * 1000;
      const windowStart = now - beatDurationMs;

      const targetChromas = getTargetChromas(
        state.currentChord,
        state.targetNoteMode,
      );

      if (targetChromas.size === 0) return;

      const hit = evaluateHit(
        chromaBufferRef.current,
        clarityBufferRef.current,
        timestampBufferRef.current,
        writeIndexRef.current,
        RING_BUFFER_SIZE,
        windowStart,
        now,
        targetChromas,
      );

      updateScore(hit);
    });

    return unsubscribe;
  }, [enabled, updateScore, resetScore]);

  // Cleanup on unmount or when disabled
  useEffect(() => {
    if (!enabled && micStateRef.current === "active") {
      micStateRef.current = "stopping";
      stopMicStream();
      micStateRef.current = "idle";
      resetEvaluationTracking();
      setMicActive(false);
    }

    return () => {
      activationNonceRef.current++;
      if (
        micStateRef.current === "active" ||
        micStateRef.current === "requesting"
      ) {
        stopMicStream();
        micStateRef.current = "idle";
        resetEvaluationTracking();
        setMicActive(false);
      }
    };
  }, [enabled, resetEvaluationTracking, stopMicStream, setMicActive]);

  return {
    toggleMic,
    signalElementRef,
    stopMic: useCallback(() => {
      if (micStateRef.current === "active") {
        micStateRef.current = "stopping";
        stopMicStream();
        micStateRef.current = "idle";
        resetEvaluationTracking();
        setMicActive(false);
      }
    }, [resetEvaluationTracking, stopMicStream, setMicActive]),
  };
}
