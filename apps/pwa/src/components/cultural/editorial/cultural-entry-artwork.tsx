import type { PublicCulturalEntry } from "../../../data/cultural-publication";

import { adaptCulturalArtwork } from "./cultural-artwork-adapter";
import { CulturalEditorialArtwork } from "./cultural-editorial-artwork";
import type { EditorialArtworkVariant } from "./cultural-editorial-artwork";
import styles from "./editorial-artwork.module.css";

function artworkFacts(entry: PublicCulturalEntry): string[] {
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

export function CulturalEntryArtwork({
  entry,
  variant,
  fill = false,
  className,
}: {
  entry: PublicCulturalEntry;
  variant: EditorialArtworkVariant;
  fill?: boolean;
  className?: string;
}) {
  const props = adaptCulturalArtwork(entry, variant);
  if (!props) return null;
  const facts = artworkFacts(entry);

  return (
    <>
      <CulturalEditorialArtwork
        {...props}
        className={[fill ? styles.fillSurface : undefined, className]
          .filter(Boolean)
          .join(" ")}
      />
      {facts.length > 0 && (
        <ul className="sr-only" aria-label="Fatos editoriais representados na arte">
          {facts.map((fact) => <li key={fact}>{fact}</li>)}
        </ul>
      )}
    </>
  );
}
