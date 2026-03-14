---
title: "feat: Jazz Audio Engine Feel and Sound Improvements"
type: feat
status: active
date: 2026-03-14
origin: user request on 2026-03-14
---

# feat: Jazz Audio Engine Feel and Sound Improvements

## Overview

Improve the backing-track engine so `jazzSwing` sounds less synthetic and feels rhythmically credible. The current implementation gets basic playback working, but the jazz mode is held back by two structural constraints:

- **Weak timbre**: bass, chords, and drums are built from simple synthesized sources routed directly to destination.
- **Weak swing model**: the groove depends on global `Tone.Transport.swing`, while the actual jazz patterns are still authored on straight-grid timings.

This plan focuses on the jazz mode first, while keeping the architecture extensible to other styles later.

## Current State

### Existing implementation

- [hooks/useAudioEngine.ts](/Users/jakubjanousek/Code/fretpad/hooks/useAudioEngine.ts) creates the instruments, applies `transport.swing`, and schedules the progression.
- [lib/audio/scheduler.ts](/Users/jakubjanousek/Code/fretpad/lib/audio/scheduler.ts) schedules events from style pattern definitions using straight beat math.
- [lib/audio/styles/jazzSwing.ts](/Users/jakubjanousek/Code/fretpad/lib/audio/styles/jazzSwing.ts) defines a fixed walking bass, shell comping, and ride-like drum pattern.
- [lib/audio/instruments/bassInstrument.ts](/Users/jakubjanousek/Code/fretpad/lib/audio/instruments/bassInstrument.ts), [lib/audio/instruments/chordInstrument.ts](/Users/jakubjanousek/Code/fretpad/lib/audio/instruments/chordInstrument.ts), and [lib/audio/instruments/drumInstrument.ts](/Users/jakubjanousek/Code/fretpad/lib/audio/instruments/drumInstrument.ts) use basic Tone.js synths with no mix chain.

### Main problems

1. **Jazz timing is too generic.** Global swing applies a broad subdivision shift, but jazz needs instrument-specific phrasing: ride cymbal skip, slightly behind-the-beat comping, and a walking bass that does not feel quantized.
2. **Patterns are too repetitive.** The current bass line is effectively `1-3-5-approach` and comping is locked to two fixed hits every chord.
3. **The mix is too raw.** Triangle oscillators direct to output read as placeholders, not usable practice audio.
4. **The engine lacks expressive timing controls.** The pattern schema cannot express triplet-aware timing, laid-back placement, or per-instrument microtiming offsets cleanly.

## Goals

- Make jazz playback feel recognizably swung at common practice tempos.
- Improve tone quality enough that users can practice with the track for extended sessions.
- Keep latency and scheduling stable inside the current Tone.js architecture.
- Avoid a large rewrite unless the simpler path proves insufficient.

## Non-Goals

- Full DAW-grade realism.
- Live tempo warping or rubato.
- Human-level jazz accompaniment generation.
- Reworking all non-jazz styles in the same iteration.

## Proposed Approach

### Decision summary

1. **Fix feel before chasing realism.** Timing and phrasing problems are more damaging than imperfect samples.
2. **Use explicit swing timing for jazz instead of relying on `Transport.swing`.** This gives precise control over where each event lands.
3. **Add a lightweight mix bus after improving the source instruments.** Better source + basic processing is the highest-value path.
4. **Add controlled variation.** Humanization should be deterministic enough for practice, not chaotic.

## Phased Plan

### Phase 0: Baseline and guardrails

- Add a short internal checklist for listening tests:
  - 80 BPM medium swing
  - 120 BPM medium swing
  - 160 BPM fast swing
  - 2 chords per bar
  - loop boundary behavior
- Capture current jazz behavior in small scheduler tests where practical.
- Confirm other styles remain straight when jazz timing logic changes.

### Phase 1: Replace global swing with explicit jazz timing

#### Why

The current jazz groove is not encoded in the pattern data. It is mostly a straight grid with a transport-wide swing percentage on top. That is too blunt for convincing jazz.

#### Changes

- Extend the event model in [lib/types.ts](/Users/jakubjanousek/Code/fretpad/lib/types.ts) so pattern events can express timing intent directly.
- Update [lib/audio/scheduler.ts](/Users/jakubjanousek/Code/fretpad/lib/audio/scheduler.ts) to support:
  - triplet-aware event placement
  - per-event timing offsets in beats or fractions of beats
  - optional per-instrument microtiming
- Change [hooks/useAudioEngine.ts](/Users/jakubjanousek/Code/fretpad/hooks/useAudioEngine.ts) so `jazzSwing` no longer depends on `transport.swing` for its core feel.
- Rewrite [lib/audio/styles/jazzSwing.ts](/Users/jakubjanousek/Code/fretpad/lib/audio/styles/jazzSwing.ts) to use explicit swung ride and comping placements.

#### Target outcome

- Ride pattern sounds like long-short swing, not straight eighths with a generic shuffle.
- Comping hits can sit slightly behind or ahead intentionally.
- Bass placement stays solid without sounding machine-cut.

### Phase 2: Improve the source sounds and mix chain

#### Why

Even with better timing, triangle-wave bass and chord synths routed dry to destination will still sound cheap.

#### Changes

- Upgrade the jazz chord sound first:
  - best path: sampled piano or electric piano
  - fallback path: richer synth voice with filter envelope and softer attack
- Upgrade the bass sound:
  - best path: upright/plucked sample set
  - fallback path: filtered mono synth with saturation and transient shaping
- Upgrade the drum kit:
  - best path: jazz kit samples with ride articulation
  - fallback path: improved synthesized kit with a distinct ride voice
- Add a small mix chain for jazz instruments:
  - EQ
  - light compression
  - subtle saturation
  - short room reverb on chords/drums
  - high-cut where needed to reduce harshness

#### Tradeoff

Samples will sound better but increase asset and loading complexity. The fallback path should remain viable if bundle or caching cost is not acceptable.

### Phase 3: Add musical variation to bass and comping

#### Why

The current arrangement logic is too repetitive to feel musical over repeated loops.

#### Changes

- Expand walking bass generation in [lib/audio/voicings.ts](/Users/jakubjanousek/Code/fretpad/lib/audio/voicings.ts):
  - prefer stepwise motion
  - choose between chord tones, diatonic connectors, and chromatic approaches
  - vary direction across bars
  - treat resolution targets differently from static harmony
- Expand comping behavior in [lib/audio/styles/jazzSwing.ts](/Users/jakubjanousek/Code/fretpad/lib/audio/styles/jazzSwing.ts) and related scheduling logic:
  - rotate between multiple rhythmic cells
  - vary voicing density
  - allow occasional rests
  - support shell and rootless voicings for contrast

#### Guardrail

Variation must stay predictable enough that the track remains a practice aid, not a distraction.

### Phase 4: Humanization and instrument-specific feel

#### Why

Jazz needs controlled imperfection. The exact same velocity and note length on every loop destroys feel.

#### Changes

- Add bounded timing randomization per instrument:
  - ride: very tight
  - bass: tight but not rigid
  - comping: loosest
- Add bounded velocity and duration variation.
- Keep humanization deterministic per loop or seeded, so behavior is stable and testable.
- Support separate swing ratios or timing profiles per instrument instead of one transport-wide value.

## Implementation Options

### Option A: Minimal intervention

- Keep current synth-based engine.
- Add explicit swing timing for jazz.
- Add humanization and a basic mix bus.

**Pros:** Fastest, lowest risk.  
**Cons:** Sound quality improves only moderately.

### Option B: Balanced path

- Implement explicit swing timing.
- Improve event schema and scheduler.
- Upgrade jazz instruments selectively.
- Add smarter walking bass and comping variation.

**Pros:** Best value-to-effort ratio.  
**Cons:** Requires touching several core audio files.

### Option C: High-fidelity path

- Use sample-based jazz instruments and drums.
- Add richer arrangement rules and per-instrument feel engine.
- Potentially add separate playback presets for tempo ranges.

**Pros:** Best eventual result.  
**Cons:** Highest complexity, asset cost, and verification surface.

## Recommendation

Implement **Option B** first.

It addresses the real defect in the current jazz mode: the timing model is too primitive, and the source sounds are too bare. It improves the engine without committing immediately to a heavy sample-management project.

## File-Level Work

- [lib/types.ts](/Users/jakubjanousek/Code/fretpad/lib/types.ts)
  - Extend pattern event types to express explicit swing and timing offsets.
- [lib/audio/scheduler.ts](/Users/jakubjanousek/Code/fretpad/lib/audio/scheduler.ts)
  - Add explicit timing conversion and microtiming support.
- [hooks/useAudioEngine.ts](/Users/jakubjanousek/Code/fretpad/hooks/useAudioEngine.ts)
  - Stop treating `transport.swing` as the primary jazz feel mechanism.
- [lib/audio/styles/jazzSwing.ts](/Users/jakubjanousek/Code/fretpad/lib/audio/styles/jazzSwing.ts)
  - Replace straight-grid jazz patterns with explicit jazz phrasing and pattern variants.
- [lib/audio/instruments/bassInstrument.ts](/Users/jakubjanousek/Code/fretpad/lib/audio/instruments/bassInstrument.ts)
  - Improve bass timbre and processing.
- [lib/audio/instruments/chordInstrument.ts](/Users/jakubjanousek/Code/fretpad/lib/audio/instruments/chordInstrument.ts)
  - Improve chord timbre and processing.
- [lib/audio/instruments/drumInstrument.ts](/Users/jakubjanousek/Code/fretpad/lib/audio/instruments/drumInstrument.ts)
  - Add a more convincing jazz ride/drum sound source.
- [lib/audio/voicings.ts](/Users/jakubjanousek/Code/fretpad/lib/audio/voicings.ts)
  - Expand walking bass note selection and voicing variety.

## Acceptance Criteria

- `jazzSwing` no longer depends primarily on global `Transport.swing` for its groove.
- Jazz ride and comping placements are explicitly encoded and audibly swung.
- The jazz backing track sounds materially less synthetic than the current version.
- Repeated loops exhibit controlled variation in timing and dynamics.
- Straight styles such as `popRock`, `bossaNova`, and `ballad` do not regress.
- Multi-chord bars and loop boundaries still schedule correctly.

## Verification

- Add scheduler/unit tests for explicit swing timing and event offsets.
- Run focused listening passes at slow, medium, and fast swing tempos.
- Verify no doubled or skipped events at loop wrap.
- Verify count-in and metronome still behave correctly with the new scheduler rules.
- Verify CPU use remains acceptable on mobile Safari and desktop Chrome.

## Risks

- **Schema complexity:** richer event timing can make style definitions harder to maintain.
- **Sample loading cost:** better sounds may add asset, caching, and startup complexity.
- **Over-humanization:** too much randomness will make the app feel unreliable.
- **Cross-style leakage:** jazz-specific scheduling changes must not alter straight styles.

## Rollout Order

1. Add explicit timing support to the scheduler and event schema.
2. Rewrite `jazzSwing` to use explicit timing instead of transport-wide swing.
3. Improve jazz source sounds and add a minimal mix chain.
4. Add variation to bass and comping.
5. Add bounded humanization and per-instrument feel profiles.

