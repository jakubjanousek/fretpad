import type { PRESET_PROGRESSIONS } from "@/lib/theory/presets";
import type {
  PracticeModeConfig,
  PracticeModeId,
  TargetNoteMode,
} from "@/lib/types";

export const DEFAULT_SHARE_MODE: PracticeModeId = "outline-chord-changes";

type PresetName = keyof typeof PRESET_PROGRESSIONS;

export interface PracticeModeConfigWithPreset extends PracticeModeConfig {
  defaultPreset: PresetName;
}

interface BaseModeStep {
  id: string;
  label: string;
}

export interface LearnStep extends BaseModeStep {
  targetMode: TargetNoteMode;
}

export interface OutlineStep extends BaseModeStep {
  targetMode: TargetNoteMode;
}

export interface CompStep extends BaseModeStep {}

type PracticeModeStep = LearnStep | OutlineStep | CompStep;

export const MODE_STEPS = {
  "learn-the-neck": [
    {
      id: "identify-roots",
      label: "Identify Root Notes",
      targetMode: "root",
    },
    {
      id: "find-guide-tones",
      label: "Find Root + Guide Tones",
      targetMode: "root-and-guides",
    },
    {
      id: "chord-tone-id",
      label: "Chord Tone Identification",
      targetMode: "chord-tones",
    },
  ] as const satisfies readonly LearnStep[],
  "outline-chord-changes": [
    {
      id: "hit-the-root",
      label: "Hit the Root",
      targetMode: "root",
    },
    {
      id: "aim-guide-tones",
      label: "Aim for Root + Guide Tones",
      targetMode: "root-and-guides",
    },
    {
      id: "approach-notes",
      label: "Add Approach Notes",
      targetMode: "root-and-guides",
    },
    {
      id: "free-improv",
      label: "Free Improvisation",
      targetMode: "chord-tones",
    },
  ] as const satisfies readonly OutlineStep[],
  "comp-with-voicings": [
    { id: "learn-shapes", label: "Learn Shapes" },
    { id: "practice-transitions", label: "Practice Transitions" },
  ] as const satisfies readonly CompStep[],
} as const satisfies Record<PracticeModeId, readonly PracticeModeStep[]>;

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
    showMicToggle: true,
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
