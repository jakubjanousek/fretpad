"use client";

import Link from "next/link";
import { PRACTICE_MODES } from "@/lib/modes";
import type { PracticeModeId } from "@/lib/types";

export function Launcher() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">FretPad</h1>
      <p className="text-lg text-muted-foreground max-w-md text-center">
        Practice improvising over chord changes with real-time feedback.
      </p>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {(Object.keys(PRACTICE_MODES) as PracticeModeId[]).map((modeId) => {
          const config = PRACTICE_MODES[modeId];
          return (
            <Link
              key={modeId}
              href={`/practice/${modeId}`}
              className="block rounded-xl border p-6 hover:bg-muted/50 transition-colors"
            >
              <h2 className="font-semibold text-lg">{config.label}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {config.description}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
