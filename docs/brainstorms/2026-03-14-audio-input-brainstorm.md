# Audio Input: Target Note Feedback

**Date:** 2026-03-14
**Status:** Brainstorm

## What We're Building

Microphone-based pitch detection that listens to the user's guitar playing during the "Outline Chord Changes" practice mode and provides a simple scorecard: how many target notes did the user hit on chord changes (e.g. "7/10 target notes hit").

This is not a real-time visual feedback system or a comprehensive analytics tool. It's a simple, honest answer to: "Did I land on the right notes when the chords changed?"

## Why This Approach

- **Scoped to one mode:** The "Outline Chord Changes" mode already defines what the target notes are and highlights them on the fretboard. Audio input plugs directly into this existing system.
- **Simple feedback model:** A hit/miss scorecard is easy to understand, doesn't overwhelm the player, and provides actionable feedback without complex analytics.
- **Natural integration point:** The `onChordChange` callback in `scheduler.ts` already fires at every chord boundary, providing the timing context needed to evaluate target note hits.

## Key Decisions

1. **Scope: Outline Chord Changes mode only.** Audio input launches inside this one practice mode. Not a global capability. This keeps the "what counts as correct" question simple — target notes are already defined by the mode.

2. **Feedback level: Simple scorecard.** Track hit/miss per chord change, show summary at end of loop (e.g. "7/10"). No real-time fretboard highlighting or timing analytics in v1.

3. **Pitch detection: ~~Essentia.js with YIN algorithm (WASM)~~ → Pitchy (pure JS, ~5KB).** Updated during planning — research showed Essentia.js (2.5MB+ WASM) is overkill for monophonic pitch detection. Pitchy uses the McLeod Pitch Method, comparable accuracy to YIN, zero WASM complexity, works on main thread via AnalyserNode. Essentia.js remains as fallback if accuracy proves insufficient.

4. **Audio setup: User's choice with headphones warning.** Don't enforce headphones, but show a recommendation when mic input is activated. Backing track through speakers can interfere with detection.

5. **Timing window: Generous (~1 beat).** A target note detected within ~1 beat of a chord change counts as a hit. This matches how musicians naturally anticipate chord changes and is forgiving for learners.

6. **Pitch-to-note mapping: Reuse existing infrastructure.** Convert detected frequency → nearest MIDI note → NoteName using the existing `getPitchClass()` pattern, then check against current chord's target notes via `isChordTone()`/`isGuideTone()` functions.

7. **Confidence threshold: Only count high-confidence detections.** YIN outputs a confidence value with each pitch estimate. Ignore low-confidence detections (noise, string scrapes, harmonics) to avoid false positives in the scorecard. Exact threshold to be tuned during implementation.

## Architecture Sketch

```
Microphone (getUserMedia)
  → MediaStreamSource
  → AudioWorklet (Essentia.js YIN)
  → Detected pitch (Hz) + confidence
  → Note mapper (Hz → NoteName)
  → Hit evaluator (compare vs current chord's target notes within timing window)
  → Score tracker (Zustand slice)
  → Scorecard UI (shown after loop completes)
```

### Integration Points

- **`scheduler.ts` `onChordChange` callback** — signals when chord boundaries occur, triggering hit evaluation windows
- **`getPitchClass()` / `isChordTone()` / `isGuideTone()`** — existing note classification reused for evaluation
- **`practiceModeSlice`** — new audio input state managed here or in a new dedicated slice
- **`PracticeModeConfig`** — Outline Changes config extended with audio input toggle

### What Needs to Be Built

- Microphone access with permission handling
- Pitch detection pipeline (Essentia.js YIN in AudioWorklet)
- Note evaluation logic (detected pitch vs current chord's target notes)
- State management for mic, detection, and scoring
- Scorecard UI shown after loop completes
- Mic toggle + headphones warning in Outline Changes mode UI

## Open Questions

*None — all key questions resolved during brainstorming.*

## Out of Scope (Future)

- Real-time fretboard highlighting of detected notes
- Timing accuracy feedback (early/late/on-time)
- Detailed session analytics and progress tracking over time
- Audio input in other practice modes
- Polyphonic detection (chords played by user)
- Audio input calibration/setup wizard
