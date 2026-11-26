/**
 * Server-side public facade for the cultural catalog.
 *
 * Pages may consume these functions, but client components must receive the
 * resulting DTOs — they must never import the editorial registry directly.
 */
import { culturalCatalog } from "./cultural-catalog";
import type { CulturalCategory } from "./cultural-catalog-model";
import {
  projectPublicCulturalEntries,
  type PublicCulturalEntry,
} from "./cultural-publication";

export function getPublicCulturalEntries(): PublicCulturalEntry[] {
  return projectPublicCulturalEntries(culturalCatalog);
}

export function getPublicCulturalEntriesByCategory(
  category: CulturalCategory,
): PublicCulturalEntry[] {
  return getPublicCulturalEntries().filter((entry) => entry.category === category);
}

export function getPublicCulturalEntryBySlug(
  category: CulturalCategory,
  slug: string,
): PublicCulturalEntry | undefined {
  return getPublicCulturalEntries().find(
    (entry) => entry.category === category && entry.slug === slug,
  );
}
