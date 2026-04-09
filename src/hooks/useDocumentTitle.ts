"use client";

import { useEffect, useState } from "react";
import {
  buildDocumentTitle,
  type DocumentTitleInput,
} from "@/lib/documentTitle";
import { useAppStore } from "@/state/useAppStore";

export {
  buildDocumentTitle,
  type DocumentTitleInput,
} from "@/lib/documentTitle";

/**
 * Keeps document.title in sync with the current progression.
 * Waits for Zustand persist rehydration before updating, so the
 * server-rendered title from generateMetadata displays during hydration.
 */
export function useDocumentTitle(): void {
  const progression = useAppStore((s) => s.progression);
  const [hydrated, setHydrated] = useState(
    () => useAppStore.persist?.hasHydrated?.() ?? false,
  );

  useEffect(() => {
    if (hydrated) return;
    const unsub = useAppStore.persist?.onFinishHydration?.(() => {
      setHydrated(true);
    });
    return unsub;
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    const input: DocumentTitleInput = {
      name: progression.name,
      bars: progression.bars.map((bar) => ({
        chords: bar.chords.map((c) => c.chord),
      })),
    };
    document.title = buildDocumentTitle(input);
  }, [hydrated, progression]);
}
