"use client";

import { BookOpen, Guitar, HelpCircle, Keyboard, Music, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HelpGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabId =
  | "getting-started"
  | "keyboard-shortcuts"
  | "chord-symbols"
  | "glossary";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: <HelpCircle className="h-4 w-4" />,
  },
  {
    id: "keyboard-shortcuts",
    label: "Shortcuts",
    icon: <Keyboard className="h-4 w-4" />,
  },
  {
    id: "chord-symbols",
    label: "Chord Symbols",
    icon: <Music className="h-4 w-4" />,
  },
  { id: "glossary", label: "Glossary", icon: <BookOpen className="h-4 w-4" /> },
];

/**
 * Help guide modal with tabbed sections for user documentation.
 * Covers: Getting Started, Chord Symbol Format, and Music Theory Glossary.
 */
export function HelpGuide({ open, onOpenChange }: HelpGuideProps) {
  const [activeTab, setActiveTab] = useState<TabId>("getting-started");

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onOpenChange(false);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close help guide"
      />

      {/* Content */}
      <div
        className={cn(
          "relative z-10 bg-card border rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col",
          "animate-in fade-in-0 zoom-in-95 duration-200",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Guitar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">FretFlow Guide</h2>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b px-4 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors",
                "border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "getting-started" && <GettingStartedContent />}
          {activeTab === "keyboard-shortcuts" && <KeyboardShortcutsContent />}
          {activeTab === "chord-symbols" && <ChordSymbolsContent />}
          {activeTab === "glossary" && <GlossaryContent />}
        </div>

        {/* Footer */}
        <div className="border-t p-3 text-center shrink-0">
          <p className="text-xs text-muted-foreground">
            Press{" "}
            <kbd className="px-1 py-0.5 text-xs bg-muted rounded border">
              Esc
            </kbd>{" "}
            to close
          </p>
        </div>
      </div>
    </div>
  );
}

function GettingStartedContent() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-base font-semibold mb-2">What is FretFlow?</h3>
        <p className="text-sm text-muted-foreground">
          FretFlow is a guitar practice tool that helps you improvise over chord
          progressions. It shows you which notes to target on each chord, plays
          a backing track, and provides music theory context to deepen your
          understanding.
        </p>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-2">Quick Start</h3>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>
            <strong className="text-foreground">Choose a progression</strong> —
            Select a preset from the dropdown or edit the chord progression
            directly.
          </li>
          <li>
            <strong className="text-foreground">Press Play</strong> — The
            backing track will loop through the progression while highlighting
            notes on the fretboard.
          </li>
          <li>
            <strong className="text-foreground">Follow the colors</strong> —
            Target the highlighted notes, especially the{" "}
            <span className="text-orange-500 font-medium">root</span> and{" "}
            <span className="text-blue-500 font-medium">guide tones</span>.
          </li>
          <li>
            <strong className="text-foreground">Explore theory</strong> — Tap
            the chord name to see suggested scales and intervals.
          </li>
        </ol>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-2">Fretboard Colors</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-orange-500 shrink-0" />
            <span>
              <strong>Root</strong> — The chord&apos;s foundation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-500 shrink-0" />
            <span>
              <strong>Guide Tones</strong> — 3rd and 7th
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-500 shrink-0" />
            <span>
              <strong>Chord Tones</strong> — 5th and extensions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-slate-400 shrink-0" />
            <span>
              <strong>Scale Tones</strong> — Safe passing notes
            </span>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-2">Tips for Practice</h3>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
          <li>Start slow — reduce tempo to hear chord changes clearly</li>
          <li>Target guide tones on each chord change</li>
          <li>
            Try voice leading — move to the nearest guide tone on the next chord
          </li>
          <li>Enable the metronome for better time feel</li>
          <li>
            Use keyboard shortcuts for faster control — see the{" "}
            <strong className="text-foreground">Shortcuts</strong> tab above
          </li>
        </ul>
      </section>
    </div>
  );
}

const SHORTCUTS = [
  { key: "Space", description: "Play / Stop" },
  { key: "R", description: "Reset to beginning" },
  { key: "M", description: "Toggle metronome" },
  { key: "I", description: "Toggle chord info panel" },
  { key: "H", description: "Open help guide" },
  { key: "↑", description: "Increase tempo (+5 BPM)" },
  { key: "↓", description: "Decrease tempo (-5 BPM)" },
  { key: "1", description: "Load preset: ii-V-I in C" },
  { key: "2", description: "Load preset: Autumn Leaves" },
  { key: "3", description: "Load preset: Rhythm Changes" },
];

function KeyboardShortcutsContent() {
  return (
    <div className="space-y-2">
      {SHORTCUTS.map((shortcut) => (
        <div
          key={shortcut.key}
          className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
        >
          <span className="text-sm text-muted-foreground">
            {shortcut.description}
          </span>
          <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border border-border">
            {shortcut.key}
          </kbd>
        </div>
      ))}
    </div>
  );
}

function ChordSymbolsContent() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-base font-semibold mb-2">
          Supported Chord Formats
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          FretFlow understands common chord symbol notation. Enter chords using
          a root note (A-G, with optional # or b) followed by a quality symbol.
        </p>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-2">Basic Chords</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          <ChordExample symbol="C" description="Major" />
          <ChordExample symbol="Cm" description="Minor" />
          <ChordExample symbol="Cdim" description="Diminished" />
          <ChordExample symbol="Caug" description="Augmented" />
          <ChordExample symbol="Csus2" description="Suspended 2nd" />
          <ChordExample symbol="Csus4" description="Suspended 4th" />
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-2">Seventh Chords</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          <ChordExample symbol="Cmaj7" description="Major 7th" />
          <ChordExample symbol="Cm7" description="Minor 7th" />
          <ChordExample symbol="C7" description="Dominant 7th" />
          <ChordExample symbol="Cdim7" description="Diminished 7th" />
          <ChordExample symbol="Cm7b5" description="Half-diminished" />
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-2">
          Extended & Added Tone Chords
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          <ChordExample symbol="C6" description="Major 6th" />
          <ChordExample symbol="Cm6" description="Minor 6th" />
          <ChordExample symbol="C9" description="Dominant 9th" />
          <ChordExample symbol="Cmaj9" description="Major 9th" />
          <ChordExample symbol="Cm9" description="Minor 9th" />
          <ChordExample symbol="Cadd9" description="Add 9" />
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-2">Root Notes</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Use sharps (#) or flats (b) for accidentals:
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          {[
            "C",
            "C#",
            "Db",
            "D",
            "D#",
            "Eb",
            "E",
            "F",
            "F#",
            "Gb",
            "G",
            "G#",
            "Ab",
            "A",
            "A#",
            "Bb",
            "B",
          ].map((note) => (
            <span
              key={note}
              className="px-2 py-1 bg-muted rounded text-xs font-mono"
            >
              {note}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-2">Alternative Notations</h3>
        <p className="text-sm text-muted-foreground">
          These alternative symbols are also recognized:
        </p>
        <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
          <li>
            <code className="text-xs bg-muted px-1 rounded">Cmin</code> or{" "}
            <code className="text-xs bg-muted px-1 rounded">C-</code> for minor
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">Cmaj</code> or{" "}
            <code className="text-xs bg-muted px-1 rounded">CM</code> for major
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">C+</code> for
            augmented
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">Co</code> or{" "}
            <code className="text-xs bg-muted px-1 rounded">Cdim</code> for
            diminished
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">CΔ7</code> or{" "}
            <code className="text-xs bg-muted px-1 rounded">Cma7</code> for
            major 7th
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">Cø</code> or{" "}
            <code className="text-xs bg-muted px-1 rounded">Cø7</code> for
            half-diminished
          </li>
        </ul>
      </section>
    </div>
  );
}

function ChordExample({
  symbol,
  description,
}: {
  symbol: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
      <code className="font-mono font-medium text-foreground">{symbol}</code>
      <span className="text-muted-foreground text-xs">{description}</span>
    </div>
  );
}

function GlossaryContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Key music theory terms used in FretFlow:
      </p>

      <dl className="space-y-3">
        <GlossaryItem
          term="Root"
          definition="The fundamental note that gives a chord its name. In Cmaj7, C is the root. It's the most stable note to land on and creates a strong sense of resolution."
        />
        <GlossaryItem
          term="Guide Tones"
          definition="The 3rd and 7th of a chord. These two notes define the chord's quality (major/minor) and function. Targeting guide tones during improvisation creates melodic lines that clearly outline the harmony."
        />
        <GlossaryItem
          term="Chord Tones"
          definition="All the notes that make up a chord (root, 3rd, 5th, 7th, and any extensions). Chord tones are 'safe' notes that always sound good over the chord."
        />
        <GlossaryItem
          term="Scale Tones"
          definition="Notes from the suggested scale that aren't chord tones. These work as passing tones or color notes. They connect chord tones melodically but shouldn't be emphasized on strong beats."
        />
        <GlossaryItem
          term="Intervals"
          definition="The distance between two notes. Displayed as numbers: 1 (root), 2, b3/3, 4, b5/5, 6, b7/7. The 'b' (flat) indicates a half-step lower than the natural interval."
        />
        <GlossaryItem
          term="Voice Leading"
          definition="The art of moving from one chord to the next with minimal movement. Good voice leading connects guide tones smoothly — for example, the 7th of one chord often resolves down to the 3rd of the next."
        />
        <GlossaryItem
          term="Chord Quality"
          definition="The type of chord based on its intervals. Major chords have a major 3rd (bright sound), minor chords have a minor/flat 3rd (darker sound). The 7th adds another layer: major 7th (dreamy), dominant/flat 7th (bluesy tension)."
        />
        <GlossaryItem
          term="ii-V-I Progression"
          definition="The most common progression in jazz. In the key of C: Dm7 (ii) → G7 (V) → Cmaj7 (I). The V chord creates tension that resolves to I. Understanding this movement is fundamental to jazz improvisation."
        />
        <GlossaryItem
          term="Tritone"
          definition="An interval of three whole steps (e.g., B to F). Found between the 3rd and 7th of dominant chords, it creates tension that wants to resolve. The tritone in G7 (B-F) resolves to the root and 3rd of Cmaj7 (C-E)."
        />
        <GlossaryItem
          term="Shell Voicing"
          definition="A chord voicing using only the root, 3rd, and 7th — the essential notes that define the chord. Common in jazz comping because they're clear and leave room for the soloist."
        />
        <GlossaryItem
          term="Approach Notes"
          definition="Notes that lead into a target note by half-step or whole-step, often from below. Walking bass lines use approach notes to create forward motion into each chord change."
        />
        <GlossaryItem
          term="Swing Feel"
          definition="A rhythmic feel where eighth notes are played unevenly — long-short instead of equal. The 'Jazz Swing' style in FretFlow applies this automatically. It gives music a lilting, bouncy quality."
        />
      </dl>
    </div>
  );
}

function GlossaryItem({
  term,
  definition,
}: {
  term: string;
  definition: string;
}) {
  return (
    <div className="border-b border-border/50 pb-3 last:border-0">
      <dt className="font-medium text-foreground">{term}</dt>
      <dd className="text-sm text-muted-foreground mt-0.5">{definition}</dd>
    </div>
  );
}
