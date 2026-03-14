"use client";

import { Check, Link, Share2, Type } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportProgressionToText, generateShareUrl } from "@/lib/persistence";
import { useAppStore } from "@/state/useAppStore";

export function ShareExport() {
  const [copied, setCopied] = useState<"url" | "text" | null>(null);
  const progression = useAppStore((state) => state.progression);
  const tempo = useAppStore((state) => state.tempo);
  const activeMode = useAppStore((state) => state.activeMode);

  const handleCopyUrl = async () => {
    const url = generateShareUrl({ progression, tempo }, activeMode);
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="h-8 w-8">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyUrl} className="text-xs gap-2">
          {copied === "url" ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Link className="h-3.5 w-3.5" />
          )}
          {copied === "url" ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyText} className="text-xs gap-2">
          {copied === "text" ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Type className="h-3.5 w-3.5" />
          )}
          {copied === "text" ? "Copied!" : "Copy as Text"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
