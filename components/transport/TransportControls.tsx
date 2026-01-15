"use client";

import {
  Keyboard,
  Music,
  Play,
  RotateCcw,
  Square,
  Timer,
  Volume2,
  VolumeOff,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { StyleSelector } from "./StyleSelector";

/**
 * Transport controls for playback: play/stop buttons and tempo slider.
 * Integrates with the audio engine and app store.
 */
export function TransportControls() {
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
  const setMetronomeVolume = useAppStore((state) => state.setMetronomeVolume);
  const setMetronomeCountIn = useAppStore((state) => state.setMetronomeCountIn);
  const setBackingTrackVolume = useAppStore(
    (state) => state.setBackingTrackVolume,
  );
  const setBackingTrackMuted = useAppStore(
    (state) => state.setBackingTrackMuted,
  );

  const style = getStyle(selectedStyle);
  const [showShortcuts, setShowShortcuts] = useState(false);

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

  const handleMetronomeVolumeChange = useCallback(
    (value: number[]) => {
      const newVolume = value[0];
      if (newVolume !== undefined) {
        setMetronomeVolume(newVolume);
      }
    },
    [setMetronomeVolume],
  );

  const handleBassVolumeChange = useCallback(
    (value: number[]) => {
      const newVolume = value[0];
      if (newVolume !== undefined) {
        setBackingTrackVolume("bass", newVolume);
      }
    },
    [setBackingTrackVolume],
  );

  const handleChordVolumeChange = useCallback(
    (value: number[]) => {
      const newVolume = value[0];
      if (newVolume !== undefined) {
        setBackingTrackVolume("chord", newVolume);
      }
    },
    [setBackingTrackVolume],
  );

  const handleBassMuteToggle = useCallback(() => {
    setBackingTrackMuted("bass", !backingTrack.bassMuted);
  }, [backingTrack.bassMuted, setBackingTrackMuted]);

  const handleChordMuteToggle = useCallback(() => {
    setBackingTrackMuted("chord", !backingTrack.chordMuted);
  }, [backingTrack.chordMuted, setBackingTrackMuted]);

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

      {/* Metronome Controls (shown when metronome is enabled) */}
      {metronome.enabled && (
        <div className="flex flex-col gap-3">
          {/* Metronome Volume */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="metronome-volume-slider"
                className="text-sm text-muted-foreground"
              >
                Metronome Volume
              </Label>
              <span className="text-sm font-mono tabular-nums">
                {metronome.volume} dB
              </span>
            </div>
            <Slider
              id="metronome-volume-slider"
              min={-20}
              max={0}
              step={1}
              value={[metronome.volume]}
              onValueChange={handleMetronomeVolumeChange}
              className="w-full"
              aria-label="Metronome volume"
            />
          </div>

          {/* Count-In Selector */}
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Count-In</Label>
            <div className="flex gap-1">
              {([0, 1, 2] as const).map((bars) => (
                <Button
                  key={bars}
                  variant={metronome.countIn === bars ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMetronomeCountIn(bars)}
                  className={cn(
                    "h-7 w-12 text-xs",
                    metronome.countIn === bars &&
                      "bg-orange-500 hover:bg-orange-600",
                  )}
                >
                  {bars === 0 ? "Off" : `${bars} bar${bars > 1 ? "s" : ""}`}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Style Selector */}
      <StyleSelector />

      {/* Backing Track Volume Controls */}
      <div className="flex flex-col gap-3 pt-2 border-t">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Backing Track</span>
        </div>

        {/* Bass Volume */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBassMuteToggle}
                aria-label={
                  backingTrack.bassMuted ? "Unmute bass" : "Mute bass"
                }
                className="h-7 w-7 shrink-0"
              >
                {backingTrack.bassMuted ? (
                  <VolumeOff className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {backingTrack.bassMuted ? "Unmute bass" : "Mute bass"}
            </TooltipContent>
          </Tooltip>
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="bass-volume-slider"
                className="text-xs text-muted-foreground"
              >
                Bass
              </Label>
              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                {backingTrack.bassMuted
                  ? "Muted"
                  : `${backingTrack.bassVolume} dB`}
              </span>
            </div>
            <Slider
              id="bass-volume-slider"
              min={-30}
              max={0}
              step={1}
              value={[backingTrack.bassVolume]}
              onValueChange={handleBassVolumeChange}
              disabled={backingTrack.bassMuted}
              className={cn("w-full", backingTrack.bassMuted && "opacity-50")}
              aria-label="Bass volume"
            />
          </div>
        </div>

        {/* Chord Volume */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleChordMuteToggle}
                aria-label={
                  backingTrack.chordMuted ? "Unmute chords" : "Mute chords"
                }
                className="h-7 w-7 shrink-0"
              >
                {backingTrack.chordMuted ? (
                  <VolumeOff className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {backingTrack.chordMuted ? "Unmute chords" : "Mute chords"}
            </TooltipContent>
          </Tooltip>
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="chord-volume-slider"
                className="text-xs text-muted-foreground"
              >
                Chords
              </Label>
              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                {backingTrack.chordMuted
                  ? "Muted"
                  : `${backingTrack.chordVolume} dB`}
              </span>
            </div>
            <Slider
              id="chord-volume-slider"
              min={-30}
              max={0}
              step={1}
              value={[backingTrack.chordVolume]}
              onValueChange={handleChordVolumeChange}
              disabled={backingTrack.chordMuted}
              className={cn("w-full", backingTrack.chordMuted && "opacity-50")}
              aria-label="Chord volume"
            />
          </div>
        </div>
      </div>

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
