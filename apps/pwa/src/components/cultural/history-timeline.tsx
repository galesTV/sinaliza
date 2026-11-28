import Link from "next/link";

import type { PublicCulturalHistoryEntry } from "@/data/cultural-publication";
import { getCulturalCategoryHref } from "@/data/cultural-taxonomy";
import { compareHistoryEntries, formatHistoryDate } from "@/lib/cultural-explore";

import { IconArrowRight } from "../icons";
import { CulturalEntryArtwork } from "./editorial/cultural-entry-artwork";

export function HistoryTimeline({
  entries,
}: {
  entries: PublicCulturalHistoryEntry[];
}) {
  const ordered = [...entries].sort(compareHistoryEntries);

  return (
    <ol
      aria-label="Linha do tempo cultural"
      className="relative flex flex-col before:absolute before:bottom-8 before:left-[0.55rem] before:top-2 before:w-px before:bg-gradient-to-b before:from-highlight/70 before:via-accent/35 before:to-transparent sm:before:left-[7.4rem]"
    >
      {ordered.map((entry) => (
        <li key={entry.id} className="relative grid gap-4 py-7 pl-8 sm:grid-cols-[6rem_1fr] sm:gap-8 sm:pl-0">
          <span
            aria-hidden="true"
            className="absolute left-0 top-9 grid h-5 w-5 place-items-center rounded-full border border-highlight/60 bg-background sm:left-[6.9rem]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-highlight shadow-[0_0_14px_rgba(240,168,72,0.75)]" />
          </span>
          <time className="font-display text-3xl font-semibold tracking-tight text-highlight sm:pt-1 sm:text-right sm:text-4xl">
            {formatHistoryDate(entry)}
          </time>
          <article className="flex max-w-3xl flex-col gap-4 border-b border-border/70 pb-8 sm:pl-10">
            {entry.artwork && (
              <div className="max-w-sm">
                <CulturalEntryArtwork entry={entry} variant="thumbnail" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                {entry.title}
              </h2>
              <p className="text-base leading-relaxed text-muted">{entry.summary}</p>
            </div>
            {entry.history.context && (
              <p className="max-w-2xl border-l-2 border-highlight/45 pl-4 text-sm leading-relaxed text-muted sm:text-base">
                {entry.history.context}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`${getCulturalCategoryHref("history")}/${entry.slug}`}
                className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-highlight/30 px-4 text-sm font-semibold text-highlight transition-colors hover:border-highlight/60 hover:text-foreground"
              >
                Ler registro
                <IconArrowRight className="h-4 w-4" />
              </Link>
              {entry.relatedEntries.length > 0 && (
                <span className="text-xs text-muted">
                  Inclui relações culturais publicadas
                </span>
              )}
            </div>
          </article>
        </li>
      ))}
    </ol>
  );
}
