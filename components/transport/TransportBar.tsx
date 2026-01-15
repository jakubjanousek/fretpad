"use client";

import { Play, RotateCcw, Square, Timer } from "lucide-react";
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
import { MoreMenu } from "./MoreMenu";

interface TransportBarProps {
  onSettingsClick: () => void;
  onHelpClick: () => void;
  onGuideClick: () => void;
}

/**
 * Fixed bottom transport bar with grouped playback controls.
 * Layout: [Playback Group] [Tempo Group] [Utilities]
 */
export function TransportBar({
  onSettingsClick,
  onHelpClick,
  onGuideClick,
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
    [setCurrentPosition]
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
    [setTempo]
  );

  const handleMetronomeToggle = useCallback(() => {
    setMetronomeEnabled(!metronome.enabled);
  }, [metronome.enabled, setMetronomeEnabled]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-sm safe-area-inset-bottom">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between gap-3 sm:gap-4 h-16 sm:h-16">
          {/* Playback Group */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Hero Play/Stop Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center">
                  {isPlaying ? (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleStopClick}
                      aria-label="Stop"
                      className="hero-button h-11 w-11 sm:h-10 sm:w-10 rounded-full bg-muted border-border hover:bg-muted/80 active:scale-95 transition-all duration-150"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="icon"
                      onClick={handlePlay}
                      aria-label="Play"
                      className="hero-button hero-play h-11 w-11 sm:h-10 sm:w-10 rounded-full bg-cyan-500 hover:bg-cyan-400 border-cyan-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/40 active:scale-95 transition-all duration-150"
                    >
                      <Play className="h-5 w-5 ml-0.5" />
                    </Button>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="sm:hidden">
                {isPlaying ? "Stop" : "Play"} (Space)
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleReset}
                    aria-label="Reset to beginning"
                    className="h-9 w-9 rounded-full hover:bg-background/80 active:scale-95 transition-all duration-150"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="sm:hidden">
                Reset (R)
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    data-state={metronome.enabled ? "on" : "off"}
                    onClick={handleMetronomeToggle}
                    aria-label={
                      metronome.enabled
                        ? "Disable metronome"
                        : "Enable metronome"
                    }
                    className={cn(
                      "h-9 w-9 rounded-full active:scale-95 transition-all duration-150",
                      metronome.enabled
                        ? "bg-orange-500 text-white hover:bg-orange-400"
                        : "hover:bg-background/80"
                    )}
                  >
                    <Timer className="h-4 w-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="sm:hidden">
                Metronome (M)
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Tempo Group - hidden on very small screens */}
          <div className="hidden xs:flex items-center gap-2 sm:gap-3 flex-1 max-w-48 sm:max-w-xs">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 bg-muted/50 rounded-xl px-3 py-1.5">
              <Slider
                min={40}
                max={200}
                step={1}
                value={[tempo]}
                onValueChange={handleTempoChange}
                className="flex-1"
                aria-label="Tempo"
              />
              <span className="text-xs font-mono tabular-nums w-14 sm:w-16 text-right">
                {tempo} <span className="text-muted-foreground">BPM</span>
              </span>
            </div>
          </div>

          {/* Utilities Group */}
          <div className="flex items-center gap-2">
            <MoreMenu
              onSettingsClick={onSettingsClick}
              onHelpClick={onHelpClick}
              onGuideClick={onGuideClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
