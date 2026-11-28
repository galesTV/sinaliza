import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ThemeSelect } from "./theme-select";

describe("ThemeSelect SSR", () => {
  it("renders a neutral server state instead of guessing a browser preference", () => {
    const html = renderToStaticMarkup(<ThemeSelect />);
    expect(html).toContain('aria-label="Selecionar tema"');
    expect(html).toContain("Tema");
    expect(html).not.toContain('aria-label="Tema: Claro"');
    expect(html).not.toContain('aria-label="Tema: Escuro"');
    expect(html).not.toContain('aria-label="Tema: Sistema"');
  });

  it("uses one menu-capable button with a 44px minimum target", () => {
    const html = renderToStaticMarkup(<ThemeSelect />);
    expect(html).toContain('type="button"');
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("min-h-11");
    expect(html).toContain("min-w-11");
    expect(html).not.toContain('role="menu"');
  });
});
