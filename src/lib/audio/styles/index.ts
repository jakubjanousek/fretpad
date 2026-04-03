import type { StyleDefinition, StyleId } from "@/lib/types";
import { jazzSwingStyle } from "./jazzSwing";
import { jazzSwingNaturalStyle } from "./jazzSwingNatural";

/**
 * All available backing track styles
 */
export const AVAILABLE_STYLES: StyleDefinition[] = [
  jazzSwingStyle,
  jazzSwingNaturalStyle,
];

/**
 * Gets a style definition by ID
 */
export function getStyle(id: StyleId): StyleDefinition {
  return AVAILABLE_STYLES.find((s) => s.id === id) ?? jazzSwingStyle;
}

/**
 * Default style ID
 */
export const DEFAULT_STYLE_ID: StyleId = "jazzSwing";

export { jazzSwingNaturalStyle, jazzSwingStyle };
