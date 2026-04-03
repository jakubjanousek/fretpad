# Brainstorm: Guided Practice Modes + Distribution

**Date:** 2026-03-13
**Status:** Ready for planning

---

## What We're Building

Repackage FretPad's existing feature surface into 3 opinionated guided practice modes, then build distribution (landing page + SEO) and structured retention (challenges with tracking). The goal is to make FretPad useful for hundreds of guitarists who discover it organically, not just the developer.

### The Core Problem

FretPad has strong capabilities but organizes them around features, not practice goals. New users land on a dense single-page editor with all controls visible and no task framing. The first-session experience is "here's everything" rather than "here's what to do next."

### The Solution

A **launcher** ("What do you want to practice today?") that routes users into one of 3 constrained modes, each with a focused UI, preset progression, and clear success metric.

---

## The Three Modes

### 1. Learn the Neck
**Job:** Build fretboard familiarity — know where notes and intervals are.
**Existing features used:** Fretboard overlays (pentatonic, blues, 3NPS, CAGED), note labels, chord tone quiz.
**Constrained UI:** Fretboard + quiz. Hide theory panel, voicings, target notes.
**Success metric:** Quiz accuracy, notes identified per session.

### 2. Outline Chord Changes
**Job:** Practice hearing and visualizing chord tones as changes go by.
**Existing features used:** Backing tracks, target notes, approach patterns (chromatic/diatonic), enclosures, guide tone highlighting.
**Constrained UI:** Fretboard with target notes + backing track. Show theory chord info tab. Hide voicings, CAGED, quiz.
**Success metric:** Time spent practicing over changes, target notes hit (future: with audio input).

### 3. Comp with Voicings
**Job:** Practice comping with good voice leading through a progression.
**Existing features used:** V-System voicings, voice leading engine, voicing types, difficulty filtering.
**Constrained UI:** Fretboard with voicing overlays + backing track. Show voicing controls. Hide scale overlays, quiz, target notes.
**Success metric:** Voicings explored, progressions practiced.

---

## Why This Approach

- **The product capability already exists.** This is a packaging problem, not a feature gap.
- **Modes define success criteria**, which makes retention (challenges, goals) natural to layer on.
- **A landing page is easier to write** when you can describe 3 clear use cases rather than a feature list.
- **Distribution compounds over time** — SEO takes months, so getting it right matters more than getting it early with a weak product story.
- **Audio input becomes more valuable later** when attached to a specific mode (Outline Changes) rather than bolted on globally.

---

## Key Decisions

1. **Launcher, not tabs.** The mode selection is a distinct entry point, not tabs within the existing page. This forces a clear UX reset per mode.
2. **3 modes, matching the review's recommendation.** Learn the Neck, Outline Chord Changes, Comp with Voicings.
3. **Modes-first execution order.** Build all 3 modes before the landing page, so distribution sends users to a strong experience.
4. **Structured challenges for retention.** Weekly challenges like "ii-V-I in 3 keys" with tracking, still localStorage-only — no accounts.
5. **Landing page + SEO for distribution.** Targeting "guitar practice tool", "chord tone practice", "jazz improvisation practice".
6. **Audio input deferred.** Revisit once Outline Changes mode is live and naturally calls for feedback.
7. **Power users can still access the full surface.** Modes constrain the default, not the ceiling.

---

## Execution Sequence

1. **Launcher + 3 guided modes** — reframe the product around practice jobs
2. **Landing page + SEO** — create a front door that sells the 3 modes
3. **Structured challenges** — weekly goals tied to mode-specific metrics
4. **Shareability improvements** — URL sharing of mode configs for forums/Discord

---

## Resolved Questions

1. **How should the launcher coexist with the current single-page experience?** Separate routes — `/` is the launcher, `/practice` (or `/practice/[mode]`) is the app. Clean separation, good for landing page SEO.
2. **Should power users be able to skip the launcher entirely?** Yes — auto-resume the last mode used (stored in localStorage), with a way to switch modes from within the practice view.
3. **What specific challenges make sense for each mode?** Key-based challenges that drive systematic coverage: "Practice ii-V-I in all 12 keys", "Learn pentatonic in 3 new positions", "Outline changes over 5 different standards." Habit-based time goals are secondary.

---

## Audience & Scale

- **Target:** Intermediate guitarists who want structured practice, not just a reference tool
- **Scale ambition:** Hundreds of active users, discovered organically via SEO and guitar communities
- **No accounts:** All state stays in localStorage. Cloud sync and accounts are a future concern.
