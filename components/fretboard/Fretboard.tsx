"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getTargetStrength } from "@/lib/theory/targetNotes";
import type { VoiceLeadingPath } from "@/lib/theory/voiceLeading";
import type {
  ApproachNote,
  ArpeggioConnection,
  CAGEDPosition,
  EnclosurePattern,
  FretboardOverlay,
  FretNote,
  FretPosition,
  NoteLabelMode,
  NoteName,
  TargetNoteMode,
} from "@/lib/types";
import { CAGED_POSITION_LABELS, STANDARD_TUNING } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ArpeggioOverlay } from "./ArpeggioOverlay";
import { EnclosureOverlay } from "./EnclosureOverlay";
import { FretboardLegend, type LegendNoteType } from "./FretboardLegend";
import { FretMarker, type OverlayColorMode } from "./FretMarker";
import { LegendTooltip } from "./LegendTooltip";
import { TargetNoteOverlay } from "./TargetNoteOverlay";
import { VoiceLeadingOverlay } from "./VoiceLeadingOverlay";

interface FretboardProps {
  fretNotes: FretNote[];
  numFrets?: number;
  tuning?: NoteName[];
  voiceLeadingPaths?: VoiceLeadingPath[];
  showVoiceLeading?: boolean;
  showScaleTones?: boolean;
  noteLabelMode?: NoteLabelMode;
  fretboardOverlay?: FretboardOverlay;
  showCAGEDPositions?: boolean;
  focusedPosition?: CAGEDPosition | null;
  onToggleVoiceLeading?: () => void;
  onToggleScaleTones?: () => void;
  onNoteLabelModeChange?: (mode: NoteLabelMode) => void;
  onOverlayChange?: (overlay: FretboardOverlay) => void;
  onToggleCAGEDPositions?: () => void;
  onFocusedPositionChange?: (pos: CAGEDPosition | null) => void;
  quizMode?: boolean;
  quizTargetPosition?: FretPosition | null;
  // Target Notes props
  targetNoteMode?: TargetNoteMode;
  targetNotes?: FretNote[];
  chromaticApproaches?: ApproachNote[];
  diatonicApproaches?: ApproachNote[];
  enclosures?: EnclosurePattern[];
  showChromaticApproach?: boolean;
  showDiatonicApproach?: boolean;
  showEnclosures?: boolean;
  focusedEnclosureTarget?: FretPosition | null;
  onTargetNoteModeChange?: (mode: TargetNoteMode) => void;
  onToggleChromaticApproach?: () => void;
  onToggleDiatonicApproach?: () => void;
  onToggleEnclosures?: () => void;
  onFocusedEnclosureTargetChange?: (target: FretPosition | null) => void;
  // Arpeggio props
  arpeggioConnections?: ArpeggioConnection[];
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

function useScrollIndicator() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const hasMoreToScroll = el.scrollWidth - el.scrollLeft - el.clientWidth > 2;
    setCanScroll(hasMoreToScroll);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  return { scrollRef, canScroll, checkScroll };
}

const OVERLAY_OPTIONS: { value: FretboardOverlay; label: string }[] = [
  { value: "none", label: "None" },
  { value: "pentatonicMinor", label: "Minor Pentatonic" },
  { value: "pentatonicMajor", label: "Major Pentatonic" },
  { value: "blues", label: "Blues" },
  { value: "threeNotePerString", label: "3-Note-Per-String" },
  { value: "arpeggio", label: "Arpeggio" },
];

const LABEL_OPTIONS: { value: NoteLabelMode; label: string }[] = [
  { value: "notes", label: "Notes" },
  { value: "degrees", label: "Degrees" },
  { value: "none", label: "None" },
];

const TARGET_MODE_OPTIONS: { value: TargetNoteMode; label: string }[] = [
  { value: "none", label: "None" },
  { value: "chord-tones", label: "Chord Tones" },
  { value: "guide-tones-only", label: "Guide Tones" },
  { value: "strong-beats", label: "Strong Beats" },
];

function getOverlayDisplayName(overlay: FretboardOverlay): string {
  const opt = OVERLAY_OPTIONS.find((o) => o.value === overlay);
  return opt?.label ?? "None";
}

export function Fretboard({
  fretNotes,
  numFrets = DESKTOP_FRETS,
  tuning = STANDARD_TUNING,
  voiceLeadingPaths = [],
  showVoiceLeading = false,
  showScaleTones = false,
  noteLabelMode = "notes",
  fretboardOverlay = "none",
  showCAGEDPositions = false,
  focusedPosition = null,
  onToggleVoiceLeading,
  onToggleScaleTones,
  onNoteLabelModeChange,
  onOverlayChange,
  onToggleCAGEDPositions,
  onFocusedPositionChange,
  quizMode = false,
  quizTargetPosition = null,
  // Target Notes props
  targetNoteMode = "none",
  targetNotes = [],
  chromaticApproaches = [],
  diatonicApproaches = [],
  enclosures = [],
  showChromaticApproach = false,
  showDiatonicApproach = false,
  showEnclosures = false,
  focusedEnclosureTarget = null,
  onTargetNoteModeChange,
  onToggleChromaticApproach,
  onToggleDiatonicApproach,
  onToggleEnclosures,
  onFocusedEnclosureTargetChange,
  // Arpeggio props
  arpeggioConnections = [],
}: FretboardProps) {
  const responsiveFretCount = useResponsiveFrets(numFrets);
  const { scrollRef, canScroll, checkScroll } = useScrollIndicator();

  // Track chord changes for crossfade animation
  const chordChangeKey = useRef(0);
  const prevFretNotesRef = useRef(fretNotes);
  if (fretNotes !== prevFretNotesRef.current) {
    prevFretNotesRef.current = fretNotes;
    chordChangeKey.current += 1;
  }

  // Re-check scroll state when fret count changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally re-run when responsiveFretCount changes
  useEffect(() => {
    checkScroll();
  }, [responsiveFretCount, checkScroll]);

  const [hoveredLegendType, setHoveredLegendType] =
    useState<LegendNoteType>(null);
  const [showLegendTooltip, setShowLegendTooltip] = useState(true);

  const handleLegendTooltipComplete = () => {
    setShowLegendTooltip(false);
    setHoveredLegendType(null);
  };

  // Helper to check if a note is the quiz target
  const isQuizTarget = (note: FretNote): boolean => {
    if (!quizMode || !quizTargetPosition) return false;
    return (
      note.string === quizTargetPosition.string &&
      note.fret === quizTargetPosition.fret
    );
  };

  const isOverlayActive = fretboardOverlay !== "none";
  const isThreeNPS = fretboardOverlay === "threeNotePerString";
  const isArpeggio = fretboardOverlay === "arpeggio";
  const isTargetModeActive = targetNoteMode !== "none";

  // Check if mobile for hiding arrows in overlays
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Helper to get animation class for target notes
  const getTargetAnimationClass = (note: FretNote): string => {
    if (!isTargetModeActive) return "";
    const isTarget = targetNotes.some(
      (t) => t.string === note.string && t.fret === note.fret,
    );
    if (!isTarget) return "";

    const strength = getTargetStrength(note);
    return strength === "primary"
      ? "animate-target-primary"
      : "animate-target-secondary";
  };

  // Handler for clicking on a target note to show enclosure
  const handleTargetNoteClick = (note: FretNote) => {
    if (!showEnclosures || !note.isChordTone) return;

    // Toggle focus: if already focused on this note, unfocus; otherwise focus
    if (
      focusedEnclosureTarget?.fret === note.fret &&
      focusedEnclosureTarget?.string === note.string
    ) {
      onFocusedEnclosureTargetChange?.(null);
    } else {
      onFocusedEnclosureTargetChange?.({
        fret: note.fret,
        string: note.string,
      });
    }
  };

  // Determine the overlay color mode for notes
  const getOverlayColorMode = (note: FretNote): OverlayColorMode => {
    if (!isOverlayActive) return "none";
    if (showCAGEDPositions && (note.cagedPosition || note.threeNPSPosition)) {
      return "caged";
    }
    return "chord-role";
  };

  // Helper to determine if a note matches the hovered legend type or focused position
  const getNoteHighlightState = (
    note: FretNote,
  ): "highlighted" | "dimmed" | "normal" => {
    // In quiz mode, highlight only the target note
    if (quizMode && quizTargetPosition) {
      return isQuizTarget(note) ? "highlighted" : "dimmed";
    }

    // Focus position mode — dim notes not in the focused position
    if (focusedPosition !== null && isOverlayActive && showCAGEDPositions) {
      const notePos = isThreeNPS ? note.threeNPSPosition : note.cagedPosition;
      if (notePos !== focusedPosition) return "dimmed";
      if (!hoveredLegendType) return "normal";
    }

    if (!hoveredLegendType) return "normal";

    // In overlay mode with CAGED positions on, highlight by position
    if (isOverlayActive && showCAGEDPositions) {
      if (note.cagedPosition) {
        const posLabel = CAGED_POSITION_LABELS[note.cagedPosition];
        const legendKey = `pos-${posLabel}`;
        return hoveredLegendType === legendKey ? "highlighted" : "dimmed";
      }
      if (note.threeNPSPosition) {
        const legendKey = `pos-${note.threeNPSPosition}`;
        return hoveredLegendType === legendKey ? "highlighted" : "dimmed";
      }
    }

    // Chord-role highlighting
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

  // Build summary chips for the display popover trigger
  const activeChips: string[] = [];
  if (isOverlayActive)
    activeChips.push(getOverlayDisplayName(fretboardOverlay));
  if (showVoiceLeading) activeChips.push("Voice Leading");
  if (showScaleTones) activeChips.push("Fill Scale");
  if (showCAGEDPositions && isOverlayActive) activeChips.push("Positions");
  if (isTargetModeActive) activeChips.push("Targets");

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto scrollbar-hide sm:scrollbar-thin sm:scrollbar-thumb-muted sm:scrollbar-track-transparent"
      >
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

            {/* Target note approach overlays */}
            {(showChromaticApproach || showDiatonicApproach) && (
              <TargetNoteOverlay
                chromaticApproaches={
                  showChromaticApproach ? chromaticApproaches : []
                }
                diatonicApproaches={
                  showDiatonicApproach ? diatonicApproaches : []
                }
                numFrets={responsiveFretCount}
                numStrings={tuning.length}
                isMobile={isMobile}
              />
            )}

            {/* Enclosure overlay */}
            {showEnclosures && enclosures.length > 0 && (
              <EnclosureOverlay
                enclosures={enclosures}
                focusedTarget={focusedEnclosureTarget}
                numFrets={responsiveFretCount}
                numStrings={tuning.length}
              />
            )}

            {/* Arpeggio overlay */}
            {isArpeggio && arpeggioConnections.length > 0 && (
              <ArpeggioOverlay
                connections={arpeggioConnections}
                numFrets={responsiveFretCount}
                numStrings={tuning.length}
                focusedPosition={focusedPosition}
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

            {/* Strings — crossfade on chord change */}
            <div
              key={chordChangeKey.current}
              className="animate-fretboard-crossfade"
            >
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
                            overlayMode={getOverlayColorMode(nutNote)}
                            labelOverride={
                              quizMode && isQuizTarget(nutNote)
                                ? "?"
                                : undefined
                            }
                            className={getTargetAnimationClass(nutNote)}
                            onClick={
                              showEnclosures && nutNote.isChordTone
                                ? () => handleTargetNoteClick(nutNote)
                                : undefined
                            }
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
                                overlayMode={getOverlayColorMode(note)}
                                labelOverride={
                                  quizMode && isQuizTarget(note)
                                    ? "?"
                                    : undefined
                                }
                                className={getTargetAnimationClass(note)}
                                onClick={
                                  showEnclosures && note.isChordTone
                                    ? () => handleTargetNoteClick(note)
                                    : undefined
                                }
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
          </div>

          {/* Legend and controls (hidden in quiz mode) */}
          {!quizMode && (
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Interactive Legend */}
              <FretboardLegend
                hoveredType={hoveredLegendType}
                onHoverChange={setHoveredLegendType}
                overlayActive={isOverlayActive}
                showCAGEDPositions={showCAGEDPositions}
                isThreeNPS={isThreeNPS}
                focusedPosition={focusedPosition}
                onFocusPosition={onFocusedPositionChange}
              />

              {/* Display Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs gap-1.5"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      role="img"
                      aria-label="Display settings"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                      />
                    </svg>
                    Display
                    {activeChips.length > 0 && (
                      <>
                        <span className="hidden sm:inline text-muted-foreground">
                          ({activeChips.join(" · ")})
                        </span>
                        <span className="sm:hidden w-1.5 h-1.5 rounded-full bg-primary" />
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="p-4 space-y-4">
                    {/* Scale Overlay */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Scale Overlay
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {OVERLAY_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => onOverlayChange?.(opt.value)}
                            className={cn(
                              "h-9 px-2.5 text-xs font-medium rounded-md transition-colors duration-150",
                              fretboardOverlay === opt.value
                                ? "bg-foreground text-background"
                                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80",
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Note Labels */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Note Labels
                      </h4>
                      <div className="flex gap-1">
                        {LABEL_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => onNoteLabelModeChange?.(opt.value)}
                            className={cn(
                              "h-9 px-2.5 text-xs font-medium rounded-md transition-colors duration-150",
                              noteLabelMode === opt.value
                                ? "bg-foreground text-background"
                                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80",
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Display Layers */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Display Layers
                      </h4>
                      <div className="space-y-1.5">
                        <ToggleRow
                          label="Voice Leading"
                          description="Show voice leading paths between chords"
                          active={showVoiceLeading}
                          onToggle={onToggleVoiceLeading}
                        />
                        <ToggleRow
                          label="Fill Scale"
                          description="Show remaining diatonic notes as faded dots"
                          active={showScaleTones}
                          onToggle={onToggleScaleTones}
                        />
                      </div>
                    </div>

                    {/* Target Notes */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Target Notes
                      </h4>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {TARGET_MODE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => onTargetNoteModeChange?.(opt.value)}
                            className={cn(
                              "h-9 px-2.5 text-xs font-medium rounded-md transition-colors duration-150",
                              targetNoteMode === opt.value
                                ? "bg-foreground text-background"
                                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80",
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {/* Approach layer toggles - only when target mode is active */}
                      {isTargetModeActive && (
                        <div className="space-y-1.5 pl-2 border-l-2 border-muted">
                          <ToggleRow
                            label="Chromatic approaches"
                            description="Show half-step approach notes (amber)"
                            active={showChromaticApproach}
                            onToggle={onToggleChromaticApproach}
                          />
                          <ToggleRow
                            label="Diatonic approaches"
                            description="Show scale-step approach notes (blue)"
                            active={showDiatonicApproach}
                            onToggle={onToggleDiatonicApproach}
                          />
                          <ToggleRow
                            label="Enclosures"
                            description="Click a target to see its enclosure"
                            active={showEnclosures}
                            onToggle={onToggleEnclosures}
                          />
                        </div>
                      )}
                    </div>

                    {/* CAGED Positions — only when overlay is active */}
                    {isOverlayActive && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          {isThreeNPS
                            ? "3NPS Positions"
                            : isArpeggio
                              ? "Arpeggio Positions"
                              : "CAGED Positions"}
                        </h4>
                        <ToggleRow
                          label="Show positions"
                          description={
                            isThreeNPS
                              ? "Color notes by 3NPS position (1-7)"
                              : isArpeggio
                                ? "Color arpeggio notes by CAGED shape"
                                : "Color notes by CAGED shape position"
                          }
                          active={showCAGEDPositions}
                          onToggle={onToggleCAGEDPositions}
                        />
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* First-time legend tooltip */}
        {showLegendTooltip && !quizMode && (
          <LegendTooltip
            onHighlightChange={setHoveredLegendType}
            onComplete={handleLegendTooltipComplete}
          />
        )}
      </div>

      {/* Mobile scroll indicator */}
      {canScroll && (
        <div
          className="absolute right-0 top-0 bottom-0 w-10 pointer-events-none flex items-center justify-end pr-1 sm:hidden"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-linear-to-r from-transparent to-background/80" />
          <svg
            className="relative w-5 h-5 text-muted-foreground animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            role="img"
            aria-label="Scroll right for more frets"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  active,
  onToggle,
}: {
  label: string;
  description: string;
  active: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-3 px-2.5 py-2.5 rounded-md text-left transition-colors",
        active ? "bg-blue-500/10 dark:bg-blue-500/15" : "hover:bg-muted/60",
      )}
    >
      <div
        className={cn(
          "w-8 h-5 rounded-full relative transition-colors shrink-0",
          active ? "bg-blue-500" : "bg-muted-foreground/30",
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
            active ? "translate-x-3.5" : "translate-x-0.5",
          )}
        />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium">{label}</div>
        <div className="text-[10px] text-muted-foreground leading-tight">
          {description}
        </div>
      </div>
    </button>
  );
}
