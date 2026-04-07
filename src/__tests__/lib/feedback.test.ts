import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FEEDBACK_DISMISSED_KEY,
  FEEDBACK_LAST_SHOWN_KEY,
  permanentlyDismissFeedback,
  recordFeedbackShown,
  shouldShowFeedback,
} from "@/lib/feedback";

describe("shouldShowFeedback", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns false when loopCount is less than 3", () => {
    expect(shouldShowFeedback(0)).toBe(false);
    expect(shouldShowFeedback(1)).toBe(false);
    expect(shouldShowFeedback(2)).toBe(false);
  });

  it("returns true when loopCount is 3 or more and no prior feedback", () => {
    expect(shouldShowFeedback(3)).toBe(true);
    expect(shouldShowFeedback(10)).toBe(true);
  });

  it("returns false when permanently dismissed", () => {
    permanentlyDismissFeedback();
    expect(shouldShowFeedback(5)).toBe(false);
  });

  it("returns false when shown within the last 7 days", () => {
    vi.setSystemTime(new Date("2026-04-01T12:00:00Z"));
    recordFeedbackShown();

    vi.setSystemTime(new Date("2026-04-07T12:00:00Z"));
    expect(shouldShowFeedback(5)).toBe(false);
  });

  it("returns true when more than 7 days have passed since last shown", () => {
    vi.setSystemTime(new Date("2026-04-01T12:00:00Z"));
    recordFeedbackShown();

    vi.setSystemTime(new Date("2026-04-08T12:00:01Z"));
    expect(shouldShowFeedback(5)).toBe(true);
  });
});

describe("recordFeedbackShown", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stores the current timestamp in localStorage", () => {
    vi.setSystemTime(new Date("2026-04-07T10:00:00Z"));
    recordFeedbackShown();
    expect(localStorage.getItem(FEEDBACK_LAST_SHOWN_KEY)).toBe(
      String(new Date("2026-04-07T10:00:00Z").getTime()),
    );
  });
});

describe("permanentlyDismissFeedback", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("sets the dismissed flag in localStorage", () => {
    permanentlyDismissFeedback();
    expect(localStorage.getItem(FEEDBACK_DISMISSED_KEY)).toBe("true");
  });
});
