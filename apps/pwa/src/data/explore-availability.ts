import "server-only";

import { getPublicCulturalEntries } from "./cultural-public";

/**
 * Conservative launch gate for the Explore section. Public navigation only
 * appears after an explicit deployment authorization AND at least one
 * publishable record exists in the cultural catalog. Empty categories remain
 * honest preparation states; no candidate data participates in this check.
 */
export function isExploreNavigationAvailable(): boolean {
  const explicitlyAuthorized = process.env.SINALIZA_EXPLORE_LAUNCHED === "true";
  if (!explicitlyAuthorized) return false;

  return getPublicCulturalEntries().length > 0;
}
