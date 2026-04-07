export const FEEDBACK_LAST_SHOWN_KEY = "fretpad-feedback-last-shown";
export const FEEDBACK_DISMISSED_KEY = "fretpad-feedback-dismissed";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_LOOPS = 3;

export function shouldShowFeedback(loopCount: number): boolean {
  if (loopCount < MIN_LOOPS) return false;

  if (localStorage.getItem(FEEDBACK_DISMISSED_KEY) === "true") return false;

  const lastShown = localStorage.getItem(FEEDBACK_LAST_SHOWN_KEY);
  if (lastShown) {
    const elapsed = Date.now() - Number(lastShown);
    if (elapsed <= SEVEN_DAYS_MS) return false;
  }

  return true;
}

export function recordFeedbackShown(): void {
  localStorage.setItem(FEEDBACK_LAST_SHOWN_KEY, String(Date.now()));
}

export function permanentlyDismissFeedback(): void {
  localStorage.setItem(FEEDBACK_DISMISSED_KEY, "true");
}
