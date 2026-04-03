"use client";

import { useEffect, useState } from "react";

const FIRST_VISIT_KEY = "fretpad-first-visit-shown";

/**
 * Hook to detect if this is the user's first visit.
 * Returns a boolean and a function to mark the visit as seen.
 * Uses localStorage to persist the state across sessions.
 */
export function useFirstVisit(): {
  isFirstVisit: boolean;
  markAsVisited: () => void;
} {
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Check localStorage on mount (client-side only)
    const hasVisited = localStorage.getItem(FIRST_VISIT_KEY);
    if (!hasVisited) {
      setIsFirstVisit(true);
    }
  }, []);

  const markAsVisited = () => {
    localStorage.setItem(FIRST_VISIT_KEY, "true");
    setIsFirstVisit(false);
  };

  return { isFirstVisit, markAsVisited };
}
