"use client";

import { ChevronDown, Play, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCustomPresets } from "@/hooks/useCustomPresets";
import { playChordPreview, stopPreview } from "@/lib/audio/preview";
import type { CustomPreset } from "@/lib/persistence";
import {
  getPresetsByCategory,
  PRESET_PROGRESSIONS,
  type PresetCategory,
  type PresetDifficulty,
  type PresetMetadata,
} from "@/lib/theory/presets";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

const CATEGORY_LABELS: Record<PresetCategory, string> = {
  jazz: "Jazz",
  pop: "Pop/Rock",
  blues: "Blues",
  modal: "Modal Vamps",
};

const CATEGORY_ICONS: Record<PresetCategory, string> = {
  jazz: "🎷",
  pop: "🎸",
  blues: "🎹",
  modal: "🎵",
};

const CATEGORY_COLORS: Record<PresetCategory, string> = {
  jazz: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30",
  pop: "bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/30",
  blues: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30",
  modal: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30",
};

const CATEGORY_ACTIVE_COLORS: Record<PresetCategory, string> = {
  jazz: "bg-purple-500/30 border-purple-500",
  pop: "bg-pink-500/30 border-pink-500",
  blues: "bg-blue-500/30 border-blue-500",
  modal: "bg-amber-500/30 border-amber-500",
};

const DIFFICULTY_CONFIG: Record<
  PresetDifficulty,
  { label: string; color: string }
> = {
  beginner: { label: "Easy", color: "bg-emerald-500/80 text-white" },
  intermediate: { label: "Med", color: "bg-amber-500/80 text-white" },
  advanced: { label: "Hard", color: "bg-red-500/80 text-white" },
};

const CATEGORY_ORDER: PresetCategory[] = ["jazz", "pop", "blues", "modal"];

/**
 * Get a preview of the chord sequence from a preset
 */
function getPresetChordSequence(presetKey: string): string[] {
  const progression =
    PRESET_PROGRESSIONS[presetKey as keyof typeof PRESET_PROGRESSIONS];
  if (!progression) return [];

  // Get first 4 bars (or all if less than 4)
  const barsToShow = progression.bars.slice(0, 4);
  return barsToShow.flatMap((bar) => bar.chords.map((c) => c.chord));
}

function PresetButton({
  preset,
  isActive,
  onClick,
}: {
  preset: PresetMetadata;
  isActive: boolean;
  onClick: () => void;
}) {
  const difficultyConfig = DIFFICULTY_CONFIG[preset.difficulty];
  const chordSequence = getPresetChordSequence(preset.key);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPreview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopPreview();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    // Play first 2-4 chords as preview
    const chordsToPlay = chordSequence.slice(0, 4);
    for (let i = 0; i < chordsToPlay.length; i++) {
      const chord = chordsToPlay[i];
      if (chord) {
        await playChordPreview(chord, 0.8);
        // Wait between chords
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
    }
    setIsPlaying(false);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "group relative flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-all duration-150 active:scale-[0.98] min-w-30",
            isActive
              ? CATEGORY_ACTIVE_COLORS[preset.category]
              : CATEGORY_COLORS[preset.category],
          )}
        >
          {/* Header: Label + Difficulty */}
          <div className="flex items-center gap-1.5 w-full">
            <span className="text-xs font-medium truncate flex-1">
              {preset.label}
            </span>
            <span
              className={cn(
                "text-[9px] font-medium px-1.5 py-0.5 rounded shrink-0",
                difficultyConfig.color,
              )}
            >
              {difficultyConfig.label}
            </span>
          </div>

          {/* Footer: Bar count */}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>{preset.barCount} bars</span>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="p-3 max-w-70 bg-popover text-popover-foreground border shadow-lg"
        sideOffset={8}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm">{preset.label}</p>
            <button
              type="button"
              onClick={handlePlayPreview}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isPlaying
                  ? "bg-cyan-500/20 text-cyan-500"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
              title={isPlaying ? "Stop preview" : "Play preview"}
            >
              <Play
                className={cn("w-3.5 h-3.5", isPlaying && "animate-pulse")}
              />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{preset.description}</p>
          <div className="flex flex-wrap gap-1 pt-1">
            {chordSequence.map((chord, i) => (
              <span
                key={`${chord}-${i}`}
                className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded"
              >
                {chord}
              </span>
            ))}
            {preset.barCount > 4 && (
              <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground">
                +{preset.barCount - 4} more
              </span>
            )}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function CustomPresetButton({
  preset,
  isActive,
  onLoad,
  onDelete,
}: {
  preset: CustomPreset;
  isActive: boolean;
  onLoad: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant={isActive ? "secondary" : "outline"}
        size="sm"
        onClick={onLoad}
        className="text-xs"
        title={`Load "${preset.name}"`}
      >
        {preset.name}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
        title="Delete preset"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

function SavePresetForm({
  onSave,
  onCancel,
}: {
  onSave: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
      <Input
        type="text"
        placeholder="Preset name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-7 text-xs"
        autoFocus
      />
      <Button type="submit" variant="secondary" size="sm" className="h-7 px-2">
        Save
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="h-7 w-7 p-0"
      >
        <X className="h-3 w-3" />
      </Button>
    </form>
  );
}

export function ProgressionPresets() {
  const loadPreset = useAppStore((state) => state.loadPreset);
  const setProgression = useAppStore((state) => state.setProgression);
  const currentProgression = useAppStore((state) => state.progression);
  const [openCategories, setOpenCategories] = useState<
    Set<PresetCategory | "custom">
  >(new Set(["jazz"]));
  const [showSaveForm, setShowSaveForm] = useState(false);

  const { customPresets, savePreset, deletePreset, canSaveMore, isLoaded } =
    useCustomPresets();

  const presetsByCategory = getPresetsByCategory();

  const toggleCategory = (category: PresetCategory | "custom") => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const isBuiltInPresetActive = (key: string) => {
    const presetProgression =
      PRESET_PROGRESSIONS[key as keyof typeof PRESET_PROGRESSIONS];
    return (
      presetProgression && currentProgression.name === presetProgression.name
    );
  };

  const isCustomPresetActive = (preset: CustomPreset) => {
    return currentProgression.name === preset.progression.name;
  };

  const handleSavePreset = (name: string) => {
    const success = savePreset(name, currentProgression);
    if (success) {
      setShowSaveForm(false);
      // Open custom category to show the new preset
      setOpenCategories((prev) => new Set([...prev, "custom"]));
    }
  };

  const handleLoadCustomPreset = (preset: CustomPreset) => {
    setProgression(preset.progression);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Presets</h3>
        {canSaveMore && !showSaveForm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSaveForm(true)}
            className="h-6 px-2 text-xs"
            title="Save current progression as preset"
          >
            <Plus className="h-3 w-3 mr-1" />
            Save
          </Button>
        )}
      </div>

      {showSaveForm && (
        <div className="px-2 py-1.5 bg-muted/50 rounded-md">
          <SavePresetForm
            onSave={handleSavePreset}
            onCancel={() => setShowSaveForm(false)}
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        {/* Custom Presets */}
        {isLoaded && customPresets.length > 0 && (
          <Collapsible
            open={openCategories.has("custom")}
            onOpenChange={() => toggleCategory("custom")}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between px-2 h-8 text-xs font-medium"
              >
                My Presets ({customPresets.length})
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${openCategories.has("custom") ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-wrap gap-1.5 px-2 py-1.5">
                {customPresets.map((preset) => (
                  <CustomPresetButton
                    key={preset.id}
                    preset={preset}
                    isActive={isCustomPresetActive(preset)}
                    onLoad={() => handleLoadCustomPreset(preset)}
                    onDelete={() => deletePreset(preset.id)}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Built-in Presets by Category */}
        {CATEGORY_ORDER.map((category) => {
          const presets = presetsByCategory[category];
          const isOpen = openCategories.has(category);

          return (
            <Collapsible
              key={category}
              open={isOpen}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between px-2 h-8 text-xs font-medium"
                >
                  <span className="flex items-center gap-1.5">
                    <span>{CATEGORY_ICONS[category]}</span>
                    <span>{CATEGORY_LABELS[category]}</span>
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-wrap gap-2 px-2 py-2">
                  {presets.map((preset) => (
                    <PresetButton
                      key={preset.key}
                      preset={preset}
                      isActive={isBuiltInPresetActive(preset.key)}
                      onClick={() =>
                        loadPreset(
                          preset.key as keyof typeof PRESET_PROGRESSIONS,
                        )
                      }
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
