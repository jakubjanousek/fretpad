# Mode Differentiation & Guided Experience

**Date:** 2026-03-14
**Status:** Brainstorm

---

## What We're Building

A redesign of the 3 practice modes so each feels like a **distinct, guided practice experience** rather than the same fretboard page with different toolbar buttons visible.

### The Problem

Today all 3 modes share the same `PracticePage` component and layout. The only differences are which toolbar controls appear. This makes modes feel interchangeable — a user switching between them barely notices a change. There's no guidance, no progression, no sense of "this mode is for *this* kind of practice."

### The Vision

Each mode becomes its own **step-by-step lesson experience** with a distinct layout, unique core interaction, and progressive workflow.

---

## The 3 Modes — Redesigned

### 1. Learn the Neck → Quiz-Driven Drills

**Core activity:** Rapid-fire fretboard identification drills.

**What changes:**
- Quiz becomes the **primary interface**, not a tucked-away feature
- Fretboard is the answer surface — user taps where they think the note is
- Step-by-step lesson structure (each unlocks at ~80% accuracy):
  - Step 1: Identify root notes across the neck
  - Step 2: Find 3rds and 7ths (guide tones)
  - Step 3: Full chord tone identification at tempo
  - Step 4: Interval identification with backing track
- Score tracking, streaks, accuracy feedback per step
- Distinct layout: quiz prompt/score prominent at top, fretboard as interactive answer board, minimal other UI

**What it does NOT need:** Target notes, voice leading, voicings, mic input, layers dropdown. The progression editor could be simplified or hidden (preset-driven).

### 2. Outline Chord Changes → Target Note Practice

**Core activity:** Landing on specific chord tones (root, 3rd, 7th) as changes go by. Mic can score accuracy.

**What changes:**
- Target notes are the **hero feature**, shown prominently on the fretboard
- The fretboard highlights "land here" notes that pulse/animate on chord changes
- Step-by-step lesson structure (each unlocks at ~80% target hit rate via mic):
  - Step 1: Hit the root of each chord as it changes
  - Step 2: Aim for guide tones (3rd, 7th)
  - Step 3: Add approach notes (chromatic, diatonic)
  - Step 4: Free improvisation with scoring
- Mic input provides real-time "hit/miss" feedback on target notes
- Distinct layout: current target note call-out, scorecard, fretboard with animated targets, approach note visualization

**What it does NOT need:** Quiz, CAGED overlays, pentatonic overlays, voicings button. Keep the focus on target notes only.

### 3. Comp with Voicings → Progressive Voicing Workshop

**Core activity:** Learn voicing shapes → practice smooth transitions → build a comping arrangement. Three stages within one mode.

**What changes:**
- Three progressive stages within the mode:
  - **Stage 1 — Learn Shapes:** Study one voicing at a time. See fingering, hear it. Cycle through voicing types for the current chord. No time pressure.
  - **Stage 2 — Practice Transitions:** Backing track plays. Fretboard shows current voicing AND upcoming voicing with voice-leading arrows. Focus on moving smoothly in time.
  - **Stage 3 — Build Arrangement:** User picks their preferred voicing for each chord in the progression. Practices playing the full arrangement back.
- Voice leading arrows are **critical here** (currently hidden in this mode!)
- Distinct layout: voicing diagram prominent, stage selector, voice leading visualization, simplified fretboard focused on chord shapes

**What it does NOT need:** Quiz, mic input, target notes, scale overlays.

---

## Why This Approach

1. **Each mode has a unique core interaction** — quiz tapping, target note landing, voicing shape study. These are fundamentally different activities, not just different toolbar configs.

2. **Step-by-step structure solves the "what do I do?" problem.** Users get explicit guidance without needing to understand all the controls.

3. **Distinct layouts make modes feel like different apps** within the same tool. Switching modes should feel like opening a different practice workbook, not toggling a toolbar.

4. **Progressive complexity within each mode** means beginners and advanced players both have a path. Start with Step 1, advance when ready.

---

## Key Decisions

- **Distinct page layouts per mode** — not a shared PracticePage with conditional controls
- **Step-by-step lesson progression** within each mode (structured, not freeform)
- **Learn the Neck = quiz-first** — the quiz IS the mode, not an add-on
- **Outline Changes = target notes + mic scoring** — visual targets that pulse on changes
- **Comp with Voicings = 3-stage progressive workshop** — learn → transition → arrange
- **Voice leading arrows belong in Comp mode** — currently hidden there, should be a hero feature
- **Linear unlock progression** — ~80% accuracy threshold unlocks next step, can revisit completed steps
- **Learn the Neck hides the progression editor** — uses curated presets only, dramatically simplifies UI
- **Mode-specific panels replace the shared theory panel** — quiz gets score/stats, outline gets target scorecard, comp gets voicing browser
- **Mode-specific backing track behavior** — quiz pauses between questions, outline plays steadily, comp has flexible play/study modes per stage
- **No pentatonic overlays in Outline mode** — keep focus on target notes only
- **Same Fretboard component, different props** — reuse the shared component, modes configure it via props (no mode-specific fretboard variants)

