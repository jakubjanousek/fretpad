"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { VoiceLeadingPath } from "@/lib/theory/voiceLeading";
import type { FretNote, NoteLabelMode, NoteName } from "@/lib/types";
import { STANDARD_TUNING } from "@/lib/types";
import { cn } from "@/lib/utils";

import { FretboardLegend, type LegendNoteType } from "./FretboardLegend";
import { FretMarker } from "./FretMarker";
import { LegendTooltip } from "./LegendTooltip";
import { VoiceLeadingOverlay } from "./VoiceLeadingOverlay";

interface FretboardProps {
  fretNotes: FretNote[];
  numFrets?: number;
  tuning?: NoteName[];
  voiceLeadingPaths?: VoiceLeadingPath[];
  showVoiceLeading?: boolean;
  showScaleTones?: boolean;
  noteLabelMode?: NoteLabelMode;
  onToggleVoiceLeading?: () => void;
  onToggleScaleTones?: () => void;
  onNoteLabelModeChange?: (mode: NoteLabelMode) => void;
}

// Fret markers positions (standard dots)
const FRET_MARKERS = [3, 5, 7, 9, 12];
const DOUBLE_MARKER_FRETS = [12];

// Responsive fret counts
const MOBILE_FRETS = 8;
const TABLET_FRETS = 10;
const DESKTOP_FRETS = 12;

function useResponsiveFrets(maxFrets: number): number {
  const [fretCount, setFretCount] = useState(maxFrets);

  useEffect(() => {
    const updateFretCount = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setFretCount(Math.min(MOBILE_FRETS, maxFrets));
      } else if (width < 768) {
        setFretCount(Math.min(TABLET_FRETS, maxFrets));
      } else {
        setFretCount(maxFrets);
      }
    };

    updateFretCount();
    window.addEventListener("resize", updateFretCount);
    return () => window.removeEventListener("resize", updateFretCount);
  }, [maxFrets]);

  return fretCount;
}

export function Fretboard({
  fretNotes,
  numFrets = DESKTOP_FRETS,
  tuning = STANDARD_TUNING,
  voiceLeadingPaths = [],
  showVoiceLeading = false,
  showScaleTones = false,
  noteLabelMode = "notes",
  onToggleVoiceLeading,
  onToggleScaleTones,
  onNoteLabelModeChange,
}: FretboardProps) {
  const responsiveFretCount = useResponsiveFrets(numFrets);
  const [hoveredLegendType, setHoveredLegendType] =
    useState<LegendNoteType>(null);
  const [showLegendTooltip, setShowLegendTooltip] = useState(true);

  const handleLegendTooltipComplete = () => {
    setShowLegendTooltip(false);
    setHoveredLegendType(null);
  };

  // Helper to determine if a note matches the hovered legend type
  const getNoteHighlightState = (
    note: FretNote,
  ): "highlighted" | "dimmed" | "normal" => {
    if (!hoveredLegendType) return "normal";

    const noteType: LegendNoteType = note.isRoot
      ? "root"
      : note.isGuideTone
        ? "guide"
        : note.isChordTone
          ? "chord"
          : "scale";

    return noteType === hoveredLegendType ? "highlighted" : "dimmed";
  };

  // Create a map for quick lookup of notes at positions
  const noteMap = new Map<string, FretNote>();
  for (const note of fretNotes) {
    const key = `${note.string}-${note.fret}`;
    noteMap.set(key, note);
  }

  // Generate fret numbers for header (use responsive count)
  const frets = Array.from({ length: responsiveFretCount + 1 }, (_, i) => i);

  return (
    <div className="w-full overflow-x-auto scrollbar-hide sm:scrollbar-thin sm:scrollbar-thumb-muted sm:scrollbar-track-transparent">
      <div className="min-w-125 sm:min-w-150 md:min-w-175">
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
              numFrets={responsiveFretCount}
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
                <div className="w-10 shrink-0 flex items-center justify-center border-r-4 border-slate-400 dark:border-slate-500 py-2.5 sm:py-3">
                  {(() => {
                    const nutNote = noteMap.get(`${stringNum}-0`);
                    return nutNote ? (
                      <FretMarker
                        note={nutNote}
                        labelMode={noteLabelMode}
                        highlightState={getNoteHighlightState(nutNote)}
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-7 sm:h-7" />
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
                      className="flex-1 min-w-10 sm:min-w-12 flex items-center justify-center border-r border-slate-400/60 dark:border-slate-500/60 py-2.5 sm:py-3 relative"
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
                          <FretMarker
                            note={note}
                            labelMode={noteLabelMode}
                            highlightState={getNoteHighlightState(note)}
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 sm:w-7 sm:h-7" />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legend and controls */}
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Interactive Legend */}
          <FretboardLegend
            hoveredType={hoveredLegendType}
            onHoverChange={setHoveredLegendType}
          />

          {/* Controls */}
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            {/* Note label mode selector - segmented control style */}
            {onNoteLabelModeChange && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Labels:
                </span>
                <div className="relative flex rounded-lg bg-muted/60 p-0.5">
                  {/* Sliding indicator */}
                  <div
                    className={cn(
                      "absolute top-0.5 bottom-0.5 rounded-md bg-background shadow-sm transition-all duration-200 ease-out",
                      noteLabelMode === "notes" &&
                        "left-0.5 w-[calc(33.33%-2px)]",
                      noteLabelMode === "intervals" &&
                        "left-[33.33%] w-[calc(33.33%-2px)]",
                      noteLabelMode === "none" &&
                        "left-[66.66%] w-[calc(33.33%-2px)]",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => onNoteLabelModeChange("notes")}
                    className={cn(
                      "relative z-10 h-7 px-2.5 text-xs font-medium rounded-md transition-colors duration-150",
                      noteLabelMode === "notes"
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Notes
                  </button>
                  <button
                    type="button"
                    onClick={() => onNoteLabelModeChange("intervals")}
                    className={cn(
                      "relative z-10 h-7 px-2.5 text-xs font-medium rounded-md transition-colors duration-150",
                      noteLabelMode === "intervals"
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Intervals
                  </button>
                  <button
                    type="button"
                    onClick={() => onNoteLabelModeChange("none")}
                    className={cn(
                      "relative z-10 h-7 px-2.5 text-xs font-medium rounded-md transition-colors duration-150",
                      noteLabelMode === "none"
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    None
                  </button>
                </div>
              </div>
            )}

            {/* Toggle buttons with enhanced states */}
            {(onToggleVoiceLeading || onToggleScaleTones) && (
              <div className="flex gap-1.5 sm:gap-2">
                {onToggleVoiceLeading && (
                  <Button
                    variant="outline"
                    size="sm"
                    data-state={showVoiceLeading ? "on" : "off"}
                    onClick={onToggleVoiceLeading}
                    className={cn(
                      "h-7 text-xs transition-all duration-150 active:scale-95",
                      showVoiceLeading
                        ? "bg-blue-500/15 border-blue-500 text-blue-600 hover:bg-blue-500/25 dark:text-blue-400 dark:bg-blue-500/20 dark:hover:bg-blue-500/30"
                        : "hover:border-blue-500/50",
                    )}
                  >
                    <span
                      className={cn(
                        "mr-1.5 inline-block w-1.5 h-1.5 rounded-full transition-colors duration-150",
                        showVoiceLeading
                          ? "bg-blue-500"
                          : "bg-muted-foreground/30",
                      )}
                    />
                    Voice Leading
                  </Button>
                )}
                {onToggleScaleTones && (
                  <Button
                    variant="outline"
                    size="sm"
                    data-state={showScaleTones ? "on" : "off"}
                    onClick={onToggleScaleTones}
                    className={cn(
                      "h-7 text-xs transition-all duration-150 active:scale-95",
                      showScaleTones
                        ? "bg-blue-500/15 border-blue-500 text-blue-600 hover:bg-blue-500/25 dark:text-blue-400 dark:bg-blue-500/20 dark:hover:bg-blue-500/30"
                        : "hover:border-slate-500/50",
                    )}
                  >
                    <span
                      className={cn(
                        "mr-1.5 inline-block w-1.5 h-1.5 rounded-full transition-colors duration-150",
                        showScaleTones
                          ? "bg-slate-500"
                          : "bg-muted-foreground/30",
                      )}
                    />
                    Scale Tones
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* First-time legend tooltip */}
      {showLegendTooltip && (
        <LegendTooltip
          onHighlightChange={setHoveredLegendType}
          onComplete={handleLegendTooltipComplete}
        />
      )}
    </div>
  );
}
