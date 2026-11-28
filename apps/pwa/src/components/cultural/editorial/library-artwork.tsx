import { EditorialMotif } from "./editorial-motif";
import styles from "./editorial-artwork.module.css";

export interface AcademicArtworkProps {
  motif: "academic";
  volumeNumber?: string;
  volumeLabel?: string;
  metadataLabel?: string;
}

export interface LiteraryArtworkProps {
  motif: "literary";
  metadataLabel?: string;
}

export type LibraryArtworkProps = AcademicArtworkProps | LiteraryArtworkProps;

export function LibraryArtwork(props: LibraryArtworkProps) {
  if (props.motif === "academic") {
    return (
      <div className={styles.libraryVisual}>
        <EditorialMotif motif="academic" className={styles.motifSvg} />
        {props.volumeNumber ? (
          <strong className={styles.academicVolumeNumber}>{props.volumeNumber}</strong>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.libraryVisual}>
      <EditorialMotif motif="literary" className={styles.motifSvg} />
    </div>
  );
}
