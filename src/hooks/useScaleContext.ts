"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { detectKey } from "@/lib/theory/keyDetection";
import { getProgressionScaleContext } from "@/lib/theory/scaleContext";
import { useAppStore } from "@/state/useAppStore";

export function useScaleContext() {
  const { progression, currentChord } = useAppStore(
    useShallow((state) => ({
      progression: state.progression,
      currentChord: state.currentChord,
    })),
  );

  const detectedKey = useMemo(() => {
    if (!progression) return null;
    const keys = detectKey(progression, 1);
    return keys[0] || null;
  }, [progression]);

  const scaleContext = useMemo(() => {
    if (!progression) return [];
    return getProgressionScaleContext(progression);
  }, [progression]);

  const currentChordContext = useMemo(() => {
    if (!currentChord || scaleContext.length === 0) return null;
    return (
      scaleContext.find((ctx) => ctx.chordSymbol === currentChord.symbol) ||
      null
    );
  }, [currentChord, scaleContext]);

  return { detectedKey, scaleContext, currentChordContext };
}
