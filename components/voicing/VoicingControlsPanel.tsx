"use client";

import { ChevronLeft, ChevronRight, Guitar, RotateCcw } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  GuitarVoicingType,
  StringGroup,
  VoicingStructure,
  VSystemPosition,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

// Labels for display
const VOICING_TYPE_LABELS: Record<GuitarVoicingType, string> = {
  open: "Open",
  barre: "Barre",
  shell: "Shell",
  drop2: "Drop 2",
  drop3: "Drop 3",
  triadic: "Triadic",
  rootless: "Rootless",
};

const V_SYSTEM_LABELS: Record<VSystemPosition, string> = {
  "V-1": "V-1",
  "V-2": "V-2",
  "V-3": "V-3",
  "V-4": "V-4",
  "V-5": "V-5",
  "V-6": "V-6",
};

const STRING_GROUP_LABELS: Record<StringGroup, string> = {
  top4: "Top 4",
  inner4: "Inner 4",
  bottom4: "Bottom 4",
  spread: "Spread",
};

const STRUCTURE_LABELS: Record<VoicingStructure, string> = {
  close: "Close",
  drop2: "Drop 2",
  drop3: "Drop 3",
  drop24: "Drop 2+4",
  spread: "Spread",
};

const INVERSION_LABELS: Record<0 | 1 | 2 | 3, string> = {
  0: "Root",
  1: "1st",
  2: "2nd",
  3: "3rd",
};

const ALL_VOICING_TYPES: GuitarVoicingType[] = [
  "open",
  "barre",
  "shell",
  "drop2",
  "drop3",
  "triadic",
  "rootless",
];

const ALL_V_POSITIONS: VSystemPosition[] = [
  "V-1",
  "V-2",
  "V-3",
  "V-4",
  "V-5",
  "V-6",
];

const ALL_STRING_GROUPS: StringGroup[] = [
  "top4",
  "inner4",
  "bottom4",
  "spread",
];

const ALL_STRUCTURES: VoicingStructure[] = [
  "close",
  "drop2",
  "drop3",
  "drop24",
  "spread",
];

const ALL_INVERSIONS: (0 | 1 | 2 | 3)[] = [0, 1, 2, 3];

/**
 * Voicing controls panel for filtering and navigating guitar voicings.
 * Includes Ted Greene V-System filters.
 */
export function VoicingControlsPanel() {
  // State
  const showVoicings = useAppStore((state) => state.showVoicings);
  const setShowVoicings = useAppStore((state) => state.setShowVoicings);
  const showVoicingFingers = useAppStore((state) => state.showVoicingFingers);
  const setShowVoicingFingers = useAppStore(
    (state) => state.setShowVoicingFingers,
  );
  const availableVoicings = useAppStore((state) => state.availableVoicings);
  const selectedVoicingIndex = useAppStore(
    (state) => state.selectedVoicingIndex,
  );
  const selectNextVoicing = useAppStore((state) => state.selectNextVoicing);
  const selectPreviousVoicing = useAppStore(
    (state) => state.selectPreviousVoicing,
  );

  // Filter state
  const voicingFilter = useAppStore((state) => state.voicingFilter);
  const vSystemFilter = useAppStore((state) => state.vSystemFilter);
  const setVoicingTypes = useAppStore((state) => state.setVoicingTypes);
  const setMaxDifficulty = useAppStore((state) => state.setMaxDifficulty);
  const setVSystemPositions = useAppStore((state) => state.setVSystemPositions);
  const setStringGroups = useAppStore((state) => state.setStringGroups);
  const setVoicingStructures = useAppStore(
    (state) => state.setVoicingStructures,
  );
  const setInversions = useAppStore((state) => state.setInversions);
  const resetFilters = useAppStore((state) => state.resetFilters);

  // Toggle a voicing type in the filter
  const toggleVoicingType = useCallback(
    (type: GuitarVoicingType) => {
      const current = voicingFilter.types;
      if (current.includes(type)) {
        // Don't allow removing all types
        if (current.length > 1) {
          setVoicingTypes(current.filter((t) => t !== type));
        }
      } else {
        setVoicingTypes([...current, type]);
      }
    },
    [voicingFilter.types, setVoicingTypes],
  );

  // Toggle a V-System position
  const toggleVPosition = useCallback(
    (pos: VSystemPosition) => {
      const current = vSystemFilter.vPositions;
      if (current.includes(pos)) {
        setVSystemPositions(current.filter((p) => p !== pos));
      } else {
        setVSystemPositions([...current, pos]);
      }
    },
    [vSystemFilter.vPositions, setVSystemPositions],
  );

  // Toggle a string group
  const toggleStringGroup = useCallback(
    (group: StringGroup) => {
      const current = vSystemFilter.stringGroups;
      if (current.includes(group)) {
        setStringGroups(current.filter((g) => g !== group));
      } else {
        setStringGroups([...current, group]);
      }
    },
    [vSystemFilter.stringGroups, setStringGroups],
  );

  // Toggle a structure
  const toggleStructure = useCallback(
    (structure: VoicingStructure) => {
      const current = vSystemFilter.structures;
      if (current.includes(structure)) {
        setVoicingStructures(current.filter((s) => s !== structure));
      } else {
        setVoicingStructures([...current, structure]);
      }
    },
    [vSystemFilter.structures, setVoicingStructures],
  );

  // Toggle an inversion
  const toggleInversion = useCallback(
    (inv: 0 | 1 | 2 | 3) => {
      const current = vSystemFilter.inversions;
      if (current.includes(inv)) {
        setInversions(current.filter((i) => i !== inv));
      } else {
        setInversions([...current, inv]);
      }
    },
    [vSystemFilter.inversions, setInversions],
  );

  // Check if any filters are active
  const hasActiveFilters =
    voicingFilter.types.length < ALL_VOICING_TYPES.length ||
    voicingFilter.maxDifficulty !== "advanced" ||
    vSystemFilter.vPositions.length > 0 ||
    vSystemFilter.stringGroups.length > 0 ||
    vSystemFilter.structures.length > 0 ||
    vSystemFilter.inversions.length > 0;

  return (
    <div className="flex flex-col gap-3 pt-2 border-t">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Guitar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Voicings</span>
        </div>
        <Button
          variant={showVoicings ? "default" : "outline"}
          size="sm"
          onClick={() => setShowVoicings(!showVoicings)}
          aria-label={showVoicings ? "Hide voicings" : "Show voicings"}
          className={cn(
            "h-9 gap-1.5 text-xs",
            showVoicings && "bg-violet-500 hover:bg-violet-600",
          )}
        >
          {showVoicings ? "On" : "Off"}
        </Button>
      </div>

      {showVoicings && (
        <>
          {/* Navigation */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectPreviousVoicing}
              disabled={availableVoicings.length === 0}
              className="h-8 px-2"
              aria-label="Previous voicing"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              {availableVoicings.length > 0
                ? `${selectedVoicingIndex + 1} of ${availableVoicings.length}`
                : "No voicings"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={selectNextVoicing}
              disabled={availableVoicings.length === 0}
              className="h-8 px-2"
              aria-label="Next voicing"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Show finger numbers toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              Show Fingers
            </Label>
            <Button
              variant={showVoicingFingers ? "default" : "outline"}
              size="sm"
              onClick={() => setShowVoicingFingers(!showVoicingFingers)}
              className={cn(
                "h-8 text-xs",
                showVoicingFingers && "bg-violet-500 hover:bg-violet-600",
              )}
            >
              {showVoicingFingers ? "On" : "Off"}
            </Button>
          </div>

          {/* Voicing Type Filter */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              Voicing Types
            </Label>
            <div className="flex flex-wrap gap-1">
              {ALL_VOICING_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={
                    voicingFilter.types.includes(type) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => toggleVoicingType(type)}
                  className={cn(
                    "h-7 text-xs px-2",
                    voicingFilter.types.includes(type) &&
                      "bg-violet-500 hover:bg-violet-600",
                  )}
                >
                  {VOICING_TYPE_LABELS[type]}
                </Button>
              ))}
            </div>
          </div>

          {/* V-System Position Filter */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              Root Position (V-System)
            </Label>
            <div className="flex flex-wrap gap-1">
              {ALL_V_POSITIONS.map((pos) => (
                <Button
                  key={pos}
                  variant={
                    vSystemFilter.vPositions.includes(pos)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => toggleVPosition(pos)}
                  className={cn(
                    "h-7 text-xs px-2",
                    vSystemFilter.vPositions.includes(pos) &&
                      "bg-violet-500 hover:bg-violet-600",
                  )}
                >
                  {V_SYSTEM_LABELS[pos]}
                </Button>
              ))}
            </div>
          </div>

          {/* String Group Filter */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              String Group
            </Label>
            <div className="flex flex-wrap gap-1">
              {ALL_STRING_GROUPS.map((group) => (
                <Button
                  key={group}
                  variant={
                    vSystemFilter.stringGroups.includes(group)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => toggleStringGroup(group)}
                  className={cn(
                    "h-7 text-xs px-2",
                    vSystemFilter.stringGroups.includes(group) &&
                      "bg-violet-500 hover:bg-violet-600",
                  )}
                >
                  {STRING_GROUP_LABELS[group]}
                </Button>
              ))}
            </div>
          </div>

          {/* Structure Filter */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Structure</Label>
            <div className="flex flex-wrap gap-1">
              {ALL_STRUCTURES.map((structure) => (
                <Button
                  key={structure}
                  variant={
                    vSystemFilter.structures.includes(structure)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => toggleStructure(structure)}
                  className={cn(
                    "h-7 text-xs px-2",
                    vSystemFilter.structures.includes(structure) &&
                      "bg-violet-500 hover:bg-violet-600",
                  )}
                >
                  {STRUCTURE_LABELS[structure]}
                </Button>
              ))}
            </div>
          </div>

          {/* Inversion Filter */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Inversion</Label>
            <div className="flex flex-wrap gap-1">
              {ALL_INVERSIONS.map((inv) => (
                <Button
                  key={inv}
                  variant={
                    vSystemFilter.inversions.includes(inv)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => toggleInversion(inv)}
                  className={cn(
                    "h-7 text-xs px-2",
                    vSystemFilter.inversions.includes(inv) &&
                      "bg-violet-500 hover:bg-violet-600",
                  )}
                >
                  {INVERSION_LABELS[inv]}
                </Button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Difficulty</Label>
            <Select
              value={voicingFilter.maxDifficulty}
              onValueChange={(val) =>
                setMaxDifficulty(
                  val as "beginner" | "intermediate" | "advanced",
                )
              }
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Filters
            </Button>
          )}

          {/* Attribution */}
          <p className="text-[10px] text-muted-foreground/70 mt-1">
            Voicing organization inspired by Ted Greene&apos;s V-System
          </p>
        </>
      )}
    </div>
  );
}
