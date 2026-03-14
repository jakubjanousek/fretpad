"use client";

import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/state/useAppStore";

export function useFretboardDisplay() {
  return useAppStore(
    useShallow((state) => ({
      showScaleTones: state.showScaleTones,
      setShowScaleTones: state.setShowScaleTones,
      showVoiceLeading: state.showVoiceLeading,
      setShowVoiceLeading: state.setShowVoiceLeading,
      noteLabelMode: state.noteLabelMode,
      setNoteLabelMode: state.setNoteLabelMode,
      fretboardOverlay: state.fretboardOverlay,
      setFretboardOverlay: state.setFretboardOverlay,
      showCAGEDPositions: state.showCAGEDPositions,
      setShowCAGEDPositions: state.setShowCAGEDPositions,
      focusedPosition: state.focusedPosition,
      setFocusedPosition: state.setFocusedPosition,
      targetNoteMode: state.targetNoteMode,
      setTargetNoteMode: state.setTargetNoteMode,
      showChromaticApproach: state.showChromaticApproach,
      setShowChromaticApproach: state.setShowChromaticApproach,
      showDiatonicApproach: state.showDiatonicApproach,
      setShowDiatonicApproach: state.setShowDiatonicApproach,
      showEnclosures: state.showEnclosures,
      setShowEnclosures: state.setShowEnclosures,
      focusedEnclosureTarget: state.focusedEnclosureTarget,
      setFocusedEnclosureTarget: state.setFocusedEnclosureTarget,
    })),
  );
}
