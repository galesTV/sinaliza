import { EditorialMotif } from "./editorial-motif";
import styles from "./editorial-artwork.module.css";

export type ConceptArtworkMotif =
  | "diversity-orbits"
  | "parallel-structures"
  | "visual-rhythm";

export function ConceptArtwork({ motif }: { motif: ConceptArtworkMotif }) {
  return (
    <div className={styles.conceptVisual}>
      <EditorialMotif motif={motif} className={styles.motifSvg} />
    </div>
  );
}
