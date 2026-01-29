# CLAUDE.md

## Project Overview

FretFlow is a browser-based guitar practice tool that helps guitarists improvise over chord progressions using a visual fretboard, backing loop, and on-demand music theory.

**Current Status:** Core MVP complete (fretboard, progression editor, audio engine with styles, metronome, playhead). See `docs/IMPROVEMENT_PLAN.md` for roadmap.

## Commands

```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm test       # Run Vitest tests
pnpm lint       # Run Biome linter
pnpm format     # Format with Biome
pnpm type-check # TypeScript type checking (tsc --noEmit)
pnpm validate   # Run all checks: lint + type-check + tests
```

**After making changes, run `pnpm validate` to verify nothing is broken.**

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Audio:** Tone.js
- **Music Theory:** tonal library
- **State:** Zustand
- **Lint/Format:** Biome (not ESLint)

## Coding Conventions

- Use shadcn/ui components from `@/components/ui/`
- Import paths use `@/` alias for project root
- Keep components minimal and clean
- Types are defined in `lib/types.ts`

## Fretboard Color Tokens

| Note Type | Tailwind Class |
|-----------|----------------|
| Root | `bg-orange-500` |
| Guide Tone (3rd, 7th) | `bg-blue-500` |
| Other Chord Tone | `bg-emerald-500` |
| Scale Tone (non-chord) | `bg-slate-400` |
| Inactive/Muted | `bg-slate-200` |

## Key Types (lib/types.ts)

- `Chord` - Parsed chord with root, quality, notes, guideTones, suggestedScales
- `Progression` - Collection of bars with time signature
- `ProgressionBar` - Contains 1-2 chords with beat divisions
- `FretNote` - Note position on fretboard with interval and role flags
- `MetronomeConfig` - Metronome settings (enabled, volume, countIn)
- `STANDARD_TUNING` - ["E", "B", "G", "D", "A", "E"] (high to low)

## Folder Structure

```
app/           # Next.js pages
components/
  ui/          # shadcn components
  fretboard/   # Fretboard visualization
  progression/ # Chord progression editor
  transport/   # Playback controls
  theory/      # Theory info panels
hooks/         # Custom React hooks
lib/
  audio/       # Audio engine (styles/, instruments/, scheduler.ts, voicings.ts)
  theory/      # Music theory helpers (chords.ts, scales.ts, progression.ts)
  errors.ts    # Custom error types
  fretboard.ts # Fretboard mapping utilities
  id.ts        # ID generation utility
  types.ts     # Type definitions
state/         # Zustand stores
__tests__/     # Vitest test suite
```

## Implementation Plan

See `docs/IMPLEMENTATION_PLAN.md` for original milestone breakdown and `docs/IMPROVEMENT_PLAN.md` for the current roadmap with progress tracking.

**Default state on load:** ii-V-I in C (`Dm7 | G7 | Cmaj7 | Cmaj7`), 120 BPM
