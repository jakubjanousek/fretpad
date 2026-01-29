# Overlay & Display Controls UX Improvement Plan

## Current State Assessment

### What Exists

- **Pentatonic/Blues overlays:** Minor Pentatonic, Major Pentatonic, Blues — selected via segmented button group below the fretboard. When active, notes are colored by CAGED position (5 colors) instead of chord role.
- **CAGED positions:** Baked into the overlay view. No way to toggle them off independently. Legend shows "Pos 1 (E shape)" through "Pos 5 (G shape)" in 2 rows.
- **Scale Tones toggle:** Adds gray dots for all diatonic scale notes that aren't chord tones. Unclear naming, minimal visual impact.
- **Voice Leading toggle:** Shows SVG arrows/dashed circles connecting common tones and resolutions between current and next chord.
- **Labels selector:** Notes / Degrees / None.
- **3-note-per-string:** Listed as "Done" in roadmap but **not implemented** — no type, no patterns, no UI.

### UX Problems Identified

1. **Too many controls crammed into the legend bar.** Three separate control groups (Overlay, Labels, toggles) plus a 2-row legend all compete for attention in a narrow horizontal strip.
2. **Overlay replaces chord-tone context.** Activating Minor Pentatonic removes root/guide-tone/chord-tone coloring entirely. The most important improvisation information ("which pentatonic notes are chord tones") is lost.
3. **CAGED is forced on.** No way to see a pentatonic overlay without CAGED position coloring. The 5-color positional system is meaningless to beginners and adds visual noise.
4. **Scale Tones toggle is confusing.** The name is vague. Gray dots are hard to see. The toggle has no visible effect when an overlay is active (overlay replaces chord view entirely).
5. **Voice Leading + Overlay clash.** Voice leading paths reference chord tones, but overlay replaces chord-tone colors. Arrows and dashed circles over CAGED-colored dots create a visual mismatch.
6. **No progressive disclosure.** Beginners and advanced players see the same interface. All controls are always visible and immediately overwhelming.
7. **Legend takes excessive space.** The 6 CAGED items (Root + 5 positions) span two full rows.

---

## Improvement Plan

### Principle: Layered complexity — simple by default, powerful on demand

### A. Collapse controls into a "Display" popover

**Problem:** 3 control groups + 2-row legend = visual overload.

**Solution:**
- Replace the inline legend + controls bar with a compact toolbar showing just the active state as summary chips (e.g., `Minor Pentatonic · Notes · Voice Leading`).
- Clicking opens a popover or bottom sheet with all display options organized in clear labeled sections:
  - **Scale Overlay** — None / Minor Pentatonic / Major Pentatonic / Blues / (future: 3NPS)
  - **Note Labels** — Notes / Degrees / None
  - **Display Layers** — Voice Leading (toggle), Scale Tones (toggle)
  - **CAGED Positions** — Show positions (toggle), only visible when an overlay is active
- The color legend becomes contextual: only shown inside the popover for the currently active mode.
- This frees ~80px of vertical space and reduces cognitive load at rest.

### B. Allow overlay + chord-tone coloring to coexist

**Problem:** Overlay erases chord-role information that's critical for improvisation.

**Solution:**
- When an overlay is active and CAGED positions are OFF: color overlay notes using the standard chord-role colors (orange=root, blue=guide tone, green=chord tone) for notes that belong to the current chord, and a neutral color (e.g., slate-400) for overlay notes that aren't chord tones.
- When CAGED positions are ON: use CAGED position colors but add a ring/outline for chord tones (e.g., a white inner ring for root, dotted outline for guide tones).
- This preserves the most important information: "which pentatonic notes to target on this chord."

### C. Make CAGED positions opt-in

**Problem:** CAGED coloring is forced, adding 5 colors that confuse beginners.

**Solution:**
- Add a "Show CAGED positions" toggle inside the Display popover. Default: OFF.
- When OFF: overlay notes show chord-role colors (per B above) — simple and useful for all levels.
- When ON: notes switch to CAGED position colors, legend shows position shapes.
- This makes overlays immediately useful for beginners who just want "which notes can I play."

### D. Rename and clarify toggles

**Problem:** "Scale Tones" is vague. Users don't know what it adds.

**Solution:**
- Rename "Scale Tones" to "Fill Scale" or "All Scale Notes" — makes it clear this adds the remaining diatonic notes.
- Add a short description in the popover: "Show non-chord diatonic notes as faded dots."
- Clarify behavior: when an overlay is active, "Fill Scale" should add diatonic notes not already in the overlay pattern (e.g., the 2nd and 6th that aren't in the pentatonic).

### E. Add "Focus Position" mode

**Problem:** Practicing within a single CAGED position is the most common use case, but all 5 positions are always shown.

**Solution:**
- When CAGED positions are ON, clicking a position in the legend isolates it (dims all other positions to ~20% opacity).
- Click again to deselect and show all positions.
- This already partially works on hover — make it a sticky click-to-focus.

### F. Implement 3-note-per-string overlay

**Problem:** Listed as done in roadmap but code doesn't exist.

**Solution:**
- Add `"3nps"` to the `FretboardOverlay` type.
- Define 7 position patterns for major scale 3NPS shapes.
- Add position mapping logic (similar to CAGED but with 7 positions based on starting degree).
- Add "3-Note-Per-String" button to the overlay selector.
- Consider simpler position numbering (1-7 by scale degree) rather than CAGED shape names.

---

## Implementation Priority

| Step | Change | Impact | Effort |
|------|--------|--------|--------|
| 1 | B: Overlay preserves chord-tone colors | High — fixes core information loss | Medium |
| 2 | C: CAGED positions opt-in | High — removes beginner confusion | Low |
| 3 | A: Collapse into Display popover | Medium — cleaner UI | Medium |
| 4 | D: Rename toggles | Low — clarity improvement | Low |
| 5 | E: Focus position mode | Medium — practice utility | Low |
| 6 | F: 3NPS overlay | Medium — completes feature set | Medium |

Steps 1-2 are the highest priority because they fix fundamental information architecture problems. Step 3 is a layout improvement that can follow. Steps 4-6 are incremental polish.
