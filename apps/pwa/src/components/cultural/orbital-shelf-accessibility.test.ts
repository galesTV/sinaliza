import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const EXPECTED_REDUCED_MOTION_RULE = ".orbital-item {\n    transition: none;";

function normalizeNewlines(source: string) {
  return source.replace(/\r\n/g, "\n");
}

describe("orbital shelf accessibility styles", () => {
  it("keeps vertical scrolling free and disables item transitions under reduced motion", () => {
    const css = normalizeNewlines(
      readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8"),
    );

    expect(css).toContain("touch-action: pan-y");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain(EXPECTED_REDUCED_MOTION_RULE);
  });

  it.each([
    ["LF", ".orbital-item {\n    transition: none;"],
    ["CRLF", ".orbital-item {\r\n    transition: none;"],
  ])("accepts %s newlines in the reduced-motion rule", (_label, source) => {
    expect(normalizeNewlines(source)).toContain(EXPECTED_REDUCED_MOTION_RULE);
  });

  it("still rejects styles missing the reduced-motion rule", () => {
    const missingRule = ".orbital-item {\r\n    transition: color;";

    expect(normalizeNewlines(missingRule)).not.toContain(
      EXPECTED_REDUCED_MOTION_RULE,
    );
  });
});
