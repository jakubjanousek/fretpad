"use client";

import { Button } from "@/components/ui/button";
import { PRESET_PROGRESSIONS } from "@/lib/theory/progression";
import { useAppStore } from "@/state/useAppStore";

const presets = [
  {
    key: "ii-V-I in C" as const,
    label: "ii–V–I",
    description: "Jazz standard",
  },
  {
    key: "I-V-vi-IV in C" as const,
    label: "I–V–vi–IV",
    description: "Pop progression",
  },
  {
    key: "12-bar blues in A" as const,
    label: "12-Bar Blues",
    description: "Blues standard",
  },
];

export function ProgressionPresets() {
  const loadPreset = useAppStore((state) => state.loadPreset);
  const currentProgression = useAppStore((state) => state.progression);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-muted-foreground">Presets</h3>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isActive =
            currentProgression.name === PRESET_PROGRESSIONS[preset.key].name;
          return (
            <Button
              key={preset.key}
              variant={isActive ? "secondary" : "outline"}
              size="sm"
              onClick={() => loadPreset(preset.key)}
              className="text-xs"
              title={preset.description}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
