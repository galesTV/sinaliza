import Link from "next/link";

import type { CulturalCategory } from "@/data/cultural-catalog-model";
import type { PublicCulturalEntry } from "@/data/cultural-publication";
import {
  CULTURAL_CATEGORY_PRESENTATIONS,
  getCulturalCategoryHref,
} from "@/data/cultural-taxonomy";

import {
  IconArrowRight,
  IconBookOpen,
  IconClock,
  IconQuestion,
  IconUser,
} from "../icons";
import { CulturalEmptyState } from "./cultural-empty-state";
import { CulturalPageHeader } from "./cultural-page-header";

const CATEGORY_ICONS: Record<CulturalCategory, typeof IconClock> = {
  history: IconClock,
  curiosity: IconQuestion,
  personality: IconUser,
  library: IconBookOpen,
};

const CATEGORY_STYLES: Record<CulturalCategory, string> = {
  history: "border-accent/30 bg-accent/10 text-accent",
  curiosity: "border-highlight/35 bg-highlight/10 text-highlight",
  personality: "border-primary/40 bg-primary/15 text-primary-soft",
  library: "border-success/35 bg-success/10 text-success",
};

function CategoryMotif({ category }: { category: CulturalCategory }) {
  if (category === "history") {
    return (
      <svg viewBox="0 0 160 90" fill="none" aria-hidden="true">
        <path d="M12 72C48 18 82 84 148 20" stroke="currentColor" strokeWidth="2" opacity="0.45" />
        {[18, 66, 112, 146].map((x, index) => (
          <circle key={x} cx={x} cy={[66, 44, 58, 22][index]} r="4" fill="currentColor" opacity="0.65" />
        ))}
      </svg>
    );
  }
  if (category === "curiosity") {
    return (
      <svg viewBox="0 0 160 90" fill="none" aria-hidden="true">
        <path d="M34 58 76 24l42 38 24-34" stroke="currentColor" strokeWidth="2" opacity="0.45" />
        {[34, 76, 118, 142].map((x, index) => (
          <circle key={x} cx={x} cy={[58, 24, 62, 28][index]} r={[5, 8, 4, 6][index]} stroke="currentColor" strokeWidth="2" opacity="0.7" />
        ))}
      </svg>
    );
  }
  if (category === "personality") {
    return (
      <svg viewBox="0 0 160 90" fill="none" aria-hidden="true">
        <circle cx="56" cy="48" r="24" stroke="currentColor" strokeWidth="2" opacity="0.55" />
        <circle cx="92" cy="38" r="18" stroke="currentColor" strokeWidth="2" opacity="0.45" />
        <path d="M26 72c28-18 62-20 108-48" stroke="currentColor" strokeWidth="2" opacity="0.5" />
        <circle cx="128" cy="27" r="4" fill="currentColor" opacity="0.8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 160 90" fill="none" aria-hidden="true">
      {[34, 58, 82].map((x, index) => (
        <path key={x} d={`M${x} ${66 - index * 8}h58l12 10H${x + 12}z`} stroke="currentColor" strokeWidth="2" opacity={0.35 + index * 0.12} />
      ))}
      <path d="M108 22v32" stroke="currentColor" strokeWidth="2" opacity="0.5" />
    </svg>
  );
}

export function ExploreHome({ entries }: { entries: PublicCulturalEntry[] }) {
  const counts = new Map(
    CULTURAL_CATEGORY_PRESENTATIONS.map((presentation) => [
      presentation.category,
      entries.filter((entry) => entry.category === presentation.category).length,
    ]),
  );
  const total = entries.length;

  return (
    <div className="flex flex-col gap-10">
      <CulturalPageHeader
        titleId="explore-title"
        title="Uma língua. Muitas histórias."
        description="Conheça a história, as pessoas, a arte e a cultura que fazem parte do universo da Libras."
      />

      <section aria-labelledby="explore-categories-title" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 id="explore-categories-title" className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Caminhos de descoberta
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            Quatro formas de navegar pelo acervo cultural, sem pontuação,
            obrigação ou sequência pedagógica.
          </p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2" aria-label="Categorias culturais">
          {CULTURAL_CATEGORY_PRESENTATIONS.map((presentation) => {
            const Icon = CATEGORY_ICONS[presentation.category];
            const count = counts.get(presentation.category) ?? 0;
            return (
              <li key={presentation.category}>
                <Link
                  href={getCulturalCategoryHref(presentation.category)}
                  className="group relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/45"
                >
                  <span aria-hidden="true" className={`pointer-events-none absolute -right-3 -top-2 h-24 w-40 opacity-35 transition-opacity group-hover:opacity-55 ${CATEGORY_STYLES[presentation.category].split(" ").pop()}`}>
                    <CategoryMotif category={presentation.category} />
                  </span>
                  <div className="relative flex items-start justify-between gap-4">
                    <span
                      aria-hidden="true"
                      className={`grid h-11 w-11 place-items-center rounded-xl border ${CATEGORY_STYLES[presentation.category]}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="relative z-10 rounded-full bg-background/75 px-2 py-1 text-xs font-medium text-muted backdrop-blur-sm">
                      {count > 0
                        ? `${count} ${count === 1 ? "registro publicado" : "registros publicados"}`
                        : "Em preparação"}
                    </span>
                  </div>
                  <span className="relative flex flex-col gap-2">
                    <span className="font-display text-xl font-semibold tracking-tight text-foreground">
                      {presentation.pluralLabel}
                    </span>
                    <span className="text-sm leading-relaxed text-muted">
                      {presentation.description}
                    </span>
                  </span>
                  <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors group-hover:text-foreground">
                    Explorar categoria
                    <IconArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {total === 0 && <CulturalEmptyState categoryLabel="cultura" />}
    </div>
  );
}
