import type { GrooveTemplate } from "@/lib/types";

export type { GrooveTemplate };

/**
 * Applies a groove template to a beat position within a bar.
 * Maps the beat to the subdivision grid, looks up the offset, and shifts the beat.
 * Interpolates for positions between subdivisions.
 * Positions beyond 4 beats wrap around.
 */
export function applyGrooveTemplate(
  beatInBar: number,
  template: GrooveTemplate,
): number {
  const beatsPerBar = 4;
  const subdivisionWidth = beatsPerBar / template.subdivisions;

  // Wrap to bar range
  const wrappedBeat = ((beatInBar % beatsPerBar) + beatsPerBar) % beatsPerBar;
  const barOffset = beatInBar - wrappedBeat;

  // Find which subdivision this beat falls on (continuous index)
  const subdivisionIndex = wrappedBeat / subdivisionWidth;
  const lowerIndex = Math.floor(subdivisionIndex);
  const fraction = subdivisionIndex - lowerIndex;

  const lowerOffset = template.offsets[lowerIndex % template.subdivisions] ?? 0;

  if (Math.abs(fraction) < 0.001) {
    // Exactly on a subdivision — use its offset directly
    return beatInBar + lowerOffset;
  }

  // Interpolate between two neighboring subdivisions
  const upperIndex = (lowerIndex + 1) % template.subdivisions;
  const upperOffset = template.offsets[upperIndex] ?? 0;
  const interpolatedOffset =
    lowerOffset + fraction * (upperOffset - lowerOffset);

  return barOffset + wrappedBeat + interpolatedOffset;
}
