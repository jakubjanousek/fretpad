"use client";

import {
  Keyboard,
  Play,
  RotateCcw,
  Square,
  Timer,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTransportControls } from "@/hooks/useTransportControls";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";
import { BackingTrackControls } from "./BackingTrackControls";
import { MetronomeControls } from "./MetronomeControls";
import { StyleSelector } from "./StyleSelector";
import { TempoRampControls } from "./TempoRampControls";

/**
 * Transport controls for playback: play/stop buttons and tempo slider.
 * Integrates with the audio engine and app store.
 */
export function TransportControls() {
  const {
    isPlaying,
    tempo,
    tempoRamp,
    metronome,
    handlePlay,
    handleStopClick,
    handleReset,
    handleTempoChange,
    handleMetronomeToggle,
  } = useTransportControls();

  const setTempoRampEnabled = useAppStore((state) => state.setTempoRampEnabled);

  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Playback Controls */}
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
          <TooltipContent side="bottom">
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
          <TooltipContent side="bottom">Reset (R)</TooltipContent>
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
          <TooltipContent side="bottom">Metronome (M)</TooltipContent>
        </Tooltip>
      </div>

      {/* Tempo Control */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="tempo-slider"
            className="text-sm text-muted-foreground"
          >
            Tempo
          </Label>
          <span className="text-sm font-mono tabular-nums">{tempo} BPM</span>
        </div>
        <Slider
          id="tempo-slider"
          min={40}
          max={200}
          step={1}
          value={[tempo]}
          onValueChange={handleTempoChange}
          className="w-full"
          aria-label="Tempo"
        />
      </div>

      {/* Tempo Ramp Toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-sm text-muted-foreground">Tempo Ramp</Label>
        <Button
          variant={tempoRamp.enabled ? "default" : "outline"}
          size="sm"
          onClick={() => setTempoRampEnabled(!tempoRamp.enabled)}
          aria-label={
            tempoRamp.enabled ? "Disable tempo ramp" : "Enable tempo ramp"
          }
          className={cn(
            "h-7 gap-1.5 text-xs",
            tempoRamp.enabled && "bg-orange-500 hover:bg-orange-600",
          )}
        >
          <TrendingUp className="h-3 w-3" />
          {tempoRamp.enabled ? "On" : "Off"}
        </Button>
      </div>

      {/* Tempo Ramp Controls (shown when tempo ramp is enabled) */}
      {tempoRamp.enabled && <TempoRampControls tempoRamp={tempoRamp} />}

      {/* Metronome Controls (shown when metronome is enabled) */}
      {metronome.enabled && <MetronomeControls metronome={metronome} />}

      {/* Style Selector */}
      <StyleSelector />

      {/* Backing Track Volume Controls */}
      <BackingTrackControls />

      {/* Keyboard Shortcuts Hint */}
      <div className="pt-2 border-t">
        <button
          type="button"
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Keyboard className="h-3 w-3" />
          <span>Keyboard shortcuts</span>
        </button>
        {showShortcuts && (
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div>
              <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">
                Space
              </kbd>{" "}
              Play/Stop
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">R</kbd>{" "}
              Reset
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">M</kbd>{" "}
              Metronome
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">
                1-3
              </kbd>{" "}
              Presets
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">
                Up/Down
              </kbd>{" "}
              Tempo
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
