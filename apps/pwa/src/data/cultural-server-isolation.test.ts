import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const dataDir = join(process.cwd(), "src/data");

function source(fileName: string): string {
  return readFileSync(join(dataDir, fileName), "utf8");
}

describe("cultural server isolation markers", () => {
  it("marks editorial data and the public server facade as server-only", () => {
    expect(source("cultural-catalog.ts")).toContain('import "server-only";');
    expect(source("cultural-public.ts")).toContain('import "server-only";');
  });

  it("keeps type and pure publication modules importable for controlled tests", () => {
    expect(source("cultural-catalog-model.ts")).not.toContain('import "server-only";');
    expect(source("cultural-publication.ts")).not.toContain('import "server-only";');
  });
});
