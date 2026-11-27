import type { PublicCulturalEntry } from "../../../data/cultural-publication";

import { adaptCulturalArtwork } from "./cultural-artwork-adapter";
import { CulturalEditorialArtwork } from "./cultural-editorial-artwork";
import type { EditorialArtworkVariant } from "./cultural-editorial-artwork";
import styles from "./editorial-artwork.module.css";

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

  return (
    <CulturalEditorialArtwork
      {...props}
      className={[fill ? styles.fillSurface : undefined, className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
