---
title: Zustand mode-switching render cascade and state management patterns
category: performance-issues
date: 2026-03-14
tags: [zustand, react, next.js, render-performance, state-management, code-review]
modules: [state/slices, hooks, components/fretboard, app/practice]
status: partially-implemented
---

## Problem

When introducing a guided practice mode system (3 modes controlling UI visibility via a `PracticeModeConfig` data object), the `enterMode` Zustand action calls 8+ sequential state setters (`setIsPlaying`, `endQuiz`, `loadPreset`, `setTempo`, `setSelectedStyle`, etc.). Each setter triggers a synchronous Zustand update. The main `PracticePage` component subscribes to ~40 individual store selectors, so each mutation triggers 40 equality checks and potentially a full re-render of a 500-line component. Result: 8-10 re-renders in rapid succession on mode entry.

Zustand does NOT batch imperative `state.setX()` calls inside actions — React 18's automatic batching only applies within React event handlers and effects, not inside Zustand action internals.

## Root Cause

Two compounding issues:

1. **Sequential mutations in `enterMode`**: Calling cross-slice setters one at a time instead of computing a merged state delta and calling `set()` once.
2. **Selector granularity in the consumer**: ~40 individual `useAppStore((s) => s.field)` calls in one component. Each is an independent subscription that runs its equality check on every state change.

## Solution

### 1. Batch `enterMode` into a single `set()` call

Instead of calling multiple setters sequentially, compute the full state delta and apply it atomically:

```typescript
enterMode: (id, options) => {
  const config = PRACTICE_MODES[id];
  const state = get();
  const updates: Partial<AppState> = { activeMode: id };

  if (state.isPlaying) updates.isPlaying = false;
  if (state.quizActive) { /* inline endQuiz logic */ }
  if (applyDefaults) {
    // Compute preset/tempo/style state directly instead of calling setters
  }
  if (!config.showVoicingsButton && state.showVoicings) updates.showVoicings = false;
  if (!config.showTargetsDropdown && state.targetNoteMode !== "none") updates.targetNoteMode = "none";
  // ...

  set(updates); // Single atomic update, single notification
};
```

Challenge: `loadPreset` does complex work internally. Refactor it to return a state delta rather than calling `set` internally, then merge all deltas.

### 2. Group selectors with `useShallow` or split into sub-components

```typescript
import { useShallow } from "zustand/react/shallow";

const { currentChord, progression, currentBarIndex } = useAppStore(
  useShallow((s) => ({
    currentChord: s.currentChord,
    progression: s.progression,
    currentBarIndex: s.currentBarIndex,
  }))
);
```

Or better: split the 500-line component into sub-components (`FretboardSection`, `TheorySection`) that each subscribe only to the state they need.

## Additional Findings from Review

### Type safety erosion at boundaries

The `mode` field on `PracticeSession` and in `usePracticeTracker` is typed as `string` when the source is always `PracticeModeId`. Type it as `PracticeModeId | undefined` to prevent the type chain from eroding across the persistence boundary.

### Dead code: unused `sessionTimeMs`

`usePracticeTracker` maintains a 1-second `setInterval` updating `sessionTimeMs`, but no consumer destructures it. Remove the state, the ref, and the interval.

### Mixed data sourcing in components

`DisplayToolbar` reads `activeMode` from the Zustand store directly while also receiving display-state props from its parent. `TheoryPanel` uses props only. Pick one pattern: either components self-serve from the store, or parents pass visibility flags as props.

### Hardcoded default tab

`TheoryPanel` uses `defaultValue="chord"` but mode configs could omit `"chord"` from `theoryTabs`. Use `defaultValue={tabs[0]}` to prevent a silently broken default.

## Implementation Status

### Implemented ✅

- **Type safety at boundaries** (Fix 4 in logic-errors doc): `TheoryTabId` union type, typed `defaultPreset` via `PracticeModeConfigWithPreset`
- **Double localStorage read** (Fix 5 in logic-errors doc): `usePracticeTracker` uses return value from `recordPracticeTime` via `todayTotalFromStats` helper
- **Interval stability**: `progressionName` and `mode` moved to refs in `usePracticeTracker` so metadata changes don't restart save intervals

### Not Yet Implemented ⬚

- **Batch `enterMode` into single `set()` call**: `enterMode` still calls 8+ sequential setters (`setIsPlaying`, `endQuiz`, `loadPreset`, `setTempo`, etc.). Each triggers a Zustand notification. Requires refactoring `loadPreset` and other setters to return state deltas instead of calling `set` internally.
- **Selector grouping with `useShallow`**: `PracticePage` still has ~40 individual `useAppStore` selectors. Not yet grouped or decomposed into sub-components.
- **Dead code: `sessionTimeMs`**: Still present — `usePracticeTracker` maintains a 1-second interval updating it. Verify whether `PracticeStats` component consumes it before removing.

## Prevention

- **Zustand actions that touch multiple slices**: always compute the full delta and call `set()` once. Treat cross-slice coordination as a transaction.
- **Large components with many selectors**: if a component has >10 `useAppStore` calls, it is a signal to either group with `useShallow` or decompose into smaller components.
- **Type boundaries**: when data flows from a typed source (route param, union type) into persistence or hooks, preserve the original type rather than widening to `string`.
