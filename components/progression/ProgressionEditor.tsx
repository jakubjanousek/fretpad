"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlaybackPosition } from "@/hooks/usePlaybackPosition";
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
  isPlaying: boolean;
  playheadProgress: number;
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
  isPlaying,
  playheadProgress,
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
              "w-28 h-8 text-sm font-mono",
              error && "border-red-500 focus-visible:ring-red-500",
            )}
            autoFocus
          />
        ) : (
          <div
            role="button"
            tabIndex={0}
            className={cn(
              "relative flex flex-wrap items-center gap-y-0.5 border rounded-md px-1.5 py-1 cursor-pointer hover:border-primary/50 transition-all overflow-hidden",
              isSelected &&
                "border-primary ring-1 ring-primary/30 border-l-4 border-l-primary bg-primary/5",
              isPlaying &&
                "border-orange-400 bg-orange-500/10 ring-1 ring-orange-400/50 border-l-4 border-l-orange-500",
            )}
            onClick={() => setIsEditing(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsEditing(true);
              }
            }}
          >
            {/* Playhead indicator */}
            {isPlaying && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-orange-500 z-10 transition-none shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                style={{ left: `${playheadProgress * 100}%` }}
              />
            )}
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
                className={cn(
                  "px-2.5 py-1.5 text-sm font-mono rounded transition-colors relative z-0",
                  isSelected && selectedChordIndex === chordIdx
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                {chord}
              </button>
            ))}
            {/* Remove button - hover only */}
            {canRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(barIndex);
                }}
                className="ml-2 p-1.5 -m-1.5 rounded-md opacity-0 group-hover/bar:opacity-100 active:opacity-100 transition-opacity text-muted-foreground hover:text-destructive touch-target-expand"
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

  const playbackPosition = usePlaybackPosition({
    progression,
    isPlaying,
    countInBars: metronome.countIn,
  });

  const handleSelect = (barIndex: number, chordIndex: number) => {
    setCurrentPosition(barIndex, chordIndex);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {/* Progression bars - wrap on mobile, scroll on larger screens */}
      <div className="relative">
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
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
                isPlaying={
                  playbackPosition.isActive &&
                  !playbackPosition.isCountingIn &&
                  playbackPosition.barIndex === barIndex
                }
                playheadProgress={
                  !playbackPosition.isCountingIn &&
                  playbackPosition.barIndex === barIndex
                    ? playbackPosition.barProgress
                    : 0
                }
              />
            );
          })}

          {/* Add bar button */}
          <Button
            variant="outline"
            size="sm"
            onClick={addBar}
            className="h-10 px-3 shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>

          {/* Time signature display */}
          <span className="text-xs text-muted-foreground shrink-0 ml-auto pl-2">
            {progression.timeSignature.numerator}/
            {progression.timeSignature.denominator}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Click chord to select, click bar to edit. Use spaces for multiple chords
        (e.g., "Dm7 G7").
      </p>
    </div>
  );
}
