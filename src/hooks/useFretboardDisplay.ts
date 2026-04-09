"use client";

import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/state/useAppStore";

export function useFretboardDisplay() {
  return useAppStore(
    useShallow((state) => ({
      showScaleTones: state.showScaleTones,
      setShowScaleTones: state.setShowScaleTones,
      noteLabelMode: state.noteLabelMode,
      setNoteLabelMode: state.setNoteLabelMode,
      fretboardOverlay: state.fretboardOverlay,
      setFretboardOverlay: state.setFretboardOverlay,
      maxFrets: state.maxFrets,
      setMaxFrets: state.setMaxFrets,
      targetNoteMode: state.targetNoteMode,
      setTargetNoteMode: state.setTargetNoteMode,
      showChromaticApproach: state.showChromaticApproach,
      setShowChromaticApproach: state.setShowChromaticApproach,
      showDiatonicApproach: state.showDiatonicApproach,
      setShowDiatonicApproach: state.setShowDiatonicApproach,
      showGhostNotes: state.showGhostNotes,
      setShowGhostNotes: state.setShowGhostNotes,
    })),
  );
}
