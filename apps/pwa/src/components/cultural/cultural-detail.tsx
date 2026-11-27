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

import {
  libraryAccessLabel,
  libraryFormatLabel,
  relationKindLabel,
} from "./labels";

export interface ResolvedCulturalRelation {
  relation: PublicCulturalRelation;
  entry: PublicCulturalEntry;
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

  return (
    <div className="flex flex-col gap-9">
      <Breadcrumb
        items={[
          { label: "Explorar", href: "/explorar" },
          { label: presentation.pluralLabel, href: categoryHref },
          { label: entry.title },
        ]}
      />

      <header className="flex flex-col gap-5">
        <Link
          href={categoryHref}
          className="inline-flex items-center gap-2 self-start text-sm font-medium text-accent transition-colors hover:text-foreground"
        >
          <IconArrowLeft className="h-4 w-4" />
          Voltar para {presentation.pluralLabel}
        </Link>
        <div className="flex flex-col gap-3">
          <Badge tone="accent" className="self-start">{presentation.label}</Badge>
          <h1 className="max-w-3xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {entry.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            {entry.summary}
          </p>
        </div>
      </header>

      <section aria-labelledby="cultural-content-title" className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 sm:p-7">
        <h2 id="cultural-content-title" className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Registro cultural
        </h2>
        {entry.category === "history" && (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-foreground">Data ou período</dt>
              <dd className="mt-1 text-muted">{formatHistoryDate(entry)}</dd>
            </div>
            {entry.history.context && (
              <div>
                <dt className="font-semibold text-foreground">Contexto</dt>
                <dd className="mt-1 leading-relaxed text-muted">{entry.history.context}</dd>
              </div>
            )}
          </dl>
        )}
        {entry.category === "curiosity" && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Pergunta</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{entry.curiosity.question}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Resposta</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{entry.curiosity.shortAnswer}</p>
            </div>
            {entry.curiosity.deepening && (
              <div>
                <h3 className="text-sm font-semibold text-foreground">Aprofundamento</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{entry.curiosity.deepening}</p>
              </div>
            )}
          </div>
        )}
        {entry.category === "personality" && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Nome</h3>
              <p className="mt-1 text-sm text-muted">{entry.personality.personName}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Resumo biográfico</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{entry.personality.biographicalSummary}</p>
            </div>
            {entry.personality.contributions?.length ? (
              <div>
                <h3 className="text-sm font-semibold text-foreground">Contribuições</h3>
                <ul className="mt-2 flex flex-col gap-1.5 text-sm text-muted">
                  {entry.personality.contributions.map((contribution) => (
                    <li key={contribution} className="flex gap-2">
                      <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary-soft" />
                      {contribution}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
        {entry.category === "library" && (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {entry.library.creators?.length ? (
              <div>
                <dt className="font-semibold text-foreground">Autoria ou créditos</dt>
                <dd className="mt-1 text-muted">{entry.library.creators.join(", ")}</dd>
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
      </section>

      {relations.length > 0 && (
        <section aria-labelledby="cultural-relations-title" className="flex flex-col gap-4">
          <h2 id="cultural-relations-title" className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Relações culturais
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {relations.map(({ relation, entry: target }) => {
              const targetPresentation = getCulturalCategoryPresentation(target.category);
              return (
                <li key={`${relation.kind}-${target.id}`}>
                  <Link
                    href={`${getCulturalCategoryHref(target.category)}/${target.slug}`}
                    className="flex h-full flex-col gap-2 rounded-2xl border border-border bg-surface p-5 transition-colors duration-200 hover:border-accent/40"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
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
        </section>
      )}

      <section aria-labelledby="cultural-references-title" className="flex flex-col gap-4">
        <h2 id="cultural-references-title" className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Referências públicas
        </h2>
        <ul className="flex flex-col gap-4">
          {entry.references.map((reference) => (
            <li key={`${reference.institution}-${reference.url}`} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-foreground">{reference.institution}</p>
                <p className="text-sm leading-relaxed text-muted">{reference.purpose}</p>
                <p className="text-xs text-muted">
                  Consultado em <time dateTime={reference.consultedAt}>{reference.consultedAt}</time>
                </p>
                <a
                  href={reference.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 self-start text-sm font-medium text-accent transition-colors hover:text-foreground"
                >
                  Abrir fonte externa
                  <IconExternalLink className="h-4 w-4" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
