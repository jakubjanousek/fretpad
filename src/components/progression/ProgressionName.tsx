"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

export function ProgressionName() {
  const name = useAppStore((s) => s.progression.name);
  const setProgressionName = useAppStore((s) => s.setProgressionName);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    setInputValue(name);
    setIsEditing(true);
  };

  const commit = () => {
    setIsEditing(false);
    const trimmed = inputValue.trim();
    if (trimmed !== name) {
      setProgressionName(trimmed);
    }
  };

  const cancel = () => {
    setIsEditing(false);
    setInputValue(name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      commit();
    } else if (e.key === "Escape") {
      cancel();
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className="h-7 w-40 text-xs"
        placeholder="Name this progression..."
        autoFocus
      />
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "h-7 px-2 text-xs rounded transition-colors truncate max-w-40",
        name
          ? "text-foreground hover:bg-muted"
          : "text-muted-foreground/60 hover:bg-muted italic",
      )}
    >
      {name || "Name this progression..."}
    </button>
  );
}
