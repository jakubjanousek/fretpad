"use client";

import { Share, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const INSTALL_DISMISSED_KEY = "fretpad-install-prompt-dismissed";

function isIOSorIPadOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPad on iOS 13+ reports as Macintosh, so also check touch support
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes("Macintosh") && navigator.maxTouchPoints > 1)
  );
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as { standalone?: boolean }).standalone === true)
  );
}

/**
 * Banner shown on iOS/iPadOS in browser mode, guiding users to add the app
 * to their home screen. Safari doesn't support install prompts natively,
 * so we provide manual instructions instead.
 */
export function InstallPromptBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (!isIOSorIPadOS()) return;
    if (localStorage.getItem(INSTALL_DISMISSED_KEY)) return;
    setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="rounded-xl border bg-card text-card-foreground shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15">
            <Share className="h-4.5 w-4.5 text-cyan-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Add to Home Screen</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Tap{" "}
              <Share className="inline h-3 w-3 align-text-bottom text-muted-foreground" />{" "}
              then <strong>"Add to Home Screen"</strong> for the best
              experience.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 -mt-1 -mr-1 h-7 w-7"
            onClick={dismiss}
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
