import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("home page", () => {
  const html = renderToStaticMarkup(<HomePage />);

  it("offers a highlighted CTA to the guided lab experience", () => {
    expect(html).toContain('href="/laboratorio/experiencia"');
    expect(html).toContain("Iniciar demonstração");
  });

  it("shows the lab section before the learning paths", () => {
    const lab = html.indexOf('id="lab-title"');
    const paths = html.indexOf('id="paths-title"');
    expect(lab).toBeGreaterThan(-1);
    expect(paths).toBeGreaterThan(-1);
    expect(lab).toBeLessThan(paths);
  });

  it("marks the demo as experimental, not validated Libras content", () => {
    expect(html).toContain("ainda não é uma lição validada de Libras");
    expect(html).toContain("não fazem parte das trilhas");
  });

  it("keeps the learning-paths entry point and publication counters", () => {
    expect(html).toContain("Trilhas de aprendizagem");
    expect(html).toContain("publicadas");
    expect(html.indexOf('href="/trilhas')).toBeGreaterThan(-1);
  });
});
