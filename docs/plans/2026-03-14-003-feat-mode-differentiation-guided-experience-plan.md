---
title: "feat: Mode Differentiation & Guided Experience"
type: feat
status: active
date: 2026-03-14
origin: docs/brainstorms/2026-03-14-mode-differentiation-brainstorm.md
---

# feat: Mode Differentiation & Guided Experience

## Enhancement Summary

**Deepened on:** 2026-03-14
**Research agents used:** React best practices, architecture strategist, performance oracle, frontend races reviewer, TypeScript reviewer, security sentinel, pattern recognition specialist, code simplicity reviewer, best practices researcher, framework docs researcher

### Key Improvements from Research

1. **Fretboard reads store directly** via mode-specific adapter hooks — eliminates 47-prop drilling, biggest structural win
2. **Scope simplified** — deferred Comp Stage 3 and Learn Step 4, replaced Zustand slice with localStorage utils, ~50% less new code
3. **Per-mode step definitions with `as const`** — type-safe step configs co-located in `lib/modes.ts`
4. **Concrete performance patterns** — enterMode batching code, FretMarker memoization, ResizeObserver consolidation
5. **Pre-existing bugs identified** — instrument cleanup kills playback, pitch detection skips first chord
6. **UX research grounded** — 10-attempt rolling window, 44px touch targets, three-tier mic fallback

### Scope Changes from Original Plan

| Original                         | Changed To                                             | Why                                                                          |
| -------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Comp Stage 3 (Build Arrangement) | **Deferred**                                           | VoicingArrangement data model adds complexity; validate Stages 1-2 first     |
| Learn Step 4 (quiz at tempo)     | **Deferred**                                           | Quiz-transport integration is complex; Steps 1-3 deliver core value          |
| StepProgressionSlice (Zustand)   | **localStorage utils + local state**                   | Only `unlockedStep: number` needs persistence; session accuracy is ephemeral |
| Approach note sequence detection | **Expand target chroma set**                           | One-line change to `getTargetChromas` vs. redesigning pitch detection        |
| PracticeLayout wrapper           | **Each mode imports directly**                         | 30 lines of shared JSX duplicated 3x is simpler than an abstraction          |
| 3 separate route files           | **Keep `[mode]` route with component map**             | Preserves URL structure, metadata, and `generateStaticParams`                |
| 47-prop Fretboard via drilling   | **Fretboard self-serves from store** via adapter hooks | Eliminates prop drilling; each mode page becomes dramatically simpler        |
| Challenge data migration         | **One-line `localStorage.removeItem`**                 | Old data doesn't map to new model                                            |

---

## Overview

Redesign the 3 practice modes so each feels like a **distinct, guided practice experience** with its own layout, core interaction, and step-by-step progression — rather than the same PracticePage with different toolbar buttons visible.

The current architecture has a single 500-line `PracticePage` component with ~40 Zustand selectors and ~47 Fretboard props, differentiated only by `PracticeModeConfig` boolean visibility flags. This plan restructures each mode into its own page component with a unique layout, while sharing the `Fretboard`, `TransportBar`, and core infrastructure.

**Parallel development constraint:** The plan is structured so all 3 modes can be developed concurrently after a shared foundation phase.

## Problem Statement / Motivation

Users switching between modes barely notice a change. There's no guidance, no progression, no sense of "this mode is for _this_ kind of practice." The brainstorm (see `docs/brainstorms/2026-03-14-mode-differentiation-brainstorm.md`) identified that each mode needs a unique core interaction:

- **Learn the Neck** = quiz/identification drills (tap fretboard or mic detection)
- **Outline Chord Changes** = target note landing with mic scoring
- **Comp with Voicings** = progressive voicing workshop (learn → transition)

## Proposed Solution

### Architecture: Shared Foundation + 3 Parallel Tracks

```
Phase 0: Foundation (shared, must complete first)
├── Fix enterMode batching (8-10 re-renders → 1)
├── Refactor Fretboard to self-serve from store via adapter hooks
├── Create step persistence utilities (localStorage, not Zustand slice)
├── Define per-mode step arrays with as const in lib/modes.ts
├── Create mode-specific page components (component map in [mode] route)
├── Add prefers-reduced-motion to target note animations
├── Fix pre-existing bugs (instrument cleanup, pitch detection)
└── Performance: useShallow selectors, FretMarker memo, ResizeObserver

Phase 1 (parallel tracks):
├── Track A: Learn the Neck (quiz-driven drills, 3 steps)
├── Track B: Outline Chord Changes (target note practice, 4 steps)
└── Track C: Comp with Voicings (voicing workshop, 2 stages)
```

### Key Decisions

| Decision                      | Choice                                                    | Rationale                                                                                                |
| ----------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Steps vs Challenges           | Steps **replace** challenges                              | Steps subsume challenge purpose; one progression system, one UI (see brainstorm)                         |
| Quiz interaction (Learn)      | Fretboard tap **+ mic detection** (user chooses)          | Supports both screen-based learners and guitar-in-hand practice                                          |
| Step progress scope           | **Global per mode**                                       | Simple data model, feels rewarding; not per-key or per-progression                                       |
| Layout approach               | **Distinct page components** per mode                     | Not a shared PracticePage with conditional controls (see brainstorm)                                     |
| Routing                       | **Keep `[mode]` dynamic route** with component map        | Preserves URL structure, metadata generation, `generateStaticParams`                                     |
| Fretboard data flow           | **Self-serve from store** via mode-specific adapter hooks | Eliminates 47-prop drilling; consistent with DisplayToolbar pattern                                      |
| Shared wrapper                | **None** — each mode imports components directly          | 30 lines duplicated 3x is simpler than a wrapper abstraction                                             |
| Step state                    | **localStorage utils + component-local state**            | Only `unlockedStep` needs persistence; session accuracy is ephemeral                                     |
| Voice leading arrows          | **Hero feature in Comp mode**                             | Currently hidden in Comp mode; move to prominent position (see brainstorm)                               |
| Learn mode progression editor | **Hidden**, uses curated presets only                     | Dramatically simplifies UI for quiz-focused experience (see brainstorm)                                  |
| Comp Stage 3                  | **Deferred** to post-MVP                                  | VoicingArrangement data model adds significant complexity; validate Stages 1-2 first (simplicity review) |
| Learn Step 4                  | **Deferred** to post-MVP                                  | Quiz-transport integration is complex; Steps 1-3 deliver core value (simplicity review)                  |

### Step Definitions (Type-Safe)

```typescript
// lib/modes.ts — co-located with PracticeModeConfig (pattern recognition recommendation)

// Shared musical note filter taxonomy (TypeScript review recommendation)
type NoteFilterScope = "root" | "guide-tones" | "chord-tones" | "all";
type QuizQuestionFilter = NoteFilterScope; // aligned naming
type TargetNoteMode = "none" | NoteFilterScope | "strong-beats";

interface StepDefinition {
  readonly id: string;
  readonly label: string;
  readonly filter?: NoteFilterScope; // for quiz question pools
  readonly targetMode?: TargetNoteMode; // for pitch detection scoring
}

const LEARN_STEPS = [
  { id: "identify-roots", label: "Identify Root Notes", filter: "root" },
  { id: "find-guide-tones", label: "Find Guide Tones", filter: "guide-tones" },
  {
    id: "chord-tone-id",
    label: "Chord Tone Identification",
    filter: "chord-tones",
  },
] as const satisfies readonly StepDefinition[];

const OUTLINE_STEPS = [
  { id: "hit-the-root", label: "Hit the Root", targetMode: "root" },
  {
    id: "aim-guide-tones",
    label: "Aim for Guide Tones",
    targetMode: "guide-tones",
  },
  {
    id: "approach-notes",
    label: "Add Approach Notes",
    targetMode: "guide-tones",
  },
  { id: "free-improv", label: "Free Improvisation", targetMode: "chord-tones" },
] as const satisfies readonly StepDefinition[];

const COMP_STEPS = [
  { id: "learn-shapes", label: "Learn Shapes" },
  { id: "practice-transitions", label: "Practice Transitions" },
] as const satisfies readonly StepDefinition[];

const MODE_STEPS = {
  "learn-the-neck": LEARN_STEPS,
  "outline-chord-changes": OUTLINE_STEPS,
  "comp-with-voicings": COMP_STEPS,
} as const satisfies Record<PracticeModeId, readonly StepDefinition[]>;
```

### Step Persistence (Simplified)

```typescript
// lib/persistence/stepProgress.ts — 2 functions, not a Zustand slice

const STORAGE_KEY = "fretpad-step-progress";

interface PersistedStepProgress {
  // Only the unlock watermark needs persistence
  [modeId: string]: number; // highest unlocked step index
}

export function getUnlockedStep(mode: PracticeModeId): number {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return typeof data[mode] === "number" ? data[mode] : 0;
  } catch {
    return 0;
  }
}

export function unlockStep(mode: PracticeModeId, step: number): void {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    data[mode] = Math.max(data[mode] ?? 0, step);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}
```

Session accuracy is tracked as **component-local state** using a rolling window:

```typescript
// hooks/useRollingAccuracy.ts
const WINDOW_SIZE = 10; // research: balances smoothing vs. responsiveness
const UNLOCK_THRESHOLD = 0.8; // research: Duolingo/Khan Academy standard

function useRollingAccuracy() {
  const [attempts, setAttempts] = useState<boolean[]>([]);
  const accuracy = useMemo(() => {
    if (attempts.length === 0) return 0;
    return attempts.filter(Boolean).length / attempts.length;
  }, [attempts]);

  const record = useCallback((correct: boolean) => {
    setAttempts((prev) => [...prev.slice(-(WINDOW_SIZE - 1)), correct]);
  }, []);

  const reset = useCallback(() => setAttempts([]), []);
  const isUnlockEligible =
    attempts.length >= WINDOW_SIZE && accuracy >= UNLOCK_THRESHOLD;
  return {
    accuracy,
    record,
    reset,
    isUnlockEligible,
    attemptCount: attempts.length,
  };
}
```

**Important:** Call `reset()` when the user changes steps to avoid inheriting accuracy from a previous step.

For **Comp mode** (action-based gating, not accuracy-based), use a simpler counter:

```typescript
// hooks/useActionGate.ts — for Comp mode stage progression
function useActionGate(threshold: number) {
  const [count, setCount] = useState(0);
  const increment = useCallback(() => setCount((c) => c + 1), []);
  const reset = useCallback(() => setCount(0), []);
  return { count, increment, reset, isComplete: count >= threshold };
}
```

### Routing — Component Map in Dynamic Route

```typescript
// app/practice/[mode]/PracticePage.tsx (simplified from 530 lines)
import dynamic from "next/dynamic";

const MODE_PAGES: Record<PracticeModeId, React.ComponentType<{ modeId: PracticeModeId }>> = {
  "learn-the-neck": dynamic(() => import("@/components/practice/learn/LearnTheNeckPage")),
  "outline-chord-changes": dynamic(() => import("@/components/practice/outline/OutlineChangesPage")),
  "comp-with-voicings": dynamic(() => import("@/components/practice/comp/CompWithVoicingsPage")),
};

export function PracticePage({ modeId }: { modeId: PracticeModeId }) {
  const ModeComponent = MODE_PAGES[modeId];
  return (
    <Suspense fallback={<FretboardSkeleton />}>
      <ModeComponent modeId={modeId} />
    </Suspense>
  );
}
```

### Fretboard Adapter Hooks (Eliminate 47-Prop Drilling)

```typescript
// hooks/useFretboardAdapter.ts — each mode creates its own variant

import { useShallow } from "zustand/react/shallow";

// Shared display state — all modes use this
export function useFretboardDisplay() {
  return useAppStore(
    useShallow((s) => ({
      showScaleTones: s.showScaleTones,
      showVoiceLeading: s.showVoiceLeading,
      noteLabelMode: s.noteLabelMode,
      fretboardOverlay: s.fretboardOverlay,
      showCAGEDPositions: s.showCAGEDPositions,
      focusedPosition: s.focusedPosition,
    })),
  );
}

// Mode-specific hooks build on the shared base
export function useLearnFretboard() {
  const display = useFretboardDisplay();
  const quiz = useAppStore(
    useShallow((s) => ({
      quizMode: s.quizActive,
      quizTargetPosition: s.quizQuestion?.targetNote,
    })),
  );
  return { ...display, ...quiz };
}
```

Fretboard reads from these hooks directly instead of receiving props. This makes each mode page ~50 lines instead of ~200.

## Technical Considerations

### Phase 0: Foundation (Shared — Prerequisite)

**0a. Fix `enterMode` render cascade**

- File: `state/slices/practiceModeSlice.ts`
- Problem: `enterMode` calls 8-10 individual `set()` calls. Zustand v5 does NOT batch imperative `set()` inside actions — each fires a synchronous notification to all subscribers.
- Fix: Compute full state delta and call `set()` once.
- Documented in: `docs/solutions/performance-issues/zustand-mode-switching-render-cascade.md`

<details>
<summary>Concrete enterMode batching implementation</summary>

Use delta-returning functions from each slice to keep reset logic co-located (architecture strategist recommendation):

```typescript
// In quizSlice.ts — export reset delta
export function getQuizResetDelta(): Partial<QuizSlice> {
  return { quizActive: false, quizQuestion: null, quizLastResult: null, quizFinished: false };
}

// In practiceModeSlice.ts — single set() call
enterMode: (id, options) => {
  const config = PRACTICE_MODES[id];
  const state = get();
  const applyDefaults = options?.applyDefaults ?? true;

  const delta: Partial<AppState> = { activeMode: id };

  if (state.isPlaying) delta.isPlaying = false;
  if (state.quizActive) Object.assign(delta, getQuizResetDelta());
  if (state.sessionActive) delta.sessionActive = false;

  if (applyDefaults) {
    const progression = PRESET_PROGRESSIONS[config.defaultPreset];
    delta.progression = progression;
    delta.currentBarIndex = 0;
    delta.currentChordIndex = 0;
    delta.currentChord = getChordAtPosition(progression, 0, 0);
    delta.tempo = Math.max(40, Math.min(200, config.defaultTempo));
    delta.selectedStyle = config.defaultStyle;
    delta.progressionHistory = [...state.progressionHistory, state.progression].slice(-MAX_HISTORY);
    delta.progressionFuture = [];
  }

  // Mode display constraints
  if (!config.showMicToggle && state.micActive) delta.micActive = false;
  if (!config.showVoicingsButton && state.showVoicings) delta.showVoicings = false;
  if (!config.showTargetsDropdown && state.targetNoteMode !== "none") {
    delta.targetNoteMode = "none";
    delta.showChromaticApproach = false;
    delta.showDiatonicApproach = false;
    delta.showEnclosures = false;
  }
  if (!config.showOverlayDropdown && state.fretboardOverlay !== "none") {
    delta.fretboardOverlay = "none";
    delta.focusedPosition = null;
  }

  try { localStorage.setItem("fretpad-last-mode", id); } catch {}
  set(delta); // ONE notification, ONE render cycle
},
```

</details>

**0b. Refactor Fretboard to self-serve from store**

- Create `hooks/useFretboardDisplay.ts` with `useShallow` grouped selectors
- Create per-mode adapter hooks: `useLearnFretboard()`, `useOutlineFretboard()`, `useCompFretboard()`
- Fretboard component reads from hooks directly — eliminates 47 props
- Resolves the mixed data-sourcing pattern (Fretboard props-down vs DisplayToolbar store-direct)
- Each mode page becomes ~50 lines instead of ~200

**0c. Replace ChallengeSlice with step utilities**

- Remove: `state/slices/challengeSlice.ts`, `components/challenges/ChallengeTracker.tsx`, `lib/challenges/`
- Add: `lib/persistence/stepProgress.ts` (2 functions: `getUnlockedStep`, `unlockStep`)
- Add: `hooks/useRollingAccuracy.ts` (component-local rolling window)
- Add: `lib/modes.ts` — `MODE_STEPS` definitions with `as const satisfies`
- Cleanup: `localStorage.removeItem('fretpad-challenges')` on first load (one line, not migration)
- UI: `StepStepper.tsx` — horizontal step indicator (shared across modes)

**0d. Create mode-specific page components**

- Keep `app/practice/[mode]/page.tsx` as thin Server Component (preserves `generateStaticParams`, metadata, validation)
- Simplify `PracticePage.tsx` to component map with `next/dynamic` imports
- Create: `components/practice/learn/LearnTheNeckPage.tsx`, `components/practice/outline/OutlineChangesPage.tsx`, `components/practice/comp/CompWithVoicingsPage.tsx`
- Each mode page imports shared components directly (ModeHeader, TransportBar, drawers) — no PracticeLayout wrapper
- Wrap mode content in `<Suspense fallback={<FretboardSkeleton />}>`

**0e. Performance prerequisites**

- `React.memo` on `FretMarker` with custom comparator (78 components re-render on any toolbar state change)
- Consolidate 3-4 overlay `ResizeObserver`s into single parent measurement in `Fretboard.tsx`
- Quantize `usePlaybackPosition` — return previous state ref when values haven't meaningfully changed
- Pre-compute `barStartBeats` lookup table (O(1) per frame instead of O(bars))
- Debounce localStorage persistence via custom Zustand storage wrapper (500ms)
- Wrap `onChordChange` in `Tone.Draw.schedule(callback, audioTime)` for visual/audio sync

**0f. Fix pre-existing bugs (discovered during race conditions review)**

- **Instrument cleanup kills playback**: In `useAudioEngine.ts`, the instrument recreation effect's cleanup calls `transport.stop()` — this kills playback when user changes style or volume. Fix: cleanup should only dispose instruments, NOT stop transport.
- **Pitch detection skips first chord**: In `usePitchDetection.ts`, `prevPositionRef` is updated even on non-playing bail-out, so the first chord change after play-start is never evaluated.
- **ProgressionEditor re-renders at 60fps**: Extract playback highlight into a ref-based overlay that doesn't trigger React re-renders.

**0g. Accessibility: `prefers-reduced-motion`**

- Update `animate-target-primary` and `animate-target-secondary` CSS to use static highlight when motion is reduced
- This is prerequisite since target note pulsing becomes a hero feature

**0h. Security hardening**

- Add `encoded.length > 10000` early return in `decodeStateFromUrl` (`lib/persistence/urlState.ts`)
- Add `bars.length <= 64` check in `isValidProgression` (`lib/persistence/localStorage.ts`)

### Track A: Learn the Neck — Quiz-Driven Drills

**Layout:** Quiz prompt/score prominent at top → fretboard as interactive answer board → minimal other UI. No progression editor (preset-driven). No theory panel (replaced by score/stats panel).

**Steps (3 for MVP, Step 4 deferred):**

1. **Identify root notes** — "Where is the root of Dm7?" → user taps fret position or plays note (mic)
2. **Find guide tones (3rd, 7th)** — "Where is the b7 of G7?" → same interaction
3. **Full chord tone identification** — any chord tone, expanding the pool

**Implementation:**

- `components/practice/learn/LearnTheNeckPage.tsx` — mode-specific layout
- Extend `QuizSlice` with `quizQuestionFilter: QuizQuestionFilter` to restrict question pool per step (aligned naming per TypeScript review)
- Use existing `onNoteClick` pattern on FretMarker for tap-to-answer (not a new `onFretTap` prop — pattern recognition recommendation)
- Add mic detection as alternative input (reuse `usePitchDetection` with `"root"` target mode)
- User toggle between tap and mic input modes: `[🎤 Mic] [👆 Tap]` segmented control
- Remove fixed 10-question limit; continuous practice, accuracy tracked via `useRollingAccuracy` (10-attempt rolling window)
- Curated presets (hide `ProgressionEditor`): single-chord vamp for Step 1, ii-V-I for Steps 2+
- Score/stats panel replaces theory panel: current accuracy, best streak, progress to 80% unlock

### Research Insights: Quiz UX

- **Touch targets**: FretMarker visual dot 28-32px, but tap hit area must be **44x44px minimum** (Apple HIG, WCAG 2.2). Use invisible expanded touch regions; resolve overlaps by nearest center.
- **Rolling window**: 10 attempts, 80% threshold (8/10 correct). Minimum 10 attempts before unlock eligible. Display as fraction: "8/10 (80%)".
- **Mastery display**: Show gold indicator at 90%+ on completed steps (Duolingo crown pattern) — reward excellence without gating.
- **String-priority tapping**: For "find the note" quizzes, use tall rectangular hit areas spanning full string height (~44px).
- **Fret range**: Limit quiz questions to frets 0-12 (essential range, avoids compressed high-fret tap targets on mobile).

### TargetNoteMode Extension

```typescript
// lib/types.ts — CRITICAL: use exhaustive switch with satisfies never
type TargetNoteMode =
  | "none"
  | "root"
  | "guide-tones"
  | "chord-tones"
  | "all"
  | "strong-beats";

// In getTargetChromas and getTargetNotes — refactor to exhaustive switch:
function getTargetChromas(chord: Chord, mode: TargetNoteMode): Set<number> {
  switch (mode) {
    case "none":
      return new Set();
    case "root":
      return rootOnlyChromas(chord);
    case "guide-tones":
      return guideAndRootChromas(chord);
    case "chord-tones":
    case "strong-beats":
    case "all":
      return allChordToneChromas(chord);
    default:
      return mode satisfies never; // compile error if new variant added without handling
  }
}
```

> **Why exhaustive switch is critical**: The current `getTargetChromas` uses if/else with string comparisons. Adding `"root"` without refactoring would silently fall through to the `else` branch and return all chord tones — the opposite of what "root" means. This would produce incorrect pitch detection scores. (TypeScript review, finding #1)

### Track B: Outline Chord Changes — Target Note Practice

**Layout:** Current target note call-out at top → fretboard with animated/pulsing targets → scorecard panel. Mic scoring is primary (degraded mode without mic).

**Steps:**

1. **Hit the root** of each chord as it changes
2. **Aim for guide tones** (3rd, 7th) on changes
3. **Add approach notes** (chromatic, diatonic leading into targets)
4. **Free improvisation** with scoring (all chord tones count)

**Implementation:**

- `components/practice/outline/OutlineChangesPage.tsx` — mode-specific layout
- Target notes pulse/animate on chord changes (enhance existing `animate-target-primary`)
- Step 1: `targetNoteMode = "root"`, mic evaluates root hits only
- Step 2: `targetNoteMode = "guide-tones"` (already exists, renamed from "guide-tones-only")
- Step 3: **Expand target chroma set** to include approach notes — add chromatic neighbors of chord tones from existing `getChromaticApproachNotes`. Score a "hit" if user plays any note that is a target OR an approach note. **No sequence detection needed** — one-line change to `getTargetChromas` instead of redesigning pitch detection. (simplicity review)
- Step 4: `targetNoteMode = "chord-tones"`, full scoring (closest to current behavior)
- Scorecard panel replaces theory panel: hits/misses per chord, accuracy percentage, progress to 80%
- No pentatonic overlays (already disabled via config; see brainstorm)

### Research Insights: Mic Fallback

Two-tier input model for MVP:

| Tier                                           | Description                                                                            | Step Progression                           |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------ |
| **Mic** (default if granted)                   | Real-time pitch detection scoring                                                      | Full accuracy tracking, step gating        |
| **Visual Only** (if mic denied or unavailable) | Target notes pulse, no scoring. Persistent banner: "Connect a microphone for scoring." | All steps accessible but marked "unscored" |

> **Post-MVP: Self-Report tier.** A "Did you hit it?" prompt on chord changes (auto-dismiss 3s) could bridge the gap between mic scoring and no scoring. Deferred because it adds a new interactive UI element and the two-tier model is sufficient for launch.

### Track C: Comp with Voicings — Progressive Voicing Workshop

**Layout:** Voicing diagram prominent → stage selector → voice leading visualization → simplified fretboard focused on chord shapes.

**Stages (2 for MVP, Stage 3 deferred):**

1. **Learn Shapes** — Browse one voicing at a time. See fingering, hear it. No time pressure. Cycle through voicing types.
2. **Practice Transitions** — Backing track plays. Fretboard shows current voicing AND upcoming voicing with voice-leading arrows. Focus on smooth movement.

> **Deferred: Stage 3 — Build Arrangement.** Per-chord voicing selection requires a new `VoicingArrangement` data model keyed by `ProgressionBar.id` (not barIndex — TypeScript review), persistence, and voice leading recalculation between user-selected voicings. This complexity is not justified until Stages 1-2 are validated with users. (simplicity review)

**Implementation:**

- `components/practice/comp/CompWithVoicingsPage.tsx` — mode-specific layout
- Stage 1: Reuse existing `VoicingOverlay` + `VoicingControlsPanel` + `ChordDiagram`. Add "play voicing" button that triggers single chord strum via Tone.js.
- Stage 2: Voice leading arrows become hero feature. Show current + next voicing simultaneously on fretboard. Extend `VoiceLeadingOverlay` to show paths between specific voicing shapes (currently generic chord-tone paths).
- Stage gating via `useActionGate`: Stage 1 → explore at least 5 voicings (tracked by `useActionGate(5)`, incremented on voicing navigation). Stage 2 → unlocked after Stage 1.

### Research Insights: Stepper UI

```
Desktop/Tablet (>= 640px):
  [1 ✓]---[2 ✓]---[③ 72%]---[🔒 4]
   Root    Guide    Chord      Free
   Notes   Tones    Tones      Improv

Mobile (< 640px):
  Step 3 of 4: Chord Tones
  ████████████████░░░░░░  72%
```

- Step circle: **28-32px** diameter (desktop), **24px** (mobile)
- Connector lines: 2px height, accent color for completed segments
- **Circular progress ring** (3px stroke) around active step shows progress toward 80%
- Collapse to text + progress bar on mobile (<640px)
- States: completed (emerald checkmark), active (primary + progress ring), unlocked (outlined), locked (grey + lock icon)
- Build custom `StepStepper.tsx` — shadcn/ui has no stepper component

## System-Wide Impact

- **Interaction graph**: `enterMode()` → single batched `set()` resets playback, loads preset, sets display constraints. Mode-specific pages read `getUnlockedStep()` on mount for gating UI. `useRollingAccuracy.record()` → updates local session accuracy → may trigger `unlockStep()` → updates stepper UI.
- **Error propagation**: Mic permission denial in Outline mode → graceful degradation to self-report or visual-only tier. Quiz tap on invalid fret position → no-op. Step advancement failure → retry on next attempt (no crash path).
- **State lifecycle risks**: Removing ChallengeSlice requires `localStorage.removeItem('fretpad-challenges')` on first load. Step progress uses its own `fretpad-step-progress` key with simple JSON structure.
- **API surface parity**: URL sharing (`?p=` token) currently encodes progression + display state. Mode-specific pages handle shared URLs by applying state and rendering in the correct mode page. Step progress is NOT shared via URL (it's personal progress). Add size limit (10000 chars) and bar count limit (64) on URL decoding.
- **Integration test scenarios**: (1) Complete Step 1 in Learn mode → switch to Outline → return to Learn → verify Step 2 is still unlocked. (2) Share URL from Comp mode → open in new browser → verify progression loads without step progress. (3) Enter Outline mode without mic → verify self-report fallback works.

### Race Conditions to Watch (from frontend races review)

| Scenario                                 | Risk                                            | Mitigation                                                     |
| ---------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| Rapid mode switching                     | Partial state from mode A leaks into mode B     | Single batched `set()` makes mode entry atomic                 |
| Step advance during playback             | `advanceStep` changes `targetNoteMode` mid-loop | Only advance between loops, not mid-playback                   |
| Quiz answer + chord change in same frame | Answer processed with wrong chord context       | Guard: check chord hasn't changed since question was generated |
| Progression edit during playback         | Stale bar/chord indices in scheduled callbacks  | Stop playback on progression edit (existing behavior)          |

## Acceptance Criteria

### Foundation (Phase 0)

- [ ] `enterMode` uses single batched `set()` call with delta-returning pattern (1 re-render, not 8-10)
- [ ] Fretboard reads store directly via `useFretboardDisplay()` + mode-specific adapter hooks
- [ ] `useShallow` grouped selectors replace ~40 individual selectors
- [ ] `FretMarker` wrapped in `React.memo` with custom comparator
- [ ] Overlay `ResizeObserver`s consolidated into single parent measurement
- [ ] `usePlaybackPosition` quantized — returns prev ref when unchanged
- [ ] `Tone.Draw.schedule` used for chord change callbacks (syncs visual updates with audio timing)
- [ ] `lib/persistence/stepProgress.ts` provides `getUnlockedStep`/`unlockStep`
- [ ] `hooks/useRollingAccuracy.ts` tracks 10-attempt window with 80% threshold
- [ ] `MODE_STEPS` defined with `as const satisfies` in `lib/modes.ts`
- [ ] 3 mode-specific page components created via `next/dynamic` component map
- [ ] `StepStepper.tsx` shows current step + progress ring toward 80% unlock
- [ ] `prefers-reduced-motion` handled for target note animations
- [ ] `localStorage.removeItem('fretpad-challenges')` cleanup on first load
- [ ] **Bug fix**: Instrument cleanup in `useAudioEngine` no longer stops transport
- [ ] **Bug fix**: `prevPositionRef` in `usePitchDetection` not updated on non-playing bail-out
- [ ] **Bug fix**: ProgressionEditor playback highlight extracted to ref-based overlay
- [ ] URL state size limit (10000 chars) and bar count limit (64)

### Learn the Neck (Track A)

- [ ] Quiz is primary interface with fretboard as answer surface (tap to identify via existing `onNoteClick` pattern)
- [ ] Mic detection as alternative input mode (segmented control toggle)
- [ ] 3 steps with filtered question pools (roots → guide tones → chord tones)
- [ ] ~80% accuracy (10-attempt rolling window) unlocks next step; progress ring visible
- [ ] 44px minimum touch targets for fretboard quiz interaction
- [ ] Progression editor hidden; curated presets drive chord selection
- [ ] Score/stats panel replaces theory panel
- [ ] Completed steps remain accessible for replay
- [ ] Quiz questions limited to frets 0-12

### Outline Chord Changes (Track B)

- [ ] Target notes pulse/animate prominently on chord changes
- [ ] `"root"` TargetNoteMode added with exhaustive switch + `satisfies never`
- [ ] 4 steps with progressive target complexity (root → guide tones → approaches → free)
- [ ] Approach notes scored by expanding target chroma set (not sequence detection)
- [ ] Two-tier mic fallback (Mic → Visual Only with persistent banner)
- [ ] Mic scoring per step with ~80% accuracy gate (10-attempt rolling window)
- [ ] Scorecard panel replaces theory panel

### Comp with Voicings (Track C)

- [ ] 2-stage progression (Learn Shapes → Practice Transitions)
- [ ] Voice leading arrows prominent and functional between specific voicing shapes
- [ ] "Play voicing" button in Stage 1 triggers chord strum
- [ ] Stage 2 shows current + next voicing simultaneously with voice leading paths
- [ ] Stage gating: explore 5+ voicings → practice transitions

## Success Metrics

- Mode switching feels like "opening a different practice workbook" (subjective, but layout should be visibly distinct)
- Users engage with step progression (>50% of sessions advance at least one step)
- Each mode's core interaction is immediately apparent without reading instructions
- enterMode re-renders reduced from 8-10 to 1 (measurable via React DevTools Profiler)
- FretMarker re-renders during toolbar changes reduced by ~90% (memo hit rate)

## Dependencies & Risks

| Risk                                                        | Mitigation                                                                                                                                                                     |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fretboard store-direct refactor is large                    | Do it first in Phase 0; it makes everything else easier                                                                                                                        |
| `enterMode` batching fix has side effects                   | Write tests for mode transition state before and after fix; use delta-returning pattern to keep logic co-located                                                               |
| Approach note scoring too generous with expanded target set | Start with chromatic neighbors only; can tighten with sequence detection later                                                                                                 |
| Parallel development merge conflicts                        | Foundation phase completes before tracks start; each track touches distinct files                                                                                              |
| Mobile fretboard tap targets too small for quiz             | 44px minimum hit areas; limit to frets 0-12; test at 375px width                                                                                                               |
| `TargetNoteMode` rename breaks existing code                | Rename `"guide-tones-only"` → `"guide-tones"` in single commit with find-replace. Add migration in Zustand `persist.migrate` to map old value in `fretpad-state` localStorage. |
| Instrument cleanup bug (pre-existing)                       | Fix in Phase 0 before adding mode-specific audio behavior                                                                                                                      |

## Deferred to Post-MVP

| Feature                                | Reason                                                                | When to Revisit                         |
| -------------------------------------- | --------------------------------------------------------------------- | --------------------------------------- |
| Comp Stage 3: Build Arrangement        | VoicingArrangement data model + persistence complexity                | After Stages 1-2 validated with users   |
| Learn Step 4: Intervals at Tempo       | Quiz-transport integration complexity                                 | After Steps 1-3 are stable              |
| Per-step historical scores             | `stepScores` with bestAccuracy/attempts/bestStreak                    | When retention features are prioritized |
| URL-shared voicing arrangements        | Encoding arrangement in share token                                   | After arrangement model exists          |
| Self-Report mic fallback tier          | Adds new interactive UI element; two-tier model sufficient for launch | When user feedback shows demand         |
| `React.Activity` for mode preservation | Preserve previous mode state during switch                            | React 19 stabilization                  |

## Sources & References

- **Origin brainstorm:** [docs/brainstorms/2026-03-14-mode-differentiation-brainstorm.md](docs/brainstorms/2026-03-14-mode-differentiation-brainstorm.md) — Key decisions: distinct layouts per mode, step-by-step progression, quiz-first Learn mode, target notes as hero in Outline, 3-stage Comp workshop
- **Known issue (render cascade):** [docs/solutions/performance-issues/zustand-mode-switching-render-cascade.md](docs/solutions/performance-issues/zustand-mode-switching-render-cascade.md) — enterMode batching fix still pending
- **Known issue (client/server boundary):** [docs/solutions/logic-errors/nextjs-zustand-guided-practice-code-review.md](docs/solutions/logic-errors/nextjs-zustand-guided-practice-code-review.md) — route validation must stay in Server Component
- **Current PracticePage:** `app/practice/[mode]/PracticePage.tsx` (530 lines, ~40 selectors)
- **Mode configs:** `lib/modes.ts` (visibility flags)
- **Fretboard component:** `components/fretboard/Fretboard.tsx` (47 props → self-serve from store)
- **Quiz system:** `state/slices/quizSlice.ts` (needs `quizQuestionFilter` extension)
- **Pitch detection:** `hooks/usePitchDetection.ts` (needs root-only mode + bug fix)
- **Challenge system (to remove):** `state/slices/challengeSlice.ts`, `lib/challenges/challenges.ts`
- **Zustand v5 batching:** [Discussion #1648](https://github.com/pmndrs/zustand/discussions/1648), [useShallow migration](https://github.com/pmndrs/zustand/blob/HEAD/docs/guides/prevent-rerenders-with-use-shallow.md)
- **Tone.js scheduling:** [Tone.Draw docs](https://tonejs.github.io/docs/r13/Draw), [Performance wiki](https://github.com/Tonejs/Tone.js/wiki/Performance)
- **Touch targets:** Apple HIG (44x44pt), Material Design 3 (48x48dp), WCAG 2.2 SC 2.5.8 (24x24 CSS px minimum)
- **Learning progression UX:** Duolingo crown levels, Yousician star system, Khan Academy mastery levels, EDM 2015 N-CCR research
- **Stepper UI:** [Lollypop Design stepper patterns (2026)](https://lollypop.design/blog/2026/february/beyond-the-progress-bar-the-art-of-stepper-ui-design/), Material UI stepper, PatternFly progress stepper
