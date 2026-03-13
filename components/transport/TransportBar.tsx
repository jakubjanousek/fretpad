"use client";

import {
  BookOpen,
  BrainCircuit,
  ListMusic,
  Play,
  Settings,
  Square,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTransportControls } from "@/hooks/useTransportControls";
import { AudioInterruptedOverlay } from "./AudioInterruptedOverlay";

interface TransportBarProps {
  onSettingsClick: () => void;
  onGuideClick: () => void;
  onStatsClick: () => void;
  onQuizClick?: () => void;
  onPlannerClick?: () => void;
}

/**
 * Fixed bottom transport bar with grouped playback controls.
 * Layout: [Tempo Group] [Playback Group] [Utilities]
 */
export function TransportBar({
  onSettingsClick,
  onGuideClick,
  onStatsClick,
  onQuizClick,
  onPlannerClick,
}: TransportBarProps) {
  const {
    isPlaying,
    tempo,
    handlePlay,
    handleStopClick,
    handleResume,
    handleTempoChange,
  } = useTransportControls();

  return (
    <>
      <AudioInterruptedOverlay onResume={handleResume} />
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-sm safe-area-inset-bottom">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4 h-16 sm:h-16">
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
            </div>

            {/* Utilities Group */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {onPlannerClick && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={onPlannerClick}
                      aria-label="Practice Session"
                      className="h-11 w-11 sm:h-auto sm:w-auto sm:px-2 sm:py-1.5 rounded-full sm:rounded-lg hover:bg-background/80 active:scale-95 transition-all duration-150 flex flex-col items-center gap-0.5"
                    >
                      <ListMusic className="h-4 w-4 text-cyan-500" />
                      <span className="hidden sm:block text-[10px] leading-tight text-muted-foreground">
                        Practice
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="sm:hidden">
                    Practice Session
                  </TooltipContent>
                </Tooltip>
              )}

              {onQuizClick && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={onQuizClick}
                      aria-label="Chord Tone Quiz"
                      className="h-11 w-11 sm:h-auto sm:w-auto sm:px-2 sm:py-1.5 rounded-full sm:rounded-lg hover:bg-background/80 active:scale-95 transition-all duration-150 flex flex-col items-center gap-0.5"
                    >
                      <BrainCircuit className="h-4 w-4 text-violet-500" />
                      <span className="hidden sm:block text-[10px] leading-tight text-muted-foreground">
                        Quiz
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="sm:hidden">
                    Chord Tone Quiz
                  </TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={onStatsClick}
                    aria-label="Practice Stats"
                    className="h-11 w-11 sm:h-auto sm:w-auto sm:px-2 sm:py-1.5 rounded-full sm:rounded-lg hover:bg-background/80 active:scale-95 transition-all duration-150 flex flex-col items-center gap-0.5"
                  >
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span className="hidden sm:block text-[10px] leading-tight text-muted-foreground">
                      Stats
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="sm:hidden">
                  Practice Stats
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={onGuideClick}
                    aria-label="Help Guide"
                    className="h-11 w-11 sm:h-auto sm:w-auto sm:px-2 sm:py-1.5 rounded-full sm:rounded-lg hover:bg-background/80 active:scale-95 transition-all duration-150 flex flex-col items-center gap-0.5"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:block text-[10px] leading-tight text-muted-foreground">
                      Help
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="sm:hidden">
                  Help Guide
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={onSettingsClick}
                    aria-label="Settings"
                    className="h-11 w-11 sm:h-auto sm:w-auto sm:px-2 sm:py-1.5 rounded-full sm:rounded-lg hover:bg-background/80 active:scale-95 transition-all duration-150 flex flex-col items-center gap-0.5"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:block text-[10px] leading-tight text-muted-foreground">
                      Settings
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="sm:hidden">
                  Settings
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
