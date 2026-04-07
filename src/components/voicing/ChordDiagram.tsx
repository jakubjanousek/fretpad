"use client";

import { Interval, Note } from "tonal";
import type { GuitarFretPosition, GuitarVoicing, NoteName } from "@/lib/types";
import { cn } from "@/lib/utils";

// SVG layout constants
const STRING_COUNT = 6;
const FRETS_SHOWN = 4;
const PADDING_X = 14;
const PADDING_TOP = 22;
const PADDING_BOTTOM = 6;
const STRING_SPACING = 12;
const FRET_SPACING = 16;
const DOT_RADIUS = 4.5;

const GRID_WIDTH = (STRING_COUNT - 1) * STRING_SPACING;
const GRID_HEIGHT = FRETS_SHOWN * FRET_SPACING;
const SVG_WIDTH = GRID_WIDTH + PADDING_X * 2;
const SVG_HEIGHT = PADDING_TOP + GRID_HEIGHT + PADDING_BOTTOM;

// Colors matching the app's fretboard palette
export const COLORS = {
  root: "#f97316", // orange-500
  guideTone: "#3b82f6", // blue-500
  chordTone: "#10b981", // emerald-500
  default: "#a8a29e", // stone-400
} as const;

export function getNoteColor(
  pos: GuitarFretPosition,
  guideTones?: NoteName[],
): string {
  if (pos.isRoot) return COLORS.root;
  if (pos.note && guideTones?.length) {
    const chroma = Note.chroma(pos.note);
    if (
      chroma !== undefined &&
      guideTones.some((gt) => Note.chroma(gt) === chroma)
    ) {
      return COLORS.guideTone;
    }
  }
  return COLORS.chordTone;
}

/** Get short interval label (R, b3, 3, 5, b7, 7, etc.) relative to root */
function getIntervalLabel(note: string, root: string): string {
  const distance = Interval.distance(root, note);
  if (!distance) return "?";

  const semitones = Interval.semitones(distance);
  if (semitones === undefined) return "?";

  const labels: Record<number, string> = {
    0: "R",
    1: "b2",
    2: "2",
    3: "b3",
    4: "3",
    5: "4",
    6: "b5",
    7: "5",
    8: "#5",
    9: "6",
    10: "b7",
    11: "7",
  };
  return labels[((semitones % 12) + 12) % 12] ?? "?";
}

/** Convert string number (1=highE, 6=lowE) to SVG x position.
 *  Standard chord diagram: low E (6) on left, high E (1) on right. */
function stringToX(stringNum: number): number {
  return PADDING_X + (STRING_COUNT - stringNum) * STRING_SPACING;
}

export type DiagramLabelMode = "notes" | "intervals";

interface ChordDiagramProps {
  voicing: GuitarVoicing;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  guideTones?: NoteName[];
  labelMode?: DiagramLabelMode;
  root?: string;
}

export function ChordDiagram({
  voicing,
  className,
  size = "md",
  showLabel = false,
  guideTones,
  labelMode = "notes",
  root,
}: ChordDiagramProps) {
  const baseFret = voicing.baseFret;
  const hasOpenStrings = voicing.positions.some((p) => p.fret === 0);
  const displayBaseFret = baseFret <= 1 && hasOpenStrings ? 1 : baseFret;

  const sizeClasses = {
    xs: "w-16 h-auto",
    sm: "w-20 sm:w-24 h-auto",
    md: "w-24 sm:w-28 lg:w-32 h-auto",
    lg: "w-32 lg:w-40 h-auto",
    xl: "w-44 sm:w-52 lg:w-60 h-auto",
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {showLabel && (
        <span className="text-[10px] text-stone-400 mb-0.5 truncate max-w-full">
          {voicing.name}
        </span>
      )}
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className={sizeClasses[size]}
        role="img"
        aria-label={`${voicing.name} chord diagram`}
      >
        {/* Nut or fret number */}
        {displayBaseFret <= 1 ? (
          <line
            x1={PADDING_X}
            y1={PADDING_TOP}
            x2={PADDING_X + GRID_WIDTH}
            y2={PADDING_TOP}
            stroke="#d6d3d1"
            strokeWidth={2.5}
          />
        ) : (
          <text
            x={PADDING_X - 5}
            y={PADDING_TOP + FRET_SPACING / 2 + 1}
            textAnchor="end"
            className="fill-stone-400"
            fontSize={8}
            fontWeight={500}
          >
            {displayBaseFret}
          </text>
        )}

        {/* Fret lines */}
        {Array.from({ length: FRETS_SHOWN + 1 }, (_, i) => {
          const y = PADDING_TOP + i * FRET_SPACING;
          return (
            <line
              key={`fret-${i}`}
              x1={PADDING_X}
              y1={y}
              x2={PADDING_X + GRID_WIDTH}
              y2={y}
              stroke="#57534e"
              strokeWidth={i === 0 && displayBaseFret <= 1 ? 0 : 0.75}
            />
          );
        })}

        {/* String lines */}
        {Array.from({ length: STRING_COUNT }, (_, i) => {
          const x = PADDING_X + i * STRING_SPACING;
          return (
            <line
              key={`string-${i}`}
              x1={x}
              y1={PADDING_TOP}
              x2={x}
              y2={PADDING_TOP + GRID_HEIGHT}
              stroke="#78716c"
              strokeWidth={0.75}
            />
          );
        })}

        {/* Barre indicator */}
        {voicing.isBarreChord &&
          voicing.barreFret !== undefined &&
          voicing.barreStrings && (
            <rect
              x={stringToX(voicing.barreStrings[1]) - DOT_RADIUS}
              y={
                PADDING_TOP +
                (voicing.barreFret - displayBaseFret + 0.5) * FRET_SPACING -
                DOT_RADIUS
              }
              width={
                (voicing.barreStrings[1] - voicing.barreStrings[0]) *
                  STRING_SPACING +
                DOT_RADIUS * 2
              }
              height={DOT_RADIUS * 2}
              rx={DOT_RADIUS}
              fill="#78716c"
              opacity={0.7}
            />
          )}

        {/* String markers (dots, X, O) — low E on left, high E on right */}
        {voicing.positions.map((pos) => {
          const x = stringToX(pos.string);

          if (pos.fret === -1) {
            // Muted string — X
            return (
              <text
                key={`mute-${pos.string}`}
                x={x}
                y={PADDING_TOP - 5}
                textAnchor="middle"
                className="fill-stone-500"
                fontSize={8}
                fontWeight={500}
              >
                x
              </text>
            );
          }

          if (pos.fret === 0) {
            // Open string — O
            return (
              <circle
                key={`open-${pos.string}`}
                cx={x}
                cy={PADDING_TOP - 8}
                r={3}
                fill="none"
                stroke="#a8a29e"
                strokeWidth={1}
              />
            );
          }

          // Fretted note — filled dot
          const fretOffset = pos.fret - displayBaseFret;
          if (fretOffset < 0 || fretOffset >= FRETS_SHOWN) return null;
          const y = PADDING_TOP + (fretOffset + 0.5) * FRET_SPACING;
          const color = getNoteColor(pos, guideTones);

          // Determine label text
          let label = "";
          if (pos.note) {
            if (labelMode === "intervals" && root) {
              label = getIntervalLabel(pos.note, root);
            } else {
              label = pos.note.replace("#", "\u266F").replace("b", "\u266D");
            }
          }

          return (
            <g key={`dot-${pos.string}`}>
              <circle cx={x} cy={y} r={DOT_RADIUS} fill={color} />
              {label && (
                <text
                  x={x}
                  y={y + 0.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={5.5}
                  fontWeight={600}
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
