"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import type { PublicCulturalLibraryEntry } from "@/data/cultural-publication";
import { getCulturalCategoryHref } from "@/data/cultural-taxonomy";
import { getTitleInitials } from "@/lib/cultural-explore";

import { IconArrowLeft, IconArrowRight } from "../icons";
import { CulturalEntryArtwork } from "./editorial/cultural-entry-artwork";
import { SINALIZA_EDITORIAL_REPRESENTATION_LABEL } from "./editorial/editorial-representation";
import editorialStyles from "./editorial/editorial-artwork.module.css";
import { libraryAccessLabel, libraryFormatLabel } from "./labels";

function formatClass(format: string | undefined): string {
  const normalized = format ?? "";
  if (normalized.includes("audiovisual") || normalized.includes("video")) return "orbital-item-media";
  if (normalized.includes("book") || normalized.includes("livro")) return "orbital-item-book";
  return "orbital-item-document";
}

export function OrbitalShelf({
  entries,
}: {
  entries: PublicCulturalLibraryEntry[];
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dragState = useRef<{ startX: number; consumed: boolean; moved: boolean } | null>(null);
  const suppressClickAfterDrag = useRef(false);
  const count = entries.length;
  const safeIndex = count === 0 ? 0 : Math.min(selectedIndex, count - 1);
  const selected = entries[safeIndex];

  const visibleItems = useMemo(
    () =>
      entries
        .map((entry, index) => ({ entry, index, offset: index - safeIndex }))
        .filter((item) => Math.abs(item.offset) <= 3),
    [entries, safeIndex],
  );

  function move(delta: number) {
    setSelectedIndex((current) => {
      if (count === 0) return 0;
      const clamped = Math.min(count - 1, Math.max(0, current));
      return Math.min(count - 1, Math.max(0, clamped + delta));
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      setSelectedIndex(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      setSelectedIndex(Math.max(0, count - 1));
    }
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    suppressClickAfterDrag.current = false;
    dragState.current = { startX: event.clientX, consumed: false, moved: false };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragState.current) return;
    const distance = event.clientX - dragState.current.startX;
    if (Math.abs(distance) >= 8) dragState.current.moved = true;
    if (dragState.current.consumed || Math.abs(distance) < 52) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    move(distance < 0 ? 1 : -1);
    dragState.current.consumed = true;
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (dragState.current?.moved) suppressClickAfterDrag.current = true;
    dragState.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleStageClick(event: React.MouseEvent<HTMLDivElement>) {
    if (suppressClickAfterDrag.current) {
      suppressClickAfterDrag.current = false;
      return;
    }

    const nodes = Array.from(event.currentTarget.querySelectorAll(".orbital-item"));
    const candidate = visibleItems
      .map((item, position) => {
        const rect = nodes[position]?.getBoundingClientRect();
        return { ...item, rect };
      })
      .filter(({ rect }) =>
        rect
        && event.clientX >= rect.left
        && event.clientX <= rect.right
        && event.clientY >= rect.top
        && event.clientY <= rect.bottom,
      )
      .sort((a, b) => Math.abs(a.offset) - Math.abs(b.offset))[0];

    if (candidate && candidate.offset !== 0) setSelectedIndex(candidate.index);
  }

  if (!selected) return null;

  return (
    <section aria-labelledby="orbital-shelf-title" className="orbital-shelf">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-success">Estante Orbital</p>
          <h2 id="orbital-shelf-title" className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Navegue pelo acervo em perspectiva
          </h2>
        </div>
        <p className="text-sm text-muted" aria-live="polite">
          Obra {safeIndex + 1} de {count}
        </p>
      </div>

      <div
        role="region"
        aria-label="Estante orbital da biblioteca cultural. Use as setas do teclado ou arraste horizontalmente para navegar."
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={handleStageClick}
        className="orbital-stage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <div aria-hidden="true" className="orbital-depth" />
        <div aria-hidden="true" className="orbital-items">
          {visibleItems.map(({ entry, index, offset }) => {
            const abs = Math.abs(offset);
            const selectedItem = index === safeIndex;
            return (
              <div
                key={entry.id}
                className={`orbital-item ${formatClass(entry.library.format)} ${selectedItem ? "is-selected" : ""}`}
                style={{
                  transform: `translate(-50%, -50%) translateX(${offset * 132}px) translateZ(${-abs * 92}px) rotateY(${offset * -24}deg) scale(${selectedItem ? 1 : 0.9 - abs * 0.035})`,
                  zIndex: 20 - abs,
                  opacity: Math.max(0.22, 1 - abs * 0.22),
                }}
              >
                <div className="orbital-spine">
                  {entry.artwork ? (
                    <CulturalEntryArtwork entry={entry} variant="book-spine" fill />
                  ) : (
                    <span className="orbital-initials">{getTitleInitials(entry.title)}</span>
                  )}
                </div>
                <div className={`orbital-cover ${entry.artwork ? "orbital-cover-artwork" : ""}`}>
                  {entry.artwork ? (
                    <CulturalEntryArtwork entry={entry} variant="book-cover" fill className={editorialStyles.compactSurface} />
                  ) : (
                    <>
                      <span className="orbital-format">{libraryFormatLabel(entry.library.format)}</span>
                      <strong className="orbital-title">{entry.title}</strong>
                      {entry.library.creators?.[0] && <small className="orbital-creator">{entry.library.creators[0]}</small>}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-secondary rounded-full"
            onClick={() => move(-1)}
            disabled={safeIndex === 0}
            aria-label="Obra anterior"
          >
            <IconArrowLeft className="h-4 w-4" />
            Anterior
          </button>
          <button
            type="button"
            className="btn-secondary rounded-full"
            onClick={() => move(1)}
            disabled={safeIndex >= count - 1}
            aria-label="Próxima obra"
          >
            Próxima
            <IconArrowRight className="h-4 w-4" />
          </button>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-muted">
          Use as setas, arraste horizontalmente ou os controles. A rolagem vertical da página permanece livre.
        </p>
      </div>

      <article aria-labelledby="orbital-selected-title" className="rounded-[1.5rem] border border-success/25 bg-success/8 p-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-success/35 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              {libraryFormatLabel(selected.library.format)}
            </span>
            {selected.library.publicationYear && (
              <span className="text-xs text-muted tabular-nums">{selected.library.publicationYear}</span>
            )}
          </div>
          <h3 id="orbital-selected-title" className="font-display text-2xl font-semibold leading-tight tracking-tight text-foreground">
            {selected.title}
          </h3>
          {selected.library.creators?.length ? (
            <p className="text-sm font-medium text-muted">{selected.library.creators.join(", ")}</p>
          ) : null}
          <p className="max-w-3xl text-sm leading-relaxed text-muted sm:text-base">{selected.summary}</p>
          {selected.artwork && (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-success">
              {SINALIZA_EDITORIAL_REPRESENTATION_LABEL}
            </p>
          )}
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className="font-semibold text-foreground">Acesso</dt>
              <dd className="text-muted">{libraryAccessLabel(selected.library.access)}</dd>
            </div>
            {selected.library.publisher && (
              <div className="flex gap-2">
                <dt className="font-semibold text-foreground">Publicação</dt>
                <dd className="text-muted">{selected.library.publisher}</dd>
              </div>
            )}
          </dl>
          <Link
            href={`${getCulturalCategoryHref("library")}/${selected.slug}`}
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-accent/35 px-4 text-sm font-semibold text-accent transition-colors hover:border-accent/60 hover:text-foreground"
          >
            Abrir ficha pública
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </section>
  );
}
