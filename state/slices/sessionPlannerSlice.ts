import type { StateCreator } from "zustand";
import type { PRESET_PROGRESSIONS } from "@/lib/theory/presets";
import type { StyleId } from "@/lib/types";
import type { AppState } from "../useAppStore";

export type SessionPhase = "warmup" | "technique" | "improv" | "cooldown";

export interface PhaseConfig {
  phase: SessionPhase;
  label: string;
  description: string;
  durationMinutes: number;
  suggestedTempo: number;
  suggestedStyle: StyleId;
  suggestedPreset: keyof typeof PRESET_PROGRESSIONS;
  tip: string;
}

export const SESSION_PHASES: PhaseConfig[] = [
  {
    phase: "warmup",
    label: "Warmup",
    description: "Slow chromatic runs and simple changes",
    durationMinutes: 5,
    suggestedTempo: 70,
    suggestedStyle: "ballad",
    suggestedPreset: "I-V-vi-IV in C",
    tip: "Focus on clean, even tone. No rushing.",
  },
  {
    phase: "technique",
    label: "Technique",
    description: "Chord tones and scale patterns",
    durationMinutes: 10,
    suggestedTempo: 100,
    suggestedStyle: "bossaNova",
    suggestedPreset: "ii-V-I in C",
    tip: "Target guide tones (3rds & 7ths) on each chord change.",
  },
  {
    phase: "improv",
    label: "Improv",
    description: "Free improvisation over changes",
    durationMinutes: 15,
    suggestedTempo: 120,
    suggestedStyle: "jazzSwing",
    suggestedPreset: "Autumn Leaves (A section)",
    tip: "Play melodically — sing what you play in your head.",
  },
  {
    phase: "cooldown",
    label: "Cooldown",
    description: "Relaxed playing and reflection",
    durationMinutes: 5,
    suggestedTempo: 80,
    suggestedStyle: "ballad",
    suggestedPreset: "Dorian Vamp (Dm7)",
    tip: "Explore chord tones slowly. Let notes ring.",
  },
];

export interface SessionPlannerSlice {
  sessionActive: boolean;
  sessionPhaseIndex: number;
  sessionPhaseElapsedMs: number;
  sessionTotalElapsedMs: number;
  sessionPaused: boolean;

  startSession: () => void;
  startSessionAtPhase: (index: number) => void;
  endSession: () => void;
  advancePhase: () => void;
  goToPhase: (index: number) => void;
  tickSessionTimer: (deltaMs: number) => void;
  toggleSessionPause: () => void;
}

export const createSessionPlannerSlice: StateCreator<
  AppState,
  [],
  [],
  SessionPlannerSlice
> = (set, get) => ({
  sessionActive: false,
  sessionPhaseIndex: 0,
  sessionPhaseElapsedMs: 0,
  sessionTotalElapsedMs: 0,
  sessionPaused: false,

  startSession: () => {
    set({
      sessionActive: true,
      sessionPhaseIndex: 0,
      sessionPhaseElapsedMs: 0,
      sessionTotalElapsedMs: 0,
      sessionPaused: false,
    });

    // Apply first phase settings
    const phase = SESSION_PHASES[0];
    if (phase) {
      get().setTempo(phase.suggestedTempo);
      get().setSelectedStyle(phase.suggestedStyle);
      get().loadPreset(phase.suggestedPreset);
    }
  },

  startSessionAtPhase: (index: number) => {
    if (index < 0 || index >= SESSION_PHASES.length) return;

    set({
      sessionActive: true,
      sessionPhaseIndex: index,
      sessionPhaseElapsedMs: 0,
      sessionTotalElapsedMs: 0,
      sessionPaused: false,
    });

    const phase = SESSION_PHASES[index];
    if (phase) {
      get().setTempo(phase.suggestedTempo);
      get().setSelectedStyle(phase.suggestedStyle);
      get().loadPreset(phase.suggestedPreset);
    }
  },

  endSession: () => {
    set({
      sessionActive: false,
      sessionPhaseIndex: 0,
      sessionPhaseElapsedMs: 0,
      sessionTotalElapsedMs: 0,
      sessionPaused: false,
    });
  },

  advancePhase: () => {
    const { sessionPhaseIndex } = get();
    const nextIndex = sessionPhaseIndex + 1;

    if (nextIndex >= SESSION_PHASES.length) {
      // Session complete
      set({
        sessionActive: false,
        sessionPhaseIndex: 0,
        sessionPhaseElapsedMs: 0,
        sessionPaused: false,
      });
      return;
    }

    set({
      sessionPhaseIndex: nextIndex,
      sessionPhaseElapsedMs: 0,
    });

    const phase = SESSION_PHASES[nextIndex];
    if (phase) {
      get().setTempo(phase.suggestedTempo);
      get().setSelectedStyle(phase.suggestedStyle);
      get().loadPreset(phase.suggestedPreset);
    }
  },

  goToPhase: (index: number) => {
    if (index < 0 || index >= SESSION_PHASES.length) return;

    set({
      sessionPhaseIndex: index,
      sessionPhaseElapsedMs: 0,
    });

    const phase = SESSION_PHASES[index];
    if (phase) {
      get().setTempo(phase.suggestedTempo);
      get().setSelectedStyle(phase.suggestedStyle);
      get().loadPreset(phase.suggestedPreset);
    }
  },

  tickSessionTimer: (deltaMs: number) => {
    const { sessionActive, sessionPaused } = get();
    if (!sessionActive || sessionPaused) return;

    set((state) => ({
      sessionPhaseElapsedMs: state.sessionPhaseElapsedMs + deltaMs,
      sessionTotalElapsedMs: state.sessionTotalElapsedMs + deltaMs,
    }));
  },

  toggleSessionPause: () => {
    set((state) => ({ sessionPaused: !state.sessionPaused }));
  },
});
