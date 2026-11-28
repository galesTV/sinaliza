import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { culturalCatalog } from "./cultural-catalog";
import { getCulturalContentFingerprint } from "./cultural-publication";
import type { CulturalCatalogEntry } from "./cultural-catalog-model";
import { culturalR53B2PostMigrationBaseline } from "@/test/cultural-r53c-baseline";
import { restoreCulturalD334BBeforeState } from "@/test/cultural-d334b-transition";
import { restoreCulturalD335DBeforeState } from "@/test/cultural-d335d-transition";
import {
  materializeR53B2BaselineEntry,
  parseR53CTraceText,
  r53cMigratedEntryIds,
  validateR53CTransition,
} from "@/test/cultural-r53c-transition";

const v2Dir = join(process.cwd(), "docs/curadoria-cultural/v2/pacote-original");
const v21Dir = join(process.cwd(), "docs/curadoria-cultural/v2.1/pacote-original");
const tracePath = join(process.cwd(), "docs/curadoria-cultural/v2.1/rastreabilidade-r53b2.md");
const adendoPath = join(process.cwd(), "docs/curadoria-cultural/v2.1/adendo-per-001.md");
const preD334BCatalog = restoreCulturalD334BBeforeState(culturalCatalog);

type SourceClaim = {
  id: string;
  entryId: string;
  text: string;
  url: string;
  locator: string;
  consultation: string;
  consultedAt?: string;
  note?: string;
  originalEvidence?: { url: string };
  referenceId?: string;
};

type TraceRow = {
  claimId: string;
  entryId: string;
  text: string;
  origin: string;
  originalUrl: string;
  runtimeUrl: string;
  referenceId: string;
  institution: string;
  locator: string;
  state: string;
  date: string;
  transformation: string;
  caveats: string;
  versionFingerprint: string;
};

type BindingExpectation = Pick<
  TraceRow,
  "claimId" | "entryId" | "text" | "runtimeUrl" | "referenceId"
> & { referenceIds?: string[] };

function sha256(bytes: Buffer) {
  return createHash("sha256").update(bytes).digest("hex");
}

const v2ManifestFiles = [
  "README.md",
  "acervo-editorial.json",
  "acervo-editorial.md",
  "auditoria.json",
  "backlog-contrato.md",
  "baseline-b5.json",
  "benchmark-internacional.md",
  "bibliografia-capovilla.json",
  "bibliografia-capovilla.md",
  "catalogo-d2-legado.json",
  "contrato-editorial-referencia.md",
  "direitos-e-permissoes.md",
  "matriz-afirmacoes.json",
  "prompt-devin.md",
  "relacoes-candidatas.json",
  "revisao-especializada.md",
];

const v21ManifestFiles = [
  "README.md",
  "acervo-complementar.json",
  "auditoria-v2.1.json",
  "claims-complementares.json",
  "claims-recuperadas.json",
  "decisoes-editoriais.md",
  "direitos-e-permissoes.md",
  "matriz-afirmacoes-consolidada.json",
  "prompt-devin.md",
  "referencias-verificadas.json",
];

function validateManifest(root: string, expectedFiles: readonly string[]) {
  const problems: string[] = [];
  let raw: string;
  try {
    raw = readFileSync(join(root, "manifesto-sha256.json"), "utf8");
  } catch {
    return ["missing manifest"];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return ["malformed manifest"];
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return ["manifest must be a non-null object"];
  }

  const keys = [...raw.matchAll(/"([^"\\]+)"\s*:/g)].map((match) => match[1]);
  if (new Set(keys).size !== keys.length) problems.push("duplicate manifest entries");
  const manifest = parsed as Record<string, unknown>;
  const entries = Object.keys(manifest);
  if (entries.length !== expectedFiles.length) {
    problems.push(`manifest entry count ${entries.length} differs from expected ${expectedFiles.length}`);
  }
  for (const file of expectedFiles) {
    if (!(file in manifest)) problems.push(`missing manifest entry ${file}`);
  }
  for (const file of entries) {
    if (!expectedFiles.includes(file)) problems.push(`unexpected manifest entry ${file}`);
  }

  for (const [file, expectedHash] of Object.entries(manifest)) {
    if (typeof expectedHash !== "string" || !/^[0-9a-f]{64}$/.test(expectedHash)) {
      problems.push(`invalid sha256 for ${file}`);
      continue;
    }
    const path = join(root, file);
    if (!existsSync(path)) {
      problems.push(`missing file ${file}`);
    } else if (sha256(readFileSync(path)) !== expectedHash) {
      problems.push(`hash mismatch ${file}`);
    }
  }
  return problems;
}

function parseTraceText(text: string, expectedClaimIds: readonly string[] = []): { rows: TraceRow[]; problems: string[] } {
  const problems: string[] = [];
  const rows: TraceRow[] = [];
  const lines = text.split("\n");
  const headerIndex = lines.findIndex((line) =>
    line.startsWith("| Claim | Registro | Texto exato | Origem | URL original | URL runtime |"),
  );
  if (headerIndex === -1) return { rows, problems: ["missing traceability table header"] };

  const seen = new Set<string>();
  for (let index = headerIndex + 2; index < lines.length && lines[index].startsWith("|"); index += 1) {
    const line = lines[index];
    if (!line.startsWith("| `")) {
      problems.push(`malformed traceability line ${index + 1}`);
      continue;
    }
    const cells = line.split("|").map((cell) => cell.trim());
    if (cells.length !== 16) {
      problems.push(`traceability line ${index + 1} has ${Math.max(cells.length - 2, 0)} columns instead of 14`);
      continue;
    }
    const uncode = (value: string) => value.replace(/^`|`$/g, "");
    const row: TraceRow = {
      claimId: uncode(cells[1]),
      entryId: uncode(cells[2]),
      text: cells[3],
      origin: cells[4],
      originalUrl: cells[5],
      runtimeUrl: cells[6],
      referenceId: uncode(cells[7]),
      institution: cells[8],
      locator: cells[9],
      state: uncode(cells[10]),
      date: cells[11],
      transformation: cells[12],
      caveats: cells[13],
      versionFingerprint: cells[14],
    };
    const required: Array<[keyof TraceRow, string]> = [
      ["claimId", "claim"], ["entryId", "record"], ["text", "text"], ["origin", "origin"],
      ["originalUrl", "original URL"], ["runtimeUrl", "runtime URL"], ["referenceId", "reference"],
      ["institution", "institution"], ["locator", "locator"], ["state", "state"], ["date", "date"],
      ["transformation", "transformation"], ["caveats", "caveats"], ["versionFingerprint", "version/fingerprint"],
    ];
    for (const [field, label] of required) {
      if (!row[field]) problems.push(`empty ${label} in traceability line ${index + 1}`);
    }
    if (!/^[A-Z]+-\d{3}-C\d{2}$/.test(row.claimId)) {
      problems.push(`invalid claim id in traceability line ${index + 1}`);
    }
    if (!["content-checked", "metadata-checked"].includes(row.state)) {
      problems.push(`invalid consultation state in traceability line ${index + 1}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
      problems.push(`invalid consultation date in traceability line ${index + 1}`);
    }
    if (seen.has(row.claimId)) problems.push(`duplicate traceability row ${row.claimId}`);
    seen.add(row.claimId);
    rows.push(row);
  }
  if (expectedClaimIds.length > 0) {
    const rowIds = rows.map((row) => row.claimId).sort();
    const expectedIds = [...expectedClaimIds].sort();
    for (const claimId of expectedIds) {
      if (!rowIds.includes(claimId)) problems.push(`missing traceability row ${claimId}`);
    }
    for (const claimId of rowIds) {
      if (!expectedIds.includes(claimId)) problems.push(`unexpected traceability row ${claimId}`);
    }
  }
  return { rows, problems };
}

function parseTrace(expectedClaimIds: readonly string[]) {
  return parseTraceText(readFileSync(tracePath, "utf8"), expectedClaimIds);
}

function parseAdendoClaims(text: string): { claims: SourceClaim[]; problems: string[] } {
  const problems: string[] = [];
  const claims: SourceClaim[] = [];
  const lines = text.split("\n");
  const headerIndex = lines.findIndex((line) => line.startsWith("| Claim | Texto exato | Referência | URL |"));
  if (headerIndex === -1) return { claims, problems: ["missing PER-001 adendo table"] };
  for (let index = headerIndex + 2; index < lines.length && lines[index].startsWith("|"); index += 1) {
    const cells = lines[index].split("|").map((cell) => cell.trim());
    if (cells.length !== 10) {
      problems.push(`malformed PER-001 adendo line ${index + 1}`);
      continue;
    }
    const uncode = (value: string) => value.replace(/^`|`$/g, "");
    const claim: SourceClaim = {
      id: uncode(cells[1]),
      entryId: "PER-001",
      text: cells[2],
      referenceId: uncode(cells[3]),
      url: cells[4],
      locator: cells[6],
      consultation: uncode(cells[7]),
      consultedAt: cells[8],
    };
    if (!claim.id || !claim.text || !claim.referenceId || !claim.url || !claim.locator || !claim.consultation || !claim.consultedAt) {
      problems.push(`empty required field in PER-001 adendo line ${index + 1}`);
    }
    claims.push(claim);
  }
  return { claims, problems };
}

function validateClaimBinding(catalog: CulturalCatalogEntry[], expected: BindingExpectation) {
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

  const expectedReferenceIds = expected.referenceIds ?? [expected.referenceId];
  if (JSON.stringify(claim.referenceIds) !== JSON.stringify(expectedReferenceIds)) {
    problems.push(`wrong reference collection ${expected.claimId}`);
  }
  for (const referenceId of expectedReferenceIds) {
    const reference = entry.references.find((item) => item.id === referenceId);
    if (!reference) problems.push(`missing reference ${referenceId}`);
    else if (reference.url !== expected.runtimeUrl) problems.push(`wrong URL ${expected.claimId}`);
  }
  return problems;
}

const showFullTransformation = "remoção determinística do sufixo ?show=full para a URL canônica institucional já presente";
const per001AlternativeTransformation = "substituição por referência institucional alternativa HTTPS; equivalência binária não presumida";

function validateAuthorizedTransformation(
  claimId: string,
  originalUrl: string,
  runtimeUrl: string,
  transformation: string,
) {
  if (claimId === "BIB-003-C04" || claimId === "BIB-003-C05") {
    if (transformation !== showFullTransformation) return ["unauthorized canonicalization description"];
    return originalUrl.endsWith("?show=full") && runtimeUrl === originalUrl.slice(0, -"?show=full".length)
      ? []
      : ["unauthorized canonicalization"];
  }
  if (claimId === "PER-001-C04") {
    if (transformation !== per001AlternativeTransformation) return ["unauthorized institutional substitution description"];
    return originalUrl === "http://tede.ufsc.br/teses/PGET0138-D.pdf" &&
      runtimeUrl === "https://repositorio.ufsc.br/handle/123456789/100721"
      ? []
      : ["unauthorized institutional substitution"];
  }
  if (transformation !== "nenhuma") return ["unauthorized transformation"];
  return originalUrl === runtimeUrl ? [] : ["unauthorized URL change"];
}

function documentaryOriginalUrl(source: SourceClaim) {
  return source.originalEvidence?.url ?? source.url;
}

function documentaryCaveats(source: SourceClaim) {
  return source.note?.trim() ? source.note : "—";
}

function expectedRuntimeUrl(source: SourceClaim) {
  if ((source.id === "BIB-003-C04" || source.id === "BIB-003-C05") && source.url.endsWith("?show=full")) {
    return source.url.slice(0, -"?show=full".length);
  }
  return source.url;
}

function validateEvidenceChain(
  catalog: CulturalCatalogEntry[],
  traceRows: TraceRow[],
  sourceClaims: SourceClaim[],
) {
  const problems: string[] = [];
  const sourceIds = sourceClaims.map((claim) => claim.id).sort();
  const traceIds = traceRows.map((row) => row.claimId).sort();
  if (JSON.stringify(traceIds) !== JSON.stringify(sourceIds)) {
    problems.push("traceability row set differs from source claim set");
  }
  for (const source of sourceClaims) {
    const row = traceRows.find((item) => item.claimId === source.id);
    if (!row) {
      problems.push(`missing traceability row ${source.id}`);
      continue;
    }
    if (row.entryId !== source.entryId) problems.push(`traceability owner mismatch ${source.id}`);
    if (row.text !== source.text) problems.push(`traceability text mismatch ${source.id}`);
    if (row.originalUrl !== documentaryOriginalUrl(source)) problems.push(`traceability original URL mismatch ${source.id}`);
    if (row.runtimeUrl !== expectedRuntimeUrl(source)) problems.push(`traceability runtime URL mismatch ${source.id}`);
    if (row.locator !== source.locator) problems.push(`traceability locator mismatch ${source.id}`);
    if (row.state !== source.consultation) problems.push(`traceability consultation mismatch ${source.id}`);
    if (source.consultedAt && row.date !== source.consultedAt) problems.push(`traceability date mismatch ${source.id}`);
    if (row.caveats !== documentaryCaveats(source)) problems.push(`traceability caveats mismatch ${source.id}`);
    if (source.referenceId && row.referenceId !== source.referenceId) problems.push(`traceability reference mismatch ${source.id}`);
    problems.push(...validateClaimBinding(catalog, row));
    problems.push(...validateAuthorizedTransformation(row.claimId, row.originalUrl, row.runtimeUrl, row.transformation));
  }
  return problems;
}

const complementary = JSON.parse(readFileSync(join(v21Dir, "claims-complementares.json"), "utf8")) as SourceClaim[];
const recovered = JSON.parse(readFileSync(join(v21Dir, "claims-recuperadas.json"), "utf8")) as SourceClaim[];
const originalMatrix = JSON.parse(readFileSync(join(v2Dir, "matriz-afirmacoes.json"), "utf8")) as SourceClaim[];
const adendoParsed = parseAdendoClaims(readFileSync(adendoPath, "utf8"));
const adendoClaims = adendoParsed.claims;
const sourceClaims = [...complementary, ...recovered, ...adendoClaims];
const traceParsed = parseTrace(sourceClaims.map((claim) => claim.id));
const rows = traceParsed.rows;

const addedReferenceIds: Record<string, string[]> = {
  "CUR-002": ["source-4"],
  "CUR-006": ["source-4"],
  "PER-001": ["source-4", "source-5"],
  "PER-002": ["source-2"],
  "BIB-003": ["source-2"],
  "BIB-004": ["source-3"],
  "BIB-010": ["source-2"],
  "BIB-011": ["source-2"],
};

function reconstructR53B2Baseline(catalog: CulturalCatalogEntry[], traceRows: TraceRow[]) {
  const affected = [...new Set(traceRows.map((row) => row.entryId))].sort();
  const beforeCatalog = structuredClone(catalog);
  for (const entry of beforeCatalog) {
    if (!affected.includes(entry.id)) continue;
    const migratedIds = traceRows.filter((row) => row.entryId === entry.id).map((row) => row.claimId);
    entry.claims = entry.claims.filter((claim) => !migratedIds.includes(claim.id));
    entry.references = entry.references.filter((reference) => !(addedReferenceIds[entry.id] ?? []).includes(reference.id));
    entry.version = `candidate-${Number(entry.version.split("-")[1]) - 1}`;
  }
  return { affected, beforeCatalog };
}

function r53b2PostMigrationCatalog() {
  return r53cMigratedEntryIds.map((entryId) => {
    const baseline = culturalR53B2PostMigrationBaseline[entryId];
    return materializeR53B2BaselineEntry(structuredClone(baseline.content), baseline.version, structuredClone(baseline.workflow));
  });
}

function validateHistoricalTransition(postMigrationCatalog: CulturalCatalogEntry[], traceRows: TraceRow[]) {
  const problems: string[] = [];
  const { affected, beforeCatalog } = reconstructR53B2Baseline(postMigrationCatalog, traceRows);
  if (affected.length !== 11) problems.push(`expected 11 affected records, got ${affected.length}`);
  if (Object.values(addedReferenceIds).flat().length !== 9) problems.push("expected 9 new references");
  const pattern = /^`(candidate-\d+)`\/`([0-9a-f]{64})` → `(candidate-\d+)`\/`([0-9a-f]{64})`$/;
  for (const row of traceRows) {
    const match = row.versionFingerprint.match(pattern);
    if (!match) {
      problems.push(`malformed historical fingerprint for ${row.claimId}`);
      continue;
    }
    const [, beforeVersion, beforeHash, afterVersion, afterHash] = match;
    const beforeEntry = beforeCatalog.find((entry) => entry.id === row.entryId)!;
    const afterEntry = postMigrationCatalog.find((entry) => entry.id === row.entryId)!;
    if (beforeEntry.version !== beforeVersion) problems.push(`before version mismatch ${row.entryId}`);
    if (afterEntry.version !== afterVersion) problems.push(`after version mismatch ${row.entryId}`);
    if (getCulturalContentFingerprint(beforeEntry) !== beforeHash) problems.push(`before fingerprint mismatch ${row.entryId}`);
    if (getCulturalContentFingerprint(afterEntry) !== afterHash) problems.push(`after fingerprint mismatch ${row.entryId}`);
  }
  return problems;
}

describe("cultural curation package byte integrity", () => {
  it("validates the real V2 and V2.1 manifests byte-exactly with explicit expected entries", () => {
    expect(v2ManifestFiles).toHaveLength(16);
    expect(v21ManifestFiles).toHaveLength(10);
    expect(validateManifest(v2Dir, v2ManifestFiles)).toEqual([]);
    expect(validateManifest(v21Dir, v21ManifestFiles)).toEqual([]);
  });

  it("rejects missing, divergent, duplicate, malformed and structurally invalid manifests", () => {
    const dir = mkdtempSync(join(tmpdir(), "cultural-manifest-"));
    const expected = ["a.txt", "b.txt"];
    try {
      writeFileSync(join(dir, "a.txt"), "a");
      writeFileSync(join(dir, "b.txt"), "b");
      const valid = { "a.txt": sha256(Buffer.from("a")), "b.txt": sha256(Buffer.from("b")) };
      writeFileSync(join(dir, "manifesto-sha256.json"), JSON.stringify(valid));
      expect(validateManifest(dir, expected)).toEqual([]);

      writeFileSync(join(dir, "manifesto-sha256.json"), JSON.stringify({ "a.txt": valid["a.txt"] }));
      expect(validateManifest(dir, expected).join("\n")).toContain("missing manifest entry b.txt");

      writeFileSync(join(dir, "manifesto-sha256.json"), JSON.stringify({ "a.txt": valid["a.txt"], "c.txt": valid["b.txt"] }));
      const replacementProblems = validateManifest(dir, expected).join("\n");
      expect(replacementProblems).toContain("missing manifest entry b.txt");
      expect(replacementProblems).toContain("unexpected manifest entry c.txt");

      writeFileSync(join(dir, "a.txt"), "changed");
      writeFileSync(join(dir, "manifesto-sha256.json"), JSON.stringify(valid));
      expect(validateManifest(dir, expected).join("\n")).toContain("hash mismatch a.txt");

      writeFileSync(join(dir, "manifesto-sha256.json"), '{"a.txt":"x","a.txt":"y"}');
      expect(validateManifest(dir, expected).join("\n")).toContain("duplicate manifest entries");
      writeFileSync(join(dir, "manifesto-sha256.json"), "{");
      expect(validateManifest(dir, expected)).toEqual(["malformed manifest"]);
      writeFileSync(join(dir, "manifesto-sha256.json"), "null");
      expect(validateManifest(dir, expected)).toEqual(["manifest must be a non-null object"]);
      writeFileSync(join(dir, "manifesto-sha256.json"), "[]");
      expect(validateManifest(dir, expected)).toEqual(["manifest must be a non-null object"]);
      writeFileSync(join(dir, "manifesto-sha256.json"), JSON.stringify({ "a.txt": "not-a-hash", "b.txt": valid["b.txt"] }));
      expect(validateManifest(dir, expected).join("\n")).toContain("invalid sha256 for a.txt");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("traceability and PER-001 adendo parsers", () => {
  const traceText = readFileSync(tracePath, "utf8");

  it("parses the real versioned tables without structural problems", () => {
    expect(traceParsed.problems).toEqual([]);
    expect(rows).toHaveLength(30);
    expect(adendoParsed.problems).toEqual([]);
    expect(adendoClaims).toHaveLength(3);
  });

  it("rejects absent, duplicate, malformed, incomplete and invalid traceability lines", () => {
    expect(parseTraceText(traceText.replace("| Claim | Registro |", "| ClaimX | Registro |")).problems).toContain("missing traceability table header");
    const firstRow = traceText.split("\n").find((line) => line.startsWith("| `HIST-008-C04`"))!;
    expect(parseTraceText(traceText.replace(firstRow, `${firstRow}\n${firstRow}`)).problems.join("\n")).toContain("duplicate traceability row HIST-008-C04");
    expect(parseTraceText(traceText.replace(firstRow, firstRow.replace("| `HIST-008-C04`", "| HIST-008-C04`"))).problems.join("\n")).toContain("malformed traceability line");
    expect(parseTraceText(traceText.replace(firstRow, `${firstRow} | extra |`)).problems.join("\n")).toContain("columns instead of 14");
    expect(parseTraceText(traceText.replace(firstRow, firstRow.replace(" | Cabeçalho da lei", ""))).problems.join("\n")).toContain("columns instead of 14");
    expect(parseTraceText(traceText.replace(`${firstRow}\n`, ""), sourceClaims.map((claim) => claim.id)).problems).toContain("missing traceability row HIST-008-C04");
    expect(parseTraceText(traceText.replace("| Cabeçalho da lei |", "|  |")).problems.join("\n")).toContain("empty locator");
    expect(parseTraceText(traceText.replace("`HIST-008-C04`", "`BAD-ID`")).problems.join("\n")).toContain("invalid claim id");
    expect(parseTraceText(traceText.replace("`content-checked`", "`invented`")).problems.join("\n")).toContain("invalid consultation state");
  });
});

describe("complementary cultural evidence integrity", () => {
  it("validates the complete independent chain source document → traceability → runtime for all 30 claims", () => {
    expect(complementary).toHaveLength(22);
    expect(recovered).toHaveLength(5);
    expect(adendoClaims).toHaveLength(3);
    expect(validateEvidenceChain(preD334BCatalog, rows, sourceClaims)).toEqual([]);
  });

  it("rejects consistent catalog/traceability tampering that diverges from the original source", () => {
    const tamperedRows = structuredClone(rows);
    const tamperedCatalog = structuredClone(culturalCatalog);
    const id = "PER-001-C05";
    const replacement = "texto adulterado consistentemente";
    tamperedRows.find((row) => row.claimId === id)!.text = replacement;
    tamperedCatalog.find((entry) => entry.id === "PER-001")!.claims.find((claim) => claim.id === id)!.text = replacement;
    expect(validateEvidenceChain(tamperedCatalog, tamperedRows, sourceClaims).join("\n")).toContain(`traceability text mismatch ${id}`);
  });

  it("requires exact reference collections and rejects additional, missing, duplicate or wrong evidence references", () => {
    const row = rows.find((item) => item.claimId === "PER-001-C05")!;
    const multipleAuthorized = structuredClone(culturalCatalog);
    const per001 = multipleAuthorized.find((entry) => entry.id === "PER-001")!;
    per001.references.push({ id: "source-9", url: row.runtimeUrl });
    per001.claims.find((claim) => claim.id === row.claimId)!.referenceIds = ["source-2", "source-9"];
    expect(validateClaimBinding(multipleAuthorized, { ...row, referenceIds: ["source-2", "source-9"] })).toEqual([]);
    const cloneWithRefs = (referenceIds: string[]) => {
      const catalog = structuredClone(culturalCatalog);
      catalog.find((entry) => entry.id === "PER-001")!.claims.find((claim) => claim.id === row.claimId)!.referenceIds = referenceIds;
      return catalog;
    };
    expect(validateClaimBinding(cloneWithRefs(["source-2", "source-3"]), row).join("\n")).toContain("wrong reference collection");
    expect(validateClaimBinding(cloneWithRefs(["source-2", "source-999"]), row).join("\n")).toContain("wrong reference collection");
    expect(validateClaimBinding(cloneWithRefs(["source-2", "source-2"]), row).join("\n")).toContain("wrong reference collection");
    expect(validateClaimBinding(cloneWithRefs(["source-3"]), row).join("\n")).toContain("wrong reference collection");
    expect(validateClaimBinding(culturalCatalog, { ...row, referenceId: "source-3" }).join("\n")).toContain("wrong reference collection");

    for (const [claimId, wrongReference] of [
      ["PER-001-C05", "source-3"],
      ["PER-001-C06", "source-2"],
      ["PER-001-C07", "source-2"],
    ] as const) {
      const catalog = structuredClone(culturalCatalog);
      catalog.find((entry) => entry.id === "PER-001")!.claims.find((claim) => claim.id === claimId)!.referenceIds = [wrongReference];
      expect(validateClaimBinding(catalog, rows.find((item) => item.claimId === claimId)!).join("\n")).toContain("wrong reference collection");
    }
  });

  it("requires exact ownership and rejects altered, missing or duplicate claims and wrong URLs", () => {
    const row = rows.find((item) => item.claimId === "PER-001-C05")!;
    const altered = structuredClone(culturalCatalog);
    altered.find((entry) => entry.id === "PER-001")!.claims.find((item) => item.id === row.claimId)!.text = "texto alterado";
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

    const wrongUrl = structuredClone(culturalCatalog);
    wrongUrl.find((entry) => entry.id === "PER-001")!.references.find((item) => item.id === "source-2")!.url = "https://example.org/trocado";
    expect(validateClaimBinding(wrongUrl, row).join("\n")).toContain("wrong URL");
  });

  it("restricts transformations by claim ID, original URL, runtime URL and exact authorized transformation", () => {
    for (const row of rows) {
      expect(validateAuthorizedTransformation(row.claimId, row.originalUrl, row.runtimeUrl, row.transformation), row.claimId).toEqual([]);
    }
    const canonical = rows.find((row) => row.claimId === "BIB-003-C04")!;
    expect(validateAuthorizedTransformation("HIST-008-C04", canonical.originalUrl, canonical.runtimeUrl, canonical.transformation)).toContain("unauthorized transformation");
    expect(validateAuthorizedTransformation("BIB-003-C04", canonical.originalUrl, canonical.runtimeUrl, "nenhuma")).toContain("unauthorized canonicalization description");
    expect(validateAuthorizedTransformation("CUR-002-C04", "http://tede.ufsc.br/teses/PGET0138-D.pdf", "https://repositorio.ufsc.br/handle/123456789/100721", per001AlternativeTransformation)).toContain("unauthorized transformation");
    expect(validateAuthorizedTransformation("CUR-002-C04", "https://example.org/a?x=1", "https://example.org/a", "nenhuma")).toContain("unauthorized URL change");
    expect(validateAuthorizedTransformation("BIB-003-C04", "https://example.org/a?show=full&x=1", "https://example.org/a", canonical.transformation)).toContain("unauthorized canonicalization");
    expect(validateAuthorizedTransformation("PER-001-C04", "https://example.org/original", "https://repositorio.ufsc.br/handle/123456789/100721", per001AlternativeTransformation)).toContain("unauthorized institutional substitution");
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
    expect(restoreCulturalD335DBeforeState(culturalCatalog).every((entry) => entry.validationStatus === "draft" && entry.reviews.length === 0 && !entry.publicationAuthorization)).toBe(true);
  });
});

describe("complete set of 56 documentary claims and legacy preservation", () => {
  it("matches the exact expected ID set, ownership and source texts", () => {
    const expectedIds = [
      ...originalMatrix.map((claim) => claim.id),
      ...complementary.map((claim) => claim.id),
      ...adendoClaims.map((claim) => claim.id),
    ].sort();
    expect(expectedIds).toHaveLength(56);
    const runtime = preD334BCatalog.flatMap((entry) =>
      entry.claims.filter((claim) => claim.id.includes("-C")).map((claim) => ({ entryId: entry.id, claimId: claim.id, text: claim.text })),
    );
    expect(runtime.map((claim) => claim.claimId).sort()).toEqual(expectedIds);
    expect(new Set(runtime.map((claim) => claim.claimId)).size).toBe(56);
    for (const source of [...originalMatrix, ...complementary, ...adendoClaims]) {
      const runtimeClaim = runtime.find((claim) => claim.claimId === source.id)!;
      expect(runtimeClaim.entryId, source.id).toBe(source.entryId);
      expect(runtimeClaim.text, source.id).toBe(source.text);
    }
    expect(culturalCatalog.flatMap((entry) => entry.claims.filter((claim) => claim.id === "claim-1"))).toHaveLength(35);
    expect(culturalCatalog.filter((entry) => entry.claims.length === 0).map((entry) => entry.id)).toEqual([
      "PER-008",
      "PER-009",
      "BIB-013",
      "BIB-014",
      "BIB-015",
      "BIB-016",
    ]);
  });
});

describe("R.5.3-B.2 historical baseline and fingerprint separation", () => {
  it("documents the exact historical migration boundary: 11 changed records, 9 new references and 3 preserved bodies", () => {
    const { affected } = reconstructR53B2Baseline(r53b2PostMigrationCatalog(), rows);
    expect(affected).toHaveLength(11);
    expect(culturalCatalog).toHaveLength(41);
    expect(41 - affected.length).toBe(30);
    expect(Object.values(addedReferenceIds).flat()).toHaveLength(9);
    expect(Object.values(culturalR53B2PostMigrationBaseline).every((baseline) => !("editorialBody" in baseline.content))).toBe(true);
    for (const id of ["HIST-001", "HIST-006", "CUR-001"]) expect(affected).not.toContain(id);
  });

  it("validates recorded before/after fingerprints in the frozen post-migration baseline", () => {
    // Permanent invariants are the package bytes, exact documentary chain and exact
    // reference/URL validators. The R.5.3-B.2 migration boundary is validated from
    // the frozen independent fixture captured before R.5.3-C, not from the mutable
    // current catalog.
    expect(validateHistoricalTransition(r53b2PostMigrationCatalog(), rows)).toEqual([]);
  });

  it("uses the same historical validator to reject tampered baselines and catalog entries", () => {
    const tamperedRows = structuredClone(rows);
    for (const row of tamperedRows.filter((item) => item.entryId === "PER-001")) {
      row.versionFingerprint = row.versionFingerprint.replace(/[0-9a-f](?=` →)/, (character) => (character === "0" ? "1" : "0"));
    }
    expect(validateHistoricalTransition(r53b2PostMigrationCatalog(), tamperedRows).join("\n")).toContain("before fingerprint mismatch PER-001");

    const tamperedCatalog = structuredClone(r53b2PostMigrationCatalog());
    const per = tamperedCatalog.find((entry) => entry.id === "PER-001")!;
    per.claims = per.claims.filter((claim) => claim.id !== "PER-001-C05");
    expect(validateHistoricalTransition(tamperedCatalog, rows).join("\n")).toContain("after fingerprint mismatch PER-001");
  });
});


describe("R.5.3-C editorial body transition", () => {
  const transitionTracePath = join(process.cwd(), "docs/curadoria-cultural/v2.1/rastreabilidade-r53c.md");
  const transitionTraceText = readFileSync(transitionTracePath, "utf8");
  const transitionParsed = parseR53CTraceText(transitionTraceText);

  it("parses the R.5.3-C structural table and validates the real transition end-to-end", () => {
    expect(transitionParsed.problems).toEqual([]);
    expect(transitionParsed.rows).toHaveLength(11);
    expect(validateR53CTransition(culturalCatalog, transitionParsed.rows)).toEqual([]);
  });

  it("rejects malformed and missing rows in the R.5.3-C parser", () => {
    const firstRow = transitionTraceText.split("\n").find((line) => line.startsWith("| `HIST-008`"))!;
    expect(parseR53CTraceText(transitionTraceText.replace(`${firstRow}\n`, "")).problems).toContain("missing R.5.3-C traceability row HIST-008");
    expect(parseR53CTraceText(transitionTraceText.replace(firstRow, `${firstRow} | extra |`)).problems.join("\n")).toContain("wrong column count");
    expect(parseR53CTraceText(transitionTraceText.replace("`candidate-3`/", "candidate-3`/")).problems.join("\n")).toContain("malformed R.5.3-C fingerprint line");
  });

  it("uses the same transition validator to reject adulterated bodies, claims, versions, fields and fingerprints", () => {
    const validate = (catalog: CulturalCatalogEntry[], rows = transitionParsed.rows) => validateR53CTransition(catalog, rows).join("\n");

    const alteredBody = structuredClone(culturalCatalog);
    alteredBody.find((entry) => entry.id === "HIST-008")!.editorialBody!.paragraphs[0] += " adulterado";
    expect(validate(alteredBody)).toContain("editorial body differs from independent source HIST-008");

    const wrongClaim = structuredClone(culturalCatalog);
    wrongClaim.find((entry) => entry.id === "PER-001")!.editorialBody!.claimIds[0] = "PER-001-C07";
    expect(validate(wrongClaim)).toContain("wrong claim collection PER-001");

    const missingClaim = structuredClone(culturalCatalog);
    missingClaim.find((entry) => entry.id === "PER-001")!.editorialBody!.claimIds.pop();
    expect(validate(missingClaim)).toContain("wrong claim collection PER-001");

    const additionalClaim = structuredClone(culturalCatalog);
    additionalClaim.find((entry) => entry.id === "PER-001")!.editorialBody!.claimIds.push("claim-1");
    expect(validate(additionalClaim)).toContain("wrong claim collection PER-001");

    const notIncremented = structuredClone(culturalCatalog);
    notIncremented.find((entry) => entry.id === "BIB-002")!.version = "candidate-2";
    expect(validate(notIncremented)).toContain("after version mismatch BIB-002");

    const unauthorizedField = structuredClone(culturalCatalog);
    unauthorizedField.find((entry) => entry.id === "CUR-002")!.summary = "campo não autorizado alterado";
    expect(validate(unauthorizedField)).toContain("unauthorized structural change CUR-002");

    const alteredPending = structuredClone(culturalCatalog);
    alteredPending.find((entry) => entry.id === "CUR-002")!.internalPending.push("pendência adulterada");
    expect(validate(alteredPending)).toContain("unauthorized structural change CUR-002");

    const incompatibleRows = structuredClone(transitionParsed.rows);
    for (const row of incompatibleRows.filter((item) => item.entryId === "BIB-011")) {
      row.afterFingerprint = row.afterFingerprint.replace(/^[0-9a-f]/, (character) => (character === "0" ? "1" : "0"));
    }
    expect(validate(culturalCatalog, incompatibleRows)).toContain("after fingerprint mismatch BIB-011");

    const outsideScope = structuredClone(culturalCatalog);
    outsideScope.find((entry) => entry.id === "HIST-002")!.title = "alteração fora do escopo";
    expect(validate(outsideScope)).toContain("out-of-scope fingerprint change HIST-002");

    const duplicateRecord = structuredClone(culturalCatalog);
    duplicateRecord.push(structuredClone(duplicateRecord.find((entry) => entry.id === "HIST-002")!));
    expect(validate(duplicateRecord)).toContain("duplicate cultural record id");

    const missingRecord = structuredClone(culturalCatalog).filter((entry) => entry.id !== "HIST-002");
    expect(validate(missingRecord)).toContain("cultural record id set differs");

    const reclassifiedRows = structuredClone(transitionParsed.rows);
    reclassifiedRows.find((row) => row.entryId === "HIST-008")!.classification = "B";
    expect(validate(culturalCatalog, reclassifiedRows)).toContain("documentary classification changed HIST-008");

    const alteredCaveats = structuredClone(transitionParsed.rows);
    alteredCaveats.find((row) => row.entryId === "CUR-006")!.caveats = "ressalva indevidamente alterada";
    expect(validate(culturalCatalog, alteredCaveats)).toContain("essential caveats changed CUR-006");
  });
});
