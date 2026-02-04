"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { EnclosurePattern, FretPosition } from "@/lib/types";

interface EnclosureOverlayProps {
  enclosures: EnclosurePattern[];
  focusedTarget: FretPosition | null;
  numFrets: number;
  numStrings: number;
}

// Layout constants matching the Fretboard component
const STRING_LABEL_WIDTH = 32; // w-8
const NUT_WIDTH = 40; // w-10

export function EnclosureOverlay({
  enclosures,
  focusedTarget,
  numFrets,
  numStrings,
}: EnclosureOverlayProps) {
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

  // If no target is focused, don't render anything
  if (!focusedTarget) return null;

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

  // Don't render until we have valid dimensions
  if (containerWidth === 0 || containerHeight === 0) {
    return (
      <div
        ref={containerRef}
        className="absolute inset-0 pointer-events-none"
      />
    );
  }

  // Find enclosure for the focused target
  const visibleEnclosures = enclosures.filter(
    (e) =>
      e.target.string === focusedTarget.string &&
      e.target.fret === focusedTarget.fret,
  );

  if (visibleEnclosures.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-visible"
    >
      <svg
        className="absolute inset-0 overflow-visible"
        style={{
          width: "100%",
          height: "100%",
        }}
        viewBox={`0 0 ${containerWidth} ${containerHeight}`}
        role="img"
        aria-label="Enclosure patterns around chord tones"
      >
        {visibleEnclosures.map((enclosure, index) => {
          const targetX = getFretX(enclosure.target.fret);
          const targetY = getStringY(enclosure.target.string);
          const aboveX = getFretX(enclosure.above.fret);
          const belowX = getFretX(enclosure.below.fret);

          // Draw bracket arcs connecting above -> target <- below
          const bracketRadius = 18;
          const dotSize = 6;

          return (
            <g key={index}>
              {/* Below approach bracket (ascending) */}
              <path
                d={`M ${belowX} ${targetY - 10} Q ${(belowX + targetX) / 2} ${targetY - bracketRadius - 10} ${targetX} ${targetY - 10}`}
                fill="none"
                stroke="#a855f7"
                strokeWidth="2"
                opacity={0.85}
              />

              {/* Above approach bracket (descending) */}
              <path
                d={`M ${aboveX} ${targetY + 10} Q ${(aboveX + targetX) / 2} ${targetY + bracketRadius + 10} ${targetX} ${targetY + 10}`}
                fill="none"
                stroke="#a855f7"
                strokeWidth="2"
                opacity={0.85}
              />

              {/* Highlight dots on approach notes */}
              <circle
                cx={belowX}
                cy={targetY}
                r={dotSize}
                fill="#a855f7"
                opacity={0.9}
              />
              <circle
                cx={aboveX}
                cy={targetY}
                r={dotSize}
                fill="#a855f7"
                opacity={0.9}
              />

              {/* Direction indicators */}
              <text
                x={belowX}
                y={targetY - 14}
                textAnchor="middle"
                fontSize="10"
                fill="#a855f7"
                opacity={0.9}
              >
                ↗
              </text>
              <text
                x={aboveX}
                y={targetY + 20}
                textAnchor="middle"
                fontSize="10"
                fill="#a855f7"
                opacity={0.9}
              >
                ↘
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
