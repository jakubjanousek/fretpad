"use client";

import { cn } from "@/lib/utils";

export type LegendNoteType = "root" | "guide" | "chord" | "scale" | null;

interface LegendItem {
  type: LegendNoteType;
  color: string;
  label: string;
  shortLabel: string;
  description: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  {
    type: "root",
    color: "bg-orange-500",
    label: "Root",
    shortLabel: "Root",
    description: "The foundation note of the chord",
  },
  {
    type: "guide",
    color: "bg-blue-500",
    label: "Guide tone (3rd/7th)",
    shortLabel: "Guide",
    description: "Defines the chord quality and voice-leads smoothly",
  },
  {
    type: "chord",
    color: "bg-emerald-500",
    label: "Chord tone",
    shortLabel: "Chord",
    description: "Other notes that make up the chord",
  },
  {
    type: "scale",
    color: "bg-slate-400",
    label: "Scale tone",
    shortLabel: "Scale",
    description: "Notes from the suggested scale (not in chord)",
  },
];

interface FretboardLegendProps {
  hoveredType: LegendNoteType;
  onHoverChange: (type: LegendNoteType) => void;
  className?: string;
}

export function FretboardLegend({
  hoveredType,
  onHoverChange,
  className,
}: FretboardLegendProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:flex sm:flex-wrap gap-x-4 gap-y-2 sm:gap-4 text-xs",
        className,
      )}
    >
      {LEGEND_ITEMS.map((item) => (
        <button
          key={item.type}
          type="button"
          onMouseEnter={() => onHoverChange(item.type)}
          onMouseLeave={() => onHoverChange(null)}
          className={cn(
            "flex items-center gap-2 py-1 px-1.5 -mx-1.5 rounded-md transition-all duration-150",
            "hover:bg-muted/60",
            hoveredType === item.type &&
              "bg-muted/80 ring-1 ring-muted-foreground/20",
          )}
          title={item.description}
        >
          <div
            className={cn(
              "w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full shrink-0 transition-transform duration-150",
              item.color,
              hoveredType === item.type && "scale-125",
            )}
          />
          <span
            className={cn(
              "text-muted-foreground transition-colors duration-150",
              hoveredType === item.type && "text-foreground font-medium",
            )}
          >
            <span className="sm:hidden">{item.shortLabel}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
