"use client";

import Link from "next/link";
import { useState } from "react";

import type { PublicCulturalCuriosityEntry } from "@/data/cultural-publication";
import { getCulturalCategoryHref } from "@/data/cultural-taxonomy";

import { IconArrowRight } from "../icons";

export function CuriosityCards({
  entries,
}: {
  entries: PublicCulturalCuriosityEntry[];
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <ul className="grid gap-5 md:grid-cols-2" aria-label="Curiosidades culturais">
      {entries.map((entry) => {
        const answerId = `curiosidade-resposta-${entry.slug}`;
        const isExpanded = Boolean(expanded[entry.id]);
        return (
          <li key={entry.id}>
            <article className="flex h-full flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-[inset_3px_0_0_rgba(240,168,72,0.35)]">
              <div className="flex flex-col gap-2">
                <span
                  aria-hidden="true"
                  className="mb-1 h-1.5 w-1.5 rounded-full bg-highlight shadow-[0_0_10px_rgba(240,168,72,0.65)]"
                />
                <h2 className="font-display text-2xl font-semibold leading-snug tracking-tight text-foreground">
                  {entry.curiosity.question}
                </h2>
                <p className="text-sm leading-relaxed text-muted">{entry.summary}</p>
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
                className="btn-secondary self-start"
              >
                {isExpanded ? "Ocultar resposta" : "Revelar resposta"}
              </button>

              <div
                id={answerId}
                hidden={!isExpanded}
                className="flex flex-col gap-2 rounded-xl border border-accent/25 bg-accent/8 p-4"
              >
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

              <Link
                href={`${getCulturalCategoryHref("curiosity")}/${entry.slug}`}
                className="mt-auto inline-flex items-center gap-2 self-start text-sm font-medium text-accent transition-colors hover:text-foreground"
              >
                Aprofundar
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
