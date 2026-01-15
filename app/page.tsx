"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { FretboardHeader } from "@/components/fretboard/FretboardHeader";
import { PresetDropdown } from "@/components/progression/PresetDropdown";
import { ProgressionEditor } from "@/components/progression/ProgressionEditor";
import { ShareExport } from "@/components/progression/ShareExport";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChordInfoSheet } from "@/components/theory/ChordInfoSheet";
import { KeyboardShortcutsHelp } from "@/components/transport/KeyboardShortcutsHelp";
import { ProgressBar } from "@/components/transport/ProgressBar";
import { TransportBar } from "@/components/transport/TransportBar";
import { TransportDrawer } from "@/components/transport/TransportDrawer";
import { Card, CardContent } from "@/components/ui/card";
import { useUrlState } from "@/hooks/useUrlState";
import { getFretNotesForChord } from "@/lib/fretboard";
import {
  calculateVoiceLeadingPaths,
  filterBestPaths,
  getNextChord,
} from "@/lib/theory/voiceLeading";
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
  const noteLabelMode = useAppStore((state) => state.noteLabelMode);
  const setNoteLabelMode = useAppStore((state) => state.setNoteLabelMode);

  // Panel states
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chordInfoOpen, setChordInfoOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);

  // Keyboard shortcuts for panels (I and ? keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = document.activeElement?.tagName === "INPUT";
      const hasModifier = e.metaKey || e.ctrlKey || e.altKey;

      // Toggle chord info panel (I key)
      if (e.key.toLowerCase() === "i" && !hasModifier && !isInputFocused) {
        e.preventDefault();
        setChordInfoOpen((prev) => !prev);
      }

      // Toggle shortcuts help (? key)
      if (e.key === "?" && !hasModifier && !isInputFocused) {
        e.preventDefault();
        setShortcutsHelpOpen((prev) => !prev);
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
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight shrink-0">
            FretFlow
          </h1>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <PresetDropdown />
            <ShareExport />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content - add bottom padding for fixed transport bar */}
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6 pb-20">
        {/* Progression Editor Section */}
        <section>
          <Card>
            <CardContent className="py-3 sm:py-4 px-3 sm:px-6">
              <ProgressionEditor />
            </CardContent>
          </Card>
        </section>

        {/* Fretboard Visualization Section */}
        <section className="flex-1">
          <Card className="h-full">
            <CardContent className="flex flex-col gap-2 py-4 px-3 sm:px-6">
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
                showVoiceLeading={showVoiceLeading}
                showScaleTones={showScaleTones}
                noteLabelMode={noteLabelMode}
                onToggleVoiceLeading={() =>
                  setShowVoiceLeading(!showVoiceLeading)
                }
                onToggleScaleTones={() => setShowScaleTones(!showScaleTones)}
                onNoteLabelModeChange={setNoteLabelMode}
              />
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Fixed Transport Bar */}
      <TransportBar
        onSettingsClick={() => setSettingsOpen(true)}
        onInfoClick={() => setChordInfoOpen(true)}
        onHelpClick={() => setShortcutsHelpOpen(true)}
      />

      {/* Settings Drawer */}
      <TransportDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Chord Info Sheet */}
      <ChordInfoSheet
        chord={currentChord}
        open={chordInfoOpen}
        onOpenChange={setChordInfoOpen}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        open={shortcutsHelpOpen}
        onOpenChange={setShortcutsHelpOpen}
      />
    </div>
  );
}
