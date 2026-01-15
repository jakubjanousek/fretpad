"use client";

import { ChevronDown, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { useCustomPresets } from "@/hooks/useCustomPresets";
import type { CustomPreset } from "@/lib/persistence";
import {
  getPresetsByCategory,
  PRESET_PROGRESSIONS,
  type PresetCategory,
  type PresetMetadata,
} from "@/lib/theory/progression";
import { useAppStore } from "@/state/useAppStore";

const CATEGORY_LABELS: Record<PresetCategory, string> = {
  jazz: "Jazz",
  pop: "Pop/Rock",
  blues: "Blues",
  modal: "Modal Vamps",
};

const CATEGORY_ORDER: PresetCategory[] = ["jazz", "pop", "blues", "modal"];

function PresetButton({
  preset,
  isActive,
  onClick,
}: {
  preset: PresetMetadata;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={isActive ? "secondary" : "outline"}
      size="sm"
      onClick={onClick}
      className="text-xs"
      title={preset.description}
    >
      {preset.label}
    </Button>
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
                  {CATEGORY_LABELS[category]}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-wrap gap-1.5 px-2 py-1.5">
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
