# FretPad Pivot Plan

**Date:** April 2026
**Vision:** Guitar practice tool with real-time pitch detection feedback. You play over backing tracks, the app hears you and tells you how well you're outlining the changes.

**Competitive positioning:** Solo Trainer teaches you *what* to play (drills in silence). FretPad teaches you *how it sounds when you play it* (improvisation with a band + feedback). Browser-based, zero install, shareable via URL.

---

## Phase 1: Trim the Fat ✅

**Goal:** Remove features that don't serve the new focus. Smaller surface = easier to change everything else.

**Status:** Complete. 15,000+ lines removed. 348 tests pass.

### Remove
- Session planner (component + state slice)
- Quiz mode (component + state slice)
- V-System voicing controls panel
- Help guide (742-line component)
- Excess theory tabs (keep chord info + scale suggestions, remove substitutions/analysis/mode comparison for now)
- Any fretboard overlays not needed for the core use case (CAGED, 3NPS, enclosures — keep chord tones, scale tones, arpeggios)

### Keep
- Fretboard renderer (core of the product)
- Audio engine + scheduler (works well, sound quality is a separate concern)
- Theory engine in lib/theory/ (clean library code, useful even if not all exposed in UI)
- Progression editor (users need to set up what they practice over)
- State persistence + URL sharing
- All existing tests for kept code

### Done when
- Removed components are gone (not commented out, deleted)
- `pnpm validate` passes
- App loads and plays a progression with fretboard visualization
- Codebase is noticeably smaller

---

## Phase 2: Modularize ✅

**Goal:** Create hard boundaries between modules so each can be rewritten/iterated independently. This is the investment that makes phases 3-4 safe and fast.

**Status:** Complete. Barrel exports for lib/theory/ and lib/audio/. All external code imports from barrels only. 360 tests pass.

### Module boundaries to establish

**Theory engine** (`lib/theory/`)
- Already fairly clean. Define a public API surface (index.ts barrel export).
- Consumers import from `@/lib/theory`, never from internal files.
- No UI or state dependencies.

**Audio engine** (`lib/audio/`)
- Public API: create engine, load progression, play, stop, set tempo, set style, get playback position.
- Internals (scheduler, instruments, voicings, styles) are private.
- Sound quality improvements happen inside this boundary without touching anything else.
- Explore replacing Tone.js synths with sample-based instruments (Soundfont, better piano/bass/drum samples) for dramatically better sound.

**Fretboard renderer** (`components/fretboard/` + `lib/fretboard.ts`)
- Input: chord, scale, active notes from pitch detection, display config.
- Output: rendered fretboard.
- No direct store access — receives data via props/hooks at the boundary.

**Pitch detection** (`lib/audio/pitch-detection/` or `lib/pitch/`)
- Input: microphone stream.
- Output: stream of detected notes with timestamps.
- `pitchy` is already a dependency. Wrap it in a clean interface.
- Independent of everything else — can be tested with synthetic audio.

**State** (`state/`)
- After trim, consolidate remaining slices.
- Clear separation: what's persisted (progression, settings) vs. what's ephemeral (playback position, detected notes).

### Done when
- Each module has an index.ts with its public API
- No cross-module deep imports (enforced by convention or lint rule)
- Each module can be tested in isolation
- `pnpm validate` passes

---

## Phase 3: Landing Page

**Goal:** New homepage that communicates the new value prop. First impression for new visitors.

### Requirements
- Clear pitch: "Practice improvising over chord changes. The app listens and gives you feedback."
- Show what it looks like (screenshot/demo of the practice UI)
- Zero-friction start: one click to start practicing (no account, no setup)
- Mobile-friendly
- Clean, modern design (use Vercel frontend design skills)

### Not needed yet
- SEO optimization (do after the product works)
- Analytics (do after there's something to measure)
- Pricing/accounts (free first, monetize later)

### Done when
- Landing page loads at /
- Practice app loads at /practice (or similar)
- Looks professional and communicates the new focus
- Works on mobile

---

## Phase 4: Practice UI

**Goal:** Design and build the core practice experience from first principles.

### The core loop
1. User sees a chord progression (default: ii-V-I in C)
2. User hits play — backing track starts
3. Fretboard shows target notes for the current chord (chord tones highlighted, scale tones dimmed)
4. User plays along on their guitar
5. Pitch detection picks up what they're playing
6. Fretboard lights up the notes they're hitting in real time
7. After the loop: feedback — "you hit chord tones on 7/10 chord changes"

### Design questions to resolve
- What's on screen during practice? (fretboard + progression + transport + feedback — how arranged?)
- How prominent is the fretboard vs. the progression display?
- What does feedback look like in real-time vs. after a loop?
- How does the user configure what they're practicing? (progression, tempo, key, difficulty)
- What's the "difficulty" model? (e.g., level 1 = hit any chord tone, level 5 = hit guide tones on beat 1)
- Mobile layout — this needs to work on a phone propped up on a music stand

### Audio input setup
- Prompt: "Plug in headphones so we can hear you play" (or detect Bluetooth + explain tolerance)
- Device selection for users with audio interfaces
- Visual indicator that mic is hearing the guitar

### Done when
- User can play over a progression and see real-time note detection on the fretboard
- Basic feedback after each loop (% chord tones hit)
- Works with headphones + mic setup
- Clean, focused UI — nothing on screen that doesn't serve the practice loop

---

## Principles

- **Delete before you add.** Phase 1 comes first for a reason.
- **Modules before features.** Phase 2 makes everything after it cheaper.
- **One screen, one job.** The practice UI does one thing well.
- **Browser advantage.** No install, shareable URLs, works everywhere. Lean into this.
- **Good enough audio input beats perfect.** ±200ms tolerance, monophonic only, "you hit 7/10" — ship this before optimizing.
