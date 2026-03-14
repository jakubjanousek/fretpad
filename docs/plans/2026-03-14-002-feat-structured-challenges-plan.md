---
title: "feat: Structured Challenges for Guided Practice Modes"
type: feat
status: active
date: 2026-03-14
origin: docs/brainstorms/2026-03-13-guided-practice-modes-brainstorm.md
---

# Structured Challenges for Guided Practice Modes

## Overview

Add mode-specific structured challenges that give guitarists concrete goals during practice. Each of the 3 guided modes gets 3 challenges that track progress passively as the user practices. Challenges are sequential (one active per mode), persist in localStorage, and require no account.

This is Phase 3 of the [Guided Practice Modes plan](2026-03-13-001-feat-guided-practice-modes-plan.md). Phases 1 (Mode System + Launcher) and 2 (Landing Page + SEO) are complete.

(see brainstorm: [docs/brainstorms/2026-03-13-guided-practice-modes-brainstorm.md](../brainstorms/2026-03-13-guided-practice-modes-brainstorm.md))

## Problem Statement

FretPad's practice stats track time and streaks but don't drive goals. Users can practice indefinitely without structured milestones. Challenges add directed practice — "complete this, then try that" — which increases retention and gives a sense of progression.

## Proposed Solution

### Challenge Data Model

```typescript
// lib/challenges/challenges.ts

// String literal union — finite set, compile-time exhaustiveness checking
type ChallengeId =
  | "ltn-practice-10"
  | "ltn-quiz-accuracy"
  | "ltn-keys-4"
  | "occ-practice-10"
  | "occ-keys-4"
  | "occ-practice-30"
  | "cwv-practice-10"
  | "cwv-voicings-10"
  | "cwv-keys-3";

interface Challenge {
  id: ChallengeId;
  mode: PracticeModeId;
  title: string;
  description: string;
  target: number;           // Goal value (minutes, count, etc.)
  criterion: ChallengeCriterion;
}

type ChallengeCriterion =
  | { type: "keys"; preset: string }
  | { type: "quiz-accuracy"; threshold: number }
  | { type: "voicings-explored" }
  | { type: "practice-time" };
```

### Challenge Progress Model

```typescript
// lib/challenges/challenges.ts

interface ChallengeProgress {
  startedAt: string;      // ISO date — progress counts from this point
  current: number;        // Current value toward goal
  completedAt?: string;   // ISO date when completed
}

// Top-level persisted state
type ChallengeState = Record<ChallengeId, ChallengeProgress>;
```

### Challenge Definitions (9 total)

#### Learn the Neck (3 challenges, sequential)

| # | ID | Title | Target | Criterion | Details |
|---|-----|-------|--------|-----------|---------|
| 1 | `ltn-practice-10` | "Practice for 10 minutes" | 10 | `practice-time` | Ease into the mode. Accumulates while transport is playing. |
| 2 | `ltn-quiz-accuracy` | "Score 80% on 3 quizzes" | 3 | `quiz-accuracy: 80` | Only fully completed quizzes (all 10 questions) count. Early exits discarded. |
| 3 | `ltn-keys-4` | "Practice in 4 different keys" | 4 | `keys: "Dorian Vamp (Dm7)"` | Transpose and play in each key. |

#### Outline Chord Changes (3 challenges, sequential)

| # | ID | Title | Target | Criterion | Details |
|---|-----|-------|--------|-----------|---------|
| 1 | `occ-practice-10` | "Practice for 10 minutes" | 10 | `practice-time` | Same pattern — start easy. |
| 2 | `occ-keys-4` | "ii-V-I in 4 keys" | 4 | `keys: "ii-V-I in C"` | Transpose and play in each key. |
| 3 | `occ-practice-30` | "Practice for 30 minutes total" | 30 | `practice-time` | Cumulative since challenge start. |

#### Comp with Voicings (3 challenges, sequential)

| # | ID | Title | Target | Criterion | Details |
|---|-----|-------|--------|-----------|---------|
| 1 | `cwv-practice-10` | "Practice for 10 minutes" | 10 | `practice-time` | Same easy start. |
| 2 | `cwv-voicings-10` | "Explore 10 voicings" | 10 | `voicings-explored` | 10 unique voicings by `chord|index` dedup key. |
| 3 | `cwv-keys-3` | "Comp through ii-V-I in 3 keys" | 3 | `keys: "ii-V-I in C"` | Transpose and play in each key. |

### Key Design Decisions

1. **Sequential challenges.** One active challenge per mode. Next challenge unlocks on completion. Shows "up next" preview. Simpler UI, focused motivation.

2. **Start fresh.** Progress only counts from when the challenge becomes active (`startedAt` timestamp). Prevents instant completion for existing users with practice time already in localStorage.

3. **Passive tracking.** No "start challenge" button. Progress accumulates automatically during normal practice. Rewards consistent practice.

4. **Count transpose-and-play events for keys.** No continuous playback timer — counting transpositions where the user has played is sufficient for a personal practice tool and avoids a second timer mechanism.

5. **Only completed quizzes count.** A quiz must have all 10 questions answered to count toward `quiz-accuracy`. Early exits via the X button are discarded.

6. **Simple voicing dedup key.** Use `${chord.symbol}|${voicingIndex}` as the dedup key in a transient `Set`. Persist only the count. The Set resets on app restart — re-exploring a voicing across sessions still counts, which is fine for an "explore 10 voicings" goal.

7. **Side-effects-in-actions, not useEffect watchers.** Track challenge events directly in Zustand actions. This eliminates the critical race condition where `endQuiz()` can reset quiz scores before a useEffect captures them.

### UI Design

**Placement:** Compact card below the progression editor, above the fretboard. Rendered as an isolated `<ChallengeTracker>` component that owns its own Zustand subscriptions — prevents re-renders from propagating to the expensive Fretboard.

```
┌─────────────────────────────────────────┐
│ ModeHeader                              │
├─────────────────────────────────────────┤
│ ProgressionEditor                       │
├─────────────────────────────────────────┤
│  Score 80% on 3 quizzes         2/3    │  ← ChallengeTracker (isolated)
│  ████████████████░░░░░░░░  67%         │
│                         Up next: ...    │
├─────────────────────────────────────────┤
│ Fretboard                               │
└─────────────────────────────────────────┘
```

**States:**
- **Active:** Title, thin progress bar (4-6px), numeric fraction (e.g. "2/3"), brief description
- **Just completed:** Inline congratulations with checkmark, auto-transitions to next challenge after 3s (with cancellation token for mode switches)
- **All complete:** Compact "All challenges complete!" row with checkmarks. Dismissible.

**Completion behavior:** Congratulations appears inline on the card (no modal — interrupting practice flow is an anti-pattern). Does not interrupt playback or quizzes. Auto-transitions after 3s or on user click.

**Implementation notes:**
- Use `min-h-[72px]` on the card to prevent layout shifts — the fretboard below has 72+ SVG elements and a height change forces expensive reflow.
- Progress bar: `transition-[width] duration-300 ease-out` with `will-change: width` for compositing.

## Technical Approach

### Architecture Change: Zustand Slice (Revised)

**Original plan:** React state in `useChallengeTracker` hook with manual localStorage.

**Revised (all reviewers agree):** Add a `challengeSlice` to the Zustand store. This provides:
- Pattern consistency (every other reactive state uses a Zustand slice)
- No prop drilling for ChallengeCard
- Side-effects-in-actions for event tracking (quiz completion, voicing selection)
- Proper reactivity via `useAppStore` selectors
- Persistence via `lib/persistence/challengeStorage.ts` (following existing Tier 2 pattern)

```typescript
// state/slices/challengeSlice.ts

export interface ChallengeSlice {
  // State
  challengeProgress: ChallengeState;  // Record<ChallengeId, ChallengeProgress>
  exploredVoicings: Set<string>;      // Transient dedup set (not persisted)
  practicedKeys: Set<string>;         // Transient dedup set (not persisted)

  // Actions
  initChallenges: () => void;         // Load from localStorage on mount
  recordQuizResult: (score: number, total: number) => void;
  recordVoicingExplored: (chordSymbol: string, voicingIndex: number) => void;
  recordKeyPracticed: (rootNote: string) => void;
  syncPracticeTime: () => void;       // Read from practiceStats, update challenge
  advanceChallenge: (mode: PracticeModeId) => void;
}
```

### New Files

| File | Purpose |
|------|---------|
| `lib/challenges/challenges.ts` | Types, static definitions (9 challenges), pure progress functions (`isComplete`, `getActiveChallenge`, `getProgressFraction`). Single file — ~120 lines total. |
| `lib/persistence/challengeStorage.ts` | localStorage read/write with type guard, following `practiceStats.ts` pattern. Re-exported from `lib/persistence/index.ts`. |
| `state/slices/challengeSlice.ts` | Zustand slice with challenge state and tracking actions. |
| `components/challenges/ChallengeTracker.tsx` | Self-contained component: owns Zustand subscriptions, renders ChallengeCard. Isolates re-renders. |

### Modified Files

| File | Change |
|------|--------|
| `state/useAppStore.ts` | Add `challengeSlice` to store composition. |
| `state/slices/quizSlice.ts` | In `submitQuizAnswer`, when `quizFinished` becomes true, call `get().recordQuizResult(score, total)` directly. |
| `state/slices/voicingSlice.ts` | In `selectVoicing`/`selectNextVoicing`/`selectPreviousVoicing`, call `get().recordVoicingExplored(chord, index)`. Guard: only when `showVoicings` is true. |
| `state/slices/progressionSlice.ts` | In `transposeProgression`, call `get().recordKeyPracticed(rootNote)` with the new root note. |
| `app/practice/[mode]/PracticePage.tsx` | Add `<ChallengeTracker modeId={modeId} />` between progression editor and fretboard sections. No hook wiring needed — component is self-contained. |
| `lib/persistence/index.ts` | Re-export `challengeStorage` functions. |
| `lib/persistence/localStorage.ts` | Add `fretpad-challenges` to `clearLocalStorage`. |
| `lib/types.ts` | Add `ChallengeId` string literal union type. |

### Tracking Integration Points

#### `practice-time`
- **Already tracked.** `usePracticeTracker` records time per mode via `recordPracticeTime(durationMs, progressionName, mode)`.
- **New:** `challengeSlice.syncPracticeTime()` reads practice stats from localStorage, filters sessions by `mode` and `startedAt`, computes cumulative minutes. Called periodically (piggyback on existing 10s practice tracker interval or on playback stop).
- **No new timer needed** — reuse the existing practice tracker's save cycle.

#### `quiz-accuracy`
- **Critical fix (frontend races reviewer):** Do NOT use useEffect to observe `quizFinished`. The user can click "Done" (calling `endQuiz()`) before the effect fires, zeroing the scores.
- **Solution: Side-effect-in-action.** In `quizSlice.submitQuizAnswer`, when `newTotal >= QUIZ_LENGTH`, synchronously call `get().recordQuizResult(newScore, newTotal)` before the state even renders. The challenge slice records it immediately.

```typescript
// In quizSlice.submitQuizAnswer:
if (newTotal >= QUIZ_LENGTH) {
  const newScore = isCorrect ? quizScore + 1 : quizScore;
  set({ quizFinished: true, quizScore: newScore, quizTotal: newTotal });
  // Record to challenge slice SYNCHRONOUSLY — before any re-render
  get().recordQuizResult(newScore, newTotal);
}
```

#### `voicings-explored`
- **Side-effect-in-action.** In voicing slice's `selectVoicing`/`selectNextVoicing`/`selectPreviousVoicing`, call `get().recordVoicingExplored(chord, index)` when `showVoicings` is true.
- **Guard against chord-change resets (performance oracle):** When the chord changes during playback, `selectedVoicingIndex` resets to 0 via `refreshVoicingsForChord`. This is NOT a user-initiated exploration. The voicing slice actions (`selectVoicing`, etc.) are only called by user interaction — `refreshVoicingsForChord` sets the index directly via `set()`, not through the select actions. So the guard is implicit.
- **Dedup:** The challenge slice maintains a transient `Set<string>` keyed by `${chordSymbol}|${voicingIndex}`. `current` is `set.size`. Only the count is persisted. The Set starts empty on each app load — re-exploring a voicing across sessions still counts toward the target.

#### `keys` (practice in N keys)
- **Simplified (simplicity reviewer):** Count transpose-and-play events instead of a 30s timer.
- **Side-effect-in-action.** In `progressionSlice.transposeProgression`, extract the root note of the first chord after transposition, call `get().recordKeyPracticed(rootNote)`.
- **Dedup:** Challenge slice maintains a transient `Set<string>` of practiced keys. `current` is `set.size`.
- **Guard:** Only record if `activeMode` is set (user is in a guided mode) and `isPlaying` has been true at least once since the last transpose (use a ref in the slice).

### Storage Pattern

Follow the established `practiceStats.ts` pattern, located in `lib/persistence/`:

```typescript
// lib/persistence/challengeStorage.ts

const CHALLENGE_STATE_KEY = "fretpad-challenges";

export function loadChallengeState(): ChallengeState { /* try/catch, JSON.parse, type guard */ }
export function saveChallengeState(state: ChallengeState): void { /* try/catch setItem */ }
function isValidChallengeState(value: unknown): value is ChallengeState { /* shape validation */ }
```

The Zustand slice acts as the in-memory cache. Debounce writes to localStorage (flush at most every 5 seconds + `beforeunload` listener for final flush). No separate localStorage reads needed after init.

### Component Architecture

```typescript
// components/challenges/ChallengeTracker.tsx
// Self-contained — owns its own subscriptions, prevents re-render propagation

export function ChallengeTracker({ modeId }: { modeId: PracticeModeId }) {
  const activeChallenge = useAppStore((s) => getActiveChallenge(s.challengeProgress, modeId));
  const progress = useAppStore((s) => s.challengeProgress[activeChallenge?.id]);

  // Sync practice time on mount and periodically
  const syncPracticeTime = useAppStore((s) => s.syncPracticeTime);
  useEffect(() => {
    syncPracticeTime();
    const interval = setInterval(syncPracticeTime, 10_000);
    return () => clearInterval(interval);
  }, [syncPracticeTime]);

  if (!activeChallenge) return <CompletedBadge />;
  return <ChallengeCard challenge={activeChallenge} progress={progress} />;
}
```

`ChallengeTracker` subscribes only to challenge-related slices — re-renders do not propagate to siblings. Challenge completion is derived during render via `getActiveChallenge()`, no useEffect needed.

**Congratulations auto-transition** uses a cancellation token to handle mode switches during the 3s window:

```typescript
useEffect(() => {
  if (!justCompleted) return;
  const token = { canceled: false };
  const tid = setTimeout(() => {
    if (!token.canceled) advanceChallenge(modeId);
  }, 3000);
  return () => { token.canceled = true; clearTimeout(tid); };
}, [justCompleted, modeId, activeChallenge?.id]);
```

### Edge Cases

| Edge Case | Handling |
|-----------|----------|
| localStorage full | Warn to console, challenge card shows "unable to save progress" |
| Corrupted challenge data | Type guard rejects → reset to empty state |
| Quiz closed early (X button) | `quizFinished` never becomes true → `recordQuizResult` never called |
| Transpose during playback | `recordKeyPracticed` called from `transposeProgression` action directly |
| All challenges complete | Card shows compact completion summary, dismissible |
| Mode switch | Challenge card re-derives active challenge from store for new mode |
| Multiple tabs | No cross-tab sync. Zustand slice reads localStorage on init. Writes via debounced save. |
| `enterMode()` render cascade | Challenge tracking is in store actions, not useEffect — immune to interleaved state updates from sequential setters |
| Voicing index reset on chord change | `refreshVoicingsForChord` sets index via `set()`, not through `selectVoicing` action — no false recording |
| Challenge definitions change in future | Old progress keyed by ChallengeId is preserved. New IDs start fresh. Type guard skips unknown IDs. |

## Acceptance Criteria

- [ ] `ChallengeId` string literal union type defined in `lib/types.ts`
- [ ] Challenge types, definitions, and pure progress functions in `lib/challenges/challenges.ts`
- [ ] Challenge storage in `lib/persistence/challengeStorage.ts` with type guard, re-exported from index
- [ ] `challengeSlice` added to Zustand store with progress state and tracking actions
- [ ] `quizSlice.submitQuizAnswer` calls `recordQuizResult` synchronously on quiz completion
- [ ] `voicingSlice.selectVoicing/Next/Previous` calls `recordVoicingExplored` when `showVoicings` is true
- [ ] `progressionSlice.transposeProgression` calls `recordKeyPracticed` with new root note
- [ ] `ChallengeTracker` component renders below progression editor, isolates re-renders
- [ ] `practice-time` criterion reads from existing practiceStats, filters by mode and `startedAt`
- [ ] `quiz-accuracy` criterion records completed quizzes (10/10) and checks threshold
- [ ] `voicings-explored` criterion counts unique `chord|index` pairs
- [ ] `keys` criterion counts unique root notes after transposition
- [ ] Challenge completion shows inline congratulations with cancellation-safe auto-transition
- [ ] Progress persists in localStorage via debounced writes
- [ ] `clearLocalStorage` includes `fretpad-challenges`
- [ ] All challenges complete state renders properly
- [ ] No regression in existing features (quiz, voicings, transport, modes)
- [ ] `pnpm validate` passes

## Sources & References

### Origin

- **Brainstorm document:** [docs/brainstorms/2026-03-13-guided-practice-modes-brainstorm.md](../brainstorms/2026-03-13-guided-practice-modes-brainstorm.md) — Key decisions: key-based challenges, passive tracking, challenges per mode.
- **Parent plan:** [docs/plans/2026-03-13-001-feat-guided-practice-modes-plan.md](2026-03-13-001-feat-guided-practice-modes-plan.md) — Phase 3 specification.

### Internal References

- Practice stats persistence pattern: `lib/persistence/practiceStats.ts`
- Quiz state (completion detection): `state/slices/quizSlice.ts:67` (`quizFinished`)
- Voicing selection: `state/slices/voicingSlice.ts:181-200`
- Transpose action: `state/slices/progressionSlice.ts:262`
- Practice tracker hook: `hooks/usePracticeTracker.ts`
- Practice page layout: `app/practice/[mode]/PracticePage.tsx:401-487`
- Mode configs: `lib/modes.ts`
- Store composition: `state/useAppStore.ts`

### Institutional Learnings Applied

- `docs/solutions/logic-errors/nextjs-zustand-guided-practice-code-review.md` — dual-useEffect race conditions, direct localStorage outside store is anti-pattern, use prevModeRef pattern
- `docs/solutions/performance-issues/zustand-mode-switching-render-cascade.md` — enterMode render cascade, selector grouping with useShallow, type safety at persistence boundaries

