"use client";

import {
  Keyboard,
  Music,
  Timer,
  TrendingUp,
  Volume2,
  VolumeOff,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

import { TempoRampControls } from "./TempoRampControls";

interface TransportDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Expandable settings drawer containing volume controls, style selector,
 * metronome settings, and keyboard shortcuts.
 */
export function TransportDrawer({ open, onOpenChange }: TransportDrawerProps) {
  const metronome = useAppStore((state) => state.metronome);
  const backingTrack = useAppStore((state) => state.backingTrack);
  const setMetronomeVolume = useAppStore((state) => state.setMetronomeVolume);
  const setMetronomeCountIn = useAppStore((state) => state.setMetronomeCountIn);
  const setMetronomeEnabled = useAppStore((state) => state.setMetronomeEnabled);
  const setBackingTrackVolume = useAppStore(
    (state) => state.setBackingTrackVolume,
  );
  const setBackingTrackMuted = useAppStore(
    (state) => state.setBackingTrackMuted,
  );
  const tempoRamp = useAppStore((state) => state.tempoRamp);
  const setTempoRampEnabled = useAppStore((state) => state.setTempoRampEnabled);

  const [showShortcuts, setShowShortcuts] = useState(false);

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

  const handleDrumsVolumeChange = useCallback(
    (value: number[]) => {
      const newVolume = value[0];
      if (newVolume !== undefined) {
        setBackingTrackVolume("drums", newVolume);
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

  const handleDrumsMuteToggle = useCallback(() => {
    setBackingTrackMuted("drums", !backingTrack.drumsMuted);
  }, [backingTrack.drumsMuted, setBackingTrackMuted]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Adjust audio settings and backing track options.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 p-4">
          {/* Metronome Settings */}
          <div className="flex flex-col gap-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Metronome</span>
              </div>
              <Button
                variant={metronome.enabled ? "default" : "outline"}
                size="sm"
                onClick={() => setMetronomeEnabled(!metronome.enabled)}
                aria-label={
                  metronome.enabled ? "Disable metronome" : "Enable metronome"
                }
                className={cn(
                  "h-9 gap-1.5 text-xs",
                  metronome.enabled && "bg-orange-500 hover:bg-orange-600",
                )}
              >
                {metronome.enabled ? "On" : "Off"}
              </Button>
            </div>

            {metronome.enabled && (
              <>
                {/* Metronome Volume */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="metronome-volume-slider"
                      className="text-sm text-muted-foreground"
                    >
                      Volume
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
                  <Label className="text-sm text-muted-foreground">
                    Count-In
                  </Label>
                  <div className="flex gap-1">
                    {([0, 1, 2] as const).map((bars) => (
                      <Button
                        key={bars}
                        variant={
                          metronome.countIn === bars ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setMetronomeCountIn(bars)}
                        className={cn(
                          "h-9 w-12 text-xs",
                          metronome.countIn === bars &&
                            "bg-orange-500 hover:bg-orange-600",
                        )}
                      >
                        {bars === 0
                          ? "Off"
                          : `${bars} bar${bars > 1 ? "s" : ""}`}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tempo Ramp */}
          <div className="flex flex-col gap-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tempo Ramp</span>
              </div>
              <Button
                variant={tempoRamp.enabled ? "default" : "outline"}
                size="sm"
                onClick={() => setTempoRampEnabled(!tempoRamp.enabled)}
                aria-label={
                  tempoRamp.enabled ? "Disable tempo ramp" : "Enable tempo ramp"
                }
                className={cn(
                  "h-9 gap-1.5 text-xs",
                  tempoRamp.enabled && "bg-orange-500 hover:bg-orange-600",
                )}
              >
                {tempoRamp.enabled ? "On" : "Off"}
              </Button>
            </div>
            {tempoRamp.enabled && <TempoRampControls tempoRamp={tempoRamp} />}
          </div>

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
                    className="h-9 w-9 shrink-0"
                  >
                    {backingTrack.bassMuted ? (
                      <VolumeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
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
                  className={cn(
                    "w-full",
                    backingTrack.bassMuted && "opacity-50",
                  )}
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
                    className="h-9 w-9 shrink-0"
                  >
                    {backingTrack.chordMuted ? (
                      <VolumeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
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
                  className={cn(
                    "w-full",
                    backingTrack.chordMuted && "opacity-50",
                  )}
                  aria-label="Chord volume"
                />
              </div>
            </div>

            {/* Drums Volume */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDrumsMuteToggle}
                    aria-label={
                      backingTrack.drumsMuted ? "Unmute drums" : "Mute drums"
                    }
                    className="h-9 w-9 shrink-0"
                  >
                    {backingTrack.drumsMuted ? (
                      <VolumeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  {backingTrack.drumsMuted ? "Unmute drums" : "Mute drums"}
                </TooltipContent>
              </Tooltip>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="drums-volume-slider"
                    className="text-xs text-muted-foreground"
                  >
                    Drums
                  </Label>
                  <span className="text-xs font-mono tabular-nums text-muted-foreground">
                    {backingTrack.drumsMuted
                      ? "Muted"
                      : `${backingTrack.drumsVolume} dB`}
                  </span>
                </div>
                <Slider
                  id="drums-volume-slider"
                  min={-30}
                  max={0}
                  step={1}
                  value={[backingTrack.drumsVolume]}
                  onValueChange={handleDrumsVolumeChange}
                  disabled={backingTrack.drumsMuted}
                  className={cn(
                    "w-full",
                    backingTrack.drumsMuted && "opacity-50",
                  )}
                  aria-label="Drums volume"
                />
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
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
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">
                    R
                  </kbd>{" "}
                  Reset
                </div>
                <div>
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">
                    M
                  </kbd>{" "}
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
                <div>
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">
                    V
                  </kbd>{" "}
                  Voicings
                </div>
                <div>
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">
                    [ ]
                  </kbd>{" "}
                  Prev/Next
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
