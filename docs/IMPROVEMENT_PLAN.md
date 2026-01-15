# FretFlow – Improvement Plan

This document outlines improvements that can be implemented to enhance FretFlow beyond the current MVP.

---

## Priority Levels

- **P0** – Critical for production readiness
- **P1** – High value, should be done soon
- **P2** – Medium value, nice to have
- **P3** – Low priority, future consideration

---

## 1. Code Quality & Technical Debt

### 1.1 Add Test Suite (P0) ✅ PARTIALLY COMPLETE

Vitest and testing utilities have been set up with comprehensive unit tests.

**Completed:**
- [x] Install Vitest and testing utilities (`@testing-library/react`)
- [x] Add unit tests for `lib/theory/chords.ts` (chord parsing, guide tones) - 46 tests
- [x] Add unit tests for `lib/theory/scales.ts` (scale suggestions) - 19 tests
- [x] Add unit tests for `lib/theory/progression.ts` (progression parsing) - 33 tests
- [x] Add unit tests for `lib/fretboard.ts` (note mapping, fret calculations) - 31 tests

**Remaining Tasks:**
- [ ] Add component tests for `Fretboard`, `ProgressionEditor`, `TransportControls`
- [ ] Add integration test for full user flow (load preset → play → stop)
- [ ] Configure CI to run tests on PR

**Files created:**
```
__tests__/
  lib/
    theory/
      chords.test.ts
      scales.test.ts
      progression.test.ts
    fretboard.test.ts
  setup.ts
vitest.config.ts
```

### 1.2 Improve Error Handling (P0) ✅ PARTIALLY COMPLETE

Custom error types and Error Boundary have been added.

**Completed:**
- [x] Create custom error types in `lib/errors.ts` (e.g., `ChordParseError`, `ProgressionParseError`)
- [x] Add React Error Boundary component wrapping main sections
- [x] Add error states to Zustand store

**Remaining Tasks:**
- [ ] Show toast notifications for recoverable errors
- [ ] Improve inline validation messages in `ProgressionEditor`

### 1.3 Improve ID Generation (P1) ✅ COMPLETE

Replaced `Math.random().toString(36).substring(2, 9)` with `crypto.randomUUID()`.

**Completed:**
- [x] Created `lib/id.ts` with `generateId()` using `crypto.randomUUID()`
- [x] Update `lib/theory/progression.ts` to use new ID generator
- [x] Update `state/useAppStore.ts` `addBar` function

### 1.4 Optimize Audio Engine (P1) ✅ COMPLETE

The `useAudioEngine` hook has been fully optimized.

**Completed:**
- [x] Move synth creation to a `useRef` to prevent recreation on each render
- [x] Add proper cleanup for scheduled events on progression change
- [x] Proper instrument disposal on style change
- [x] Memoize event scheduling to prevent duplicate schedules
- [x] Add audio context state management (suspended/running)
- [x] Handle edge case: style change during playback gracefully

### 1.5 Add TypeScript Strict Checks (P2) ✅ PARTIALLY COMPLETE

Enabled stricter TypeScript checks for better type safety.

**Completed:**
- [x] Enable `noUncheckedIndexedAccess` in tsconfig
- [x] Fix any resulting type errors

**Remaining Tasks:**
- [ ] Add explicit return types to all exported functions

---

## 2. User Experience Improvements

### 2.1 Visual Playhead Indicator (P0) ✅ COMPLETE

Users can't see where they are in the progression during playback.

**Tasks:**
- [x] Add visual playhead/cursor that moves during playback
- [x] Highlight the currently playing bar in `ProgressionEditor`
- [x] Add beat indicator within bars (show sub-beat progress)
- [x] Consider adding a progress bar above the fretboard

**Files created/modified:**
```
hooks/usePlaybackPosition.ts     # Real-time position tracking via requestAnimationFrame
components/transport/ProgressBar.tsx  # Overall progression progress bar
components/progression/ProgressionEditor.tsx  # Bar highlighting + playhead
app/page.tsx  # ProgressBar integration
```

### 2.2 Keyboard Shortcuts (P1) ✅ COMPLETE

Add keyboard navigation for common actions.

**Completed:**
- [x] `Space` – Play/Stop toggle
- [x] `↑` / `↓` – Adjust tempo by 5 BPM
- [x] `R` – Reset to beginning
- [x] `M` – Toggle metronome
- [x] `1-3` – Select preset
- [x] Add keyboard shortcut hints in UI (tooltips + collapsible section)
- [x] Create `hooks/useKeyboardShortcuts.ts`

**Remaining Tasks:**
- [ ] `←` / `→` – Navigate between chords (requires additional state management)

**Files created/modified:**
```
hooks/useKeyboardShortcuts.ts           # Keyboard event handling hook
components/transport/TransportControls.tsx  # Tooltips + shortcuts hint section
```

### 2.3 Improved Chord Editing UX (P1)

The current text-based chord entry could be more intuitive.

**Tasks:**
- [ ] Add autocomplete/suggestions as user types chord symbols
- [ ] Add chord picker dropdown with common chords organized by quality
- [ ] Support drag-and-drop reordering of bars
- [ ] Add "duplicate bar" button
- [ ] Add undo/redo support for progression edits

### 2.4 Mobile Experience (P2)

While the app is responsive, mobile UX could be improved.

**Tasks:**
- [ ] Add touch-friendly fretboard interaction (tap instead of hover)
- [ ] Increase tap target sizes for mobile
- [ ] Add swipe gestures for chord navigation
- [ ] Consider landscape-only mode for fretboard view
- [ ] Test and fix any overflow issues on small screens

### 2.5 Accessibility Improvements (P2)

Enhance accessibility beyond what shadcn/ui provides.

**Tasks:**
- [ ] Add screen reader announcements for chord changes during playback
- [ ] Ensure all interactive elements have proper focus states
- [ ] Add skip links for keyboard navigation
- [ ] Test with VoiceOver/NVDA and fix issues
- [ ] Add reduced motion support for animations

---

## 3. Feature Additions

### 3.1 Metronome (P0) ✅ COMPLETE

Add optional metronome click during playback.

**Completed:**
- [x] Add metronome toggle in `TransportControls`
- [x] Implement metronome sound in `useAudioEngine` (sine wave clicks with accented downbeat)
- [x] Add volume control for metronome (-20 to 0 dB)
- [x] Add count-in option (0, 1, or 2 bars before loop starts)
- [x] Store metronome preference in Zustand state

**Files created/modified:**
```
lib/types.ts                          # MetronomeConfig type
lib/audio/instruments/metronomeInstrument.ts  # Metronome synth factory
lib/audio/instruments/index.ts        # Export metronome instrument
lib/audio/scheduler.ts                # scheduleMetronome, scheduleCountIn functions
hooks/useAudioEngine.ts               # Metronome integration with count-in support
state/useAppStore.ts                  # Metronome state and actions
components/transport/TransportControls.tsx  # Metronome toggle, volume slider, count-in selector
```

### 3.2 Richer Backing Track (P1) ✅ COMPLETE

iReal-style backing track system with selectable styles.

**Completed:**
- [x] Implement chord voicing playback (shell voicings, triads)
- [x] Add walking bass line with approach notes
- [x] Add style selector (Jazz Swing, Pop/Rock)
- [x] Pattern-based scheduling system
- [x] Swing feel per style (via Tone.js Transport)

**Remaining Tasks:**
- [x] Add volume controls (separate sliders for bass and chords)
- [x] Add mute toggles (mute bass or chords independently)
- [x] Add count-in option (1-2 bar count before loop starts) - Implemented via metronome count-in

**Additional Styles (Phase 2):** ✅ COMPLETE
- [x] Add Bossa Nova style (syncopated bass + fingerpicked guitar)
- [x] Add Ballad style (slow arpeggiated chords + sustained bass)

**Sound Quality Improvements:**
- [ ] Use Tone.js Sampler with real instrument samples for more realistic sound
- [ ] Add subtle reverb/effects on chords for depth

**Advanced Features:**
- [ ] Add metronome/drum pattern option
- [ ] Add swing control slider (let users adjust swing 0-100%)
- [ ] Add pattern variation (randomize velocity/timing slightly for human feel)
- [ ] Better jazz voicings (rootless voicings, drop-2)

**Files created/modified:**
```
lib/audio/
  styles/
    index.ts           # Style registry
    jazzSwing.ts       # Jazz Swing style
    popRock.ts         # Pop/Rock style
    bossaNova.ts       # Bossa Nova style
    ballad.ts          # Ballad style
  instruments/
    index.ts
    bassInstrument.ts  # Bass synth factory
    chordInstrument.ts # Chord polySynth factory
  scheduler.ts         # Pattern-based scheduling
  voicings.ts          # Chord voicing generator
lib/types.ts           # Added BackingTrackConfig type
state/useAppStore.ts   # Added backingTrack state and actions
hooks/useAudioEngine.ts # Added dynamic volume/mute control
components/transport/
  StyleSelector.tsx    # Style dropdown UI
  TransportControls.tsx # Added bass/chord volume sliders and mute toggles
```

### 3.3 Persistence (P1) ✅ COMPLETE

State persistence and sharing functionality.

**Completed:**
- [x] Save current progression to localStorage on change (via Zustand persist middleware)
- [x] Load saved progression on app mount (automatic via Zustand persist)
- [x] Add "Copy Link" button that generates shareable URL (base64 encoded state)
- [x] Load from URL functionality (URL state takes priority over localStorage)
- [x] Add "Copy Text" export to text format (e.g., `| Dm7 | G7 | Cmaj7 |`)

**Files created/modified:**
```
lib/persistence.ts                     # Persistence utilities (encode/decode, localStorage, URL)
hooks/useUrlState.ts                   # Hook to load state from URL on mount
components/progression/ShareExport.tsx # Copy Link and Copy Text buttons
state/useAppStore.ts                   # Added Zustand persist middleware
app/page.tsx                           # Integrated ShareExport and useUrlState
```

### 3.4 Scale Tone Toggle (P1)

Scale tones are implemented but not exposed in UI.

**Tasks:**
- [ ] Add "Show Scale Tones" toggle in settings or fretboard legend
- [ ] Allow selecting which scale to display (from suggested scales)
- [ ] Update fretboard to show scale tones in gray when enabled
- [ ] Store preference in Zustand

### 3.5 More Presets (P2) ✅ COMPLETE

Expanded the preset library with 16 presets organized by category.

**Completed:**
- [x] Add jazz standards: Autumn Leaves changes, Rhythm changes (A section), All The Things You Are
- [x] Add pop progressions: vi-IV-I-V, I-vi-IV-V, I-IV-V-IV
- [x] Add blues variations: minor blues, jazz blues, 8-bar blues
- [x] Add modal vamps: Dorian (Dm7), Mixolydian (G7), Phrygian (Em), Lydian (Fmaj7)
- [x] Organize presets by category in UI (collapsible sections)
- [x] Allow users to save custom presets (up to 10, stored in localStorage)

**Files created/modified:**
```
lib/theory/progression.ts          # 16 presets with metadata, categories, getPresetsByCategory()
lib/persistence.ts                 # CustomPreset type, save/load functions
hooks/useCustomPresets.ts          # Hook for managing custom presets (NEW)
components/progression/ProgressionPresets.tsx  # Categorized UI with save/delete
components/ui/collapsible.tsx      # shadcn collapsible component (NEW)
```

### 3.6 Alternate Tunings (P2)

Support different guitar tunings.

**Tasks:**
- [ ] Add tuning selector dropdown
- [ ] Implement common tunings: Drop D, DADGAD, Open G, Open D, Half-step down
- [ ] Update `lib/fretboard.ts` to accept tuning parameter
- [ ] Recalculate fret notes when tuning changes
- [ ] Store selected tuning in state
- [ ] Show current tuning in fretboard header

### 3.7 Left-Handed Mode (P2)

Mirror the fretboard for left-handed players.

**Tasks:**
- [ ] Add left-handed toggle in settings
- [ ] Mirror fretboard rendering (flip strings)
- [ ] Store preference in state/localStorage

### 3.8 Note Label Options (P2) ✅ COMPLETE

Let users choose what's displayed on fret markers.

**Completed:**
- [x] Add display mode selector: Note Names | Intervals | None
- [x] Update `FretMarker` component to respect setting
- [x] Store preference in state (persisted to localStorage)

**Files created/modified:**
```
lib/types.ts                         # Added NoteLabelMode type
state/useAppStore.ts                 # Added noteLabelMode state and setNoteLabelMode action
components/fretboard/FretMarker.tsx  # Accept labelMode prop, display based on mode
components/fretboard/Fretboard.tsx   # Added label mode selector UI, pass mode to FretMarker
app/page.tsx                         # Wire up noteLabelMode from store to Fretboard
```

### 3.9 Voice Leading Visualization (P3) ✅ COMPLETE

Help users see smooth voice leading between chords.

**Completed:**
- [x] Add "Voice Leading" toggle/mode
- [x] Draw arrows/lines connecting guide tones between consecutive chords
- [x] Highlight common tones between chords (green dashed circles)
- [x] Show resolution paths (e.g., 7th resolving down to 3rd) with orange arrows

**Files created/modified:**
```
lib/theory/voiceLeading.ts              # Voice leading calculation utilities
components/fretboard/VoiceLeadingOverlay.tsx  # SVG overlay for voice leading paths
components/fretboard/Fretboard.tsx      # Integrated overlay support
state/useAppStore.ts                    # Added showVoiceLeading state
app/page.tsx                            # Added Voice Leading toggle button
```

### 3.10 Time Signature Support (P3)

Support time signatures beyond 4/4.

**Tasks:**
- [ ] Add time signature selector (3/4, 4/4, 6/8, 5/4)
- [ ] Update playback engine to handle different time signatures
- [ ] Update bar visualization to reflect different beat counts
- [ ] Adjust metronome accent patterns

### 3.11 Swing/Shuffle Feel (P3) ✅ PARTIALLY COMPLETE

Add rhythmic feel options.

**Completed:**
- [x] Implement swing using Tone.js Transport swing settings (per style)
- [x] Jazz Swing style has swing=0.5, Pop/Rock has swing=0

**Remaining Tasks:**
- [ ] Add user-adjustable swing slider (override style default)
- [ ] Add more feel options: Light Swing, Heavy Swing, Shuffle
- [ ] Consider adding Latin feel options (straight 8ths with accents)

---

## 4. Performance Optimizations

### 4.1 Component Memoization (P2)

Prevent unnecessary re-renders.

**Tasks:**
- [ ] Wrap `FretMarker` in `React.memo()` with custom comparison
- [ ] Memoize `BarInput` components in `ProgressionEditor`
- [ ] Use `useMemo` for derived fretboard data
- [ ] Profile with React DevTools and fix hotspots

### 4.2 Code Splitting (P3)

Reduce initial bundle size.

**Tasks:**
- [ ] Lazy load Tone.js (only when playback is initiated)
- [ ] Split settings/preferences into separate chunk
- [ ] Analyze bundle with `@next/bundle-analyzer`

---

## 5. Documentation

### 5.1 Code Documentation (P2)

Add documentation for complex logic.

**Tasks:**
- [ ] Add JSDoc comments to all exported functions in `lib/`
- [ ] Document the chord parsing algorithm in `chords.ts`
- [ ] Document the fretboard mapping logic
- [ ] Add README section on architecture

### 5.2 User Documentation (P3)

Help users understand the tool.

**Tasks:**
- [ ] Add "How to Use" modal/tooltip for first-time users
- [ ] Document chord symbol format (what's supported)
- [ ] Add music theory glossary (guide tones, intervals, etc.)

---

## 6. Infrastructure

### 6.1 CI/CD Pipeline (P1)

Automate quality checks.

**Tasks:**
- [ ] Set up GitHub Actions workflow
- [ ] Run `pnpm lint` on PR
- [ ] Run `pnpm build` to catch type errors
- [ ] Run tests (once added)
- [ ] Add status badges to README

### 6.2 Analytics (P3)

Understand how users use the app.

**Tasks:**
- [ ] Add privacy-respecting analytics (Plausible or similar)
- [ ] Track: presets used, tempo range, session duration
- [ ] Do not track: specific chord progressions (privacy)

---

## Implementation Order Recommendation

For maximum impact, implement in this order:

### Phase 1 – Production Ready
1. ~~Visual Playhead Indicator (2.1)~~ ✅ Complete
2. ~~Metronome (3.1)~~ ✅ Complete
3. Add Test Suite (1.1)
4. Improve Error Handling (1.2)

### Phase 2 – Enhanced UX
5. ~~Keyboard Shortcuts (2.2)~~ ✅ Complete
6. ~~Persistence (3.3)~~ ✅ Complete
7. Scale Tone Toggle (3.4)
8. CI/CD Pipeline (6.1)

### Phase 3 – Rich Features
9. ~~Richer Backing Track (3.2)~~ ✅ Core complete, enhancements remain
10. ~~More Presets (3.5)~~ ✅ Complete
11. Improved Chord Editing UX (2.3)
12. ~~Optimize Audio Engine (1.4)~~ ✅ Partially complete

### Phase 4 – Polish
13. Alternate Tunings (3.6)
14. Left-Handed Mode (3.7)
15. ~~Note Label Options (3.8)~~ ✅ Complete
16. Mobile Experience (2.4)

### Phase 5 – Advanced
17. ~~Voice Leading Visualization (3.9)~~ ✅ Complete
18. Time Signature Support (3.10)
19. ~~Swing/Shuffle Feel (3.11)~~ ✅ Basic swing per style, user control remains
20. Component Memoization (4.1)

---

## Notes

- Each section includes checkboxes for tracking progress
- Prioritization (P0-P3) is a suggestion and can be adjusted based on user feedback
- Some features may have dependencies (e.g., tests before CI, persistence before sharing)
- Always run `pnpm lint` and `pnpm build` before committing changes
