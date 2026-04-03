"use client";

import { PRACTICE_MODES } from "@/lib/modes";
import type {
  FretboardOverlay,
  NoteLabelMode,
  TargetNoteMode,
} from "@/lib/types";
import { useAppStore } from "@/state/useAppStore";

import { LabelSegmentedControl } from "./DisplayToolbar/LabelSegmentedControl";
import { LayersDropdown } from "./DisplayToolbar/LayersDropdown";
import { OverlayDropdown } from "./DisplayToolbar/OverlayDropdown";
import { TargetsDropdown } from "./DisplayToolbar/TargetsDropdown";

export interface DisplayToolbarProps {
  // Overlay
  fretboardOverlay: FretboardOverlay;
  onOverlayChange?: (overlay: FretboardOverlay) => void;

  // Labels
  noteLabelMode: NoteLabelMode;
  onNoteLabelModeChange?: (mode: NoteLabelMode) => void;

  // Layers
  showScaleTones: boolean;
  onToggleScaleTones?: () => void;

  // Targets
  targetNoteMode: TargetNoteMode;
  onTargetNoteModeChange?: (mode: TargetNoteMode) => void;
  showChromaticApproach: boolean;
  onToggleChromaticApproach?: () => void;
  showDiatonicApproach: boolean;
  onToggleDiatonicApproach?: () => void;
}

export function DisplayToolbar({
  // Overlay
  fretboardOverlay,
  onOverlayChange,

  // Labels
  noteLabelMode,
  onNoteLabelModeChange,

  // Layers
  showScaleTones,
  onToggleScaleTones,

  // Targets
  targetNoteMode,
  onTargetNoteModeChange,
  showChromaticApproach,
  onToggleChromaticApproach,
  showDiatonicApproach,
  onToggleDiatonicApproach,
}: DisplayToolbarProps) {
  const activeMode = useAppStore((state) => state.activeMode);
  const modeConfig = activeMode ? PRACTICE_MODES[activeMode] : null;

  const showOverlay = modeConfig?.showOverlayDropdown ?? true;
  const showLabels = modeConfig?.showLabels ?? true;
  const showLayers = modeConfig?.showLayersDropdown ?? true;
  const showTargets = modeConfig?.showTargetsDropdown ?? true;

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {showOverlay && (
        <OverlayDropdown
          fretboardOverlay={fretboardOverlay}
          onOverlayChange={onOverlayChange}
        />
      )}

      {showLabels && (
        <LabelSegmentedControl
          noteLabelMode={noteLabelMode}
          onNoteLabelModeChange={onNoteLabelModeChange}
        />
      )}

      {showLayers && (
        <LayersDropdown
          showScaleTones={showScaleTones}
          onToggleScaleTones={onToggleScaleTones}
        />
      )}

      {showTargets && (
        <TargetsDropdown
          targetNoteMode={targetNoteMode}
          onTargetNoteModeChange={onTargetNoteModeChange}
          showChromaticApproach={showChromaticApproach}
          onToggleChromaticApproach={onToggleChromaticApproach}
          showDiatonicApproach={showDiatonicApproach}
          onToggleDiatonicApproach={onToggleDiatonicApproach}
        />
      )}
    </div>
  );
}
