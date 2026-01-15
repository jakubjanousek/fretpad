"use client";

import { useMemo } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { ProgressionEditor } from "@/components/progression/ProgressionEditor";
import { ProgressionPresets } from "@/components/progression/ProgressionPresets";
import { ShareExport } from "@/components/progression/ShareExport";
import { ChordInfoPanel } from "@/components/theory/ChordInfoPanel";
import { ProgressBar } from "@/components/transport/ProgressBar";
import { TransportControls } from "@/components/transport/TransportControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUrlState } from "@/hooks/useUrlState";
import { getFretNotesForChord } from "@/lib/fretboard";
import {
  calculateVoiceLeadingPaths,
  filterBestPaths,
  getNextChord,
} from "@/lib/theory/voiceLeading";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

export default function Page() {
  // Load state from URL if present
  useUrlState();

  const currentChord = useAppStore((state) => state.currentChord);
  const progression = useAppStore((state) => state.progression);
  const currentBarIndex = useAppStore((state) => state.currentBarIndex);
  const currentChordIndex = useAppStore((state) => state.currentChordIndex);
  const showScaleTones = useAppStore((state) => state.showScaleTones);
  const setShowScaleTones = useAppStore((state) => state.setShowScaleTones);
  const showVoiceLeading = useAppStore((state) => state.showVoiceLeading);
  const setShowVoiceLeading = useAppStore((state) => state.setShowVoiceLeading);

  const fretNotes = currentChord
    ? getFretNotesForChord(currentChord, {
        includeScale: showScaleTones,
        scaleName: showScaleTones ? currentChord.suggestedScales[0] : undefined,
      })
    : [];

  // Calculate voice leading paths to next chord
  const voiceLeadingPaths = useMemo(() => {
    if (!showVoiceLeading || !currentChord) return [];

    const nextChord = getNextChord(
      progression,
      currentBarIndex,
      currentChordIndex,
    );
    if (!nextChord) return [];

    const allPaths = calculateVoiceLeadingPaths(currentChord, nextChord);
    return filterBestPaths(allPaths);
  }, [
    showVoiceLeading,
    currentChord,
    progression,
    currentBarIndex,
    currentChordIndex,
  ]);

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
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">
                Chord Progression
              </CardTitle>
              <ShareExport />
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
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">Fretboard</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={showVoiceLeading ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowVoiceLeading(!showVoiceLeading)}
                  className={cn(
                    "h-7 text-xs",
                    showVoiceLeading && "bg-blue-500 hover:bg-blue-600",
                  )}
                >
                  Voice Leading
                </Button>
                <Button
                  variant={showScaleTones ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowScaleTones(!showScaleTones)}
                  className={cn(
                    "h-7 text-xs",
                    showScaleTones && "bg-slate-500 hover:bg-slate-600",
                  )}
                >
                  Scale Tones
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ProgressBar />
              <Fretboard
                fretNotes={fretNotes}
                voiceLeadingPaths={voiceLeadingPaths}
              />
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
