export interface Tip {
  id: string;
  triggerLoop: number;
  text: string;
}

export const TIPS: readonly Tip[] = [
  {
    id: "ghost-notes",
    triggerLoop: 2,
    text: "The faint dots preview your next chord's guide tones — aim for them just before the change.",
  },
  {
    id: "voicings-mode",
    triggerLoop: 4,
    text: "Try Voicings mode to see voice-led chord shapes that minimize hand movement between chords.",
  },
  {
    id: "share-url",
    triggerLoop: 6,
    text: "Your URL contains this progression — copy it to share a practice session with someone else.",
  },
];

export const TIPS_SEEN_KEY = "fretpad-tips-seen";

function readSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(TIPS_SEEN_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeSeen(seen: Set<string>): void {
  localStorage.setItem(TIPS_SEEN_KEY, JSON.stringify([...seen]));
}

export function selectTip(loopCount: number): Tip | null {
  const seen = readSeen();
  return (
    TIPS.find((t) => t.triggerLoop === loopCount && !seen.has(t.id)) ?? null
  );
}

export function markTipSeen(tipId: string): void {
  const seen = readSeen();
  seen.add(tipId);
  writeSeen(seen);
}
