"use client";

import { ChevronDown, ChevronUp, Pencil, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PresetDropdown } from "@/components/progression/PresetDropdown";
import { ProgressionName } from "@/components/progression/ProgressionName";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type PlaybackPosition,
  usePlaybackPositionObserver,
} from "@/hooks/usePlaybackPosition";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

interface BarInputProps {
  barIndex: number;
  chordString: string;
  isSelected: boolean;
  selectedChordIndex: number;
  onSelect: (barIndex: number, chordIndex: number) => void;
  onUpdate: (barIndex: number, value: string) => boolean;
  onRemove: (barIndex: number) => void;
  canRemove: boolean;
  barRef: (node: HTMLDivElement | null) => void;
  playheadRef: (node: HTMLDivElement | null) => void;
}

function BarInput({
  barIndex,
  chordString,
  isSelected,
  selectedChordIndex,
  onSelect,
  onUpdate,
  onRemove,
  canRemove,
  barRef,
  playheadRef,
}: BarInputProps) {
  const [inputValue, setInputValue] = useState(chordString);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Parse the chord string to show individual chord buttons
  const chords = chordString.split(/\s+/).filter(Boolean);

  const handleBlur = () => {
    setIsEditing(false);
    if (inputValue.trim() !== chordString) {
      const success = onUpdate(barIndex, inputValue.trim());
      if (!success) {
        setError("Invalid chord. Try: Cmaj7, Dm7, G7, Am");
      } else {
        setError(null);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      setInputValue(chordString);
      setError(null);
      setIsEditing(false);
    }
  };

  const handleChordClick = (chordIndex: number) => {
    onSelect(barIndex, chordIndex);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  return (
    <div className="flex flex-col gap-1 shrink-0 group/bar">
      <div className="flex items-center">
        {isEditing ? (
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(null);
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-28 h-7 text-xs font-mono",
              error && "border-red-500 focus-visible:ring-red-500",
            )}
            autoFocus
          />
        ) : (
          <div
            ref={barRef}
            role="button"
            tabIndex={0}
            className={cn(
              "relative flex flex-wrap items-center gap-y-0.5 border rounded px-1.5 py-0.5 transition-all overflow-hidden data-[playing=true]:border-orange-400 data-[playing=true]:bg-orange-500/10 data-[playing=true]:ring-1 data-[playing=true]:ring-orange-400/50 data-[playing=true]:border-l-4 data-[playing=true]:border-l-orange-500",
              isSelected &&
                "border-primary ring-1 ring-primary/30 border-l-4 border-l-primary bg-primary/5",
            )}
            data-playing="false"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsEditing(true);
              }
            }}
          >
            {/* Playhead indicator */}
            <div
              ref={playheadRef}
              aria-hidden="true"
              className="pointer-events-none absolute top-0 bottom-0 left-0 w-0.5 bg-orange-500 z-10 transition-none shadow-[0_0_8px_rgba(249,115,22,0.6)] opacity-0"
            />
            {/* Bar number */}
            <span className="text-[10px] text-muted-foreground mr-1.5 font-medium">
              {barIndex + 1}.
            </span>
            {chords.map((chord, chordIdx) => (
              <button
                key={chordIdx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChordClick(chordIdx);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className={cn(
                  "px-2 py-1 text-xs font-mono rounded transition-colors relative z-0 cursor-pointer",
                  isSelected && selectedChordIndex === chordIdx
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                {chord}
              </button>
            ))}
            {/* Edit button - visible on hover or when selected */}
            <button
              type="button"
              onClick={handleEditClick}
              className={cn(
                "p-1 rounded transition-opacity text-muted-foreground hover:text-primary",
                isSelected
                  ? "opacity-60 hover:opacity-100"
                  : "opacity-0 group-hover/bar:opacity-60 hover:opacity-100! active:opacity-100",
              )}
              aria-label="Edit bar"
              title="Edit chords"
            >
              <Pencil className="h-3 w-3" />
            </button>
            {/* Remove button - hover only */}
            {canRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(barIndex);
                }}
                className="p-1.5 -m-1.5 rounded-md opacity-0 group-hover/bar:opacity-100 active:opacity-100 transition-opacity text-muted-foreground hover:text-destructive touch-target-expand"
                aria-label="Remove bar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function ProgressionEditor() {
  const progression = useAppStore((state) => state.progression);
  const currentBarIndex = useAppStore((state) => state.currentBarIndex);
  const currentChordIndex = useAppStore((state) => state.currentChordIndex);
  const isPlaying = useAppStore((state) => state.isPlaying);
  const metronome = useAppStore((state) => state.metronome);
  const setCurrentPosition = useAppStore((state) => state.setCurrentPosition);
  const updateBar = useAppStore((state) => state.updateBar);
  const addBar = useAppStore((state) => state.addBar);
  const removeBar = useAppStore((state) => state.removeBar);
  const transposeProgression = useAppStore(
    (state) => state.transposeProgression,
  );
  const barRefs = useRef<Array<HTMLDivElement | null>>([]);
  const playheadRefs = useRef<Array<HTMLDivElement | null>>([]);
  const overlayStateRef = useRef<PlaybackPosition>({
    barIndex: 0,
    chordIndex: 0,
    barProgress: 0,
    isActive: false,
    isCountingIn: false,
    countInProgress: 0,
  });

  const handleSelect = (barIndex: number, chordIndex: number) => {
    setCurrentPosition(barIndex, chordIndex);
  };

  useEffect(() => {
    barRefs.current.length = progression.bars.length;
    playheadRefs.current.length = progression.bars.length;
  }, [progression.bars.length]);

  usePlaybackPositionObserver({
    progression,
    isPlaying,
    countInBars: metronome.countIn,
    onPositionChange: (position) => {
      const previous = overlayStateRef.current;
      const previousBar =
        previous.isActive && !previous.isCountingIn
          ? barRefs.current[previous.barIndex]
          : null;
      const previousPlayhead =
        previous.isActive && !previous.isCountingIn
          ? playheadRefs.current[previous.barIndex]
          : null;

      if (
        previousBar &&
        (!position.isActive ||
          position.isCountingIn ||
          previous.barIndex !== position.barIndex)
      ) {
        previousBar.dataset.playing = "false";
      }

      if (
        previousPlayhead &&
        (!position.isActive ||
          position.isCountingIn ||
          previous.barIndex !== position.barIndex)
      ) {
        previousPlayhead.style.opacity = "0";
      }

      if (position.isActive && !position.isCountingIn) {
        const currentBar = barRefs.current[position.barIndex];
        const currentPlayhead = playheadRefs.current[position.barIndex];

        if (currentBar) {
          currentBar.dataset.playing = "true";
        }

        if (currentPlayhead) {
          currentPlayhead.style.opacity = "1";
          currentPlayhead.style.left = `${position.barProgress * 100}%`;
        }
      }

      overlayStateRef.current = position;
    },
  });

  useEffect(() => {
    return () => {
      for (const bar of barRefs.current) {
        if (bar) {
          bar.dataset.playing = "false";
        }
      }
      for (const playhead of playheadRefs.current) {
        if (playhead) {
          playhead.style.opacity = "0";
        }
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-1">
      {/* Progression bars - compact strip */}
      <div className="relative">
        <div className="flex flex-wrap items-center gap-1 pb-0.5">
          <PresetDropdown />
          <ProgressionName />

          {progression.bars.map((bar, barIndex) => {
            // Convert bar chords to string for editing
            const chordString = bar.chords.map((bc) => bc.chord).join(" ");

            return (
              <BarInput
                key={bar.id}
                barIndex={barIndex}
                chordString={chordString}
                isSelected={barIndex === currentBarIndex}
                selectedChordIndex={currentChordIndex}
                onSelect={handleSelect}
                onUpdate={updateBar}
                onRemove={removeBar}
                canRemove={progression.bars.length > 1}
                barRef={(node) => {
                  barRefs.current[barIndex] = node;
                }}
                playheadRef={(node) => {
                  playheadRefs.current[barIndex] = node;
                }}
              />
            );
          })}

          {/* Add bar button */}
          <Button
            variant="outline"
            size="sm"
            onClick={addBar}
            className="h-7 px-2 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>

          {/* Transpose buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => transposeProgression(-1)}
              className="h-7 w-7 p-0"
              aria-label="Transpose down"
              title="Transpose down one semitone"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => transposeProgression(1)}
              className="h-7 w-7 p-0"
              aria-label="Transpose up"
              title="Transpose up one semitone"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
          </div>

          {/* Time signature display */}
          <span className="text-xs text-muted-foreground shrink-0 ml-auto pl-2">
            {progression.timeSignature.numerator}/
            {progression.timeSignature.denominator}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/70">
        Click chord to select. Click{" "}
        <Pencil className="inline h-2.5 w-2.5 align-baseline" /> or double-click
        to edit. Spaces separate multiple chords.
      </p>
    </div>
  );
}
