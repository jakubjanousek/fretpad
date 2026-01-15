"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {/* Bar number */}
        <span className="text-xs text-muted-foreground w-4 text-right">
          {barIndex + 1}
        </span>

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
              "w-32 h-8 text-sm font-mono",
              error && "border-red-500 focus-visible:ring-red-500",
            )}
            autoFocus
          />
        ) : (
          <div
            role="button"
            tabIndex={0}
            className={cn(
              "flex items-center gap-0.5 border rounded-md px-1 py-0.5 min-w-[8rem] cursor-pointer hover:border-primary/50 transition-colors",
              isSelected && "border-primary ring-1 ring-primary/30",
            )}
            onClick={() => setIsEditing(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsEditing(true);
              }
            }}
          >
            {chords.map((chord, chordIdx) => (
              <button
                key={chordIdx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChordClick(chordIdx);
                }}
                className={cn(
                  "px-2 py-1 text-sm font-mono rounded transition-colors",
                  isSelected && selectedChordIndex === chordIdx
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                {chord}
              </button>
            ))}
          </div>
        )}

        {/* Remove button */}
        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(barIndex)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="Remove bar"
              role="img"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && <span className="text-xs text-red-500 ml-5">{error}</span>}
    </div>
  );
}

export function ProgressionEditor() {
  const progression = useAppStore((state) => state.progression);
  const currentBarIndex = useAppStore((state) => state.currentBarIndex);
  const currentChordIndex = useAppStore((state) => state.currentChordIndex);
  const setCurrentPosition = useAppStore((state) => state.setCurrentPosition);
  const updateBar = useAppStore((state) => state.updateBar);
  const addBar = useAppStore((state) => state.addBar);
  const removeBar = useAppStore((state) => state.removeBar);

  const handleSelect = (barIndex: number, chordIndex: number) => {
    setCurrentPosition(barIndex, chordIndex);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Progression
        </h3>
        <span className="text-xs text-muted-foreground">
          {progression.timeSignature.numerator}/
          {progression.timeSignature.denominator} time
        </span>
      </div>

      <div className="flex flex-wrap items-start gap-2">
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
            />
          );
        })}

        {/* Add bar button */}
        <Button
          variant="outline"
          size="sm"
          onClick={addBar}
          className="h-8 text-xs"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
            aria-label="Add"
            role="img"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Bar
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Click a chord to select it. Click a bar to edit. Use spaces for multiple
        chords per bar (e.g., "Dm7 G7").
      </p>
    </div>
  );
}
