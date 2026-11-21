import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import LaboratorioPage, { metadata } from "./page";

describe("laboratório index page", () => {
  const html = renderToStaticMarkup(<LaboratorioPage />);

  it("is noindexed laboratory content", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(html).toContain("Laboratório experimental");
  });

  it("lists the demo journey in the meaningful sequence", () => {
    const ordered = [
      "/laboratorio/experiencia",
      "/laboratorio/licoes",
      "/laboratorio/alfabeto",
      "/laboratorio/maos",
    ];
    let previous = -1;
    for (const href of ordered) {
      const position = html.indexOf(`href="${href}"`);
      expect(position, `missing link to ${href}`).toBeGreaterThan(previous);
      previous = position;
    }
  });

  it("links the optional technical examples", () => {
    for (const href of [
      "/laboratorio/licao",
      "/laboratorio/licao-visual",
      "/laboratorio/licao-visual-bloqueada",
    ]) {
      expect(html).toContain(`href="${href}"`);
    }
  });

  it("is explicit that demos are not published or validated Libras content", () => {
    expect(html).toContain("Não são lições publicadas");
    expect(html).toContain("reconhece sinais de Libras");
    expect(html).toContain("não registra progresso");
  });

  it("links back to the learning paths", () => {
    expect(html).toContain('href="/trilhas"');
  });
});
