"use client";

import { ChevronDown, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FretboardOverlay } from "@/lib/types";
import { cn } from "@/lib/utils";

const OVERLAY_OPTIONS: {
  value: FretboardOverlay;
  label: string;
  shortLabel: string;
}[] = [
  { value: "none", label: "None", shortLabel: "None" },
  {
    value: "pentatonicMinor",
    label: "Minor Pentatonic",
    shortLabel: "Min Pent",
  },
  {
    value: "pentatonicMajor",
    label: "Major Pentatonic",
    shortLabel: "Maj Pent",
  },
  { value: "blues", label: "Blues", shortLabel: "Blues" },
  { value: "arpeggio", label: "Arpeggio", shortLabel: "Arpeggio" },
];

interface OverlayDropdownProps {
  fretboardOverlay: FretboardOverlay;
  onOverlayChange?: (overlay: FretboardOverlay) => void;
}

function getOverlayLabel(overlay: FretboardOverlay, short = false): string {
  const opt = OVERLAY_OPTIONS.find((o) => o.value === overlay);
  return short ? (opt?.shortLabel ?? "None") : (opt?.label ?? "None");
}

export function OverlayDropdown({
  fretboardOverlay,
  onOverlayChange,
}: OverlayDropdownProps) {
  const isActive = fretboardOverlay !== "none";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 px-2.5 gap-1.5 text-xs",
            isActive && "border-emerald-500/50 bg-emerald-500/10",
          )}
        >
          <Grid3X3 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {isActive ? getOverlayLabel(fretboardOverlay, true) : "Scales"}
          </span>
          <span className="sm:hidden">
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuRadioGroup
          value={fretboardOverlay}
          onValueChange={(v) => onOverlayChange?.(v as FretboardOverlay)}
        >
          {OVERLAY_OPTIONS.map((opt) => (
            <DropdownMenuRadioItem key={opt.value} value={opt.value}>
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
