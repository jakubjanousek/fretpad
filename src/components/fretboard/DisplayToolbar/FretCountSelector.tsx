"use client";

import { Button } from "@/components/ui/button";
import type { MaxFrets } from "@/lib/types";

const FRET_OPTIONS: MaxFrets[] = [12, 15, 17];

interface FretCountSelectorProps {
  maxFrets: MaxFrets;
  onMaxFretsChange?: (frets: MaxFrets) => void;
}

export function FretCountSelector({
  maxFrets,
  onMaxFretsChange,
}: FretCountSelectorProps) {
  return (
    <div
      data-slot="button-group"
      className="inline-flex rounded-md border border-border shadow-xs overflow-hidden"
    >
      {FRET_OPTIONS.map((frets, i) => (
        <Button
          key={frets}
          variant="toggle"
          size="xs"
          data-state={maxFrets === frets ? "on" : "off"}
          onClick={() => onMaxFretsChange?.(frets)}
          className={`rounded-none border-0 ${i < FRET_OPTIONS.length - 1 ? "border-r border-border" : ""}`}
          aria-label={`${frets} frets`}
        >
          {frets}
        </Button>
      ))}
    </div>
  );
}
