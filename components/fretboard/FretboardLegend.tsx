"use client";

import type { CAGEDPosition } from "@/lib/types";
import { CAGED_POSITION_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

export type LegendNoteType = string | null;

interface LegendItem {
  type: string;
  color: string;
  label: string;
  shortLabel: string;
  description: string;
}

const CHORD_LEGEND_ITEMS: LegendItem[] = [
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

const CAGED_COLORS: Record<CAGEDPosition, string> = {
  1: "bg-purple-500",
  2: "bg-pink-500",
  3: "bg-cyan-500",
  4: "bg-amber-500",
  5: "bg-rose-500",
};

function getOverlayLegendItems(): LegendItem[] {
  const items: LegendItem[] = [
    {
      type: "root",
      color: "bg-orange-500",
      label: "Root",
      shortLabel: "Root",
      description: "The root note",
    },
  ];

  for (const pos of [1, 2, 3, 4, 5] as CAGEDPosition[]) {
    const shape = CAGED_POSITION_LABELS[pos];
    items.push({
      type: `pos-${shape}`,
      color: CAGED_COLORS[pos],
      label: `Pos ${pos} (${shape} shape)`,
      shortLabel: `Pos ${pos}`,
      description: `CAGED position ${pos} — ${shape} shape`,
    });
  }

  return items;
}

interface FretboardLegendProps {
  hoveredType: LegendNoteType;
  onHoverChange: (type: LegendNoteType) => void;
  overlayActive?: boolean;
  className?: string;
}

export function FretboardLegend({
  hoveredType,
  onHoverChange,
  overlayActive = false,
  className,
}: FretboardLegendProps) {
  const items = overlayActive ? getOverlayLegendItems() : CHORD_LEGEND_ITEMS;

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:flex sm:flex-wrap gap-x-4 gap-y-2 sm:gap-4 text-xs",
        className,
      )}
    >
      {items.map((item) => (
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
