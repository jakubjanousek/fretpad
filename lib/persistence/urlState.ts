import { DEFAULT_SHARE_MODE } from "../modes";
import type { PracticeModeId, Progression } from "../types";
import { isValidProgression } from "./localStorage";

const URL_PARAM = "p";

/**
 * Shareable state subset - minimal state for URL sharing
 */
export interface ShareableState {
  progression: Progression;
  tempo: number;
}

/**
 * Encode shareable state to URL-safe base64
 */
export function encodeStateToUrl(state: ShareableState): string {
  const json = JSON.stringify(state);
  // Use base64url encoding (URL-safe)
  const base64 = btoa(json)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return base64;
}

/**
 * Decode shareable state from URL-safe base64
 */
export function decodeStateFromUrl(encoded: string): ShareableState | null {
  try {
    // Restore standard base64 padding
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padding = base64.length % 4;
    if (padding) {
      base64 += "=".repeat(4 - padding);
    }

    const json = atob(base64);
    const parsed = JSON.parse(json) as unknown;

    if (!isValidShareableState(parsed)) {
      console.warn("Invalid state in URL, ignoring");
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("Failed to decode state from URL:", error);
    return null;
  }
}

/**
 * Generate a shareable URL with encoded progression
 */
export function generateShareUrl(
  state: ShareableState,
  mode: PracticeModeId | null,
  origin?: string,
): string {
  const encoded = encodeStateToUrl(state);
  const url = new URL(origin ?? window.location.origin);
  url.pathname = `/practice/${mode ?? DEFAULT_SHARE_MODE}`;
  url.searchParams.set(URL_PARAM, encoded);
  return url.toString();
}

/**
 * Extract shareable state from current URL if present
 */
export function getStateFromUrl(): ShareableState | null {
  const url = new URL(window.location.href);
  const encoded = url.searchParams.get(URL_PARAM);
  if (!encoded) return null;
  return decodeStateFromUrl(encoded);
}

/**
 * Remove state parameter from URL without reloading
 */
export function clearUrlState(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(URL_PARAM);
  window.history.replaceState({}, "", url.toString());
}

/**
 * Export progression to text format
 * Example: | Dm7 | G7 | Cmaj7 | Cmaj7 |
 */
export function exportProgressionToText(progression: Progression): string {
  const bars = progression.bars.map((bar) => {
    if (bar.chords.length === 1) {
      return bar.chords[0]?.chord ?? "";
    }
    // Multiple chords in bar - join with space
    return bar.chords.map((c) => c.chord).join(" ");
  });

  return `| ${bars.join(" | ")} |`;
}

/**
 * Type guard for ShareableState
 */
function isValidShareableState(value: unknown): value is ShareableState {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return isValidProgression(obj.progression) && typeof obj.tempo === "number";
}
