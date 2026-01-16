"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LEGEND_TOOLTIP_KEY = "fretflow-legend-tooltip-shown";

interface LegendStep {
  type: "root" | "guide" | "chord" | "scale";
  color: string;
  title: string;
  description: string;
}

const LEGEND_STEPS: LegendStep[] = [
  {
    type: "root",
    color: "bg-orange-500",
    title: "Root Notes",
    description:
      "Orange dots show the root - the foundation note that gives the chord its name. Start your phrases here for a solid sound.",
  },
  {
    type: "guide",
    color: "bg-blue-500",
    title: "Guide Tones",
    description:
      "Blue dots are the 3rd and 7th - they define major/minor quality and create smooth voice leading between chords.",
  },
  {
    type: "chord",
    color: "bg-emerald-500",
    title: "Chord Tones",
    description:
      "Green dots are other chord tones (5th, extensions). These are safe notes that will always sound good over the chord.",
  },
  {
    type: "scale",
    color: "bg-slate-400",
    title: "Scale Tones",
    description:
      "Gray dots are scale notes outside the chord. Use these as passing tones to connect chord tones melodically.",
  },
];

interface LegendTooltipProps {
  onHighlightChange: (type: "root" | "guide" | "chord" | "scale" | null) => void;
  onComplete: () => void;
}

export function LegendTooltip({
  onHighlightChange,
  onComplete,
}: LegendTooltipProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if tooltip has been shown before
    const hasShown = localStorage.getItem(LEGEND_TOOLTIP_KEY);
    if (!hasShown) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setIsVisible(true);
        onHighlightChange(LEGEND_STEPS[0]?.type ?? null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [onHighlightChange]);

  const handleNext = useCallback(() => {
    if (currentStep < LEGEND_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onHighlightChange(LEGEND_STEPS[nextStep]?.type ?? null);
    } else {
      // Complete the tour
      localStorage.setItem(LEGEND_TOOLTIP_KEY, "true");
      setIsVisible(false);
      onHighlightChange(null);
      onComplete();
    }
  }, [currentStep, onHighlightChange, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onHighlightChange(LEGEND_STEPS[prevStep]?.type ?? null);
    }
  }, [currentStep, onHighlightChange]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(LEGEND_TOOLTIP_KEY, "true");
    setIsVisible(false);
    onHighlightChange(null);
    onComplete();
  }, [onHighlightChange, onComplete]);

  if (!isVisible) return null;

  const step = LEGEND_STEPS[currentStep];
  if (!step) return null;

  const isLastStep = currentStep === LEGEND_STEPS.length - 1;

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-300"
        onClick={handleSkip}
      />

      {/* Tooltip card */}
      <div
        className={cn(
          "fixed z-50 bottom-24 left-1/2 -translate-x-1/2 w-80 max-w-[calc(100vw-2rem)]",
          "bg-popover border shadow-xl rounded-xl p-4",
          "animate-in fade-in slide-in-from-bottom-4 duration-300",
        )}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Skip guide"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-3">
          {LEGEND_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                i <= currentStep ? "bg-cyan-500" : "bg-muted",
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className={cn(
              "w-6 h-6 rounded-full shrink-0 mt-0.5",
              step.color,
              "animate-pulse",
            )}
          />
          <div>
            <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="h-8 px-2 text-xs"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <span className="text-xs text-muted-foreground">
            {currentStep + 1} of {LEGEND_STEPS.length}
          </span>

          <Button
            variant={isLastStep ? "default" : "ghost"}
            size="sm"
            onClick={handleNext}
            className={cn(
              "h-8 px-3 text-xs",
              isLastStep && "bg-cyan-500 hover:bg-cyan-600 text-white",
            )}
          >
            {isLastStep ? "Got it!" : "Next"}
            {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </>
  );
}

/**
 * Hook to check if the legend tooltip should be shown
 */
export function useLegendTooltipState() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const hasShown = localStorage.getItem(LEGEND_TOOLTIP_KEY);
    setShouldShow(!hasShown);
  }, []);

  const resetTooltip = useCallback(() => {
    localStorage.removeItem(LEGEND_TOOLTIP_KEY);
    setShouldShow(true);
  }, []);

  return { shouldShow, resetTooltip };
}
