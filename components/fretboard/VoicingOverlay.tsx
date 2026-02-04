"use client";

import type { GuitarVoicing } from "@/lib/types";
import { cn } from "@/lib/utils";

interface VoicingOverlayProps {
  voicing: GuitarVoicing;
  numFrets: number;
  numStrings: number;
  showFingers?: boolean;
}

/**
 * Renders a visual overlay for a guitar voicing on the fretboard.
 * Shows barre indicators, muted strings, and optional finger numbers.
 */
export function VoicingOverlay({
  voicing,
  numFrets,
  numStrings: _numStrings,
  showFingers = true,
}: VoicingOverlayProps) {
  // Calculate dimensions for SVG positioning
  // These match the fretboard layout in Fretboard.tsx
  const stringLabelWidth = 32; // w-8 = 32px
  const nutWidth = 40; // w-10 = 40px
  const fretMinWidth = 48; // min-w-12 = 48px on desktop

  // Calculate approximate positions
  const getStringY = (stringNum: number): number => {
    // String 1 (high E) is at top, string 6 (low E) at bottom
    // Each string row is ~44px (py-3 = 12px * 2 + content)
    const rowHeight = 44;
    return rowHeight * (stringNum - 1) + rowHeight / 2;
  };

  const getFretX = (fret: number): number => {
    if (fret === 0) {
      return stringLabelWidth + nutWidth / 2;
    }
    // Each fret cell is approximately fretMinWidth
    return stringLabelWidth + nutWidth + fretMinWidth * (fret - 0.5);
  };

  // Get positions that are actually fretted (not muted, not open)
  const frettedPositions = voicing.positions.filter(
    (p) => p.fret > 0 && p.fret <= numFrets,
  );

  // Check if we should show barre
  const showBarre =
    voicing.isBarreChord &&
    voicing.barreFret !== undefined &&
    voicing.barreStrings;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-20"
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      {/* Barre indicator */}
      {showBarre && voicing.barreFret && voicing.barreStrings && (
        <line
          x1={getFretX(voicing.barreFret)}
          y1={getStringY(voicing.barreStrings[0])}
          x2={getFretX(voicing.barreFret)}
          y2={getStringY(voicing.barreStrings[1])}
          stroke="currentColor"
          strokeWidth={12}
          strokeLinecap="round"
          className="text-violet-500/70"
        />
      )}

      {/* Voicing position highlights */}
      {frettedPositions.map((pos) => (
        <g key={`voicing-${pos.string}-${pos.fret}`}>
          {/* Outer ring highlight for voicing notes */}
          <circle
            cx={getFretX(pos.fret)}
            cy={getStringY(pos.string)}
            r={18}
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            className={cn("text-violet-400", pos.isRoot && "text-violet-300")}
          />

          {/* Finger number */}
          {showFingers && pos.finger && (
            <text
              x={getFretX(pos.fret) + 14}
              y={getStringY(pos.string) - 10}
              textAnchor="middle"
              className="fill-violet-300 text-[10px] font-bold"
            >
              {pos.finger === "T" ? "T" : pos.finger}
            </text>
          )}
        </g>
      ))}

      {/* Open string indicators (circles above nut) */}
      {voicing.positions
        .filter((p) => p.fret === 0)
        .map((pos) => (
          <circle
            key={`open-${pos.string}`}
            cx={getFretX(0)}
            cy={getStringY(pos.string)}
            r={16}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="text-violet-400"
          />
        ))}

      {/* Muted string indicators (X above nut) */}
      {voicing.positions
        .filter((p) => p.fret === -1)
        .map((pos) => {
          const cx = getFretX(0);
          const cy = getStringY(pos.string);
          const size = 8;
          return (
            <g key={`muted-${pos.string}`}>
              <line
                x1={cx - size}
                y1={cy - size}
                x2={cx + size}
                y2={cy + size}
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                className="text-slate-400"
              />
              <line
                x1={cx + size}
                y1={cy - size}
                x2={cx - size}
                y2={cy + size}
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                className="text-slate-400"
              />
            </g>
          );
        })}
    </svg>
  );
}
