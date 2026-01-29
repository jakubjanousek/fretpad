"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { TempoRampConfig } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

interface TempoRampControlsProps {
  tempoRamp: TempoRampConfig;
}

const LOOP_OPTIONS = [1, 2, 4, 8] as const;

export function TempoRampControls({ tempoRamp }: TempoRampControlsProps) {
  const setTempoRampIncrement = useAppStore(
    (state) => state.setTempoRampIncrement,
  );
  const setTempoRampEveryNLoops = useAppStore(
    (state) => state.setTempoRampEveryNLoops,
  );
  const loopCount = useAppStore((state) => state.loopCount);
  const isPlaying = useAppStore((state) => state.isPlaying);

  const handleIncrementChange = useCallback(
    (value: number[]) => {
      const newIncrement = value[0];
      if (newIncrement !== undefined) {
        setTempoRampIncrement(newIncrement);
      }
    },
    [setTempoRampIncrement],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Increment */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="ramp-increment-slider"
            className="text-sm text-muted-foreground"
          >
            Increment
          </Label>
          <span className="text-sm font-mono tabular-nums">
            +{tempoRamp.increment} BPM
          </span>
        </div>
        <Slider
          id="ramp-increment-slider"
          min={1}
          max={20}
          step={1}
          value={[tempoRamp.increment]}
          onValueChange={handleIncrementChange}
          className="w-full"
          aria-label="Tempo ramp increment"
        />
      </div>

      {/* Every N Loops */}
      <div className="flex items-center justify-between">
        <Label className="text-sm text-muted-foreground">Every N loops</Label>
        <div className="flex gap-1">
          {LOOP_OPTIONS.map((n) => (
            <Button
              key={n}
              variant={tempoRamp.everyNLoops === n ? "default" : "outline"}
              size="sm"
              onClick={() => setTempoRampEveryNLoops(n)}
              className={cn(
                "h-7 w-10 text-xs",
                tempoRamp.everyNLoops === n &&
                  "bg-orange-500 hover:bg-orange-600",
              )}
            >
              {n}
            </Button>
          ))}
        </div>
      </div>

      {/* Loop counter (shown during playback) */}
      {isPlaying && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Loops completed</span>
          <span className="font-mono tabular-nums">{loopCount}</span>
        </div>
      )}
    </div>
  );
}
