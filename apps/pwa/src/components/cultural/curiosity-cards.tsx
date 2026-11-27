"use client";

import Link from "next/link";
import { useState } from "react";

import type { PublicCulturalCuriosityEntry } from "@/data/cultural-publication";
import { getCulturalCategoryHref } from "@/data/cultural-taxonomy";

import { IconArrowRight } from "../icons";
import { ConstellationGraphic } from "./constellation-graphic";
import { CulturalEntryArtwork } from "./editorial/cultural-entry-artwork";

export function CuriosityCards({
  entries,
}: {
  entries: PublicCulturalCuriosityEntry[];
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <ul className="grid gap-6 md:grid-cols-2" aria-label="Curiosidades culturais">
      {entries.map((entry, index) => {
        const answerId = `curiosidade-resposta-${entry.slug}`;
        const isExpanded = Boolean(expanded[entry.id]);
        const wide = entries.length > 1 && index === 0;
        const content = (
          <div className="relative flex max-w-2xl flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                Observatório
              </span>
              <h2 className={`font-display font-semibold leading-[1.08] tracking-tight text-foreground ${wide ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}>
                {entry.curiosity.question}
              </h2>
              <p className="text-sm leading-relaxed text-muted sm:text-base">{entry.summary}</p>
            </div>

            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls={answerId}
              onClick={() =>
                setExpanded((current) => ({
                  ...current,
                  [entry.id]: !isExpanded,
                }))
              }
              className="btn-secondary relative self-start rounded-full border-accent/30"
            >
              {isExpanded ? "Ocultar resposta" : "Revelar resposta"}
            </button>

            <div
              id={answerId}
              aria-hidden={!isExpanded}
              className={`relative grid transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none ${
                isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex max-w-2xl flex-col gap-2 rounded-2xl border-l-2 border-accent/50 bg-accent/8 p-4">
                  <p className="text-sm font-semibold text-foreground">Resposta</p>
                  <p className="text-sm leading-relaxed text-muted">
                    {entry.curiosity.shortAnswer}
                  </p>
                  {entry.curiosity.deepening && (
                    <p className="text-sm leading-relaxed text-muted">
                      {entry.curiosity.deepening}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Link
              href={`${getCulturalCategoryHref("curiosity")}/${entry.slug}`}
              className="relative mt-auto inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-accent transition-colors hover:text-foreground"
            >
              Aprofundar
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        );

        return (
          <li key={entry.id} className={wide ? "md:col-span-2" : undefined}>
            <article className={`relative flex h-full flex-col gap-6 overflow-hidden rounded-[1.75rem] border border-border/60 bg-gradient-to-br from-accent/10 via-surface/65 to-transparent p-6 sm:p-7 ${wide ? "lg:grid lg:grid-cols-[minmax(18rem,0.78fr)_minmax(0,1fr)] lg:items-center lg:gap-8" : ""}`}>
              {!entry.artwork && (
                <ConstellationGraphic
                  variant="curiosity"
                  className="pointer-events-none absolute -right-4 -top-5 h-28 w-48 text-accent opacity-35"
                />
              )}
              {entry.artwork && (
                <div className={`relative ${wide ? "w-full" : "max-w-md"}`}>
                  <CulturalEntryArtwork entry={entry} variant="card" />
                </div>
              )}
              {content}
            </article>
          </li>
        );
      })}
    </ul>
  );
}
