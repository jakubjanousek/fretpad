---
title: "feat: Audio Input Pitch Detection for Outline Chord Changes"
type: feat
status: active
date: 2026-03-14
deepened: 2026-03-14
origin: docs/brainstorms/2026-03-14-audio-input-brainstorm.md
---

# feat: Audio Input Pitch Detection for Outline Chord Changes

## Enhancement Summary

**Deepened on:** 2026-03-14
**Research agents used:** Architecture Strategist, Performance Oracle, Frontend Races Reviewer, Security Sentinel, Pattern Recognition Specialist, Code Simplicity Reviewer, Vercel React Best Practices, Pitchy Library Research

### Key Improvements
1. **Simplified file structure** — 3 files instead of 5 (merged pitch detection + hit evaluation into single hook)
2. **Race condition mitigations** — State machine with activation nonce for mic toggle, cancellation tokens for rAF
3. **Performance hardening** — Pre-allocated buffers, typed-array ring buffer, 30fps detection rate, dynamic import of Pitchy
4. **Zustand state minimized** — 2 fields (`micActive`, `score`) instead of 4; signal indicator via ref, permission via error handling

### New Considerations Discovered
- Score must reset on first chord change (`barIndex === 0`), not on `onLoop` event, to avoid evaluation/reset race
- Must listen for `MediaStreamTrack.ended` event for iOS interruption recovery
- Read BPM from `Tone.getTransport().bpm.value` at evaluation time (not store) to handle tempo ramps
- Detection buffer must be retained across loop boundaries (player anticipates chord 1 before loop wraps)

---

## Overview

Add microphone-based pitch detection to the "Outline Chord Changes" practice mode, providing a simple scorecard showing how many target notes the user hit on chord changes (e.g. "3/4"). Uses the Pitchy library (pure JS, ~5KB gzipped) for pitch detection via the McLeod Pitch Method, running on the main thread with AnalyserNode.

This is the first step toward audio-aware practice feedback. It plugs into the existing target note system and chord change callbacks with minimal new infrastructure.

## Problem Statement / Motivation

The app plays backing tracks and shows target notes on the fretboard, but never hears the user play. There is no way to know if practice is effective without self-assessment. A simple "did you hit the right notes on chord changes?" scorecard closes this feedback loop with minimal complexity (see brainstorm: `docs/brainstorms/2026-03-14-audio-input-brainstorm.md`).

## Proposed Solution

### Architecture

```
Microphone (getUserMedia, same AudioContext as Tone.js)
  → MediaStreamSource
  → AnalyserNode (getFloatTimeDomainData, smoothingTimeConstant: 0)
  → Pitchy PitchDetector (McLeod Pitch Method, main thread, ~30fps via rAF)
  → Note mapper (Hz → chroma via Note.chroma from tonal)
  → Hit evaluator (compare vs current chord's target notes within 1-beat window)
  → audioInputSlice (Zustand — micActive + score only)
  → Inline scorecard UI
```

### Key Technical Decisions

1. **Pitchy over Essentia.js** — Pure JS (~5KB gzipped + fft.js dep), no WASM, no cross-browser loading complexity. McLeod Pitch Method is comparable to YIN for monophonic instruments. If accuracy proves insufficient, Essentia.js YIN is a known fallback. *(Updated from brainstorm decision #3.)*

2. **AnalyserNode + requestAnimationFrame on main thread at ~30fps** — No AudioWorklet needed. Polling at 30fps (~33ms intervals) gives ~15 samples per beat at 120 BPM — far more than needed for binary hit/miss evaluation. This halves main-thread work vs 60fps with no accuracy loss. Move to AudioWorklet only if performance is an issue.

3. **Same AudioContext as Tone.js** — Use `Tone.getContext().rawContext` for mic input. iOS allows only one AudioContext; creating a second one kills the backing track. Disable `echoCancellation`, `noiseSuppression`, and `autoGainControl` in getUserMedia constraints to preserve pitch accuracy. Call `Tone.start()` before `getUserMedia` to lock the sample rate.

4. **Hit definition: respects user's target note mode** — If user has `guide-tones-only` selected, only root/3rd/7th count as hits. If `chord-tones`, all chord tones count. Evaluation matches what the fretboard is highlighting. *(Resolved during planning.)*

5. **Scorecard denominator = number of chord changes per loop** — For the default ii-V-I (4 bars), max score is "4/4". Simple, maps 1:1 to chord boundaries. *(Resolved during planning.)*

6. **Inline scorecard, updates each loop** — Small non-intrusive display visible during play, resets each loop. No modal interruption. *(Resolved during planning.)*

7. **Small signal indicator** — A subtle audio level dot near the mic toggle that pulses when sound is detected. Driven by ref + rAF in the component, not Zustand state. *(Resolved during planning.)*

All other decisions (scope, timing window, headphones warning, confidence threshold, octave-agnostic matching) carried forward from brainstorm unchanged.

## Technical Considerations

### Pitch Detection Pipeline

- **Buffer size:** 2048 samples (~46ms at 44.1kHz). Sufficient for guitar fundamentals down to low E (~82Hz). The McLeod method needs ~2 full periods of the fundamental — 2048 samples gives ~3.8 periods of E2 at 44.1kHz. If low-string accuracy is poor, increase to 4096.
- **Confidence threshold:** Only count detections with Pitchy clarity ≥ 0.85 (application-level filter). The internal `clarityThreshold` (MPM `k` parameter) stays at default 0.9. Guitar attack transients produce low clarity for the first ~50-100ms — this is expected and filtered.
- **Volume threshold:** Set `detector.minVolumeDecibels = -30` to reject ambient noise.
- **Frequency range:** Only accept detections between 70 Hz and 1400 Hz (E2 with margin through E6 with margin). Rejects subharmonics and high-frequency noise.
- **Octave-agnostic matching:** Compare by pitch class (chroma 0-11) only, using existing `Note.chroma()` from tonal. A C3 = C4 for evaluation.
- **Sample rate:** Always read from `audioContext.sampleRate`, never hardcode (iOS Safari sometimes uses 48kHz).
- **AnalyserNode config:** Set `smoothingTimeConstant: 0` (smoothing is for frequency-domain visualization, not needed for time-domain pitch detection).

#### Research Insights: Pitchy Configuration

```typescript
const PITCH_CONFIG = {
  bufferSize: 2048,
  minVolumeDecibels: -30,
  clarityThreshold: 0.9,     // Internal MPM parameter (leave at default)
  appClarityThreshold: 0.85,  // Application-level filter
  minFrequency: 70,
  maxFrequency: 1400,
} as const;

// Create detector ONCE, reuse across all detection cycles
const detector = PitchDetector.forFloat32Array(PITCH_CONFIG.bufferSize);
detector.minVolumeDecibels = PITCH_CONFIG.minVolumeDecibels;

// Pre-allocate buffer ONCE, reuse (avoids 30 Float32Array allocations/sec)
const inputBuffer = new Float32Array(PITCH_CONFIG.bufferSize);

// In rAF loop:
analyser.getFloatTimeDomainData(inputBuffer); // writes into existing buffer
const [pitch, clarity] = detector.findPitch(inputBuffer, sampleRate);
```

### Timing Window Evaluation

- **Window:** 1 beat before each chord change. Beat-relative, so it naturally tightens at faster tempos. Look-back only — no forward delay needed.
- **BPM source:** Read from `Tone.getTransport().bpm.value` at evaluation time, NOT from the Zustand store. This accounts for tempo ramps where BPM changes between loops.
- **Implementation:** When a chord change is detected (store position changes to new bar/chord), look back at the detection ring buffer for the previous 1 beat. If any high-confidence detection matches a target note (by chroma) of the NEW chord, it's a hit.
- **Count-in:** Do NOT evaluate during count-in bars. The scheduler already offsets events by count-in.
- **Loop boundary:** The transition from last chord back to first chord IS evaluated. The detection buffer is retained across loop boundaries — only the score resets.
- **Score reset:** Reset score when `barIndex === 0 && chordIndex === 0` (first chord change of new loop), NOT on the `onLoop` transport event. This guarantees the previous loop's last evaluation completes before reset.
- **Silence:** No detection in a window = miss. The mode expects a note at every chord change.

#### Research Insights: Detection Ring Buffer

Use a fixed-size typed-array ring buffer to avoid per-frame object allocation and GC pressure:

```typescript
const BUFFER_SIZE = 128; // Holds ~4 seconds at 30fps
const chromaBuffer = new Uint8Array(BUFFER_SIZE);
const clarityBuffer = new Float32Array(BUFFER_SIZE);
const timestampBuffer = new Float64Array(BUFFER_SIZE);
let writeIndex = 0;

// In rAF loop (no allocation):
chromaBuffer[writeIndex % BUFFER_SIZE] = detectedChroma;
clarityBuffer[writeIndex % BUFFER_SIZE] = clarity;
timestampBuffer[writeIndex % BUFFER_SIZE] = performance.now();
writeIndex++;
```

### State Management (Zustand)

**Minimal store footprint** — only 2 fields in the audioInputSlice:
- `micActive: boolean` — toggle state
- `score: { hits: number, total: number }` — updated once per chord change

Everything else stays in refs or local component state:
- Detection buffer → typed-array refs (see ring buffer above)
- Signal indicator → ref + rAF in component (timestamp-based, not debounced)
- Permission state → inferred from getUserMedia result/error, not pre-cached
- PitchDetector instance → ref
- Float32Array buffer → ref
- MediaStream → ref
- AnalyserNode → ref
- rAF ID → ref

**Do NOT persist** audioInputSlice state in the Zustand `partialize` config. Mic should not auto-activate on page reload. Add an explicit comment in `useAppStore.ts` noting the intentional exclusion.

**Functional updates** from the rAF callback to avoid stale closures:

```typescript
store.setState(prev => ({
  score: { hits: prev.score.hits + 1, total: prev.score.total }
}));
```

#### Research Insights: Signal Indicator

Use timestamp-based detection instead of debouncing (produces at most 2 store updates per signal event):

```typescript
// In ref (not store):
const lastSignalTimeRef = useRef(0);
const signalActiveRef = useRef(false);

// In rAF loop:
if (hasSignal) lastSignalTimeRef.current = performance.now();
const active = (performance.now() - lastSignalTimeRef.current) < 300; // 300ms hold
if (active !== signalActiveRef.current) {
  signalActiveRef.current = active;
  // Update a local state or directly toggle a CSS class via ref
}
```

### Chord Change Integration

**Do NOT modify `handleChordChange` in `useTransportControls.ts`.** Instead, have `usePitchDetection` observe store position changes (`currentBarIndex`, `currentChordIndex`) via Zustand subscription or compose a parallel callback at the page level. This preserves the transport hook's single responsibility.

The existing `onChordChange` callback fires from `Tone.Transport.schedule` — it is NOT synchronized with rAF. The JavaScript callback lands on the main thread whenever the browser gets around to it. Timestamp every detection entry so the evaluator can partition correctly by time.

### Mic Lifecycle: State Machine + Activation Nonce

The browser permission dialog can hang for 5-10 seconds. Users will toggle the mic button during this wait. A boolean `micActive` flag is insufficient — use a state machine:

```typescript
type MicState = "idle" | "requesting" | "active" | "stopping";

const micStateRef = useRef<MicState>("idle");
const activationNonceRef = useRef(0);

async function toggleMic() {
  if (micStateRef.current === "requesting") return; // Refuse during pending request

  if (micStateRef.current === "active") {
    micStateRef.current = "stopping";
    stopMicStream();
    micStateRef.current = "idle";
    return;
  }

  const nonce = ++activationNonceRef.current;
  micStateRef.current = "requesting";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: ... });

    // Check: did user toggle off or component unmount while waiting?
    if (nonce !== activationNonceRef.current) {
      stream.getTracks().forEach(t => t.stop()); // Kill orphaned stream
      return;
    }

    micStateRef.current = "active";
    setupAnalyserAndStartLoop(stream);
  } catch (err) {
    if (nonce === activationNonceRef.current) {
      micStateRef.current = "idle";
      // Route through lib/errors.ts (see Error Handling section)
    }
  }
}
```

The nonce pattern also handles component unmount during the permission dialog — increment the nonce in the cleanup function.

### rAF Loop with Cancellation Token

Use a cancellation token (not just `cancelAnimationFrame`) because a queued callback may already be executing when cancel is called:

```typescript
const cancelTokenRef = useRef({ canceled: false });

function startDetectionLoop(analyser: AnalyserNode) {
  const token = { canceled: false };
  cancelTokenRef.current = token;
  let frameCount = 0;

  const detect = () => {
    if (token.canceled) return;
    frameCount++;
    if (frameCount % 2 === 0) { // 30fps (skip every other frame)
      analyser.getFloatTimeDomainData(inputBuffer);
      const [pitch, clarity] = detector.findPitch(inputBuffer, sampleRate);
      // ... evaluate and buffer ...
    }
    if (!token.canceled) requestAnimationFrame(detect);
  };

  requestAnimationFrame(detect);
}

// On stop:
cancelTokenRef.current.canceled = true;
```

### iOS Compatibility

- Use `Tone.getContext().rawContext` for all mic-related Web Audio operations
- Call `Tone.start()` BEFORE `getUserMedia` to lock AudioContext sample rate
- Listen for `MediaStreamTrack.ended` event — on iOS, phone calls kill the track independently of AudioContext suspension. The track's `readyState` goes to `"ended"` and cannot be reused:

```typescript
const track = stream.getAudioTracks()[0];
track.addEventListener("ended", () => {
  micStateRef.current = "idle";
  store.setState({ micActive: false });
  // User must re-activate mic after interruption
});
```

- Do NOT extend `AudioInterruptedOverlay` — different concern, different recovery path. Simply deactivate the mic on track end. User clicks the mic button again to reactivate.

### Error Handling

Route mic errors through the existing `lib/errors.ts` pattern. Add a `MicPermissionError` class following the existing `AudioPlaybackError` / `AudioContextError` pattern:

```typescript
export class MicPermissionError extends FretPadError {
  constructor(
    public readonly reason: "denied" | "not-found" | "unavailable",
    message: string
  ) {
    super(`MIC_${reason.toUpperCase()}`, message);
  }
}
```

Add cases to `toErrorInfo()` with user-friendly messages and recovery actions.

### Bundle Optimization

**Dynamic import Pitchy only when mic is activated** — the library should NOT be in the main bundle since most users won't use the mic feature:

```typescript
// In usePitchDetection.ts:
const pitchyModule = await import("pitchy");
const detector = pitchyModule.PitchDetector.forFloat32Array(2048);
```

**Use `next/dynamic` with `{ ssr: false }`** for the `AudioInputScorecard` component since it depends on browser-only APIs.

## System-Wide Impact

- **Interaction graph:** Mic toggle → state machine (idle→requesting) → getUserMedia → MediaStreamSource → AnalyserNode → rAF polling loop (30fps) → pitch detection → ring buffer write. Separately: store position change (currentBarIndex/currentChordIndex) → evaluate ring buffer → update `score` in store → scorecard re-renders.
- **Error propagation:** getUserMedia errors → `MicPermissionError` → `setError()` → error toast. Track ended events → deactivate mic. Detection errors (low confidence) → silently filtered.
- **State lifecycle risks:** Mic stream must be released on mode exit, playback stop, and component unmount. The activation nonce pattern prevents orphaned streams from late-resolving getUserMedia promises. `MediaStreamTrack.ended` listener catches iOS interruptions.
- **API surface parity:** No other features use mic input, so no parity concerns.
- **Render isolation:** The scorecard component must subscribe only to `score` from the store and must NOT be in the render path of `usePlaybackPosition` consumers (which re-render at 60fps).

## Acceptance Criteria

- [x] Mic toggle button appears in Outline Chord Changes mode only
- [x] Clicking mic toggle requests microphone permission (first time) or activates mic (returning)
- [x] Double-clicking during permission dialog does not create orphaned streams
- [x] Headphones recommendation shown on first mic activation (dismissable)
- [x] Signal indicator shows when mic detects audio input (ref-driven, not store-driven)
- [x] During playback, pitch detection runs and notes are classified against current chord's targets
- [x] After each loop completes, inline scorecard shows "X/Y" (hits/chord changes)
- [x] Scorecard resets on first chord change of new loop
- [x] Detection buffer retained across loop boundaries
- [x] Mic stream is released on mode exit, stop, unmount, and iOS interruption
- [x] Permission denied state shows instructional error via existing error system
- [x] Feature degrades gracefully (hidden toggle) if getUserMedia is unavailable
- [ ] Works on Chrome, Safari (macOS), Safari (iOS), Firefox
- [ ] No impact on backing track playback performance
- [x] Pitchy loaded via dynamic import (not in main bundle)

## Implementation

### File Structure (3 files)

| File | Purpose |
|------|---------|
| `hooks/usePitchDetection.ts` | Everything: mic access, state machine, AnalyserNode setup, Pitchy detection, ring buffer, hit evaluation, cleanup |
| `state/slices/audioInputSlice.ts` | Two fields: `micActive`, `score` |
| `components/transport/AudioInputScorecard.tsx` | Score display UI ("3/4" badge) |

Plus modifications to:
- `state/useAppStore.ts` — compose new slice (explicitly exclude from `partialize`)
- `lib/types.ts` — add `showMicToggle?: boolean` to `PracticeModeConfig` (optional, defaults to false)
- `lib/modes.ts` — set `showMicToggle: true` for outline-chord-changes only
- `lib/errors.ts` — add `MicPermissionError` class and `toErrorInfo` cases
- `app/practice/[mode]/PracticePage.tsx` — wire scorecard and mic toggle into mode UI
- `state/slices/practiceModeSlice.ts` — `enterMode()` sets `micActive: false` when switching to a mode without `showMicToggle`

### Implementation Details

**`hooks/usePitchDetection.ts`** — The single hook that owns the entire mic lifecycle:
- State machine (idle/requesting/active/stopping) with activation nonce
- `getUserMedia` with proper constraints + `Tone.start()` beforehand
- `MediaStreamSource` → `AnalyserNode` (fftSize: 2048, smoothingTimeConstant: 0)
- Pre-allocated `Float32Array(2048)` + `PitchDetector` instance (both created once)
- rAF loop at 30fps with cancellation token
- Typed-array ring buffer for detections (chroma, clarity, timestamp)
- Hit evaluation function: on store position change, partition buffer by time, match against target notes by chroma
- `MediaStreamTrack.ended` listener for iOS interruption
- Single `useEffect` for entire lifecycle (per documented learnings)
- Imperative `stopMic()` exposed for transport stop handler
- Cleanup: cancel token → disconnect nodes → stop tracks → reset state

**`state/slices/audioInputSlice.ts`** — Minimal:
```typescript
interface AudioInputSlice {
  micActive: boolean;
  score: { hits: number; total: number };
  setMicActive: (active: boolean) => void;
  updateScore: (hit: boolean) => void;
  resetScore: () => void;
}
```

**`components/transport/AudioInputScorecard.tsx`** — Subscribes only to `score`:
```typescript
const { hits, total } = useAppStore(state => state.score);
// Render: "3/4" badge, only re-renders on score change
```

The mic toggle button and signal indicator live in the existing transport bar — a `<div>` with a conditional class driven by a ref, not a separate component.

### Testing

Unit tests for the pure evaluation logic (extracted as a non-exported helper in the hook file):
- Hit: target note detected within timing window
- Miss: non-target note detected, or silence
- Low confidence: detection below clarity threshold filtered
- Loop boundary: buffer retained, score resets on first chord change
- Count-in: no evaluation during count-in bars
- Frequency range: detections outside 70-1400 Hz rejected

## Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Pitchy accuracy insufficient for guitar | Scorecard unreliable | Fallback to Essentia.js YIN (brainstorm's original choice). Start with buffer size 2048, increase to 4096 if low-string accuracy is poor |
| Main thread detection causes jank | UI stuttering during playback | 30fps rate already halves work. Move Pitchy to AudioWorklet if needed (trivial — pure JS) |
| iOS AudioContext sharing issues | Backing track breaks when mic activates | Call `Tone.start()` before `getUserMedia`. Test early |
| Speaker bleed into mic | False positives in scorecard | Headphones warning |
| Double-activation race condition | Orphaned MediaStreams, battery drain | State machine + activation nonce (see Mic Lifecycle section) |
| Component unmount during permission dialog | Orphaned stream, state updates on unmounted component | Activation nonce incremented in cleanup |
| iOS phone call kills MediaStreamTrack | Mic appears active but detects silence | `MediaStreamTrack.ended` listener deactivates mic |

## Success Metrics

- Users can activate mic in Outline Chord Changes mode and see a score after each loop
- Pitch detection accuracy > 90% for clean single-note guitar playing with headphones
- No measurable impact on backing track playback performance
- Mic toggle → first detection in < 2 seconds (including permission prompt)
- Zero orphaned MediaStreams across all edge cases (double-click, unmount, iOS interruption)

## Sources & References

### Origin

- **Brainstorm document:** [docs/brainstorms/2026-03-14-audio-input-brainstorm.md](docs/brainstorms/2026-03-14-audio-input-brainstorm.md) — Key decisions carried forward: scope to Outline Changes mode, simple scorecard, generous timing window, headphones warning, confidence threshold. Technology decision updated from Essentia.js to Pitchy based on research.

### Internal References

- Chord change callback: `hooks/useTransportControls.ts:31-36`
- Note classification: `lib/theory/chords.ts:208-231` (`sameChroma`, `isChordTone`, `isGuideTone`, `isRoot`)
- Target notes: `lib/theory/targetNotes.ts:29-42`
- Mode config: `lib/modes.ts:32-50`, `lib/types.ts:437-453`
- Quiz slice (state shape reference): `state/slices/quizSlice.ts`
- Session planner slice (lifecycle reference): `state/slices/sessionPlannerSlice.ts`
- Render cascade learnings: `docs/solutions/performance-issues/zustand-mode-switching-render-cascade.md`
- Effect race condition learnings: `docs/solutions/logic-errors/nextjs-zustand-guided-practice-code-review.md`
- Existing error types: `lib/errors.ts` (`AudioPlaybackError`, `AudioContextError`)

### External References

- Pitchy library: https://github.com/ianprime0509/pitchy
- @chordbook/tuner (production guitar tuner using Pitchy): https://github.com/chordbook/tuner
- McLeod & Wyvill — "A Smarter Way to Find Pitch": https://www.cs.otago.ac.nz/research/publications/oucs-2008-03.pdf
- Tone.js AudioContext: `Tone.getContext().rawContext` for raw Web Audio operations
- getUserMedia constraints: disable echoCancellation, noiseSuppression, autoGainControl for instrument input
