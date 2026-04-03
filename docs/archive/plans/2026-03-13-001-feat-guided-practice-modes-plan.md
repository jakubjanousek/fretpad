---
title: "feat: Guided Practice Modes with Launcher, Challenges, and Landing Page"
type: feat
status: active
date: 2026-03-13
origin: docs/brainstorms/2026-03-13-guided-practice-modes-brainstorm.md
---

# Guided Practice Modes with Launcher, Challenges, and Landing Page

## Overview

Repackage FretPad's existing feature surface into 3 opinionated guided practice modes accessed via a launcher, add key-based structured challenges for retention, and build a landing page for organic discovery. The goal is to make FretPad useful for hundreds of guitarists, not just the developer.

The core insight: **FretPad has a packaging problem, not a feature gap.** The app organizes around capabilities (voicings, overlays, quiz, theory) instead of practice goals (learn the neck, outline changes, comp). New users land on a dense single-page editor with all controls visible and no task framing.

(see brainstorm: [docs/brainstorms/2026-03-13-guided-practice-modes-brainstorm.md](../brainstorms/2026-03-13-guided-practice-modes-brainstorm.md))

## Problem Statement

1. **No task framing.** Users see everything at once with no guidance on what to practice.
2. **Organized around features, not jobs.** V-System voicings, CAGED, target notes, quiz, planner, and stats are all accessible but not packaged into workflows.
3. **Passive retention.** Stats track time and streaks but don't drive goals or structured practice.
4. **No front door.** The app loads directly into the full editor — there's no landing page, no SEO, no way for guitarists to discover it.

## Proposed Solution

### Architecture Change

- **`/`** — Launcher page ("What do you want to practice today?") + landing page for SEO
- **`/practice/[mode]`** — Mode-constrained practice view with 3 slugs:
  - `/practice/learn-the-neck`
  - `/practice/outline-chord-changes`
  - `/practice/comp-with-voicings`
- **Auto-resume:** Returning users skip the launcher via `localStorage` `fretpad-last-mode` key
- **Full editor access:** A 4th implicit option or escape hatch from within any mode

### The Three Modes

#### 1. Learn the Neck (`learn-the-neck`)

**Job:** Build fretboard familiarity — know where notes and intervals are.

| Feature | Visible | Hidden |
|---------|---------|--------|
| Fretboard overlays (pentatonic, blues, 3NPS, CAGED) | Yes | — |
| Note labels (notes/degrees) | Yes | — |
| Chord tone quiz | Yes (prominent) | — |
| Backing track + transport | Yes | — |
| Target notes / approaches | — | Yes |
| Voicings / V-System | — | Yes |
| Theory panel | Chord Info tab only | Modes, Subs, Analysis |
| Session planner | — | Yes |

**Default preset:** `"Dorian Vamp (Dm7)"` — static harmony, easy to hear chord tones.
**Success metric:** Quiz accuracy, notes identified per session.

#### 2. Outline Chord Changes (`outline-chord-changes`)

**Job:** Practice hearing and visualizing chord tones as changes go by.

| Feature | Visible | Hidden |
|---------|---------|--------|
| Target notes + approaches (chromatic, diatonic, enclosures) | Yes | — |
| Guide tone highlighting | Yes | — |
| Backing track + transport | Yes | — |
| Theory panel (Chord Info + Analysis) | Yes | — |
| Fretboard overlays (pentatonic, blues, 3NPS) | — | Yes |
| CAGED positions | — | Yes |
| Voicings / V-System | — | Yes |
| Chord tone quiz | — | Yes |
| Session planner | — | Yes |

**Default preset:** `"ii-V-I in C"` — the fundamental jazz change.
**Success metric:** Time spent practicing over changes. Future: target notes hit via audio input.

#### 3. Comp with Voicings (`comp-with-voicings`)

**Job:** Practice comping with good voice leading through a progression.

| Feature | Visible | Hidden |
|---------|---------|--------|
| V-System voicings + voice leading | Yes | — |
| Voicing types + difficulty filter | Yes | — |
| Backing track + transport | Yes | — |
| Theory panel (Chord Info + Subs) | Yes | — |
| Scale overlays | — | Yes |
| Target notes / approaches | — | Yes |
| Chord tone quiz | — | Yes |
| CAGED positions | — | Yes |
| Session planner | — | Yes |

**Default preset:** `"ii-V-I in C"`.
**Success metric:** Voicings explored, progressions practiced.

### ModeConfig Type

A single configuration object drives all constraint logic:

```typescript
// lib/types.ts

type ModeId = "learn-the-neck" | "outline-chord-changes" | "comp-with-voicings";

interface ModeConfig {
  id: ModeId;
  label: string;
  description: string;
  slug: string;
  defaultPreset: string;
  defaultTempo: number;
  defaultStyle: string;

  // Display constraints — which controls are visible
  showOverlayDropdown: boolean;
  showLabels: boolean;
  showVoicingsButton: boolean;
  showLayersDropdown: boolean;
  showTargetsDropdown: boolean;
  showQuiz: boolean;
  showCAGED: boolean;
  theoryTabs: string[]; // which theory tabs to show

  // Forced display state on mode entry
  forcedState: Partial<DisplaySlice>;
}
```

### Mode Activation Strategy

On entering a mode:

1. Apply `forcedState` overrides to the display slice (same pattern as `sessionPlannerSlice.startSession()` calling `setTempo`, `setSelectedStyle`, `loadPreset`)
2. Store `activeMode` in a new `practiceModeSlice`
3. Write `fretpad-last-mode` to localStorage
4. **Do NOT save prior state for restoration** — keep it simple, YAGNI. Users in guided modes use mode defaults. Power users use the full editor.

On switching modes: stop playback, end any active quiz, apply new mode's `forcedState`.

### Progression Editor in Modes

The full `ProgressionEditor` (add/remove bar, undo/redo, presets, transpose) remains visible in all modes. Users should be able to change what they practice over — the mode constrains *how* they practice, not *what*.

### URL Sharing

Shared URLs (`?p=...`) gain an optional `&mode=` parameter. When a recipient opens a mode-aware URL:
- Route to `/practice/[mode]?p=...`
- If no mode in URL, route to `/practice/outline-chord-changes` as default (most common use case)

Update `generateShareUrl` in `lib/urlState.ts` and `useUrlState` hook to support the new routing.

### Session Planner

**Hide in all guided modes.** The session planner conflicts with mode constraints (it unconditionally calls `loadPreset`, `setTempo`, `setSelectedStyle`). Guided modes replace the session planner's purpose — structured practice. Keep the planner accessible only from the full editor (if one exists) or remove it entirely.

## Technical Considerations

### Routing

- Move current `app/page.tsx` content to `app/practice/[mode]/page.tsx`
- Create new `app/page.tsx` as the launcher (can be a server component with client interactivity)
- Add `app/practice/layout.tsx` for shared practice chrome (transport bar, mode header)
- Validate `mode` param against `ModeId` union — redirect invalid slugs to launcher
- Move `useUrlState`, `useSessionTimer`, `usePracticeTracker` hooks to practice layout/page

### State

- **New slice: `practiceModeSlice.ts`** — `activeMode: ModeId | null`, `enterMode(id)`, `exitMode()`
- **Extend `PracticeSession`** in `lib/persistence/practiceStats.ts` with `mode?: ModeId` field (backward compatible — old sessions have no mode)
- **Quiz cleanup on mode switch:** `enterMode()` calls `endQuiz()` if `quizActive` is true
- **Playback stop on mode switch:** `enterMode()` calls `stop()` if `isPlaying` is true

### Auto-Resume Redirect

On launcher mount:
1. Read `fretpad-last-mode` from localStorage
2. If set, show launcher briefly (200-300ms) then navigate to `/practice/[mode]`
3. Show a subtle "Continue: [mode name]" card at top of launcher so the redirect feels intentional, not broken
4. User can click a different mode or "Start fresh" to clear the auto-resume

Avoid a flash: use `router.replace()` (not `push`) so the launcher doesn't stay in the navigation stack.

### PWA Back Navigation

Use `router.replace()` for the auto-resume redirect so back-button from practice goes to the launcher's *previous* page (or nowhere for PWA), not back to the launcher in a loop.

### Performance

No significant performance concerns — this is a routing and UI restructure, not a new computation. The Zustand store, Tone.js audio engine, and fretboard rendering are unchanged.

## System-Wide Impact

- **Interaction graph:** Mode entry → calls `enterMode()` → sets display slice flags + loads preset + sets tempo/style → triggers fretboard re-render with constrained controls. No new side effects beyond existing store actions.
- **Error propagation:** Invalid mode slug → redirect to launcher. No new error types needed.
- **State lifecycle risks:** Mode switch mid-playback could leave Tone.js in a playing state if not explicitly stopped. `enterMode()` must call `stop()`.
- **API surface parity:** URL sharing needs mode awareness. `generateShareUrl` and `useUrlState` both need updates.
- **Integration test scenarios:**
  1. User enters mode → only allowed controls render → plays audio → switches mode → playback stops, new constraints apply
  2. User shares URL from mode → recipient opens → lands in correct mode with correct progression
  3. Returning user → auto-resumes last mode → back button doesn't loop
  4. User completes quiz in Learn the Neck → switches to Outline Changes → quiz state is cleared

---

## Implementation Phases

### Phase 1: Mode System + Launcher (Foundation)

**Deliverables:**
- `ModeConfig` type and 3 mode configurations in `lib/modes.ts`
- `practiceModeSlice.ts` in `state/slices/`
- Launcher page at `app/page.tsx`
- Practice page at `app/practice/[mode]/page.tsx` with mode-based UI constraints
- Auto-resume logic with `fretpad-last-mode` localStorage
- Updated `DisplayToolbar` to accept mode constraints
- `PracticeSession` extended with `mode` field

**Key files to create:**
- `app/page.tsx` (new launcher)
- `app/practice/[mode]/page.tsx` (practice view, extracted from current `app/page.tsx`)
- `app/practice/layout.tsx` (shared practice layout)
- `lib/modes.ts` (mode configs)
- `state/slices/practiceModeSlice.ts`
- `components/modes/Launcher.tsx`
- `components/modes/ModeHeader.tsx` (shows current mode + switch button)

**Key files to modify:**
- `state/useAppStore.ts` (add mode slice)
- `components/fretboard/DisplayToolbar.tsx` (mode-aware rendering)
- `components/fretboard/Fretboard.tsx` (accept mode prop alongside quizMode)
- `lib/persistence/practiceStats.ts` (add mode to PracticeSession)
- `hooks/usePracticeTracker.ts` (pass active mode to stats)
- `lib/types.ts` (ModeId, ModeConfig types)

**Acceptance criteria:**
- [x] Launcher renders at `/` with 3 mode cards
- [x] Each mode routes to `/practice/[mode]` with correct slug
- [x] Mode-specific UI constraints apply (correct controls shown/hidden per mode)
- [x] Default preset, tempo, and style load on mode entry
- [x] Quiz state clears on mode switch
- [x] Playback stops on mode switch
- [x] `fretpad-last-mode` persisted and auto-resume works
- [x] Auto-resume uses `router.replace()` to avoid back-button loop
- [x] Invalid mode slug redirects to launcher
- [x] Practice stats record which mode was active
- [x] Full progression editor available in all modes
- [x] `pnpm validate` passes

### Phase 2: Landing Page + SEO

**Deliverables:**
- Landing page content integrated into the launcher at `/`
- SEO metadata (title, description, Open Graph, structured data)
- Responsive design for the launcher (mobile-first)

**Key files to create/modify:**
- `app/page.tsx` (enhance launcher with landing page content)
- `app/layout.tsx` (update metadata for SEO)
- `components/modes/FeatureShowcase.tsx` (visual selling points)

**Acceptance criteria:**
- [x] Landing page has clear value prop: "See the right notes while hearing the chords"
- [x] 3 mode cards serve as both launcher and feature showcase
- [x] Proper `<title>`, `<meta description>`, Open Graph tags
- [x] Mobile layout: stacked mode cards, no horizontal scroll
- [x] Page loads fast (no heavy JS on the launcher — defer Tone.js to practice pages)
- [x] `pnpm validate` passes

### Phase 3: Structured Challenges

**Deliverables:**
- Challenge data model and storage
- Challenge UI per mode (visible in practice view)
- Key-based challenge rotation
- Challenge completion tracking

**Key files to create:**
- `lib/challenges/types.ts` (challenge schema)
- `lib/challenges/challenges.ts` (challenge definitions)
- `lib/challenges/storage.ts` (localStorage persistence)
- `components/challenges/ChallengeCard.tsx`
- `components/challenges/ChallengeProgress.tsx`

**Challenge schema:**

```typescript
// lib/challenges/types.ts

interface Challenge {
  id: string;
  mode: ModeId;
  title: string;         // "ii-V-I in 3 keys"
  description: string;
  criterion: ChallengeCriterion;
}

type ChallengeCriterion =
  | { type: "keys"; count: number; preset: string }           // Practice preset in N different keys
  | { type: "quiz-accuracy"; threshold: number; count: number } // Score N% on M quizzes
  | { type: "voicings-explored"; count: number }               // Explore N voicings
  | { type: "practice-time"; minutes: number }                 // Practice for N minutes in mode

interface ChallengeProgress {
  challengeId: string;
  completedKeys?: string[];   // for key-based
  quizScores?: number[];      // for quiz-based
  voicingsExplored?: number;  // for voicing-based
  minutesPracticed?: number;  // for time-based
  completedAt?: string;       // ISO date when fully completed
}
```

**Challenge examples per mode:**

| Mode | Challenge | Criterion |
|------|-----------|-----------|
| Learn the Neck | "Identify chord tones: 80% accuracy" | `quiz-accuracy: 80%, 3 quizzes` |
| Learn the Neck | "Pentatonic in 4 positions" | `keys: 4, pentatonic preset` |
| Outline Changes | "ii-V-I in 4 keys" | `keys: 4, ii-V-I preset` |
| Outline Changes | "Practice 15 minutes over changes" | `practice-time: 15` |
| Comp with Voicings | "Explore 10 voicings" | `voicings-explored: 10` |
| Comp with Voicings | "Comp through ii-V-I in 3 keys" | `keys: 3, ii-V-I preset` |

**Rotation:** Static challenge sets per mode. No weekly rotation initially — users see all challenges for their current mode and work through them at their own pace. Weekly rotation is a future enhancement.

**Passive tracking:** Practice time and key changes count toward challenge progress automatically, even without explicitly "starting" a challenge. This rewards consistent practice.

**Acceptance criteria:**
- [ ] Challenge data model defined with types for each criterion
- [ ] 2-3 challenges per mode (6-9 total)
- [ ] Challenge card visible in practice view showing current progress
- [ ] Progress persists in localStorage across sessions
- [ ] Challenge completion shows congratulation + next challenge
- [ ] Passive practice contributes to challenge progress
- [ ] `pnpm validate` passes

### Phase 4: Shareability + URL Updates

**Deliverables:**
- Mode-aware URL sharing (`?p=...&mode=...`)
- Updated `useUrlState` for new routing
- Share-to-forum/Discord friendly URLs

**Key files to modify:**
- `lib/urlState.ts` (add mode to URL params)
- `hooks/useUrlState.ts` (decode mode from URL on practice page)
- `components/progression/ShareButton.tsx` (generate mode-aware URLs)

**Acceptance criteria:**
- [ ] Shared URLs include mode parameter
- [ ] Recipients land on correct mode with correct progression
- [ ] URLs without mode default to `outline-chord-changes`
- [ ] Old URLs (pre-mode) still work (backward compatible)
- [ ] `pnpm validate` passes

---

## Success Metrics

| Metric | What It Tells You |
|--------|-------------------|
| First-session mode selection rate | Do new users pick a mode (vs bouncing)? |
| Mode distribution | Which mode is most popular? |
| Session duration per mode | Does constraining UI increase focus? |
| Challenge completion rate | Are challenges engaging? |
| Return rate (D1, D7) | Do guided modes drive repeat visits? |
| SEO impressions + clicks | Is the landing page attracting guitarists? |

Track with simple analytics (Plausible or PostHog) without compromising the no-account approach.

## Sources & References

### Origin

- **Brainstorm document:** [docs/brainstorms/2026-03-13-guided-practice-modes-brainstorm.md](../brainstorms/2026-03-13-guided-practice-modes-brainstorm.md) — Key decisions: 3 modes (Learn the Neck, Outline Changes, Comp with Voicings), separate routes, auto-resume last mode, key-based challenges, modes-first execution order.

### Internal References

- Session planner pattern (mode activation template): `state/slices/sessionPlannerSlice.ts:90-135`
- Quiz mode UI constraints (display hiding pattern): `components/fretboard/Fretboard.tsx:596-643`
- Store composition + persistence: `state/useAppStore.ts:40-100`
- Display toggles: `state/slices/displaySlice.ts`
- Practice stats persistence: `lib/persistence/practiceStats.ts`
- Preset definitions: `lib/theory/presets.ts:39-336`
- URL state: `lib/urlState.ts`, `hooks/useUrlState.ts`
- Current page (to be split): `app/page.tsx`
