"use client";

import { Fretboard } from "@/components/fretboard/Fretboard";
import { ProgressionEditor } from "@/components/progression/ProgressionEditor";
import { ProgressionPresets } from "@/components/progression/ProgressionPresets";
import { ChordInfoPanel } from "@/components/theory/ChordInfoPanel";
import { TransportControls } from "@/components/transport/TransportControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFretNotesForChord } from "@/lib/fretboard";
import { useAppStore } from "@/state/useAppStore";

export default function Page() {
  const currentChord = useAppStore((state) => state.currentChord);
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
              <div className="flex flex-col gap-4">
                <ProgressionPresets />
                <ProgressionEditor />
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
                <TransportControls />
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
                <ChordInfoPanel chord={currentChord} />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
