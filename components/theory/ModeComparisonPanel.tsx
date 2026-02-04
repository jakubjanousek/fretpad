"use client";

import { ArrowLeft, Volume2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { playScalePreview, stopPreview } from "@/lib/audio/preview";
import {
  AVAILABLE_MODES,
  compareModes,
  formatModeName,
  MODE_COMPARISON_PRESETS,
} from "@/lib/theory/modeComparison";
import { getModeDescription } from "@/lib/theory/modeDescriptions";
import type { ModeComparisonFretboardView, NoteName } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/useAppStore";

interface ModeComparisonPanelProps {
  root: NoteName;
  onBack?: () => void;
  initialMode1?: string;
  initialMode2?: string;
}

export function ModeComparisonPanel({
  root,
  onBack,
  initialMode1 = "dorian",
  initialMode2 = "aeolian",
}: ModeComparisonPanelProps) {
  const [mode1Type, setMode1Type] = useState(initialMode1);
  const [mode2Type, setMode2Type] = useState(initialMode2);
  const [playingScale, setPlayingScale] = useState<string | null>(null);

  const modeComparison = useAppStore((state) => state.modeComparison);
  const setModeComparison = useAppStore((state) => state.setModeComparison);
  const modeComparisonView = useAppStore((state) => state.modeComparisonView);
  const setModeComparisonView = useAppStore(
    (state) => state.setModeComparisonView,
  );

  const mode1FullName = `${root} ${mode1Type}`;
  const mode2FullName = `${root} ${mode2Type}`;

  const comparison = compareModes(mode1FullName, mode2FullName);
  const mode1Desc = getModeDescription(mode1Type);
  const mode2Desc = getModeDescription(mode2Type);

  const handlePlayScale = async (scale: string) => {
    if (playingScale === scale) {
      stopPreview();
      setPlayingScale(null);
      return;
    }
    setPlayingScale(scale);
    await playScalePreview(scale, 2);
    setPlayingScale(null);
  };

  const handlePresetClick = (preset: (typeof MODE_COMPARISON_PRESETS)[0]) => {
    setMode1Type(preset.mode1Type);
    setMode2Type(preset.mode2Type);
    // Update global state for fretboard overlay
    setModeComparison({
      mode1: `${root} ${preset.mode1Type}`,
      mode2: `${root} ${preset.mode2Type}`,
    });
  };

  const handleModeChange = (which: "mode1" | "mode2", value: string) => {
    if (which === "mode1") {
      setMode1Type(value);
      setModeComparison({
        mode1: `${root} ${value}`,
        mode2: modeComparison.mode2,
      });
    } else {
      setMode2Type(value);
      setModeComparison({
        mode1: modeComparison.mode1,
        mode2: `${root} ${value}`,
      });
    }
  };

  const handleViewChange = (view: ModeComparisonFretboardView) => {
    setModeComparisonView(view);
  };

  if (!comparison) {
    return (
      <div className="text-sm text-muted-foreground">
        Unable to compare these modes
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      {/* Top row: Mode Selectors + Quick Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mode Selectors */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">
            Compare Modes
          </h4>
          <div className="flex items-center gap-2">
            <Select
              value={mode1Type}
              onValueChange={(v) => handleModeChange("mode1", v)}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode} className="text-xs">
                    {root} {formatModeName(mode)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">vs</span>
            <Select
              value={mode2Type}
              onValueChange={(v) => handleModeChange("mode2", v)}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode} className="text-xs">
                    {root} {formatModeName(mode)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">
            Quick Presets
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {MODE_COMPARISON_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  "px-2 py-1 rounded text-[10px] font-medium transition-colors",
                  "border hover:bg-secondary",
                  mode1Type === preset.mode1Type &&
                    mode2Type === preset.mode2Type
                    ? "border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300"
                    : "border-transparent bg-secondary/50",
                )}
                title={preset.description}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content grid: Interval Table + Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Interval Table */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">
            Interval Comparison
          </h4>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-2 py-1.5 text-left font-medium">Deg</th>
                  <th className="px-2 py-1.5 text-left font-medium">
                    {formatModeName(mode1Type)}
                  </th>
                  <th className="px-2 py-1.5 text-left font-medium">
                    {formatModeName(mode2Type)}
                  </th>
                  <th className="px-2 py-1.5 text-left font-medium">Diff</th>
                </tr>
              </thead>
              <tbody>
                {comparison.intervals.map((interval) => (
                  <tr
                    key={interval.degree}
                    className={cn(
                      "border-t border-border/50",
                      interval.isDifferent && "bg-orange-500/5",
                    )}
                  >
                    <td className="px-2 py-1.5 font-mono text-muted-foreground">
                      {interval.degreeLabel}
                    </td>
                    <td
                      className={cn(
                        "px-2 py-1.5 font-mono",
                        interval.isDifferent &&
                          "text-blue-600 dark:text-blue-400",
                      )}
                    >
                      {interval.mode1Note}
                    </td>
                    <td
                      className={cn(
                        "px-2 py-1.5 font-mono",
                        interval.isDifferent &&
                          "text-purple-600 dark:text-purple-400",
                      )}
                    >
                      {interval.mode2Note}
                    </td>
                    <td className="px-2 py-1.5">
                      {interval.isDifferent && (
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 border-orange-500/50 text-orange-600 dark:text-orange-400"
                        >
                          {interval.differenceDescription || "differs"}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Key Difference + Descriptions + Controls */}
        <div className="space-y-4">
          {/* Key Difference */}
          <div className="rounded-md bg-violet-500/5 border border-violet-500/20 p-3">
            <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
              Key Difference
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {comparison.keyDifference}
            </p>
          </div>

          {/* Mode Descriptions */}
          <div className="space-y-2">
            {mode1Desc && (
              <div className="text-xs">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {mode1Desc.name}:
                </span>{" "}
                <span className="text-muted-foreground">
                  {mode1Desc.character}
                </span>
              </div>
            )}
            {mode2Desc && (
              <div className="text-xs">
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  {mode2Desc.name}:
                </span>{" "}
                <span className="text-muted-foreground">
                  {mode2Desc.character}
                </span>
              </div>
            )}
          </div>

          {/* Shared Notes Summary */}
          {comparison.sharedNotes.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                Shared Notes ({comparison.sharedNotes.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {comparison.sharedNotes.map((note, i) => (
                  <Badge
                    key={`shared-${note}-${i}`}
                    variant="outline"
                    className="font-mono text-[10px] px-1.5 py-0"
                  >
                    {note}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Fretboard View + Audio Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fretboard View Toggle */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">
            Fretboard View
          </h4>
          <div className="inline-flex rounded-md border p-0.5 gap-0.5">
            {(["mode1", "mode2", "both"] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => handleViewChange(view)}
                className={cn(
                  "px-3 py-1 rounded text-xs font-medium transition-colors",
                  modeComparisonView === view
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                {view === "mode1" && formatModeName(mode1Type)}
                {view === "mode2" && formatModeName(mode2Type)}
                {view === "both" && "Both"}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {modeComparisonView === "both"
              ? "Shared notes in grey, unique notes colored"
              : `Showing full ${modeComparisonView === "mode1" ? formatModeName(mode1Type) : formatModeName(mode2Type)} scale`}
          </p>
        </div>

        {/* Audio Preview */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">
            Hear the Difference
          </h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePlayScale(mode1FullName)}
              className={cn(
                "h-7 px-2 text-xs gap-1",
                playingScale === mode1FullName &&
                  "border-blue-500 text-blue-600 dark:text-blue-400",
              )}
            >
              <Volume2
                className={cn(
                  "w-3 h-3",
                  playingScale === mode1FullName && "animate-pulse",
                )}
              />
              {root} {formatModeName(mode1Type)}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePlayScale(mode2FullName)}
              className={cn(
                "h-7 px-2 text-xs gap-1",
                playingScale === mode2FullName &&
                  "border-purple-500 text-purple-600 dark:text-purple-400",
              )}
            >
              <Volume2
                className={cn(
                  "w-3 h-3",
                  playingScale === mode2FullName && "animate-pulse",
                )}
              />
              {root} {formatModeName(mode2Type)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
