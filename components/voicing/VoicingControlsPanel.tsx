"use client";

import {
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Guitar,
  RotateCcw,
  Star,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type {
  GuitarVoicingType,
  StringGroup,
  VoicingStructure,
  VSystemPosition,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";
import { ChordDiagram } from "./ChordDiagram";
import { ChordScaleView } from "./ChordScaleView";

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

const DIFFICULTY_CONFIG: Record<
  "beginner" | "intermediate" | "advanced",
  { label: string; color: string; stars: number }
> = {
  beginner: { label: "Beginner", color: "text-emerald-500", stars: 1 },
  intermediate: { label: "Intermediate", color: "text-amber-500", stars: 2 },
  advanced: { label: "Advanced", color: "text-red-500", stars: 3 },
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
 * Display component for showing voicing name, type, V-System info, and difficulty
 */
function VoicingInfoDisplay({
  voicing,
}: {
  voicing: import("@/lib/types").GuitarVoicing | undefined;
}) {
  if (!voicing) return null;

  const diffConfig = DIFFICULTY_CONFIG[voicing.difficulty];

  // Build V-System info string
  const vSystemInfo = [
    voicing.vSystem,
    voicing.stringGroup && STRING_GROUP_LABELS[voicing.stringGroup],
    voicing.voicingStructure && STRUCTURE_LABELS[voicing.voicingStructure],
    voicing.inversion !== 0 && INVERSION_LABELS[voicing.inversion],
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-1 p-2 bg-muted/50 rounded-md">
      {/* Voicing name and type */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium truncate flex-1">
          {voicing.name}
        </span>
        <span className="text-xs px-1.5 py-0.5 bg-violet-500/20 text-violet-500 rounded shrink-0 ml-2">
          {VOICING_TYPE_LABELS[voicing.type]}
        </span>
      </div>

      {/* V-System info */}
      {vSystemInfo && (
        <span className="text-xs text-muted-foreground">{vSystemInfo}</span>
      )}

      {/* Difficulty indicator */}
      <div className="flex items-center gap-1.5">
        <div className={cn("flex items-center gap-0.5", diffConfig.color)}>
          {Array.from({ length: diffConfig.stars }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-current" />
          ))}
          {Array.from({ length: 3 - diffConfig.stars }).map((_, i) => (
            <Star key={i} className="h-3 w-3 text-muted-foreground/30" />
          ))}
        </div>
        <span className={cn("text-xs", diffConfig.color)}>
          {diffConfig.label}
        </span>
      </div>
    </div>
  );
}

/**
 * Voicing controls panel for filtering and navigating guitar voicings.
 * Includes Ted Greene V-System filters.
 */
export function VoicingControlsPanel() {
  // Local state for expanded views
  const [showChordDiagram, setShowChordDiagram] = useState(false);
  const [showChordScale, setShowChordScale] = useState(false);

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
  const currentChord = useAppStore((state) => state.currentChord);

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

  // Voice leading state
  const voiceLeading = useAppStore((state) => state.voiceLeading);
  const setVoiceLeadingEnabled = useAppStore(
    (state) => state.setVoiceLeadingEnabled,
  );
  const setVoiceLeadingMaxMovement = useAppStore(
    (state) => state.setVoiceLeadingMaxMovement,
  );
  const setShowMovementIndicators = useAppStore(
    (state) => state.setShowMovementIndicators,
  );
  const voiceLeadingSuggestions = useAppStore(
    (state) => state.voiceLeadingSuggestions,
  );
  const selectSuggestedVoicing = useAppStore(
    (state) => state.selectSuggestedVoicing,
  );

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

          {/* Voicing Info Display */}
          {availableVoicings.length > 0 && (
            <VoicingInfoDisplay
              voicing={availableVoicings[selectedVoicingIndex]}
            />
          )}

          {/* Chord Diagram Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              Chord Diagram
            </Label>
            <Button
              variant={showChordDiagram ? "default" : "outline"}
              size="sm"
              onClick={() => setShowChordDiagram(!showChordDiagram)}
              className={cn(
                "h-8 text-xs",
                showChordDiagram && "bg-violet-500 hover:bg-violet-600",
              )}
            >
              {showChordDiagram ? "On" : "Off"}
            </Button>
          </div>

          {/* Chord Diagram View */}
          {showChordDiagram &&
            availableVoicings.length > 0 &&
            availableVoicings[selectedVoicingIndex] && (
              <div className="flex justify-center p-2 bg-muted/30 rounded-md">
                <ChordDiagram
                  voicing={availableVoicings[selectedVoicingIndex]}
                  width={120}
                  showFingers={showVoicingFingers}
                  showFretNumbers={true}
                  chordName={currentChord?.symbol}
                />
              </div>
            )}

          {/* Chord Scale Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Chord Scale</Label>
            <Button
              variant={showChordScale ? "default" : "outline"}
              size="sm"
              onClick={() => setShowChordScale(!showChordScale)}
              className={cn(
                "h-8 text-xs",
                showChordScale && "bg-violet-500 hover:bg-violet-600",
              )}
            >
              {showChordScale ? "On" : "Off"}
            </Button>
          </div>

          {/* Chord Scale View */}
          {showChordScale &&
            availableVoicings.length > 0 &&
            currentChord &&
            availableVoicings[selectedVoicingIndex] && (
              <div className="p-2 bg-muted/30 rounded-md">
                <ChordScaleView
                  voicing={availableVoicings[selectedVoicingIndex]}
                  originalRoot={currentChord.root}
                  originalQuality={currentChord.quality}
                  numPositions={6}
                  compact={true}
                />
              </div>
            )}

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

          {/* Voice Leading Section */}
          <div className="flex flex-col gap-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Voice Leading</span>
              </div>
              <Button
                variant={voiceLeading.enabled ? "default" : "outline"}
                size="sm"
                onClick={() => setVoiceLeadingEnabled(!voiceLeading.enabled)}
                className={cn(
                  "h-8 text-xs",
                  voiceLeading.enabled && "bg-emerald-500 hover:bg-emerald-600",
                )}
              >
                {voiceLeading.enabled ? "On" : "Off"}
              </Button>
            </div>

            {voiceLeading.enabled && (
              <>
                {/* Max Movement Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                      Max Movement
                    </Label>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {voiceLeading.maxMovement} frets
                    </span>
                  </div>
                  <Slider
                    value={[voiceLeading.maxMovement]}
                    onValueChange={(value) =>
                      setVoiceLeadingMaxMovement(value[0] ?? 3)
                    }
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Show Movement Indicators */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">
                    Show Arrows
                  </Label>
                  <Button
                    variant={
                      voiceLeading.showMovementIndicators
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setShowMovementIndicators(
                        !voiceLeading.showMovementIndicators,
                      )
                    }
                    className={cn(
                      "h-7 text-xs",
                      voiceLeading.showMovementIndicators &&
                        "bg-emerald-500 hover:bg-emerald-600",
                    )}
                  >
                    {voiceLeading.showMovementIndicators ? "On" : "Off"}
                  </Button>
                </div>

                {/* Voice Leading Suggestions */}
                {voiceLeadingSuggestions.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Suggestions for Next Chord
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {voiceLeadingSuggestions
                        .slice(0, 3)
                        .map((suggestion, idx) => (
                          <Button
                            key={suggestion.voicing.id}
                            variant="outline"
                            size="sm"
                            onClick={() => selectSuggestedVoicing(idx)}
                            className="h-7 text-xs px-2 flex items-center gap-1"
                            title={`Score: ${suggestion.score.toFixed(1)}, Common tones: ${suggestion.commonToneCount}`}
                          >
                            <span className="truncate max-w-20">
                              {suggestion.voicing.name.split(" - ")[1] ??
                                suggestion.voicing.type}
                            </span>
                            {suggestion.commonToneCount > 0 && (
                              <span className="text-emerald-500 text-[10px]">
                                {suggestion.commonToneCount}ct
                              </span>
                            )}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
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
