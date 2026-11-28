import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  editorialAcademicFixture,
  editorialLegalDocumentFixture,
  editorialLiteraryFixture,
  editorialLongTitleFixture,
  editorialMinimalFixtures,
  editorialMonogramFixture,
  editorialMotifFixtures,
  editorialTimelineFixture,
} from "@/test/cultural-editorial-fixtures";

import { CulturalEditorialArtwork } from "./cultural-editorial-artwork";
import { EDITORIAL_PALETTES } from "./editorial-palettes";

function srgbChannel(value: number): number {
  const channel = value / 255;
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  return [0, 2, 4].map((index) =>
    Number.parseInt(normalized.slice(index, index + 2), 16),
  ) as [number, number, number];
}

function luminance(hex: string): number {
  const [red, green, blue] = hexToRgb(hex).map(srgbChannel);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort(
    (left, right) => right - left,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

function render(props: Parameters<typeof CulturalEditorialArtwork>[0]) {
  return renderToStaticMarkup(<CulturalEditorialArtwork {...props} />);
}

describe("cultural editorial artwork", () => {
  it("renders all eight approved motifs with synthetic content", () => {
    expect(editorialMotifFixtures).toHaveLength(8);

    const html = editorialMotifFixtures
      .map((fixture) => render(fixture))
      .join("\n");

    for (const motif of [
      "timeline",
      "legal-document",
      "diversity-orbits",
      "parallel-structures",
      "visual-rhythm",
      "monogram",
      "academic",
      "literary",
    ]) {
      expect(html).toContain(`data-motif="${motif}"`);
    }

    expect(html).toContain("Marco editorial fictício");
    expect(html).toContain("Documento legal fictício");
    expect(html).toContain("Pessoa Fictícia Editorial");
    expect(html).toContain("Narrativa Fictícia do Acervo Ilustrado");
    expect(html).not.toContain("HIST-001");
    expect(html).not.toContain("CUR-001");
    expect(html).not.toContain("PER-001");
    expect(html).not.toContain("BIB-003");
    expect(html).not.toContain("Nelson Pimenta");
    expect(html).not.toContain("Cinderela Surda");
  });

  it("uses the four approved editorial palettes", () => {
    expect(EDITORIAL_PALETTES.history).toEqual({
      background: "#3B2B20",
      accent: "#F0A848",
      foreground: "#F2E4CB",
    });
    expect(EDITORIAL_PALETTES.curiosity).toEqual({
      background: "#183B50",
      accent: "#35C9E8",
      foreground: "#D9F5FA",
    });
    expect(EDITORIAL_PALETTES.personality).toEqual({
      background: "#30274F",
      accent: "#C7C0FF",
      foreground: "#F4F0FF",
    });
    expect(EDITORIAL_PALETTES.library).toEqual({
      background: "#163E37",
      accent: "#83DFB8",
      foreground: "#E0F1E8",
    });

    const html = render(editorialTimelineFixture);
    expect(html).toContain("--editorial-background:#3B2B20");
    expect(html).toContain("--editorial-accent:#F0A848");
    expect(html).toContain("--editorial-foreground:#F2E4CB");
  });

  it("keeps text and accent contrast at WCAG AA on editorial backgrounds", () => {
    for (const palette of Object.values(EDITORIAL_PALETTES)) {
      expect(
        contrastRatio(palette.foreground, palette.background),
        `${palette.foreground} on ${palette.background}`,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(palette.accent, palette.background),
        `${palette.accent} on ${palette.background}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("renders every layout variant explicitly", () => {
    for (const variant of [
      "card",
      "thumbnail",
      "detail",
      "book-cover",
      "book-spine",
    ] as const) {
      const html = render({ ...editorialAcademicFixture, variant });
      expect(html).toContain(`data-variant="${variant}"`);
      expect(html).toContain("Compêndio Fictício de Estudos Editoriais");
    }
  });

  it("renders spine typography without interactive controls", () => {
    const html = render({ ...editorialLiteraryFixture, variant: "book-spine" });
    expect(html).toContain('data-variant="book-spine"');
    expect(html).toContain("Narrativa Fictícia do Acervo Ilustrado");
    expect(html).toContain("Sinaliza");
    expect(html).not.toContain("<button");
    expect(html).not.toContain("<a ");
  });

  it("renders with optional metadata absent", () => {
    for (const fixture of editorialMinimalFixtures) {
      const html = render(fixture);
      expect(html).toContain(fixture.title);
      expect(html).not.toContain("undefined");
      expect(html).not.toContain("null");
    }
  });

  it("preserves long titles as real text in the DOM", () => {
    const html = render(editorialLongTitleFixture);
    expect(html).toContain("extraordinariamente longo");
    expect(html).toContain("hierarquia editorial");
  });

  it("keeps SVG ornament hidden and does not create interactive artwork internals", () => {
    const html = editorialMotifFixtures
      .map((fixture) => render(fixture))
      .join("\n");

    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("<button");
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("tabindex");
    expect(html).not.toContain('role="button"');
  });

  it("marks bibliographic artwork as an editorial representation", () => {
    const html = render(editorialAcademicFixture);
    expect(html).toContain("Representação editorial");
    expect(html).not.toContain("capa oficial");
  });

  it("uses locally parameterized monograms instead of portraits", () => {
    const html = render(editorialMonogramFixture);
    expect(html).toContain("PF");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("retrato");
  });

  it("keeps the portrait presentation single-column and centered", () => {
    const css = readFileSync(
      join(process.cwd(), "src/components/cultural/editorial/editorial-artwork.module.css"),
      "utf8",
    );

    expect(css).toMatch(/\.portraitSurface \.inner \{[^}]*grid-template-columns: minmax\(0, 1fr\)/);
    expect(css).toMatch(/\.portraitSurface \.visual \{[^}]*grid-column: 1;[^}]*grid-row: 2;/);
    expect(css).toMatch(/\.portraitSurface \.monogramVisual \{[^}]*justify-content: center;/);
  });

  it("keeps legal-document ornament free of seals and coats of arms", () => {
    const html = render(editorialLegalDocumentFixture);
    expect(html).toContain("Documento legal fictício de teste visual");
    expect(html).not.toContain("brasão");
    expect(html).not.toContain("selo");
  });
});

describe("cultural editorial artwork source isolation", () => {
  function sourcesUnder(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
      const path = join(dir, item.name);
      if (item.isDirectory()) return sourcesUnder(path);
      return /\.(ts|tsx|css)$/.test(item.name) && !item.name.includes(".test.")
        ? [path]
        : [];
    });
  }

  it("does not import editorial catalog or server-only public facade", () => {
    const dir = join(process.cwd(), "src/components/cultural/editorial");
    for (const path of sourcesUnder(dir)) {
      const source = readFileSync(path, "utf8");
      expect(source, path).not.toContain("@/data/cultural-catalog");
      expect(source, path).not.toContain("@/data/cultural-public");
      expect(source, path).not.toContain('import "server-only"');
    }
  });

  it("does not hard-code real cultural IDs, slugs or prototype record titles", () => {
    const prohibited = [
      "HIST-001",
      "HIST-006",
      "CUR-001",
      "CUR-002",
      "CUR-006",
      "PER-001",
      "BIB-003",
      "BIB-005",
      "1857-fundacao-do-instituto-que-se-tornou-o-ines",
      "nelson-pimenta",
      "gramatica-da-libras",
      "cinderela-surda",
    ];
    const files = [
      ...sourcesUnder(join(process.cwd(), "src/components/cultural/editorial")),
      join(process.cwd(), "src/test/cultural-editorial-fixtures.ts"),
    ];

    for (const path of files) {
      const source = readFileSync(path, "utf8");
      for (const term of prohibited) {
        expect(source, `${path} must not contain ${term}`).not.toContain(term);
      }
    }
  });

  it("keeps layout styles inside the local CSS module", () => {
    const css = readFileSync(
      join(
        process.cwd(),
        "src/components/cultural/editorial/editorial-artwork.module.css",
      ),
      "utf8",
    );
    expect(css).toContain(".variantBookCover");
    expect(css).toContain("aspect-ratio: 2 / 3");
    expect(css).toContain(".variantBookSpine");
    expect(css).toContain("prefers-reduced-motion");
    expect(css).not.toContain("#3B2B20");
  });

  it("scopes the Tailwind Turbopack loader away from CSS Modules", () => {
    const config = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");
    expect(config).toContain('"**/globals.css"');
    expect(config).not.toMatch(/^\s{6}"\*\.css"\s*:/m);
  });
});
