import Link from "next/link";

import { Breadcrumb } from "@/components/breadcrumb";
import { Badge } from "@/components/badge";
import { IconArrowLeft, IconExternalLink } from "@/components/icons";
import type {
  PublicCulturalEntry,
  PublicCulturalRelation,
} from "@/data/cultural-publication";
import {
  getCulturalCategoryHref,
  getCulturalCategoryPresentation,
} from "@/data/cultural-taxonomy";
import { formatHistoryDate } from "@/lib/cultural-explore";

import { ConstellationGraphic } from "./constellation-graphic";
import {
  libraryAccessLabel,
  libraryFormatLabel,
  relationKindLabel,
} from "./labels";

export interface ResolvedCulturalRelation {
  relation: PublicCulturalRelation;
  entry: PublicCulturalEntry;
}

function DetailSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5 border-t border-border/70 pt-7">
      <h2 id={id} className="font-display text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CulturalDetail({
  entry,
  relations,
}: {
  entry: PublicCulturalEntry;
  relations: ResolvedCulturalRelation[];
}) {
  const presentation = getCulturalCategoryPresentation(entry.category);
  const categoryHref = getCulturalCategoryHref(entry.category);
  const contentTitle = {
    history: "Contexto histórico",
    curiosity: "Aprofundamento",
    personality: "Trajetória",
    library: "Informações bibliográficas",
  }[entry.category];

  return (
    <article className="flex flex-col gap-10">
      <Breadcrumb
        items={[
          { label: "Explorar", href: "/explorar" },
          { label: presentation.pluralLabel, href: categoryHref },
          { label: entry.title },
        ]}
      />

      <header className="relative grid gap-8 overflow-hidden lg:grid-cols-[1fr_15rem] lg:items-end">
        <div className="flex flex-col gap-5">
          <Link
            href={categoryHref}
            className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-accent transition-colors hover:text-foreground"
          >
            <IconArrowLeft className="h-4 w-4" />
            Voltar para {presentation.pluralLabel}
          </Link>
          <div className="flex max-w-3xl flex-col gap-4">
            <Badge tone="accent" className="self-start">{presentation.label}</Badge>
            <h1 className="font-display text-4xl font-semibold leading-[1.04] tracking-tight text-foreground sm:text-5xl">
              {entry.title}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              {entry.summary}
            </p>
          </div>
        </div>
        <div aria-hidden="true" className="relative hidden h-44 lg:block">
          <ConstellationGraphic variant={entry.category} className="absolute inset-0 h-full w-full text-accent opacity-50" />
        </div>
      </header>

      <DetailSection id="cultural-content-title" title={contentTitle}>
        {entry.category === "history" && (
          <div className="grid gap-5 md:grid-cols-[10rem_1fr] md:items-start">
            <p className="w-fit rounded-full border border-highlight/35 bg-highlight/10 px-4 py-2 font-display text-2xl font-semibold text-highlight">
              {formatHistoryDate(entry)}
            </p>
            {entry.history.context && (
              <p className="max-w-2xl border-l-2 border-highlight/45 pl-4 text-base leading-relaxed text-muted sm:text-lg">
                {entry.history.context}
              </p>
            )}
          </div>
        )}

        {entry.category === "curiosity" && (
          <div className="flex max-w-3xl flex-col gap-6">
            <blockquote className="border-l-2 border-accent/55 pl-5 font-display text-2xl font-semibold leading-snug text-foreground sm:text-3xl">
              {entry.curiosity.question}
            </blockquote>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Resposta</h3>
              <p className="text-base leading-relaxed text-muted sm:text-lg">{entry.curiosity.shortAnswer}</p>
            </div>
            {entry.curiosity.deepening && (
              <div className="rounded-[1.4rem] border-l-2 border-highlight/45 bg-highlight/8 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-highlight">Para continuar</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{entry.curiosity.deepening}</p>
              </div>
            )}
          </div>
        )}

        {entry.category === "personality" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
            <div className="flex max-w-3xl flex-col gap-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-soft">
                Sobre {entry.personality.personName}
              </h3>
              <p className="text-base leading-relaxed text-muted sm:text-lg">
                {entry.personality.biographicalSummary}
              </p>
            </div>
            {entry.personality.contributions?.length ? (
              <aside className="rounded-[1.4rem] border border-primary/25 bg-primary/10 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-soft">Contribuições</h3>
                <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
                  {entry.personality.contributions.map((contribution) => (
                    <li key={contribution} className="flex gap-2">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-soft" />
                      {contribution}
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </div>
        )}

        {entry.category === "library" && (
          <dl className="grid gap-x-8 gap-y-5 rounded-[1.5rem] border border-success/25 bg-success/8 p-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {entry.library.creators?.length ? (
              <div>
                <dt className="font-semibold text-foreground">Autoria ou créditos</dt>
                <dd className="mt-1 leading-relaxed text-muted">{entry.library.creators.join(", ")}</dd>
              </div>
            ) : null}
            {entry.library.publicationYear !== undefined && (
              <div>
                <dt className="font-semibold text-foreground">Ano de publicação</dt>
                <dd className="mt-1 text-muted tabular-nums">{entry.library.publicationYear}</dd>
              </div>
            )}
            {entry.library.publisher && (
              <div>
                <dt className="font-semibold text-foreground">Editora ou instituição</dt>
                <dd className="mt-1 text-muted">{entry.library.publisher}</dd>
              </div>
            )}
            <div>
              <dt className="font-semibold text-foreground">Formato</dt>
              <dd className="mt-1 text-muted">{libraryFormatLabel(entry.library.format)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Modalidade de acesso</dt>
              <dd className="mt-1 text-muted">{libraryAccessLabel(entry.library.access)}</dd>
            </div>
            {entry.library.languages?.length ? (
              <div>
                <dt className="font-semibold text-foreground">Idiomas</dt>
                <dd className="mt-1 text-muted">{entry.library.languages.join(", ")}</dd>
              </div>
            ) : null}
          </dl>
        )}
      </DetailSection>

      {relations.length > 0 && (
        <DetailSection id="cultural-relations-title" title="Relações culturais">
          <ul className="grid gap-4 sm:grid-cols-2">
            {relations.map(({ relation, entry: target }) => {
              const targetPresentation = getCulturalCategoryPresentation(target.category);
              return (
                <li key={`${relation.kind}-${target.id}`}>
                  <Link
                    href={`${getCulturalCategoryHref(target.category)}/${target.slug}`}
                    className="flex h-full flex-col gap-2 rounded-[1.4rem] border border-border/70 bg-surface/70 p-5 transition-colors duration-200 hover:border-accent/40"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                      {relationKindLabel(relation.kind)} · {targetPresentation.label}
                    </span>
                    <span className="font-display text-lg font-semibold text-foreground">
                      {target.title}
                    </span>
                    <span className="text-sm leading-relaxed text-muted">{target.summary}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </DetailSection>
      )}

      <DetailSection id="cultural-references-title" title="Fontes e leituras complementares">
        <ul className="grid gap-4">
          {entry.references.map((reference) => (
            <li key={`${reference.institution}-${reference.url}`} className="max-w-3xl border-l-2 border-accent/35 pl-5">
              <div className="flex flex-col gap-2">
                <p className="text-base font-semibold text-foreground">{reference.institution}</p>
                <p className="text-sm leading-relaxed text-muted">{reference.purpose}</p>
                <p className="text-xs text-muted">
                  Consultado em <time dateTime={reference.consultedAt}>{reference.consultedAt}</time>
                </p>
                <a
                  href={reference.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-accent transition-colors hover:text-foreground"
                >
                  Abrir fonte externa
                  <IconExternalLink className="h-4 w-4" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </DetailSection>
    </article>
  );
}
