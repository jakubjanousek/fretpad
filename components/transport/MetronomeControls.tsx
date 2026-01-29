"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { MetronomeConfig } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

interface MetronomeControlsProps {
  metronome: MetronomeConfig;
}

export function MetronomeControls({ metronome }: MetronomeControlsProps) {
  const setMetronomeVolume = useAppStore((state) => state.setMetronomeVolume);
  const setMetronomeCountIn = useAppStore((state) => state.setMetronomeCountIn);

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
  );
}
