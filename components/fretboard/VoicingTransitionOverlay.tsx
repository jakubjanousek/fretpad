"use client";

import {
  calculateVoiceMovements,
  type VoiceMovement,
} from "@/lib/guitar/voice-leading";
import type { GuitarVoicing } from "@/lib/types";

interface VoicingTransitionOverlayProps {
  /** Current voicing being displayed */
  currentVoicing: GuitarVoicing;
  /** Next suggested voicing to transition to */
  nextVoicing: GuitarVoicing;
  /** Fretboard layout constants */
  stringSpacing: number;
  fretWidth: number;
  nutWidth: number;
  topPadding: number;
  /** Whether to show the overlay */
  visible: boolean;
}

/**
 * Overlay that visualizes voice leading movements between two voicings.
 * Shows arrows indicating how each voice moves from current to next position.
 */
export function VoicingTransitionOverlay({
  currentVoicing,
  nextVoicing,
  stringSpacing,
  fretWidth,
  nutWidth,
  topPadding,
  visible,
}: VoicingTransitionOverlayProps) {
  if (!visible) return null;

  const movements = calculateVoiceMovements(currentVoicing, nextVoicing);

  // Calculate position on fretboard
  const getPosition = (string: number, fret: number) => {
    const y = topPadding + (string - 1) * stringSpacing;
    const x = fret === 0 ? nutWidth / 2 : nutWidth + (fret - 0.5) * fretWidth;
    return { x, y };
  };

  // Get color based on movement type
  const getMovementColor = (movement: VoiceMovement) => {
    switch (movement.type) {
      case "common-tone":
        return "stroke-emerald-500";
      case "step":
        return "stroke-blue-500";
      case "leap":
        return "stroke-orange-500";
      case "new-voice":
        return "stroke-violet-500";
      case "voice-exit":
        return "stroke-slate-400";
      default:
        return "stroke-slate-500";
    }
  };

  // Get opacity based on movement type
  const getMovementOpacity = (movement: VoiceMovement) => {
    switch (movement.type) {
      case "common-tone":
        return 0.8;
      case "step":
        return 0.7;
      case "leap":
        return 0.6;
      default:
        return 0.5;
    }
  };

  // Filter movements that can be visualized (both positions must be played)
  const visualizableMovements = movements.filter(
    (m) =>
      (m.type === "common-tone" || m.type === "step" || m.type === "leap") &&
      m.fromFret >= 0 &&
      m.toFret >= 0,
  );

  if (visualizableMovements.length === 0) return null;

  return (
    <g className="voicing-transition-overlay">
      {visualizableMovements.map((movement, index) => {
        const from = getPosition(movement.string, movement.fromFret);
        const to = getPosition(movement.string, movement.toFret);

        // Calculate control point for curved path
        const midX = (from.x + to.x) / 2;
        const midY = from.y;
        const curvature = 15; // How much the arrow curves
        const controlY = midY - curvature;

        // For common tones on same position, show a small indicator
        if (movement.type === "common-tone" && movement.fretDistance === 0) {
          return (
            <g key={`movement-${index}`}>
              {/* Small circle indicating common tone */}
              <circle
                cx={from.x}
                cy={from.y}
                r={14}
                fill="none"
                className={`${getMovementColor(movement)} stroke-2`}
                opacity={0.6}
                strokeDasharray="3 3"
              />
            </g>
          );
        }

        // Create curved arrow path
        const pathD = `M ${from.x} ${from.y} Q ${midX} ${controlY} ${to.x} ${to.y}`;

        // Calculate arrow head angle
        const angle = Math.atan2(to.y - controlY, to.x - midX);
        const arrowLength = 6;
        const arrowAngle = Math.PI / 6; // 30 degrees

        const arrowX1 = to.x - arrowLength * Math.cos(angle - arrowAngle);
        const arrowY1 = to.y - arrowLength * Math.sin(angle - arrowAngle);
        const arrowX2 = to.x - arrowLength * Math.cos(angle + arrowAngle);
        const arrowY2 = to.y - arrowLength * Math.sin(angle + arrowAngle);

        return (
          <g key={`movement-${index}`} opacity={getMovementOpacity(movement)}>
            {/* Main path */}
            <path
              d={pathD}
              fill="none"
              className={`${getMovementColor(movement)} stroke-2`}
              strokeLinecap="round"
            />
            {/* Arrow head */}
            <path
              d={`M ${arrowX1} ${arrowY1} L ${to.x} ${to.y} L ${arrowX2} ${arrowY2}`}
              fill="none"
              className={`${getMovementColor(movement)} stroke-2`}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Movement label for significant movements */}
            {Math.abs(movement.fretDistance) >= 2 && (
              <text
                x={midX}
                y={controlY - 5}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px] font-medium"
              >
                {movement.fretDistance > 0 ? "+" : ""}
                {movement.fretDistance}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
