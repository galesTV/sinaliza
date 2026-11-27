import Link from "next/link";

import type { PublicCulturalPersonalityEntry } from "@/data/cultural-publication";
import { getCulturalCategoryHref } from "@/data/cultural-taxonomy";
import { getPersonInitials } from "@/lib/cultural-explore";

import { IconArrowRight } from "../icons";

export function PersonalityGallery({
  entries,
}: {
  entries: PublicCulturalPersonalityEntry[];
}) {
  return (
    <ul className="grid gap-5 md:grid-cols-2" aria-label="Personalidades culturais">
      {entries.map((entry) => (
        <li key={entry.id}>
          <article className="relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-surface p-6">
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-8 right-4 font-display text-8xl font-semibold text-primary/10">
              {getPersonInitials(entry.personality.personName)}
            </span>
            <div className="flex items-start gap-4">
              <div
                aria-hidden="true"
                className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-primary/35 bg-gradient-to-br from-primary/25 to-accent/10 font-display text-lg font-semibold text-primary-soft"
              >
                {getPersonInitials(entry.personality.personName)}
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
                  {entry.personality.personName}
                </h2>
                {entry.personality.contributions?.[0] && (
                  <p className="w-fit rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                    {entry.personality.contributions[0]}
                  </p>
                )}
              </div>
            </div>

            <p className="relative max-w-xl text-sm leading-relaxed text-muted">
              {entry.personality.biographicalSummary}
            </p>

            {entry.personality.contributions &&
              entry.personality.contributions.length > 1 && (
                <ul className="flex flex-col gap-1.5 text-sm text-muted" aria-label="Outras contribuições">
                  {entry.personality.contributions.slice(1).map((contribution) => (
                    <li key={contribution} className="flex gap-2">
                      <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary-soft" />
                      {contribution}
                    </li>
                  ))}
                </ul>
              )}

            <Link
              href={`${getCulturalCategoryHref("personality")}/${entry.slug}`}
              className="mt-auto inline-flex items-center gap-2 self-start text-sm font-medium text-accent transition-colors hover:text-foreground"
            >
              Ler perfil
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </article>
        </li>
      ))}
    </ul>
  );
}
