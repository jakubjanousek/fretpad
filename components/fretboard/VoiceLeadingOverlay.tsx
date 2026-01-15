"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { VoiceLeadingPath } from "@/lib/theory/voiceLeading";

interface VoiceLeadingOverlayProps {
  paths: VoiceLeadingPath[];
  numFrets: number;
  numStrings: number;
}

// Layout constants matching the Fretboard component
const STRING_LABEL_WIDTH = 32; // w-8
const NUT_WIDTH = 40; // w-10

/**
 * Gets the stroke color for a voice leading path based on its type
 */
function getPathColor(type: VoiceLeadingPath["type"]): string {
  switch (type) {
    case "common-tone":
      return "#10b981"; // emerald-500
    case "resolution":
      return "#f97316"; // orange-500
    default:
      return "#3b82f6"; // blue-500
  }
}

/**
 * Gets opacity for a path based on semitone distance
 */
function getPathOpacity(path: VoiceLeadingPath): number {
  if (path.type === "common-tone") return 0.9;
  if (path.type === "resolution") return 0.85;
  return Math.max(0.5, 0.8 - path.semitoneDistance * 0.05);
}

export function VoiceLeadingOverlay({
  paths,
  numFrets,
  numStrings,
}: VoiceLeadingOverlayProps) {
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

  if (paths.length === 0) return null;

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
        aria-label="Voice leading paths between chord tones"
      >
        <defs>
          {/* Arrow marker for guide tone paths */}
          <marker
            id="arrow-blue"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L8,3 z" className="fill-blue-500" />
          </marker>
          <marker
            id="arrow-orange"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L8,3 z" className="fill-orange-500" />
          </marker>
          <marker
            id="arrow-emerald"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L8,3 z" className="fill-emerald-500" />
          </marker>
        </defs>

        {paths.map((path, index) => {
          // If arrow starts from fret 0 and we have at least 12 frets visible,
          // draw it from fret 12 instead (same note, octave equivalent) for better visuals
          const visualFromFret =
            path.from.fret === 0 && numFrets >= 12 ? 12 : path.from.fret;

          const fromX = getFretX(visualFromFret);
          const fromY = getStringY(path.from.string);
          const toX = getFretX(path.to.fret);
          const toY = getStringY(path.to.string);

          const color = getPathColor(path.type);
          const opacity = getPathOpacity(path);

          // For common tones, draw a circle highlight instead of an arrow
          if (path.type === "common-tone") {
            return (
              <g key={index}>
                {/* Pulsing ring around common tone */}
                <circle
                  cx={fromX}
                  cy={fromY}
                  r="18"
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  opacity={opacity}
                  strokeDasharray="4 2"
                />
                {/* Small connector if positions differ */}
                {(fromX !== toX || fromY !== toY) && (
                  <line
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke={color}
                    strokeWidth="2"
                    opacity={opacity * 0.5}
                    strokeDasharray="2 2"
                  />
                )}
              </g>
            );
          }

          // Determine arrow marker based on type
          // Note: common-tone is handled separately above, so only resolution or guide-tone here
          const markerEnd =
            path.type === "resolution"
              ? "url(#arrow-orange)"
              : "url(#arrow-blue)";

          // Calculate a curved path for better visibility
          // Use a quadratic bezier for smooth curves
          const midX = (fromX + toX) / 2;
          const midY = (fromY + toY) / 2;

          // Offset the control point perpendicular to the line
          const dx = toX - fromX;
          const dy = toY - fromY;
          const length = Math.sqrt(dx * dx + dy * dy);

          // Only curve if there's significant distance
          const curveOffset = length > 50 ? 15 : 0;
          const perpX = length > 0 ? (-dy / length) * curveOffset : 0;
          const perpY = length > 0 ? (dx / length) * curveOffset : 0;

          const controlX = midX + perpX;
          const controlY = midY + perpY;

          // Shorten the line slightly to account for the note marker
          const shortenBy = 16;
          const adjustedFromX = fromX + (dx / length) * shortenBy || fromX;
          const adjustedFromY = fromY + (dy / length) * shortenBy || fromY;
          const adjustedToX = toX - (dx / length) * shortenBy || toX;
          const adjustedToY = toY - (dy / length) * shortenBy || toY;

          return (
            <path
              key={index}
              d={
                curveOffset > 0
                  ? `M ${adjustedFromX} ${adjustedFromY} Q ${controlX} ${controlY} ${adjustedToX} ${adjustedToY}`
                  : `M ${adjustedFromX} ${adjustedFromY} L ${adjustedToX} ${adjustedToY}`
              }
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              opacity={opacity}
              markerEnd={markerEnd}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </div>
  );
}
