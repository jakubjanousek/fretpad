import type { PRESET_PROGRESSIONS } from "@/lib/theory/presets";
import type { PracticeModeConfig, PracticeModeId } from "@/lib/types";

export const DEFAULT_SHARE_MODE: PracticeModeId = "outline-chord-changes";

type PresetName = keyof typeof PRESET_PROGRESSIONS;

export interface PracticeModeConfigWithPreset extends PracticeModeConfig {
  defaultPreset: PresetName;
}

export const PRACTICE_MODES: Record<
  PracticeModeId,
  PracticeModeConfigWithPreset
> = {
  "learn-the-neck": {
    id: "learn-the-neck",
    label: "Learn the Neck",
    description:
      "Build fretboard familiarity — know where notes and intervals are.",
    defaultPreset: "Dorian Vamp (Dm7)",
    defaultTempo: 90,
    defaultStyle: "bossaNova",

    showOverlayDropdown: true,
    showLabels: true,
    showVoicingsButton: false,
    showLayersDropdown: false,
    showTargetsDropdown: false,
    showQuiz: true,
    showCAGED: true,
    showMicToggle: false,
    theoryTabs: ["chord"],
  },

  "outline-chord-changes": {
    id: "outline-chord-changes",
    label: "Outline Chord Changes",
    description:
      "Practice hearing and visualizing chord tones as changes go by.",
    defaultPreset: "ii-V-I in C",
    defaultTempo: 120,
    defaultStyle: "jazzSwing",

    showOverlayDropdown: false,
    showLabels: true,
    showVoicingsButton: false,
    showLayersDropdown: true,
    showTargetsDropdown: true,
    showQuiz: false,
    showCAGED: false,
    showMicToggle: true,
    theoryTabs: ["chord", "analysis"],
  },

  "comp-with-voicings": {
    id: "comp-with-voicings",
    label: "Comp with Voicings",
    description:
      "Practice comping with good voice leading through a progression.",
    defaultPreset: "ii-V-I in C",
    defaultTempo: 120,
    defaultStyle: "jazzSwing",

    showOverlayDropdown: false,
    showLabels: true,
    showVoicingsButton: true,
    showLayersDropdown: false,
    showTargetsDropdown: false,
    showQuiz: false,
    showCAGED: false,
    showMicToggle: false,
    theoryTabs: ["chord", "subs"],
  },
};

export const PRACTICE_MODE_IDS = Object.keys(
  PRACTICE_MODES,
) as PracticeModeId[];

export function isValidModeId(value: string): value is PracticeModeId {
  return value in PRACTICE_MODES;
}
