"use client";

import { useEffect, useRef } from "react";
import { decodeStateFromUrl } from "@/lib/persistence";
import { parseProgression } from "@/lib/theory";
import type { Progression } from "@/lib/types";
import { useAppStore } from "@/state/useAppStore";

const DEFAULT_TEMPO = 120;

interface UrlState {
  progression: Progression;
  tempo: number;
}

/**
 * Build readable URL search params from progression state.
 * Format: ?chords=Dm7|G7|Cmaj7|Cmaj7&tempo=140
 * Multi-chord bars use spaces: ?chords=Dm7 G7|Cmaj7
 * Tempo is omitted when it equals the default (120).
 */
export function buildUrlParams(
  progression: Progression,
  tempo: number,
): URLSearchParams {
  const params = new URLSearchParams();

  const chordsStr = progression.bars
    .map((bar) => bar.chords.map((c) => c.chord).join(" "))
    .join("|");
  params.set("chords", chordsStr);

  if (tempo !== DEFAULT_TEMPO) {
    params.set("tempo", String(tempo));
  }

  return params;
}

/**
 * Parse URL search params back into progression state.
 * Returns null if params are missing or invalid.
 */
export function parseUrlParams(params: URLSearchParams): UrlState | null {
  const chordsStr = params.get("chords");
  if (!chordsStr) return null;

  // parseProgression handles pipe-separated format natively
  const progression = parseProgression(chordsStr, {
    name: "Shared Progression",
  });
  if (!progression) return null;

  const tempoStr = params.get("tempo");
  let tempo = DEFAULT_TEMPO;
  if (tempoStr) {
    const parsed = Number(tempoStr);
    if (!Number.isNaN(parsed) && parsed > 0) {
      tempo = parsed;
    }
  }

  return { progression, tempo };
}

/**
 * Build a readable query string without encoding pipes.
 * URLSearchParams encodes | to %7C which defeats readability.
 */
export function buildQueryString(
  progression: Progression,
  tempo: number,
): string {
  const chordsStr = progression.bars
    .map((bar) => bar.chords.map((c) => c.chord).join(" "))
    .join("|");
  const parts = [
    `chords=${encodeURIComponent(chordsStr).replace(/%7C/gi, "|")}`,
  ];
  if (tempo !== DEFAULT_TEMPO) {
    parts.push(`tempo=${tempo}`);
  }
  return parts.join("&");
}

/**
 * Write progression + tempo into the URL search params via replaceState.
 */
export function syncStateToUrl(progression: Progression, tempo: number): void {
  const url = new URL(window.location.href);
  url.search = buildQueryString(progression, tempo);
  window.history.replaceState({}, "", url.toString());
}

/**
 * Two-way sync between Zustand store and URL.
 * - On mount: reads ?chords= and applies to store
 * - On progression/tempo change: writes back to URL
 * Returns whether URL state was found on mount.
 */
export function useUrlSync(): boolean {
  const hasLoadedRef = useRef(false);
  const hadUrlState = useRef(false);
  const setProgression = useAppStore((s) => s.setProgression);
  const setTempo = useAppStore((s) => s.setTempo);
  const progression = useAppStore((s) => s.progression);
  const tempo = useAppStore((s) => s.tempo);

  // Read from URL on mount (once)
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    // Try new readable format first, fall back to legacy base64
    const urlState =
      parseUrlParams(params) ??
      (params.has("p") ? decodeStateFromUrl(params.get("p") ?? "") : null);
    if (urlState) {
      hadUrlState.current = true;
      setProgression(urlState.progression);
      setTempo(urlState.tempo);
    }
  }, [setProgression, setTempo]);

  // Write to URL on every state change
  useEffect(() => {
    syncStateToUrl(progression, tempo);
  }, [progression, tempo]);

  return hadUrlState.current;
}
