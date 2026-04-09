"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutItem {
  key: string;
  description: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { key: "Space", description: "Play / Stop" },
  { key: "R", description: "Reset to beginning" },
  { key: "M", description: "Toggle metronome" },
  { key: "I", description: "Toggle chord info panel" },
  { key: "H", description: "Open help guide" },
  { key: "↑", description: "Increase tempo (+5 BPM)" },
  { key: "↓", description: "Decrease tempo (-5 BPM)" },
  { key: "1", description: "Load preset: ii-V-I" },
  { key: "2", description: "Load preset: Autumn Leaves" },
  { key: "3", description: "Load preset: Rhythm Changes" },
];

/**
 * Keyboard shortcuts help overlay.
 * Shows available keyboard shortcuts in a modal-like overlay.
 */
export function KeyboardShortcutsHelp({
  open,
  onOpenChange,
}: KeyboardShortcutsHelpProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onOpenChange(false);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close shortcuts help"
      />

      {/* Content */}
      <div
        className={cn(
          "relative z-10 bg-card border rounded-lg shadow-xl p-6 w-full max-w-md mx-4",
          "animate-in fade-in-0 zoom-in-95 duration-200",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Shortcuts list */}
        <div className="space-y-2">
          {SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
            >
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border border-border">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">?</kbd> or{" "}
          <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Esc</kbd> to
          close
        </p>
      </div>
    </div>
  );
}
