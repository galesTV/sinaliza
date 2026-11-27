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
        description="Conheça a história, as pessoas, a arte e a cultura que fazem parte do universo da Libras — sempre com fontes públicas e validação editorial."
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
                  className="group flex h-full flex-col gap-5 rounded-2xl border border-border bg-surface p-6 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/45"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      aria-hidden="true"
                      className={`grid h-11 w-11 place-items-center rounded-xl border ${CATEGORY_STYLES[presentation.category]}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-medium text-muted">
                      {count > 0
                        ? `${count} ${count === 1 ? "registro publicado" : "registros publicados"}`
                        : "Em preparação"}
                    </span>
                  </div>
                  <span className="flex flex-col gap-2">
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
