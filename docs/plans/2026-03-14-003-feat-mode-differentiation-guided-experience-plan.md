---
title: "feat: Mode Differentiation & Guided Experience"
type: feat
status: active
date: 2026-03-14
origin: docs/brainstorms/2026-03-14-mode-differentiation-brainstorm.md
---

# feat: Mode Differentiation & Guided Experience

## Enhancement Summary

**Deepened on:** 2026-03-14 (round 2)
**Sections enhanced:** All major sections
**Research agents used (round 2):** TypeScript reviewer, performance oracle, architecture strategist, frontend races reviewer, security sentinel, pattern recognition specialist, code simplicity reviewer, spec flow analyzer, repo research analyst, gamification UX researcher, React performance researcher, Web Audio pitch detection researcher, + Context7 framework docs (Next.js 16, Zustand v5, Tone.js)

### Key Improvements from Research

1. **Fretboard reads store directly** via mode-specific adapter hooks — eliminates 47-prop drilling, biggest structural win
2. **Scope simplified** — deferred Comp Stage 3 and Learn Step 4, replaced Zustand slice with localStorage utils, ~50% less new code
3. **Per-mode step definitions with `as const`** — type-safe step configs co-located in `lib/modes.ts`
4. **Concrete performance patterns** — enterMode batching code, FretMarker memoization, ResizeObserver consolidation
5. **Pre-existing bugs identified** — instrument cleanup kills playback, pitch detection skips first chord
6. **UX research grounded** — 10-attempt rolling window, 44px touch targets, three-tier mic fallback

**Round 2 additions:**

7. **9 race conditions found** (up from 4) — transport stop must be imperative in `enterMode`; step advancement must defer to loop boundaries; mic state must reset on mode switch; audio engine cleanup needs generation nonce; quiz answer must validate chord context
8. **Critical architectural gaps closed** — `usePracticeModeSetup` hook for shared behavioral wiring; `useFretboardData` hook for derived state computation; bridge between `useRollingAccuracy` and `usePitchDetection`; SSR guard for `getUnlockedStep`
9. **Type system tightened** — discriminated unions for step definitions per mode; `assertNever` helper replaces `satisfies never`; `NoteFilterScope`/`QuizQuestionFilter` collapsed; `PersistedStepProgress` uses `PracticeModeId` keys
10. **WCAG accessibility gap** — fretboard color tokens violate WCAG 1.4.1 (color-only differentiation); needs shape/pattern differentiation for note types; `aria-live` regions needed for quiz feedback
11. **Performance: ref/state split for `usePlaybackPosition`** — drops re-renders from ~60/sec to ~1-2/sec; continuous `barProgress` drives playhead via direct DOM manipulation, discrete `barIndex`/`chordIndex` via React state
12. **Spec flow gaps resolved** — step unlock moment UX specified; mic quiz chroma-vs-position mismatch documented; `recordQuizResult` removal from quizSlice enumerated; `TargetNoteMode` migration via `loadFromLocalStorage` (not Zustand persist.migrate)

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

### Round 2 Scope Changes

| Original (Round 1)                        | Changed To (Round 2)                                                   | Why                                                                                                  |
| ----------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `NoteFilterScope` + `QuizQuestionFilter`  | **Extend existing `TargetNoteMode` only**                              | Three types for one concept; `QuizQuestionFilter` is a pure alias; simplicity review                 |
| `getQuizResetDelta()` export per slice    | **Inline reset values in `enterMode` delta**                           | Over-abstraction for a single call site; simplicity review                                           |
| `useActionGate` hook                      | **Inline `useState(0)` in CompWithVoicingsPage**                       | 7-line hook used once; YAGNI; simplicity review                                                      |
| Gold mastery indicator at 90%             | **Deferred**                                                           | Cosmetic gamification not in core guided experience; simplicity review                               |
| `satisfies never` in exhaustive switch    | **`assertNever` helper that throws**                                   | `satisfies never` returns the value at runtime (not a Set); TypeScript review                        |
| Two `useShallow` results spread in hook   | **Single `useShallow` selector per adapter hook**                      | Spread creates new object ref every render, defeating memoization; TypeScript + performance review   |
| Phase 0h security hardening               | **Separate task (not blocking this feature)**                          | URL size limit and bar count limit are unrelated to mode differentiation; simplicity review           |
| 4 performance items in Phase 0e           | **Keep FretMarker memo + Tone.Draw.schedule; defer other 4**           | Only 2 are genuine prerequisites; simplicity review                                                  |
| Research Insights: detailed stepper specs | **Reduced to acceptance criteria**                                     | Pixel specs belong in implementation; simplicity review                                              |
| `usePlaybackPosition` "quantize" bullet   | **Concrete ref/state split pattern with direct DOM playhead**          | 60fps setState is the highest-frequency perf issue; React performance research                       |
| Shared JSX duplicated 3x                  | **Still duplicated, but add `usePracticeModeSetup` for shared hooks**  | Layout duplication is fine, but behavioral hooks need centralization; architecture review             |

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

### Step Definitions (Type-Safe, Discriminated Unions)

> **Round 2 changes:** Collapsed `NoteFilterScope`/`QuizQuestionFilter` — just extend `TargetNoteMode`. Split `StepDefinition` into discriminated unions per mode to prevent accessing wrong fields at compile time (TypeScript review). Use `assertNever` helper for exhaustive switches (TypeScript review).

```typescript
// lib/modes.ts — co-located with PracticeModeConfig (pattern recognition recommendation)

// Extend existing TargetNoteMode with "root" and "all", rename "guide-tones-only" → "guide-tones"
// NOTE: Use "root-and-guides" (not "guide-tones") in TargetNoteMode to avoid semantic collision
// with quiz filtering where "guide-tones" means ONLY 3rds/7ths, while TargetNoteMode's old
// "guide-tones-only" included roots. See TypeScript review critical finding.
type TargetNoteMode = "none" | "root" | "root-and-guides" | "chord-tones" | "all" | "strong-beats";

// assertNever helper — throws at runtime, catches missing cases at compile time
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}

// Discriminated unions per mode — prevents accessing wrong fields at compile time
interface LearnStep {
  readonly id: string;
  readonly label: string;
  readonly targetMode: TargetNoteMode; // used for quiz question filtering
}

interface OutlineStep {
  readonly id: string;
  readonly label: string;
  readonly targetMode: TargetNoteMode; // used for pitch detection scoring
}

interface CompStep {
  readonly id: string;
  readonly label: string;
}

const LEARN_STEPS = [
  { id: "identify-roots", label: "Identify Root Notes", targetMode: "root" },
  { id: "find-guide-tones", label: "Find Guide Tones", targetMode: "root-and-guides" },
  { id: "chord-tone-id", label: "Chord Tone Identification", targetMode: "chord-tones" },
] as const satisfies readonly LearnStep[];

const OUTLINE_STEPS = [
  { id: "hit-the-root", label: "Hit the Root", targetMode: "root" },
  { id: "aim-guide-tones", label: "Aim for Guide Tones", targetMode: "root-and-guides" },
  { id: "approach-notes", label: "Add Approach Notes", targetMode: "root-and-guides" },
  { id: "free-improv", label: "Free Improvisation", targetMode: "chord-tones" },
] as const satisfies readonly OutlineStep[];

const COMP_STEPS = [
  { id: "learn-shapes", label: "Learn Shapes" },
  { id: "practice-transitions", label: "Practice Transitions" },
] as const satisfies readonly CompStep[];

const MODE_STEPS = {
  "learn-the-neck": LEARN_STEPS,
  "outline-chord-changes": OUTLINE_STEPS,
  "comp-with-voicings": COMP_STEPS,
} as const;

// Type check: ensure all mode IDs have steps
MODE_STEPS satisfies Record<PracticeModeId, readonly { id: string; label: string }[]>;
```

### Step Persistence (Simplified)

> **Round 2 changes:** Use `Partial<Record<PracticeModeId, number>>` instead of `[string]: number` (TypeScript review). Add runtime mode ID validation and step number clamping (security review). Use `console.warn` instead of silent catch (pattern recognition — matches existing persistence convention). Add SSR guard (architecture review — `getUnlockedStep` must not read localStorage during SSR/hydration).

```typescript
// lib/persistence/stepProgress.ts — 2 functions, not a Zustand slice

const STORAGE_KEY = "fretpad-step-progress";

type PersistedStepProgress = Partial<Record<PracticeModeId, number>>;

const VALID_MODES = new Set<string>(["learn-the-neck", "outline-chord-changes", "comp-with-voicings"]);

export function getUnlockedStep(mode: PracticeModeId): number {
  if (typeof window === "undefined") return 0; // SSR guard
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (typeof raw !== "object" || raw === null) return 0;
    const value = (raw as Record<string, unknown>)[mode];
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function unlockStep(mode: PracticeModeId, step: number): void {
  if (!VALID_MODES.has(mode)) return; // runtime allowlist
  const maxStep = MODE_STEPS[mode].length - 1;
  const clamped = Math.max(0, Math.min(step, maxStep));
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    const data = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, number>;
    data[mode] = Math.max(data[mode] ?? 0, clamped);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to persist step progress:", error); // match existing convention
  }
}
```

> **SSR note (architecture review):** Mode page components use `next/dynamic` and are client-only, but `getUnlockedStep` should still guard against SSR because it may be imported transitively. Call it inside a `useState` initializer or `useEffect`, not at module level or in render.

Session accuracy is tracked as **component-local state** using a rolling window:

> **Round 2 changes:** Auto-reset via `stepIndex` parameter (frontend races review — structural guarantee vs calling contract). Explicit return type interface (TypeScript review). Validated: 10-attempt window and 80% threshold match Duolingo/Khan Academy patterns (gamification UX research).

```typescript
// hooks/useRollingAccuracy.ts
const WINDOW_SIZE = 10; // research: balances smoothing vs. responsiveness
const UNLOCK_THRESHOLD = 0.8; // research: between Yousician (67%) and Duolingo (85%)

interface RollingAccuracyResult {
  accuracy: number;
  record: (correct: boolean) => void;
  reset: () => void;
  isUnlockEligible: boolean;
  attemptCount: number;
}

function useRollingAccuracy(stepIndex: number): RollingAccuracyResult {
  const [attempts, setAttempts] = useState<boolean[]>([]);
  const prevStepRef = useRef(stepIndex);

  // Auto-reset when step changes — structural guarantee, not a calling contract
  if (prevStepRef.current !== stepIndex) {
    prevStepRef.current = stepIndex;
    setAttempts([]); // React batches this with the render
  }

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
  return { accuracy, record, reset, isUnlockEligible, attemptCount: attempts.length };
}
```

For **Comp mode** (action-based gating, not accuracy-based), inline a counter directly in CompWithVoicingsPage — no separate hook needed (simplicity review: `useActionGate` was a 7-line abstraction used once):

```typescript
// In CompWithVoicingsPage.tsx — inline counter
const [explored, setExplored] = useState(new Set<string>());
const isStage1Complete = explored.size >= 5; // track unique voicing IDs, not raw clicks
// On voicing navigation: setExplored(prev => new Set(prev).add(voicingId));
```

> **Deduplication note (spec flow analysis):** The original `useActionGate(5)` was a raw counter that could be trivially bypassed by clicking "next" 5 times on the same voicing. Using a `Set<string>` of voicing IDs ensures the user actually explores different shapes.

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

> **Round 2 changes:** Single `useShallow` selector per adapter hook — spreading two `useShallow` results creates a new object reference every render, defeating memoization (TypeScript + performance review). Add `useFretboardData` hook for derived state computation (architecture review). Fretboard stays mode-agnostic — only calls `useFretboardDisplay()`, never mode-specific hooks.

```typescript
// hooks/useFretboardDisplay.ts — Fretboard calls this directly (mode-agnostic)
import { useShallow } from "zustand/react/shallow";

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

// Mode-specific hooks: SINGLE useShallow call, no spreading
export function useLearnFretboard() {
  return useAppStore(
    useShallow((s) => ({
      showScaleTones: s.showScaleTones,
      showVoiceLeading: s.showVoiceLeading,
      noteLabelMode: s.noteLabelMode,
      fretboardOverlay: s.fretboardOverlay,
      showCAGEDPositions: s.showCAGEDPositions,
      focusedPosition: s.focusedPosition,
      quizMode: s.quizActive,
      quizTargetPosition: s.quizQuestion?.targetNote,
    })),
  );
}
```

**Derived state computation** — the `fretNotes`, `voiceLeadingPaths`, `targetNoteData`, and `arpeggioConnections` computations (currently ~100 lines of `useMemo` in PracticePage) must live in a dedicated hook, NOT duplicated across mode pages:

```typescript
// hooks/useFretboardData.ts — derived state, shared across modes
export function useFretboardData() {
  const currentChord = useAppStore((s) => s.currentChord);
  const progression = useAppStore((s) => s.progression);
  // ... other atomic selectors

  const fretNotes = useMemo(() => /* existing computation */, [currentChord, ...]);
  const voiceLeadingPaths = useMemo(() => /* existing computation */, [...]);
  const targetNoteData = useMemo(() => /* existing computation */, [...]);

  return { fretNotes, voiceLeadingPaths, targetNoteData, arpeggioConnections };
}
```

> **Architecture clarification:** Fretboard is mode-agnostic. It calls `useFretboardDisplay()` for display state and receives `fretNotes`/`targetNoteData` from the mode page (which calls `useFretboardData`). Mode-specific hooks are consumed by mode pages, not by Fretboard.

**Shared behavioral hooks** — each mode page calls `usePracticeModeSetup` for common wiring:

```typescript
// hooks/usePracticeModeSetup.ts — prevents behavioral divergence across mode pages
export function usePracticeModeSetup(modeId: PracticeModeId) {
  useUrlState();
  useSessionTimer();
  usePracticeTracker({ mode: modeId, progressionName: ... });
  useFirstVisit();

  // Single enterMode effect (from existing prevModeRef pattern)
  const prevModeRef = useRef<string | null>(null);
  const hasInitialUrlStateRef = useUrlState();
  useEffect(() => {
    if (prevModeRef.current !== modeId) {
      prevModeRef.current = modeId;
      enterMode(modeId, { applyDefaults: !hasInitialUrlStateRef.current });
    }
  }, [enterMode, modeId]);
}
```

> **Why this matters (architecture review):** The current PracticePage has 5 shared behavioral hooks with subtle ordering dependencies. Duplicating these across 3 mode pages risks divergence — e.g., one mode forgets `useSessionTimer`, another wires `enterMode` without the URL state guard.

Fretboard reads from hooks directly instead of receiving props. Each mode page becomes ~80 lines (not ~50, accounting for `useFretboardData` and `usePracticeModeSetup` calls).

## Technical Considerations

### Phase 0: Foundation (Shared — Prerequisite)

**0a. Fix `enterMode` render cascade** `[Completed 2026-03-14]`

- File: `state/slices/practiceModeSlice.ts`
- Problem: `enterMode` calls 8-10 individual `set()` calls. Zustand v5 does NOT batch imperative `set()` inside actions — each fires a synchronous notification to all subscribers.
- Fix: Compute full state delta and call `set()` once.
- Documented in: `docs/solutions/performance-issues/zustand-mode-switching-render-cascade.md`

<details>
<summary>Concrete enterMode batching implementation</summary>

> **Round 2 changes:** (1) Imperative `Tone.getTransport().stop(); Tone.getTransport().cancel();` at top — do NOT defer transport stop through React effects (frontend races review: critical race where transport fires `onChordChange` with stale progression data after delta is applied). (2) Always reset `micActive = false` on mode switch (frontend races review: mic stream is destroyed on component unmount, but store still says active). (3) Inline quiz reset values directly instead of `getQuizResetDelta()` (simplicity review). (4) Cap `MAX_HISTORY` at 10 (performance review: 64-bar progressions with deep nesting).

```typescript
// In practiceModeSlice.ts — single set() call
enterMode: (id, options) => {
  const config = PRACTICE_MODES[id];
  const state = get();
  const applyDefaults = options?.applyDefaults ?? true;

  // CRITICAL: Stop transport imperatively BEFORE state delta.
  // Do NOT rely on React effects — the transport operates on its own clock.
  // Without this, a scheduled onChordChange can fire with stale progression data
  // between set() and the next React render cycle.
  if (state.isPlaying) {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
  }

  const delta: Partial<AppState> = { activeMode: id };

  if (state.isPlaying) delta.isPlaying = false;
  // Inline quiz reset (simplicity review: not worth a separate function for one call site)
  if (state.quizActive) {
    Object.assign(delta, {
      quizActive: false, quizQuestion: null, quizLastResult: null, quizFinished: false,
    });
  }
  if (state.sessionActive) delta.sessionActive = false;

  // ALWAYS reset mic on mode switch (frontend races review):
  // The old component's usePitchDetection cleanup destroys the stream, but if micActive
  // stays true in the store, the new component's usePitchDetection sees enabled=true
  // with no actual stream → UI shows mic active but nothing is listening.
  if (state.micActive) delta.micActive = false;

  if (applyDefaults) {
    const progression = PRESET_PROGRESSIONS[config.defaultPreset];
    delta.progression = progression;
    delta.currentBarIndex = 0;
    delta.currentChordIndex = 0;
    delta.currentChord = getChordAtPosition(progression, 0, 0);
    delta.tempo = Math.max(40, Math.min(200, config.defaultTempo));
    delta.selectedStyle = config.defaultStyle;
    delta.progressionHistory = [...state.progressionHistory, state.progression].slice(-10); // cap at 10
    delta.progressionFuture = [];
  }

  // Mode display constraints
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

> **Side effect verification (architecture review):** Confirm that the existing `setIsPlaying(false)` action does NOT contain transport cleanup logic beyond setting the boolean. If it does, that logic must be extracted and called imperatively here, not via the delta.

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

**0d. Create mode-specific page components** `[Completed 2026-03-14]`

- Keep `app/practice/[mode]/page.tsx` as thin Server Component (preserves `generateStaticParams`, metadata, validation)
- Simplify `PracticePage.tsx` to component map with `next/dynamic` imports
- Create: `components/practice/learn/LearnTheNeckPage.tsx`, `components/practice/outline/OutlineChangesPage.tsx`, `components/practice/comp/CompWithVoicingsPage.tsx`
- Each mode page imports shared components directly (ModeHeader, TransportBar, drawers) — no PracticeLayout wrapper
- Wrap mode content in `<Suspense fallback={<FretboardSkeleton />}>`
- Implementation note: this completion covers the route split and lazy-loaded mode entry points while preserving the existing shared practice body for behavior parity; Phase 1 still introduces mode-specific layouts and interactions.

**0e. Performance prerequisites (scoped to actual prerequisites)**

> **Round 2 changes:** Only 2 items are genuine prerequisites for mode differentiation; the other 4 are general performance improvements that can be done independently (simplicity review). Added concrete patterns from React performance research.

**Prerequisites (must complete before Phase 1):**

- `React.memo` on `FretMarker` with custom comparator (78 components re-render on any toolbar state change). **Critical prerequisite:** First stabilize props in `Fretboard.tsx` — the current inline `augmentedNote` spread (`{...note, isVoicingNote}`) and inline `onClick` arrow functions create new references every render, which defeats memo entirely. Either memoize `augmentedNote` via a keyed Map or use a data-attribute pattern for click handlers (performance review).
- Wrap `onChordChange` in `Tone.Draw.schedule(callback, audioTime)` for visual/audio sync — without this, chord-change visuals can drift 16ms from audio at fast tempos.

**Deferred (separate task, not blocking this feature):**

- Consolidate 3 resize listeners in `Fretboard.tsx` into single `useFretboardLayout` hook (recommend: replace `window.addEventListener("resize")` with a singleton `ResizeObserver` module — see React performance research for pattern)
- Refactor `usePlaybackPosition` to ref/state split — continuous `barProgress` via ref + direct DOM manipulation for playhead; discrete `barIndex`/`chordIndex` via React state (drops re-renders from ~60/sec to ~1-2/sec). See concrete pattern:

```typescript
// Ref for continuous values: updated every frame, no re-renders
const progressRef = useRef({ barProgress: 0, countInProgress: 0 });

// React state: only changes when bar/chord changes (~1-2/sec)
const [discretePosition, setDiscretePosition] = useState({
  barIndex: 0, chordIndex: 0, isActive: false, isCountingIn: false,
});

// In animation frame callback: update ref always, update state only on discrete changes
progressRef.current.barProgress = barProgress;
if (prev.barIndex !== barIndex || prev.chordIndex !== chordIndex) {
  setDiscretePosition({ barIndex, chordIndex, isActive: true, ... });
}

// Playhead reads progressRef directly via rAF, no React re-render:
// barRef.current.style.transform = `translateX(${progressRef.current.barProgress * 100}%)`;
```

- Pre-compute `barStartBeats` lookup table (O(1) per frame instead of O(bars)) — critical for 64-bar progressions; also consider binary search in `findPositionAtBeat`
- Debounce localStorage persistence via custom Zustand storage wrapper (500ms)

**0f. Fix pre-existing bugs (discovered during race conditions review)**

- **Instrument cleanup kills playback**: In `useAudioEngine.ts`, the instrument recreation effect's cleanup calls `transport.stop()` — this kills playback when user changes style or volume. Fix: cleanup should only dispose instruments, NOT stop transport. **Round 2 addition (frontend races review):** This is also a mode-switching issue — mode A's cleanup kills mode B's playback. Fix with a **generation nonce** pattern (similar to `activationNonceRef` already used in `usePitchDetection`): cleanup should only stop transport if its generation is still current.
- **Pitch detection skips first chord**: In `usePitchDetection.ts`, `prevPositionRef` is updated even on non-playing bail-out, so the first chord change after play-start is never evaluated. Fix: do NOT update `prevPositionRef` in the `!isPlaying` early return path.
- **ProgressionEditor re-renders at 60fps** `[Completed 2026-03-14]`: Playback highlight extracted to a ref-based overlay that doesn't trigger React re-renders.
- **Round 2: `recordQuizResult` call in quizSlice** `[Completed 2026-03-14]` (spec flow analysis): `submitQuizAnswer` no longer depends on ChallengeSlice and the fixed `QUIZ_LENGTH = 10` limit has been removed; quiz flow now stays active until the user closes or resets it, which unblocks the later rolling-accuracy stepper integration.

**0g. Accessibility: `prefers-reduced-motion`**

- Update `animate-target-primary` and `animate-target-secondary` CSS to use static highlight when motion is reduced
- This is prerequisite since target note pulsing becomes a hero feature

**0h. Security hardening** `[Completed 2026-03-14]`

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
- Extend quiz question generation to respect each Learn step's `targetMode` filter, reusing `TargetNoteMode` instead of adding a separate `quizQuestionFilter` type
- Use existing `onNoteClick` pattern on FretMarker for tap-to-answer (not a new `onFretTap` prop — pattern recognition recommendation)
- Add mic detection as alternative input (reuse `usePitchDetection` with `"root"` target mode)
- User toggle between tap and mic input modes: `[🎤 Mic] [👆 Tap]` segmented control
- Remove fixed 10-question limit; continuous practice, accuracy tracked via `useRollingAccuracy` (10-attempt rolling window)
- Curated presets (hide `ProgressionEditor`): single-chord vamp for Step 1, ii-V-I for Steps 2+
- Score/stats panel replaces theory panel: current accuracy, best streak, progress to 80% unlock

### Research Insights: Quiz UX

- **Touch targets**: FretMarker visual dot 28-32px, but tap hit area must be **44x44px minimum** (Apple HIG, WCAG 2.2 SC 2.5.5 AAA / 24px minimum for AA). Use invisible expanded touch regions; resolve overlaps by nearest center.
- **Fret range**: Limit quiz questions to frets 0-12 (essential range, avoids compressed high-fret tap targets on mobile). Test at 375px viewport width (iPhone SE).

> **Round 2 additions:**

### Mic Quiz: Chroma vs Position Mismatch (spec flow analysis, critical)

The quiz asks "Where is the root of Dm7?" pointing to a specific fret position. But `usePitchDetection` detects pitch (chroma class), not fret position. Playing a D on **any** string/fret registers as correct via mic, while tap requires finding a specific position.

**Decision required:** Accept chroma-based mic answers (any D = correct). Document this as a deliberate difficulty difference:
- **Tap mode**: "Find the note at this position" — spatial knowledge test
- **Mic mode**: "Play this note anywhere" — instrument knowledge test

This is acceptable because both modes develop useful skills, but the UI should clearly label the difference. Consider showing "Play any D" for mic mode vs "Tap the D here" for tap mode.

### Learn Mode Config Conflict (spec flow analysis)

Current `PracticeModeConfig` for `learn-the-neck` has `showMicToggle: false`. The `enterMode` delta sets `micActive = false` when `!config.showMicToggle`. **Fix:** Change `showMicToggle` to `true` for Learn mode, OR add a separate `showQuizMicToggle` config field (the existing mic toggle is for pitch detection scoring in Outline mode; the Learn mode toggle is for quiz input method).

### Step Unlock Moment UX (spec flow analysis, critical gap)

The unlock moment is the core reward loop, previously unspecified. Recommended interaction:

1. When `isUnlockEligible` becomes true, show a brief celebratory pulse animation on the stepper's next step
2. Display an inline toast: "Step 2 unlocked! Tap to continue, or keep practicing."
3. The user **manually taps** the next step to advance — no auto-advance (avoids disorienting mid-practice switch)
4. The current step stays active until the user chooses to move on
5. Completed steps remain accessible for replay (show checkmark, tappable)

> **Why not auto-advance:** Changing `targetNoteMode` mid-practice is actively hostile — the fretboard highlights change, scoring targets change, and the user's correct note suddenly becomes wrong. Manual advancement respects the user's practice flow.

### Accessibility: Quiz Feedback (gamification UX research)

- **WCAG 1.4.1 violation:** Fretboard color tokens (`bg-orange-500` root, `bg-blue-500` guide tone, etc.) rely on color alone. Add shape differentiation: root = circle, guide tone = diamond, chord tone = square, scale tone = small dot. Or use pattern fills (solid, striped, bordered, outline).
- **Screen reader:** Announce quiz questions via `aria-live="polite"`: "Where is the root of D minor 7?" Announce results: "Correct! That is D on string 4, fret 5." Step unlocks via `aria-live="assertive"`.
- **Focus management:** After quiz answer feedback, return focus to fretboard. After step unlock, move focus to newly unlocked step.

### TargetNoteMode Extension

> **Round 2 changes:** Renamed `"guide-tones"` to `"root-and-guides"` in `TargetNoteMode` to avoid semantic collision with quiz filtering (TypeScript review critical finding). Used `assertNever` helper instead of `satisfies never` (TypeScript review: `satisfies never` returns the value at runtime — a string, not a `Set<number>`).

```typescript
// lib/types.ts — CRITICAL: use exhaustive switch with assertNever
type TargetNoteMode =
  | "none"
  | "root"
  | "root-and-guides"  // renamed from "guide-tones-only" — includes root + 3rd + 7th
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
    case "root-and-guides":
      return guideAndRootChromas(chord);
    case "chord-tones":
    case "strong-beats":
    case "all":
      return allChordToneChromas(chord);
    default:
      return assertNever(mode); // throws at runtime + compile error if variant unhandled
  }
}
```

> **Why `"root-and-guides"` instead of `"guide-tones"` (TypeScript review, critical finding):** The old `"guide-tones-only"` meant "root + 3rd + 7th" in pitch detection. Quiz filtering uses "guide tones" to mean "only 3rd and 7th, no root." If both used the string `"guide-tones"`, TypeScript's structural typing would silently allow using one where the other is expected, producing wrong scoring (roots counted when they shouldn't be, or not counted when they should be).

> **Why `assertNever` instead of `satisfies never`:** `mode satisfies never` is a type-level check that returns the runtime value of `mode` — a `string`, not a `Set<number>`. `assertNever(mode)` actually throws, making it both a compile-time and runtime guard.

### TargetNoteMode Migration

> **Round 2 addition (spec flow analysis + architecture review):** The plan previously referenced "Zustand `persist.migrate`" for the rename, but the app uses custom `loadFromLocalStorage`/`saveToLocalStorage`, not Zustand persist middleware. Migration must happen in `loadFromLocalStorage`:

```typescript
// In lib/persistence/localStorage.ts — one-time migration
function migratePersistedState(state: Record<string, unknown>): Record<string, unknown> {
  // Rename "guide-tones-only" → "root-and-guides"
  if (state.targetNoteMode === "guide-tones-only") {
    state.targetNoteMode = "root-and-guides";
  }
  return state;
}
```

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

> **Round 2: "Visual Only" clarification (spec flow analysis):** "All steps accessible" means all steps are immediately unlocked (no lock icons in stepper) but marked "unscored" with a persistent mic banner. The stepper shows step labels without accuracy rings. If the user grants mic permission mid-session, scoring activates but does not retroactively gate steps already accessed.

> **Round 2: Mic revocation mid-session (spec flow analysis):** When `track.ended` fires during an active session, show a toast: "Microphone disconnected. Scoring paused." Transition to Visual Only tier. Preserve the rolling accuracy window (do not reset) so progress is not lost. The persistent banner appears: "Reconnect microphone to resume scoring."

### Scoring Bridge: `usePitchDetection` to `useRollingAccuracy` (spec flow analysis, critical gap)

The existing `usePitchDetection` calls `updateScore()` on the Zustand store at chord changes. `useRollingAccuracy` is component-local state. **There is no described bridge between them.** Without this, Outline mode step advancement cannot work.

**Solution:** Add an `onEvaluationResult` callback parameter to `usePitchDetection` that fires on each chord-change evaluation:

```typescript
// In usePitchDetection options:
interface UsePitchDetectionOptions {
  // ... existing options
  onEvaluationResult?: (hit: boolean) => void; // NEW: fires per chord change
}

// In the evaluation logic (where updateScore is currently called):
if (hit) {
  get().updateScore(true);
  options.onEvaluationResult?.(true);
} else {
  get().updateScore(false);
  options.onEvaluationResult?.(false);
}

// In OutlineChangesPage:
const { record } = useRollingAccuracy(currentStepIndex);
usePitchDetection({
  enabled: micActive,
  onEvaluationResult: record, // bridge: pitch detection → rolling accuracy
});
```

### Step Advancement: Deferred to Loop Boundaries (frontend races review, critical)

When `isUnlockEligible` becomes true during playback, do NOT immediately change `targetNoteMode`. The user is mid-loop playing against the current targets — switching targets mid-loop means their correct note suddenly scores as a miss.

```typescript
// Deferred unlock pattern
const pendingUnlockRef = useRef(false);

// In the scoring callback:
if (isUnlockEligible && !pendingUnlockRef.current) {
  pendingUnlockRef.current = true;
  // Show "Step complete!" toast, but do NOT change targetNoteMode yet
}

// In the onLoop callback (fires at loop boundary):
if (pendingUnlockRef.current) {
  pendingUnlockRef.current = false;
  advanceStep(); // NOW change targetNoteMode — safe because loop is restarting
}
```

### Pitch Evaluation: Use Transport Time (frontend races review)

The current `evaluateHit` uses `performance.now()` for the evaluation window. At high tempos (180-200 BPM), main-thread jank during React re-renders can delay the `onChordChange` callback by 30-80ms, eating 15-17% of the evaluation window (one beat = 300-333ms).

**Fix:** Use `Tone.getTransport().seconds` as the reference clock instead of `performance.now()`. Convert the ring buffer timestamps to transport-relative time. This aligns the evaluation window with the audio clock, not the render clock.

### Hit Quality Tiers (Web Audio pitch detection research)

For richer feedback beyond binary hit/miss, consider strong/weak quality:
- **Strong hit**: correct chroma with clarity >= 0.9 within first half of beat
- **Weak hit**: correct chroma with clarity >= 0.85 anywhere in window
- **Miss**: no matching chroma in window

This gives players a reason to improve timing, not just note selection. Deferred for MVP but the `evaluateHit` refactor should make this easy to add later.

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

### Race Conditions to Watch (expanded from 4 to 9 — frontend races review round 2)

| # | Scenario                                    | Risk                                                          | Mitigation                                                                                                                                |
| - | ------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | **Rapid mode switching**                    | Partial state from mode A leaks into mode B                   | Single batched `set()` makes mode entry atomic                                                                                            |
| 2 | **Transport not stopped imperatively**      | `onChordChange` fires with stale progression data after delta | Call `Tone.getTransport().stop(); .cancel()` imperatively in `enterMode` BEFORE `set(delta)` — do NOT defer via React effect              |
| 3 | **Step advance during playback**            | `advanceStep` changes `targetNoteMode` mid-loop               | Deferred unlock: set `pendingUnlockRef`, only call `advanceStep()` in `onLoop` callback at loop boundary                                 |
| 4 | **Quiz answer + chord change in same frame**| Answer processed with wrong chord context                     | In `submitQuizAnswer`, compare `quizQuestion.chord` against `state.currentChord`; if diverged, discard attempt and regenerate question     |
| 5 | **Progression edit during playback**        | Stale bar/chord indices in scheduled callbacks                | Stop playback on progression edit (existing behavior)                                                                                     |
| 6 | **Mic state diverges on mode switch**       | Store says `micActive: true`, but stream is destroyed         | Always reset `micActive = false` in `enterMode` delta; user re-enables in new mode                                                       |
| 7 | **Audio engine cleanup kills new mode**     | Mode A's `useAudioEngine` cleanup calls `transport.stop()`    | Use generation nonce pattern (like `activationNonceRef` in `usePitchDetection`); cleanup only stops transport if its generation is current |
| 8 | **`usePlaybackPosition` 60fps setState**    | Starves main thread, compounds all timing issues              | Ref/state split: continuous `barProgress` via ref, discrete `barIndex`/`chordIndex` via React state                                       |
| 9 | **Pitch eval uses `performance.now()`**     | 15-17% window loss at high tempos due to main-thread jank     | Use `Tone.getTransport().seconds` as reference clock for evaluation window                                                                |

> **Round 2: Missing race (frontend races review):** `getTargetChromas` during `targetNoteMode` transition — if step advancement fires `set({ targetNoteMode: "root-and-guides" })` and the pitch detection subscription fires in the same microtask, it evaluates the *old* chord against the *new* target mode. Mitigated by deferring step advancement to loop boundaries (#3 above) — if advancement only happens at loop reset, the evaluation tracking is also reset.

## Acceptance Criteria

### Foundation (Phase 0)

- [x] `enterMode` uses single batched `set()` call (1 re-render, not 8-10)
- [x] `enterMode` calls `Tone.getTransport().stop(); .cancel()` **imperatively** before `set(delta)` (race #2)
- [x] `enterMode` always resets `micActive = false` on mode switch (race #6)
- [x] Fretboard reads store directly via `useFretboardDisplay()` (mode-agnostic) `[Completed 2026-03-14]`
- [x] `useFretboardData` hook encapsulates derived state computation (`fretNotes`, `voiceLeadingPaths`, etc.) `[Completed 2026-03-14]`
- [x] `usePracticeModeSetup` hook centralizes shared behavioral wiring (`useUrlState`, `useSessionTimer`, etc.)
- [x] `useShallow` grouped selectors replace ~40 individual selectors in mode pages `[Completed 2026-03-14]`
- [x] `FretMarker` wrapped in `React.memo` with custom comparator `[Completed 2026-03-14]`
- [x] `Tone.Draw.schedule` used for chord change callbacks (syncs visual updates with audio timing) `[Completed 2026-03-14]`
- [x] `lib/persistence/stepProgress.ts` provides `getUnlockedStep`/`unlockStep` with SSR guard, mode allowlist, step clamping
- [x] `hooks/useRollingAccuracy.ts` tracks 10-attempt window with 80% threshold; auto-resets via `stepIndex` parameter
- [x] `MODE_STEPS` defined with discriminated unions (`LearnStep`, `OutlineStep`, `CompStep`) and `as const satisfies`
- [x] `TargetNoteMode` extended with `"root"` and `"root-and-guides"` (not `"guide-tones"`) in `lib/types.ts`
- [x] `TargetNoteMode` migration in `loadFromLocalStorage` (not Zustand persist.migrate — app uses custom persistence)
- [x] `assertNever` helper used in exhaustive switches (not `satisfies never`)
- [x] 3 mode-specific page components created via `next/dynamic` component map
- [x] `StepStepper.tsx` shows current step + progress toward 80% unlock (text/bar, not circular SVG ring — simplicity)
- [x] Step unlock moment: inline toast + manual advancement (no auto-advance) `[Completed 2026-03-14 in Learn mode]`
- [x] `prefers-reduced-motion` handled for target note animations `[Completed 2026-03-14]`
- [x] `localStorage.removeItem('fretpad-challenges')` cleanup on first load
- [x] `recordQuizResult` call removed from `quizSlice.submitQuizAnswer` (ChallengeSlice removal)
- [x] **Bug fix**: Instrument cleanup in `useAudioEngine` uses generation nonce — cleanup only stops transport if its generation is current (race #7)
- [x] **Bug fix**: `prevPositionRef` in `usePitchDetection` not updated on non-playing bail-out
- [x] **Bug fix**: ProgressionEditor playback highlight extracted to ref-based overlay `[Completed 2026-03-14]`
- [x] `learn-the-neck` config updated: `showMicToggle: true` (or new `showQuizMicToggle` field)

### Learn the Neck (Track A)

- [x] Quiz is primary interface with fretboard as answer surface (tap to identify via existing `onNoteClick` pattern) `[Completed 2026-03-14]`
- [ ] Mic detection as alternative input mode (segmented control toggle); chroma-based (any correct pitch = correct)
- [ ] UI labels: "Play any D" (mic) vs "Tap the D here" (tap) — clarify difficulty difference
- [x] 3 steps with filtered question pools (roots → guide tones → chord tones) `[Completed 2026-03-14]`
- [x] ~80% accuracy (10-attempt rolling window) unlocks next step; step unlock = toast + manual advance `[Completed 2026-03-14]`
- [x] 44px minimum touch targets for fretboard quiz interaction (WCAG 2.5.5 AAA) `[Completed 2026-03-14 via existing expanded fret marker touch targets]`
- [x] Progression editor hidden; curated presets drive chord selection `[Completed 2026-03-14]`
- [x] Score/stats panel replaces theory panel `[Completed 2026-03-14]`
- [x] Completed steps remain accessible for replay `[Completed 2026-03-14]`
- [x] Quiz questions limited to frets 0-12 `[Completed 2026-03-14]`
- [x] `aria-live="polite"` for quiz questions; `aria-live="assertive"` for step unlocks `[Completed 2026-03-14]`
- [x] Quiz answer validates chord context — discard if chord changed since question generated (race #4) `[Completed 2026-03-14]`

### Outline Chord Changes (Track B)

- [x] Target notes pulse/animate prominently on chord changes `[Completed 2026-03-15]`
- [x] `"root"` TargetNoteMode added with exhaustive switch + `assertNever` `[Completed 2026-03-14 in Phase 0]`
- [x] 4 steps with progressive target complexity (root → root-and-guides → approaches → free) `[Completed 2026-03-15]`
- [x] Approach notes scored by expanding target chroma set (not sequence detection) `[Completed 2026-03-15]`
- [x] Two-tier mic fallback (Mic → Visual Only with persistent banner); mic revocation shows toast `[Completed 2026-03-15]`
- [x] `usePitchDetection` has `onEvaluationResult` callback bridging to `useRollingAccuracy.record()` (scoring bridge) `[Completed 2026-03-15]`
- [x] Step advancement deferred to loop boundaries via `pendingUnlockRef` pattern (race #3) `[Completed 2026-03-15]`
- [x] Mic scoring per step with ~80% accuracy gate (10-attempt rolling window) `[Completed 2026-03-15]`
- [x] Scorecard panel replaces theory panel `[Completed 2026-03-15]`

### Comp with Voicings (Track C)

- [ ] 2-stage progression (Learn Shapes → Practice Transitions)
- [ ] Voice leading arrows prominent and functional between specific voicing shapes
- [ ] "Play voicing" button in Stage 1 triggers chord strum (reuse existing chord synth instrument)
- [ ] Stage 2 shows current + next voicing simultaneously with voice leading paths
- [ ] Stage gating: explore 5+ **unique** voicings via `Set<string>` (not raw click counter)

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
| `TargetNoteMode` rename breaks existing code                | Rename `"guide-tones-only"` → `"root-and-guides"` in single commit with find-replace. Add migration in `loadFromLocalStorage` (NOT Zustand persist.migrate — app uses custom persistence). |
| Instrument cleanup bug (pre-existing)                       | Fix in Phase 0 before adding mode-specific audio behavior; use generation nonce pattern                                                                                                    |
| Transport not stopped imperatively in `enterMode` (round 2) | Call `Tone.getTransport().stop(); .cancel()` before `set(delta)` — do NOT defer via React effect                                                                                          |
| `recordQuizResult` breaks after ChallengeSlice removal      | Remove call from `quizSlice.submitQuizAnswer`; remove fixed `QUIZ_LENGTH = 10`; replace with continuous rolling accuracy                                                                   |
| Mic quiz chroma vs position mismatch (round 2)              | Document as deliberate difficulty difference; use distinct UI labels per input mode                                                                                                         |
| `useRollingAccuracy`/`usePitchDetection` bridge missing     | Add `onEvaluationResult` callback to `usePitchDetection`; Outline page bridges to `rollingAccuracy.record()`                                                                               |

## Deferred to Post-MVP

| Feature                                | Reason                                                                | When to Revisit                         |
| -------------------------------------- | --------------------------------------------------------------------- | --------------------------------------- |
| Comp Stage 3: Build Arrangement        | VoicingArrangement data model + persistence complexity                | After Stages 1-2 validated with users   |
| Learn Step 4: Intervals at Tempo       | Quiz-transport integration complexity                                 | After Steps 1-3 are stable              |
| Per-step historical scores             | `stepScores` with bestAccuracy/attempts/bestStreak                    | When retention features are prioritized    |
| URL-shared voicing arrangements        | Encoding arrangement in share token                                   | After arrangement model exists             |
| Self-Report mic fallback tier          | Adds new interactive UI element; two-tier model sufficient for launch | When user feedback shows demand            |
| `React.Activity` for mode preservation | Preserve previous mode state during switch                            | React 19 stabilization                     |
| Gold mastery indicator at 90%          | Cosmetic gamification; not part of core guided experience             | When step completion data shows engagement |
| Circular SVG progress ring on stepper  | Custom widget; text/bar progress is simpler and equally functional    | When stepper UI polish is prioritized      |
| Hit quality tiers (strong/weak)        | Enriched scoring feedback; binary hit/miss sufficient for MVP         | After accuracy tracking is stable          |
| `usePlaybackPosition` ref/state split  | General performance improvement, not blocking mode differentiation    | As a standalone perf task                  |
| ResizeObserver consolidation           | General performance improvement                                       | As a standalone perf task                  |
| URL state size limit + bar count limit | Security hardening unrelated to mode differentiation                  | As a standalone security task              |
| WCAG 1.4.1 shape differentiation      | Accessibility improvement needed but not blocking initial launch      | Before public launch                       |
| Inline session summary                 | Adds closure to practice sessions; lightweight implementation         | After step progression is stable           |

## Sources & References

- **Origin brainstorm:** [docs/brainstorms/2026-03-14-mode-differentiation-brainstorm.md](docs/brainstorms/2026-03-14-mode-differentiation-brainstorm.md) — Key decisions: distinct layouts per mode, step-by-step progression, quiz-first Learn mode, target notes as hero in Outline, 3-stage Comp workshop
- **Known issue (render cascade):** [docs/solutions/performance-issues/zustand-mode-switching-render-cascade.md](docs/solutions/performance-issues/zustand-mode-switching-render-cascade.md) — background and verification details for the now-completed batching fix
- **Known issue (client/server boundary):** [docs/solutions/logic-errors/nextjs-zustand-guided-practice-code-review.md](docs/solutions/logic-errors/nextjs-zustand-guided-practice-code-review.md) — route validation must stay in Server Component
- **Current route shell:** `app/practice/[mode]/PracticePage.tsx` (dynamic component map + Suspense fallback)
- **Current shared implementation body:** `components/practice/SharedPracticePage.tsx` (current shared UI pending per-mode divergence)
- **Mode configs:** `lib/modes.ts` (visibility flags)
- **Fretboard component:** `components/fretboard/Fretboard.tsx` (47 props → self-serve from store)
- **Quiz system:** `state/slices/quizSlice.ts` (needs step-aware question filtering and unlock flow wiring)
- **Pitch detection:** `hooks/usePitchDetection.ts` (needs root-only mode + bug fix)
- **Step progression persistence:** `lib/persistence/stepProgress.ts`
- **Zustand v5 batching:** [Discussion #1648](https://github.com/pmndrs/zustand/discussions/1648), [useShallow migration](https://github.com/pmndrs/zustand/blob/HEAD/docs/guides/prevent-rerenders-with-use-shallow.md)
- **Tone.js scheduling:** [Tone.Draw docs](https://tonejs.github.io/docs/r13/Draw), [Performance wiki](https://github.com/Tonejs/Tone.js/wiki/Performance)
- **Touch targets:** Apple HIG (44x44pt), Material Design 3 (48x48dp), WCAG 2.2 SC 2.5.8 (24x24 CSS px minimum)
- **Learning progression UX:** Duolingo crown levels, Yousician star system, Khan Academy mastery levels, EDM 2015 N-CCR research
- **Stepper UI:** [Lollypop Design stepper patterns (2026)](https://lollypop.design/blog/2026/february/beyond-the-progress-bar-the-art-of-stepper-ui-design/), Material UI stepper, PatternFly progress stepper

### Round 2 Sources

- **Zustand v5 useShallow:** [Official docs](https://github.com/pmndrs/zustand/blob/HEAD/docs/guides/prevent-rerenders-with-use-shallow.md), [Discussion #2867](https://github.com/pmndrs/zustand/discussions/2867), [Discussion #2541](https://github.com/pmndrs/zustand/discussions/2541)
- **Next.js 16 lazy loading:** [Official lazy loading guide (v16.1.6)](https://github.com/vercel/next.js/blob/v16.1.6/docs/01-app/02-guides/lazy-loading.mdx) — `next/dynamic` is `React.lazy()` + `Suspense` composite
- **Tone.js Draw.schedule:** [Performance wiki](https://github.com/tonejs/tone.js/wiki/Performance), [Animation sync example](https://github.com/tonejs/tone.js/blob/dev/examples/animationSync.html)
- **React.memo best practices:** [React.memo 2025 Guide (Strapi)](https://strapi.io/blog/react-memo-optimize-functional-components-guide), [Use React.memo wisely (Pavlutin)](https://dmitripavlutin.com/use-react-memo-wisely/), [Official React docs](https://react.dev/reference/react/memo)
- **ResizeObserver consolidation:** [WICG/resize-observer#59](https://github.com/WICG/resize-observer/issues/59), [@react-hook/resize-observer](https://www.npmjs.com/package/@react-hook/resize-observer)
- **Gamification research:** [Yousician gamification case study (Trophy)](https://trophy.so/blog/yousician-gamification-case-study), [Khan Academy mastery levels](https://support.khanacademy.org/hc/en-us/articles/5548760867853), [PNAS spaced repetition optimization](https://www.pnas.org/doi/10.1073/pnas.1815156116)
- **WCAG accessibility:** [WCAG 2.5.8 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- **Pitch detection:** [Pitchy (MPM algorithm)](https://github.com/ianprime0509/pitchy), [Real-time browser pitch detection explained](https://pitchdetector.com/real-time-browser-pitch-detection-explained/), [Web Audio best practices (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- **React 19 concurrent rendering + Zustand:** [useSyncExternalStore docs](https://react.dev/reference/react/useSyncExternalStore), [Zustand concurrent mode discussion #2318](https://github.com/pmndrs/zustand/discussions/2318)
