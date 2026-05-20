# Constraint Ladder Exercise

## Problem

The current app already covers most of what a static "exercise" would add: free-play already exposes chord tones, guide tones, suggested scales, pentatonic/CAGED overlays, loop count, presets. A first attempt at a **note-mask exercise** (pick a scale, dim everything outside it) was built and reverted because it failed two tests:

1. **No-op cases.** Picking C Major over ii-V-I in C dimmed nothing visible — all chord/scale tones were already in C.
2. **Musically incoherent cases.** Picking F# Major over ii-V-I in C was allowed but nonsensical.

Deeper diagnosis: **one mask over a multi-chord progression is the wrong primitive.** Jazz improv is not "pick a key and stay in it." It is "play the changes." The constraint has to move with the chords.

Reverted at `a7e56eb`. 557/557 tests pass, types clean.

## Design — Constraint Ladder

One exercise that **auto-progresses through difficulty levels over a session**. The mask is **per-chord** — it changes as the chord changes — teaching the player to actually voice-lead through changes instead of treating the progression as a single key.

### Levels

| Level | Loops | Visible Notes (per current chord) | Goal |
|-------|-------|------------------------------------|------|
| L1 | 1–2 | Chord tones only | Arpeggiate the changes |
| L2 | 3–4 | Chord tones + primary suggested scale | Connect arpeggios with scale motion |
| L3 | 5–6 | + chromatic approach notes (½-step above/below chord tones) | Add chromatic color |
| L4 | 7–8 | Mask off — free play | Synthesize what was just drilled |

Defaults: 8 loops total, 2 per level. Configurable later.

### Preflight UI

- Confirm progression (reuses existing editor)
- Confirm tempo
- **No scale picker** — irrelevant now; the constraint is derived per-chord from the progression itself
- Optional: total loops / loops-per-level

### In-Session UI

- Small badge at top of fretboard: `Level 2 of 4 — Chord tones + scale`
- Progress dots underneath (●●○○○○○○ — completed loops vs. remaining)
- Auto-advances — user can't fiddle mid-exercise
- Optional: "skip level" button for impatient users (decide after first run)

### Why this beats existing toggles

The current Layers/Targets toggles are static and user-driven. The ladder is **time-bound and auto-progressing** — that's the unique value a "session" gives you that a "mode" can't. It also matches standard jazz pedagogy: arpeggios first, then scales, then chromaticism. Forcing that sequence prevents the common plateau where students "know their scales" but their solos sound like scales.

## Implementation Plan

### Phase 1: Per-chord mask logic (pure, TDD)

`src/lib/theory/constraintLadder.ts`

- `getAllowedNotesForChord(chord: Chord, level: 1 | 2 | 3 | 4): Set<NoteName>`
  - L1: chord.notes
  - L2: chord.notes ∪ scaleNotes(chord.suggestedScales[0])
  - L3: L2 ∪ chromatic approach notes (±1 semitone from each chord tone)
  - L4: all 12 notes (no mask)
- `getCurrentLevel(loopIndex: number, loopsPerLevel: number): 1 | 2 | 3 | 4`
  - Clamp to 4 once past final level
- Tests cover: known ii-V-I progression at each level, level transition boundaries, L4 returns full chromatic set.

### Phase 2: FretNote integration

`src/lib/fretboard.ts`

- Extend `FretNote` with `isMasked: boolean` (true = dim it).
- When rendering during an active exercise, compute mask from current chord + current level.

### Phase 3: Exercise state

`src/state/slices/exerciseSlice.ts` (new) or extension of existing store

- `activeExerciseId: "constraint-ladder" | null`
- `exercisePhase: "preflight" | "playing" | "complete"`
- `exerciseParams: { totalLoops: number, loopsPerLevel: number }`
- Driven by existing loop counter — no new timing infrastructure.

### Phase 4: Route + UI

- `src/app/practice/exercise/[exerciseId]/page.tsx` — already exists in concept (was reverted, rebuild leaner)
- `src/components/exercise/ConstraintLadderPreflight.tsx`
- `src/components/exercise/LevelBadge.tsx` + progress dots
- Wire into existing fretboard render — mask is just a style applied to `FretMarker` when `isMasked === true`.

### Phase 5: Polish

- Audio cue at level transitions (subtle — a short rim shot or pitched click)
- "Skip to next level" button if user demand emerges
- Save preset configs (4 loops total instead of 8 for quick sessions)

## Verification

1. `pnpm validate` passes
2. Run exercise on default ii-V-I — observe Dm7 lighting up D F A C at L1, then those + D Dorian at L2, etc.
3. Mask updates when chord changes mid-loop (not just at loop boundary)
4. Level transitions happen at correct loop indices
5. L4 displays full fretboard, no dimming

## Reuses

| What | Where |
|------|-------|
| Chord parsing + suggestedScales | `src/lib/theory/chords.ts` |
| Scale → notes | `src/lib/theory/scales.ts` |
| Fretboard layout | `src/lib/fretboard.ts` |
| Loop counter | existing transport state |
| Exercise route shell | rebuild leaner version of reverted code |

## Open Questions

- Should chromatic approach notes (L3) include all chromatic notes between chord tones, or strictly the ½-step neighbors of each chord tone? (Leaning strict — too many notes defeats the purpose.)
- Does the level badge need to show what notes are visible, or just the goal? (Leaning goal-only — labels like "arpeggiate the changes" teach intent, not theory.)
- Skip button on first ship — yes or no? (Leaning no — auto-progression is the point.)
