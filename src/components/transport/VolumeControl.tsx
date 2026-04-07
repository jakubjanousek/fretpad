import { Volume2, VolumeOff } from "lucide-react";
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

interface VolumeControlProps {
  id: string;
  label: string;
  volume: number;
  isMuted: boolean;
  min?: number;
  max?: number;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

export function VolumeControl({
  id,
  label,
  volume,
  isMuted,
  min = -30,
  max = 0,
  onVolumeChange,
  onMuteToggle,
}: VolumeControlProps) {
  const handleSliderChange = useCallback(
    (value: number[]) => {
      const newVolume = value[0];
      if (newVolume !== undefined) {
        onVolumeChange(newVolume);
      }
    },
    [onVolumeChange],
  );

  const lowerLabel = label.toLowerCase();

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMuteToggle}
            aria-label={isMuted ? `Unmute ${lowerLabel}` : `Mute ${lowerLabel}`}
            className="h-9 w-9 shrink-0"
          >
            {isMuted ? (
              <VolumeOff className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          {isMuted ? `Unmute ${lowerLabel}` : `Mute ${lowerLabel}`}
        </TooltipContent>
      </Tooltip>
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={`${id}-volume-slider`}
            className="text-xs text-muted-foreground"
          >
            {label}
          </Label>
          <span className="text-xs font-mono tabular-nums text-muted-foreground">
            {isMuted ? "Muted" : `${volume} dB`}
          </span>
        </div>
        <Slider
          id={`${id}-volume-slider`}
          min={min}
          max={max}
          step={1}
          value={[volume]}
          onValueChange={handleSliderChange}
          disabled={isMuted}
          className={cn("w-full", isMuted && "opacity-50")}
          aria-label={`${label} volume`}
        />
      </div>
    </div>
  );
}
