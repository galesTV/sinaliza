"use client";

import { useState } from "react";

import {
  hasMediaDisplayPermission,
  type LessonMediaBlock,
} from "@/data/lesson-content";

/**
 * Accessible lesson media: native <video>/<img>, never autoplaying or
 * looping, keyboard-operable via the browser's own controls. The textual
 * `description` and attribution live outside the media element so they work
 * with no playback, no plugins and screen readers. On load failure the frame
 * degrades to an honest notice while the description keeps covering the
 * content.
 *
 * Permission gate (fail-closed): the asset only renders when its
 * attribution records source, license AND a non-empty permission evidence
 * reference (`hasMediaDisplayPermission`). Without it, an honest "em
 * produção" panel replaces the media — in published lessons AND in draft
 * previews, which go through this same component. The gate checks that
 * evidence was recorded; it cannot prove the evidence is legally valid —
 * that verification belongs to the human review chain.
 *
 * `onUnavailable` lets callers (e.g. visual exercises) react when the asset
 * cannot be shown — either gated by permission or failed to load — so they
 * can fall back to an alternative instead of presenting a hidden stimulus.
 */
export function LessonMedia({
  block,
  onUnavailable,
}: {
  block: LessonMediaBlock;
  onUnavailable?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const { media, attribution } = block;
  const permitted = hasMediaDisplayPermission(attribution);

  const handleError = () => {
    setFailed(true);
    onUnavailable?.();
  };

  const caption = (
    <figcaption className="text-xs leading-relaxed text-muted">
      {/* Required credit format (e.g. "Imagem: autor | acervo") for
          photographs; other media types keep the generic source label. */}
      {media.type === "image" ? "Imagem:" : "Fonte:"}{" "}
      {attribution.sourceUrl ? (
        <a
          href={attribution.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          {attribution.source}
        </a>
      ) : (
        attribution.source
      )}
      {" · Licença: "}
      {attribution.licenseUrl ? (
        <a
          href={attribution.licenseUrl}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          {attribution.license}
        </a>
      ) : (
        attribution.license
      )}
    </figcaption>
  );

  if (!permitted) {
    return (
      <figure className="flex flex-col gap-3">
        <div
          role="status"
          className="grid aspect-video w-full place-items-center rounded-2xl border border-dashed border-border bg-surface/60 p-6 text-center text-sm leading-relaxed text-muted"
        >
          Demonstração visual em produção — nenhum material com permissão de
          uso registrada está disponível ainda. A descrição abaixo cobre o
          conteúdo deste passo.
        </div>
        <p className="text-sm leading-relaxed text-muted">
          {block.description}
        </p>
        {caption}
      </figure>
    );
  }

  return (
    <figure className="flex flex-col gap-3">
      {failed ? (
        <div
          role="alert"
          className="grid aspect-video w-full place-items-center rounded-2xl border border-border bg-black/60 p-6 text-center text-sm leading-relaxed text-muted"
        >
          Não foi possível carregar a mídia agora. A descrição abaixo cobre o
          conteúdo deste passo.
        </div>
      ) : media.type === "video" ? (
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black/60">
          <video
            controls
            playsInline
            preload="metadata"
            poster={media.poster}
            aria-label={block.title}
            className="h-full w-full"
            onError={handleError}
          >
            <source src={media.src} />
            {media.captions && (
              <track
                kind="captions"
                src={media.captions.src}
                srcLang={media.captions.srclang}
                label={media.captions.label}
                default
              />
            )}
          </video>
        </div>
      ) : (
        // Photographs render at their natural aspect ratio — no fixed-height
        // frame letterboxing portrait shots into dark side bars, no crop.
        // eslint-disable-next-line @next/next/no-img-element -- lesson media stays dependency-free; next/image is not used in this app
        <img
          src={media.src}
          alt={media.alt}
          className="mx-auto h-auto w-auto max-w-full max-h-[70vh] rounded-2xl border border-border object-contain"
          onError={handleError}
        />
      )}

      <p className="text-sm leading-relaxed text-muted">{block.description}</p>

      {caption}
    </figure>
  );
}
