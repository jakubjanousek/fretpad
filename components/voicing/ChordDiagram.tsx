"use client";

import type { GuitarVoicing } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChordDiagramProps {
  voicing: GuitarVoicing;
  /** Width of the diagram in pixels */
  width?: number;
  /** Show finger numbers */
  showFingers?: boolean;
  /** Show fret numbers on the left */
  showFretNumbers?: boolean;
  /** Optional chord name to display */
  chordName?: string;
  /** Compact mode for smaller displays */
  compact?: boolean;
}

/**
 * Traditional chord diagram (box notation) component.
 * Shows a guitar chord voicing in the classic chord chart format.
 */
export function ChordDiagram({
  voicing,
  width = 100,
  showFingers = true,
  showFretNumbers = true,
  chordName,
  compact = false,
}: ChordDiagramProps) {
  // Calculate diagram dimensions
  const numFrets = compact ? 4 : 5;
  const numStrings = 6;
  const padding = compact ? 8 : 12;
  const topPadding = compact ? 16 : 24; // Space for X/O markers and chord name
  const bottomPadding = compact ? 8 : 12;
  const fretWidth = (width - padding * 2) / (numStrings - 1);
  const fretHeight = compact ? 14 : 18;

  const height = topPadding + numFrets * fretHeight + bottomPadding;

  // Calculate the starting fret to display (0 for open chords)
  const playedFrets = voicing.positions
    .filter((p) => p.fret > 0)
    .map((p) => p.fret);

  const minFret = playedFrets.length > 0 ? Math.min(...playedFrets) : 0;

  // Show from fret 1 if all notes are within the first few frets, otherwise show from minFret
  const startFret = minFret <= 3 ? 1 : minFret;
  const isOpenPosition = startFret === 1;

  // Get X position for a string (1 = high E on the right, 6 = low E on the left)
  const getStringX = (stringNum: number) => {
    return padding + (6 - stringNum) * fretWidth;
  };

  // Get Y position for a fret
  const getFretY = (fretNum: number) => {
    const relativeFret = fretNum - startFret;
    return topPadding + (relativeFret + 0.5) * fretHeight;
  };

  // Render the nut (thick line at top for open position)
  const nutY = topPadding;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Chord name */}
      {chordName && (
        <span className="text-sm font-medium text-foreground">{chordName}</span>
      )}

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="select-none"
        role="img"
        aria-label={`Chord diagram for ${chordName ?? voicing.name}`}
      >
        <title>{chordName ?? voicing.name} chord diagram</title>
        {/* Nut or starting fret indicator */}
        {isOpenPosition ? (
          <rect
            x={padding - 2}
            y={nutY - 3}
            width={fretWidth * (numStrings - 1) + 4}
            height={4}
            fill="currentColor"
            className="text-foreground"
          />
        ) : (
          showFretNumbers && (
            <text
              x={padding - 8}
              y={nutY + fretHeight / 2 + 4}
              textAnchor="end"
              className="text-xs fill-muted-foreground"
            >
              {startFret}
            </text>
          )
        )}

        {/* Horizontal fret lines */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={padding}
            y1={nutY + i * fretHeight}
            x2={width - padding}
            y2={nutY + i * fretHeight}
            stroke="currentColor"
            strokeWidth={1}
            className="text-muted-foreground/50"
          />
        ))}

        {/* Vertical string lines */}
        {Array.from({ length: numStrings }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={padding + i * fretWidth}
            y1={nutY}
            x2={padding + i * fretWidth}
            y2={nutY + numFrets * fretHeight}
            stroke="currentColor"
            strokeWidth={1}
            className="text-muted-foreground/50"
          />
        ))}

        {/* Barre indicator */}
        {voicing.isBarreChord &&
          voicing.barreFret !== undefined &&
          voicing.barreStrings && (
            <rect
              x={getStringX(voicing.barreStrings[1]) - 4}
              y={getFretY(voicing.barreFret) - 6}
              width={
                Math.abs(
                  getStringX(voicing.barreStrings[0]) -
                    getStringX(voicing.barreStrings[1]),
                ) + 8
              }
              height={12}
              rx={6}
              fill="currentColor"
              className="text-foreground"
            />
          )}

        {/* String positions (X/O markers and finger dots) */}
        {voicing.positions.map((pos) => {
          const x = getStringX(pos.string);

          // Muted string (X)
          if (pos.fret === -1) {
            const markerY = nutY - 10;
            const size = compact ? 4 : 5;
            return (
              <g key={`string-${pos.string}`}>
                <line
                  x1={x - size}
                  y1={markerY - size}
                  x2={x + size}
                  y2={markerY + size}
                  stroke="currentColor"
                  strokeWidth={compact ? 1.5 : 2}
                  className="text-muted-foreground"
                />
                <line
                  x1={x + size}
                  y1={markerY - size}
                  x2={x - size}
                  y2={markerY + size}
                  stroke="currentColor"
                  strokeWidth={compact ? 1.5 : 2}
                  className="text-muted-foreground"
                />
              </g>
            );
          }

          // Open string (O)
          if (pos.fret === 0) {
            const markerY = nutY - 10;
            const radius = compact ? 4 : 5;
            return (
              <circle
                key={`string-${pos.string}`}
                cx={x}
                cy={markerY}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={compact ? 1.5 : 2}
                className="text-muted-foreground"
              />
            );
          }

          // Skip if fret is out of visible range
          if (pos.fret < startFret || pos.fret >= startFret + numFrets) {
            return null;
          }

          // Played note (filled dot)
          const y = getFretY(pos.fret);
          const radius = compact ? 5 : 7;

          // Don't render individual dots for barre positions
          const isBarrePosition =
            voicing.isBarreChord &&
            voicing.barreFret === pos.fret &&
            voicing.barreStrings &&
            pos.string >= voicing.barreStrings[0] &&
            pos.string <= voicing.barreStrings[1];

          if (isBarrePosition) {
            return null;
          }

          return (
            <g key={`string-${pos.string}`}>
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill="currentColor"
                className={cn(
                  pos.isRoot ? "text-orange-500" : "text-foreground",
                )}
              />
              {/* Finger number */}
              {showFingers && pos.finger && (
                <text
                  x={x}
                  y={y + (compact ? 3 : 4)}
                  textAnchor="middle"
                  className={cn(
                    "font-medium select-none",
                    compact ? "text-[8px]" : "text-[10px]",
                    pos.isRoot ? "fill-orange-950" : "fill-background",
                  )}
                >
                  {pos.finger === "T" ? "T" : pos.finger}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Position info */}
      {!compact && !isOpenPosition && (
        <span className="text-[10px] text-muted-foreground">
          Fret {startFret}
        </span>
      )}
    </div>
  );
}
