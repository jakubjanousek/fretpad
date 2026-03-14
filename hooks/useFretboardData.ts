"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { getFretNotesForChord } from "@/lib/fretboard";
import {
  getArpeggioConnections,
  getArpeggioNotes,
} from "@/lib/theory/arpeggios";
import { getOverlayNotes } from "@/lib/theory/pentatonic";
import {
  filterApproachNotesFromChordTones,
  getChromaticApproachNotes,
  getDiatonicApproachNotes,
  getEnclosurePatterns,
  getTargetNotes,
} from "@/lib/theory/targetNotes";
import { getThreeNPSNotes } from "@/lib/theory/threeNPS";
import {
  calculateVoiceLeadingPaths,
  filterBestPaths,
  getNextChord,
} from "@/lib/theory/voiceLeading";
import { useAppStore } from "@/state/useAppStore";

export function useFretboardData() {
  const {
    currentChord,
    progression,
    currentBarIndex,
    currentChordIndex,
    previewScale,
    showScaleTones,
    showVoiceLeading,
    fretboardOverlay,
    targetNoteMode,
    showChromaticApproach,
    showDiatonicApproach,
    showEnclosures,
  } = useAppStore(
    useShallow((state) => ({
      currentChord: state.currentChord,
      progression: state.progression,
      currentBarIndex: state.currentBarIndex,
      currentChordIndex: state.currentChordIndex,
      previewScale: state.previewScale,
      showScaleTones: state.showScaleTones,
      showVoiceLeading: state.showVoiceLeading,
      fretboardOverlay: state.fretboardOverlay,
      targetNoteMode: state.targetNoteMode,
      showChromaticApproach: state.showChromaticApproach,
      showDiatonicApproach: state.showDiatonicApproach,
      showEnclosures: state.showEnclosures,
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
      if (fretboardOverlay === "threeNotePerString") {
        const scaleName =
          currentChord.suggestedScales[0]?.split(" ").slice(1).join(" ") ||
          "major";

        return getThreeNPSNotes(currentChord.root, {
          chord: currentChord,
          scaleName,
        });
      }

      if (fretboardOverlay === "arpeggio") {
        return getArpeggioNotes(currentChord.root, {
          chord: currentChord,
        });
      }

      return getOverlayNotes(
        currentChord.root,
        fretboardOverlay,
        { chord: currentChord },
      );
    }

    return getFretNotesForChord(currentChord, {
      includeScale: showScaleTones || Boolean(previewScale),
      scaleName: activeScale || undefined,
    });
  }, [
    activeScale,
    currentChord,
    fretboardOverlay,
    isOverlayActive,
    previewScale,
    showScaleTones,
  ]);

  const arpeggioConnections = useMemo(() => {
    if (fretboardOverlay !== "arpeggio") {
      return [];
    }

    return getArpeggioConnections(fretNotes);
  }, [fretNotes, fretboardOverlay]);

  const voiceLeadingPaths = useMemo(() => {
    if (!showVoiceLeading || !currentChord) {
      return [];
    }

    const nextChord = getNextChord(
      progression,
      currentBarIndex,
      currentChordIndex,
    );

    if (!nextChord) {
      return [];
    }

    const allPaths = calculateVoiceLeadingPaths(currentChord, nextChord);
    return filterBestPaths(allPaths);
  }, [
    currentBarIndex,
    currentChord,
    currentChordIndex,
    progression,
    showVoiceLeading,
  ]);

  const targetNoteData = useMemo(() => {
    if (!currentChord || targetNoteMode === "none") {
      return {
        targets: [],
        chromatic: [],
        diatonic: [],
        enclosures: [],
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

    const enclosures = showEnclosures ? getEnclosurePatterns(targets) : [];

    return { targets, chromatic, diatonic, enclosures };
  }, [
    activeScale,
    currentChord,
    fretNotes,
    showChromaticApproach,
    showDiatonicApproach,
    showEnclosures,
    targetNoteMode,
  ]);

  return {
    currentChord,
    progression,
    fretNotes,
    voiceLeadingPaths,
    targetNoteData,
    arpeggioConnections,
  };
}
