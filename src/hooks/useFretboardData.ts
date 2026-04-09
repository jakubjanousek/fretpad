"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { getFretNotesForChord } from "@/lib/fretboard";
import {
  filterApproachNotesFromChordTones,
  getArpeggioConnections,
  getArpeggioNotes,
  getChromaticApproachNotes,
  getDiatonicApproachNotes,
  getGhostNotes,
  getNextChord,
  getOverlayNotes,
  getTargetNotes,
} from "@/lib/theory";
import { useAppStore } from "@/state/useAppStore";

export function useFretboardData() {
  const {
    currentChord,
    progression,
    previewScale,
    showScaleTones,
    fretboardOverlay,
    maxFrets,
    targetNoteMode,
    showChromaticApproach,
    showDiatonicApproach,
    showGhostNotes,
    currentBarIndex,
    currentChordIndex,
  } = useAppStore(
    useShallow((state) => ({
      currentChord: state.currentChord,
      progression: state.progression,
      previewScale: state.previewScale,
      showScaleTones: state.showScaleTones,
      fretboardOverlay: state.fretboardOverlay,
      maxFrets: state.maxFrets,
      targetNoteMode: state.targetNoteMode,
      showChromaticApproach: state.showChromaticApproach,
      showDiatonicApproach: state.showDiatonicApproach,
      showGhostNotes: state.showGhostNotes,
      currentBarIndex: state.currentBarIndex,
      currentChordIndex: state.currentChordIndex,
    })),
  );

  const activeScale =
    previewScale || (showScaleTones ? currentChord?.suggestedScales[0] : null);
  const isOverlayActive = fretboardOverlay !== "none";

  const fretNotes = useMemo(() => {
    if (!currentChord) {
      return [];
    }

    if (isOverlayActive) {
      if (fretboardOverlay === "arpeggio") {
        return getArpeggioNotes(currentChord.root, {
          chord: currentChord,
          numFrets: maxFrets,
        });
      }

      return getOverlayNotes(currentChord.root, fretboardOverlay, {
        chord: currentChord,
        numFrets: maxFrets,
      });
    }

    return getFretNotesForChord(currentChord, {
      includeScale: showScaleTones || Boolean(previewScale),
      scaleName: activeScale || undefined,
      numFrets: maxFrets,
    });
  }, [
    activeScale,
    currentChord,
    fretboardOverlay,
    isOverlayActive,
    maxFrets,
    previewScale,
    showScaleTones,
  ]);

  const arpeggioConnections = useMemo(() => {
    if (fretboardOverlay !== "arpeggio") {
      return [];
    }

    return getArpeggioConnections(fretNotes);
  }, [fretNotes, fretboardOverlay]);

  const targetNoteData = useMemo(() => {
    if (!currentChord || targetNoteMode === "none") {
      return {
        targets: [],
        chromatic: [],
        diatonic: [],
      };
    }

    const targets = getTargetNotes(targetNoteMode, fretNotes);

    const chordTones = fretNotes.filter((note) => note.isChordTone);

    const chromatic = showChromaticApproach
      ? filterApproachNotesFromChordTones(
          getChromaticApproachNotes(targets),
          chordTones,
        )
      : [];

    const diatonic = showDiatonicApproach
      ? filterApproachNotesFromChordTones(
          getDiatonicApproachNotes(
            currentChord,
            targets,
            activeScale || currentChord.suggestedScales[0],
          ),
          chordTones,
        )
      : [];

    return { targets, chromatic, diatonic };
  }, [
    activeScale,
    currentChord,
    fretNotes,
    showChromaticApproach,
    showDiatonicApproach,
    targetNoteMode,
  ]);

  const ghostNotes = useMemo(() => {
    if (!showGhostNotes) return [];

    const nextChord = getNextChord(
      progression,
      currentBarIndex,
      currentChordIndex,
    );

    return getGhostNotes(nextChord, {
      numFrets: maxFrets,
      excludePositions: fretNotes,
    });
  }, [
    showGhostNotes,
    progression,
    currentBarIndex,
    currentChordIndex,
    maxFrets,
    fretNotes,
  ]);

  return {
    currentChord,
    progression,
    fretNotes,
    maxFrets,
    targetNoteData,
    arpeggioConnections,
    ghostNotes,
  };
}
