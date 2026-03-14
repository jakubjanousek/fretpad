"use client";

import dynamic from "next/dynamic";
import { type ComponentType, Suspense } from "react";
import { FretboardSkeleton } from "@/components/fretboard/FretboardSkeleton";
import type { PracticeModeId } from "@/lib/types";

interface PracticePageProps {
  modeId: PracticeModeId;
}

const LearnTheNeckPage = dynamic(
  () =>
    import("@/components/practice/learn/LearnTheNeckPage").then(
      (mod) => mod.LearnTheNeckPage,
    ),
  { ssr: false },
);

const OutlineChangesPage = dynamic(
  () =>
    import("@/components/practice/outline/OutlineChangesPage").then(
      (mod) => mod.OutlineChangesPage,
    ),
  { ssr: false },
);

const CompWithVoicingsPage = dynamic(
  () =>
    import("@/components/practice/comp/CompWithVoicingsPage").then(
      (mod) => mod.CompWithVoicingsPage,
    ),
  { ssr: false },
);

const MODE_COMPONENTS: Record<PracticeModeId, ComponentType> = {
  "learn-the-neck": LearnTheNeckPage,
  "outline-chord-changes": OutlineChangesPage,
  "comp-with-voicings": CompWithVoicingsPage,
};

export function PracticePage({ modeId }: PracticePageProps) {
  const ModePage = MODE_COMPONENTS[modeId];

  return (
    <Suspense
      fallback={<FretboardSkeleton className="mx-auto mt-6 max-w-6xl px-4" />}
    >
      <ModePage />
    </Suspense>
  );
}
