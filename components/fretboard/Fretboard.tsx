"use client";

import type { VoiceLeadingPath } from "@/lib/theory/voiceLeading";
import type { FretNote, NoteName } from "@/lib/types";
import { STANDARD_TUNING } from "@/lib/types";

import { FretMarker } from "./FretMarker";
import { VoiceLeadingOverlay } from "./VoiceLeadingOverlay";

interface FretboardProps {
  fretNotes: FretNote[];
  numFrets?: number;
  tuning?: NoteName[];
  voiceLeadingPaths?: VoiceLeadingPath[];
}

// Fret markers positions (standard dots)
const FRET_MARKERS = [3, 5, 7, 9, 12];
const DOUBLE_MARKER_FRETS = [12];

export function Fretboard({
  fretNotes,
  numFrets = 12,
  tuning = STANDARD_TUNING,
  voiceLeadingPaths = [],
}: FretboardProps) {
  // Create a map for quick lookup of notes at positions
  const noteMap = new Map<string, FretNote>();
  for (const note of fretNotes) {
    const key = `${note.string}-${note.fret}`;
    noteMap.set(key, note);
  }

  // Generate fret numbers for header
  const frets = Array.from({ length: numFrets + 1 }, (_, i) => i);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Fret numbers header */}
        <div className="flex mb-1">
          {/* String label placeholder */}
          <div className="w-8 shrink-0" />
          {/* Nut */}
          <div className="w-10 shrink-0 flex items-center justify-center text-xs text-muted-foreground font-medium">
            0
          </div>
          {/* Fret numbers */}
          {frets.slice(1).map((fret) => (
            <div
              key={fret}
              className="flex-1 min-w-12 flex items-center justify-center text-xs text-muted-foreground"
            >
              {fret}
            </div>
          ))}
        </div>

        {/* Fretboard grid */}
        <div className="relative border rounded-lg bg-linear-to-b from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
          {/* Voice leading overlay */}
          {voiceLeadingPaths.length > 0 && (
            <VoiceLeadingOverlay
              paths={voiceLeadingPaths}
              numFrets={numFrets}
              numStrings={tuning.length}
            />
          )}

          {/* Fret marker dots (behind the grid) */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="flex h-full">
              {/* Offset for string label and nut */}
              <div className="w-8 shrink-0" />
              <div className="w-10 shrink-0" />
              {/* Fret cells */}
              {frets.slice(1).map((fret) => (
                <div
                  key={fret}
                  className="flex-1 min-w-12 flex items-center justify-center"
                >
                  {FRET_MARKERS.includes(fret) && (
                    <div className="flex flex-col gap-8">
                      <div className="w-2 h-2 rounded-full bg-slate-400/40" />
                      {DOUBLE_MARKER_FRETS.includes(fret) && (
                        <div className="w-2 h-2 rounded-full bg-slate-400/40" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Strings */}
          {tuning.map((openNote, stringIndex) => {
            const stringNum = stringIndex + 1; // 1-indexed

            return (
              <div
                key={stringNum}
                className="flex items-center border-b last:border-b-0 border-slate-300/50 dark:border-slate-600/50"
              >
                {/* String label */}
                <div className="w-8 shrink-0 flex items-center justify-center text-xs text-muted-foreground font-medium py-3">
                  {openNote}
                </div>

                {/* Nut position (fret 0) */}
                <div className="w-10 shrink-0 flex items-center justify-center border-r-4 border-slate-400 dark:border-slate-500 py-3">
                  {(() => {
                    const nutNote = noteMap.get(`${stringNum}-0`);
                    return nutNote ? (
                      <FretMarker note={nutNote} />
                    ) : (
                      <div className="w-7 h-7" />
                    );
                  })()}
                </div>

                {/* Frets */}
                {frets.slice(1).map((fret) => {
                  const key = `${stringNum}-${fret}`;
                  const note = noteMap.get(key);

                  return (
                    <div
                      key={fret}
                      className="flex-1 min-w-12 flex items-center justify-center border-r border-slate-400/60 dark:border-slate-500/60 py-3 relative"
                    >
                      {/* String wire */}
                      <div
                        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-slate-400 dark:bg-slate-500"
                        style={{
                          height: `${1 + stringIndex * 0.3}px`,
                        }}
                      />
                      {/* Note marker */}
                      {note ? (
                        <div className="relative z-10">
                          <FretMarker note={note} />
                        </div>
                      ) : (
                        <div className="w-7 h-7" />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">Root</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Guide tone (3rd/7th)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Chord tone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-400" />
            <span className="text-muted-foreground">Scale tone</span>
          </div>
        </div>
      </div>
    </div>
  );
}
