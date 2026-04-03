import type { StyleDefinition, StyleId } from "@/lib/types";
import { jazzSwingStyle } from "./jazzSwing";

/**
 * All available backing track styles
 */
export const AVAILABLE_STYLES: StyleDefinition[] = [jazzSwingStyle];

/**
 * Gets a style definition by ID
 */
export function getStyle(_id: StyleId): StyleDefinition {
  return jazzSwingStyle;
}

/**
 * Default style ID
 */
export const DEFAULT_STYLE_ID: StyleId = "jazzSwing";

export { jazzSwingStyle };
