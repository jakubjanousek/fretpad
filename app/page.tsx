"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { FretboardHeader } from "@/components/fretboard/FretboardHeader";
import { PresetDropdown } from "@/components/progression/PresetDropdown";
import { ProgressionEditor } from "@/components/progression/ProgressionEditor";
import { ShareExport } from "@/components/progression/ShareExport";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChordInfoSheet } from "@/components/theory/ChordInfoSheet";
import { ProgressBar } from "@/components/transport/ProgressBar";
import { TransportBar } from "@/components/transport/TransportBar";
import { TransportDrawer } from "@/components/transport/TransportDrawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  const isPlaying = useAppStore((state) => state.isPlaying);
  const showScaleTones = useAppStore((state) => state.showScaleTones);
  const setShowScaleTones = useAppStore((state) => state.setShowScaleTones);
  const showVoiceLeading = useAppStore((state) => state.showVoiceLeading);
  const setShowVoiceLeading = useAppStore((state) => state.setShowVoiceLeading);

  // Panel states
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chordInfoOpen, setChordInfoOpen] = useState(false);

  // Keyboard shortcut for chord info panel (I key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === "i" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        document.activeElement?.tagName !== "INPUT"
      ) {
        e.preventDefault();
        setChordInfoOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleChordHeaderClick = useCallback(() => {
    setChordInfoOpen(true);
  }, []);

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
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">FretFlow</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content - add bottom padding for fixed transport bar */}
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col gap-6 pb-20">
        {/* Progression Editor Section */}
        <section>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <PresetDropdown />
                  <ShareExport />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ProgressionEditor />
            </CardContent>
          </Card>
        </section>

        {/* Fretboard Visualization Section */}
        <section className="flex-1">
          <Card className="h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              {/* Toggle buttons moved to right side */}
              <div className="flex-1" />
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
            <CardContent className="flex flex-col gap-2">
              {/* Prominent chord header */}
              <div className="flex justify-center">
                <FretboardHeader
                  chord={currentChord}
                  isPlaying={isPlaying}
                  onChordClick={handleChordHeaderClick}
                />
              </div>

              {/* Progress bar */}
              <ProgressBar />

              {/* Fretboard */}
              <Fretboard
                fretNotes={fretNotes}
                voiceLeadingPaths={voiceLeadingPaths}
              />
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Fixed Transport Bar */}
      <TransportBar
        onSettingsClick={() => setSettingsOpen(true)}
        onInfoClick={() => setChordInfoOpen(true)}
      />

      {/* Settings Drawer */}
      <TransportDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Chord Info Sheet */}
      <ChordInfoSheet
        chord={currentChord}
        open={chordInfoOpen}
        onOpenChange={setChordInfoOpen}
      />
    </div>
  );
}
