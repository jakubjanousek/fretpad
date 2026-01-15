"use client";

import { useState } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFretNotesForChord } from "@/lib/fretboard";
import { parseChordSymbol } from "@/lib/theory/chords";

const DEFAULT_PROGRESSION = ["Dm7", "G7", "Cmaj7", "Cmaj7"];

export default function Page() {
  const [selectedChordIndex, setSelectedChordIndex] = useState(0);
  const selectedChordSymbol = DEFAULT_PROGRESSION[selectedChordIndex];
  const currentChord = parseChordSymbol(selectedChordSymbol);
  const fretNotes = currentChord ? getFretNotesForChord(currentChord) : [];
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-xl font-semibold tracking-tight">FretFlow</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Progression Editor Section */}
        <section>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                Chord Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                {DEFAULT_PROGRESSION.map((chord, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedChordIndex(index)}
                    className={`px-3 py-2 border rounded-md transition-colors ${
                      index === selectedChordIndex
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {chord}
                  </button>
                ))}
                <span className="ml-2 text-xs text-muted-foreground">
                  (ii-V-I in C)
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Fretboard Visualization Section */}
        <section className="flex-1">
          <Card className="h-full min-h-75">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Fretboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Fretboard fretNotes={fretNotes} />
            </CardContent>
          </Card>
        </section>

        {/* Transport Controls & Theory Panel Section */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Transport Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">
                  Transport
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <PlayIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <StopIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Tempo:</span>
                    <span className="font-mono">120 BPM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Theory Panel */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">
                  Chord Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentChord ? (
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Current:</span>{" "}
                      <span className="font-medium">{currentChord.symbol}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Notes:</span>{" "}
                      <span className="font-mono">
                        {currentChord.notes.join(" ")}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Guide tones:
                      </span>{" "}
                      <span className="font-mono">
                        {currentChord.guideTones.join(" ")}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        (3rd, 7th)
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Scale:</span>{" "}
                      <span className="font-mono">
                        {currentChord.suggestedScales[0]}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select a chord
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Play"
      role="img"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Stop"
      role="img"
    >
      <rect x="6" y="6" width="12" height="12" />
    </svg>
  );
}
