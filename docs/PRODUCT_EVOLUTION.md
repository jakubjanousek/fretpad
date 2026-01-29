# FretFlow Product Evolution Roadmap

## Where We Are Today

FretFlow is a polished MVP: interactive fretboard with color-coded theory, 4 backing styles (Jazz Swing, Pop/Rock, Bossa Nova, Ballad), 17 preset progressions, voice leading visualization, chord info panel with scale suggestions, audio previews, practice tracking, sharing via URL, keyboard shortcuts, and onboarding. The architecture (Next.js + Tone.js + Zustand + tonal) is clean and extensible.

---

## Evolution Tracks

### Track 1: Ear Training & Active Learning

**Why:** The app currently *shows* theory visually but doesn't actively test the user. Turning passive viewing into active practice is the highest-impact growth lever for retention.

- **Interval ear training mode** — Play two notes, user identifies the interval on the fretboard
- **Chord tone quiz** — Highlight a fret, user guesses if it's root/3rd/5th/7th
- **Call-and-response** — App plays a short phrase, user picks the matching fretboard region
- **"Find the note" challenges** — Given a note name, tap the correct fret positions under time pressure
- **Progress tracking per skill** — Accuracy %, streaks, historical charts

### Track 2: Practice Intelligence

**Why:** Guitarists plateau when they repeat the same routines. Smart practice guidance differentiates FretFlow from a static reference tool.

- **Practice session planner** — Suggest a structured warmup → technique → improv → cooldown flow
- ~~**Tempo ramp mode** — Auto-increment BPM by N every M loops (gradual speed building)~~ ✅
- **Weak-spot detection** — Track which chord changes or positions the user avoids / struggles with (based on quiz data or manual logging)
- **Spaced repetition for progressions** — Surface progressions the user hasn't practiced recently
- **Practice streaks & goals** — Daily/weekly minute targets, visual streak calendar (extend existing stats)

### Track 3: Deeper Audio & Feel

**Why:** Realism and variety keep practice from feeling robotic. Better audio = longer sessions.

- **Additional styles** — Funk, Reggae, Latin Montuno, Neo-Soul, Country, Metal power-chord chugs
- **Drum patterns** — Add a basic drum loop per style (kick/snare/hat via sampler or synthesis)
- **Human feel / velocity variation** — Slight timing and velocity randomization for less mechanical playback
- **Alternate tunings** — Drop D, Open G, DADGAD, Half-step down — recalculate fretboard mapping
- **Custom style builder** — Let users tweak swing %, pattern density, voicing type per style
- **Audio input (stretch)** — Mic/line-in pitch detection to show what the user is actually playing on the fretboard in real time

### Track 4: Fretboard & Theory Expansion

**Why:** Intermediate/advanced players need more depth to stay engaged.

- **CAGED / 3-notes-per-string overlays** — Show common positional systems as toggleable layers
- **Pentatonic / blues scale quick-switch** — One-tap to overlay common improv scales
- **Arpeggio patterns** — Visualize sweep/economy picking shapes
- ~~**Scale degree labels** — Show "1 b3 4 5 b7" instead of note names (already deferred, high demand)~~ ✅
- **Chord substitution suggestions** — "Try tritone sub: Db7 instead of G7"
- **Key detection** — Auto-detect the key of a user-entered progression and suggest parent scale
- **Modulation awareness** — Highlight when a progression modulates and suggest pivot chords

### Track 5: Social & Community

**Why:** Practice is lonely. Social features drive sharing, accountability, and organic growth.

- **Shareable practice cards** — Visual summary of today's session (progression, time, BPM) as an image for social media
- **Community preset library** — Users upload and browse progressions with tags (genre, difficulty, song reference)
- **"Practice with a friend"** — Shared session via WebRTC where two users see the same progression in sync
- **Leaderboards** — Optional weekly practice-time or streak leaderboards
- **Song reference tags on presets** — "Sounds like: Autumn Leaves, All of Me"

### Track 6: Multi-Instrument & Beyond Guitar

**Why:** Opens the TAM significantly. The theory engine is instrument-agnostic.

- **Bass guitar mode** — 4-string fretboard, bass-specific voicings and patterns
- **Ukulele mode** — GCEA tuning, smaller fretboard
- **Piano keyboard view** — Same theory overlay on a piano roll (great for understanding theory)
- **Mandolin / Banjo** — Niche but loyal audiences

### Track 7: Platform & Distribution

**Why:** Reach users where they are, reduce friction.

- **Offline PWA improvements** — Cache audio samples, enable full offline practice (Serwist already in place)
- **iOS / Android wrapper** — Capacitor or PWA install prompt for home screen
- **MIDI input support** — Connect a MIDI guitar/keyboard for real-time note tracking
- **Desktop app (Electron/Tauri)** — For users who want a dedicated window
- **Browser extension** — Quick fretboard lookup while browsing tabs/chords sites
- **Export to PDF / image** — Print fretboard diagrams with chord/scale overlays

---

## Suggested Prioritization (Impact x Effort)

| Priority | Feature | Impact | Effort | Status |
|----------|---------|--------|--------|--------|
| **P0** | Tempo ramp mode | High retention | Low | ✅ Done |
| **P0** | Scale degree labels | High demand, already designed | Low | ✅ Done |
| **P0** | Drum patterns per style | Major audio quality jump | Medium | ✅ Done |
| **P1** | Chord tone quiz / ear training | Differentiation + retention | Medium | ⬜ Todo |
| **P1** | CAGED / pentatonic overlays | Core ask from intermediate players | Medium | ⬜ Todo |
| **P1** | Practice session planner | Structured practice = stickiness | Medium | ⬜ Todo |
| **P1** | Additional styles (Funk, Neo-Soul) | Broader appeal | Medium | ⬜ Todo |
| **P2** | Community preset library | Growth flywheel | High | ⬜ Todo |
| **P2** | Shareable practice cards | Organic acquisition | Medium | ⬜ Todo |
| **P2** | Alternate tunings | Power user feature | Medium | ⬜ Todo |
| **P2** | Key detection & chord subs | Theory depth | Medium | ⬜ Todo |
| **P3** | Audio input / pitch detection | Game-changer but complex | High | ⬜ Todo |
| **P3** | Multi-instrument modes | TAM expansion | High | ⬜ Todo |
| **P3** | Real-time shared sessions | Unique differentiator | Very High | ⬜ Todo |

---

## Monetization Angles (if relevant)

- **Free tier**: Core fretboard + 5 presets + 1 style + basic practice tracking
- **Pro tier**: All styles, community library, ear training, practice intelligence, alternate tunings, CAGED overlays
- **One-time unlock** (alternative): Pay once for all features — appeals to the musician demographic that dislikes subscriptions

---

## Key Architectural Implications

1. **Ear training & quizzes** — New Zustand slice for quiz state, new component tree under `components/training/`
2. **Drum patterns** — Extend `StyleDefinition` with a `drums` instrument config and pattern; add drum sampler to audio engine
3. **Community presets** — Requires a backend (Supabase/Firebase) + auth; biggest architectural shift
4. **Audio input** — Web Audio API `getUserMedia` + pitch detection lib (e.g., pitchy); new `hooks/useAudioInput.ts`
5. **Multi-instrument** — Abstract fretboard to accept tuning + string count; theory engine already instrument-agnostic
