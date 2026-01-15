"use client";

import { Play, RotateCcw, Square } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useAppStore } from "@/state/useAppStore";

/**
 * Transport controls for playback: play/stop buttons and tempo slider.
 * Integrates with the audio engine and app store.
 */
export function TransportControls() {
  const progression = useAppStore((state) => state.progression);
  const tempo = useAppStore((state) => state.tempo);
  const isPlaying = useAppStore((state) => state.isPlaying);
  const setTempo = useAppStore((state) => state.setTempo);
  const setIsPlaying = useAppStore((state) => state.setIsPlaying);
  const setCurrentPosition = useAppStore((state) => state.setCurrentPosition);

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

  const handleTempoChange = useCallback(
    (value: number[]) => {
      setTempo(value[0]);
    },
    [setTempo],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
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
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          aria-label="Reset to beginning"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
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
    </div>
  );
}
