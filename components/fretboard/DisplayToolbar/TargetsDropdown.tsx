"use client";

import { ChevronDown, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TargetNoteMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const TARGET_MODE_OPTIONS: { value: TargetNoteMode; label: string }[] = [
  { value: "none", label: "None" },
  { value: "chord-tones", label: "Chord Tones" },
  { value: "guide-tones-only", label: "Guide Tones" },
  { value: "strong-beats", label: "Strong Beats" },
];

interface TargetsDropdownProps {
  targetNoteMode: TargetNoteMode;
  onTargetNoteModeChange?: (mode: TargetNoteMode) => void;
  showChromaticApproach: boolean;
  onToggleChromaticApproach?: () => void;
  showDiatonicApproach: boolean;
  onToggleDiatonicApproach?: () => void;
  showEnclosures: boolean;
  onToggleEnclosures?: () => void;
}

export function TargetsDropdown({
  targetNoteMode,
  onTargetNoteModeChange,
  showChromaticApproach,
  onToggleChromaticApproach,
  showDiatonicApproach,
  onToggleDiatonicApproach,
  showEnclosures,
  onToggleEnclosures,
}: TargetsDropdownProps) {
  const isActive = targetNoteMode !== "none";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 px-2.5 gap-1.5 text-xs",
            isActive && "border-orange-500/50 bg-orange-500/10",
          )}
        >
          <Target className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Targets</span>
          {isActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Target Mode</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={targetNoteMode}
          onValueChange={(v) => onTargetNoteModeChange?.(v as TargetNoteMode)}
        >
          {TARGET_MODE_OPTIONS.map((opt) => (
            <DropdownMenuRadioItem key={opt.value} value={opt.value}>
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        {isActive && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Approach Patterns</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={showChromaticApproach}
              onCheckedChange={onToggleChromaticApproach}
            >
              <div className="flex flex-col gap-0.5">
                <span>Chromatic</span>
                <span className="text-[10px] text-muted-foreground">
                  Half-step approaches (amber)
                </span>
              </div>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showDiatonicApproach}
              onCheckedChange={onToggleDiatonicApproach}
            >
              <div className="flex flex-col gap-0.5">
                <span>Diatonic</span>
                <span className="text-[10px] text-muted-foreground">
                  Scale-step approaches (blue)
                </span>
              </div>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showEnclosures}
              onCheckedChange={onToggleEnclosures}
            >
              <div className="flex flex-col gap-0.5">
                <span>Enclosures</span>
                <span className="text-[10px] text-muted-foreground">
                  Click target to see enclosure
                </span>
              </div>
            </DropdownMenuCheckboxItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
