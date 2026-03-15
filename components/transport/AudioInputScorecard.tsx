"use client";

import { Headphones, Mic, MicOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

interface AudioInputScorecardProps {
  enabled: boolean;
  onEvaluationResult?: (hit: boolean) => void;
}

export function AudioInputScorecard({
  enabled,
  onEvaluationResult,
}: AudioInputScorecardProps) {
  const micActive = useAppStore((s) => s.micActive);
  const score = useAppStore((s) => s.score);
  const [showHeadphonesHint, setShowHeadphonesHint] = useState(false);
  const hasShownHintRef = useRef(false);

  const { toggleMic, signalElementRef } = usePitchDetection({
    enabled,
    onEvaluationResult,
  });

  const handleToggle = useCallback(() => {
    // Show headphones hint on first activation
    if (!micActive && !hasShownHintRef.current) {
      hasShownHintRef.current = true;
      setShowHeadphonesHint(true);
      setTimeout(() => setShowHeadphonesHint(false), 4000);
    }
    toggleMic();
  }, [micActive, toggleMic]);

  // Dismiss hint on click
  useEffect(() => {
    if (!showHeadphonesHint) return;
    const dismiss = () => setShowHeadphonesHint(false);
    window.addEventListener("click", dismiss, { once: true });
    return () => window.removeEventListener("click", dismiss);
  }, [showHeadphonesHint]);

  if (!enabled) return null;

  return (
    <div className="flex items-center gap-1.5">
      {/* Scorecard badge — only show when mic is active and has evaluated at least one chord */}
      {micActive && score.total > 0 && (
        <div className="flex items-center gap-1 bg-muted/60 rounded-full px-2 py-0.5">
          <span className="text-xs font-mono tabular-nums font-medium">
            {score.hits}/{score.total}
          </span>
        </div>
      )}

      {/* Mic toggle button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            onClick={handleToggle}
            aria-label={micActive ? "Disable microphone" : "Enable microphone"}
            className={cn(
              "h-11 w-11 sm:h-auto sm:w-auto sm:px-2 sm:py-1.5 rounded-full sm:rounded-lg hover:bg-background/80 active:scale-95 transition-all duration-150 flex flex-col items-center gap-0.5 relative",
              micActive && "text-rose-500",
            )}
          >
            {micActive ? (
              <Mic className="h-4 w-4" />
            ) : (
              <MicOff className="h-4 w-4" />
            )}
            <span className="hidden sm:block text-[10px] leading-tight text-muted-foreground">
              Mic
            </span>
            {/* Signal indicator dot */}
            {micActive && (
              <span
                ref={signalElementRef}
                className="absolute top-1.5 right-1.5 sm:top-0.5 sm:right-0.5 h-1.5 w-1.5 rounded-full bg-slate-400 transition-colors duration-150 [&.signal-active]:bg-emerald-500"
              />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="sm:hidden">
          {micActive ? "Disable Mic" : "Enable Mic"}
        </TooltipContent>
      </Tooltip>

      {/* Headphones hint */}
      {showHeadphonesHint && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-popover border rounded-lg px-3 py-2 shadow-lg text-xs flex items-center gap-2 whitespace-nowrap z-50">
          <Headphones className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>Use headphones for best results</span>
        </div>
      )}
    </div>
  );
}
