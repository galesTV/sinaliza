import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function sourcesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    const path = join(dir, item.name);
    if (item.isDirectory()) return sourcesUnder(path);
    return /\.(ts|tsx)$/.test(item.name) ? [path] : [];
  });
}

const exploreSources = [
  ...sourcesUnder(join(process.cwd(), "src/app/explorar")),
  ...sourcesUnder(join(process.cwd(), "src/components/cultural")),
];

describe("explore editorial isolation", () => {
  it("never imports the raw editorial catalog in routes or cultural components", () => {
    for (const path of exploreSources) {
      const source = readFileSync(path, "utf8");
      expect(source, path).not.toMatch(/from ["'](?:@\/data\/cultural-catalog|\.\.?\/.*cultural-catalog)["']/);
    }
  });

  it("keeps interactive cultural components on projected DTOs instead of the server facade", () => {
    for (const path of exploreSources) {
      const source = readFileSync(path, "utf8");
      if (!source.startsWith('"use client"')) continue;
      expect(source, path).not.toMatch(/from ["']@\/data\/cultural-public["']/);
      expect(source, path).not.toContain('import "server-only"');
    }
  });

  it("does not create a public draft preview route for cultural candidates", () => {
    for (const path of exploreSources) {
      expect(path).not.toMatch(/preview|draft|rascunho/i);
    }
  });
});
