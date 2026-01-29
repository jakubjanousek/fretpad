# FretFlow UX/UI Audit

**Date:** January 29, 2026
**Auditor perspective:** Seasoned UX/UI designer
**Viewports tested:** Desktop (1280x800), Tablet (768x1024), Mobile (375x812)
**States inspected:** Default, dark mode, chord details panel, settings panel, display popover, help guide, practice session, chord tone quiz, progression dropdown, chord editing

---

## Executive Summary

FretFlow is a well-structured guitar practice tool with strong music-theory foundations. The visual design is clean and functional, with a clear color-coding system for the fretboard. However, there are meaningful opportunities to improve visual hierarchy, mobile usability, interaction clarity, and overall polish to elevate the product from "functional MVP" to "delightful tool."

---

## 1. Visual Hierarchy & Layout

### Strengths
- Clear three-zone layout: progression editor (top), fretboard + theory (middle), transport bar (bottom)
- The fretboard itself is well-rendered with effective color-coding (orange/blue/green/grey)
- The chord info header (e.g. "Dm7 - Minor 7th") is large and readable
- Dark mode is well-implemented with good contrast on the fretboard

### Issues

| ID | Severity | Finding | Recommendation |
|----|----------|---------|----------------|
| VH-1 | Medium | The progression bar area and fretboard area compete for attention. The progression editor has equal visual weight to the fretboard, but the fretboard is the primary workspace. | Reduce the progression editor's visual prominence — smaller font, tighter padding, or collapse it into a more compact strip. The fretboard should dominate the viewport. |
| VH-2 | Low | The "Click for details" CTA under the chord name is styled as muted italic text, making it easy to miss. This is a key discovery action. | Make it a subtle but clear link or button style. Consider a small info icon next to the chord name instead. |
| VH-3 | Medium | The playhead/progress bar between chord info and fretboard (showing Dm7 → G7 → Cmaj7 → Cmaj7) is very small and hard to notice. It's a critical navigation element during playback. | Increase the height of the playhead track. Add a clearer active-segment indicator. Consider color-coding the segments to match the chord that's playing. |
| VH-4 | Low | "Bar 1 of 4" and "4/4" labels flanking the fretboard are in small grey text, blending into the background. | Slightly increase contrast or font weight for these contextual labels. |
| VH-5 | Medium | ✅ **IMPLEMENTED** — The bottom transport bar icons (Practice Session, Chord Tone Quiz, Practice Stats, Help Guide, Settings) were icon-only with no labels visible. | Added visible text labels below each icon on desktop/tablet (sm+ breakpoint). On mobile, icons remain compact with tooltip support. Labels use 10px muted text for a clean, unobtrusive look. |

## 2. Mobile Responsiveness

### Strengths
- The layout reflows reasonably for mobile — progression bars wrap into a 2x2 grid
- The bottom transport bar adapts well to smaller screens
- Fretboard scrolls horizontally as needed

### Issues

| ID | Severity | Finding | Recommendation |
|----|----------|---------|----------------|
| MR-1 | High | ✅ **IMPLEMENTED** — On mobile (375px), the fretboard is cut off at fret 5-6. The user cannot see the full fretboard without horizontal scrolling, but there's no visual cue that scrolling is possible. | Added a right-edge fade gradient with an animated chevron arrow that appears on mobile when more frets are available to scroll. The indicator automatically hides once the user scrolls to the end. |
| MR-2 | Medium | On mobile, the legend row at the bottom of the fretboard ("Root", "Guide tone", "Chord tone", "Scale tone") wraps awkwardly — "Scale tone" drops to a second line on its own. | Use a more compact legend format on mobile (e.g. colored dots only with a collapsible legend, or abbreviate labels). |
| MR-3 | Medium | The "Display" button label gets truncated on mobile: "Display (Minor Pentatonic · Voice Lea..." — the parenthetical state is too long. | On mobile, show just "Display" with a badge dot indicating active filters. Show the full state summary only on desktop. |
| MR-4 | Low | The progression helper text "Click chord to select, click bar to edit..." wraps to two lines on mobile, taking up valuable vertical space. | Shorten to "Tap chord to select. Tap bar to edit." on mobile, or hide it after first use. |
| MR-5 | Medium | On tablet (768px), the fretboard area is slightly cramped with fret numbers beyond 12 getting tight. The note circles at higher frets overlap or crowd each other. | Consider a fretboard zoom level or "focus range" selector (e.g. frets 0-7, 5-12, 7-15). |

## 3. Interactive States & Feedback

### Strengths
- Chord selection in the progression editor has a clear teal highlight
- The chord details panel (slide-in drawer) is well-organized with chord tones, guide tones, suggested scales, substitutions, and key detection
- The quiz mode is clever — highlighting a mystery note on the fretboard

### Issues

| ID | Severity | Finding | Recommendation |
|----|----------|---------|----------------|
| IS-1 | Medium | When clicking a chord bar to select it, the fretboard updates but there's no transition animation. The note positions just snap instantly, which can be disorienting. | Add a subtle crossfade or slide transition when switching between chords so the user can track which notes moved. |
| IS-2 | Medium | ✅ **IMPLEMENTED** — The chord editing flow was unclear. The instructions said "click bar to edit" but clicking a bar just selected it. The two-step process wasn't communicated. | Added a visible pencil icon edit affordance on each bar (visible on hover, or dimmed on selected bars). Double-clicking a chord name also enters edit mode. Updated helper text to explain the interaction clearly. |
| IS-3 | Low | The "Remove bar" (X) button on each progression bar is always visible. For a 4-bar progression, accidentally removing a bar is a destructive action. | Show remove buttons only on hover (desktop) or via a swipe gesture (mobile). Add an undo toast when a bar is removed. |
| IS-4 | Medium | In the chord tone quiz, the quiz panel docks to the bottom of the fretboard area, pushing the question partially below the fold. The user may need to scroll to see the answer buttons. | Pin the quiz panel to the bottom of the viewport (fixed position) or overlay it above the transport bar. |
| IS-5 | Low | The Display popover opens anchored to the Display button, which is at the bottom-right of the fretboard. On shorter viewports, this popover may extend below the fold. | Consider opening Display settings in a slide-in panel (similar to Settings/Chord Details) rather than a popover, for more consistent UX. |
| IS-6 | Low | The Practice Session panel phases (Warmup, Technique, Improv, Cooldown) are all disabled/non-interactive — they look like cards but can't be clicked to jump to a specific phase. | Allow clicking a phase card to start at that phase, or at least show a clearer disabled state explaining they unlock sequentially. |

## 4. Typography & Spacing

### Strengths
- The chord name display is appropriately large and dominant
- The quality label ("Minor 7th", "Dominant 7th") is well-positioned as secondary info
- Fretboard note labels are legible

### Issues

| ID | Severity | Finding | Recommendation |
|----|----------|---------|----------------|
| TS-1 | Low | The fret numbers (0-12) use a small, light grey font that's hard to read, especially on the warm yellow fretboard background. | Increase font weight or use a slightly darker shade for fret numbers. |
| TS-2 | Low | String labels (E, B, G, D, A, E) on the left side of the fretboard are the same size and weight as fret numbers, but they serve a different purpose. No visual differentiation. | Consider making string labels slightly bolder or using a different color to distinguish them from fret numbers. |
| TS-3 | Medium | In the chord details panel, the section headings ("Chord Tones", "Guide Tones", "Suggested Scales", "Chord Substitutions") have inconsistent spacing. "Suggested Scales" has a parenthetical "(click to preview on fretboard)" that runs directly into the heading without a line break. | Add consistent spacing between sections. Put parenthetical hints on a separate line or as a subtitle. |
| TS-4 | Low | The bottom transport bar has uneven spacing between the tempo slider/BPM label on the left and the icon buttons on the right. The play button sits centered but the flanking areas aren't balanced. | Equalize the left and right zones of the transport bar, or use a more structured grid layout. |

## 5. Accessibility

### Issues

| ID | Severity | Finding | Recommendation |
|----|----------|---------|----------------|
| A-1 | High | ✅ **IMPLEMENTED** — The fretboard note colors (orange, blue, green, grey) rely solely on color to convey meaning. Users with color vision deficiency cannot distinguish root from guide tone from chord tone. | Added non-color shape indicators: roots use rounded squares, guide tones have dashed borders, chord tones are plain circles, scale tones have ring outlines. Legend updated to match. |
| A-2 | Medium | Many interactive elements in the fretboard area use `generic` roles in the accessibility tree instead of proper semantic roles (buttons, links). Screen reader users will struggle to navigate. | Add proper ARIA roles and labels to fretboard notes, the playhead, and the legend items. |
| A-3 | Medium | The bottom toolbar icons have no visible text labels. While they have `aria-label`, sighted users who can't memorize icons are left guessing. | Add visible text labels, at least on larger viewports. |
| A-4 | Low | The tempo slider lacks visible min/max labels. The user sees "120 BPM" but doesn't know the range without dragging. | Add "40" and "240" (or whatever the range is) labels at the ends of the slider. |
| A-5 | Medium | The voice leading arrows on the fretboard (orange curved arrows between notes) are rendered as SVG with `img` alt text but no descriptive labels about what the arrows connect. | Add descriptive aria labels like "Voice leading: F (Dm7) resolves to B (G7)" for each arrow, or provide a text summary. |

## 6. Navigation & Information Architecture

### Strengths
- The top-level navigation is minimal and appropriate for a single-page app
- The progression preset dropdown is well-organized by genre (Jazz, Pop/Rock, Blues, Modal Vamps) with a search field
- Settings, Help, and Practice modes are logically grouped in the transport bar

### Issues

| ID | Severity | Finding | Recommendation |
|----|----------|---------|----------------|
| NA-1 | Medium | The share button (top-right) has no label and its purpose is ambiguous — does it share a URL? Export? Copy the progression? | Add a tooltip. Consider renaming/re-iconizing based on what it actually does. |
| NA-2 | Low | The "Progression" label in the header serves no interactive purpose — it's just a static label next to the dropdown. It takes up space without adding value. | Either remove it (the dropdown is self-explanatory) or make it a link/button that opens the progression editor in a more expanded view. |
| NA-3 | Medium | ✅ **IMPLEMENTED** — There was no way to undo/redo changes to the progression. If a user accidentally changed a chord or removed a bar, they lost their work. | Added undo/redo support with history tracking (up to 50 states). Keyboard shortcuts (⌘Z / ⌘⇧Z) and undo/redo buttons in the progression editor. All progression mutations (edit chord, add bar, remove bar, load preset, set progression) are tracked. |
| NA-4 | Low | The Practice Stats button in the transport bar presumably tracks practice history, but there's no persistent indicator of whether stats are being recorded. | Show a small recording dot or session timer when practice tracking is active. |
| NA-5 | Low | The keyboard shortcuts are buried inside Settings > "Keyboard shortcuts" button. Power users would benefit from faster access. | Support a `?` keyboard shortcut to show the shortcuts overlay, which is a common convention. |

## 7. Dark Mode

### Strengths
- The fretboard looks good in dark mode — note colors remain vibrant against the dark wood texture
- The transport bar and header adapt well

### Issues

| ID | Severity | Finding | Recommendation |
|----|----------|---------|----------------|
| DM-1 | Low | The theme toggle cycles through three states (system → light → dark) but the icon-only button doesn't clearly communicate the current state or what the next click will do. | Show the current theme name on hover/tooltip. Consider using a segmented control or dropdown with explicit labels for the three options. |
| DM-2 | Low | In dark mode, the progression bar editor uses a dark background with slightly lighter card borders. The selected chord (teal highlight) stands out well, but non-selected bars have low contrast borders. | Slightly increase the border contrast on non-selected bars in dark mode. |

## 8. Content & Microcopy

| ID | Severity | Finding | Recommendation |
|----|----------|---------|----------------|
| MC-1 | Low | The help text "Click chord to select, click bar to edit. Use spaces for multiple chords (e.g., 'Dm7 G7')." is permanently visible. After initial learning, it becomes noise. | Show this as a dismissible tooltip or only on first visit. Use localStorage to remember dismissal. |
| MC-2 | Low | In the chord details panel, the substitution descriptions could be more actionable: "Fmaj7 shares the same key signature" doesn't tell the user *when* to use this substitution. | Add context like "Use Fmaj7 for a brighter, lydian color over this chord change." |
| MC-3 | Low | The "Press Esc to close" hint in the Help Guide modal uses a styled `Esc` badge but this convention isn't used elsewhere (the Settings and Chord Detail drawers just have an X button). | Be consistent — either show the Esc hint on all closeable panels or none. |

---

## Priority Recommendations (Top 10)

Ranked by impact-to-effort ratio:

1. **A-1** — ✅ Add non-color indicators to fretboard notes (high accessibility impact, moderate effort)
2. **MR-1** — ✅ Add mobile fretboard scroll indicator (high mobile UX impact, low effort)
3. **VH-5** — ✅ Add text labels to transport bar icons (medium UX impact, low effort)
4. **NA-3** — ✅ Add undo/redo for progression edits (high safety impact, moderate effort)
5. **IS-2** — ✅ Clarify chord editing interaction (medium learnability impact, low effort)
6. **VH-1** — Reduce progression editor visual weight (medium hierarchy impact, low effort)
7. **MR-3** — Fix Display button truncation on mobile (medium mobile polish, low effort)
8. **IS-1** — Add fretboard transition animation between chords (medium delight, moderate effort)
9. **VH-3** — Improve playhead visibility (medium playback UX, low effort)
10. **TS-3** — Fix chord details panel heading spacing (low polish, low effort)

---

## Methodology

Visual inspection at three breakpoints. Interactive walkthrough of all major features and modals. Accessibility tree analysis via Playwright snapshots. Comparison against common UX heuristics (Nielsen's 10, Apple HIG touch targets, WCAG 2.1 AA).
