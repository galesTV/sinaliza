import Link from "next/link";

import type { PublicCulturalHistoryEntry } from "@/data/cultural-publication";
import { getCulturalCategoryHref } from "@/data/cultural-taxonomy";
import { compareHistoryEntries, formatHistoryDate } from "@/lib/cultural-explore";

import { IconArrowRight } from "../icons";

export function HistoryTimeline({
  entries,
}: {
  entries: PublicCulturalHistoryEntry[];
}) {
  const ordered = [...entries].sort(compareHistoryEntries);

  return (
    <ol
      aria-label="Linha do tempo cultural"
      className="relative flex flex-col gap-5 before:absolute before:bottom-4 before:left-[0.55rem] before:top-4 before:w-px before:bg-gradient-to-b before:from-accent/60 before:via-primary/45 before:to-highlight/50 sm:before:left-[0.65rem]"
    >
      {ordered.map((entry) => (
        <li key={entry.id} className="relative pl-9 sm:pl-11">
          <span
            aria-hidden="true"
            className="absolute left-0 top-2 grid h-5 w-5 place-items-center rounded-full border border-accent/50 bg-background sm:h-6 sm:w-6"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(53,201,232,0.75)]" />
          </span>
          <article className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <div className="flex flex-col gap-2">
              <p className="w-fit rounded-full border border-highlight/35 bg-highlight/10 px-3 py-1 font-display text-sm font-semibold uppercase tracking-[0.12em] text-highlight">
                {formatHistoryDate(entry)}
              </p>
              <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
                {entry.title}
              </h2>
              <p className="text-sm leading-relaxed text-muted">{entry.summary}</p>
            </div>
            {entry.history.context && (
              <p className="border-l-2 border-primary/45 pl-3 text-sm leading-relaxed text-muted">
                {entry.history.context}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`${getCulturalCategoryHref("history")}/${entry.slug}`}
                className="inline-flex items-center gap-2 self-start text-sm font-medium text-accent transition-colors hover:text-foreground"
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
