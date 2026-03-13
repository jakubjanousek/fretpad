"use client";

import { PRACTICE_MODES } from "@/lib/modes";
import type {
  CAGEDPosition,
  FretboardOverlay,
  GuitarVoicing,
  NoteLabelMode,
  TargetNoteMode,
} from "@/lib/types";
import { useAppStore } from "@/state/useAppStore";

import { LabelSegmentedControl } from "./DisplayToolbar/LabelSegmentedControl";
import { LayersDropdown } from "./DisplayToolbar/LayersDropdown";
import { OverlayDropdown } from "./DisplayToolbar/OverlayDropdown";
import { TargetsDropdown } from "./DisplayToolbar/TargetsDropdown";
import { VoicingsButton } from "./DisplayToolbar/VoicingsButton";

export interface DisplayToolbarProps {
  // Overlay
  fretboardOverlay: FretboardOverlay;
  onOverlayChange?: (overlay: FretboardOverlay) => void;
  showCAGEDPositions: boolean;
  onToggleCAGEDPositions?: () => void;
  focusedPosition?: CAGEDPosition | null;
  onFocusedPositionChange?: (pos: CAGEDPosition | null) => void;

  // Labels
  noteLabelMode: NoteLabelMode;
  onNoteLabelModeChange?: (mode: NoteLabelMode) => void;

  // Voicings
  showVoicings: boolean;
  onToggleVoicings?: () => void;
  showVoicingFingers: boolean;
  onToggleVoicingFingers?: () => void;
  selectedVoicing?: GuitarVoicing | null;
  availableVoicingsCount?: number;
  selectedVoicingIndex?: number;
  onNextVoicing?: () => void;
  onPreviousVoicing?: () => void;

  // Layers
  showVoiceLeading: boolean;
  onToggleVoiceLeading?: () => void;
  showScaleTones: boolean;
  onToggleScaleTones?: () => void;

  // Targets
  targetNoteMode: TargetNoteMode;
  onTargetNoteModeChange?: (mode: TargetNoteMode) => void;
  showChromaticApproach: boolean;
  onToggleChromaticApproach?: () => void;
  showDiatonicApproach: boolean;
  onToggleDiatonicApproach?: () => void;
  showEnclosures: boolean;
  onToggleEnclosures?: () => void;
}

export function DisplayToolbar({
  // Overlay
  fretboardOverlay,
  onOverlayChange,
  showCAGEDPositions,
  onToggleCAGEDPositions,
  focusedPosition,
  onFocusedPositionChange,

  // Labels
  noteLabelMode,
  onNoteLabelModeChange,

  // Voicings
  showVoicings,
  onToggleVoicings,
  showVoicingFingers,
  onToggleVoicingFingers,
  selectedVoicing,
  availableVoicingsCount,
  selectedVoicingIndex,
  onNextVoicing,
  onPreviousVoicing,

  // Layers
  showVoiceLeading,
  onToggleVoiceLeading,
  showScaleTones,
  onToggleScaleTones,

  // Targets
  targetNoteMode,
  onTargetNoteModeChange,
  showChromaticApproach,
  onToggleChromaticApproach,
  showDiatonicApproach,
  onToggleDiatonicApproach,
  showEnclosures,
  onToggleEnclosures,
}: DisplayToolbarProps) {
  const activeMode = useAppStore((state) => state.activeMode);
  const modeConfig = activeMode ? PRACTICE_MODES[activeMode] : null;

  const showOverlay = modeConfig?.showOverlayDropdown ?? true;
  const showLabels = modeConfig?.showLabels ?? true;
  const showVoicingsControl = modeConfig?.showVoicingsButton ?? true;
  const showLayers = modeConfig?.showLayersDropdown ?? true;
  const showTargets = modeConfig?.showTargetsDropdown ?? true;

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {showOverlay && (
        <OverlayDropdown
          fretboardOverlay={fretboardOverlay}
          onOverlayChange={onOverlayChange}
          showCAGEDPositions={showCAGEDPositions}
          onToggleCAGEDPositions={onToggleCAGEDPositions}
          focusedPosition={focusedPosition}
          onFocusedPositionChange={onFocusedPositionChange}
        />
      )}

      {showLabels && (
        <LabelSegmentedControl
          noteLabelMode={noteLabelMode}
          onNoteLabelModeChange={onNoteLabelModeChange}
        />
      )}

      {showVoicingsControl && (
        <VoicingsButton
          showVoicings={showVoicings}
          onToggleVoicings={onToggleVoicings}
          showVoicingFingers={showVoicingFingers}
          onToggleVoicingFingers={onToggleVoicingFingers}
          selectedVoicing={selectedVoicing}
          availableVoicingsCount={availableVoicingsCount}
          selectedVoicingIndex={selectedVoicingIndex}
          onNextVoicing={onNextVoicing}
          onPreviousVoicing={onPreviousVoicing}
        />
      )}

      {showLayers && (
        <LayersDropdown
          showVoiceLeading={showVoiceLeading}
          onToggleVoiceLeading={onToggleVoiceLeading}
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
          showEnclosures={showEnclosures}
          onToggleEnclosures={onToggleEnclosures}
        />
      )}
    </div>
  );
}
