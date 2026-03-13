import type { PracticeModeConfig, PracticeModeId } from "@/lib/types";

export const PRACTICE_MODES: Record<PracticeModeId, PracticeModeConfig> = {
  "learn-the-neck": {
    id: "learn-the-neck",
    label: "Learn the Neck",
    description:
      "Build fretboard familiarity — know where notes and intervals are.",
    slug: "learn-the-neck",
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
    theoryTabs: ["chord"],
  },

  "outline-chord-changes": {
    id: "outline-chord-changes",
    label: "Outline Chord Changes",
    description:
      "Practice hearing and visualizing chord tones as changes go by.",
    slug: "outline-chord-changes",
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
    theoryTabs: ["chord", "analysis"],
  },

  "comp-with-voicings": {
    id: "comp-with-voicings",
    label: "Comp with Voicings",
    description:
      "Practice comping with good voice leading through a progression.",
    slug: "comp-with-voicings",
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
    theoryTabs: ["chord", "subs"],
  },
};

export const PRACTICE_MODE_IDS = Object.keys(
  PRACTICE_MODES,
) as PracticeModeId[];

export function isValidModeId(value: string): value is PracticeModeId {
  return value in PRACTICE_MODES;
}
