"use client";

import { track } from "@vercel/analytics";
import { ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  permanentlyDismissFeedback,
  recordFeedbackShown,
  shouldShowFeedback,
} from "@/lib/feedback";
import { cn } from "@/lib/utils";

interface FeedbackToastProps {
  loopCount: number;
  mode: string;
  tempo: number;
}

type Phase = "hidden" | "rating" | "comment" | "thanks";

const AUTO_DISMISS_MS = 15_000;

export function FeedbackToast({ loopCount, mode, tempo }: FeedbackToastProps) {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [comment, setComment] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Show toast when session stops (loopCount resets to 0 after being >= 3)
  const prevLoopCountRef = useRef(loopCount);
  useEffect(() => {
    const wasPlaying = prevLoopCountRef.current >= 3;
    const stopped = loopCount === 0 && wasPlaying;
    prevLoopCountRef.current = loopCount;

    if (stopped && shouldShowFeedback(prevLoopCountRef.current || 3)) {
      setPhase("rating");
      recordFeedbackShown();
      timerRef.current = setTimeout(() => setPhase("hidden"), AUTO_DISMISS_MS);
    }

    return () => clearTimeout(timerRef.current);
  }, [loopCount]);

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current);
    setPhase("hidden");
    setRating(null);
    setComment("");
  }, []);

  const dismissPermanently = useCallback(() => {
    permanentlyDismissFeedback();
    dismiss();
  }, [dismiss]);

  const handleRating = useCallback((value: "up" | "down") => {
    clearTimeout(timerRef.current);
    setRating(value);
    setPhase("comment");
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!rating) return;

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || undefined,
          mode,
          tempo,
          loopCount,
        }),
      });
      track("feedback_submitted", { rating });
    } catch {
      // Silently fail — feedback is best-effort
    }

    setPhase("thanks");
    setTimeout(() => dismiss(), 2000);
  }, [rating, comment, mode, tempo, loopCount, dismiss]);

  if (phase === "hidden") return null;

  return (
    <div
      className={cn(
        "fixed bottom-24 left-1/2 -translate-x-1/2 z-50",
        "w-[min(360px,calc(100vw-2rem))]",
        "rounded-xl border border-surface-border bg-surface/95 backdrop-blur-sm",
        "p-4 shadow-xl shadow-black/20",
        "animate-in fade-in slide-in-from-bottom-4 duration-300",
      )}
    >
      {phase === "thanks" ? (
        <p className="text-center text-sm text-stone-300">
          Thanks for the feedback!
        </p>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-stone-300">
              {phase === "rating"
                ? "Was this practice session useful?"
                : "Any quick thoughts? (optional)"}
            </p>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={dismiss}
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </Button>
          </div>

          {phase === "rating" && (
            <div className="mt-3 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRating("up")}
                className="gap-1.5"
              >
                <ThumbsUp className="size-3.5" />
                Yes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRating("down")}
                className="gap-1.5"
              >
                <ThumbsDown className="size-3.5" />
                Not really
              </Button>
              <button
                type="button"
                onClick={dismissPermanently}
                className="ml-auto text-xs text-muted-foreground hover:text-stone-300 transition-colors"
              >
                Don&apos;t ask again
              </button>
            </div>
          )}

          {phase === "comment" && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="What could be better?"
                className="w-full rounded-lg border border-surface-border bg-surface-alt px-3 py-2 text-sm text-stone-200 placeholder:text-muted-foreground focus:border-stone-600 focus:outline-none"
                maxLength={200}
                // biome-ignore lint/a11y/noAutofocus: feedback input should capture focus when revealed
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={handleSubmit}>
                  Skip
                </Button>
                <Button variant="outline" size="sm" onClick={handleSubmit}>
                  Send
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
