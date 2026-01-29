import type { StyleDefinition, StyleId } from "@/lib/types";
import { balladStyle } from "./ballad";
import { bossaNovaStyle } from "./bossaNova";
import { countryStyle } from "./country";
import { funkStyle } from "./funk";
import { jazzSwingStyle } from "./jazzSwing";
import { latinMontunoStyle } from "./latinMontuno";
import { metalStyle } from "./metal";
import { neoSoulStyle } from "./neoSoul";
import { popRockStyle } from "./popRock";
import { reggaeStyle } from "./reggae";

/**
 * All available backing track styles
 */
export const AVAILABLE_STYLES: StyleDefinition[] = [
  jazzSwingStyle,
  popRockStyle,
  bossaNovaStyle,
  balladStyle,
  funkStyle,
  reggaeStyle,
  latinMontunoStyle,
  neoSoulStyle,
  countryStyle,
  metalStyle,
];

/**
 * Map of style ID to style definition for quick lookup
 */
export const STYLES_MAP: Record<StyleId, StyleDefinition> = {
  jazzSwing: jazzSwingStyle,
  popRock: popRockStyle,
  bossaNova: bossaNovaStyle,
  ballad: balladStyle,
  funk: funkStyle,
  reggae: reggaeStyle,
  latinMontuno: latinMontunoStyle,
  neoSoul: neoSoulStyle,
  country: countryStyle,
  metal: metalStyle,
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

export {
  jazzSwingStyle,
  popRockStyle,
  bossaNovaStyle,
  balladStyle,
  funkStyle,
  reggaeStyle,
  latinMontunoStyle,
  neoSoulStyle,
  countryStyle,
  metalStyle,
};
