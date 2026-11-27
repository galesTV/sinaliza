import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { culturalCatalog, getCulturalEntryById } from "./cultural-catalog";
import { getCulturalContentFingerprint } from "./cultural-publication";
import type { CulturalCatalogEntry } from "./cultural-catalog-model";

const v2Dir = join(process.cwd(), "docs/curadoria-cultural/v2/pacote-original");
const v21Dir = join(process.cwd(), "docs/curadoria-cultural/v2.1/pacote-original");
const tracePath = join(process.cwd(), "docs/curadoria-cultural/v2.1/rastreabilidade-r53b2.md");

type SourceClaim = { id: string; entryId: string; text: string; url: string; locator: string; consultation: string; consultedAt?: string };
type TraceRow = { claimId: string; entryId: string; text: string; originalUrl: string; runtimeUrl: string; referenceId: string; institution: string; locator: string; state: string; date: string; transformation: string; caveats: string; versionFingerprint: string };

function sha256(bytes: Buffer) {
  return createHash("sha256").update(bytes).digest("hex");
}

function validateManifest(root: string) {
  const problems: string[] = [];
  let raw: string;
  try {
    raw = readFileSync(join(root, "manifesto-sha256.json"), "utf8");
  } catch {
    return ["missing manifest"];
  }
  let manifest: Record<string, string>;
  try {
    manifest = JSON.parse(raw) as Record<string, string>;
  } catch {
    return ["malformed manifest"];
  }
  const keys = [...raw.matchAll(/"([^"\\]+)"\s*:/g)].map((match) => match[1]);
  if (new Set(keys).size !== keys.length) problems.push("duplicate manifest entries");
  for (const [file, expected] of Object.entries(manifest)) {
    const path = join(root, file);
    if (!existsSync(path)) {
      problems.push(`missing file ${file}`);
    } else if (sha256(readFileSync(path)) !== expected) {
      problems.push(`hash mismatch ${file}`);
    }
  }
  return problems;
}

function parseTrace(): TraceRow[] {
  return readFileSync(tracePath, "utf8")
    .split("\n")
    .filter((line) => line.startsWith("| `"))
    .map((line) => {
      const cells = line.split("|").map((cell) => cell.trim());
      const uncode = (value: string) => value.replace(/^`|`$/g, "");
      return {
        claimId: uncode(cells[1]), entryId: uncode(cells[2]), text: cells[3],
        originalUrl: cells[5], runtimeUrl: cells[6], referenceId: uncode(cells[7]),
        institution: cells[8], locator: cells[9], state: uncode(cells[10]), date: cells[11],
        transformation: cells[12], caveats: cells[13], versionFingerprint: cells[14],
      };
    });
}

function validateClaimBinding(catalog: CulturalCatalogEntry[], expected: Pick<TraceRow, "claimId" | "entryId" | "text" | "runtimeUrl" | "referenceId">) {
  const problems: string[] = [];
  const entry = catalog.find((item) => item.id === expected.entryId);
  if (!entry) return [`missing record ${expected.entryId}`];
  const matches = entry.claims.filter((claim) => claim.id === expected.claimId);
  if (matches.length === 0) problems.push(`missing claim ${expected.claimId}`);
  if (matches.length > 1) problems.push(`duplicate claim ${expected.claimId}`);
  const claim = matches[0];
  if (!claim) return problems;
  if (!claim.id.startsWith(`${entry.id}-`)) problems.push(`claim ${claim.id} has wrong owner`);
  if (claim.text !== expected.text) problems.push(`altered text ${expected.claimId}`);
  if (!claim.referenceIds.includes(expected.referenceId)) problems.push(`wrong reference ${expected.claimId}`);
  const reference = entry.references.find((item) => item.id === expected.referenceId);
  if (!reference) problems.push(`missing reference ${expected.referenceId}`);
  else if (reference.url !== expected.runtimeUrl) problems.push(`wrong URL ${expected.claimId}`);
  return problems;
}

function validateAuthorizedTransformation(originalUrl: string, runtimeUrl: string, transformation: string) {
  if (transformation === "nenhuma") return originalUrl === runtimeUrl ? [] : ["unauthorized URL change"];
  if (transformation.includes("remoção determinística do sufixo ?show=full")) {
    return originalUrl.endsWith("?show=full") && runtimeUrl === originalUrl.slice(0, -10)
      ? []
      : ["unauthorized canonicalization"];
  }
  if (transformation.includes("substituição por referência institucional alternativa HTTPS")) {
    return originalUrl === "http://tede.ufsc.br/teses/PGET0138-D.pdf" && runtimeUrl === "https://repositorio.ufsc.br/handle/123456789/100721"
      ? []
      : ["unauthorized institutional substitution"];
  }
  return ["unauthorized transformation"];
}

const adendoClaims: SourceClaim[] = [
  { id: "PER-001-C05", entryId: "PER-001", text: "Nelson Pimenta de Castro é identificado como uma liderança surda pelo Inventário Nacional da Diversidade Linguística.", url: "https://indl.iphan.gov.br/pessoas-de-referencia/nelson-pimenta-de-castro/", locator: "Relação com a língua → Caracterização das pessoas", consultation: "content-checked", consultedAt: "2026-11-27" },
  { id: "PER-001-C06", entryId: "PER-001", text: "Nelson Pimenta de Castro possui trajetória artística no teatro, incluindo atuação no espetáculo Nelson 6 ao Vivo.", url: "https://nuestra.ufsc.br/vocab/index.php?tema=42&/nelson-pimenta-de-castro", locator: "Nota de escopo, primeiro e terceiro parágrafos", consultation: "content-checked", consultedAt: "2026-11-27" },
  { id: "PER-001-C07", entryId: "PER-001", text: "Nelson Pimenta de Castro concluiu mestrado e doutorado em Estudos da Tradução pela Universidade Federal de Santa Catarina.", url: "https://nuestra.ufsc.br/vocab/index.php?tema=42&/nelson-pimenta-de-castro", locator: "Nota de escopo e Nota bibliográfica", consultation: "content-checked", consultedAt: "2026-11-27" },
];

const complementary = JSON.parse(readFileSync(join(v21Dir, "claims-complementares.json"), "utf8")) as SourceClaim[];
const recovered = JSON.parse(readFileSync(join(v21Dir, "claims-recuperadas.json"), "utf8")) as SourceClaim[];
const rows = parseTrace();

describe("cultural curation package byte integrity", () => {
  it("validates the real V2 and V2.1 manifests byte-exactly", () => {
    expect(validateManifest(v2Dir)).toEqual([]);
    expect(validateManifest(v21Dir)).toEqual([]);
    expect(Object.keys(JSON.parse(readFileSync(join(v2Dir, "manifesto-sha256.json"), "utf8")))).toHaveLength(16);
    expect(Object.keys(JSON.parse(readFileSync(join(v21Dir, "manifesto-sha256.json"), "utf8")))).toHaveLength(10);
  });

  it("rejects missing, divergent, duplicate and malformed manifests synthetically", () => {
    const dir = mkdtempSync(join(tmpdir(), "cultural-manifest-"));
    try {
      writeFileSync(join(dir, "a.txt"), "a");
      writeFileSync(join(dir, "manifesto-sha256.json"), JSON.stringify({ "a.txt": sha256(Buffer.from("a")), "missing.txt": "0".repeat(64) }));
      expect(validateManifest(dir).join("\n")).toContain("missing file missing.txt");
      writeFileSync(join(dir, "a.txt"), "changed");
      expect(validateManifest(dir).join("\n")).toContain("hash mismatch a.txt");
      writeFileSync(join(dir, "manifesto-sha256.json"), '{"a.txt":"x","a.txt":"y"}');
      expect(validateManifest(dir).join("\n")).toContain("duplicate manifest entries");
      writeFileSync(join(dir, "manifesto-sha256.json"), "{");
      expect(validateManifest(dir)).toEqual(["malformed manifest"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("complementary cultural evidence integrity", () => {
  it("matches all 30 migrated claims to independent traceability rows, exact references and URLs", () => {
    expect(complementary).toHaveLength(22);
    expect(recovered).toHaveLength(5);
    expect(rows).toHaveLength(30);
    expect(rows.map((row) => row.claimId).sort()).toEqual([...complementary, ...recovered, ...adendoClaims].map((claim) => claim.id).sort());
    for (const row of rows) {
      expect(validateClaimBinding(culturalCatalog, row), row.claimId).toEqual([]);
      expect(row.date).toBe("2026-11-27");
      expect(["content-checked", "metadata-checked"]).toContain(row.state);
    }
  });

  it("requires exact ownership and rejects altered, missing, duplicate and wrongly bound claims", () => {
    const row = rows.find((item) => item.claimId === "PER-001-C05")!;
    expect(validateClaimBinding(culturalCatalog, row)).toEqual([]);
    const altered = structuredClone(culturalCatalog);
    const claim = altered.find((entry) => entry.id === "PER-001")!.claims.find((item) => item.id === row.claimId)!;
    claim.text = "texto alterado";
    expect(validateClaimBinding(altered, row).join("\n")).toContain("altered text");
    const wrongOwner = structuredClone(culturalCatalog);
    const moved = wrongOwner.find((entry) => entry.id === "PER-001")!.claims.find((item) => item.id === row.claimId)!;
    wrongOwner.find((entry) => entry.id === "PER-002")!.claims.push(moved);
    expect(validateClaimBinding(wrongOwner, { ...row, entryId: "PER-002" }).join("\n")).toContain("wrong owner");
    const missing = structuredClone(culturalCatalog);
    const per = missing.find((entry) => entry.id === "PER-001")!;
    per.claims = per.claims.filter((item) => item.id !== row.claimId);
    expect(validateClaimBinding(missing, row).join("\n")).toContain("missing claim");
    per.claims.push(structuredClone(moved), structuredClone(moved));
    expect(validateClaimBinding(missing, row).join("\n")).toContain("duplicate claim");
    const wrongRef = structuredClone(culturalCatalog);
    wrongRef.find((entry) => entry.id === "PER-001")!.claims.find((item) => item.id === row.claimId)!.referenceIds = ["source-3"];
    expect(validateClaimBinding(wrongRef, row).join("\n")).toContain("wrong reference");
    const wrongUrl = structuredClone(culturalCatalog);
    wrongUrl.find((entry) => entry.id === "PER-001")!.references.find((item) => item.id === "source-2")!.url = "https://example.org/trocado";
    expect(validateClaimBinding(wrongUrl, row).join("\n")).toContain("wrong URL");
    const foreignRef = structuredClone(culturalCatalog);
    foreignRef.find((entry) => entry.id === "PER-001")!.claims.find((item) => item.id === row.claimId)!.referenceIds = ["source-999"];
    expect(validateClaimBinding(foreignRef, row).join("\n")).toContain("wrong reference");
    expect(validateClaimBinding(culturalCatalog, { ...row, referenceId: "source-3" }).join("\n")).toContain("wrong reference");
  });

  it("enforces only the explicitly authorized URL transformations and reference sharing", () => {
    const byId = new Map(rows.map((row) => [row.claimId, row]));
    for (const id of ["BIB-003-C04", "BIB-003-C05"]) {
      expect(byId.get(id)!.transformation).toContain("remoção determinística do sufixo ?show=full");
      expect(byId.get(id)!.runtimeUrl).toBe(byId.get(id)!.originalUrl.replace("?show=full", ""));
    }
    expect(byId.get("PER-001-C04")!.transformation).toContain("equivalência binária não presumida");
    expect(byId.get("PER-001-C04")!.originalUrl).toMatch(/^http:\/\//);
    expect(byId.get("PER-001-C04")!.runtimeUrl).toMatch(/^https:\/\/repositorio\.ufsc\.br/);
    for (const id of ["BIB-004-C03", "BIB-004-C04", "BIB-004-C05"]) expect(byId.get(id)!.referenceId).toBe("source-3");
    expect(byId.get("PER-001-C05")!.referenceId).toBe("source-2");
    expect(byId.get("PER-001-C06")!.referenceId).toBe("source-3");
    expect(byId.get("PER-001-C07")!.referenceId).toBe("source-3");
    for (const row of rows) expect(validateAuthorizedTransformation(row.originalUrl, row.runtimeUrl, row.transformation), row.claimId).toEqual([]);
    expect(validateAuthorizedTransformation("https://example.org/a?x=1", "https://example.org/a", "nenhuma")).toContain("unauthorized URL change");
    expect(validateAuthorizedTransformation("https://example.org/a?show=full&x=1", "https://example.org/a", "remoção determinística do sufixo ?show=full")).toContain("unauthorized canonicalization");
    expect(validateAuthorizedTransformation("https://example.org/a", "https://evil.example/a", "normalização genérica")).toContain("unauthorized transformation");
  });

  it("preserves documented caveats and does not promote them to expert approval", () => {
    const text = readFileSync(tracePath, "utf8");
    for (const fragment of [
      "consulta restrita ao resumo acadêmico",
      "divergência singular/plural preservada",
      "cópia parcial",
      "equivalência binária não presumida",
      "INES — TV INES / DEBASI",
      "Direitos de `BIB-003` permanecem independentes",
    ]) expect(text).toContain(fragment);
    expect(text).not.toContain("expert-validated");
    expect(culturalCatalog.every((entry) => entry.validationStatus === "draft" && entry.reviews.length === 0 && !entry.publicationAuthorization)).toBe(true);
  });
});

describe("R.5.3-B.2 historical baseline and fingerprint separation", () => {
  const affected = [...new Set(rows.map((row) => row.entryId))].sort();
  const addedReferenceIds: Record<string, string[]> = {
    "CUR-002": ["source-4"], "CUR-006": ["source-4"], "PER-001": ["source-4", "source-5"], "PER-002": ["source-2"], "BIB-003": ["source-2"], "BIB-004": ["source-3"], "BIB-010": ["source-2"], "BIB-011": ["source-2"],
  };

  it("documents the exact historical migration boundary: 11 changed records, 9 new references and 3 preserved bodies", () => {
    expect(affected).toHaveLength(11);
    expect(culturalCatalog).toHaveLength(41);
    expect(41 - affected.length).toBe(30);
    expect(Object.values(addedReferenceIds).flat()).toHaveLength(9);
    expect(culturalCatalog.filter((entry) => entry.editorialBody).map((entry) => entry.id).sort()).toEqual(["CUR-001", "HIST-001", "HIST-006"]);
    for (const id of ["HIST-001", "HIST-006", "CUR-001"]) expect(affected).not.toContain(id);
  });

  it("validates recorded before/after fingerprints as temporary current-state assertions", () => {
    // Separation of guarantees: this test proves the current state still matches the
    // documented R.5.3-B.2 transition. It is intentionally a temporary current-state
    // assertion; future authorized migrations must replace it with their own baseline
    // rather than weakening the permanent ownership/URL validators above.
    const beforeCatalog = structuredClone(culturalCatalog);
    for (const entry of beforeCatalog) {
      if (!affected.includes(entry.id)) continue;
      const migratedIds = rows.filter((row) => row.entryId === entry.id).map((row) => row.claimId);
      entry.claims = entry.claims.filter((claim) => !migratedIds.includes(claim.id));
      entry.references = entry.references.filter((reference) => !(addedReferenceIds[entry.id] ?? []).includes(reference.id));
      entry.version = `candidate-${Number(entry.version.split("-")[1]) - 1}`;
    }
    for (const entryId of affected) {
      const row = rows.find((item) => item.entryId === entryId)!;
      const [beforeVersion, beforeHash, afterVersion, afterHash] = row.versionFingerprint.split("`").filter((part) => part.startsWith("candidate-") || /^[0-9a-f]{64}$/.test(part));
      const beforeEntry = beforeCatalog.find((entry) => entry.id === entryId)!;
      const afterEntry = getCulturalEntryById(entryId)!;
      expect(beforeEntry.version).toBe(beforeVersion);
      expect(afterEntry.version).toBe(afterVersion);
      expect(getCulturalContentFingerprint(beforeEntry)).toBe(beforeHash);
      expect(getCulturalContentFingerprint(afterEntry)).toBe(afterHash);
    }
  });

  it("rejects tampering with the reconstructed historical baseline", () => {
    const entry = structuredClone(getCulturalEntryById("PER-001")!);
    const before = getCulturalContentFingerprint(entry);
    entry.claims = entry.claims.filter((claim) => claim.id !== "PER-001-C05");
    expect(getCulturalContentFingerprint(entry)).not.toBe(before);
  });
});
