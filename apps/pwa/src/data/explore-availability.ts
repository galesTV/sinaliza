import "server-only";

import { CULTURAL_CATEGORIES } from "./cultural-catalog-model";
import { getPublicCulturalEntriesByCategory } from "./cultural-public";

/**
 * Conservative launch gate for the Explore section. Public navigation only
 * appears after an explicit deployment authorization AND at least one
 * publishable record exists in every cultural category. Direct routes remain
 * honest empty/category pages; no candidate data participates in this check.
 */
export function isExploreNavigationAvailable(): boolean {
  const explicitlyAuthorized = process.env.SINALIZA_EXPLORE_LAUNCHED === "true";
  if (!explicitlyAuthorized) return false;

  return CULTURAL_CATEGORIES.every(
    (category) => getPublicCulturalEntriesByCategory(category).length > 0,
  );
}
