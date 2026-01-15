# FretFlow – UI/Layout Improvement Plan

This document outlines UI and layout improvements to enhance the visual hierarchy, usability, and overall user experience of FretFlow.

---

## Priority Levels

- **P0** – High impact, should be done first
- **P1** – Important, do after P0
- **P2** – Nice to have, polish items

---

## Current Issues Summary

1. **Fretboard buried below fold** – The main feature is pushed down by Chord Progression panel
2. **Presets take too much space** – Always expanded, showing 4 categories
3. **Progression bar clutter** – Individual delete buttons, wrapping to multiple rows
4. **Split bottom section** – Transport and Chord Info side-by-side creates awkward layout
5. **Inconsistent button styles** – Mix of icon, text, and outlined buttons
6. **Weak selection state** – Connection between selected chord and fretboard not obvious

---

## 1. Layout Restructure

### 1.1 Collapsible Presets Panel (P0)

Move presets from always-visible expanded sections to a more compact format.

**Current:** 4 collapsible categories always visible, taking ~150px vertical space

**Target:** Single dropdown or modal that opens on demand

**Tasks:**
- [ ] Create `PresetDropdown` component with search/filter
- [ ] Group presets by category in dropdown menu
- [ ] Add "Recently Used" section at top (store in localStorage)
- [ ] Remove collapsible accordion from main view
- [ ] Add preset name display showing current selection
- [ ] Keep "Save" button accessible for custom presets

**Files to modify:**
```
components/progression/ProgressionPresets.tsx  # Refactor to dropdown
components/ui/command.tsx                       # shadcn command for search (new)
lib/persistence.ts                              # Add recent presets tracking
```

### 1.2 Compact Progression Bar (P0)

Simplify the chord bar editor to be more compact and less cluttered.

**Current:**
- Bars wrap to multiple rows
- Each bar has visible × button
- Numbers, inputs, and buttons create visual noise

**Target:**
- Single horizontal row with overflow scroll
- Delete button appears on hover only
- Cleaner visual design

**Tasks:**
- [ ] Redesign `BarInput` to be more compact (remove visible delete button)
- [ ] Show delete button on hover/focus only
- [ ] Add horizontal scroll container for progression
- [ ] Show bar numbers inside the chord chip (e.g., "1. Dm7")
- [ ] Add visual indicator for bars that overflow viewport
- [ ] Style currently playing bar more prominently

**Files to modify:**
```
components/progression/BarInput.tsx            # Compact redesign
components/progression/ProgressionEditor.tsx   # Horizontal scroll container
```

### 1.3 Fixed Transport Bar (P1) ✅

Convert transport controls to a fixed bottom bar like a media player.

**Current:** Transport is a card in the grid, scrolls with page

**Target:** Sticky bottom bar always visible, containing essential controls

**Tasks:**
- [x] Create `TransportBar` component as fixed-position element
- [x] Include: Play/Stop, Reset, Tempo slider, Metronome toggle
- [x] Move style selector and volume controls to expandable drawer
- [x] Add keyboard shortcut hints on hover
- [x] Ensure transport bar doesn't overlap content (add bottom padding)
- [ ] Mobile: Make transport bar touch-friendly with larger targets

**Files to create/modify:**
```
components/transport/TransportBar.tsx          # New fixed bar component
components/transport/TransportDrawer.tsx       # Expandable settings drawer
app/page.tsx                                   # Layout restructure
```

### 1.4 Chord Info Slide-Out Panel (P1) ✅

Convert Chord Info from always-visible card to on-demand panel.

**Current:** Chord Info card always visible next to Transport

**Target:** Slide-out panel triggered by clicking chord or info button

**Tasks:**
- [x] Create `ChordInfoSheet` as slide-out drawer (right side)
- [x] Trigger panel when clicking chord name on fretboard
- [x] Add info button (ℹ) in transport bar to toggle panel
- [x] Keep panel open during playback, updating with current chord
- [x] Add smooth slide animation
- [ ] Mobile: Use bottom sheet instead of side panel

**Files to create/modify:**
```
components/theory/ChordInfoSheet.tsx           # Slide-out panel wrapper
components/ui/sheet.tsx                        # shadcn sheet component (new)
app/page.tsx                                   # Panel integration
```

### 1.5 Fretboard as Hero (P1) ✅

Maximize fretboard prominence and visual weight.

**Tasks:**
- [x] Increase fretboard vertical space (remove wasted whitespace)
- [x] Add larger current chord display above fretboard
- [x] Improve playhead visibility (thicker line, glow effect) - done in Phase 1
- [ ] Move legend inline or to a collapsible footer
- [x] Add subtle animation when chord changes

**Files to modify:**
```
components/fretboard/Fretboard.tsx             # Layout adjustments
components/fretboard/FretboardHeader.tsx       # New component for chord display
```

---

## 2. Visual Design Improvements

### 2.1 Consistent Button Styles (P1) ✅

Unify button appearance across the app.

**Current issues:**
- "Voice Leading" / "Scale Tones" toggles look different from other buttons
- Mix of ghost, outline, and solid button variants
- Inconsistent icon sizes

**Tasks:**
- [x] Define button style guide (primary, secondary, ghost, toggle)
- [x] Update toggle buttons to use consistent style
- [x] Standardize icon sizes (16px for small, 20px for medium)
- [x] Add consistent hover/active states
- [ ] Document button usage in component

**Files to modify:**
```
components/ui/button.tsx                       # Add toggle variant
components/fretboard/Fretboard.tsx             # Update toggle buttons
components/transport/TransportControls.tsx     # Standardize buttons
```

### 2.2 Selection State Enhancement (P1) ✅

Strengthen visual connection between selected chord and fretboard.

**Tasks:**
- [ ] Add colored accent bar on fretboard matching selected chord
- [x] Animate chord name transition when selection changes
- [x] Highlight chord in progression with colored left border
- [x] Add subtle pulse animation on chord change during playback
- [x] Show chord quality badge more prominently

**Files to modify:**
```
components/progression/BarInput.tsx            # Selection styling
components/fretboard/Fretboard.tsx             # Header enhancement
```

### 2.3 Typography Hierarchy (P2) ✅

Improve text sizing and weight for better scanning.

**Tasks:**
- [x] Increase section header size ("Fretboard", "Transport")
- [x] Add subtle color differentiation for headers
- [x] Improve chord name typography (larger, bolder on fretboard)
- [x] Use consistent label styling throughout

**Files to modify:**
```
app/globals.css                                # Typography tokens
Multiple component files                       # Apply new styles
```

### 2.4 Dark Mode Polish (P2) ✅

Refine dark mode color palette.

**Tasks:**
- [x] Improve card differentiation (subtle border or shadow)
- [x] Add depth with layered backgrounds
- [x] Ensure sufficient contrast for all text
- [x] Polish focus rings for accessibility

**Files to modify:**
```
app/globals.css                                # Color refinements
tailwind.config.ts                             # Theme adjustments
```

---

## 3. Interaction Improvements

### 3.1 Improved Playhead (P0)

Make the playhead more visible during playback.

**Tasks:**
- [ ] Increase playhead line thickness (2px -> 3px)
- [ ] Add glow/shadow effect to playhead
- [ ] Add beat markers on progress bar (4 dots per bar)
- [ ] Animate playhead smoothly (currently may be choppy)
- [ ] Show countdown during count-in visually

**Files to modify:**
```
components/fretboard/Fretboard.tsx             # Playhead styling
components/fretboard/ProgressBar.tsx           # Beat markers
```

### 3.2 Keyboard Shortcuts Discoverability (P1) ✅

Make shortcuts more discoverable without cluttering UI.

**Tasks:**
- [x] Add floating "?" button that shows shortcuts overlay
- [x] Show shortcut hints on button hover (tooltips)
- [ ] Add first-time user hint about Space to play
- [ ] Consider onboarding tooltip sequence

**Files to modify:**
```
components/transport/KeyboardShortcutsHelp.tsx # New overlay component
components/transport/TransportBar.tsx          # Help button
```

### 3.3 Touch-Friendly Fretboard (P2) ✅

Improve fretboard interaction on touch devices.

**Tasks:**
- [x] Increase tap target size for fret markers
- [x] Add tap-to-select note (shows note info)
- [ ] Support pinch-to-zoom on fretboard
- [x] Add horizontal swipe to scroll frets on mobile

**Files to modify:**
```
components/fretboard/FretMarker.tsx            # Tap handling
components/fretboard/Fretboard.tsx             # Touch gestures
```

---

## 4. Responsive Layout

### 4.1 Mobile Layout Optimization (P1) ✅

Improve experience on narrow viewports.

**Tasks:**
- [x] Stack all sections vertically (already done, needs polish)
- [x] Use bottom sheet for Chord Info on mobile
- [x] Reduce fretboard to 7-8 frets with scroll
- [x] Make progression bar horizontally scrollable
- [x] Increase touch target sizes (min 44px)
- [ ] Test at 320px, 375px, 414px widths

**Files to modify:**
```
app/page.tsx                                   # Responsive layout
components/fretboard/Fretboard.tsx             # Mobile fret range
components/progression/ProgressionEditor.tsx   # Horizontal scroll
```

### 4.2 Tablet Layout (P2) ✅

Optimize for medium-sized screens.

**Tasks:**
- [x] Consider two-column layout (fretboard + info side-by-side)
- [x] Larger touch targets than desktop
- [x] Full fretboard without scroll

**Files to modify:**
```
app/page.tsx                                   # Breakpoint adjustments
```

---

## Implementation Order

### Phase 1 – Core Layout (Priority) ✅
1. Collapsible Presets Panel (1.1) ✅
2. Compact Progression Bar (1.2) ✅
3. Improved Playhead (3.1) ✅

### Phase 2 – Transport & Info Redesign ✅
4. Fixed Transport Bar (1.3) ✅
5. Chord Info Slide-Out Panel (1.4) ✅
6. Fretboard as Hero (1.5) ✅

### Phase 3 – Visual Polish ✅
7. Consistent Button Styles (2.1) ✅
8. Selection State Enhancement (2.2) ✅
9. Keyboard Shortcuts Discoverability (3.2) ✅

### Phase 4 – Responsive & Mobile ✅
10. Mobile Layout Optimization (4.1) ✅
11. Touch-Friendly Fretboard (3.3) ✅
12. Tablet Layout (4.2) ✅

### Phase 5 – Final Polish ✅
13. Typography Hierarchy (2.3) ✅
14. Dark Mode Polish (2.4) ✅

---

## Target Layout

```
┌─────────────────────────────────────────────────────┐
│  FretFlow                    [Presets ▾] [⚙] [🌙]  │  <- Header
├─────────────────────────────────────────────────────┤
│  [Dm7] [G7] [Cmaj7] [Cmaj7] [+]           4/4 time │  <- Compact progression
├─────────────────────────────────────────────────────┤
│                                                     │
│              ┌─────────────────┐                    │
│              │   Dm7 (minor 7) │                    │  <- Prominent chord name
│              └─────────────────┘                    │
│  ═══════════════════════════════════  ← playhead   │  <- Progress bar
│                                                     │
│    0   1   2   3   4   5   6   7   8   9  10  11   │
│  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐ │
│ E│   │ F │   │   │   │   │   │   │   │ D │   │   │ │
│ B│   │ C │   │   │   │   │   │ A │   │   │   │   │ │  <- Fretboard (hero)
│ G│   │   │ A │   │   │   │ D │   │   │ F │   │   │ │
│ D│   │   │ F │   │   │ A │   │   │ C │   │ D │   │ │
│ A│   │   │ C │   │ D │   │ F │   │   │   │ A │   │ │
│ E│   │ F │   │   │   │   │   │   │   │ D │   │   │ │
│  └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘ │
│  ● Root  ● Guide  ● Chord  ○ Scale                 │  <- Inline legend
│                                                     │
├─────────────────────────────────────────────────────┤
│  [▶]  [↺]  [♪]  ════════════  120 BPM    [⚙] [ℹ]  │  <- Fixed transport bar
└─────────────────────────────────────────────────────┘
                                              ↓
                                    [Chord Info Panel]  <- Slide-out on demand
```

---

## Notes

- Each improvement should be tested on both desktop (1280px+) and mobile (375px)
- Run `pnpm lint` and `pnpm build` before committing
- Consider A/B testing major layout changes if analytics are available
- Get user feedback after Phase 1 before proceeding
