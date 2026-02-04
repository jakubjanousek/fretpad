"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { GuitarVoicing } from "@/lib/types";
import { cn } from "@/lib/utils";

interface VoicingOverlayProps {
  voicing: GuitarVoicing;
  numFrets: number;
  numStrings: number;
  showFingers?: boolean;
}

// Layout constants matching the Fretboard component
const STRING_LABEL_WIDTH = 32; // w-8
const NUT_WIDTH = 40; // w-10

/**
 * Renders a visual overlay for a guitar voicing on the fretboard.
 * Shows barre indicators, muted strings, and optional finger numbers.
 */
export function VoicingOverlay({
  voicing,
  numFrets,
  numStrings,
  showFingers = true,
}: VoicingOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const { width: containerWidth, height: containerHeight } = dimensions;

  // Calculate actual fret area dimensions
  const fretAreaStart = STRING_LABEL_WIDTH + NUT_WIDTH;
  const fretAreaWidth = Math.max(0, containerWidth - fretAreaStart);

  // Helper to convert fret position to actual X coordinate
  const getFretX = (fret: number): number => {
    if (fret === 0) {
      return STRING_LABEL_WIDTH + NUT_WIDTH / 2;
    }
    const fretWidth = fretAreaWidth / numFrets;
    return fretAreaStart + (fret - 0.5) * fretWidth;
  };

  // Helper to convert string position to actual Y coordinate
  const getStringY = (stringNum: number): number => {
    const stringHeight = containerHeight / numStrings;
    return (stringNum - 0.5) * stringHeight;
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

  // Don't render until we have valid dimensions
  if (containerWidth === 0 || containerHeight === 0) {
    return (
      <div
        ref={containerRef}
        className="absolute inset-0 pointer-events-none z-20"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-visible z-20"
    >
      <svg
        className="absolute inset-0 overflow-visible"
        style={{ width: "100%", height: "100%" }}
        viewBox={`0 0 ${containerWidth} ${containerHeight}`}
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
    </div>
  );
}
