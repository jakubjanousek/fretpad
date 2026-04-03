"use client";

import { ArrowRight, Headphones, Mic, Music, Waves } from "lucide-react";
import { DM_Serif_Display } from "next/font/google";
import Link from "next/link";

const display = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const FEATURES = [
  {
    icon: Music,
    label: "Live backing tracks",
    detail:
      "Bass, drums, and chords in 10 styles. Practice over real music, not a metronome.",
  },
  {
    icon: Mic,
    label: "Pitch detection",
    detail:
      "The app listens through your mic and scores how well you hit the chord tones.",
  },
  {
    icon: Waves,
    label: "Visual fretboard",
    detail:
      "See roots, guide tones, and scale notes color-coded in real time as chords change.",
  },
  {
    icon: Headphones,
    label: "Theory on demand",
    detail:
      "Chord info, suggested scales, and approach patterns — there when you need them.",
  },
] as const;

function FretboardGraphic() {
  const strings = 6;
  const frets = 5;
  const notes = [
    { s: 1, f: 1, type: "guide" },
    { s: 2, f: 0, type: "root" },
    { s: 3, f: 2, type: "chord" },
    { s: 4, f: 0, type: "guide" },
    { s: 5, f: 3, type: "root" },
    { s: 6, f: 3, type: "chord" },
    { s: 1, f: 3, type: "scale" },
    { s: 3, f: 4, type: "scale" },
    { s: 5, f: 1, type: "guide" },
  ];

  const colors: Record<string, string> = {
    root: "fill-orange-500",
    guide: "fill-blue-500",
    chord: "fill-emerald-500",
    scale: "fill-slate-400",
  };

  const glows: Record<string, string> = {
    root: "drop-shadow(0 0 6px rgba(249,115,22,0.6))",
    guide: "drop-shadow(0 0 5px rgba(59,130,246,0.5))",
    chord: "drop-shadow(0 0 4px rgba(16,185,129,0.4))",
    scale: "none",
  };

  const sw = 260;
  const sh = 160;
  const px = 30;
  const py = 16;
  const fretW = (sw - px * 2) / frets;
  const stringH = (sh - py * 2) / (strings - 1);

  return (
    <svg
      viewBox={`0 0 ${sw} ${sh}`}
      className="w-full max-w-sm opacity-90"
      aria-hidden="true"
    >
      {/* Fretboard background */}
      <rect
        x={px - 4}
        y={py - 6}
        width={sw - px * 2 + 8}
        height={sh - py * 2 + 12}
        rx="4"
        className="fill-amber-800/10"
      />
      {/* Nut */}
      <line
        x1={px}
        y1={py - 4}
        x2={px}
        y2={sh - py + 4}
        className="stroke-slate-500"
        strokeWidth="3"
      />
      {/* Fret lines */}
      {Array.from({ length: frets }, (_, i) => (
        <line
          key={`fret-${i}`}
          x1={px + fretW * (i + 1)}
          y1={py - 2}
          x2={px + fretW * (i + 1)}
          y2={sh - py + 2}
          className="stroke-slate-600/50"
          strokeWidth="1"
        />
      ))}
      {/* Strings */}
      {Array.from({ length: strings }, (_, i) => (
        <line
          key={`string-${i}`}
          x1={px - 2}
          y1={py + stringH * i}
          x2={sw - px + 2}
          y2={py + stringH * i}
          className="stroke-slate-500/50"
          strokeWidth={0.8 + i * 0.2}
        />
      ))}
      {/* Fret dots */}
      {[3, 5].map(
        (f) =>
          f <= frets && (
            <circle
              key={`dot-${f}`}
              cx={px + fretW * (f - 0.5)}
              cy={sh / 2}
              r="3"
              className="fill-slate-600/30"
            />
          ),
      )}
      {/* Notes */}
      {notes.map((n) => (
        <circle
          key={`${n.s}-${n.f}`}
          cx={px + (n.f === 0 ? -10 : fretW * (n.f - 0.5))}
          cy={py + stringH * (n.s - 1)}
          r="7"
          className={colors[n.type]}
          style={{ filter: glows[n.type] }}
        >
          <animate
            attributeName="opacity"
            values="0;1"
            dur="0.4s"
            begin={`${0.8 + (n.s + n.f) * 0.08}s`}
            fill="freeze"
            calcMode="spline"
            keySplines="0.4 0 0.2 1"
          />
        </circle>
      ))}
    </svg>
  );
}

export function LandingPage() {
  return (
    <div className={`${display.variable} relative min-h-screen`}>
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-950 to-stone-900" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,_rgba(251,146,60,0.06)_0%,_transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[radial-gradient(ellipse,_rgba(59,130,246,0.04)_0%,_transparent_70%)]" />
        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Logo */}
      <div className="relative z-10 px-6 sm:px-10 pt-8 sm:pt-10 max-w-6xl mx-auto">
        <span className="text-sm font-semibold tracking-[0.2em] uppercase text-stone-400">
          FretPad
        </span>
      </div>

      {/* Hero */}
      <main className="relative z-10">
        <section className="px-6 sm:px-10 pt-12 sm:pt-20 pb-20 sm:pb-28 max-w-6xl mx-auto">
          <div className="space-y-8">
            {/* Kicker */}
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-orange-500/60" />
              <span className="text-xs font-medium tracking-[0.25em] uppercase text-orange-400">
                Guitar practice tool
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.4rem,6vw,4.2rem)] leading-[1.05] tracking-[-0.02em] text-stone-50">
              Play over changes.{" "}
              <span className="text-stone-500">Hear what you land on.</span>
            </h1>

            {/* Subhead */}
            <p className="text-lg sm:text-xl leading-relaxed text-stone-400 max-w-2xl">
              FretPad plays a backing track, shows you the chord tones on a
              fretboard, and listens as you improvise. No install, no account —
              just open and play.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/practice/outline-chord-changes"
                className="group inline-flex items-center gap-2.5 rounded-full bg-stone-50 px-7 py-3.5 text-sm font-medium text-stone-900 transition-all hover:gap-3.5 hover:shadow-lg hover:shadow-orange-400/10 active:scale-[0.98]"
              >
                Start practicing
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <span className="text-sm text-stone-500">
                Free. Works in any browser.
              </span>
            </div>
          </div>

          {/* Fretboard visual */}
          <div className="mt-16 sm:mt-20 flex justify-center">
            <div className="relative w-full max-w-lg">
              {/* Glow behind fretboard */}
              <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-orange-400/40 via-blue-400/20 to-emerald-400/30" />
              <div className="relative rounded-2xl border border-stone-800/60 bg-stone-900/50 backdrop-blur-sm p-6 sm:p-8">
                <FretboardGraphic />
                {/* Legend */}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    Root
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    Guide tone
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Chord tone
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                    Scale tone
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 sm:px-10 pb-24 sm:pb-32 max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="group rounded-2xl border border-stone-800/50 bg-stone-900/30 backdrop-blur-sm p-6 transition-colors hover:border-orange-700/30"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-stone-800 text-stone-300 transition-colors group-hover:bg-orange-900/30 group-hover:text-orange-400">
                  <f.icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-semibold text-stone-200">
                  {f.label}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-400">
                  {f.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 sm:px-10 pb-10 max-w-6xl mx-auto">
          <div className="border-t border-stone-800/50 pt-6 flex items-center justify-between text-xs text-stone-500">
            <span>FretPad</span>
            <span>No account needed. Your data stays in your browser.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
