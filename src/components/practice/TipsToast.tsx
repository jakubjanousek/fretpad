"use client";

import { Lightbulb, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { markTipSeen, selectTip, type Tip } from "@/lib/tips";
import { cn } from "@/lib/utils";

interface TipsToastProps {
  loopCount: number;
}

const AUTO_DISMISS_MS = 9_000;

export function TipsToast({ loopCount }: TipsToastProps) {
  const [tip, setTip] = useState<Tip | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevLoopCountRef = useRef(loopCount);

  useEffect(() => {
    // Only evaluate on loop-count increases (ignore resets to 0 on stop)
    if (loopCount > prevLoopCountRef.current) {
      const candidate = selectTip(loopCount);
      if (candidate) {
        setTip(candidate);
        markTipSeen(candidate.id);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setTip(null), AUTO_DISMISS_MS);
      }
    }
    prevLoopCountRef.current = loopCount;

    return () => clearTimeout(timerRef.current);
  }, [loopCount]);

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current);
    setTip(null);
  }, []);

  if (!tip) return null;

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50",
        "w-[min(440px,calc(100vw-2rem))]",
        "rounded-xl border border-surface-border bg-surface/95 backdrop-blur-sm",
        "shadow-xl shadow-black/20",
        "animate-in fade-in slide-in-from-top-4 duration-300",
      )}
      role="status"
    >
      <div className="flex items-start gap-3 p-3 pl-4">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-orange-400" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-orange-400">
            Tip
          </p>
          <p className="mt-0.5 text-sm text-stone-300">{tip.text}</p>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={dismiss}
          aria-label="Dismiss tip"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
