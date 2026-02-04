"use client";

import type {
  CAGEDPosition,
  FretboardOverlay,
  GuitarVoicing,
  NoteLabelMode,
  TargetNoteMode,
} from "@/lib/types";

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
  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      <OverlayDropdown
        fretboardOverlay={fretboardOverlay}
        onOverlayChange={onOverlayChange}
        showCAGEDPositions={showCAGEDPositions}
        onToggleCAGEDPositions={onToggleCAGEDPositions}
        focusedPosition={focusedPosition}
        onFocusedPositionChange={onFocusedPositionChange}
      />

      <LabelSegmentedControl
        noteLabelMode={noteLabelMode}
        onNoteLabelModeChange={onNoteLabelModeChange}
      />

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

      <LayersDropdown
        showVoiceLeading={showVoiceLeading}
        onToggleVoiceLeading={onToggleVoiceLeading}
        showScaleTones={showScaleTones}
        onToggleScaleTones={onToggleScaleTones}
      />

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
    </div>
  );
}
