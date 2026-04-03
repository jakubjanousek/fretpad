"use client";

import { CircleOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NoteLabelMode } from "@/lib/types";

interface LabelSegmentedControlProps {
  noteLabelMode: NoteLabelMode;
  onNoteLabelModeChange?: (mode: NoteLabelMode) => void;
}

export function LabelSegmentedControl({
  noteLabelMode,
  onNoteLabelModeChange,
}: LabelSegmentedControlProps) {
  return (
    <div
      data-slot="button-group"
      className="inline-flex rounded-md border border-border shadow-xs overflow-hidden"
    >
      <Button
        variant="toggle"
        size="xs"
        data-state={noteLabelMode === "notes" ? "on" : "off"}
        onClick={() => onNoteLabelModeChange?.("notes")}
        className="rounded-none border-0 border-r border-border"
      >
        Notes
      </Button>
      <Button
        variant="toggle"
        size="xs"
        data-state={noteLabelMode === "degrees" ? "on" : "off"}
        onClick={() => onNoteLabelModeChange?.("degrees")}
        className="rounded-none border-0 border-r border-border"
      >
        Degrees
      </Button>
      <Button
        variant="toggle"
        size="xs"
        data-state={noteLabelMode === "none" ? "on" : "off"}
        onClick={() => onNoteLabelModeChange?.("none")}
        className="rounded-none border-0"
        aria-label="Hide labels"
      >
        <CircleOff className="h-3 w-3" />
      </Button>
    </div>
  );
}
