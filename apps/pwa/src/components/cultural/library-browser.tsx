"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { PublicCulturalLibraryEntry } from "@/data/cultural-publication";
import { getCulturalCategoryHref } from "@/data/cultural-taxonomy";
import {
  filterLibraryEntries,
  getTitleInitials,
  uniqueLibraryValues,
} from "@/lib/cultural-explore";

import { IconArrowRight } from "../icons";
import { libraryAccessLabel, libraryFormatLabel } from "./labels";

function searchableText(entry: PublicCulturalLibraryEntry): string {
  return [
    entry.title,
    entry.summary,
    ...(entry.library.creators ?? []),
    entry.library.publisher ?? "",
    libraryFormatLabel(entry.library.format),
    libraryAccessLabel(entry.library.access),
    ...(entry.library.languages ?? []),
  ].join(" ");
}

export function LibraryBrowser({
  entries,
}: {
  entries: PublicCulturalLibraryEntry[];
}) {
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState("all");
  const [access, setAccess] = useState("all");

  const formats = useMemo(() => uniqueLibraryValues(entries, "format"), [entries]);
  const accessModes = useMemo(() => uniqueLibraryValues(entries, "access"), [entries]);
  const filtered = useMemo(
    () => filterLibraryEntries(entries, { query, format, access }, searchableText),
    [entries, query, format, access],
  );

  return (
    <div className="flex flex-col gap-6">
      <form
        role="search"
        aria-label="Buscar e filtrar biblioteca cultural"
        className="grid gap-4 rounded-2xl border border-border bg-surface-elevated p-5 lg:grid-cols-[1fr_220px_220px]"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="library-search" className="text-sm font-semibold text-foreground">
            Busca textual
          </label>
          <input
            id="library-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Título, autoria ou publicação"
            className="min-h-11 rounded-[10px] border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted/70"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="library-format" className="text-sm font-semibold text-foreground">
            Formato
          </label>
          <select
            id="library-format"
            value={format}
            onChange={(event) => setFormat(event.target.value)}
            className="min-h-11 rounded-[10px] border border-border bg-background px-3 text-sm text-foreground"
          >
            <option value="all">Todos os formatos</option>
            {formats.map((value) => (
              <option key={value} value={value}>
                {libraryFormatLabel(value)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="library-access" className="text-sm font-semibold text-foreground">
            Acesso
          </label>
          <select
            id="library-access"
            value={access}
            onChange={(event) => setAccess(event.target.value)}
            className="min-h-11 rounded-[10px] border border-border px-3 text-sm text-foreground"
          >
            <option value="all">Todas as modalidades</option>
            {accessModes.map((value) => (
              <option key={value} value={value}>
                {libraryAccessLabel(value)}
              </option>
            ))}
          </select>
        </div>
      </form>

      <p aria-live="polite" className="text-sm text-muted">
        {filtered.length === 1
          ? "1 registro publicado encontrado"
          : `${filtered.length} registros publicados encontrados`}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-6" role="note">
          <p className="text-sm font-semibold text-foreground">Nenhum resultado nesta busca</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Ajuste os filtros ou o termo digitado. A busca considera somente
            registros culturais já publicados.
          </p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Registros da biblioteca cultural">
          {filtered.map((entry) => (
            <li key={entry.id}>
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface">
                <div
                  aria-hidden="true"
                  className="relative flex h-36 items-end border-b border-border bg-gradient-to-br from-primary/25 via-surface-elevated to-accent/10 p-5"
                >
                  <span className="absolute right-5 top-5 h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_rgba(53,201,232,0.7)]" />
                  <span className="absolute right-10 top-10 h-px w-16 rotate-[-20deg] bg-accent/35" />
                  <span className="flex flex-col gap-1">
                    <span className="font-display text-4xl font-semibold leading-none text-primary-soft">
                      {getTitleInitials(entry.title)}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                      Capa tipográfica
                    </span>
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex flex-col gap-2">
                    <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
                      {entry.title}
                    </h2>
                    {entry.library.creators?.length ? (
                      <p className="text-sm font-medium text-muted">
                        {entry.library.creators.join(", ")}
                      </p>
                    ) : null}
                    <p className="text-sm leading-relaxed text-muted">{entry.summary}</p>
                  </div>
                  <dl className="grid gap-2 text-sm">
                    <div className="flex gap-2">
                      <dt className="min-w-20 font-semibold text-foreground">Formato</dt>
                      <dd className="text-muted">{libraryFormatLabel(entry.library.format)}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="min-w-20 font-semibold text-foreground">Acesso</dt>
                      <dd className="text-muted">{libraryAccessLabel(entry.library.access)}</dd>
                    </div>
                    {entry.library.publicationYear && (
                      <div className="flex gap-2">
                        <dt className="min-w-20 font-semibold text-foreground">Ano</dt>
                        <dd className="text-muted tabular-nums">{entry.library.publicationYear}</dd>
                      </div>
                    )}
                  </dl>
                  <Link
                    href={`${getCulturalCategoryHref("library")}/${entry.slug}`}
                    className="mt-auto inline-flex items-center gap-2 self-start text-sm font-medium text-accent transition-colors hover:text-foreground"
                  >
                    Ver ficha
                    <IconArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
