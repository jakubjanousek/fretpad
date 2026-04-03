"use client";

import { ChevronDown, Clock, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCustomPresets } from "@/hooks/useCustomPresets";
import {
  addRecentPreset,
  type CustomPreset,
  loadRecentPresets,
  type RecentPreset,
} from "@/lib/persistence";
import {
  getPresetsByCategory,
  PRESET_METADATA,
  PRESET_PROGRESSIONS,
  type PresetCategory,
  type PresetMetadata,
} from "@/lib/theory";
import { useAppStore } from "@/state/useAppStore";

const CATEGORY_LABELS: Record<PresetCategory, string> = {
  jazz: "Jazz",
  pop: "Pop/Rock",
  blues: "Blues",
  modal: "Modal Vamps",
};

const CATEGORY_ORDER: PresetCategory[] = ["jazz", "pop", "blues", "modal"];

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
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-1.5 p-2 border-t"
      onClick={(e) => e.stopPropagation()}
    >
      <Input
        type="text"
        placeholder="Preset name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-7 text-xs flex-1"
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

export function PresetDropdown() {
  const loadPreset = useAppStore((state) => state.loadPreset);
  const setProgression = useAppStore((state) => state.setProgression);
  const currentProgression = useAppStore((state) => state.progression);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [recentPresets, setRecentPresets] = useState<RecentPreset[]>([]);

  const { customPresets, savePreset, deletePreset, canSaveMore, isLoaded } =
    useCustomPresets();

  const presetsByCategory = getPresetsByCategory();

  // Load recent presets on mount
  useEffect(() => {
    setRecentPresets(loadRecentPresets());
  }, []);

  // Filter presets based on search
  const filteredPresets = useMemo(() => {
    if (!search.trim()) return presetsByCategory;

    const searchLower = search.toLowerCase();
    const filtered: Record<PresetCategory, PresetMetadata[]> = {
      jazz: [],
      pop: [],
      blues: [],
      modal: [],
    };

    for (const category of CATEGORY_ORDER) {
      filtered[category] = presetsByCategory[category].filter(
        (preset) =>
          preset.label.toLowerCase().includes(searchLower) ||
          preset.description.toLowerCase().includes(searchLower),
      );
    }

    return filtered;
  }, [search, presetsByCategory]);

  const filteredCustomPresets = useMemo(() => {
    if (!search.trim()) return customPresets;

    const searchLower = search.toLowerCase();
    return customPresets.filter((preset) =>
      preset.name.toLowerCase().includes(searchLower),
    );
  }, [search, customPresets]);

  const hasResults =
    CATEGORY_ORDER.some((cat) => filteredPresets[cat].length > 0) ||
    filteredCustomPresets.length > 0;

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

  const handleLoadBuiltInPreset = (key: string) => {
    loadPreset(key as keyof typeof PRESET_PROGRESSIONS);
    addRecentPreset(key, "builtin");
    setRecentPresets(loadRecentPresets());
    setOpen(false);
    setSearch("");
  };

  const handleLoadCustomPreset = (preset: CustomPreset) => {
    setProgression(preset.progression);
    addRecentPreset(preset.id, "custom");
    setRecentPresets(loadRecentPresets());
    setOpen(false);
    setSearch("");
  };

  const handleSavePreset = (name: string) => {
    const success = savePreset(name, currentProgression);
    if (success) {
      setShowSaveForm(false);
    }
  };

  // Get recent preset data for display
  const recentPresetItems = useMemo(() => {
    return recentPresets
      .map((recent) => {
        if (recent.type === "builtin") {
          const metadata =
            PRESET_METADATA[recent.key as keyof typeof PRESET_METADATA];
          if (!metadata) return null;
          return {
            type: "builtin" as const,
            key: recent.key,
            label: metadata.label,
            description: metadata.description,
          };
        } else {
          const custom = customPresets.find((p) => p.id === recent.key);
          if (!custom) return null;
          return {
            type: "custom" as const,
            key: recent.key,
            label: custom.name,
            preset: custom,
          };
        }
      })
      .filter(Boolean);
  }, [recentPresets, customPresets]);

  // Get current preset name for display
  const currentPresetName = useMemo(() => {
    // Check built-in presets
    for (const [key, progression] of Object.entries(PRESET_PROGRESSIONS)) {
      if (progression.name === currentProgression.name) {
        const metadata = PRESET_METADATA[key as keyof typeof PRESET_METADATA];
        return metadata?.label || key;
      }
    }
    // Check custom presets
    const customMatch = customPresets.find(
      (p) => p.progression.name === currentProgression.name,
    );
    if (customMatch) {
      return customMatch.name;
    }
    return currentProgression.name;
  }, [currentProgression.name, customPresets]);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <span className="text-xs font-medium truncate max-w-32">
              {currentPresetName}
            </span>
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64"
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {/* Search input */}
          <div className="p-2 pb-1">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search presets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-7 text-xs"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!hasResults && search && (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No presets found
              </div>
            )}

            {/* Recent Presets */}
            {!search && recentPresetItems.length > 0 && (
              <>
                <DropdownMenuLabel className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Recent
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  {recentPresetItems.map((item) =>
                    item ? (
                      <DropdownMenuItem
                        key={`recent-${item.key}`}
                        onClick={() => {
                          if (item.type === "builtin") {
                            handleLoadBuiltInPreset(item.key);
                          } else if (item.preset) {
                            handleLoadCustomPreset(item.preset);
                          }
                        }}
                        className="text-xs"
                      >
                        {item.label}
                      </DropdownMenuItem>
                    ) : null,
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Custom Presets */}
            {isLoaded && filteredCustomPresets.length > 0 && (
              <>
                <DropdownMenuLabel>My Presets</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {filteredCustomPresets.map((preset) => (
                    <DropdownMenuItem
                      key={preset.id}
                      className="text-xs justify-between group/item"
                      onClick={() => handleLoadCustomPreset(preset)}
                    >
                      <span
                        className={
                          isCustomPresetActive(preset) ? "font-medium" : ""
                        }
                      >
                        {preset.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePreset(preset.id);
                        }}
                        className="opacity-0 group-hover/item:opacity-100 hover:text-destructive transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Built-in Presets by Category */}
            {CATEGORY_ORDER.map((category) => {
              const presets = filteredPresets[category];
              if (presets.length === 0) return null;

              return (
                <div key={category}>
                  <DropdownMenuLabel>
                    {CATEGORY_LABELS[category]}
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {presets.map((preset) => (
                      <DropdownMenuItem
                        key={preset.key}
                        onClick={() => handleLoadBuiltInPreset(preset.key)}
                        className="text-xs"
                        title={preset.description}
                      >
                        <span
                          className={
                            isBuiltInPresetActive(preset.key)
                              ? "font-medium"
                              : ""
                          }
                        >
                          {preset.label}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                </div>
              );
            })}
          </div>

          {/* Save form */}
          {showSaveForm ? (
            <SavePresetForm
              onSave={handleSavePreset}
              onCancel={() => setShowSaveForm(false)}
            />
          ) : (
            canSaveMore && (
              <div className="p-1 border-t">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSaveForm(true);
                  }}
                  className="text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Save Current as Preset
                </DropdownMenuItem>
              </div>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
