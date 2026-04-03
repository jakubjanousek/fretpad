"use client";

import { Volume2 } from "lucide-react";
import { useAppStore } from "@/state/useAppStore";

interface AudioInterruptedOverlayProps {
  onResume: () => void;
}

/**
 * Full-screen overlay shown when the AudioContext is interrupted (e.g. phone call,
 * app switch, or lock screen on iOS). Tapping anywhere resumes playback.
 */
export function AudioInterruptedOverlay({
  onResume,
}: AudioInterruptedOverlayProps) {
  const isInterrupted = useAppStore((state) => state.isInterrupted);

  if (!isInterrupted) return null;

  return (
    <button
      type="button"
      onClick={onResume}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm cursor-pointer"
      aria-label="Tap to resume audio playback"
    >
      <div className="flex flex-col items-center gap-3 text-center px-6">
        <div className="h-14 w-14 rounded-full bg-cyan-500/15 flex items-center justify-center">
          <Volume2 className="h-7 w-7 text-cyan-500" />
        </div>
        <p className="text-lg font-medium">Audio interrupted</p>
        <p className="text-sm text-muted-foreground">Tap anywhere to resume</p>
      </div>
    </button>
  );
}
