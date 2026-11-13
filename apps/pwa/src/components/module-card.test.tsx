import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getLearningPath } from "@/data/learning-paths";

import { ModuleCard } from "./module-card";

describe("ModuleCard", () => {
  const firstModule = getLearningPath("vocabulario")!.modules[0];

  it("links every lesson chip to its nested lesson page", () => {
    const html = renderToStaticMarkup(
      <ModuleCard module={firstModule} index={0} pathSlug="vocabulario" />,
    );

    expect(html).toContain('href="/trilhas/vocabulario/saudacoes/ola"');
    expect(html).toContain('href="/trilhas/vocabulario/saudacoes/por-favor"');
  });

  it("exposes an anchor id matching the module slug", () => {
    const html = renderToStaticMarkup(
      <ModuleCard module={firstModule} index={0} pathSlug="vocabulario" />,
    );
    expect(html).toContain('id="saudacoes"');
  });

  it("communicates the planned state in text, not color alone", () => {
    const html = renderToStaticMarkup(
      <ModuleCard module={firstModule} index={0} pathSlug="vocabulario" />,
    );
    expect(html).toContain("Em breve");
  });
});
