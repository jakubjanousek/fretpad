import type { StateCreator } from "zustand";
import { filterVoicings } from "@/lib/guitar/v-system";
import {
  generateVoicingsForChord,
  sortVoicingsByPriority,
} from "@/lib/guitar/voicings";
import type {
  Chord,
  GuitarVoicing,
  GuitarVoicingType,
  StringGroup,
  VoicingStructure,
  VSystemPosition,
} from "@/lib/types";
import type { AppState } from "../useAppStore";

/**
 * V-System filter configuration
 */
export interface VSystemFilterConfig {
  vPositions: VSystemPosition[];
  stringGroups: StringGroup[];
  structures: VoicingStructure[];
  inversions: (0 | 1 | 2 | 3)[];
}

/**
 * Voicing filter configuration
 */
export interface VoicingFilterConfig {
  types: GuitarVoicingType[];
  maxDifficulty: "beginner" | "intermediate" | "advanced";
  maxFretStretch: number;
}

export interface VoicingSlice {
  // Visibility
  showVoicings: boolean;

  // Available voicings for current chord
  availableVoicings: GuitarVoicing[];

  // Selected voicing
  selectedVoicingIndex: number;

  // Basic voicing filters
  voicingFilter: VoicingFilterConfig;

  // V-System filters
  vSystemFilter: VSystemFilterConfig;

  // Voicing cache (keyed by chord symbol + filter hash)
  voicingCache: Map<string, GuitarVoicing[]>;

  // Actions
  setShowVoicings: (show: boolean) => void;
  selectVoicing: (index: number) => void;
  selectNextVoicing: () => void;
  selectPreviousVoicing: () => void;

  // Filter actions
  setVoicingTypes: (types: GuitarVoicingType[]) => void;
  setMaxDifficulty: (
    difficulty: "beginner" | "intermediate" | "advanced",
  ) => void;
  setVSystemPositions: (positions: VSystemPosition[]) => void;
  setStringGroups: (groups: StringGroup[]) => void;
  setVoicingStructures: (structures: VoicingStructure[]) => void;
  setInversions: (inversions: (0 | 1 | 2 | 3)[]) => void;
  resetFilters: () => void;

  // Voicing generation
  refreshVoicingsForChord: (chord: Chord | null) => void;
  clearVoicingCache: () => void;

  // Computed getters (as actions that return values)
  getSelectedVoicing: () => GuitarVoicing | null;
  getFilteredVoicings: () => GuitarVoicing[];
}

// Default filter values
const defaultVoicingFilter: VoicingFilterConfig = {
  types: ["open", "barre", "shell", "drop2", "drop3", "triadic", "rootless"],
  maxDifficulty: "advanced",
  maxFretStretch: 4,
};

const defaultVSystemFilter: VSystemFilterConfig = {
  vPositions: [],
  stringGroups: [],
  structures: [],
  inversions: [],
};

/**
 * Generate a cache key from chord symbol and current filters
 */
function generateCacheKey(
  chordSymbol: string,
  voicingFilter: VoicingFilterConfig,
  vSystemFilter: VSystemFilterConfig,
): string {
  const filterParts = [
    chordSymbol,
    voicingFilter.types.sort().join(","),
    voicingFilter.maxDifficulty,
    vSystemFilter.vPositions.sort().join(","),
    vSystemFilter.stringGroups.sort().join(","),
    vSystemFilter.structures.sort().join(","),
    vSystemFilter.inversions.sort().join(","),
  ];
  return filterParts.join("|");
}

export const createVoicingSlice: StateCreator<
  AppState,
  [],
  [],
  VoicingSlice
> = (set, get) => ({
  // Initial state
  showVoicings: false,
  availableVoicings: [],
  selectedVoicingIndex: 0,
  voicingFilter: { ...defaultVoicingFilter },
  vSystemFilter: { ...defaultVSystemFilter },
  voicingCache: new Map(),

  // Visibility toggle
  setShowVoicings: (show) => {
    set({ showVoicings: show });
    // Generate voicings when turning on
    if (show) {
      const { currentChord, refreshVoicingsForChord } = get();
      refreshVoicingsForChord(currentChord);
    }
  },

  // Selection
  selectVoicing: (index) => {
    const { availableVoicings } = get();
    if (index >= 0 && index < availableVoicings.length) {
      set({ selectedVoicingIndex: index });
    }
  },

  selectNextVoicing: () => {
    const { availableVoicings, selectedVoicingIndex } = get();
    if (availableVoicings.length === 0) return;
    const nextIndex = (selectedVoicingIndex + 1) % availableVoicings.length;
    set({ selectedVoicingIndex: nextIndex });
  },

  selectPreviousVoicing: () => {
    const { availableVoicings, selectedVoicingIndex } = get();
    if (availableVoicings.length === 0) return;
    const prevIndex =
      selectedVoicingIndex === 0
        ? availableVoicings.length - 1
        : selectedVoicingIndex - 1;
    set({ selectedVoicingIndex: prevIndex });
  },

  // Basic filter setters
  setVoicingTypes: (types) => {
    set((state) => ({
      voicingFilter: { ...state.voicingFilter, types },
    }));
    // Refresh voicings with new filter
    const { currentChord, refreshVoicingsForChord } = get();
    refreshVoicingsForChord(currentChord);
  },

  setMaxDifficulty: (maxDifficulty) => {
    set((state) => ({
      voicingFilter: { ...state.voicingFilter, maxDifficulty },
    }));
    const { currentChord, refreshVoicingsForChord } = get();
    refreshVoicingsForChord(currentChord);
  },

  // V-System filter setters
  setVSystemPositions: (vPositions) => {
    set((state) => ({
      vSystemFilter: { ...state.vSystemFilter, vPositions },
    }));
    const { currentChord, refreshVoicingsForChord } = get();
    refreshVoicingsForChord(currentChord);
  },

  setStringGroups: (stringGroups) => {
    set((state) => ({
      vSystemFilter: { ...state.vSystemFilter, stringGroups },
    }));
    const { currentChord, refreshVoicingsForChord } = get();
    refreshVoicingsForChord(currentChord);
  },

  setVoicingStructures: (structures) => {
    set((state) => ({
      vSystemFilter: { ...state.vSystemFilter, structures },
    }));
    const { currentChord, refreshVoicingsForChord } = get();
    refreshVoicingsForChord(currentChord);
  },

  setInversions: (inversions) => {
    set((state) => ({
      vSystemFilter: { ...state.vSystemFilter, inversions },
    }));
    const { currentChord, refreshVoicingsForChord } = get();
    refreshVoicingsForChord(currentChord);
  },

  resetFilters: () => {
    set({
      voicingFilter: { ...defaultVoicingFilter },
      vSystemFilter: { ...defaultVSystemFilter },
    });
    const { currentChord, refreshVoicingsForChord } = get();
    refreshVoicingsForChord(currentChord);
  },

  // Voicing generation with caching
  refreshVoicingsForChord: (chord) => {
    if (!chord) {
      set({ availableVoicings: [], selectedVoicingIndex: 0 });
      return;
    }

    const { voicingFilter, vSystemFilter, voicingCache, showVoicings } = get();

    // Don't generate if voicings are not being shown
    if (!showVoicings) {
      return;
    }

    // Check cache
    const cacheKey = generateCacheKey(
      chord.symbol,
      voicingFilter,
      vSystemFilter,
    );
    const cached = voicingCache.get(cacheKey);
    if (cached) {
      set({
        availableVoicings: cached,
        selectedVoicingIndex: 0,
      });
      return;
    }

    // Check if any V-System filters are active
    const hasVSystemFilters =
      vSystemFilter.vPositions.length > 0 ||
      vSystemFilter.stringGroups.length > 0 ||
      vSystemFilter.structures.length > 0 ||
      vSystemFilter.inversions.length > 0;

    let voicings: GuitarVoicing[];

    if (hasVSystemFilters) {
      // Use V-System filtering
      voicings = filterVoicings(chord, {
        vPositions:
          vSystemFilter.vPositions.length > 0
            ? vSystemFilter.vPositions
            : undefined,
        stringGroups:
          vSystemFilter.stringGroups.length > 0
            ? vSystemFilter.stringGroups
            : undefined,
        structures:
          vSystemFilter.structures.length > 0
            ? vSystemFilter.structures
            : undefined,
        inversions:
          vSystemFilter.inversions.length > 0
            ? vSystemFilter.inversions
            : undefined,
        maxDifficulty: voicingFilter.maxDifficulty,
      });

      // Additional type filtering
      if (voicingFilter.types.length < 7) {
        voicings = voicings.filter((v) => voicingFilter.types.includes(v.type));
      }
    } else {
      // Use basic generation with type and difficulty filters
      voicings = generateVoicingsForChord(chord, {
        types: voicingFilter.types.length < 7 ? voicingFilter.types : undefined,
        maxDifficulty: voicingFilter.maxDifficulty,
      });
    }

    // Sort by priority
    voicings = sortVoicingsByPriority(voicings);

    // Update cache (limit cache size to prevent memory issues)
    const newCache = new Map(voicingCache);
    if (newCache.size > 50) {
      // Remove oldest entries
      const keysToDelete = Array.from(newCache.keys()).slice(0, 10);
      for (const key of keysToDelete) {
        newCache.delete(key);
      }
    }
    newCache.set(cacheKey, voicings);

    set({
      availableVoicings: voicings,
      selectedVoicingIndex: 0,
      voicingCache: newCache,
    });
  },

  clearVoicingCache: () => {
    set({ voicingCache: new Map() });
  },

  // Computed getters
  getSelectedVoicing: () => {
    const { availableVoicings, selectedVoicingIndex } = get();
    return availableVoicings[selectedVoicingIndex] ?? null;
  },

  getFilteredVoicings: () => {
    const { availableVoicings } = get();
    return availableVoicings;
  },
});
