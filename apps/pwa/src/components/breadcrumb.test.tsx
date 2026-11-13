import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Breadcrumb } from "./breadcrumb";

const ITEMS = [
  { label: "Trilhas", href: "/trilhas" },
  { label: "Alfabeto manual", href: "/trilhas/alfabeto" },
  { label: "Letras A–E", href: "/trilhas/alfabeto#letras-a-e" },
  { label: "Letra A", href: "/trilhas/alfabeto/letra-a" },
];

describe("Breadcrumb", () => {
  it("marks the last item as the current page", () => {
    const html = renderToStaticMarkup(<Breadcrumb items={ITEMS} />);
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("Letra A");
  });

  it("renders ancestors as links and the current item as text", () => {
    const html = renderToStaticMarkup(<Breadcrumb items={ITEMS} />);
    expect(html).toContain('href="/trilhas"');
    expect(html).toContain('href="/trilhas/alfabeto#letras-a-e"');
    // The last item's own href is ignored: it renders as a span, not a link.
    expect(html).toContain('<span aria-current="page"');
    expect(html).not.toContain("/trilhas/alfabeto/letra-a");
    expect(html).not.toContain("Letra A</a>");
  });

  it("uses an accessible breadcrumb landmark", () => {
    const html = renderToStaticMarkup(<Breadcrumb items={ITEMS} />);
    expect(html).toContain('aria-label="Trilha de navegação"');
    expect(html).toContain("<ol ");
  });
});
