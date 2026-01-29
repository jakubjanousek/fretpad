# Technical Improvements: Preparing for AI-Driven Development

## Goals

1. **Smaller, focused files** — minimize context window usage when Claude Code works on the codebase
2. **Automated safeguards** — catch breakage automatically since code won't be human-reviewed

Each step is independently shippable. Verify after each with `pnpm validate && pnpm build`.

---

## Step 1: Validation Scripts + Pre-push Hook

- [x] `package.json` — add `"type-check": "tsc --noEmit"` and `"validate": "biome check && tsc --noEmit && vitest run"`
- [x] Add `husky` dev dependency, run `npx husky init`
- [x] `.husky/pre-push` — runs `pnpm validate && pnpm build` before every push
- [x] Update `CLAUDE.md` — document `pnpm validate` as the command to run after changes

---

## Step 2: Split Zustand Store into Slices

`state/useAppStore.ts` is 421 lines with 30+ properties and 20+ actions covering unrelated concerns. Every component interaction requires this entire file in context.

- [x] `state/slices/progressionSlice.ts` (~120 lines) — progression, currentBar/ChordIndex, currentChord, bar CRUD, advanceToNextChord
- [x] `state/slices/playbackSlice.ts` (~40 lines) — tempo, isPlaying, selectedStyle
- [x] `state/slices/metronomeSlice.ts` (~35 lines) — metronome config
- [x] `state/slices/backingTrackSlice.ts` (~30 lines) — bass/chord volume and mute
- [x] `state/slices/displaySlice.ts` (~35 lines) — showScaleTones, showVoiceLeading, noteLabelMode, previewScale
- [x] `state/slices/errorSlice.ts` (~20 lines) — error state
- [x] `state/selectors.ts` — common selector hooks (`useProgression()`, `useTempo()`, etc.) to replace repetitive `useAppStore((s) => s.X)` calls
- [x] `state/useAppStore.ts` — rewrite to ~30-line combiner with persist middleware

All existing imports of `useAppStore` continue to work unchanged.

---

## Step 3: Split `lib/persistence.ts` (562 lines) into Focused Modules

- [x] `lib/persistence/localStorage.ts` (~65 lines) — save/load/clear + type guards
- [x] `lib/persistence/urlState.ts` (~65 lines) — URL encode/decode, share URL generation
- [x] `lib/persistence/customPresets.ts` (~65 lines) — custom & recent preset storage
- [x] `lib/persistence/practiceStats.ts` (~100 lines) — session recording, streak calculation
- [x] `lib/persistence/index.ts` — barrel re-export for backward compatibility
- [x] Delete `lib/persistence.ts` (replaced by directory)

---

## Step 4: Split `lib/theory/progression.ts` (497 lines) — Separate Data from Logic

- [ ] `lib/theory/progression.ts` (~120 lines) — keep parsing logic only (parseBar, parseProgression, createProgression)
- [ ] `lib/theory/presets.ts` (~200 lines) — PRESET_PROGRESSIONS data, PRESET_METADATA, category helpers
- [ ] Update imports in ~4 files that reference preset data

---

## Step 5: Extract Shared Transport Hook

`TransportBar.tsx` and `TransportControls.tsx` duplicate audio control logic (play/stop, tempo, audio engine integration).

- [ ] `hooks/useTransportControls.ts` (~60 lines) — shared audio control callbacks
- [ ] Simplify `TransportBar.tsx` (288 → ~180 lines, pure layout)
- [ ] Simplify `TransportControls.tsx` (449 → ~320 lines)

---

## Step 6: Split TransportControls into Sub-components

- [ ] `components/transport/MetronomeControls.tsx` (~70 lines) — volume slider, count-in
- [ ] `components/transport/BackingTrackControls.tsx` (~100 lines) — bass/chord volume + mute toggles
- [ ] `TransportControls.tsx` becomes a ~180-line compositor

---

## Step 7: Add Tests for New Modules

**Store slice tests:**
- [ ] `__tests__/state/progressionSlice.test.ts` — position resets, preset loading, bar CRUD, chord advancement
- [ ] `__tests__/state/playbackSlice.test.ts` — tempo clamping, style selection
- [ ] `__tests__/state/metronomeSlice.test.ts` — volume clamping, count-in
- [ ] `__tests__/state/backingTrackSlice.test.ts` — volume clamping, mute toggles

**Persistence tests:**
- [ ] `__tests__/lib/persistence/urlState.test.ts` — encode/decode roundtrip, invalid input
- [ ] `__tests__/lib/persistence/customPresets.test.ts` — save/load roundtrip
- [ ] `__tests__/lib/persistence/practiceStats.test.ts` — streak calculation, session recording
