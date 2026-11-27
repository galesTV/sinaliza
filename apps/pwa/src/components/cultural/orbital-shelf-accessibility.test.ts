import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("orbital shelf accessibility styles", () => {
  it("keeps vertical scrolling free and disables item transitions under reduced motion", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

    expect(css).toContain("touch-action: pan-y");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain(".orbital-item {\n    transition: none;");
  });
});
