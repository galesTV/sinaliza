import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("Conexões/Constelação theme token foundation", () => {
  it("keeps destructive text and destructive fill semantically separate", () => {
    expect(css).toContain("--destructive: #f87171;");
    expect(css).toContain("--destructive-fill: #dc2626;");
    expect(css).toContain("--color-destructive-fill: var(--destructive-fill);");
  });

  it("exposes quiet controls, media surfaces and theme-aware card shadows", () => {
    expect(css).toContain("--control-quiet-disabled:");
    expect(css).toContain("--color-control-quiet-disabled: var(--control-quiet-disabled);");
    expect(css).toContain("--shadow-card:");
    expect(css).toContain("--media-surface:");
  });

  it("keeps the dark primary button fill on the accessible violet gradient", () => {
    expect(css).toContain("--button-primary-start: #6957e8;");
    expect(css).toContain("--button-primary-end: #6b58f0;");
  });

  it("raises constellation visibility only inside the light theme", () => {
    const light = css.slice(css.indexOf('html[data-theme="light"]'), css.indexOf("@theme inline"));
    expect(light).toContain("--constellation-line-opacity: 0.48;");
    expect(light).toContain("--constellation-dust-opacity: 0.28;");
    expect(light).toContain("--constellation-cultural-opacity: 0.46;");
  });

  it("keeps orbital shelf colors tokenized instead of hardcoded in the component styles", () => {
    const orbital = css.slice(css.indexOf(".orbital-stage {"));
    expect(orbital).toContain("var(--orbital-stage-background-start)");
    expect(orbital).toContain("var(--orbital-cover-text)");
    expect(orbital).toContain("var(--orbital-selected-border)");
    expect(orbital).not.toContain("rgb(12 27 48 / 0.62)");
    expect(orbital).not.toContain("rgb(53 201 232 / 0.45)");
  });
});
