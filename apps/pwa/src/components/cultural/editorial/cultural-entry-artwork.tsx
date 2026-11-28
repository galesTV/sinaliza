import type { PublicCulturalEntry } from "../../../data/cultural-publication";

import { adaptCulturalArtwork } from "./cultural-artwork-adapter";
import { CulturalEditorialArtwork } from "./cultural-editorial-artwork";
import type { EditorialArtworkVariant } from "./cultural-editorial-artwork";
import styles from "./editorial-artwork.module.css";

export function getCulturalArtworkFacts(entry: PublicCulturalEntry): string[] {
  const artwork = entry.artwork;
  if (!artwork) return [];
  if (artwork.motif === "timeline") {
    return artwork.events?.map((event) => `${event.year}: ${event.label}`) ?? [];
  }
  if (artwork.motif === "legal-document") {
    return [
      artwork.documentNumber ? `Documento ${artwork.documentNumber}` : undefined,
      artwork.documentDate ? `Data documental ${artwork.documentDate}` : undefined,
    ].filter((fact): fact is string => Boolean(fact));
  }
  if (artwork.motif === "academic" && artwork.volumeNumber) {
    return [`Volume ${artwork.volumeNumber}`];
  }
  return [];
}

export function CulturalArtworkFacts({
  entry,
}: {
  entry: PublicCulturalEntry;
}) {
  const facts = getCulturalArtworkFacts(entry);
  if (facts.length === 0) return null;

  return (
    <ul className="sr-only" aria-label="Fatos editoriais representados na arte">
      {facts.map((fact) => <li key={fact}>{fact}</li>)}
    </ul>
  );
}

export function CulturalEntryArtwork({
  entry,
  variant,
  fill = false,
  className,
  hideFooter = false,
  includeFacts = true,
}: {
  entry: PublicCulturalEntry;
  variant: EditorialArtworkVariant;
  fill?: boolean;
  className?: string;
  hideFooter?: boolean;
  includeFacts?: boolean;
}) {
  const props = adaptCulturalArtwork(entry, variant);
  if (!props) return null;

  return (
    <>
      <CulturalEditorialArtwork
        {...props}
        hideFooter={hideFooter}
        className={[fill ? styles.fillSurface : undefined, className]
          .filter(Boolean)
          .join(" ")}
      />
      {includeFacts && <CulturalArtworkFacts entry={entry} />}
    </>
  );
}
