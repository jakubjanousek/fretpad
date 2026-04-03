"use client";

import { AudioInputScorecard } from "@/components/transport/AudioInputScorecard";
import type { Chord } from "@/lib/types";

interface PracticeNowPlayingProps {
  currentChord: Chord | null;
  nextChord: Chord | null;
  micEnabled: boolean;
}

export function PracticeNowPlaying({
  currentChord,
  nextChord,
  micEnabled,
}: PracticeNowPlayingProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200/50 dark:border-stone-800/50 bg-white/40 dark:bg-stone-900/30 backdrop-blur-sm px-5 py-3 sm:px-6 sm:py-4">
      {/* Current chord — prominent */}
      {currentChord ? (
        <div key={currentChord.symbol} className="animate-chord-change min-w-0">
          <div className="flex items-baseline gap-2.5">
            <span className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl tracking-tight text-orange-500">
              {currentChord.symbol}
            </span>
            <span className="text-sm text-stone-500 dark:text-stone-400 font-medium">
              {currentChord.root}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-stone-400 text-sm">No chord selected</div>
      )}

      {/* Next chord preview + score */}
      <div className="flex items-center gap-5 shrink-0">
        {nextChord && (
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500">
              Next
            </span>
            <div className="font-[family-name:var(--font-display)] text-xl sm:text-2xl text-stone-400 dark:text-stone-500">
              {nextChord.symbol}
            </div>
          </div>
        )}

        <AudioInputScorecard enabled={micEnabled} />
      </div>
    </div>
  );
}
