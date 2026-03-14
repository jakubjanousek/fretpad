"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFretboardDisplay } from "@/hooks/useFretboardDisplay";
import { getTargetStrength } from "@/lib/theory/targetNotes";
import type { VoiceLeadingPath } from "@/lib/theory/voiceLeading";
import type {
  ApproachNote,
  ArpeggioConnection,
  EnclosurePattern,
  FretNote,
  FretPosition,
  GuitarVoicing,
  NoteName,
} from "@/lib/types";
import { CAGED_POSITION_LABELS, STANDARD_TUNING } from "@/lib/types";

import { ArpeggioOverlay } from "./ArpeggioOverlay";
import { DisplayToolbar } from "./DisplayToolbar";
import { EnclosureOverlay } from "./EnclosureOverlay";
import { FretboardLegend, type LegendNoteType } from "./FretboardLegend";
import { FretMarker, type OverlayColorMode } from "./FretMarker";
import { LegendTooltip } from "./LegendTooltip";
import { TargetNoteOverlay } from "./TargetNoteOverlay";
import { VoiceLeadingOverlay } from "./VoiceLeadingOverlay";
import { VoicingOverlay } from "./VoicingOverlay";

interface FretboardProps {
  fretNotes: FretNote[];
  numFrets?: number;
  tuning?: NoteName[];
  voiceLeadingPaths?: VoiceLeadingPath[];
  quizMode?: boolean;
  quizTargetPosition?: FretPosition | null;
  targetNotes?: FretNote[];
  chromaticApproaches?: ApproachNote[];
  diatonicApproaches?: ApproachNote[];
  enclosures?: EnclosurePattern[];
  arpeggioConnections?: ArpeggioConnection[];
  showVoicings?: boolean;
  selectedVoicing?: GuitarVoicing | null;
  showVoicingFingers?: boolean;
  onToggleVoicings?: () => void;
  onToggleVoicingFingers?: () => void;
  onNextVoicing?: () => void;
  onPreviousVoicing?: () => void;
  availableVoicingsCount?: number;
  selectedVoicingIndex?: number;
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

export function Fretboard({
  fretNotes,
  numFrets = DESKTOP_FRETS,
  tuning = STANDARD_TUNING,
  voiceLeadingPaths = [],
  quizMode = false,
  quizTargetPosition = null,
  targetNotes = [],
  chromaticApproaches = [],
  diatonicApproaches = [],
  enclosures = [],
  arpeggioConnections = [],
  showVoicings = false,
  selectedVoicing = null,
  showVoicingFingers = true,
  onToggleVoicings,
  onToggleVoicingFingers,
  onNextVoicing,
  onPreviousVoicing,
  availableVoicingsCount = 0,
  selectedVoicingIndex = 0,
}: FretboardProps) {
  const {
    showScaleTones,
    setShowScaleTones,
    showVoiceLeading,
    setShowVoiceLeading,
    noteLabelMode,
    setNoteLabelMode,
    fretboardOverlay,
    setFretboardOverlay,
    showCAGEDPositions,
    setShowCAGEDPositions,
    focusedPosition,
    setFocusedPosition,
    targetNoteMode,
    setTargetNoteMode,
    showChromaticApproach,
    setShowChromaticApproach,
    showDiatonicApproach,
    setShowDiatonicApproach,
    showEnclosures,
    setShowEnclosures,
    focusedEnclosureTarget,
    setFocusedEnclosureTarget,
  } = useFretboardDisplay();
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

  // Helper to check if a note is part of the selected voicing
  const isVoicingPosition = (
    stringNum: number,
    fret: number,
  ): {
    isVoicing: boolean;
    finger?: 1 | 2 | 3 | 4 | "T";
    isBarre?: boolean;
  } => {
    if (!showVoicings || !selectedVoicing) {
      return { isVoicing: false };
    }
    const position = selectedVoicing.positions.find(
      (p) => p.string === stringNum && p.fret === fret && p.fret >= 0,
    );
    if (position) {
      const isBarre =
        selectedVoicing.isBarreChord &&
        selectedVoicing.barreFret === fret &&
        selectedVoicing.barreStrings !== undefined &&
        stringNum >= selectedVoicing.barreStrings[0] &&
        stringNum <= selectedVoicing.barreStrings[1];
      return {
        isVoicing: true,
        finger: position.finger,
        isBarre,
      };
    }
    return { isVoicing: false };
  };

  // Handler for clicking on a target note to show enclosure
  const handleTargetNoteClick = (note: FretNote) => {
    if (!showEnclosures || !note.isChordTone) return;

    // Toggle focus: if already focused on this note, unfocus; otherwise focus
    if (
      focusedEnclosureTarget?.fret === note.fret &&
      focusedEnclosureTarget?.string === note.string
    ) {
      setFocusedEnclosureTarget(null);
    } else {
      setFocusedEnclosureTarget({
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

            {/* Voicing overlay */}
            {showVoicings && selectedVoicing && (
              <VoicingOverlay
                voicing={selectedVoicing}
                numFrets={responsiveFretCount}
                numStrings={tuning.length}
                showFingers={showVoicingFingers}
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
                        const voicingInfo = isVoicingPosition(stringNum, 0);
                        // Augment note with voicing info
                        const augmentedNote = nutNote
                          ? {
                              ...nutNote,
                              isVoicingNote: voicingInfo.isVoicing,
                              voicingFinger: voicingInfo.finger,
                              isBarreNote: voicingInfo.isBarre,
                            }
                          : null;
                        return augmentedNote ? (
                          <FretMarker
                            note={augmentedNote}
                            labelMode={noteLabelMode}
                            highlightState={getNoteHighlightState(
                              augmentedNote,
                            )}
                            overlayMode={getOverlayColorMode(augmentedNote)}
                            labelOverride={
                              quizMode && isQuizTarget(augmentedNote)
                                ? "?"
                                : undefined
                            }
                            className={getTargetAnimationClass(augmentedNote)}
                            onClick={
                              showEnclosures && augmentedNote.isChordTone
                                ? () => handleTargetNoteClick(augmentedNote)
                                : undefined
                            }
                            showVoicingStyle={showVoicings}
                            showFingerNumber={
                              showVoicings && showVoicingFingers
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
                      const voicingInfo = isVoicingPosition(stringNum, fret);
                      // Augment note with voicing info
                      const augmentedNote = note
                        ? {
                            ...note,
                            isVoicingNote: voicingInfo.isVoicing,
                            voicingFinger: voicingInfo.finger,
                            isBarreNote: voicingInfo.isBarre,
                          }
                        : null;

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
                          {augmentedNote ? (
                            <div className="relative z-10">
                              <FretMarker
                                note={augmentedNote}
                                labelMode={noteLabelMode}
                                highlightState={getNoteHighlightState(
                                  augmentedNote,
                                )}
                                overlayMode={getOverlayColorMode(augmentedNote)}
                                labelOverride={
                                  quizMode && isQuizTarget(augmentedNote)
                                    ? "?"
                                    : undefined
                                }
                                className={getTargetAnimationClass(
                                  augmentedNote,
                                )}
                                onClick={
                                  showEnclosures && augmentedNote.isChordTone
                                    ? () => handleTargetNoteClick(augmentedNote)
                                    : undefined
                                }
                                showVoicingStyle={showVoicings}
                                showFingerNumber={
                                  showVoicings && showVoicingFingers
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
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              {/* Interactive Legend */}
              <FretboardLegend
                hoveredType={hoveredLegendType}
                onHoverChange={setHoveredLegendType}
                overlayActive={isOverlayActive}
                showCAGEDPositions={showCAGEDPositions}
                isThreeNPS={isThreeNPS}
                focusedPosition={focusedPosition}
                onFocusPosition={setFocusedPosition}
              />

              {/* Display Toolbar */}
              <DisplayToolbar
                fretboardOverlay={fretboardOverlay}
                onOverlayChange={setFretboardOverlay}
                showCAGEDPositions={showCAGEDPositions}
                onToggleCAGEDPositions={() =>
                  setShowCAGEDPositions(!showCAGEDPositions)
                }
                focusedPosition={focusedPosition}
                onFocusedPositionChange={setFocusedPosition}
                noteLabelMode={noteLabelMode}
                onNoteLabelModeChange={setNoteLabelMode}
                showVoicings={showVoicings}
                onToggleVoicings={onToggleVoicings}
                showVoicingFingers={showVoicingFingers}
                onToggleVoicingFingers={onToggleVoicingFingers}
                selectedVoicing={selectedVoicing}
                availableVoicingsCount={availableVoicingsCount}
                selectedVoicingIndex={selectedVoicingIndex}
                onNextVoicing={onNextVoicing}
                onPreviousVoicing={onPreviousVoicing}
                showVoiceLeading={showVoiceLeading}
                onToggleVoiceLeading={() =>
                  setShowVoiceLeading(!showVoiceLeading)
                }
                showScaleTones={showScaleTones}
                onToggleScaleTones={() => setShowScaleTones(!showScaleTones)}
                targetNoteMode={targetNoteMode}
                onTargetNoteModeChange={setTargetNoteMode}
                showChromaticApproach={showChromaticApproach}
                onToggleChromaticApproach={() =>
                  setShowChromaticApproach(!showChromaticApproach)
                }
                showDiatonicApproach={showDiatonicApproach}
                onToggleDiatonicApproach={() =>
                  setShowDiatonicApproach(!showDiatonicApproach)
                }
                showEnclosures={showEnclosures}
                onToggleEnclosures={() => setShowEnclosures(!showEnclosures)}
              />
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
