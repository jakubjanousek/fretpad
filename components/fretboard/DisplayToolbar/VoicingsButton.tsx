"use client";

import { ChevronDown, ChevronLeft, ChevronRight, Guitar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { GuitarVoicing } from "@/lib/types";
import { cn } from "@/lib/utils";

interface VoicingsButtonProps {
  showVoicings: boolean;
  onToggleVoicings?: () => void;
  showVoicingFingers: boolean;
  onToggleVoicingFingers?: () => void;
  selectedVoicing?: GuitarVoicing | null;
  availableVoicingsCount?: number;
  selectedVoicingIndex?: number;
  onNextVoicing?: () => void;
  onPreviousVoicing?: () => void;
}

function ToggleSwitch({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-8 h-5 rounded-full relative transition-colors shrink-0",
        active ? "bg-blue-500" : "bg-muted-foreground/30",
      )}
    >
      <div
        className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
          active ? "translate-x-3.5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function VoicingsButton({
  showVoicings,
  onToggleVoicings,
  showVoicingFingers,
  onToggleVoicingFingers,
  selectedVoicing,
  availableVoicingsCount = 0,
  selectedVoicingIndex = 0,
  onNextVoicing,
  onPreviousVoicing,
}: VoicingsButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 px-2.5 gap-1.5 text-xs",
            showVoicings && "border-violet-500/50 bg-violet-500/10",
          )}
        >
          <Guitar className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Voicings</span>
          {showVoicings && (
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3">
        <div className="space-y-3">
          {/* Show Voicings toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Show Voicings</div>
              <div className="text-[10px] text-muted-foreground">
                Highlight playable chord shapes
              </div>
            </div>
            <ToggleSwitch active={showVoicings} onToggle={onToggleVoicings} />
          </div>

          {showVoicings && (
            <>
              {/* Finger Numbers toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Finger Numbers</div>
                  <div className="text-[10px] text-muted-foreground">
                    1-4, T=thumb
                  </div>
                </div>
                <ToggleSwitch
                  active={showVoicingFingers}
                  onToggle={onToggleVoicingFingers}
                />
              </div>

              {/* Voicing Navigation */}
              {availableVoicingsCount > 1 && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    Voicing {selectedVoicingIndex + 1} of{" "}
                    {availableVoicingsCount}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={onPreviousVoicing}
                      aria-label="Previous voicing"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={onNextVoicing}
                      aria-label="Next voicing"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Current Voicing Info */}
              {selectedVoicing && (
                <div className="pt-2 border-t">
                  <div className="text-xs font-medium">
                    {selectedVoicing.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex flex-wrap gap-x-2">
                    <span>{selectedVoicing.type}</span>
                    <span>{selectedVoicing.difficulty}</span>
                    {selectedVoicing.vSystem && (
                      <span>{selectedVoicing.vSystem}</span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
