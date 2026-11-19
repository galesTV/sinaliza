import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { LessonMediaBlock } from "@/data/lesson-content";

import { LessonMedia } from "./lesson-media";

/** Synthetic test fixture — not Libras material. */
const videoBlock: LessonMediaBlock = {
  kind: "media",
  title: "Demonstração sintética",
  description: "Descrição legível sem assistir ao vídeo.",
  media: {
    type: "video",
    src: "/media/fixtures/demo-pulse.mp4",
    poster: "/media/fixtures/demo-poster.png",
    captions: {
      src: "/media/fixtures/demo-captions.vtt",
      srclang: "pt-BR",
      label: "Português",
    },
  },
  attribution: {
    source: "Sinaliza — ativo sintético",
    sourceUrl: "https://example.com/fonte",
    license: "Uso interno em testes",
    licenseUrl: "https://example.com/licenca",
    permissionEvidence: "Ativo sintético de produção própria para testes.",
  },
};

describe("LessonMedia", () => {
  it("renders a native video with controls, poster and no autoplay/loop", () => {
    const html = renderToStaticMarkup(<LessonMedia block={videoBlock} />);
    expect(html).toContain("<video");
    expect(html).toContain("controls");
    expect(html).toContain('preload="metadata"');
    expect(html).toContain('poster="/media/fixtures/demo-poster.png"');
    expect(html).not.toContain("autoplay");
    expect(html).not.toContain("loop");
    expect(html).toContain('src="/media/fixtures/demo-pulse.mp4"');
  });

  it("exposes an accessible title and keeps the description outside playback", () => {
    const html = renderToStaticMarkup(<LessonMedia block={videoBlock} />);
    expect(html).toContain('aria-label="Demonstração sintética"');
    expect(html).toContain("Descrição legível sem assistir ao vídeo.");
  });

  it("renders the WebVTT caption track", () => {
    const html = renderToStaticMarkup(<LessonMedia block={videoBlock} />);
    expect(html).toContain('kind="captions"');
    expect(html).toContain('src="/media/fixtures/demo-captions.vtt"');
    expect(html).toContain('srcLang="pt-BR"');
    expect(html).toContain('label="Português"');
  });

  it("always displays source and license with optional links", () => {
    const html = renderToStaticMarkup(<LessonMedia block={videoBlock} />);
    expect(html).toContain("Sinaliza — ativo sintético");
    expect(html).toContain("Uso interno em testes");
    expect(html).toContain('href="https://example.com/fonte"');
    expect(html).toContain('href="https://example.com/licenca"');
  });

  it("renders an image variant with required alt text", () => {
    const imageBlock: LessonMediaBlock = {
      ...videoBlock,
      media: {
        type: "image",
        src: "/media/fixtures/diagram.png",
        alt: "Diagrama sintético de teste",
      },
    };
    const html = renderToStaticMarkup(<LessonMedia block={imageBlock} />);
    expect(html).toContain("<img");
    expect(html).toContain('alt="Diagrama sintético de teste"');
    expect(html).not.toContain("<video");
  });

  it("omits the caption track when none is provided", () => {
    const noCaptions: LessonMediaBlock = {
      ...videoBlock,
      media: { type: "video", src: "/media/x.mp4" },
    };
    const html = renderToStaticMarkup(<LessonMedia block={noCaptions} />);
    expect(html).not.toContain('kind="captions"');
    // Description and attribution still render without tracks.
    expect(html).toContain("Descrição legível sem assistir ao vídeo.");
  });

  it("does not render the asset without permission evidence (fail-closed)", () => {
    const gated: LessonMediaBlock = {
      ...videoBlock,
      attribution: {
        source: "Sinaliza — ativo sintético",
        license: "Uso interno em testes",
      },
    };
    const html = renderToStaticMarkup(<LessonMedia block={gated} />);
    // The asset itself never renders — no video element and no media URL.
    expect(html).not.toContain("<video");
    expect(html).not.toContain("demo-pulse.mp4");
    // The honest fallback states the media is not yet permitted.
    expect(html).toContain("em produção");
    // Attribution and description are preserved in the fallback.
    expect(html).toContain("Sinaliza — ativo sintético");
    expect(html).toContain("Uso interno em testes");
    expect(html).toContain("Descrição legível sem assistir ao vídeo.");
  });

  it("does not render the asset with blank permission evidence", () => {
    const gated: LessonMediaBlock = {
      ...videoBlock,
      attribution: {
        ...videoBlock.attribution,
        permissionEvidence: "   ",
      },
    };
    const html = renderToStaticMarkup(<LessonMedia block={gated} />);
    expect(html).not.toContain("<video");
    expect(html).toContain("em produção");
  });
});
