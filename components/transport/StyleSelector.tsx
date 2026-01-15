"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVAILABLE_STYLES } from "@/lib/audio/styles";
import type { StyleId } from "@/lib/types";
import { useAppStore } from "@/state/useAppStore";

/**
 * Style selector dropdown for choosing backing track style.
 * Disabled during playback to prevent style changes mid-play.
 */
export function StyleSelector() {
  const selectedStyle = useAppStore((state) => state.selectedStyle);
  const setSelectedStyle = useAppStore((state) => state.setSelectedStyle);
  const isPlaying = useAppStore((state) => state.isPlaying);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="style-select" className="text-sm text-muted-foreground">
        Backing Style
      </Label>
      <Select
        value={selectedStyle}
        onValueChange={(value) => setSelectedStyle(value as StyleId)}
        disabled={isPlaying}
      >
        <SelectTrigger id="style-select" className="w-full">
          <SelectValue placeholder="Select a style" />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_STYLES.map((style) => (
            <SelectItem key={style.id} value={style.id}>
              {style.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
