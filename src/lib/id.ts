/**
 * Generates a unique ID using crypto.randomUUID()
 * Falls back to a random string if crypto is not available (e.g., in older browsers)
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 11)}`;
}
