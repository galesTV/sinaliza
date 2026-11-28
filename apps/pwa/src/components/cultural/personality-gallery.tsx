import Link from "next/link";

import type { PublicCulturalPersonalityEntry } from "@/data/cultural-publication";
import { getCulturalCategoryHref } from "@/data/cultural-taxonomy";
import { getPersonInitials } from "@/lib/cultural-explore";

import { IconArrowRight } from "../icons";
import { CulturalEntryArtwork } from "./editorial/cultural-entry-artwork";
import { SINALIZA_EDITORIAL_REPRESENTATION_LABEL } from "./editorial/editorial-representation";
import editorialStyles from "./editorial/editorial-artwork.module.css";

export function PersonalityGallery({
  entries,
}: {
  entries: PublicCulturalPersonalityEntry[];
}) {
  return (
    <ul className="grid gap-6 lg:grid-cols-2" aria-label="Personalidades culturais">
      {entries.map((entry, index) => {
        const initials = getPersonInitials(entry.personality.personName);
        return (
          <li key={entry.id} className={entries.length % 2 === 1 && index === entries.length - 1 ? "lg:col-span-2" : undefined}>
            <article className="group relative grid h-full gap-6 overflow-hidden rounded-[1.75rem] border border-border/60 bg-gradient-to-br from-primary/18 via-surface/65 to-transparent p-5 sm:grid-cols-[12rem_1fr] sm:p-6">
              <div className="relative flex w-full max-w-56 flex-col self-center sm:max-w-none">
                {entry.artwork ? (
                  <>
                    <div className="aspect-[3/4] w-full overflow-hidden rounded-[1.35rem]">
                      <CulturalEntryArtwork entry={entry} variant="card" fill hideFooter className={`${editorialStyles.compactSurface} ${editorialStyles.portraitSurface}`} />
                    </div>
                    <p className="mt-2 text-center text-[10px] font-semibold uppercase leading-relaxed tracking-[0.12em] text-primary-soft">
                      {SINALIZA_EDITORIAL_REPRESENTATION_LABEL}
                    </p>
                  </>
                ) : (
                  <div aria-hidden="true" className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-[1.35rem] border border-primary/25 bg-background/45">
                    <span className="absolute h-28 w-28 rounded-full border border-primary/25" />
                    <span className="absolute h-40 w-40 rounded-full border border-accent/15" />
                    <span className="font-display text-6xl font-semibold tracking-tight text-primary-soft/85">
                      {initials}
                    </span>
                    <span className="absolute bottom-4 right-5 h-2 w-2 rounded-full bg-accent shadow-[0_0_14px_rgba(53,201,232,0.8)]" />
                  </div>
                )}
              </div>

              <div className="relative flex min-w-0 flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-soft">
                    Galeria de trajetórias
                  </p>
                  <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                    {entry.personality.personName}
                  </h2>
                  {entry.personality.contributions?.[0] && (
                    <p className="w-fit rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                      {entry.personality.contributions[0]}
                    </p>
                  )}
                </div>

                <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
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
                  className="mt-auto inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-accent transition-colors hover:text-foreground"
                >
                  Ler perfil
                  <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
