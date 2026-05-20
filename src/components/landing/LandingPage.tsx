"use client";

import { track } from "@vercel/analytics";
import { ArrowRight, Guitar, Mic, Music, Waves } from "lucide-react";
import { DM_Serif_Display } from "next/font/google";
import Link from "next/link";
import { useEffect, useState } from "react";

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
      "Bass, drums, and chords in a jazz swing style. Practice over a real groove, not a metronome.",
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
    icon: Guitar,
    label: "Chord voicings",
    detail:
      "Voice-led chord diagrams that minimize hand movement through the progression.",
  },
] as const;

type NoteType = "root" | "guide" | "chord";

const CHORD_FRAMES: ReadonlyArray<{
  name: string;
  notes: ReadonlyArray<{ s: number; f: number; type: NoteType }>;
}> = [
  {
    name: "Dm7",
    notes: [
      { s: 4, f: 0, type: "root" }, // D
      { s: 2, f: 3, type: "root" }, // D
      { s: 5, f: 3, type: "guide" }, // C (b7)
      { s: 3, f: 5, type: "guide" }, // C
      { s: 4, f: 3, type: "guide" }, // F (b3)
      { s: 1, f: 1, type: "guide" }, // F
      { s: 3, f: 2, type: "chord" }, // A
      { s: 5, f: 0, type: "chord" }, // A
    ],
  },
  {
    name: "G7",
    notes: [
      { s: 6, f: 3, type: "root" }, // G
      { s: 1, f: 3, type: "root" }, // G
      { s: 5, f: 2, type: "guide" }, // B (3)
      { s: 2, f: 0, type: "guide" }, // B
      { s: 4, f: 3, type: "guide" }, // F (b7)
      { s: 1, f: 1, type: "guide" }, // F
      { s: 4, f: 0, type: "chord" }, // D (5)
      { s: 5, f: 5, type: "chord" }, // D
    ],
  },
  {
    name: "Cmaj7",
    notes: [
      { s: 5, f: 3, type: "root" }, // C
      { s: 2, f: 1, type: "root" }, // C
      { s: 5, f: 2, type: "guide" }, // B (maj7)
      { s: 2, f: 0, type: "guide" }, // B
      { s: 4, f: 2, type: "guide" }, // E (3)
      { s: 1, f: 0, type: "guide" }, // E
      { s: 3, f: 0, type: "chord" }, // G (5)
      { s: 6, f: 3, type: "chord" }, // G
    ],
  },
];

const FRAME_DURATION_MS = 2200;

function FretboardGraphic({ frameIndex }: { frameIndex: number }) {
  const strings = 6;
  const frets = 5;
  const frame = CHORD_FRAMES[frameIndex] ?? CHORD_FRAMES[0];
  if (!frame) return null;

  const colors: Record<NoteType, string> = {
    root: "fill-orange-500",
    guide: "fill-blue-500",
    chord: "fill-emerald-500",
  };

  const glows: Record<NoteType, string> = {
    root: "drop-shadow(0 0 6px rgba(249,115,22,0.6))",
    guide: "drop-shadow(0 0 5px rgba(59,130,246,0.5))",
    chord: "drop-shadow(0 0 4px rgba(16,185,129,0.4))",
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
      className="w-full opacity-90"
      aria-hidden="true"
    >
      <rect
        x={px - 4}
        y={py - 6}
        width={sw - px * 2 + 8}
        height={sh - py * 2 + 12}
        rx="4"
        className="fill-amber-800/10"
      />
      <line
        x1={px}
        y1={py - 4}
        x2={px}
        y2={sh - py + 4}
        className="stroke-slate-500"
        strokeWidth="3"
      />
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
      {frame.notes.map((n, i) => (
        <circle
          // biome-ignore lint/suspicious/noArrayIndexKey: frame remount is intentional for re-animation
          key={`${frameIndex}-${i}`}
          cx={px + (n.f === 0 ? -10 : fretW * (n.f - 0.5))}
          cy={py + stringH * (n.s - 1)}
          r="7"
          className={colors[n.type]}
          style={{ filter: glows[n.type] }}
        >
          <animate
            attributeName="opacity"
            values="0;1"
            dur="0.35s"
            begin={`${(n.s + n.f) * 0.04}s`}
            fill="freeze"
            calcMode="spline"
            keySplines="0.4 0 0.2 1"
          />
        </circle>
      ))}
    </svg>
  );
}

function ChordProgressionDemo() {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFrameIndex((i) => (i + 1) % CHORD_FRAMES.length);
    }, FRAME_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {CHORD_FRAMES.map((c, i) => (
            <span
              key={c.name}
              className={`rounded-md px-2 py-1 text-xs font-medium tracking-wide transition-colors duration-300 ${
                i === frameIndex
                  ? "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30"
                  : "text-muted-foreground"
              }`}
            >
              {c.name}
            </span>
          ))}
        </div>
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500" />
          </span>
          Live
        </span>
      </div>
      <FretboardGraphic frameIndex={frameIndex} />
    </div>
  );
}

export function LandingPage() {
  return (
    <div className={`${display.variable} relative min-h-screen`}>
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,_rgba(251,146,60,0.06)_0%,_transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[radial-gradient(ellipse,_rgba(59,130,246,0.04)_0%,_transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Hero — side by side on desktop */}
      <main className="relative z-10">
        <section className="px-4 sm:px-6 lg:px-8 pt-4 pb-16 sm:pb-24 max-w-6xl mx-auto">
          {/* Logo — matches practice page position */}
          <div className="py-2 mb-8 sm:mb-16">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground">
              FretPad
            </span>
          </div>
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Text column */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-orange-500/60" />
                <span className="text-xs font-medium tracking-[0.25em] uppercase text-orange-400">
                  For guitarists learning jazz improvisation
                </span>
              </div>

              <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.4rem,5vw,3.8rem)] leading-[1.05] tracking-[-0.02em] text-stone-50">
                See what to play.{" "}
                <span className="text-muted-foreground">
                  As the chord changes.
                </span>
              </h1>

              <p className="text-lg leading-relaxed text-muted-foreground max-w-xl">
                A jazz backing track grooves under you. Chord tones light up on
                the fretboard in time with the changes. Your mic listens and
                scores your solo. No install, no account — open and play.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/practice/outline-chord-changes"
                  onClick={() =>
                    track("cta_click", { mode: "outline-chord-changes" })
                  }
                  className="group inline-flex items-center gap-2.5 rounded-full bg-stone-50 px-7 py-3.5 text-sm font-medium text-stone-900 transition-all hover:gap-3.5 hover:shadow-lg hover:shadow-orange-400/10 active:scale-[0.98]"
                >
                  Start improvising
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/practice/comp-with-voicings"
                  onClick={() =>
                    track("cta_click", { mode: "comp-with-voicings" })
                  }
                  className="group inline-flex items-center gap-2.5 rounded-full border border-stone-700 px-7 py-3.5 text-sm font-medium text-stone-300 transition-all hover:border-orange-600/40 hover:text-stone-100 active:scale-[0.98]"
                >
                  Practice voicings
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <span className="text-sm text-muted-foreground">
                  Free. Works in any browser.
                </span>
              </div>
            </div>

            {/* Fretboard visual — right column on desktop, below on mobile */}
            <div className="mt-14 lg:mt-0">
              <div className="relative w-full">
                <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-orange-400/40 via-blue-400/20 to-emerald-400/30" />
                <div className="relative rounded-2xl border border-surface-border bg-surface/70 backdrop-blur-sm p-6 sm:p-8">
                  <ChordProgressionDemo />
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground">
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features — 4 columns on desktop */}
        <section className="px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32 max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="group rounded-2xl border border-surface-border bg-surface/50 backdrop-blur-sm p-5 transition-colors hover:border-orange-700/30"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-surface-alt text-stone-300 transition-colors group-hover:bg-orange-900/30 group-hover:text-orange-400">
                  <f.icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-semibold text-stone-200">
                  {f.label}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {f.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-6 lg:px-8 pb-10 max-w-6xl mx-auto">
          <div className="border-t border-surface-border pt-6 flex items-center justify-between text-xs text-muted-foreground">
            <span>FretPad</span>
            <span>No account needed. Your data stays in your browser.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
