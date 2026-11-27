import type { PublicCulturalEntry } from "../../../data/cultural-publication";

import type {
  CulturalEditorialArtworkProps,
  EditorialArtworkVariant,
} from "./cultural-editorial-artwork";

export const SINALIZA_EDITORIAL_REPRESENTATION_LABEL =
  "Representação editorial do Sinaliza";

function libraryMetadataLabel(entry: Extract<PublicCulturalEntry, { category: "library" }>) {
  const parts = [
    entry.library.creators?.filter(Boolean).join(", "),
    entry.library.publicationYear?.toString(),
    entry.library.publisher,
  ].filter((part): part is string => Boolean(part?.trim()));
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

function historyYearLabel(entry: Extract<PublicCulturalEntry, { category: "history" }>) {
  return entry.history.year?.toString() ?? entry.history.dateLabel;
}

/**
 * Pure presentation adapter from the public DTO to isolated artwork props.
 * It intentionally returns undefined when artwork is absent or incompatible,
 * preserving the existing visual fallback instead of guessing.
 */
export function adaptCulturalArtwork(
  entry: PublicCulturalEntry,
  variant: EditorialArtworkVariant = "card",
): CulturalEditorialArtworkProps | undefined {
  const artwork = entry.artwork;
  if (!artwork) return undefined;

  const base = {
    category: entry.category,
    variant,
    title: entry.title,
    representationLabel: SINALIZA_EDITORIAL_REPRESENTATION_LABEL,
  } as const;

  if (entry.category === "history" && artwork.motif === "timeline") {
    return {
      ...base,
      motif: "timeline",
      ...(historyYearLabel(entry) ? { yearLabel: historyYearLabel(entry) } : {}),
      ...(artwork.events
        ? { events: artwork.events.map((event) => `${event.year} — ${event.label}`) }
        : {}),
    };
  }

  if (entry.category === "history" && artwork.motif === "legal-document") {
    return {
      ...base,
      motif: "legal-document",
      ...(historyYearLabel(entry) ? { yearLabel: historyYearLabel(entry) } : {}),
      ...(artwork.documentNumber ? { documentNumber: artwork.documentNumber } : {}),
      ...(artwork.documentDate ? { documentDate: artwork.documentDate } : {}),
    };
  }

  if (
    entry.category === "curiosity" &&
    (artwork.motif === "diversity-orbits" ||
      artwork.motif === "parallel-structures" ||
      artwork.motif === "visual-rhythm")
  ) {
    return { ...base, motif: artwork.motif };
  }

  if (entry.category === "personality" && artwork.motif === "monogram") {
    return {
      ...base,
      motif: "monogram",
      ...(artwork.initials ? { initials: artwork.initials } : {}),
    };
  }

  if (entry.category === "library" && artwork.motif === "academic") {
    return {
      ...base,
      motif: "academic",
      ...(artwork.volumeNumber ? { volumeNumber: artwork.volumeNumber } : {}),
      ...(libraryMetadataLabel(entry)
        ? { metadataLabel: libraryMetadataLabel(entry) }
        : {}),
    };
  }

  if (entry.category === "library" && artwork.motif === "literary") {
    return {
      ...base,
      motif: "literary",
      ...(libraryMetadataLabel(entry)
        ? { metadataLabel: libraryMetadataLabel(entry) }
        : {}),
    };
  }

  return undefined;
}
