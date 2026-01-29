"use client";

import { Music, Volume2, VolumeOff } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

export function BackingTrackControls() {
  const backingTrack = useAppStore((state) => state.backingTrack);
  const setBackingTrackVolume = useAppStore(
    (state) => state.setBackingTrackVolume,
  );
  const setBackingTrackMuted = useAppStore(
    (state) => state.setBackingTrackMuted,
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
              aria-label={backingTrack.bassMuted ? "Unmute bass" : "Mute bass"}
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
  );
}
