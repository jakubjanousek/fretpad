"use client";

import { useEffect, useRef } from "react";
import { clearUrlState, getStateFromUrl } from "@/lib/persistence";
import { useAppStore } from "@/state/useAppStore";

/**
 * Hook that loads state from URL on mount (once)
 * URL state takes priority over localStorage
 */
export function useUrlState(): void {
  const hasLoadedRef = useRef(false);
  const setProgression = useAppStore((state) => state.setProgression);
  const setTempo = useAppStore((state) => state.setTempo);

  useEffect(() => {
    // Only run once
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const urlState = getStateFromUrl();
    if (urlState) {
      // Apply URL state to store
      setProgression(urlState.progression);
      setTempo(urlState.tempo);

      // Clear URL parameter to avoid confusion on reload
      clearUrlState();
    }
  }, [setProgression, setTempo]);
}
