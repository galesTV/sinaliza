import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getLearningPath } from "@/data/learning-paths";

import { ModuleCard } from "./module-card";

describe("ModuleCard", () => {
  const modules = getLearningPath("vocabulario")!.modules;
  const firstModule = modules[0];

  it("links every lesson chip to its nested lesson page", () => {
    const html = renderToStaticMarkup(
      <ModuleCard
        module={firstModule}
        index={0}
        total={modules.length}
        pathSlug="vocabulario"
      />,
    );

    expect(html).toContain('href="/trilhas/vocabulario/saudacoes/ola"');
    expect(html).toContain('href="/trilhas/vocabulario/saudacoes/por-favor"');
  });

  it("exposes an anchor id matching the module slug", () => {
    const html = renderToStaticMarkup(
      <ModuleCard
        module={firstModule}
        index={0}
        total={modules.length}
        pathSlug="vocabulario"
      />,
    );
    expect(html).toContain('id="saudacoes"');
  });

  it("communicates the derived module state in text, not color alone", () => {
    // Invariant: whichever state the real catalog yields today, the badge
    // is one of the four derived labels — never a fixed placeholder.
    const html = renderToStaticMarkup(
      <ModuleCard
        module={firstModule}
        index={0}
        total={modules.length}
        pathSlug="vocabulario"
      />,
    );
    const derivedStates = [
      "Em preparação",
      "Disponível",
      "Em andamento",
      "Atividades publicadas percorridas",
    ];
    expect(
      derivedStates.some((label) => html.includes(label)),
    ).toBe(true);
    expect(html).not.toContain("Em breve");
  });

  it("states the module's position in the sequence for screen readers", () => {
    const html = renderToStaticMarkup(
      <ModuleCard
        module={modules[1]}
        index={1}
        total={modules.length}
        pathSlug="vocabulario"
      />,
    );
    expect(html).toContain(`Módulo 2 de ${modules.length}:`);
  });

  it("keeps the trajectory rail decorative only", () => {
    const html = renderToStaticMarkup(
      <ModuleCard
        module={firstModule}
        index={0}
        total={modules.length}
        pathSlug="vocabulario"
      />,
    );
    expect(html).toContain('aria-hidden="true"');
  });

  it("draws the connecting edge unless it is the last module", () => {
    const middle = renderToStaticMarkup(
      <ModuleCard
        module={firstModule}
        index={0}
        total={modules.length}
        pathSlug="vocabulario"
      />,
    );
    const last = renderToStaticMarkup(
      <ModuleCard
        module={modules[modules.length - 1]}
        index={modules.length - 1}
        total={modules.length}
        isLast
        pathSlug="vocabulario"
      />,
    );

    expect(middle).toContain("bg-gradient-to-b");
    expect(last).not.toContain("bg-gradient-to-b");
  });
});
