# FretFlow – Implementation Plan (for Claude Code)

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

- Framework: React (Vite or Next.js – your choice)
- Language: TypeScript
- Styling: Tailwind CSS
- Audio: Tone.js
- Music theory: tonal (or similar theory lib)
- State management: Zustand (lightweight) or React Context

**Build Tools:**

- Package manager: pnpm or npm
- Lint/format: ESLint + Prettier
- Testing: Vitest / Jest (optional in MVP)

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
  ├─ src/
  │   ├─ components/
  │   │   ├─ layout/
  │   │   │   └─ AppLayout.tsx
  │   │   ├─ fretboard/
  │   │   │   ├─ Fretboard.tsx
  │   │   │   ├─ FretMarker.tsx
  │   │   │   └─ FretboardLegend.tsx
  │   │   ├─ progression/
  │   │   │   ├─ ProgressionEditor.tsx
  │   │   │   └─ ProgressionPresets.tsx
  │   │   ├─ transport/
  │   │   │   └─ TransportControls.tsx
  │   │   ├─ theory/
  │   │   │   ├─ ChordInfoPanel.tsx
  │   │   │   └─ NoteInfoTooltip.tsx
  │   │   └─ common/
  │   │       └─ Button.tsx
  │   ├─ hooks/
  │   │   ├─ useAudioEngine.ts
  │   │   └─ useFretboardMapping.ts
  │   ├─ lib/
  │   │   ├─ theory/
  │   │   │   ├─ chords.ts
  │   │   │   ├─ scales.ts
  │   │   │   └─ progression.ts
  │   │   ├─ fretboard.ts
  │   │   └─ types.ts
  │   ├─ state/
  │   │   └─ useAppStore.ts
  │   ├─ pages/ (or routes/)
  │   │   └─ App.tsx / index.tsx
  │   └─ main.tsx
  ├─ public/
  ├─ package.json
  ├─ tsconfig.json
  ├─ vite.config.ts / next.config.mjs
  ├─ tailwind.config.js
  └─ docs/
      └─ IMPLEMENTATION_PLAN.md  (this file)
```

---

## 5. Data Model & Types

Put these in `src/lib/types.ts` (Claude can extend/refine as needed):

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

export interface Chord {
  symbol: ChordSymbol;
  root: NoteName;
  quality: "maj7" | "m7" | "7" | "m7b5" | "dim" | "other";
  notes: NoteName[];
  guideTones: NoteName[]; // usually 3rd & 7th
  suggestedScales: string[]; // ["C Ionian"], etc.
}

export interface ProgressionBar {
  id: string;
  beats: number; // e.g. 4
  chords: ChordSymbol[]; // simple for MVP: 1 chord per bar
}

export interface Progression {
  id: string;
  name: string;
  bars: ProgressionBar[];
}

export interface FretPosition {
  string: number; // 1 = high E, 6 = low E
  fret: number; // 0 = open
}

export interface FretNote extends FretPosition {
  note: NoteName;
  isChordTone: boolean;
  isGuideTone: boolean;
  isScaleTone: boolean;
}
```

---

## 6. Implementation Milestones (for Claude Code)

> **Tip for using Claude Code:**
> At each milestone, tell Claude:
> “You are working inside a repo that follows `docs/IMPLEMENTATION_PLAN.md`. Please implement step X now.”

### Milestone 1 – Project Setup

Tasks:

1. Initialize project:

   - `npm create vite@latest` (React + TS) OR `npx create-next-app@latest`
   - Add Tailwind CSS
   - Install deps: `tone`, `@tonaljs/tonal`, `zustand`

2. Create basic layout:

   - Top header with app name
   - Three main sections: **Progression Editor**, **Fretboard**, **Transport/Theory**

**Prompt example for Claude:**

```txt
Create a new React + TypeScript + Vite project (if not existing yet).
Set up Tailwind CSS, install tone, @tonaljs/tonal, and zustand.
Implement an AppLayout component that has a header and three main regions:
- left/top: chord progression editor placeholder
- center: fretboard visualization placeholder
- bottom: transport controls placeholder.
Use a minimal, clean design.
```

---

### Milestone 2 – Theory Layer (Data, No UI Yet)

Tasks:

1. Implement chord parsing + info helpers in `src/lib/theory/chords.ts`:

   - Input: `"Cmaj7"`, `"Dm7"`, `"G7"`
   - Output: `Chord` object (notes, guide tones)

2. Implement scale suggestions in `src/lib/theory/scales.ts`:

   - For basic jazz/pop use:

     - maj7 → Ionian
     - m7 → Dorian
     - 7 → Mixolydian

   - Keep this simple for MVP.

3. Implement progression parsing in `src/lib/theory/progression.ts`:

   - Convert simple text or array into `Progression`.

**Prompt example for Claude:**

```txt
In src/lib/theory/chords.ts and src/lib/theory/scales.ts, use @tonaljs/tonal to implement helpers:
- parseChordSymbol(symbol: string): Chord
- getSuggestedScalesForChord(chord: Chord): string[]
Support at least: maj7, m7, 7, m7b5, dim.
Use NoteName and Chord interfaces from src/lib/types.ts.
Write a couple of basic unit tests demonstrating usage, but keep it minimal.
```

---

### Milestone 3 – Fretboard Visualization

Tasks:

1. Implement `src/lib/fretboard.ts`:

   - Generate fretboard layout (e.g. frets 0–12)
   - Map tuning to notes (standard EADGBE)
   - Given a `Chord` and optional scale, produce array of `FretNote`.

2. Implement `<Fretboard />`:

   - Props:

     - `fretNotes: FretNote[]`
     - `numFrets` (default 12)

   - Render grid (strings x frets) using divs/SVG.
   - Visual style:

     - Minimal, clear
     - Different visual treatment for:

       - root
       - other chord tones
       - guide tones
       - optionally scale tones

3. Implement hover/click behavior:

   - On hover: show tooltip (use `NoteInfoTooltip`) with:

     - Note name
     - Interval

**Prompt example for Claude:**

```txt
Implement a fretboard mapping utility in src/lib/fretboard.ts that:
- Assumes standard tuning EADGBE.
- Maps frets 0–12 to NoteName for each string.
- Exposes a function getFretNotesForChord(chord: Chord, options?: { includeScale?: boolean, scaleName?: string }) that returns FretNote[].

Then implement a Fretboard React component in src/components/fretboard/Fretboard.tsx that:
- Renders a simple grid (6 strings x N frets).
- Displays notes as circles with minimal styling.
- Highlights root, other chord tones, and guide tones differently.
- Supports hover to show a tooltip (NoteInfoTooltip) with note name and interval.
Use Tailwind for styling, keep the visuals clean.
```

---

### Milestone 4 – Progression Editor & State

Tasks:

1. Implement global store in `src/state/useAppStore.ts` (Zustand):

   - Current progression
   - Selected bar/chord index
   - Current chord for visualization
   - Tempo, isPlaying, etc.

2. Implement `<ProgressionEditor />`:

   - For MVP: simple list of bars, each with a single chord input.
   - A few buttons:

     - “Add bar”
     - “Use preset: ii–V–I in C”

   - Clicking on a bar sets the “current chord” in the store.

3. Connect `ProgressionEditor` ⇄ `Fretboard`:

   - When current chord changes, recompute fretNotes and update Fretboard.

**Prompt example:**

```txt
Implement a Zustand store in src/state/useAppStore.ts to hold:
- progression: Progression
- currentBarIndex: number
- currentChord: Chord | null
- tempo: number
- isPlaying: boolean

Then implement ProgressionEditor that:
- Renders bars with a simple text input for chord symbol.
- Parses chord symbols using parseChordSymbol.
- When a bar is clicked, sets currentChord in the store.
Finally, wire Fretboard to read currentChord from the store and display its fret notes.
```

---

### Milestone 5 – Playback / Loop Engine

Tasks:

1. Implement `useAudioEngine` hook in `src/hooks/useAudioEngine.ts`:

   - Uses Tone.js
   - Exposes functions:

     - `start()`
     - `stop()`
     - `setTempo(bpm)`

   - For MVP:

     - Play a simple click or root note of each chord on downbeats.

2. Implement `<TransportControls />`:

   - Play/stop buttons
   - Tempo slider/input
   - Hook into global store and `useAudioEngine`.

3. Integrate with progression:

   - On play: step through progression bars in time.
   - For now, even a simple “one chord per bar at given BPM, 4 beats” is enough.

**Prompt example:**

```txt
Implement useAudioEngine in src/hooks/useAudioEngine.ts using Tone.js.
It should:
- create a Transport
- have functions start, stop, setTempo
- on each bar, trigger a simple sound (e.g., a synth or click) aligned with the progression's current chord.

Then implement TransportControls that:
- Controls play/stop and tempo.
- Uses the global store for tempo and isPlaying.
- Wires play/stop to useAudioEngine.
Keep the UI minimal and clean.
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
Implement ChordInfoPanel which displays information about the currently selected chord:
- symbol
- root
- notes
- guide tones
- suggestedScales

Implement NoteInfoTooltip as a small tooltip component that shows:
- note name
- interval relative to the chord root and quality (e.g., 3, b3, 5, b7).

Integrate these with Fretboard and AppLayout so that:
- The ChordInfoPanel is always visible in a side/bottom panel.
- NoteInfoTooltip appears on hover over fret markers.
Keep visual noise low.
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

- Support multiple chords per bar
- Voice-leading arrows between chord tones
- Scale degree paths (e.g., “follow 3rds and 7ths through progression”)
- More musical backing tracks vs. simple click
