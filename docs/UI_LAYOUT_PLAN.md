# FretFlow – UI/Layout Improvement Plan (v2)

This document outlines UI and layout improvements focused on visual hierarchy, engagement, and appeal for younger users.

---

## Priority Levels

- **P0** – High impact, should be done first
- **P1** – Important, do after P0
- **P2** – Nice to have, polish items

---

## Current Issues Summary

1. **Transport bar lacks hierarchy** – All icons same size/weight, Play button not prominent
2. **Icon-only buttons unclear** – Younger users expect instant clarity without hovering
3. **Control grouping arbitrary** – Playback controls mixed with utility buttons
4. **Toggle states too subtle** – Selected state hard to distinguish
5. **Preset dropdown text-only** – Missing visual cues for difficulty/style
6. **No micro-interactions** – Interface feels static, lacking engagement
7. **Legend easily missed** – Small inline legend at bottom-left

---

## 1. Transport Bar Redesign

### 1.1 Hero Play Button (P0)

Make the Play button visually dominant as the primary action.

**Current:** Play button same size as other transport icons

**Target:** Larger, more prominent Play button that draws attention

**Tasks:**
- [x] Increase Play button size (48px vs 36px for others)
- [x] Add filled background color (cyan accent) to Play button
- [x] Add subtle glow/shadow effect on hover
- [x] Animate play/pause icon transition
- [x] Add ripple effect on click

**Files to modify:**
```
components/transport/TransportBar.tsx    # Play button styling
app/globals.css                          # Animation keyframes
```

### 1.2 Transport Control Grouping (P0)

Group related controls with visual containers for better organization.

**Current layout:**
```
[Play][Reset][Metronome]  [───slider───]  120 BPM  [Help][?][Settings][Info]
```

**Target layout:**
```
┌─────────────────┐  ┌──────────────────────┐  ┌─────────┐
│ [▶] [↺] [🎵]   │  │ [───slider───] 120   │  │ [≡ More]│
│  Playback       │  │     Tempo            │  │         │
└─────────────────┘  └──────────────────────┘  └─────────┘
```

**Tasks:**
- [x] Create visual grouping with subtle background containers
- [x] Add group labels below icons ("Playback", "Tempo")
- [x] Combine Help, Shortcuts, Settings into "More" dropdown menu
- [x] Keep chord Info button separate (frequently used)
- [x] Add separator lines between groups

**Files to modify:**
```
components/transport/TransportBar.tsx    # Layout restructure
components/transport/MoreMenu.tsx        # New combined menu (create)
```

### 1.3 Icon Labels (P1) ✅ COMPLETE

Add text labels to transport icons for clarity.

**Tasks:**
- [x] Add small labels below transport icons on desktop
- [x] Hide labels on mobile (icons only with tooltips)
- [x] Use short labels: "Play", "Reset", "Click" (metronome)
- [ ] Animate label appearance on first visit (deferred)

**Files to modify:**
```
components/transport/TransportBar.tsx    # Add label elements
```

---

## 2. Toggle & Button States

### 2.1 Enhanced Toggle Buttons (P0)

Improve visual feedback for toggle states (Voice Leading, Scale Tones, Notes/Intervals/None).

**Current:** Subtle background change on selection

**Target:** Clear visual distinction between active/inactive states

**Tasks:**
- [x] Use filled style for active, outline for inactive
- [x] Add color accent to active toggles (cyan border or background)
- [x] Animate transition between states (scale + color)
- [x] Add checkmark or indicator icon to active state
- [x] Increase contrast between states

**Files to modify:**
```
components/ui/button.tsx                 # Toggle variant styling
components/fretboard/Fretboard.tsx       # Apply to legend toggles
```

### 2.2 Segmented Control Style (P1) ✅ COMPLETE

Convert Notes/Intervals/None to proper segmented control.

**Current:** Three separate buttons

**Target:** Connected pill-style segmented control

**Tasks:**
- [x] Create `SegmentedControl` component (inline in Fretboard)
- [x] Connect buttons visually (shared background, no gaps)
- [x] Add sliding indicator that moves between options
- [x] Animate indicator movement smoothly

**Files to modify:**
```
components/ui/segmented-control.tsx      # New component (create)
components/fretboard/Fretboard.tsx       # Replace button group
```

---

## 3. Preset Dropdown Enhancement

### 3.1 Visual Preset Categories (P1) ✅ COMPLETE

Add visual cues to preset dropdown for better discovery.

**Current:** Text-only list with category headers

**Target:** Rich preset cards with metadata

**Tasks:**
- [x] Add category icons (🎷 Jazz, 🎸 Rock, 🎹 Blues, 🎵 Modal)
- [x] Add difficulty badges (Beginner, Intermediate, Advanced)
- [x] Add bar count indicator (e.g., "4 bars", "12 bars")
- [x] Color-code categories with subtle background tints
- [ ] Add "Popular" or "Trending" section (deferred)

**Files to modify:**
```
components/progression/ProgressionPresets.tsx  # Enhance menu items
lib/presets.ts                                  # Add metadata to presets
```

### 3.2 Preset Preview (P2) ✅ COMPLETE

Allow users to preview presets before selecting.

**Tasks:**
- [x] Add hover preview showing chord sequence
- [ ] Show mini fretboard preview on hover (optional, deferred)
- [x] Add "Preview" button that plays first 2 bars
- [x] Remember recently used presets (already implemented)

**Files to modify:**
```
components/progression/ProgressionPresets.tsx  # Preview functionality
components/progression/PresetPreview.tsx       # New component (create)
```

---

## 4. Fretboard Legend Improvements

### 4.1 Interactive Legend (P1) ✅ COMPLETE

Make the legend more discoverable and interactive.

**Current:** Static small legend at bottom-left

**Target:** Interactive legend that highlights notes on hover

**Tasks:**
- [x] Increase legend size and spacing
- [x] Highlight corresponding notes on fretboard when hovering legend item
- [ ] Add tooltip explaining each note type on first visit (deferred to 4.2)
- [ ] Consider floating legend position (top-right corner) (deferred)
- [ ] Add toggle to show/hide legend (deferred)

**Files to modify:**
```
components/fretboard/FretboardLegend.tsx  # New component (extract from Fretboard)
components/fretboard/Fretboard.tsx        # Legend interaction logic
```

### 4.2 First-Time Legend Tooltip (P2) ✅ COMPLETE

Help new users understand the color system.

**Tasks:**
- [x] Show animated tooltip sequence on first visit
- [x] Highlight each legend item one by one
- [x] Store "seen" state in localStorage
- [x] Add navigation controls (Back/Next/Skip)

**Files to modify:**
```
components/fretboard/FretboardLegend.tsx  # Tooltip integration
lib/persistence.ts                         # Store onboarding state
```

---

## 5. Micro-Interactions & Polish

### 5.1 Chord Change Animation (P1) ✅ COMPLETE

Add satisfying feedback when chords change.

**Tasks:**
- [x] Add subtle scale animation to chord name on change
- [x] Animate fretboard notes (fade out old, fade in new)
- [x] Add brief color flash on progress bar at chord boundaries
- [ ] Play subtle UI sound on chord change (optional, off by default) (deferred)

**Files to modify:**
```
components/fretboard/Fretboard.tsx        # Animation logic
components/fretboard/FretMarker.tsx       # Note animations
components/transport/ProgressBar.tsx      # Chord boundary flash
app/globals.css                           # Animation keyframes
```

### 5.2 Button Press Feedback (P1) ✅ COMPLETE

Add tactile feedback to all interactive elements.

**Tasks:**
- [x] Add scale-down effect on button press (transform: scale(0.95))
- [x] Add ripple effect to primary actions
- [x] Ensure all buttons have visible focus states
- [x] Add hover lift effect to cards and panels

**Files to modify:**
```
components/ui/button.tsx                  # Press animations
components/ui/card.tsx                    # Card hover effect
app/globals.css                           # Global interaction styles
```

### 5.3 Loading & State Transitions (P2) ✅ COMPLETE

Polish transitions between states.

**Tasks:**
- [x] Add skeleton loading for fretboard on initial load (FretboardSkeleton component)
- [x] Animate panel open/close with spring physics (Sheet component enhanced)
- [ ] Add progress indicator during audio initialization (deferred)
- [ ] Smooth scroll-to behavior when selecting chords (deferred)

**Files to modify:**
```
components/fretboard/Fretboard.tsx        # Loading states
components/ui/sheet.tsx                   # Panel animations
```

---

## 6. Chord Info Panel Enhancement

### 6.1 Interactive Scale Suggestions (P1) ✅ COMPLETE

Make scale suggestions more useful and interactive.

**Current:** Static list of scale names

**Target:** Clickable scales that preview on fretboard

**Tasks:**
- [x] Make scale names clickable
- [x] Preview scale on fretboard when hovering/clicking
- [x] Add click to lock in scale view (click again to clear)
- [ ] Show scale degree labels (1, 2, b3, 4, 5, 6, b7) (deferred)

**Files to modify:**
```
components/theory/ChordInfoSheet.tsx      # Scale interaction
state/ui-store.ts                         # Track previewed scale
```

### 6.2 Audio Preview (P2) ✅ COMPLETE

Add ability to hear chords and scales.

**Tasks:**
- [x] Add "Play chord" button in chord info panel
- [x] Add "Play scale" button next to each suggested scale
- [x] Use existing Tone.js setup for audio
- [x] Add arpeggio option (play notes sequentially)

**Files to modify:**
```
components/theory/ChordInfoSheet.tsx      # Audio controls
lib/audio/preview.ts                      # New preview audio module (create)
```

---

## 7. Engagement Features (Future)

### 7.1 Practice Tracking (P2) ✅ COMPLETE

Add basic progress tracking for motivation.

**Tasks:**
- [x] Track daily practice time in localStorage
- [x] Show "streak" indicator (consecutive days practiced)
- [x] Add simple stats view (total time, favorite progressions)
- [ ] Consider gamification badges (optional, deferred)

**Files to modify:**
```
lib/persistence.ts                        # Practice tracking
components/stats/PracticeStats.tsx        # New component (create)
```

### 7.2 Share Feature (P2)

Allow users to share their practice sessions.

**Tasks:**
- [ ] Generate shareable URL with progression encoded
- [ ] Add "Copy link" button
- [ ] Consider screenshot/image export of progression
- [ ] Social media share buttons (optional)

**Files to modify:**
```
lib/share.ts                              # URL encoding (create)
components/share/ShareButton.tsx          # New component (create)
```

---

## Implementation Order

### Phase 1 – Transport & Controls (P0) ✅ COMPLETE
1. ~~Hero Play Button (1.1)~~ ✅
2. ~~Transport Control Grouping (1.2)~~ ✅
3. ~~Enhanced Toggle Buttons (2.1)~~ ✅

### Phase 2 – Visual Feedback (P1) ✅ COMPLETE
4. ~~Icon Labels (1.3)~~ ✅
5. ~~Segmented Control Style (2.2)~~ ✅
6. ~~Chord Change Animation (5.1)~~ ✅
7. ~~Button Press Feedback (5.2)~~ ✅

### Phase 3 – Discovery & Learning (P1) ✅ COMPLETE
8. ~~Visual Preset Categories (3.1)~~ ✅
9. ~~Interactive Legend (4.1)~~ ✅
10. ~~Interactive Scale Suggestions (6.1)~~ ✅

### Phase 4 – Polish & Engagement (P2) ✅ COMPLETE
11. ~~Preset Preview (3.2)~~ ✅
12. ~~First-Time Legend Tooltip (4.2)~~ ✅
13. ~~Loading & State Transitions (5.3)~~ ✅
14. ~~Audio Preview (6.2)~~ ✅
15. ~~Practice Tracking (7.1)~~ ✅

---

## Target Transport Bar Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  ┌──────────────────┐   ┌─────────────────────────┐   ┌─────────────┐ │
│  │   ┌────┐         │   │                         │   │             │ │
│  │   │ ▶  │  ↺  🎵  │   │  ═══════●═══════  120  │   │  ⚙  ℹ      │ │
│  │   └────┘         │   │                   BPM  │   │             │ │
│  │   Play   Reset   │   │       Tempo            │   │ More  Info  │ │
│  └──────────────────┘   └─────────────────────────┘   └─────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
        ↑                           ↑                         ↑
   Playback group              Tempo group              Utilities
   (hero play button)       (slider + value)         (dropdown + info)
```

---

## Design Tokens for Younger Audience

### Colors
- Primary accent: `cyan-500` (energetic, modern)
- Active state: `cyan-500/20` background with `cyan-500` border
- Hover state: Slight lift + glow effect

### Motion
- Duration: 150-200ms for micro-interactions
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (smooth, natural)
- Scale on press: `0.95`
- Scale on hover: `1.02` (subtle lift)

### Spacing
- Touch targets: minimum 44px
- Button padding: 12px horizontal, 8px vertical
- Group gaps: 16px between control groups

---

## Notes

- Test all changes on mobile (375px) and desktop (1280px+)
- Run `pnpm lint` and `pnpm build` before committing
- Prioritize accessibility: visible focus states, sufficient contrast
- Consider A/B testing major interaction changes
- Get user feedback after Phase 1 before proceeding
