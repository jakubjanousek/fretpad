"use client";

import type { VoiceLeadingPath } from "@/lib/theory/voiceLeading";
import { cn } from "@/lib/utils";

interface VoiceLeadingOverlayProps {
  paths: VoiceLeadingPath[];
  numFrets: number;
  numStrings: number;
}

// Layout constants matching the Fretboard component
const STRING_LABEL_WIDTH = 32; // w-8
const NUT_WIDTH = 40; // w-10
const MIN_FRET_WIDTH = 48; // min-w-12
const STRING_HEIGHT = 52; // Approximate height per string row (including padding)

/**
 * Calculates the X position for a fret on the fretboard
 */
function getFretX(
  fret: number,
  containerWidth: number,
  numFrets: number,
): number {
  if (fret === 0) {
    // Open string (nut position)
    return STRING_LABEL_WIDTH + NUT_WIDTH / 2;
  }

  // Calculate fret width dynamically
  const availableWidth = containerWidth - STRING_LABEL_WIDTH - NUT_WIDTH;
  const fretWidth = Math.max(MIN_FRET_WIDTH, availableWidth / numFrets);

  // Position at center of fret
  return STRING_LABEL_WIDTH + NUT_WIDTH + (fret - 0.5) * fretWidth;
}

/**
 * Calculates the Y position for a string on the fretboard
 */
function getStringY(stringNum: number): number {
  // stringNum is 1-indexed (1 = high E, 6 = low E)
  return (stringNum - 0.5) * STRING_HEIGHT;
}

/**
 * Gets the stroke color for a voice leading path based on its type
 */
function getPathColor(type: VoiceLeadingPath["type"]): string {
  switch (type) {
    case "common-tone":
      return "stroke-emerald-500"; // Green for common tones (staying in place)
    case "resolution":
      return "stroke-orange-500"; // Orange for resolutions (musically significant)
    default:
      return "stroke-blue-500"; // Blue for general guide tone motion
  }
}

/**
 * Gets opacity for a path based on semitone distance
 * Closer movements are more prominent
 */
function getPathOpacity(path: VoiceLeadingPath): number {
  if (path.type === "common-tone") return 0.9;
  if (path.type === "resolution") return 0.85;
  // Fade out larger intervals slightly
  return Math.max(0.5, 0.8 - path.semitoneDistance * 0.05);
}

export function VoiceLeadingOverlay({
  paths,
  numFrets,
  numStrings,
}: VoiceLeadingOverlayProps) {
  if (paths.length === 0) return null;

  // Calculate container dimensions
  const containerWidth =
    STRING_LABEL_WIDTH + NUT_WIDTH + numFrets * MIN_FRET_WIDTH;
  const containerHeight = numStrings * STRING_HEIGHT;

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{
        width: "100%",
        height: "100%",
      }}
      viewBox={`0 0 ${containerWidth} ${containerHeight}`}
      preserveAspectRatio="none"
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
        const fromX = getFretX(path.from.fret, containerWidth, numFrets);
        const fromY = getStringY(path.from.string);
        const toX = getFretX(path.to.fret, containerWidth, numFrets);
        const toY = getStringY(path.to.string);

        const colorClass = getPathColor(path.type);
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
                className={cn(colorClass, "fill-none")}
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
                  className={colorClass}
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
            className={cn(colorClass, "fill-none")}
            strokeWidth="2.5"
            opacity={opacity}
            markerEnd={markerEnd}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
