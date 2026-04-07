---
title: "Jazz Swing Backing Track Principles"
status: active
date: 2026-04-07
---

# Jazz Swing Backing Track Principles

This note captures the design principles behind the current `jazzSwing` backing-track direction so future iterations can improve the sound without reintroducing the same feel problems.

Related historical plan:
- `docs/archive/plans/2026-03-14-004-feat-jazz-audio-engine-feel-and-sound-plan.md`

## Why this exists

The main failure mode of the old backing track was not just weak timbre. The deeper issue was that the harmony and groove were encoded in a way that made the chords feel late and the swing feel vague.

Two specific problems drove the fix:

1. Chord comping was based on bar-level rhythm cells, so split bars could inherit only the late part of a pattern.
2. Swing feel came from too many overlapping timing ideas instead of one clear rhythmic center.

The result was a backing track that could be "technically swung" while still feeling wrong.

## Core principles

### 1. There is one canonical jazz backing style for now

FretPad should have one strong `jazzSwing` implementation instead of multiple jazz variants with different timing logic.

Why:
- It keeps listening feedback focused.
- It prevents rhythm fixes from being split across parallel style branches.
- It lets us improve timbre separately from groove logic.

If we add more timbral options later, they should share the same rhythmic model unless there is a very strong reason not to.

### 2. Harmonic clarity beats "hip" sparsity

This is a practice tool first, not a trio simulator.

That means:
- A new chord should be clearly stated near the point where it arrives.
- We should not default to comping patterns that avoid beat 1 so aggressively that the harmony feels late.
- Anticipations are good only when they are intentional and readable.

When in doubt, choose the version that helps the player hear the change sooner.

### 3. Comping must be chord-slot-aware, not just bar-aware

A chord that lasts 4 beats and a chord that lasts 2 beats should not be fed the same bar template and then cropped.

Instead:
- full-bar chords use patterns written for 4-beat slots
- half-bar chords use patterns written for 2-beat slots
- each slot should have its own early articulation rule

This is the most important structural principle in the current fix.

### 4. Swing should come from a shared grid, not many competing offsets

The groove feels better when the band sounds like it agrees on where the beat is.

That means:
- define one swing grid
- let ride, bass, and comp relate to that grid
- use small relational offsets after placement, not as a substitute for placement

The feel should come from stable relationships, not from stacking multiple timing systems until it sounds "human."

### 5. Fewer timing layers is usually better

Timing complexity compounds quickly.

Be careful when combining:
- swing ratio
- instrument offsets
- groove-template offsets
- humanization
- shared pocket offsets

Every new timing layer should have a clear job. If two layers solve the same problem, remove one.

### 6. The bass owns the root, so comping should stay light

Because the backing track already has walking bass, chord comping should usually avoid heavy root-doubling.

That is why lighter shell or rootless voicings are the better default:
- they leave space for the bass
- they sound less blocky
- they read more like jazz accompaniment than keyboard pads

### 7. Variation should support practice, not distract from it

A little variation helps the loop feel alive. Too much variation makes it harder to practice against.

Good variation:
- changes comping cells across bars
- slightly changes emphasis
- keeps the harmony legible

Bad variation:
- hides the chord change
- changes the pocket too much
- creates surprise for its own sake

Predictable and musical beats clever.

### 8. Tests should verify musical behavior, not only helper math

Helper tests for swing conversion and timing math are useful, but they are not enough.

We should keep regression coverage for questions like:
- does each full-bar chord get stated early enough?
- does each half-bar chord restart its comping from the top of the slot?
- do ride patterns still preserve the core swing identity?

The important failures in this area are often scheduling-shape bugs, not pure arithmetic bugs.

## Guardrails for future iterations

If someone changes the backing track later, these should remain true unless we deliberately revise the design:

1. `jazzSwing` remains the single active backing style.
2. Chord comping uses slot-aware patterns.
3. Every chord slot gets an early harmonic statement by default.
4. Bass stays rhythmically solid and does not get "swung" like comped eighths.
5. Comp voicings stay lighter than the bass harmony role.
6. New timbre work should not fork the rhythm engine.

## Good future directions

These ideas fit the current principles:
- better drum and chord timbres that keep the same rhythmic model
- stronger ride articulation and lighter hi-hat balance
- smarter voice leading between rootless voicings
- better listening-test notes for slow, medium, and fast swing tempos
- more musical comping variation as long as early chord clarity stays intact

## Risky directions

These are easy ways to regress feel:
- reintroducing multiple jazz styles with different scheduling rules
- authoring only bar-level comping patterns and cropping them for split bars
- chasing realism with more randomization instead of better placement
- reducing beat-1 chord definition in the name of authenticity
- adding new timing offsets without removing old ones

## Current implementation touchpoints

As of this note, the main files are:
- `src/lib/audio/styles/jazzSwing.ts`
- `src/lib/audio/scheduler.ts`
- `src/lib/audio/voicings.ts`
- `src/hooks/useAudioEngine.ts`

If the feel changes, these are the first places to inspect together rather than in isolation.
