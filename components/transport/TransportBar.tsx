"use client";

import { Minus, Play, Plus, Settings, Square } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTransportControls } from "@/hooks/useTransportControls";
import { cn } from "@/lib/utils";
import { AudioInterruptedOverlay } from "./AudioInterruptedOverlay";

interface TransportBarProps {
  onSettingsClick: () => void;
  micSlot?: ReactNode;
  variant?: "full" | "minimal";
}

export function TransportBar({
  onSettingsClick,
  micSlot,
  variant = "full",
}: TransportBarProps) {
  const isMinimal = variant === "minimal";
  const {
    isPlaying,
    tempo,
    handlePlay,
    handleStopClick,
    handleResume,
    handleTempoChange,
  } = useTransportControls();

  return (
    <>
      <AudioInterruptedOverlay onResume={handleResume} />
      <div className="fixed bottom-0 left-0 right-0 z-40 safe-area-inset-bottom">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-3 sm:pb-4">
          <div
            className={cn(
              "rounded-2xl border border-stone-800/50 backdrop-blur-md",
              "bg-stone-900/60",
              "shadow-lg shadow-stone-950/30",
              "px-3 sm:px-5 h-14 sm:h-16",
              "flex items-center gap-3 sm:gap-4",
              isMinimal ? "justify-center" : "justify-between",
            )}
          >
            {/* Tempo — setup mode only */}
            {!isMinimal && (
              <div className="hidden xs:flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleTempoChange([Math.max(40, tempo - 5)])}
                  aria-label="Decrease tempo"
                  className="h-8 w-8 rounded-full text-stone-400 hover:text-stone-200"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <button
                  type="button"
                  className="flex flex-col items-center leading-none select-none"
                  aria-label={`Tempo: ${tempo} BPM`}
                >
                  <span className="text-base font-semibold tabular-nums tracking-tight text-stone-100">
                    {tempo}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.15em] text-stone-500">
                    BPM
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleTempoChange([Math.min(200, tempo + 5)])}
                  aria-label="Increase tempo"
                  className="h-8 w-8 rounded-full text-stone-400 hover:text-stone-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* Play / Stop */}
            <Tooltip>
              <TooltipTrigger asChild>
                {isPlaying ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleStopClick}
                    aria-label="Stop"
                    className="hero-button h-12 w-12 rounded-full bg-stone-700/40 hover:bg-stone-700/60 active:scale-95 transition-all duration-150"
                  >
                    <Square className="h-4.5 w-4.5 text-stone-200" />
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="icon"
                    onClick={handlePlay}
                    aria-label="Play"
                    className="hero-button h-12 w-12 rounded-full bg-orange-500 hover:bg-orange-400 border-orange-500 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-400/35 active:scale-95 transition-all duration-150"
                  >
                    <Play className="h-5 w-5 ml-0.5" />
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent side="top">
                {isPlaying ? "Stop" : "Play"} (Space)
              </TooltipContent>
            </Tooltip>

            {/* Utilities — setup mode only */}
            {!isMinimal && (
              <div className="flex items-center gap-1">
                {micSlot}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={onSettingsClick}
                      aria-label="Settings"
                      className="h-9 w-9 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-700/30 active:scale-95 transition-all duration-150"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Settings</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
