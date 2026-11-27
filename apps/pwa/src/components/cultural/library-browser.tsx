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
import { CulturalEntryArtwork } from "./editorial/cultural-entry-artwork";
import { libraryAccessLabel, libraryFormatLabel } from "./labels";
import { OrbitalShelf } from "./orbital-shelf";

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

function coverTone(format: string | undefined): string {
  const normalized = format ?? "";
  if (normalized.includes("audiovisual") || normalized.includes("video")) {
    return "from-accent/24 via-surface-elevated to-primary/16";
  }
  if (normalized.includes("book") || normalized.includes("livro")) {
    return "from-success/18 via-surface-elevated to-highlight/12";
  }
  return "from-primary/22 via-surface-elevated to-accent/12";
}

function FormatMark({ format }: { format: string | undefined }) {
  const normalized = format ?? "";
  if (normalized.includes("audiovisual") || normalized.includes("video")) {
    return <span className="h-8 w-8 rounded-full border border-accent/45 [clip-path:polygon(0_0,0_100%,100%50%)]" />;
  }
  if (normalized.includes("book") || normalized.includes("livro")) {
    return <span className="h-9 w-7 rounded-r-md border-y border-r border-success/50" />;
  }
  return <span className="h-8 w-8 rotate-45 border border-primary-soft/45" />;
}

export function LibraryBrowser({
  entries,
}: {
  entries: PublicCulturalLibraryEntry[];
}) {
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState("all");
  const [access, setAccess] = useState("all");
  const [viewMode, setViewMode] = useState<"grade" | "estante">("grade");

  const formats = useMemo(() => uniqueLibraryValues(entries, "format"), [entries]);
  const accessModes = useMemo(() => uniqueLibraryValues(entries, "access"), [entries]);
  const filtered = useMemo(
    () => filterLibraryEntries(entries, { query, format, access }, searchableText),
    [entries, query, format, access],
  );

  return (
    <div className="flex flex-col gap-7">
      <form
        role="search"
        aria-label="Buscar e filtrar biblioteca cultural"
        className="grid gap-4 rounded-[1.5rem] border border-border/70 bg-surface-elevated/70 p-5 backdrop-blur-sm lg:grid-cols-[1fr_220px_220px]"
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
            className="min-h-11 rounded-full border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted/70"
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
            className="min-h-11 rounded-full border border-border bg-background px-3 text-sm text-foreground"
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
            className="min-h-11 rounded-full border border-border bg-background px-3 text-sm text-foreground"
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

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p aria-live="polite" className="text-sm text-muted">
            {filtered.length === 1
              ? "1 registro publicado encontrado"
              : `${filtered.length} registros publicados encontrados`}
          </p>
          <div className="flex gap-2" role="group" aria-label="Modo de visualização da biblioteca">
            <button
              type="button"
              aria-pressed={viewMode === "grade"}
              onClick={() => setViewMode("grade")}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors ${
                viewMode === "grade"
                  ? "border-accent/50 bg-accent/12 text-accent"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              Grade
            </button>
            <button
              type="button"
              aria-pressed={viewMode === "estante"}
              onClick={() => setViewMode("estante")}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors ${
                viewMode === "estante"
                  ? "border-accent/50 bg-accent/12 text-accent"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              Estante
            </button>
          </div>
        </div>
        <p className="hidden text-xs uppercase tracking-[0.2em] text-muted sm:block">
          Acervo em consulta
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-border bg-surface/50 p-6" role="note">
          <p className="text-sm font-semibold text-foreground">Nenhum resultado nesta busca</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Ajuste os filtros ou o termo digitado. A busca considera somente registros culturais já publicados.
          </p>
        </div>
      ) : viewMode === "estante" ? (
        <OrbitalShelf entries={filtered} />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Registros da biblioteca cultural">
          {filtered.map((entry) => (
            <li key={entry.id}>
              <article className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-border/65 bg-surface/80 transition-transform duration-200 hover:-translate-y-0.5">
                <div
                  aria-hidden="true"
                  className={`relative flex overflow-hidden bg-gradient-to-br p-5 ${
                    entry.artwork ? "justify-center" : "h-44 items-end"
                  } ${coverTone(entry.library.format)}`}
                >
                  {entry.artwork ? (
                    <div className="w-full max-w-36">
                      <CulturalEntryArtwork entry={entry} variant="book-cover" />
                    </div>
                  ) : (
                    <>
                      <span className="absolute inset-x-0 bottom-0 h-px bg-foreground/10" />
                      <span className="absolute right-5 top-5 text-accent opacity-75">
                        <FormatMark format={entry.library.format} />
                      </span>
                      <span className="absolute right-8 top-16 h-px w-20 rotate-[-18deg] bg-accent/35" />
                      <span className="flex flex-col gap-1">
                        <span className="font-display text-5xl font-semibold leading-none tracking-tight text-foreground/90">
                          {getTitleInitials(entry.title)}
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                          Capa tipográfica
                        </span>
                      </span>
                    </>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-success">
                      {libraryFormatLabel(entry.library.format)}
                    </p>
                    <h2 className="font-display text-xl font-semibold leading-tight tracking-tight text-foreground">
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
                    className="mt-auto inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-accent transition-colors hover:text-foreground"
                  >
                    Ver ficha
                    <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
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
