# Music Theory Enhancements Roadmap

Four enhancement areas for FretFlow's music theory capabilities, ordered by priority.

**Current foundation:** 18 chord qualities, guide tone extraction, key detection with roman numerals, 5 substitution types, voice leading visualization, scale overlays (pentatonic minor/major, blues, 3NPS, CAGED).

---

## 1. Target Notes & Approach Patterns ✅ COMPLETED

**Priority:** Highest — most directly useful for improvisation practice.

**Status:** Implemented on 2026-02-04. Includes chord tone targeting, chromatic approaches, diatonic approaches, and enclosure patterns.

Target notes are "landing points" for improvisation — chord tones that provide melodic resolution. Approach patterns are chromatic/diatonic techniques to reach these targets with intentional motion.

### 1.1 Chord Tone Targeting Overlay

Highlight the strongest target notes (1, 3, 5, 7) during improvisation.

- `targetNoteMode`: `"none" | "chord-tones" | "guide-tones-only" | "strong-beats"`
- Primary targets (root, 3rd, 7th): pulsing glow animation
- Secondary targets (5th, extensions): steady highlight
- Tooltip: "Land here on beat 1/3"

**New files:**
- `lib/theory/targetNotes.ts` — target note identification and approach detection
- `components/fretboard/TargetNoteOverlay.tsx` — visual layer for animated target indicators

**Modified files:**
- `lib/types.ts` — add `TargetNoteMode`, `TargetStrength`, `ApproachType`
- `components/fretboard/Fretboard.tsx` — integrate target note overlay
- `state/slices/displaySlice.ts` — target note mode state

### 1.2 Chromatic Approach Notes

Show half-step approach notes (above/below) for each chord tone.

- Highlight notes 1 semitone from any chord tone
- Directional arrow overlays: ↗ ascending, ↘ descending
- Color: amber/yellow to distinguish from chord tones
- Filter: "Show approaches to guide tones only" to reduce clutter

### 1.3 Diatonic Approach Notes

Show scale-step approach notes within the active scale.

- Identify diatonic neighbors using `getScaleNotes()` from `lib/theory/scales.ts`
- Softer color (light blue) vs chromatic (amber)
- Works with any active scale overlay (Dorian, Mixolydian, etc.)

### 1.4 Enclosure Patterns

Visualize chromatic enclosures — approach from below + above simultaneously.

- Show note pairs that surround a target chord tone
- Example: (D♯ → E ← F) targeting E (3rd of Cmaj7)
- SVG bracket connectors similar to `VoiceLeadingOverlay.tsx`
- Click a chord tone to highlight its enclosures

**New files:**
- `components/fretboard/EnclosureOverlay.tsx` — SVG bracket layer

### Builds On

- `isChordTone()`, `isGuideTone()` from `lib/theory/chords.ts`
- `getScaleNotes()` from `lib/theory/scales.ts` for diatonic detection
- `FretNote` type (already has `isRoot`, `isChordTone`, `isGuideTone`, `isScaleTone`)
- `VoiceLeadingOverlay.tsx` pattern for SVG rendering

### UI/UX Notes

- Granular toggles to manage cognitive load: targets only → + chromatic → + diatonic → + enclosures
- Targets should be most prominent visually, approaches secondary
- Optionally pulse targets on downbeats during playback
- Simplify on mobile (color only, no directional arrows)

### Phases

1. Extend types, create `targetNotes.ts` with chord tone targeting logic
2. Chromatic approach detection and overlay component
3. Diatonic approach support with scale integration
4. Enclosure pattern detection and SVG overlay
5. Animations, tooltips, preferences

---

## 2. Arpeggio Shapes Overlay ✅ COMPLETED

**Priority:** High — builds directly on existing CAGED infrastructure.

**Status:** Implemented on 2026-02-04. Includes arpeggio shape detection per CAGED position, SVG connector lines showing arpeggio patterns, and position-focused display.

While scale overlays show horizontal patterns, arpeggio shapes reveal vertical chord structures across strings. This adds 1-3-5-7 visualization in CAGED positions.

### 2.1 Arpeggio Shape Detection

Calculate arpeggio patterns (chord tones only) for each CAGED position.

**New files:**
- `lib/theory/arpeggios.ts`
  - `getArpeggioShapes(chord, position?)` — arpeggio notes per CAGED position
  - `getArpeggioSequence(chord, position, direction)` — ordered for playback
  - `ARPEGGIO_FINGERING_PATTERNS` — suggested fingerings per shape

### 2.2 Visual Arpeggio Overlay

- Add `"arpeggio"` option to fretboard overlay menu (alongside Pentatonic, Blues, 3NPS)
- Show only chord tones (1-3-5-7) with CAGED position colors
- Degree numbering overlay: ①③⑤⑦
- SVG connector lines linking arpeggio notes in melodic order

**New files:**
- `components/fretboard/ArpeggioOverlay.tsx` — SVG paths and degree numbers

### 2.3 Cross-Chord Arpeggio Connections

- Show arpeggio "handoffs" between chord changes during playback
- Highlight common arpeggio tones (e.g., G shared by Cmaj7 and Em7)
- SVG paths for optimal arpeggio voice leading

Extends `lib/theory/voiceLeading.ts` with `getArpeggioTransitions()`.

### 2.4 Arpeggio Audio Preview

- Play arpeggio ascending + descending per CAGED position
- Tempo-synced with current BPM
- Visual note highlighting during playback

Extends `lib/audio/preview.ts` with `playArpeggioShape()`.

### Builds On

- CAGED position detection from `lib/theory/pentatonic.ts`
- `CAGED_POSITION_COLORS` from `lib/fretboard.ts`
- `VoiceLeadingOverlay.tsx` pattern for SVG connectors
- Audio preview system in `lib/audio/preview.ts`

### UI/UX Notes

- Arpeggio overlay should be cleaner than full scale view (fewer notes)
- CAGED position selector in legend becomes critical
- Arrow direction on SVG paths indicates ascending/descending
- Hide degree numbering on mobile, rely on color + lines

### Phases

1. Create `arpeggios.ts` with shape detection
2. Add "Arpeggio" overlay mode, filter to chord tones only
3. ArpeggioOverlay component with SVG connectors and degree labels
4. Cross-chord transitions via voice leading
5. Audio preview integration

---

## 3. Harmonic Analysis Depth ✅ COMPLETED

**Priority:** Medium — educational enhancement enriching existing key analysis.

**Status:** Implemented on 2026-02-04. Includes common progression pattern detection (ii-V-I, turnarounds, etc.), modal interchange/borrowed chord detection, secondary dominant detection, and tension scoring per bar.

Adds pattern recognition for common progressions, modal interchange detection, and tension/resolution mapping.

### 3.1 Common Progression Detection

Recognize and label standard patterns:

| Pattern | Example | Detection |
|---------|---------|-----------|
| ii-V-I | Dm7 → G7 → Cmaj7 | min7 → dom7 (P4 up) → maj7 (P4 up) |
| I-vi-IV-V | C → Am → F → G | Major tonic sequence |
| Turnaround | Cmaj7 → A7 → Dm7 → G7 | I → VI7 → ii → V |
| Backdoor ii-V | Fm7 → B♭7 → Cmaj7 | iv → ♭VII7 → I |
| Minor ii-V-i | Dm7♭5 → G7 → Cm | Half-dim → dom7 → min |
| Circle of fifths | Em → Am → Dm → G → C | Resolution chain by P5 |

**New files:**
- `lib/theory/progressionPatterns.ts` — pattern detection logic
- `components/theory/ProgressionAnalysisPanel.tsx` — UI panel

**Modified files:**
- `components/theory/ChordInfoSheet.tsx` — add "Progression Analysis" tab

### 3.2 Modal Interchange / Borrowed Chords

Detect chords borrowed from parallel keys.

- Common borrowed chords from parallel minor: ♭VII, ♭VI, ♭III, iv, ii°
- Badge on progression bar: "Borrowed from C minor"
- Explanation: "Adds darker, melancholic color"

Extends `lib/theory/keyDetection.ts` with `detectBorrowedChords()`.

### 3.3 Secondary Dominant Chains

Detect dominant 7th chords resolving by fifth.

- Chain: D7 → G7 → C = V7/V → V7 → I
- Visual: curved SVG arrows showing resolution paths on progression editor
- Tooltip: "D7 is V7/V — creates temporary key center on G"

**New files:**
- `components/progression/SecondaryDominantOverlay.tsx` — resolution arrows

### 3.4 Tension & Resolution Graph

Visualize harmonic tension flow across the progression.

- Tension score per bar: 0 (stable tonic) to 10 (peak tension)
- Factors: dominant function, tritone presence, non-diatonic notes, tonic distance
- Line chart with annotations: "Peak tension at bar 3 (V7), resolves bar 4 (I)"

**New files:**
- `lib/theory/tensionAnalysis.ts` — tension calculation
- `components/theory/TensionGraph.tsx` — line chart

### Builds On

- `keyDetection.ts` roman numeral analysis
- `getAllChordsFromProgression()` from `lib/theory/progression.ts`
- `DetectedKey` type and roman numeral system
- `ChordInfoSheet.tsx` tab structure

### UI/UX Notes

- Use collapsible sections to manage information density
- Show basic pattern label first, expand for explanation
- Educational tone: teach why, not just label what
- Tension graph simplified to bar chart on mobile

### Phases

1. Build `progressionPatterns.ts` with ii-V-I, I-vi-IV-V, blues detection
2. Create ProgressionAnalysisPanel, integrate with ChordInfoSheet
3. Add modal interchange detection
4. Secondary dominant chain detection and overlay
5. Tension analysis and graph visualization

---

## 4. Mode Comparison View ✅ COMPLETED

**Priority:** Lower — educational tool for understanding mode relationships.

**Status:** Implemented on 2026-02-04. Includes dual mode selectors, interval difference table, quick presets (Dorian vs Aeolian, etc.), mode descriptions, fretboard view toggle, and audio preview.

Side-by-side comparison highlighting interval differences between modes (e.g., Dorian vs Aeolian = raised 6th).

### 4.1 Mode Selector & Comparison UI

- Dual dropdowns: "Compare [Dorian] to [Aeolian]"
- Quick presets: Dorian vs Aeolian, Mixolydian vs Ionian, Phrygian vs Aeolian
- Root note selector for each mode

**New files:**
- `components/theory/ModeComparisonPanel.tsx` — comparison UI
- `lib/theory/modeComparison.ts` — mode diff logic

### 4.2 Interval Difference Table

Show scale degrees 1–7 side-by-side, highlighting differences:

```
Degree | Dorian       | Aeolian      | Difference
-------|--------------|--------------|------------------
6      | 6 (Maj 6th)  | ♭6 (Min 6th) | ⬆ Raised 6th
```

Uses `Scale.get()` from tonal to compare interval arrays.

### 4.3 Fretboard Difference Overlay

Color-coded fretboard showing comparison:
- Shared notes: grey
- Mode 1 unique: blue
- Mode 2 unique: purple
- Changed intervals: pulsing orange

Toggle: "Show Mode 1" | "Show Mode 2" | "Show Both"

### 4.4 Characteristic Sound Descriptions

Static descriptions per mode:
- **Dorian:** "Minor with a bright, jazzy 6th — sounds hopeful yet melancholic"
- **Phrygian:** "Dark, Spanish/flamenco feel from the ♭2"
- **Lydian:** "Dreamy, floating quality from the ♯4"
- **Mixolydian:** "Bluesy dominant sound, major with a ♭7"

Audio preview: play the characteristic interval (e.g., 1–6 for Dorian).

**New files:**
- `lib/theory/modeDescriptions.ts` — mode metadata and descriptions

### Builds On

- `getScaleNotes()` from `lib/theory/scales.ts`
- `FretboardOverlay` system with new `"mode-comparison"` mode
- Scale preview and audio from `ChordInfoPanel.tsx`
- tonal library's `Scale.get()` for interval data

### UI/UX Notes

- Keep explanations simple — target audience is intermediate players learning modes
- Color distinctions must be obvious for shared vs unique vs changed
- Always explain *why* differences matter (sound/emotion)
- Limit to 2 modes at a time (no 3-way comparisons)

### Phases

1. Create `modeComparison.ts` with interval diff calculation
2. Build ModeComparisonPanel with table and selectors
3. Fretboard difference overlay
4. Mode descriptions and audio previews
5. Presets and educational polish

---

## UI Design Plan

How each enhancement surfaces in the existing FretFlow UI. The current layout has three zones: **progression editor** (top), **fretboard + theory** (middle), and **transport bar** (bottom). Theory content lives in a right-side Sheet (ChordInfoSheet), fretboard display options live in a Display popover, and overlays render as SVG layers on the fretboard.

---

### UI for Enhancement 1: Target Notes & Approach Patterns

**Entry point — Display popover** (existing, next to the fretboard overlay dropdown):

Add a new "Target Notes" section below the existing overlay selector:

```
┌─ Display ──────────────────────────────┐
│ Overlay: [Pentatonic Minor ▾]          │
│ ☑ Scale tones  ☑ Voice leading         │
│ Labels: [Notes ▾]                      │
│ ☑ CAGED positions                      │
│                                        │
│ ── Target Notes ──────────────────     │
│ Mode: [None ▾]                         │
│   • None                               │
│   • Chord tones (1-3-5-7)              │
│   • Guide tones only (3-7)             │
│   • Strong beats (pulse on 1 & 3)      │
│                                        │
│ Layers (enabled when mode ≠ None):     │
│   ☐ Chromatic approaches               │
│   ☐ Diatonic approaches                │
│   ☐ Enclosures                         │
└────────────────────────────────────────┘
```

**Fretboard rendering:**

- Target notes get a **pulsing ring animation** (CSS keyframe on the existing `FretMarker`). Primary targets (root, 3rd, 7th) pulse brighter; secondary (5th) pulse subtly.
- Chromatic approach notes render as **small amber diamonds** (not full circles) with a tiny directional arrow (↗/↘) pointing toward the target. Uses a new SVG layer similar to `VoiceLeadingOverlay.tsx`.
- Diatonic approach notes render as **small light-blue diamonds**, same pattern but distinguishable color.
- Enclosures render as **bracket pairs** (SVG arcs) surrounding the target note when clicked. Click a target note → its enclosure pair highlights. Only one enclosure active at a time to avoid clutter.

**Progressive disclosure:** Toggles are layered — enabling "Chord tones" mode unlocks the approach/enclosure checkboxes. This prevents overwhelming beginners.

**Mobile:** No directional arrows — color + shape only. Enclosures hidden behind a tap interaction on the target note.

---

### UI for Enhancement 2: Arpeggio Shapes Overlay

**Entry point — Display popover overlay dropdown:**

Add `"Arpeggio"` as a new overlay option alongside Pentatonic Minor, Pentatonic Major, Blues, 3NPS:

```
Overlay: [Arpeggio ▾]
```

When "Arpeggio" is selected:
- The existing **CAGED position selector** (already in the Display popover) becomes the primary navigation — each position shows a different arpeggio shape.
- Only chord tones (1-3-5-7) display on the fretboard, using the existing color system (orange root, blue guide tones, emerald other chord tones).
- **Degree labels** (①③⑤⑦) replace note names when the arpeggio overlay is active (auto-switch `noteLabelMode` to `"degrees"` with a revert on overlay change).

**Fretboard rendering:**

- SVG connector lines (thin, semi-transparent) link arpeggio notes in ascending string order within the active CAGED position. Uses the same SVG layer pattern as `VoiceLeadingOverlay.tsx`.
- During **playback**, cross-chord transitions animate: outgoing arpeggio notes fade while incoming notes appear, with shared tones staying highlighted (brief golden flash on common tones).

**Audio preview:**

- A small **▶ play button** appears in the Display popover next to the CAGED position selector when Arpeggio overlay is active. Tapping it plays the arpeggio ascending then descending at the current BPM. Reuses `lib/audio/preview.ts`.

**Mobile:** Connector lines hidden (too dense on small fretboards). Degree labels shown. CAGED selector becomes a horizontal pill bar above the fretboard legend.

---

### UI for Enhancement 3: Harmonic Analysis Depth

This enhancement surfaces in **three distinct locations**:

#### 3a. Progression Editor — Pattern Badges

Above the progression bars, show detected pattern labels as small **badge chips**:

```
┌─────────────────────────────────────────────┐
│  ┌──── ii-V-I in C ─────┐                  │
│  │ Dm7  │  G7  │ Cmaj7  │  Cmaj7  │        │
│  └──────────────────────────────────────────┘
```

- Badges use `bg-violet-100 text-violet-700` (matching the existing key detection color).
- A bracket line connects the bars that form the pattern.
- Multiple patterns can overlap (e.g., ii-V-I + turnaround) — show up to 2 badges, with "…" overflow expanding on click.
- **Secondary dominant arrows**: curved SVG arrows above the progression bars pointing from V/V → V → I. Uses amber color to distinguish from pattern badges.

#### 3b. ChordInfoSheet — New "Analysis" Section

Add a fourth collapsible section to the existing ChordInfoSheet (below Key Analysis):

```
▼ Harmonic Analysis
  ┌────────────────────────────────────────┐
  │ Pattern: ii-V-I in C major             │
  │ Function: Dm7 is the ii chord —        │
  │ creates gentle tension before the V.   │
  │                                        │
  │ ⚡ Tension: ██████░░░░ 6/10            │
  │ "Moderate tension — dominant function   │
  │  with tritone (B↔F) pulling to Cmaj7"  │
  │                                        │
  │ 🎵 Borrowed: None detected             │
  │ (or: "♭VII from C minor — darker       │
  │  color, common in rock/pop")           │
  └────────────────────────────────────────┘
```

- Uses the existing collapsible section pattern from ChordInfoPanel.
- Educational microcopy explains *why*, not just *what*.
- Tension shown as a simple inline bar (no separate graph yet — see 3c).

#### 3c. Tension Graph — Inline in Progression Area

A slim **tension sparkline** rendered directly below the progression bars:

```
│ Dm7  │  G7  │ Cmaj7  │ Cmaj7  │
─────────────────────────────────
  ▃▃▃    ▆▆▆    ▁▁▁      ▁▁▁       ← tension sparkline
```

- Height: ~20px, rendered as an inline SVG.
- Color gradient: low tension (emerald) → high tension (orange/red).
- Hover/tap on a segment shows a tooltip: "Bar 2: Tension 8/10 — dominant with tritone B↔F".
- Toggle via a small **📊 icon button** next to the progression editor controls. Off by default to keep the default view clean.

**Mobile:** Tension sparkline hidden by default (available via toggle). Analysis section in ChordInfoSheet uses accordion for space.

---

### UI for Enhancement 4: Mode Comparison View

**Entry point — ChordInfoSheet, via suggested scales:**

Each scale listed in ChordInfoPanel already shows scale names (Dorian, Mixolydian, etc.). Add a **"Compare"** link next to any two scales:

```
Suggested Scales:
  D Dorian         [Preview] [Compare ↔]
  D Aeolian         [Preview] [Compare ↔]
```

Clicking "Compare" on a second scale opens the **Mode Comparison Panel** as a new view within ChordInfoSheet (replaces the current content, with a back button):

```
┌─ Compare Modes ──────────────────────────┐
│ ← Back                                   │
│                                          │
│ [D Dorian ▾]  vs  [D Aeolian ▾]         │
│                                          │
│ Quick presets:                            │
│ [Dorian vs Aeolian] [Mixo vs Ionian]     │
│                                          │
│ ┌─ Interval Table ────────────────────┐  │
│ │ Deg  Dorian    Aeolian    Diff      │  │
│ │  1   D         D                    │  │
│ │  2   E         E                    │  │
│ │  ♭3  F         F                    │  │
│ │  4   G         G                    │  │
│ │  5   A         A                    │  │
│ │  6   B ●       B♭ ●      ⬆ raised  │  │
│ │  ♭7  C         C                    │  │
│ └─────────────────────────────────────┘  │
│                                          │
│ 🔑 Key difference: Dorian has a natural  │
│ 6th — brighter, jazzier minor sound.     │
│                                          │
│ Fretboard: [Mode 1] [Mode 2] [Both]     │
│                                          │
│ 🔊 Hear the difference:                  │
│ [▶ D Dorian]  [▶ D Aeolian]             │
│ [▶ Just the 6th interval]                │
└──────────────────────────────────────────┘
```

**Fretboard rendering (when comparison is active):**

- **"Both" mode** (default): Shared notes in grey, Mode 1 unique notes in blue, Mode 2 unique notes in purple, changed intervals pulse orange.
- **"Mode 1" / "Mode 2"** toggles: Full overlay for the selected mode, standard coloring.
- A **segmented toggle bar** renders above the fretboard legend when comparison is active, replacing the normal legend.

**Mobile:** Interval table scrolls horizontally. Fretboard toggle simplified to swipe left/right between modes. Description text shortened.

---

### Shared UI Patterns

**State management:** All new toggles and modes go into `displaySlice.ts`:
```typescript
// New fields
targetNoteMode: TargetNoteMode        // "none" | "chord-tones" | "guide-tones" | "strong-beats"
showChromaticApproach: boolean
showDiatonicApproach: boolean
showEnclosures: boolean
showTensionGraph: boolean
modeComparison: { mode1: string; mode2: string } | null
```

**Keyboard shortcuts:**
- `T` — cycle target note mode (None → Chord tones → Guide tones → Strong beats)
- `A` — toggle arpeggio overlay
- `N` — toggle tension graph

**Progressive complexity:** The Display popover grows with these features. Group into collapsible sections:
1. **Overlay** (existing: scale overlays, CAGED)
2. **Target Notes** (new: modes + approach layers)
3. **Labels & Display** (existing: note labels, voice leading, scale tones)

This keeps the popover scannable while accommodating the new controls.

---

## Cross-Enhancement Synergies

- **Target Notes + Arpeggios:** Arpeggio overlay highlights target notes with extra emphasis. "Target Arpeggio Practice" pulses targets on downbeats while showing arpeggio paths.
- **Arpeggios + Harmonic Analysis:** When ii-V-I detected, auto-suggest arpeggio practice sequence. Show arpeggio voice leading across pattern segments.
- **Target Notes + Harmonic Analysis:** Tension analysis influences target note prominence — higher tension bars get more prominent highlighting. Borrowed chords trigger recalculation based on borrowed scale.
- **All + Playback:** "Smart overlay" mode adapts visualization to harmonic function during playback.

---

## New Files Summary

| File | Enhancement |
|------|-------------|
| `lib/theory/targetNotes.ts` | 1 — Target Notes |
| `lib/theory/arpeggios.ts` | 2 — Arpeggios |
| `lib/theory/progressionPatterns.ts` | 3 — Harmonic Analysis |
| `lib/theory/tensionAnalysis.ts` | 3 — Harmonic Analysis |
| `lib/theory/modeComparison.ts` | 4 — Mode Comparison |
| `lib/theory/modeDescriptions.ts` | 4 — Mode Comparison |
| `components/fretboard/TargetNoteOverlay.tsx` | 1 — Target Notes |
| `components/fretboard/EnclosureOverlay.tsx` | 1 — Target Notes |
| `components/fretboard/ArpeggioOverlay.tsx` | 2 — Arpeggios |
| `components/theory/ProgressionAnalysisPanel.tsx` | 3 — Harmonic Analysis |
| `components/theory/TensionGraph.tsx` | 3 — Harmonic Analysis |
| `components/theory/ModeComparisonPanel.tsx` | 4 — Mode Comparison |
| `components/progression/SecondaryDominantOverlay.tsx` | 3 — Harmonic Analysis |

## Key Modified Files

- `lib/types.ts` — new type definitions for all enhancements
- `components/fretboard/Fretboard.tsx` — overlay integrations
- `state/slices/displaySlice.ts` — new display state fields
- `components/theory/ChordInfoSheet.tsx` — new panel tabs
- `lib/theory/voiceLeading.ts` — arpeggio transition extensions
- `lib/theory/keyDetection.ts` — borrowed chord detection
- `lib/audio/preview.ts` — arpeggio audio preview
