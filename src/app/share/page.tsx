import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Share-link format",
  description:
    "How to construct a FretPad share link with a chord progression, tempo, and practice mode embedded — works with any LLM or chat surface.",
  alternates: { canonical: "/share" },
  openGraph: {
    title: "FretPad share-link format",
    description:
      "Construct a URL that opens FretPad with any chord progression and tempo preloaded.",
    url: `${SITE_URL}/share`,
  },
};

const EXAMPLES: { label: string; url: string }[] = [
  {
    label: "ii–V–I in C (default tempo)",
    url: "/practice/outline-chord-changes?chords=Dm7|G7|Cmaj7|Cmaj7",
  },
  {
    label: "12-bar blues in A at 100 BPM",
    url: "/practice/outline-chord-changes?chords=A7|A7|A7|A7|D7|D7|A7|A7|E7|D7|A7|E7&name=Blues+in+A&tempo=100",
  },
  {
    label: "Rhythm Changes A — two chords per bar, for comping",
    url: "/practice/comp-with-voicings?chords=Bbmaj7 Gm7|Cm7 F7|Dm7 Gm7|Cm7 F7|Fm7 Bb7|Ebmaj7 Ab7|Dm7 Gm7|Cm7 F7&name=Rhythm+Changes+A&tempo=160",
  },
  {
    label: "Dorian vamp for fretboard exploration",
    url: "/practice/learn-the-neck?chords=Dm7|Em7|Dm7|Dm7&name=Dorian+Vamp&tempo=90",
  },
];

const MODES: { id: string; label: string; description: string }[] = [
  {
    id: "outline-chord-changes",
    label: "Outline Chord Changes (default)",
    description:
      "Best for soloing. Chord tones light up as each chord goes by — guide tones (3rds, 7ths) are highlighted.",
  },
  {
    id: "learn-the-neck",
    label: "Learn the Neck",
    description:
      "Best for fretboard study over a static or modal vamp. Shows intervals and note names.",
  },
  {
    id: "comp-with-voicings",
    label: "Comp with Voicings",
    description:
      "Best for rhythm guitar. Shows voice-led chord shapes that move through the progression with minimal hand travel.",
  },
];

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-stone-800/60 px-1.5 py-0.5 font-mono text-[0.85em] text-stone-100">
      {children}
    </code>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-surface-border bg-stone-900/60 p-4 font-mono text-xs leading-relaxed text-stone-100">
      {children}
    </pre>
  );
}

export default function SharePage() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface" />
      </div>

      <main className="relative z-10 mx-auto max-w-3xl px-4 pt-6 pb-24 sm:px-6 lg:px-8">
        <div className="py-2 mb-12">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground hover:text-stone-200"
          >
            FretPad
          </Link>
        </div>

        <article className="prose prose-invert max-w-none space-y-10">
          <header className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-50">
              Share-link format
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Any chord progression, tempo, and practice mode can be embedded in
              a FretPad URL. Send the link to a guitarist and it opens ready to
              play — no setup. The format is plain query params so it works
              equally well in a chat with ChatGPT, Claude, a blog post, or a
              text message.
            </p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-stone-100">The format</h2>
            <Pre>
              {`https://fretpad.com/practice/{mode}?chords={chords}&name={name}&tempo={bpm}`}
            </Pre>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The shorter root form{" "}
              <Code>https://fretpad.com/?chords=...&tempo=...</Code> also works
              and redirects to the default mode.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-stone-100">Parameters</h2>
            <dl className="space-y-5 text-sm leading-relaxed text-stone-300">
              <div>
                <dt className="font-semibold text-stone-100">
                  <Code>chords</Code> — required
                </dt>
                <dd className="mt-1 text-muted-foreground">
                  The progression. Separate bars with <Code>|</Code> and chords
                  within a bar with a single space. Use standard chord symbols
                  (e.g. <Code>Cmaj7</Code>, <Code>Dm7</Code>,{" "}
                  <Code>F#m7b5</Code>, <Code>Bb7</Code>, <Code>C/G</Code>,{" "}
                  <Code>Edim7</Code>, <Code>C7sus4</Code>). Leave the{" "}
                  <Code>|</Code> as a literal pipe character — don&apos;t
                  URL-encode it.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-stone-100">
                  <Code>name</Code> — optional
                </dt>
                <dd className="mt-1 text-muted-foreground">
                  A human-readable title for the progression. Encode spaces as{" "}
                  <Code>+</Code>.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-stone-100">
                  <Code>tempo</Code> — optional
                </dt>
                <dd className="mt-1 text-muted-foreground">
                  BPM, integer. Defaults to <Code>120</Code>. Reasonable range
                  is roughly 40–240.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-stone-100">
                  <Code>mode</Code> — path segment
                </dt>
                <dd className="mt-1 text-muted-foreground">
                  The practice mode. Pick whichever matches the user&apos;s
                  goal:
                </dd>
                <ul className="mt-2 space-y-2">
                  {MODES.map((m) => (
                    <li key={m.id} className="text-muted-foreground">
                      <Code>{m.id}</Code> — <strong>{m.label}.</strong>{" "}
                      {m.description}
                    </li>
                  ))}
                </ul>
              </div>
            </dl>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-stone-100">Examples</h2>
            <ul className="space-y-5">
              {EXAMPLES.map((ex) => (
                <li key={ex.url} className="space-y-2">
                  <p className="text-sm font-medium text-stone-200">
                    {ex.label}
                  </p>
                  <Pre>{ex.url}</Pre>
                  <Link
                    href={ex.url}
                    className="inline-block text-xs font-medium text-orange-400 hover:text-orange-300"
                  >
                    Open this link →
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-stone-100">
              For AI assistants
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If you&apos;re an LLM helping a guitarist, you can construct a
              FretPad link directly from the chords they mention. There&apos;s
              also a structured summary at{" "}
              <Link
                href="/llms.txt"
                className="text-orange-400 hover:text-orange-300"
              >
                /llms.txt
              </Link>{" "}
              that documents the same format in a more machine-friendly form.
            </p>
          </section>

          <footer className="border-t border-surface-border pt-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-stone-200"
            >
              ← Back to FretPad
            </Link>
          </footer>
        </article>
      </main>
    </div>
  );
}
