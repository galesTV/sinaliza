"use client";

import { useState } from "react";

import type { LessonMediaBlock } from "@/data/lesson-content";

/**
 * Accessible lesson media: native <video>/<img>, never autoplaying or
 * looping, keyboard-operable via the browser's own controls. The textual
 * `description` and attribution live outside the media element so they work
 * with no playback, no plugins and screen readers. On load failure the frame
 * degrades to an honest notice while the description keeps covering the
 * content.
 */
export function LessonMedia({ block }: { block: LessonMediaBlock }) {
  const [failed, setFailed] = useState(false);
  const { media, attribution } = block;

  return (
    <figure className="flex flex-col gap-3">
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black/60">
        {failed ? (
          <div
            role="alert"
            className="grid h-full place-items-center p-6 text-center text-sm leading-relaxed text-muted"
          >
            Não foi possível carregar a mídia agora. A descrição abaixo cobre o
            conteúdo deste passo.
          </div>
        ) : media.type === "video" ? (
          <video
            controls
            playsInline
            preload="metadata"
            poster={media.poster}
            aria-label={block.title}
            className="h-full w-full"
            onError={() => setFailed(true)}
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
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- lesson media stays dependency-free; next/image is not used in this app
          <img
            src={media.src}
            alt={media.alt}
            className="h-full w-full object-contain"
            onError={() => setFailed(true)}
          />
        )}
      </div>

      <p className="text-sm leading-relaxed text-muted">{block.description}</p>

      <figcaption className="text-xs leading-relaxed text-muted/70">
        Fonte:{" "}
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
    </figure>
  );
}
