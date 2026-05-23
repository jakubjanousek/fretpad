"use client";

import { Keyboard, Music, Timer, TrendingUp } from "lucide-react";
import posthog from "posthog-js";
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
import { AVAILABLE_STYLES } from "@/lib/audio/styles";
import type { StyleId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

import { TempoRampControls } from "./TempoRampControls";
import { VolumeControl } from "./VolumeControl";

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
  const setCompingVariations = useAppStore(
    (state) => state.setCompingVariations,
  );
  const selectedStyle = useAppStore((state) => state.selectedStyle);
  const setSelectedStyle = useAppStore((state) => state.setSelectedStyle);

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
                onClick={() => {
                  posthog.capture("metronome_toggled", {
                    enabled: !metronome.enabled,
                  });
                  setMetronomeEnabled(!metronome.enabled);
                }}
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
                onClick={() => {
                  posthog.capture("tempo_ramp_toggled", {
                    enabled: !tempoRamp.enabled,
                  });
                  setTempoRampEnabled(!tempoRamp.enabled);
                }}
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

            {AVAILABLE_STYLES.length > 1 ? (
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Style</Label>
                <div className="flex gap-1">
                  {AVAILABLE_STYLES.map((s) => (
                    <Button
                      key={s.id}
                      variant={selectedStyle === s.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStyle(s.id as StyleId)}
                      className={cn(
                        "h-7 text-xs",
                        selectedStyle === s.id &&
                          "bg-orange-500 hover:bg-orange-600",
                      )}
                    >
                      {s.name}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            <VolumeControl
              id="bass"
              label="Bass"
              volume={backingTrack.bassVolume}
              isMuted={backingTrack.bassMuted}
              onVolumeChange={(v) => setBackingTrackVolume("bass", v)}
              onMuteToggle={() =>
                setBackingTrackMuted("bass", !backingTrack.bassMuted)
              }
            />

            <VolumeControl
              id="chord"
              label="Chords"
              volume={backingTrack.chordVolume}
              isMuted={backingTrack.chordMuted}
              onVolumeChange={(v) => setBackingTrackVolume("chord", v)}
              onMuteToggle={() =>
                setBackingTrackMuted("chord", !backingTrack.chordMuted)
              }
            />

            <VolumeControl
              id="drums"
              label="Drums"
              volume={backingTrack.drumsVolume}
              isMuted={backingTrack.drumsMuted}
              onVolumeChange={(v) => setBackingTrackVolume("drums", v)}
              onMuteToggle={() =>
                setBackingTrackMuted("drums", !backingTrack.drumsMuted)
              }
            />

            {/* Comping Variations Toggle */}
            <div className="flex items-center justify-between pt-2">
              <Label className="text-xs text-muted-foreground">
                Comping variations
              </Label>
              <Button
                variant={backingTrack.compingVariations ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setCompingVariations(!backingTrack.compingVariations)
                }
                className={cn(
                  "h-7 w-12 text-xs",
                  backingTrack.compingVariations &&
                    "bg-orange-500 hover:bg-orange-600",
                )}
              >
                {backingTrack.compingVariations ? "On" : "Off"}
              </Button>
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
