import type { StyleDefinition, StyleId } from "@/lib/types";
import { jazzSwingStyle } from "./jazzSwing";
import { popRockStyle } from "./popRock";

/**
 * All available backing track styles
 */
export const AVAILABLE_STYLES: StyleDefinition[] = [
  jazzSwingStyle,
  popRockStyle,
];

/**
 * Map of style ID to style definition for quick lookup
 */
export const STYLES_MAP: Record<StyleId, StyleDefinition> = {
  jazzSwing: jazzSwingStyle,
  popRock: popRockStyle,
};

/**
 * Gets a style definition by ID
 */
export function getStyle(id: StyleId): StyleDefinition {
  return STYLES_MAP[id];
}

/**
 * Default style ID
 */
export const DEFAULT_STYLE_ID: StyleId = "jazzSwing";

export { jazzSwingStyle, popRockStyle };
