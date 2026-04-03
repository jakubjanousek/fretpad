---
title: "Guided Practice Modes: Client/Server Boundary Misuse and Effect Race Conditions"
category: logic-errors
date: 2026-03-13
tags:
  - react-hooks
  - race-condition
  - next-js-app-router
  - zustand
  - client-server-boundary
  - rules-of-hooks
  - typescript-type-safety
  - localstorage
severity: critical
status: implemented
branch: feat/guided-practice-modes
components:
  - app/practice/[mode]/page.tsx
  - components/modes/ModeHeader.tsx
  - lib/types.ts
  - components/fretboard/DisplayToolbar.tsx
  - hooks/usePracticeTracker.ts
  - state/slices/practiceModeSlice.ts
framework_versions:
  next: "16"
  react: "19"
  zustand: "5"
  typescript: "5"
---

## Problem

The `feat/guided-practice-modes` branch introduced 3 guided practice modes with a launcher page, mode-specific configuration, and dynamic routing (`/practice/[mode]`). A multi-agent code review surfaced several correctness, type safety, and performance issues — two of which are critical.

## Findings

### 1. CRITICAL: `notFound()` in Client Component Before Hooks

**Location:** `app/practice/[mode]/page.tsx:56-58`

The practice page is marked `"use client"` and calls `notFound()` at line 56 before any hooks. `notFound()` is a Server Component API that works by throwing a special Next.js error. When called before hooks, it creates a conditional hook execution path — if `notFound()` throws, none of the subsequent hooks run, violating React's Rules of Hooks.

```typescript
// BAD: "use client" component calling notFound() before hooks
"use client";
export default function PracticePage() {
  if (!isValidModeId(modeSlug)) {
    notFound(); // throws — hooks below never execute
  }
  useUrlState();       // conditional!
  useSessionTimer();   // conditional!
  // ...
}
```

### 2. CRITICAL: Dual-useEffect Race Condition

**Location:** `app/practice/[mode]/page.tsx:71-85`

Two independent `useEffect` hooks coordinate via a shared `hasEnteredRef`. The first resets the ref when `modeId` changes, the second reads it to decide whether to call `enterMode`. React does not guarantee execution order of independent effects during concurrent rendering. If the second runs before the first on a `modeId` change, `enterMode` is skipped entirely.

```typescript
// BAD: Two effects coordinating via a mutable ref
const hasEnteredRef = useRef(false);

useEffect(() => {
  hasEnteredRef.current = false;  // Effect A: reset
}, [modeId]);

useEffect(() => {
  if (!hasEnteredRef.current) {   // Effect B: reads ref
    hasEnteredRef.current = true;
    enterMode(modeId, { ... });
  }
}, [enterMode, modeId]);
```

### 3. HIGH: ModeHeader Bypasses Store

**Location:** `components/modes/ModeHeader.tsx:19-27`

`ModeHeader` directly manipulates `localStorage` instead of calling the store's `exitMode()` because calling `exitMode()` sets `activeMode=null`, which triggers the practice page's useEffect to re-enter the mode (a race condition caused by finding #2).

### 4. MEDIUM: Loose Typing in Config

**Location:** `lib/types.ts`, `lib/modes.ts`

`theoryTabs: string[]` allows typos like `"chords"` that silently produce an empty panel. `defaultPreset: string` is cast with `as keyof typeof PRESET_PROGRESSIONS` at usage, bypassing compile-time safety.

### 5. MEDIUM: Double localStorage Reads

**Location:** `hooks/usePracticeTracker.ts:70-76`

`recordPracticeTime` returns the updated stats, but the hook ignores the return value and immediately calls `getTodayPracticeTime()` which re-reads and re-parses the same localStorage key. This happens every 10 seconds during playback.

### 6. LOW: Mixed Data Sourcing

**Location:** `components/fretboard/DisplayToolbar.tsx:100-107`

`DisplayToolbar` reads `activeMode` from the Zustand store directly to derive visibility flags, while `TheoryPanel` receives equivalent data via `visibleTabs` prop. Inconsistent data flow patterns.

## Root Cause

The core issues stem from:
1. **Blurred client/server boundary** — Using Server Component APIs in client components
2. **Splitting a single operation across multiple effects** — Creating implicit ordering dependencies that React doesn't guarantee
3. **Working around bugs instead of fixing them** — The `ModeHeader` localStorage workaround is a symptom of the effect race condition

## Solution (All Fixes Implemented)

### Fix 1: Server Component Wrapper for Route Validation ✅

Split `page.tsx` into a thin async Server Component (`page.tsx`) that validates the route and calls `notFound()`, plus a `"use client"` component (`PracticePage.tsx`) that receives the validated `modeId` as a prop. All hooks now execute unconditionally.

**Files:** `app/practice/[mode]/page.tsx` (server), `app/practice/[mode]/PracticePage.tsx` (client)

```typescript
// app/practice/[mode]/page.tsx (Server Component — no "use client")
export default async function Page({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode } = await params;
  if (!isValidModeId(mode)) notFound();
  return <PracticePage modeId={mode as PracticeModeId} />;
}
```

### Fix 2: Single Effect with prevModeRef ✅

Replaced the dual-`useEffect` coordination (reset ref + read ref) with a single effect using `prevModeRef` for idempotency. Safe under React StrictMode — second invocation sees `prevModeRef.current === modeId` and skips.

**File:** `app/practice/[mode]/PracticePage.tsx`

```typescript
const prevModeRef = useRef<string | null>(null);

useEffect(() => {
  if (prevModeRef.current !== modeId) {
    prevModeRef.current = modeId;
    enterMode(modeId, {
      applyDefaults: !hasInitialUrlStateRef.current,
    });
  }
}, [enterMode, modeId]);
```

### Fix 3: Use exitMode() in ModeHeader ✅

With the race condition resolved by Fix 2, `ModeHeader` now calls `exitMode()` from the store instead of directly manipulating localStorage. The store's `exitMode()` handles both localStorage cleanup and state reset.

**File:** `components/modes/ModeHeader.tsx`

### Fix 4: Strict Config Types ✅

Introduced `TheoryTabId` union type and `PracticeModeConfigWithPreset` that extends `PracticeModeConfig` with a typed `defaultPreset`. Removed the redundant `slug` field (the `id` field already serves as the URL slug). The `as keyof typeof PRESET_PROGRESSIONS` cast in `practiceModeSlice.ts` is eliminated — `config.defaultPreset` is now correctly typed at the source.

**Files:** `lib/types.ts`, `lib/modes.ts`, `state/slices/practiceModeSlice.ts`

```typescript
export type TheoryTabId = "chord" | "modes" | "subs" | "analysis";

// In lib/modes.ts — extends base config with typed preset
type PresetName = keyof typeof PRESET_PROGRESSIONS;
export interface PracticeModeConfigWithPreset extends PracticeModeConfig {
  defaultPreset: PresetName;
}
```

### Fix 5: Use Return Value from recordPracticeTime ✅

Eliminated double localStorage reads by using the return value from `recordPracticeTime` and computing today's total with a helper function. Also moved `progressionName` and `mode` to refs so they don't restart the save interval when they change.

**File:** `hooks/usePracticeTracker.ts`

```typescript
// Helper avoids re-reading localStorage
function todayTotalFromStats(stats: {
  sessions: { date: string; durationMs: number }[];
}): number {
  const today = new Date().toISOString().split("T")[0] ?? "";
  return stats.sessions
    .filter((s) => s.date === today)
    .reduce((total, s) => total + s.durationMs, 0);
}

// Refs prevent interval restarts on metadata changes
const progressionNameRef = useRef(progressionName);
const modeRef = useRef(mode);

// Use return value directly
const stats = recordPracticeTime(elapsed, progressionNameRef.current, modeRef.current);
setTodayTimeMs(todayTotalFromStats(stats));
```

### Fix 6: Launcher Uses id Instead of slug ✅

With the `slug` field removed, `Launcher.tsx` now links to `/practice/${config.id}` instead of `/practice/${config.slug}`.

**File:** `components/modes/Launcher.tsx`

## Prevention Strategies

| Anti-pattern | Rule |
|---|---|
| Server APIs in client components | Validate in Server Component wrappers; client components receive typed props only |
| Coordinated useEffects via refs | Merge coupled effects into one; promote shared signals to React state if separation is truly needed |
| Direct localStorage outside store | All persistence lives in the store; fix the store API, never bypass it |
| `string` instead of union types | Derive types from `as const` arrays; one source of truth for valid values |
| Re-reading what you just wrote | Capture return values from mutating functions; don't re-derive from side-effect channels |

## Related

- [Implementation plan](../../plans/2026-03-13-001-feat-guided-practice-modes-plan.md)
- [Brainstorm](../../brainstorms/2026-03-13-guided-practice-modes-brainstorm.md)
- [CLAUDE.md](../../../CLAUDE.md) — project conventions and Zustand patterns
