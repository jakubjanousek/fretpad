import { beforeEach, describe, expect, it } from "vitest";
import { markTipSeen, selectTip, TIPS, TIPS_SEEN_KEY } from "@/lib/tips";

describe("selectTip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when the loop count matches no tip trigger", () => {
    // Pick a loop count that deliberately falls between triggers
    const triggers = TIPS.map((t) => t.triggerLoop);
    const gap = Math.max(...triggers) + 100;
    expect(selectTip(gap)).toBeNull();
  });

  it("returns the tip whose triggerLoop matches the current loop count", () => {
    for (const tip of TIPS) {
      localStorage.clear();
      expect(selectTip(tip.triggerLoop)).toEqual(tip);
    }
  });

  it("returns null for a tip that has already been marked seen", () => {
    const [first] = TIPS;
    if (!first) throw new Error("TIPS must contain at least one tip");
    markTipSeen(first.id);
    expect(selectTip(first.triggerLoop)).toBeNull();
  });

  it("still returns other tips at their own triggers when one has been seen", () => {
    if (TIPS.length < 2) return; // guard for single-tip config
    const [first, second] = TIPS;
    if (!first || !second) return;
    markTipSeen(first.id);
    expect(selectTip(second.triggerLoop)).toEqual(second);
  });
});

describe("markTipSeen", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists the seen tip id in localStorage", () => {
    markTipSeen("some-tip");
    const raw = localStorage.getItem(TIPS_SEEN_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string)).toContain("some-tip");
  });

  it("is idempotent — marking the same tip twice stores it once", () => {
    markTipSeen("dup");
    markTipSeen("dup");
    const raw = localStorage.getItem(TIPS_SEEN_KEY);
    const seen = JSON.parse(raw as string) as string[];
    expect(seen.filter((id) => id === "dup")).toHaveLength(1);
  });

  it("accumulates multiple distinct tips", () => {
    markTipSeen("a");
    markTipSeen("b");
    const seen = JSON.parse(
      localStorage.getItem(TIPS_SEEN_KEY) as string,
    ) as string[];
    expect(seen).toEqual(expect.arrayContaining(["a", "b"]));
  });
});
