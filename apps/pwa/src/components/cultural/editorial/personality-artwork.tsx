import { EditorialMotif } from "./editorial-motif";
import styles from "./editorial-artwork.module.css";

function initialsFromTitle(title: string): string {
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .filter((part) => !["da", "de", "do", "das", "dos", "e"].includes(part.toLocaleLowerCase("pt-BR")))
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("pt-BR"))
    .join("");

  return initials || "··";
}

export function PersonalityArtwork({
  title,
  initials,
}: {
  title: string;
  initials?: string;
}) {
  return (
    <div className={styles.monogramVisual}>
      <EditorialMotif motif="monogram" className={styles.motifSvg} />
      <strong className={styles.monogramInitials}>
        {initials ?? initialsFromTitle(title)}
      </strong>
    </div>
  );
}
