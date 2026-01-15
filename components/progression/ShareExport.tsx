"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportProgressionToText, generateShareUrl } from "@/lib/persistence";
import { useAppStore } from "@/state/useAppStore";

export function ShareExport() {
  const [copied, setCopied] = useState<"url" | "text" | null>(null);
  const progression = useAppStore((state) => state.progression);
  const tempo = useAppStore((state) => state.tempo);

  const handleCopyUrl = async () => {
    const url = generateShareUrl({ progression, tempo });
    try {
      await navigator.clipboard.writeText(url);
      setCopied("url");
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  const handleCopyText = async () => {
    const text = exportProgressionToText(progression);
    try {
      await navigator.clipboard.writeText(text);
      setCopied("text");
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyUrl}
        className="h-8 text-xs"
      >
        {copied === "url" ? "Copied!" : "Copy Link"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyText}
        className="h-8 text-xs"
      >
        {copied === "text" ? "Copied!" : "Copy Text"}
      </Button>
    </div>
  );
}
