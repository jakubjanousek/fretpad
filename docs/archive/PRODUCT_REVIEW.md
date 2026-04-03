# FretPad Product Review & Roadmap Options

**Date:** March 2026
**Perspective:** Product Owner / Strategic Review

---

## Current State Assessment

### What Exists

FretPad is a browser-based guitar practice companion (PWA-ready) with:

- **Visual fretboard** with color-coded chord tones, guide tones, scale tones, and accessibility shapes
- **Chord progression editor** with 20+ presets (jazz, pop, blues, modal), transpose, undo/redo, URL sharing
- **Audio engine** with 10 backing styles (jazz swing, bossa nova, funk, pop-rock, country, reggae, metal, neo-soul, latin montuno, ballad), individual instrument volumes, tempo ramp
- **Deep theory system:** chord info, suggested scales, substitutions, key analysis, mode comparison, target notes, approach patterns (chromatic/diatonic), enclosures, arpeggios, harmonic analysis with tension scoring
- **Ted Greene V-System voicings** with voice leading engine, 7 voicing types, difficulty filtering
- **Practice tools:** chord tone quiz, session planner (4 phases), practice stats tracking
- **Polish:** dark mode, keyboard shortcuts, responsive design, help guide, metronome with count-in
- **Codebase:** 60+ components, 9 Zustand slices, 21 test files, Biome linting, TypeScript throughout

### What's Working Well

1. **Core value prop is clear and strong.** "See the right notes while hearing the chords" is immediately useful. No other free browser tool does this as well.

2. **The fretboard visualization is the star.** Color-coded notes with multiple overlay modes (pentatonic, blues, 3NPS, arpeggios, CAGED) is genuinely useful for practice.

3. **Audio engine is surprisingly rich.** 10 styles with bass/drums/chords and tempo ramp is far beyond what you'd expect from an MVP. Makes it a real practice tool, not just a reference.

4. **Theory depth is impressive.** Target notes, approach patterns, enclosures, mode comparison, tension analysis covers intermediate-to-advanced jazz concepts that are hard to find in competing tools.

### Concerns

1. **Feature density is the main UX issue.** The theory panel has 4 tabs (Chord, Modes, Subs, Analysis) and the fretboard exposes multiple control groups (overlays, labels, voicings, layers, targets). The problem is less "too many features exist" and more "too many decisions are presented before the user has a job to do."

2. **The product is organized around capabilities, not practice goals.** V-System voicings, CAGED positions, target notes, quiz mode, progression presets, planner, and stats all make sense individually, but they are not packaged into a small number of clear workflows such as "learn the neck," "outline changes," or "practice comping."

3. **Retention exists, but it is passive.** Practice stats, streaks, and a session planner are already present, which is better than having no retention loop at all. However, they currently log activity rather than driving a daily practice habit with explicit goals, milestones, or guided repetition.

4. **No audio input.** The user watches and listens but the tool never hears them play. This is still the highest-ceiling missing capability, but it should follow a clearer guided practice loop rather than compensate for one.

5. **The primary screen is still overloaded.** Not every feature is visible at once, but the core experience is still centered on a single dense page with secondary tools attached as drawers and modals. On mobile, this remains cognitively heavy even when the layout is technically responsive.

---

## Roadmap Options

### Option A: Guided Practice Modes (Recommended for Solo Dev)

**Thesis:** Stop shipping broad surface area. Repackage the existing engine into 3 opinionated practice jobs.

#### Phase 1: Reframe the Product Around Jobs (2-4 weeks)

- Replace level-based onboarding with a "What do you want to practice today?" launcher
- Introduce 3 primary modes:
  - Learn the Neck
  - Outline Chord Changes
  - Comp with Voicings
- Give each mode a constrained default UI, preset progression, and one success metric
- De-emphasize advanced controls until the user enters a mode that needs them

#### Phase 2: Build Active Retention (3-5 weeks)

- Turn practice stats into daily goals rather than passive reporting
- Add lightweight challenges: "3 minutes today", "ii-V-I in 3 keys", "Complete one practice session"
- Track weekly milestones based on behaviors already supported by the app
- Add repetition loops to quiz and target-note practice so mistakes reappear intentionally

#### Phase 3: Instrument the Funnel (1-2 weeks)

- Track first-session play rate
- Track first completed guided exercise
- Track repeat use by practice mode
- Track which fretboard controls are actually used before exposing more of them

#### Phase 4: Audio Input (4-6 weeks)

- Add microphone-based pitch detection (Web Audio API + pitch detection library)
- Launch it inside one guided mode first, not as a global capability
- Start with rough but useful feedback: "You hit target notes on chord changes 7/10 times"

#### Phase 5: Distribution (2-3 weeks)

- Landing page with a clear before/after story: from static reference tool to guided practice partner
- PWA install prompt optimization
- SEO for "guitar practice tool", "jazz improvisation practice", "chord tone practice"

**Why this option:** The biggest product gap is not missing theory or missing content. It is missing task framing. Users need to know what to do next, finish something quickly, and feel measurable progress.

---

### Option B: Platform Play (Growth-Oriented)

**Thesis:** Turn FretPad into the Duolingo of guitar improvisation.

#### Phase 1: Structured Curriculum (4-6 weeks)

- Build a lesson/module system on top of the existing engine
- Example modules: "Guide Tones 101", "ii-V-I Mastery", "Blues Improv Fundamentals"
- Each lesson = a progression + specific fretboard overlay + instructions + success criteria
- Progressive difficulty within each module

#### Phase 2: User Accounts & Cloud Sync (3-4 weeks)

- Auth (Clerk/Auth.js), database (Turso/PlanetScale)
- Save custom progressions, track progress, sync across devices
- Extend existing shareable URLs to shareable "lessons"
- User profiles with practice history

#### Phase 3: Community (4-6 weeks)

- User-submitted progressions and lessons
- "Practice rooms" - shared BPM/progression for group practice
- Leaderboards for quiz scores, practice streaks
- Comments and ratings on shared content

#### Phase 4: Monetization (2-3 weeks)

- Free tier: 3 progressions, basic fretboard, 2 backing styles
- Pro ($5-10/month): unlimited progressions, all theory features, audio input, advanced voicings, all styles
- Natural paywall at the "I want more" moment

**Why this option:** If the goal is to build a business, the existing engine is a strong foundation. The theory depth is a genuine moat. Curriculum + accounts + community creates a flywheel.

---

### Option C: Niche & Deep (Own Jazz Education)

**Thesis:** Double down on the jazz/theory audience. The V-System voicings and harmonic analysis are rare and genuinely valuable.

#### Phase 1: Real Book Integration (4-6 weeks)

- "Real Book practice mode" - load any jazz standard by name
- Auto-generate progression from lead sheet data
- Standard-specific practice suggestions ("focus on the bridge turnaround")
- Curated library of 50+ standards with practice notes

#### Phase 2: Advanced Jazz Tools (4-6 weeks)

- Walking bass line visualization on fretboard
- Comping pattern library (Freddie Green, Bud Powell, modern styles)
- Chord melody arranger - show melody + voicing simultaneously
- Guide tone lines visualization across full progression

#### Phase 3: Transcription & Learning (4-6 weeks)

- Transcription viewer - show famous solos mapped onto the fretboard
- Lick library - common jazz vocabulary tagged by chord quality
- "Learn this lick" mode with slow-down and loop
- MIDI import for custom transcriptions

#### Phase 4: Educator Tools (3-4 weeks)

- Teacher accounts that create assignments
- Student progress tracking
- Exportable chord/voicing charts (PDF)
- Partner with jazz educators for curated content

**Why this option:** The jazz education market is underserved by technology. Most tools are either too simple (chord charts) or too academic (notation software). FretPad's fretboard-first approach fills a real gap. The audience is smaller but willing to pay more.

---

## Recommendation

**Option A** is still the strongest path for a solo developer, but it should be executed as guided practice modes rather than skill-level presets. Here's why:

1. **Enough product capability already exists.** The issue is packaging, not raw feature count.

2. **First-session drop-off is likely driven by weak task framing.** A user can see a lot of options, but not necessarily one obvious next action.

3. **Retention should become active before it becomes sophisticated.** FretPad already tracks time and streaks. The next step is to turn those into explicit daily wins.

4. **Audio input is high-upside, but it is not step one.** It becomes much more valuable once it is attached to a defined guided exercise rather than a general-purpose surface.

5. **The right near-term goal is daily usefulness, not broader scope.** If one guitarist uses one mode every day, the product direction becomes much clearer.

Options B and C remain viable future paths if the goal shifts toward business scale or jazz specialization, but both benefit from first clarifying the core daily practice loop.

---

## Key Metrics to Track

Regardless of which option is chosen:

| Metric | What It Tells You |
|--------|-------------------|
| First-session play rate | Do new users actually hit Play? |
| Session duration | How long do they practice? |
| Return rate (D1, D7, D30) | Do they come back? |
| Feature discovery rate | Which controls do they actually use? |
| Progression edit rate | Do they go beyond the default ii-V-I? |
| Quiz completion rate | Is the quiz engaging or abandoned? |

These can be tracked with simple analytics (Plausible, PostHog) without compromising the privacy-first, no-account-needed approach.
