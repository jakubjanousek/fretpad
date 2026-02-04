"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { ArpeggioConnection, CAGEDPosition } from "@/lib/types";

interface ArpeggioOverlayProps {
  connections: ArpeggioConnection[];
  numFrets: number;
  numStrings: number;
  focusedPosition?: CAGEDPosition | null;
}

// Layout constants matching the Fretboard component
const STRING_LABEL_WIDTH = 32; // w-8
const NUT_WIDTH = 40; // w-10

/**
 * Gets the stroke color for a CAGED position
 */
const POSITION_COLORS: Record<CAGEDPosition, string> = {
  1: "#a855f7", // purple-500
  2: "#ec4899", // pink-500
  3: "#06b6d4", // cyan-500
  4: "#f59e0b", // amber-500
  5: "#f43f5e", // rose-500
};

export function ArpeggioOverlay({
  connections,
  numFrets,
  numStrings,
  focusedPosition = null,
}: ArpeggioOverlayProps) {
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

  if (connections.length === 0) return null;

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

  // Filter connections if a position is focused
  const visibleConnections = focusedPosition
    ? connections.filter((c) => c.cagedPosition === focusedPosition)
    : connections;

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
        aria-label="Arpeggio shape connections"
      >
        {visibleConnections.map((connection, index) => {
          const fromX = getFretX(connection.from.fret);
          const fromY = getStringY(connection.from.string);
          const toX = getFretX(connection.to.fret);
          const toY = getStringY(connection.to.string);

          const color = POSITION_COLORS[connection.cagedPosition];
          const opacity = focusedPosition ? 0.7 : 0.5;

          // Calculate line shortening to not overlap with note markers
          const dx = toX - fromX;
          const dy = toY - fromY;
          const length = Math.sqrt(dx * dx + dy * dy);
          const shortenBy = 14;

          // Only shorten if line is long enough
          const adjustedFromX =
            length > shortenBy * 2 ? fromX + (dx / length) * shortenBy : fromX;
          const adjustedFromY =
            length > shortenBy * 2 ? fromY + (dy / length) * shortenBy : fromY;
          const adjustedToX =
            length > shortenBy * 2 ? toX - (dx / length) * shortenBy : toX;
          const adjustedToY =
            length > shortenBy * 2 ? toY - (dy / length) * shortenBy : toY;

          return (
            <line
              key={index}
              x1={adjustedFromX}
              y1={adjustedFromY}
              x2={adjustedToX}
              y2={adjustedToY}
              stroke={color}
              strokeWidth="2"
              opacity={opacity}
              strokeLinecap="round"
              strokeDasharray="4 3"
            />
          );
        })}
      </svg>
    </div>
  );
}
