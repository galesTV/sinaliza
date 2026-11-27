import Link from "next/link";

import type { CulturalCategory } from "@/data/cultural-catalog-model";
import type { PublicCulturalEntry } from "@/data/cultural-publication";
import {
  CULTURAL_CATEGORY_PRESENTATIONS,
  getCulturalCategoryHref,
} from "@/data/cultural-taxonomy";

import { IconArrowRight } from "../icons";
import { ConstellationGraphic } from "./constellation-graphic";
import { CulturalEmptyState } from "./cultural-empty-state";

interface PortalVisual {
  title: string;
  kicker: string;
  tone: string;
  wash: string;
  span: string;
}

const PORTAL_VISUALS: Record<CulturalCategory, PortalVisual> = {
  history: {
    title: "Histórias que atravessam gerações.",
    kicker: "Memória e tempo",
    tone: "text-highlight",
    wash: "from-highlight/18 via-surface/70 to-transparent",
    span: "lg:col-span-7 lg:min-h-72",
  },
  curiosity: {
    title: "Além do que você conhece.",
    kicker: "Descoberta",
    tone: "text-accent",
    wash: "from-accent/18 via-surface/70 to-transparent",
    span: "lg:col-span-5 lg:min-h-72",
  },
  personality: {
    title: "Pessoas que transformam.",
    kicker: "Presença e trajetórias",
    tone: "text-primary-soft",
    wash: "from-primary/24 via-surface/70 to-transparent",
    span: "lg:col-span-5 lg:min-h-80",
  },
  library: {
    title: "Um acervo de muitas expressões.",
    kicker: "Acervo e continuidade",
    tone: "text-success",
    wash: "from-success/16 via-surface/70 to-transparent",
    span: "lg:col-span-7 lg:min-h-80",
  },
};

function HeroConstellation() {
  return (
    <div aria-hidden="true" className="relative min-h-56 overflow-hidden rounded-[2rem] border border-border/70 bg-surface/45">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(53,201,232,0.18),transparent_18rem),radial-gradient(circle_at_22%_80%,rgba(240,168,72,0.12),transparent_15rem)]" />
      <ConstellationGraphic variant="home" className="cultural-constellation-drift absolute inset-x-4 top-8 h-44 w-auto text-accent opacity-90" />
      <span className="absolute left-[18%] top-[24%] h-16 w-16 rounded-full border border-primary/30" />
      <span className="absolute bottom-8 right-[16%] h-24 w-24 rounded-full border border-highlight/25" />
      <span className="absolute bottom-10 right-8 max-w-40 text-xs leading-relaxed text-muted">
        Um universo cultural conectado por memória, pessoas e descoberta.
      </span>
    </div>
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
    <div className="flex flex-col gap-14">
      <section aria-labelledby="explore-title" className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            Constelação Cultural
          </p>
          <h1 id="explore-title" className="max-w-3xl font-display text-4xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Uma língua. Muitas histórias.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Conheça a história, as pessoas, a arte e a cultura que fazem parte do universo da Libras.
          </p>
        </div>
        <HeroConstellation />
      </section>

      <section aria-labelledby="explore-categories-title" className="flex flex-col gap-7">
        <div className="flex max-w-2xl flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Portais culturais</p>
          <h2 id="explore-categories-title" className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Escolha por onde começar
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            Quatro caminhos independentes para navegar pelo acervo cultural, no seu ritmo.
          </p>
        </div>

        <ul className="grid gap-5 lg:grid-cols-12" aria-label="Categorias culturais">
          {CULTURAL_CATEGORY_PRESENTATIONS.map((presentation) => {
            const visual = PORTAL_VISUALS[presentation.category];
            const count = counts.get(presentation.category) ?? 0;
            return (
              <li key={presentation.category} className={visual.span}>
                <Link
                  href={getCulturalCategoryHref(presentation.category)}
                  className={`group relative flex h-full min-h-64 flex-col justify-end overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent/35 sm:p-7 ${visual.wash}`}
                >
                  <ConstellationGraphic
                    variant={presentation.category}
                    className={`absolute right-3 top-3 h-32 w-56 opacity-55 transition-transform duration-300 group-hover:scale-[1.03] ${visual.tone}`}
                  />
                  <span className="relative flex flex-col gap-4">
                    <span className="flex items-center justify-between gap-4">
                      <span className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${visual.tone}`}>
                        {visual.kicker}
                      </span>
                      <span className="rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-muted backdrop-blur-sm">
                        {count > 0
                          ? `${count} ${count === 1 ? "registro" : "registros"}`
                          : "Em preparação"}
                      </span>
                    </span>
                    <span className="flex max-w-md flex-col gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        {presentation.pluralLabel}
                      </span>
                      <span className="font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                        {visual.title}
                      </span>
                      <span className="text-sm leading-relaxed text-muted">
                        {presentation.description}
                      </span>
                    </span>
                    <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      Explorar caminho
                      <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
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
