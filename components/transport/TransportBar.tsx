"use client";

import {
  CircleHelp,
  Info,
  Play,
  RotateCcw,
  Settings,
  Square,
  Timer,
} from "lucide-react";
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
  onHelpClick: () => void;
}

/**
 * Fixed bottom transport bar with essential playback controls.
 * Contains: Play/Stop, Reset, Metronome toggle, Tempo slider, Settings & Info buttons.
 */
export function TransportBar({
  onSettingsClick,
  onInfoClick,
  onHelpClick,
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
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-sm safe-area-inset-bottom">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-14 sm:h-14">
          {/* Left: Playback Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                {isPlaying ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleStopClick}
                    aria-label="Stop"
                    className="h-10 w-10 sm:h-9 sm:w-9 touch-target"
                  >
                    <Square className="h-4 w-4 sm:h-4 sm:w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="icon"
                    onClick={handlePlay}
                    aria-label="Play"
                    className="h-10 w-10 sm:h-9 sm:w-9 touch-target"
                  >
                    <Play className="h-4 w-4 sm:h-4 sm:w-4" />
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
                  className="h-10 w-10 sm:h-9 sm:w-9 touch-target"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Reset (R)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="toggle"
                  size="icon"
                  data-state={metronome.enabled ? "on" : "off"}
                  onClick={handleMetronomeToggle}
                  aria-label={
                    metronome.enabled ? "Disable metronome" : "Enable metronome"
                  }
                  className={cn(
                    "h-10 w-10 sm:h-9 sm:w-9 touch-target",
                    metronome.enabled &&
                      "bg-orange-500 border-orange-500 hover:bg-orange-600",
                  )}
                >
                  <Timer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Metronome (M)</TooltipContent>
            </Tooltip>
          </div>

          {/* Center: Tempo Control - hidden on very small screens */}
          <div className="hidden xs:flex items-center gap-2 sm:gap-3 flex-1 max-w-50 sm:max-w-xs">
            <Slider
              min={40}
              max={200}
              step={1}
              value={[tempo]}
              onValueChange={handleTempoChange}
              className="flex-1"
              aria-label="Tempo"
            />
            <span className="text-xs sm:text-sm font-mono tabular-nums w-16 sm:w-20 text-right">
              {tempo} BPM
            </span>
          </div>

          {/* Right: Help, Settings & Info */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onHelpClick}
                  aria-label="Keyboard shortcuts"
                  className="h-10 w-10 sm:h-9 sm:w-9 touch-target hidden sm:flex"
                >
                  <CircleHelp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Keyboard Shortcuts (?)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onSettingsClick}
                  aria-label="Open settings"
                  className="h-10 w-10 sm:h-9 sm:w-9 touch-target"
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
                  className="h-10 w-10 sm:h-9 sm:w-9 touch-target"
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
