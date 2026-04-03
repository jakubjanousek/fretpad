# CLAUDE.md

## Project Overview

FretPad is a browser-based guitar practice tool that helps guitarists improvise over chord progressions using a visual fretboard, backing loop, and on-demand music theory.

**Current Status:** Pivoting toward guided improvisation practice with real-time pitch detection. Phase 1 (trim) complete. See `docs/PLAN.md` for roadmap.

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

## TDD (Red-Green-Refactor)

All new code follows TDD. This is non-negotiable.

1. **Red:** Write a failing test that describes the desired behavior from the outside (inputs → outputs, public API, observable effects). Do NOT test implementation details.
2. **Green:** Write the minimal code to make the test pass.
3. **Refactor:** Clean up while keeping tests green.

Tests should survive refactors — they test *what* the code does, not *how* it does it. If a test breaks because an internal function was renamed or a module was restructured, the test was wrong.

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

## Plan

The 4-phase pivot plan (trim → modularize → landing page → practice UI) is complete. Archived at `docs/archive/PLAN.md`.

**Default state on load:** ii-V-I in C (`Dm7 | G7 | Cmaj7 | Cmaj7`), 120 BPM
