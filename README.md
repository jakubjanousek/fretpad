# FretPad

A browser-based practice tool for jazz guitar improvisation. Pick a chord progression, get a backing loop, and see the fretboard light up with chord tones, guide tones, and scales — so you can spend practice time playing instead of working out theory.

**▶ Try it live: [fretpad.com](https://fretpad.com)**

<!-- TODO: add a screenshot — drop an image at docs/screenshot.png and uncomment:
![FretPad fretboard view](docs/screenshot.png)
-->

> **Heads up — this is a hobby project, built in the open.**
> I'm not trying to ship a product here. FretPad is where I learn by building: experimenting with audio in the browser, music theory in code, and modern React/Next.js. Things are half-finished, the roadmap shifts, and I leave my mistakes in the commit history on purpose. If that's useful or interesting to you, great. If you spot something I got wrong, even better — tell me.

## What it does

- **Chord progressions** — enter a progression (defaults to a ii-V-I: `Dm7 | G7 | Cmaj7 | Cmaj7`) and play along to a backing loop with a metronome.
- **Visual fretboard** — every chord highlights its notes by role: roots, guide tones (3rds and 7ths), other chord tones, and scale tones.
- **On-demand theory** — suggested scales and chord breakdowns, surfaced when you want them and out of the way when you don't.

It's aimed specifically at **jazz improvisers** — the exercises, defaults, and copy skew toward swing, bebop, and ii-V-I practice rather than general guitar tooling.

## Status

Actively being reworked toward guided improvisation practice with real-time pitch detection. Expect rough edges. The current roadmap lives in `docs/PLAN.md`.

## Tech stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** + shadcn/ui
- **Tone.js** for audio
- **tonal** for music theory
- **Zustand** for state
- **Biome** for lint/format, **Vitest** for tests

New code is written test-first (red-green-refactor).

## Running locally

```bash
pnpm install
pnpm dev        # start the dev server at http://localhost:3000
```

Other useful commands:

```bash
pnpm test       # run the Vitest suite
pnpm validate   # lint + type-check + tests
pnpm build      # production build
```

## Contributing & feedback

This is a personal learning project, so I'm not looking for big feature PRs — but issues, corrections, and "you should really do X" notes are very welcome. If something about the music theory, the audio, or the code looks off, open an issue. Calling out my mistakes is the whole point of building this in public.
