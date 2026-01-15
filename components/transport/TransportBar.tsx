"use client";

import { Info, Play, RotateCcw, Settings, Square, Timer } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { getStyle } from "@/lib/audio/styles";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

interface TransportBarProps {
  onSettingsClick: () => void;
  onInfoClick: () => void;
}

/**
 * Fixed bottom transport bar with essential playback controls.
 * Contains: Play/Stop, Reset, Metronome toggle, Tempo slider, Settings & Info buttons.
 */
export function TransportBar({
  onSettingsClick,
  onInfoClick,
}: TransportBarProps) {
  const progression = useAppStore((state) => state.progression);
  const tempo = useAppStore((state) => state.tempo);
  const isPlaying = useAppStore((state) => state.isPlaying);
  const selectedStyle = useAppStore((state) => state.selectedStyle);
  const metronome = useAppStore((state) => state.metronome);
  const backingTrack = useAppStore((state) => state.backingTrack);
  const setTempo = useAppStore((state) => state.setTempo);
  const setIsPlaying = useAppStore((state) => state.setIsPlaying);
  const setCurrentPosition = useAppStore((state) => state.setCurrentPosition);
  const setMetronomeEnabled = useAppStore((state) => state.setMetronomeEnabled);

  const style = getStyle(selectedStyle);

  const handleChordChange = useCallback(
    (barIndex: number, chordIndex: number) => {
      setCurrentPosition(barIndex, chordIndex);
    },
    [setCurrentPosition],
  );

  const handleStop = useCallback(() => {
    setCurrentPosition(0, 0);
    setIsPlaying(false);
  }, [setCurrentPosition, setIsPlaying]);

  const { start, stop } = useAudioEngine({
    progression,
    tempo,
    style,
    metronome,
    backingTrack,
    onChordChange: handleChordChange,
    onStop: handleStop,
  });

  const handlePlay = useCallback(async () => {
    await start();
    setIsPlaying(true);
  }, [start, setIsPlaying]);

  const handleStopClick = useCallback(() => {
    stop();
    setIsPlaying(false);
  }, [stop, setIsPlaying]);

  const handleReset = useCallback(() => {
    stop();
    setCurrentPosition(0, 0);
    setIsPlaying(false);
  }, [stop, setCurrentPosition, setIsPlaying]);

  // Enable keyboard shortcuts for transport controls
  useKeyboardShortcuts({
    onPlay: handlePlay,
    onStop: handleStopClick,
    onReset: handleReset,
  });

  const handleTempoChange = useCallback(
    (value: number[]) => {
      const newTempo = value[0];
      if (newTempo !== undefined) {
        setTempo(newTempo);
      }
    },
    [setTempo],
  );

  const handleMetronomeToggle = useCallback(() => {
    setMetronomeEnabled(!metronome.enabled);
  }, [metronome.enabled, setMetronomeEnabled]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 h-14">
          {/* Left: Playback Controls */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                {isPlaying ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleStopClick}
                    aria-label="Stop"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="icon"
                    onClick={handlePlay}
                    aria-label="Play"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent side="top">
                {isPlaying ? "Stop" : "Play"} (Space)
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleReset}
                  aria-label="Reset to beginning"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Reset (R)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={metronome.enabled ? "default" : "outline"}
                  size="icon"
                  onClick={handleMetronomeToggle}
                  aria-label={
                    metronome.enabled ? "Disable metronome" : "Enable metronome"
                  }
                  className={cn(
                    metronome.enabled && "bg-orange-500 hover:bg-orange-600",
                  )}
                >
                  <Timer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Metronome (M)</TooltipContent>
            </Tooltip>
          </div>

          {/* Center: Tempo Control */}
          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <Slider
              min={40}
              max={200}
              step={1}
              value={[tempo]}
              onValueChange={handleTempoChange}
              className="flex-1"
              aria-label="Tempo"
            />
            <span className="text-sm font-mono tabular-nums w-20 text-right">
              {tempo} BPM
            </span>
          </div>

          {/* Right: Settings & Info */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onSettingsClick}
                  aria-label="Open settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Settings</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onInfoClick}
                  aria-label="Open chord info"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Chord Info (I)</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
