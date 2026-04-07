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

  const firstGroup = voicingsPerChord[0];
  if (!firstGroup || firstGroup.length === 0) return [];
  const firstVoicing = firstGroup[0];
  if (!firstVoicing) return [];
  if (T === 1) return [firstVoicing];

  // dpCost[t][j] = minimum cost to reach voicing j at position t
  const dpCost: number[][] = [];
  // dpBack[t][j] = index of best predecessor at position t-1
  const dpBack: number[][] = [];

  // Initialize t=0: slight bias toward mid-fretboard
  dpCost.push(firstGroup.map((v) => Math.abs(v.baseFret - 5) * 0.1));
  dpBack.push(firstGroup.map(() => -1));

  // Forward pass
  for (let t = 1; t < T; t++) {
    const current = voicingsPerChord[t] ?? [];
    const prev = voicingsPerChord[t - 1] ?? [];
    const prevCosts = dpCost[t - 1] ?? [];
    const costs: number[] = [];
    const backs: number[] = [];

    for (let j = 0; j < current.length; j++) {
      let bestCost = Number.POSITIVE_INFINITY;
      let bestPrev = 0;
      const cur = current[j];
      if (!cur) continue;

      for (let k = 0; k < prev.length; k++) {
        const p = prev[k];
        if (!p) continue;
        const transitionCost = voicingTransitionCost(p, cur);
        const totalCost = (prevCosts[k] ?? 0) + transitionCost;
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
  const lastCosts = dpCost[T - 1] ?? [];
  let bestFinalIdx = 0;
  for (let j = 1; j < lastCosts.length; j++) {
    if ((lastCosts[j] ?? Infinity) < (lastCosts[bestFinalIdx] ?? Infinity)) {
      bestFinalIdx = j;
    }
  }

  // Backtrack
  const path: (GuitarVoicing | undefined)[] = new Array(T);
  const lastGroup = voicingsPerChord[T - 1] ?? [];
  path[T - 1] = lastGroup[bestFinalIdx];
  let idx = bestFinalIdx;
  for (let t = T - 1; t > 0; t--) {
    const backRow = dpBack[t] ?? [];
    idx = backRow[idx] ?? 0;
    const group = voicingsPerChord[t - 1] ?? [];
    path[t - 1] = group[idx];
  }

  return path.filter((v): v is GuitarVoicing => v !== undefined);
}
