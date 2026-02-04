"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { ApproachNote } from "@/lib/types";

interface TargetNoteOverlayProps {
  chromaticApproaches: ApproachNote[];
  diatonicApproaches: ApproachNote[];
  numFrets: number;
  numStrings: number;
  isMobile: boolean;
}

// Layout constants matching the Fretboard component
const STRING_LABEL_WIDTH = 32; // w-8
const NUT_WIDTH = 40; // w-10

export function TargetNoteOverlay({
  chromaticApproaches,
  diatonicApproaches,
  numFrets,
  numStrings,
  isMobile,
}: TargetNoteOverlayProps) {
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

  const allApproaches = [...chromaticApproaches, ...diatonicApproaches];

  if (allApproaches.length === 0) return null;

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
        aria-label="Approach notes to chord tones"
      >
        <defs>
          {/* Arrow markers for approach directions */}
          <marker
            id="arrow-amber"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" className="fill-amber-500" />
          </marker>
          <marker
            id="arrow-sky"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" className="fill-sky-400" />
          </marker>
        </defs>

        {allApproaches.map((approach, index) => {
          const approachX = getFretX(approach.fret);
          const approachY = getStringY(approach.string);
          const targetX = getFretX(approach.targetFret);
          const targetY = getStringY(approach.targetString);

          const isChromatic = approach.type === "chromatic";
          const color = isChromatic ? "#f59e0b" : "#38bdf8"; // amber-500 / sky-400
          const markerId = isChromatic ? "arrow-amber" : "arrow-sky";

          // Diamond size
          const size = 5;

          // Calculate arrow direction
          const dx = targetX - approachX;
          const dy = targetY - approachY;
          const length = Math.sqrt(dx * dx + dy * dy);

          // Shorten the line to avoid overlapping note markers
          const shortenBy = 14;
          const adjustedApproachX =
            length > 0 ? approachX + (dx / length) * (size + 2) : approachX;
          const adjustedApproachY =
            length > 0 ? approachY + (dy / length) * (size + 2) : approachY;
          const adjustedTargetX =
            length > 0 ? targetX - (dx / length) * shortenBy : targetX;
          const adjustedTargetY =
            length > 0 ? targetY - (dy / length) * shortenBy : targetY;

          return (
            <g
              key={`${approach.type}-${approach.string}-${approach.fret}-${index}`}
            >
              {/* Approach note diamond */}
              <polygon
                points={`${approachX},${approachY - size} ${approachX + size},${approachY} ${approachX},${approachY + size} ${approachX - size},${approachY}`}
                fill={color}
                opacity={0.85}
              />

              {/* Arrow to target (hidden on mobile) */}
              {!isMobile && length > 0 && (
                <line
                  x1={adjustedApproachX}
                  y1={adjustedApproachY}
                  x2={adjustedTargetX}
                  y2={adjustedTargetY}
                  stroke={color}
                  strokeWidth="1.5"
                  opacity={0.6}
                  markerEnd={`url(#${markerId})`}
                  strokeDasharray="3 2"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
