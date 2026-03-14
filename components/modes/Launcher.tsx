import { ArrowUpRight, Eye, Guitar, Music, Waves } from "lucide-react";
import { DM_Serif_Display, IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { MODE_STEPS, PRACTICE_MODES } from "@/lib/modes";
import type { PracticeModeId, StyleId } from "@/lib/types";

const displayFont = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const MODE_VISUALS: Record<
  PracticeModeId,
  {
    icon: React.ReactNode;
    kicker: string;
    detail: string;
    accent: string;
    glow: string;
    surface: string;
    text: string;
    mutedText: string;
    subtleText: string;
    pill: string;
    iconSurface: string;
    actionSurface: string;
    divider: string;
  }
> = {
  "learn-the-neck": {
    icon: <Eye className="h-5 w-5" />,
    kicker: "Map notes and intervals",
    detail:
      "Built for slow, deliberate repetition until the fretboard stops feeling abstract.",
    accent: "from-sky-500/25 via-cyan-400/10 to-transparent",
    glow: "shadow-[0_20px_80px_-36px_rgba(24,144,255,0.45)]",
    surface:
      "bg-[linear-gradient(180deg,rgba(245,252,255,0.96),rgba(228,245,250,0.96))] dark:bg-[linear-gradient(180deg,rgba(15,27,33,0.96),rgba(18,40,46,0.96))]",
    text: "text-slate-950 dark:text-cyan-50",
    mutedText: "text-slate-700 dark:text-cyan-100/86",
    subtleText: "text-slate-600 dark:text-cyan-100/72",
    pill: "border-black/10 bg-white/82 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-cyan-50/88",
    iconSurface:
      "border-black/10 bg-white/88 text-slate-900 dark:border-white/10 dark:bg-white/12 dark:text-cyan-50",
    actionSurface:
      "border-black/12 bg-white/88 dark:border-white/12 dark:bg-white/10",
    divider: "border-black/10 dark:border-white/10",
  },
  "outline-chord-changes": {
    icon: <Music className="h-5 w-5" />,
    kicker: "Target tones in motion",
    detail:
      "For hearing the harmony move bar by bar and landing on the right note without guessing.",
    accent: "from-amber-500/25 via-orange-400/12 to-transparent",
    glow: "shadow-[0_22px_90px_-38px_rgba(217,119,6,0.5)]",
    surface:
      "bg-[linear-gradient(180deg,rgba(75,47,18,0.96),rgba(31,23,18,0.98))]",
    text: "text-stone-50",
    mutedText: "text-stone-200/88",
    subtleText: "text-stone-300/72",
    pill: "border-white/10 bg-white/12 text-stone-100/92",
    iconSurface: "border-white/10 bg-white/14 text-stone-50",
    actionSurface: "border-white/12 bg-white/14",
    divider: "border-white/10",
  },
  "comp-with-voicings": {
    icon: <Guitar className="h-5 w-5" />,
    kicker: "Voice-led comping",
    detail:
      "Practice shapes that connect cleanly so the rhythm section feels intentional instead of crowded.",
    accent: "from-emerald-500/25 via-lime-400/10 to-transparent",
    glow: "shadow-[0_20px_80px_-36px_rgba(22,163,74,0.42)]",
    surface:
      "bg-[linear-gradient(180deg,rgba(252,255,242,0.96),rgba(241,248,221,0.96))] dark:bg-[linear-gradient(180deg,rgba(22,31,17,0.96),rgba(32,44,24,0.96))]",
    text: "text-stone-950 dark:text-lime-50",
    mutedText: "text-stone-700 dark:text-lime-50/86",
    subtleText: "text-stone-600 dark:text-lime-50/72",
    pill: "border-black/10 bg-white/82 text-stone-700 dark:border-white/10 dark:bg-white/10 dark:text-lime-50/88",
    iconSurface:
      "border-black/10 bg-white/88 text-stone-900 dark:border-white/10 dark:bg-white/12 dark:text-lime-50",
    actionSurface:
      "border-black/12 bg-white/88 dark:border-white/12 dark:bg-white/10",
    divider: "border-black/10 dark:border-white/10",
  },
};

const STYLE_LABELS: Record<StyleId, string> = {
  jazzSwing: "Jazz swing",
  popRock: "Pop-rock",
  bossaNova: "Bossa nova",
  ballad: "Ballad",
  funk: "Funk",
  reggae: "Reggae",
  latinMontuno: "Latin montuno",
  neoSoul: "Neo soul",
  country: "Country",
  metal: "Metal",
};

function ModeCard({
  modeId,
  featured = false,
}: {
  modeId: PracticeModeId;
  featured?: boolean;
}) {
  const config = PRACTICE_MODES[modeId];
  const visual = MODE_VISUALS[modeId];
  const stepCount = MODE_STEPS[modeId].length;

  return (
    <Link href={`/practice/${config.id}`} className="group block">
      <Card
        hoverable
        className={[
          "relative h-full overflow-hidden border-white/40 backdrop-blur-xl transition duration-300",
          visual.surface,
          visual.glow,
          visual.text,
          featured
            ? "min-h-[21rem] rounded-[2rem]"
            : "min-h-[18rem] rounded-[1.75rem]",
        ].join(" ")}
      >
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-gradient-to-br ${visual.accent}`}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
        />
        <CardContent className="relative flex h-full flex-col gap-6 p-7 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full shadow-sm backdrop-blur ${visual.iconSurface}`}
            >
              {visual.icon}
            </div>
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] backdrop-blur ${visual.pill}`}
            >
              <Waves className="h-3.5 w-3.5" />
              {STYLE_LABELS[config.defaultStyle]}
            </div>
          </div>

          <div className="space-y-3">
            <p
              className={`text-[0.7rem] font-semibold uppercase tracking-[0.24em] ${visual.subtleText}`}
            >
              {visual.kicker}
            </p>
            <h2
              className={`${displayFont.className} text-3xl leading-none sm:text-[2.6rem]`}
            >
              {config.label}
            </h2>
            <p
              className={`max-w-md text-sm leading-7 sm:text-[0.98rem] ${visual.mutedText}`}
            >
              {config.description}
            </p>
            <p className={`max-w-lg text-sm leading-7 ${visual.subtleText}`}>
              {visual.detail}
            </p>
          </div>

          <div className="mt-auto flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${visual.pill}`}
            >
              {stepCount} steps
            </span>
            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${visual.pill}`}
            >
              {config.defaultTempo} BPM
            </span>
            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${visual.pill}`}
            >
              {config.theoryTabs.length} theory views
            </span>
          </div>

          <div
            className={`flex items-center justify-between border-t pt-5 ${visual.divider}`}
          >
            <span className={`text-sm font-medium ${visual.mutedText}`}>
              Open practice mode
            </span>
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 ${visual.actionSurface}`}
            >
              <ArrowUpRight className="h-4.5 w-4.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function Launcher() {
  return (
    <main
      className={`${bodyFont.className} relative min-h-screen overflow-hidden bg-[#f4ecdf] text-[#171411] transition-colors dark:bg-[#0f1316] dark:text-[#f3efe7]`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60 dark:opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(109, 88, 55, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(109, 88, 55, 0.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(circle at center, black 35%, transparent 88%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute left-[-8rem] top-[-7rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.28)_0%,_rgba(245,158,11,0)_70%)] blur-2xl dark:bg-[radial-gradient(circle,_rgba(245,158,11,0.16)_0%,_rgba(245,158,11,0)_70%)]"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[-9rem] right-[-8rem] h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.22)_0%,_rgba(56,189,248,0)_70%)] blur-3xl dark:bg-[radial-gradient(circle,_rgba(56,189,248,0.14)_0%,_rgba(56,189,248,0)_70%)]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-black/10 bg-white/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-stone-700 backdrop-blur dark:border-white/10 dark:bg-white/7 dark:text-stone-200">
              FretPad
            </div>
            <ThemeToggle />
          </div>
          <div className="hidden rounded-full border border-black/10 bg-white/45 px-4 py-2 text-xs text-stone-600 backdrop-blur dark:border-white/10 dark:bg-white/6 dark:text-stone-300 sm:block">
            Guitar practice for harmony, hearing, and voicings
          </div>
        </div>

        <section className="grid flex-1 gap-6 lg:grid-cols-[1.03fr_1fr] lg:gap-8">
          <div className="flex flex-col justify-between rounded-[2rem] border border-black/10 bg-[linear-gradient(160deg,rgba(255,251,245,0.9),rgba(242,232,218,0.78))] p-6 shadow-[0_32px_120px_-48px_rgba(75,52,24,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(160deg,rgba(24,26,29,0.96),rgba(18,23,27,0.92))] dark:shadow-[0_32px_120px_-52px_rgba(0,0,0,0.82)] sm:p-8 lg:p-10">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-stone-950 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-stone-100 dark:border-white/10 dark:bg-white/10 dark:text-stone-100">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Practice by ear and by sight
              </div>

              <h1
                className={`${displayFont.className} max-w-3xl text-[3.1rem] leading-[0.92] tracking-[-0.03em] text-stone-950 dark:text-stone-50 sm:text-[4.6rem] lg:text-[5.6rem]`}
              >
                Stop hunting for notes.
                <span className="block text-stone-600 dark:text-stone-400">
                  Start hearing the neck as harmony.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700 dark:text-stone-300 sm:text-lg">
                FretPad turns progressions into something you can hear, see, and
                react to in real time. Pick the mode that matches the skill you
                want to sharpen, then practice inside a focused musical context.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/practice/${PRACTICE_MODES["outline-chord-changes"].id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 focus-ring dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
                >
                  Start with chord changes
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <div className="inline-flex items-center rounded-full border border-black/10 bg-white/55 px-5 py-3 text-sm text-stone-700 backdrop-blur dark:border-white/10 dark:bg-white/7 dark:text-stone-300">
                  3 focused practice modes
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-4 border-t border-black/10 pt-6 dark:border-white/10 sm:grid-cols-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-stone-500 dark:text-stone-500">
                  Visual target
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-700 dark:text-stone-300">
                  Follow roots, guides, chord tones, and voicings without menu
                  clutter.
                </p>
              </div>
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-stone-500 dark:text-stone-500">
                  Musical loop
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-700 dark:text-stone-300">
                  Practice against backing styles and tempos that make harmonic
                  movement obvious.
                </p>
              </div>
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-stone-500 dark:text-stone-500">
                  Theory on demand
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-700 dark:text-stone-300">
                  Use the theory views when needed, then get back to the
                  instrument.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <ModeCard modeId="outline-chord-changes" featured />
            </div>
            <ModeCard modeId="learn-the-neck" />
            <ModeCard modeId="comp-with-voicings" />
          </div>
        </section>
      </div>
    </main>
  );
}
