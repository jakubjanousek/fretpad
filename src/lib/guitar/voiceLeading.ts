import type { Chord, GuitarVoicing } from "@/lib/types";

const MUTE_PENALTY = 3;

/**
 * Cost of transitioning between two voicings.
 * Lower cost = less hand movement.
 */
export function voicingTransitionCost(
  from: GuitarVoicing,
  to: GuitarVoicing,
): number {
  let cost = 0;

  for (const [i, fromPos] of from.positions.entries()) {
    const toPos = to.positions[i];
    if (!toPos) continue;
    const fromFret = fromPos.fret;
    const toFret = toPos.fret;

    const fromMuted = fromFret < 0;
    const toMuted = toFret < 0;

    if (fromMuted && toMuted) continue;
    if (fromMuted !== toMuted) {
      cost += MUTE_PENALTY;
      continue;
    }
    cost += Math.abs(fromFret - toFret);
  }

  return cost;
}

/**
 * Viterbi DP to find the minimum-cost voice-leading path through a progression.
 * Returns one voicing per chord position.
 */
export function computeVoiceLeadingPath(
  _chords: Chord[],
  voicingsPerChord: GuitarVoicing[][],
): GuitarVoicing[] {
  const T = voicingsPerChord.length;
  if (T === 0) return [];

  // Collect indices of non-empty groups for the DP
  const nonEmpty: number[] = [];
  for (let t = 0; t < T; t++) {
    const group = voicingsPerChord[t];
    if (group && group.length > 0) nonEmpty.push(t);
  }

  // If no groups have voicings, return empty placeholders
  if (nonEmpty.length === 0) return new Array<GuitarVoicing>(T);

  // Single non-empty group: just pick first voicing
  if (nonEmpty.length === 1) {
    const path = new Array<GuitarVoicing>(T);
    const idx = nonEmpty[0]!;
    path[idx] = voicingsPerChord[idx]![0]!;
    return path;
  }

  // Run Viterbi only on non-empty groups
  const groups = nonEmpty.map((t) => voicingsPerChord[t]!);

  // dpCost[s][j] = minimum cost to reach voicing j at step s
  const dpCost: number[][] = [];
  // dpBack[s][j] = index of best predecessor at step s-1
  const dpBack: number[][] = [];

  // Initialize step 0: slight bias toward mid-fretboard
  dpCost.push(groups[0]!.map((v) => Math.abs(v.baseFret - 5) * 0.1));
  dpBack.push(groups[0]!.map(() => -1));

  // Forward pass over non-empty groups
  for (let s = 1; s < groups.length; s++) {
    const current = groups[s]!;
    const prev = groups[s - 1]!;
    const prevCosts = dpCost[s - 1]!;
    const costs: number[] = [];
    const backs: number[] = [];

    for (let j = 0; j < current.length; j++) {
      let bestCost = Number.POSITIVE_INFINITY;
      let bestPrev = 0;
      const cur = current[j]!;

      for (let k = 0; k < prev.length; k++) {
        const p = prev[k]!;
        const transitionCost = voicingTransitionCost(p, cur);
        const totalCost = prevCosts[k]! + transitionCost;
        if (totalCost < bestCost) {
          bestCost = totalCost;
          bestPrev = k;
        }
      }

      costs.push(bestCost);
      backs.push(bestPrev);
    }

    dpCost.push(costs);
    dpBack.push(backs);
  }

  // Find best final voicing
  const S = groups.length;
  const lastCosts = dpCost[S - 1]!;
  let bestFinalIdx = 0;
  for (let j = 1; j < lastCosts.length; j++) {
    if (lastCosts[j]! < lastCosts[bestFinalIdx]!) {
      bestFinalIdx = j;
    }
  }

  // Backtrack into sparse path
  const path = new Array<GuitarVoicing>(T);
  path[nonEmpty[S - 1]!] = groups[S - 1]![bestFinalIdx]!;
  let idx = bestFinalIdx;
  for (let s = S - 1; s > 0; s--) {
    idx = dpBack[s]![idx]!;
    path[nonEmpty[s - 1]!] = groups[s - 1]![idx]!;
  }

  return path;
}
