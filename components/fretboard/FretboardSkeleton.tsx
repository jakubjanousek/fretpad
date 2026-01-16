"use client";

import { cn } from "@/lib/utils";

interface FretboardSkeletonProps {
  numFrets?: number;
  numStrings?: number;
  className?: string;
}

/**
 * Skeleton loading state for the fretboard.
 * Shows animated placeholder rows that match the fretboard layout.
 */
export function FretboardSkeleton({
  numFrets = 12,
  numStrings = 6,
  className,
}: FretboardSkeletonProps) {
  const frets = Array.from({ length: numFrets + 1 }, (_, i) => i);
  const strings = Array.from({ length: numStrings }, (_, i) => i);

  return (
    <div className={cn("w-full animate-pulse", className)}>
      <div className="min-w-125 sm:min-w-150 md:min-w-175">
        {/* Fret numbers header skeleton */}
        <div className="flex mb-1">
          <div className="w-8 shrink-0" />
          <div className="w-10 shrink-0 flex items-center justify-center">
            <div className="h-3 w-3 rounded bg-muted" />
          </div>
          {frets.slice(1).map((fret) => (
            <div
              key={fret}
              className="flex-1 min-w-12 flex items-center justify-center"
            >
              <div className="h-3 w-4 rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* Fretboard grid skeleton */}
        <div className="relative border rounded-lg bg-muted/30">
          {strings.map((stringIndex) => (
            <div
              key={stringIndex}
              className="flex items-center border-b last:border-b-0 border-muted"
            >
              {/* String label */}
              <div className="w-8 shrink-0 flex items-center justify-center py-3">
                <div className="h-4 w-4 rounded bg-muted" />
              </div>

              {/* Nut position */}
              <div className="w-10 shrink-0 flex items-center justify-center border-r-4 border-muted py-2.5 sm:py-3">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full bg-muted",
                    // Animate different rows at different times
                    stringIndex % 2 === 0 ? "animate-pulse" : "animate-pulse delay-75",
                  )}
                />
              </div>

              {/* Frets */}
              {frets.slice(1).map((fret) => (
                <div
                  key={fret}
                  className="flex-1 min-w-10 sm:min-w-12 flex items-center justify-center border-r border-muted/60 py-2.5 sm:py-3 relative"
                >
                  {/* String wire placeholder */}
                  <div
                    className="absolute left-0 right-0 top-1/2 -translate-y-1/2 bg-muted/50"
                    style={{ height: `${1 + stringIndex * 0.3}px` }}
                  />
                  {/* Random note placeholders */}
                  {Math.random() > 0.7 && (
                    <div
                      className={cn(
                        "relative z-10 w-7 h-7 rounded-full bg-muted",
                        fret % 3 === 0 && "animate-pulse delay-100",
                        fret % 3 === 1 && "animate-pulse delay-200",
                        fret % 3 === 2 && "animate-pulse delay-300",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend skeleton */}
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-muted" />
                <div className="h-3 w-12 rounded bg-muted" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="h-7 w-20 rounded bg-muted" />
            <div className="h-7 w-24 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
