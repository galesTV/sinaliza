import styles from "./editorial-artwork.module.css";

export interface TimelineArtworkEvent {
  year: number;
  label: string;
}

export interface TimelineArtworkProps {
  motif: "timeline";
  yearLabel?: string;
  events?: readonly TimelineArtworkEvent[];
}

export interface LegalDocumentArtworkProps {
  motif: "legal-document";
  yearLabel?: string;
  documentLabel?: string;
  documentNumber?: string;
  documentDate?: string;
}

export type HistoricalArtworkProps =
  | TimelineArtworkProps
  | LegalDocumentArtworkProps;

export function HistoricalArtwork(props: HistoricalArtworkProps) {
  if (props.motif === "timeline") {
    const events = props.events ?? [];

    return (
      <div className={styles.timelineVisual}>
        {props.yearLabel ? (
          <strong className={styles.timelineYear}>{props.yearLabel}</strong>
        ) : null}
        {events.length > 0 ? (
          <ol className={styles.timelineEvents}>
            {events.map((event) => (
              <li className={styles.timelineEvent} key={`${event.year}-${event.label}`}>
                <span className={styles.timelineEventYear}>{event.year}</span>
                <span className={styles.timelineEventLabel}>{event.label}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.legalVisual}>
      {props.yearLabel ? (
        <strong className={styles.legalYear}>{props.yearLabel}</strong>
      ) : null}
      <div className={styles.legalDocument}>
        {props.documentLabel ? (
          <span className={styles.legalLabel}>{props.documentLabel}</span>
        ) : null}
        {props.documentNumber ? (
          <strong className={styles.legalNumber}>{props.documentNumber}</strong>
        ) : null}
        {props.documentDate ? (
          <span className={styles.legalDate}>{props.documentDate}</span>
        ) : null}
        <span className={styles.legalLines} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  );
}
