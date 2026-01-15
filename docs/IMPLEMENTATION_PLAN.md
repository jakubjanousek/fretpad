# FretFlow – Implementation Plan (for Claude Code)

## Progress Tracker

### Milestone 1 – Project Setup
- [x] Next.js + TypeScript initialized
- [x] Tailwind CSS configured
- [x] shadcn/ui components installed
- [x] Dependencies installed (tone, tonal, zustand)
- [x] Basic app layout with header and three regions
- [x] `lib/types.ts` with all type definitions

### Milestone 2 – Theory Layer
- [x] `lib/theory/chords.ts` - parseChordSymbol, getGuideTones
- [x] `lib/theory/scales.ts` - getSuggestedScalesForChord
- [x] `lib/theory/progression.ts` - parseProgression (with multi-chord bars)

### Milestone 3 – Fretboard Visualization
- [x] `lib/fretboard.ts` - getFretNotesForChord
- [x] `components/fretboard/Fretboard.tsx` - grid rendering
- [x] `components/fretboard/FretMarker.tsx` - note circles with colors
- [x] Hover tooltips working

### Milestone 4 – Progression Editor & State
- [x] `state/useAppStore.ts` - Zustand store with default preset
- [x] `components/progression/ProgressionEditor.tsx` - bar inputs
- [x] `components/progression/ProgressionPresets.tsx` - preset buttons
- [x] Fretboard updates when chord selection changes

### Milestone 5 – Playback Engine
- [ ] `hooks/useAudioEngine.ts` - Tone.js transport
- [ ] `components/transport/TransportControls.tsx` - play/stop/tempo
- [ ] Playback advances through chords and updates fretboard
- [ ] Loop functionality

### Milestone 6 – Theory UI
- [ ] `components/theory/ChordInfoPanel.tsx` - chord details
- [ ] `components/theory/NoteInfoTooltip.tsx` - interval display
- [ ] Hover/click interactions wired up

---

## 1. Project Overview

**Goal:**
Build a browser-based practice tool that helps guitarists improvise over chord progressions using a **visual fretboard**, **backing loop**, and **on-demand theory**.

**MVP Focus:**

- Practice-only (no live audio input)
- Web app (desktop-first, mobile-friendly)
- Visual, clean UI
- User flow:

  1. Enter chord progression
  2. See chord tones & guide tones on fretboard
  3. Optionally see scale notes
  4. Start a loop and practice

---

## 2. Tech Stack

**Frontend:**

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- UI Components: shadcn/ui (Radix-based)
- Audio: Tone.js
- Music theory: tonal
- State management: Zustand

**Build Tools:**

- Package manager: npm
- Lint/format: Biome
- Testing: Vitest (optional in MVP)

---

## 3. High-Level Features (MVP)

1. **Chord Progression Editor**

   - Text-like chord entry (`| Cmaj7 | Dm7 G7 | Cmaj7 |`), or bar-based inputs
   - Validates chords & parses them into internal structures
   - Basic presets: ii–V–I, 12-bar blues, pop I–V–vi–IV

2. **Fretboard Visualization**

   - Fretboard component with:

     - String/fret grid
     - Note dots

   - Layers:

     - Chord tones (default)
     - Guide tones (3rds & 7ths) highlighted
     - Optional scale notes (toggle)

3. **Playback / Loop Engine**

   - Tempo control (BPM)
   - Play/stop
   - Loop over entire progression
   - Simple backing track (e.g. triads, basic comp, or just a metronome at first)

4. **On-Demand Theory**

   - Click/hover chord name → small popover:

     - Notes in chord
     - Suggested scale name
     - Intervals (1, 3, 5, 7, etc.)

   - Click/hover note on fretboard → shows:

     - Note name
     - Interval relative to chord (e.g. “b3”, “5”)

5. **Basic Layout**

   - Top: Progression entry + transport (play, stop, tempo)
   - Middle: Fretboard visualization
   - Bottom/right: Theory panel (contextual)

---

## 4. Suggested Folder Structure

```txt
fretflow/
  ├─ app/
  │   ├─ layout.tsx
  │   ├─ page.tsx
  │   └─ globals.css
  ├─ components/
  │   ├─ ui/                    # shadcn components (already exists)
  │   │   ├─ button.tsx
  │   │   └─ ...
  │   ├─ fretboard/
  │   │   ├─ Fretboard.tsx
  │   │   ├─ FretMarker.tsx
  │   │   └─ FretboardLegend.tsx
  │   ├─ progression/
  │   │   ├─ ProgressionEditor.tsx
  │   │   └─ ProgressionPresets.tsx
  │   ├─ transport/
  │   │   └─ TransportControls.tsx
  │   └─ theory/
  │       ├─ ChordInfoPanel.tsx
  │       └─ NoteInfoTooltip.tsx
  ├─ hooks/
  │   ├─ useAudioEngine.ts
  │   └─ useFretboardMapping.ts
  ├─ lib/
  │   ├─ theory/
  │   │   ├─ chords.ts
  │   │   ├─ scales.ts
  │   │   └─ progression.ts
  │   ├─ fretboard.ts
  │   ├─ types.ts
  │   └─ utils.ts               # already exists
  ├─ state/
  │   └─ useAppStore.ts
  ├─ public/
  ├─ package.json
  ├─ tsconfig.json
  ├─ next.config.ts
  └─ docs/
      └─ IMPLEMENTATION_PLAN.md  (this file)
```

---

## 5. Data Model & Types

Put these in `lib/types.ts` (Claude can extend/refine as needed):

```ts
export type NoteName =
  | "C"
  | "C#"
  | "Db"
  | "D"
  | "D#"
  | "Eb"
  | "E"
  | "F"
  | "F#"
  | "Gb"
  | "G"
  | "G#"
  | "Ab"
  | "A"
  | "A#"
  | "Bb"
  | "B";

export type ChordSymbol = string; // e.g. "Cmaj7", "Dm7", "G7"

// Common chord qualities - use tonal for parsing, this is for display/logic
export type ChordQuality =
  | "maj"      // C, Cmaj
  | "min"      // Cm, Cmin
  | "maj7"     // Cmaj7
  | "min7"     // Cm7, Cmin7
  | "7"        // C7 (dominant)
  | "min7b5"   // Cm7b5, Cø
  | "dim"      // Cdim
  | "dim7"     // Cdim7
  | "aug"      // Caug, C+
  | "sus2"     // Csus2
  | "sus4"     // Csus4
  | "6"        // C6
  | "min6"     // Cm6
  | "9"        // C9
  | "maj9"     // Cmaj9
  | "min9"     // Cm9
  | "add9"     // Cadd9
  | "other";   // fallback for complex chords

export interface Chord {
  symbol: ChordSymbol;
  root: NoteName;
  quality: ChordQuality;
  notes: NoteName[];
  guideTones: NoteName[]; // usually 3rd & 7th (or 3rd & 6th for 6 chords)
  suggestedScales: string[]; // ["C Ionian"], etc.
}

export interface BarChord {
  chord: ChordSymbol;
  beats: number; // how many beats this chord occupies in the bar
}

export interface ProgressionBar {
  id: string;
  totalBeats: number; // e.g. 4 for 4/4 time
  chords: BarChord[]; // 1-2 chords per bar, beats should sum to totalBeats
}

export interface Progression {
  id: string;
  name: string;
  timeSignature: { numerator: number; denominator: number }; // e.g. { 4, 4 }
  bars: ProgressionBar[];
}

export interface FretPosition {
  string: number; // 1 = high E, 6 = low E (standard guitar convention)
  fret: number; // 0 = open
}

export interface FretNote extends FretPosition {
  note: NoteName;
  interval: string; // e.g. "1", "b3", "5", "b7"
  isRoot: boolean;
  isChordTone: boolean;
  isGuideTone: boolean;
  isScaleTone: boolean;
}

// Standard tuning - can be extended later for alternate tunings
export const STANDARD_TUNING: NoteName[] = ["E", "B", "G", "D", "A", "E"]; // high to low (string 1-6)
```

---

## 5b. Visual Design Tokens

Use these color conventions for fretboard note visualization:

| Note Type | Color | Tailwind Class |
|-----------|-------|----------------|
| Root | Red/Orange | `bg-orange-500` |
| Guide Tone (3rd, 7th) | Blue | `bg-blue-500` |
| Other Chord Tone | Green | `bg-emerald-500` |
| Scale Tone (non-chord) | Gray | `bg-slate-400` |
| Inactive/Muted | Light Gray | `bg-slate-200` |

Note labels should be white text on colored backgrounds for contrast.

---

## 5c. Default State & Error Handling

**Initial State (on app load):**
- Load a default preset: **ii-V-I in C** (`| Dm7 | G7 | Cmaj7 | Cmaj7 |`)
- Tempo: 120 BPM
- Current chord: First chord of progression (Dm7)
- Fretboard shows chord tones for current chord

**Error Handling for Chord Input:**
- If chord cannot be parsed by tonal, show inline error below input
- Keep previous valid chord until new valid input is entered
- Provide hint: "Try: Cmaj7, Dm7, G7, Am"

---

## 6. Implementation Milestones (for Claude Code)

> **Tip for using Claude Code:**
> At each milestone, tell Claude:
> “You are working inside a repo that follows `docs/IMPLEMENTATION_PLAN.md`. Please implement step X now.”

### Milestone 1 – Project Setup

Tasks:

1. Project already initialized with:
   - Next.js + TypeScript ✓
   - Tailwind CSS ✓
   - shadcn/ui components ✓
   - Dependencies: `tone`, `tonal`, `zustand` ✓

2. Create basic layout:

   - Top header with app name
   - Three main sections: **Progression Editor**, **Fretboard**, **Transport/Theory**

**Prompt example for Claude:**

```txt
Implement the main app layout in app/page.tsx that has a header and three main regions:
- top: chord progression editor placeholder
- center: fretboard visualization placeholder
- bottom: transport controls and theory panel placeholder.
Use shadcn/ui components where appropriate. Use a minimal, clean design.
```

---

### Milestone 2 – Theory Layer (Data, No UI Yet)

Tasks:

1. Implement chord parsing + info helpers in `lib/theory/chords.ts`:

   - Input: `"Cmaj7"`, `"Dm7"`, `"G7"`
   - Output: `Chord` object (notes, guide tones, interval info)

2. Implement scale suggestions in `lib/theory/scales.ts`:

   - For basic jazz/pop use:

     - maj/maj7 → Ionian
     - min/min7 → Dorian
     - 7 → Mixolydian
     - min7b5 → Locrian
     - dim7 → Diminished (whole-half)

   - Keep this simple for MVP.

3. Implement progression parsing in `lib/theory/progression.ts`:

   - Convert simple text or array into `Progression`
   - Support multiple chords per bar: `| Dm7 G7 |` = two chords, 2 beats each

**Prompt example for Claude:**

```txt
In lib/theory/chords.ts and lib/theory/scales.ts, use tonal to implement helpers:
- parseChordSymbol(symbol: string): Chord | null
- getSuggestedScalesForChord(chord: Chord): string[]
- getIntervalName(root: NoteName, note: NoteName): string
Support all ChordQuality types from lib/types.ts.
Return null for invalid chord input (for error handling).
```

---

### Milestone 3 – Fretboard Visualization

Tasks:

1. Implement `lib/fretboard.ts`:

   - Generate fretboard layout (e.g. frets 0–12)
   - Map tuning to notes (standard EADGBE using STANDARD_TUNING constant)
   - Given a `Chord` and optional scale, produce array of `FretNote`

2. Implement `<Fretboard />`:

   - Props:

     - `fretNotes: FretNote[]`
     - `numFrets` (default 12)

   - Render grid (strings x frets) using divs or SVG
   - Visual style using design tokens from section 5b:

     - Root: orange
     - Guide tones: blue
     - Other chord tones: green
     - Scale tones: gray

3. Implement hover/click behavior:

   - On hover: show tooltip (use `NoteInfoTooltip`) with:

     - Note name
     - Interval (e.g., "b3", "5", "b7")

**Prompt example for Claude:**

```txt
Implement a fretboard mapping utility in lib/fretboard.ts that:
- Uses STANDARD_TUNING from lib/types.ts
- Maps frets 0–12 to NoteName for each string
- Exposes getFretNotesForChord(chord: Chord, options?: { includeScale?: boolean, scaleName?: string }): FretNote[]

Then implement a Fretboard React component in components/fretboard/Fretboard.tsx that:
- Renders a grid (6 strings x N frets)
- Uses color tokens: root=orange-500, guide=blue-500, chord=emerald-500, scale=slate-400
- Supports hover to show NoteInfoTooltip with note name and interval
Use Tailwind for styling. Keep the visuals clean and minimal.
```

---

### Milestone 4 – Progression Editor & State

Tasks:

1. Implement global store in `state/useAppStore.ts` (Zustand):

   - Current progression (initialized with ii-V-I preset per section 5c)
   - Selected bar index and chord index within bar
   - Current chord for visualization
   - Tempo (default 120), isPlaying, etc.

2. Implement `<ProgressionEditor />`:

   - Bar-based view, each bar can have 1-2 chords
   - Support splitting a bar: entering two chords like "Dm7 G7" creates two BarChords
   - A few buttons:

     - "Add bar"
     - Preset buttons: "ii–V–I in C", "12-bar blues", "I–V–vi–IV"

   - Clicking on a chord sets the "current chord" in the store
   - Show inline error for invalid chord input (per section 5c)

3. Connect `ProgressionEditor` ⇄ `Fretboard`:

   - When current chord changes, recompute fretNotes and update Fretboard

**Prompt example:**

```txt
Implement a Zustand store in state/useAppStore.ts to hold:
- progression: Progression (default: ii-V-I in C)
- currentBarIndex: number
- currentChordIndex: number (for multiple chords per bar)
- currentChord: Chord | null
- tempo: number (default 120)
- isPlaying: boolean

Then implement ProgressionEditor that:
- Renders bars with inputs for chord symbols (support 1-2 chords per bar)
- Parses chord symbols using parseChordSymbol, shows error for invalid input
- When a chord is clicked, sets currentChord in the store
Wire Fretboard to read currentChord from the store and display its fret notes.
```

---

### Milestone 5 – Playback / Loop Engine

Tasks:

1. Implement `useAudioEngine` hook in `hooks/useAudioEngine.ts`:

   - Uses Tone.js
   - Exposes functions:

     - `start()`
     - `stop()`
     - `setTempo(bpm)`

   - For MVP backing track options (in order of complexity):

     - Option A: Metronome click only
     - Option B: Root note of each chord (bass sound)
     - Option C: Simple piano/synth chord voicing

   - Start with Option A or B, can enhance later

2. Implement `<TransportControls />`:

   - Play/stop buttons
   - Tempo slider/input (range: 40-200 BPM)
   - Hook into global store and `useAudioEngine`

3. Integrate with progression:

   - On play: step through progression bars and chords in time
   - Respect multiple chords per bar (e.g., 2 chords = each gets half the beats)
   - Update `currentChord` in store as playback progresses
   - Loop back to start when progression ends

**Prompt example:**

```txt
Implement useAudioEngine in hooks/useAudioEngine.ts using Tone.js.
It should:
- Create a Transport and schedule events for each chord in the progression
- Have functions start, stop, setTempo
- On each chord change, trigger a click or root note sound
- Update the store's currentBarIndex and currentChordIndex as playback progresses
- Handle multiple chords per bar (divide beats accordingly)

Then implement TransportControls that:
- Has play/stop buttons and tempo slider (40-200 BPM)
- Uses the global store for tempo and isPlaying
- Wires play/stop to useAudioEngine
Keep the UI minimal and clean. Use shadcn/ui components.
```

---

### Milestone 6 – On-Demand Theory UI

Tasks:

1. `<ChordInfoPanel />`:

   - Shows info for currently selected chord:

     - Symbol, notes, guide tones, suggested scales.

   - Simple, text-first design.

2. `<NoteInfoTooltip />`:

   - Reusable tooltip component used in Fretboard.
   - Displays:

     - Note name
     - Interval (“3rd”, “b7”)

   - Uses theory helper to compute interval.

3. Wire up hover/click interactions.

**Prompt example:**

```txt
Implement ChordInfoPanel in components/theory/ChordInfoPanel.tsx which displays:
- symbol, root, quality
- notes (all chord tones)
- guide tones (highlighted)
- suggestedScales

Implement NoteInfoTooltip in components/theory/NoteInfoTooltip.tsx as a small tooltip:
- note name
- interval relative to the chord root (e.g., "1", "b3", "5", "b7")

Integrate these with Fretboard and the main layout so that:
- ChordInfoPanel is always visible in the bottom panel
- NoteInfoTooltip appears on hover over fret markers
Use shadcn/ui Tooltip component. Keep visual noise low.
```

---

## 7. Non-Goals for MVP

Explicitly **do not** implement (so Claude doesn’t wander):

- Audio input / recording from guitar
- AI feedback on note choices
- Lick libraries
- Social/sharing features
- Complex chord substitutions & reharmonization

---

## 8. After MVP

Once MVP is stable, possible next steps:

- Voice-leading arrows between chord tones
- Scale degree paths (e.g., "follow 3rds and 7ths through progression")
- More musical backing tracks (piano comp, guitar strums)
- Alternate tunings support (Drop D, DADGAD, etc.)
- Left-handed fretboard view toggle
- Note label display options (note names, intervals, or none)
- Save/load progressions (localStorage or URL sharing)
- More time signatures (3/4, 6/8)
- Swing/shuffle feel option
