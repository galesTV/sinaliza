import { ConceptArtwork, type ConceptArtworkMotif } from "./concept-artwork";
import {
  getEditorialPaletteStyle,
  type EditorialCategory,
} from "./editorial-palettes";
import styles from "./editorial-artwork.module.css";
import {
  HistoricalArtwork,
  type LegalDocumentArtworkProps,
  type TimelineArtworkProps,
} from "./historical-artwork";
import {
  LibraryArtwork,
  type AcademicArtworkProps,
  type LiteraryArtworkProps,
} from "./library-artwork";
import { PersonalityArtwork } from "./personality-artwork";

export type EditorialArtworkVariant =
  | "card"
  | "thumbnail"
  | "detail"
  | "book-cover"
  | "book-spine";

export type EditorialArtworkMotif =
  | TimelineArtworkProps["motif"]
  | LegalDocumentArtworkProps["motif"]
  | ConceptArtworkMotif
  | "monogram"
  | AcademicArtworkProps["motif"]
  | LiteraryArtworkProps["motif"];

interface EditorialArtworkBaseProps {
  category: EditorialCategory;
  variant?: EditorialArtworkVariant;
  title: string;
  eyebrow?: string;
  descriptor?: string;
  representationLabel?: string;
  className?: string;
}

export type CulturalEditorialArtworkProps = EditorialArtworkBaseProps &
  (
    | TimelineArtworkProps
    | LegalDocumentArtworkProps
    | { motif: ConceptArtworkMotif }
    | { motif: "monogram"; initials?: string }
    | AcademicArtworkProps
    | LiteraryArtworkProps
  );

const CATEGORY_LABELS: Record<EditorialCategory, string> = {
  history: "História",
  curiosity: "Curiosidades",
  personality: "Personalidades",
  library: "Biblioteca Cultural",
};

function renderArtworkVisual(props: CulturalEditorialArtworkProps) {
  if (props.motif === "timeline" || props.motif === "legal-document") {
    return <HistoricalArtwork {...props} />;
  }

  if (
    props.motif === "diversity-orbits" ||
    props.motif === "parallel-structures" ||
    props.motif === "visual-rhythm"
  ) {
    return <ConceptArtwork motif={props.motif} />;
  }

  if (props.motif === "monogram") {
    return <PersonalityArtwork title={props.title} initials={props.initials} />;
  }

  if (props.motif === "academic") {
    return <LibraryArtwork {...props} />;
  }

  return (
    <LibraryArtwork
      motif="literary"
      metadataLabel={"metadataLabel" in props ? props.metadataLabel : undefined}
    />
  );
}

function getSubtitle(
  props: CulturalEditorialArtworkProps,
  variant: EditorialArtworkVariant,
): string | undefined {
  if (props.descriptor) return props.descriptor;
  if (props.motif === "academic") {
    if (variant === "book-cover") return props.volumeLabel;
    return [props.volumeLabel, props.metadataLabel].filter(Boolean).join(" · ") || undefined;
  }
  if (variant !== "book-cover" && "metadataLabel" in props) {
    return props.metadataLabel;
  }
  return undefined;
}

export function CulturalEditorialArtwork(
  props: CulturalEditorialArtworkProps,
) {
  const {
    category,
    variant = "card",
    title,
    eyebrow,
    representationLabel,
    className,
  } = props;
  const paletteStyle = getEditorialPaletteStyle(category);
  const variantClass = {
    card: styles.variantCard,
    thumbnail: styles.variantThumbnail,
    detail: styles.variantDetail,
    "book-cover": styles.variantBookCover,
    "book-spine": styles.variantBookSpine,
  }[variant];
  const stripClass =
    category === "history"
      ? styles.stripHistory
      : category === "library"
        ? styles.stripLibrary
        : undefined;
  const rootClassName = [
    styles.artwork,
    variantClass,
    stripClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (variant === "book-spine") {
    return (
      <div
        className={rootClassName}
        style={paletteStyle}
        data-category={category}
        data-motif={props.motif}
        data-variant={variant}
      >
        <div className={styles.spineShell}>
          <span className={styles.spineCategory} aria-hidden="true" />
          <span className={styles.spineTitle}>{title}</span>
          <span className={styles.spineBrand}>Sinaliza</span>
        </div>
      </div>
    );
  }

  const subtitle = getSubtitle(props, variant);
  const footerLabel =
    representationLabel ??
    (category === "library" ? "Representação editorial" : "Coleção Sinaliza");
  const isLibraryCover = category === "library" && variant === "book-cover";
  const innerClassName = [
    styles.inner,
    isLibraryCover ? styles.libraryCoverInner : undefined,
    isLibraryCover && props.motif === "literary"
      ? styles.literaryCoverInner
      : undefined,
  ]
    .filter(Boolean)
    .join(" ");
  const visualContent = (
    <div className={styles.visual}>{renderArtworkVisual(props)}</div>
  );
  const textContent = (
    <div className={styles.textContent}>
      <p className={styles.title}>{title}</p>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
    </div>
  );
  const metadataLabel =
    isLibraryCover && "metadataLabel" in props ? props.metadataLabel : undefined;

  return (
    <div
      className={rootClassName}
      style={paletteStyle}
      data-category={category}
      data-motif={props.motif}
      data-variant={variant}
    >
      <div className={innerClassName}>
        <p className={styles.eyebrow}>{eyebrow ?? CATEGORY_LABELS[category]}</p>
        {isLibraryCover ? textContent : visualContent}
        {isLibraryCover ? visualContent : textContent}
        {metadataLabel ? (
          <p className={styles.libraryMetadata}>{metadataLabel}</p>
        ) : null}
        <p className={styles.footer}>
          <span>{footerLabel}</span>
          {category === "library" ? <span>Sinaliza</span> : null}
        </p>
      </div>
    </div>
  );
}
