"use client";

import { useCallback, useEffect, useState } from "react";
import { generateId } from "@/lib/id";
import {
  type CustomPreset,
  loadCustomPresets,
  saveCustomPresets,
} from "@/lib/persistence";
import type { Progression } from "@/lib/types";

const MAX_CUSTOM_PRESETS = 10;

export function useCustomPresets() {
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load custom presets on mount
  useEffect(() => {
    const presets = loadCustomPresets();
    setCustomPresets(presets);
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever presets change
  useEffect(() => {
    if (isLoaded) {
      saveCustomPresets(customPresets);
    }
  }, [customPresets, isLoaded]);

  const savePreset = useCallback(
    (name: string, progression: Progression): boolean => {
      if (customPresets.length >= MAX_CUSTOM_PRESETS) {
        return false;
      }

      const newPreset: CustomPreset = {
        id: generateId(),
        name: name.trim() || "My Preset",
        progression: {
          ...progression,
          name: name.trim() || "My Preset",
        },
        createdAt: Date.now(),
      };

      setCustomPresets((prev) => [...prev, newPreset]);
      return true;
    },
    [customPresets.length],
  );

  const deletePreset = useCallback((id: string) => {
    setCustomPresets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const renamePreset = useCallback((id: string, newName: string) => {
    setCustomPresets((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              name: newName.trim(),
              progression: { ...p.progression, name: newName.trim() },
            }
          : p,
      ),
    );
  }, []);

  return {
    customPresets,
    savePreset,
    deletePreset,
    renamePreset,
    isLoaded,
    canSaveMore: customPresets.length < MAX_CUSTOM_PRESETS,
    maxPresets: MAX_CUSTOM_PRESETS,
  };
}
