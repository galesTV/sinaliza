import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { HonestNote } from "./honest-note";

describe("HonestNote", () => {
  it("renders a compact note with role=note when no title is given", () => {
    const html = renderToStaticMarkup(
      <HonestNote>Conteúdo em preparação.</HonestNote>,
    );
    expect(html).toContain('role="note"');
    expect(html).toContain("Conteúdo em preparação.");
  });

  it("renders a titled panel", () => {
    const html = renderToStaticMarkup(
      <HonestNote title="Em breve">Detalhes pendentes.</HonestNote>,
    );
    expect(html).toContain("Em breve");
    expect(html).toContain("Detalhes pendentes.");
  });

  it("replaces the default glyph when a custom icon is provided", () => {
    const html = renderToStaticMarkup(
      <HonestNote icon={<svg data-testid="custom-icon" />}>Nota.</HonestNote>,
    );
    expect(html).toContain('data-testid="custom-icon"');
  });
});
