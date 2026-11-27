import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";

import type { CulturalCatalogEntry } from "../data/cultural-catalog-model";
import { getCulturalContentFingerprint } from "../data/cultural-publication";
import {
  culturalPreR53CFingerprintBaseline,
  culturalR53B2PostMigrationBaseline,
} from "./cultural-r53c-baseline";

export const r53cMigratedEntryIds = [
  "HIST-008",
  "CUR-002",
  "CUR-006",
  "PER-001",
  "PER-002",
  "BIB-002",
  "BIB-003",
  "BIB-004",
  "BIB-005",
  "BIB-010",
  "BIB-011",
] as const;

const claimCounts: Record<(typeof r53cMigratedEntryIds)[number], number> = {
  "HIST-008": 4,
  "CUR-002": 6,
  "CUR-006": 4,
  "PER-001": 7,
  "PER-002": 4,
  "BIB-002": 2,
  "BIB-003": 5,
  "BIB-004": 5,
  "BIB-005": 4,
  "BIB-010": 2,
  "BIB-011": 4,
};

const afterVersions: Record<(typeof r53cMigratedEntryIds)[number], string> = {
  "HIST-008": "candidate-4",
  "CUR-002": "candidate-4",
  "CUR-006": "candidate-4",
  "PER-001": "candidate-4",
  "PER-002": "candidate-3",
  "BIB-002": "candidate-3",
  "BIB-003": "candidate-4",
  "BIB-004": "candidate-4",
  "BIB-005": "candidate-4",
  "BIB-010": "candidate-4",
  "BIB-011": "candidate-4",
};

export const r53cE4EntryIds = ["CUR-001", "HIST-001", "HIST-006"] as const;

const e4ClaimIds: Record<(typeof r53cE4EntryIds)[number], string[]> = {
  "HIST-001": ["HIST-001-C01", "HIST-001-C02", "HIST-001-C03", "claim-1"],
  "HIST-006": ["HIST-006-C01", "HIST-006-C02", "HIST-006-C03", "HIST-006-C04"],
  "CUR-001": ["CUR-001-C01", "CUR-001-C02"],
};

export type R53CTraceRow = {
  entryId: string;
  classification: string;
  claimCount: number;
  bodySha256: string;
  beforeVersion: string;
  beforeFingerprint: string;
  afterVersion: string;
  afterFingerprint: string;
  caveats: string;
};

export function expectedR53CClaimIds(entryId: (typeof r53cMigratedEntryIds)[number]) {
  return Array.from({ length: claimCounts[entryId] }, (_, index) => `${entryId}-C${String(index + 1).padStart(2, "0")}`);
}

function sourceBodies() {
  const v2 = JSON.parse(readFileSync(join(process.cwd(), "docs/curadoria-cultural/v2/pacote-original/acervo-editorial.json"), "utf8")) as {
    records: Array<{ id: string; editorialBody: string }>;
  };
  const v21 = JSON.parse(readFileSync(join(process.cwd(), "docs/curadoria-cultural/v2.1/pacote-original/acervo-complementar.json"), "utf8")) as Array<{
    id: string;
    proposedBody: string;
  }>;
  const bodies = new Map(v2.records.map((record) => [record.id, record.editorialBody]));
  bodies.set("BIB-011", v21.find((record) => record.id === "BIB-011")!.proposedBody);
  return bodies;
}

export function parseR53CTraceText(text: string, expectedEntryIds: readonly string[] = r53cMigratedEntryIds) {
  const problems: string[] = [];
  const rows: R53CTraceRow[] = [];
  const lines = text.split("\n");
  const headerIndex = lines.findIndex((line) => line.startsWith("| Registro | Classe | Quantidade de claims |"));
  if (headerIndex === -1) return { rows, problems: ["missing R.5.3-C summary table"] };
  const seen = new Set<string>();
  for (let index = headerIndex + 2; index < lines.length && lines[index].startsWith("|"); index += 1) {
    const cells = lines[index].split("|").map((cell) => cell.trim());
    if (cells.length !== 8) {
      problems.push(`R.5.3-C traceability line ${index + 1} has wrong column count`);
      continue;
    }
    const uncode = (value: string) => value.replace(/^`|`$/g, "");
    const match = cells[5].match(/^`(candidate-\d+)`\/`([0-9a-f]{64})` → `(candidate-\d+)`\/`([0-9a-f]{64})`$/);
    const row: R53CTraceRow = {
      entryId: uncode(cells[1]),
      classification: cells[2],
      claimCount: Number(cells[3]),
      bodySha256: uncode(cells[4]),
      beforeVersion: match?.[1] ?? "",
      beforeFingerprint: match?.[2] ?? "",
      afterVersion: match?.[3] ?? "",
      afterFingerprint: match?.[4] ?? "",
      caveats: cells[6],
    };
    if (!match) problems.push(`malformed R.5.3-C fingerprint line ${index + 1}`);
    if (!/^[A-Z]+-\d{3}$/.test(row.entryId)) problems.push(`invalid R.5.3-C record id line ${index + 1}`);
    if (!["A", "B"].includes(row.classification)) problems.push(`invalid R.5.3-C class line ${index + 1}`);
    if (!/^[0-9a-f]{64}$/.test(row.bodySha256)) problems.push(`invalid R.5.3-C body hash line ${index + 1}`);
    if (!Number.isInteger(row.claimCount) || row.claimCount <= 0) problems.push(`invalid R.5.3-C claim count line ${index + 1}`);
    if (!row.caveats) problems.push(`empty R.5.3-C caveats line ${index + 1}`);
    if (seen.has(row.entryId)) problems.push(`duplicate R.5.3-C traceability row ${row.entryId}`);
    seen.add(row.entryId);
    rows.push(row);
  }
  for (const entryId of expectedEntryIds) {
    if (!seen.has(entryId)) problems.push(`missing R.5.3-C traceability row ${entryId}`);
  }
  for (const entryId of seen) {
    if (!expectedEntryIds.includes(entryId)) problems.push(`unexpected R.5.3-C traceability row ${entryId}`);
  }
  return { rows, problems };
}

function stripTransitionFields(entry: CulturalCatalogEntry) {
  const copy = { ...entry } as Partial<CulturalCatalogEntry>;
  delete copy.version;
  delete copy.editorialBody;
  delete copy.artwork;
  return copy;
}

export function materializeR53B2BaselineEntry(content: unknown, version: string, workflow?: Record<string, unknown>) {
  return {
    ...(content as Record<string, unknown>),
    version,
    ...(workflow ?? { validationStatus: "draft", reviews: [], internalPending: [] }),
  } as unknown as CulturalCatalogEntry;
}

export function validateR53CTransition(catalog: CulturalCatalogEntry[], rows: R53CTraceRow[]) {
  const problems: string[] = [];
  const bodies = sourceBodies();
  const expectedBodyIds = [...r53cMigratedEntryIds, ...r53cE4EntryIds].sort();
  const actualBodyIds = catalog.filter((entry) => entry.editorialBody).map((entry) => entry.id).sort();
  if (!isDeepStrictEqual(actualBodyIds, expectedBodyIds)) problems.push("editorial body record set differs from expected 14");
  if (catalog.length !== 41) problems.push(`expected 41 records, got ${catalog.length}`);
  if (rows.length !== 11) problems.push(`expected 11 R.5.3-C rows, got ${rows.length}`);

  let associationCount = 0;
  for (const entryId of r53cMigratedEntryIds) {
    const entry = catalog.find((item) => item.id === entryId);
    const row = rows.find((item) => item.entryId === entryId);
    const baseline = culturalR53B2PostMigrationBaseline[entryId];
    if (!entry || !row) {
      problems.push(`missing R.5.3-C entry or traceability row ${entryId}`);
      continue;
    }
    if (!entry.editorialBody) {
      problems.push(`missing migrated editorial body ${entryId}`);
      continue;
    }
    const expectedBody = bodies.get(entryId)!;
    if (entry.editorialBody.paragraphs.length !== 1 || entry.editorialBody.paragraphs[0] !== expectedBody) {
      problems.push(`editorial body differs from independent source ${entryId}`);
    }
    const actualBodyHash = createHash("sha256").update(expectedBody, "utf8").digest("hex");
    if (actualBodyHash !== row.bodySha256) problems.push(`documented body hash mismatch ${entryId}`);
    const expectedClaims = expectedR53CClaimIds(entryId);
    if (!isDeepStrictEqual(entry.editorialBody.claimIds, expectedClaims)) problems.push(`wrong claim collection ${entryId}`);
    if (new Set(entry.editorialBody.claimIds).size !== entry.editorialBody.claimIds.length) problems.push(`duplicate body claim ${entryId}`);
    for (const claimId of entry.editorialBody.claimIds) {
      if (!entry.claims.some((claim) => claim.id === claimId)) problems.push(`non-local or missing body claim ${entryId}:${claimId}`);
    }
    associationCount += entry.editorialBody.claimIds.length;
    if (entryId === "PER-001" && entry.editorialBody.claimIds.includes("claim-1")) problems.push("PER-001 body includes legacy claim-1");

    const beforeVersion = `candidate-${Number(afterVersions[entryId].split("-")[1]) - 1}`;
    if (baseline.version !== beforeVersion || row.beforeVersion !== beforeVersion) problems.push(`before version mismatch ${entryId}`);
    if (entry.version !== afterVersions[entryId] || row.afterVersion !== afterVersions[entryId]) problems.push(`after version mismatch ${entryId}`);
    const baselineEntry = materializeR53B2BaselineEntry(structuredClone(baseline.content), baseline.version, structuredClone(baseline.workflow));
    if (getCulturalContentFingerprint(baselineEntry) !== baseline.fingerprint) problems.push(`frozen baseline fingerprint mismatch ${entryId}`);
    const currentWithoutBody = structuredClone(entry);
    delete currentWithoutBody.editorialBody;
    delete currentWithoutBody.artwork;
    if (getCulturalContentFingerprint(currentWithoutBody) !== row.beforeFingerprint) problems.push(`before fingerprint mismatch ${entryId}`);
    const currentWithoutArtwork = structuredClone(entry);
    delete currentWithoutArtwork.artwork;
    if (getCulturalContentFingerprint(currentWithoutArtwork) !== row.afterFingerprint) problems.push(`after fingerprint mismatch ${entryId}`);
    if (row.beforeFingerprint === row.afterFingerprint) problems.push(`fingerprint did not change materially ${entryId}`);
    if (row.beforeFingerprint !== baseline.fingerprint) problems.push(`traceability before fingerprint differs from frozen baseline ${entryId}`);
    if (!isDeepStrictEqual(stripTransitionFields(entry), stripTransitionFields(baselineEntry))) problems.push(`unauthorized structural change ${entryId}`);
  }
  if (associationCount !== 47) problems.push(`expected 47 R.5.3-C associations, got ${associationCount}`);

  for (const entryId of r53cE4EntryIds) {
    const entry = catalog.find((item) => item.id === entryId);
    const sourceBody = bodies.get(entryId)!;
    if (!entry?.editorialBody) {
      problems.push(`missing preserved E.4 body ${entryId}`);
      continue;
    }
    if (!isDeepStrictEqual(entry.editorialBody.paragraphs, [sourceBody])) problems.push(`altered E.4 body ${entryId}`);
    if (!isDeepStrictEqual(entry.editorialBody.claimIds, e4ClaimIds[entryId])) problems.push(`altered E.4 body claims ${entryId}`);
  }

  for (const entry of catalog) {
    if ((r53cMigratedEntryIds as readonly string[]).includes(entry.id)) continue;
    const baseline = culturalPreR53CFingerprintBaseline[entry.id as keyof typeof culturalPreR53CFingerprintBaseline];
    if (!baseline) {
      problems.push(`unexpected record outside frozen baseline ${entry.id}`);
      continue;
    }
    if (entry.version !== baseline.version) problems.push(`out-of-scope version change ${entry.id}`);
    if (entry.validationStatus !== baseline.workflow.validationStatus) problems.push(`out-of-scope validation status change ${entry.id}`);
    if (!isDeepStrictEqual(entry.reviews, baseline.workflow.reviews)) problems.push(`out-of-scope reviews change ${entry.id}`);
    if (!isDeepStrictEqual(entry.internalPending, baseline.workflow.internalPending)) problems.push(`out-of-scope internal pending change ${entry.id}`);
    if (entry.publicationAuthorization !== (baseline.workflow as { publicationAuthorization?: unknown }).publicationAuthorization) problems.push(`out-of-scope authorization change ${entry.id}`);
    const entryWithoutArtwork = structuredClone(entry);
    delete entryWithoutArtwork.artwork;
    if (getCulturalContentFingerprint(entryWithoutArtwork) !== baseline.fingerprint) problems.push(`out-of-scope fingerprint change ${entry.id}`);
  }

  if (!catalog.every((entry) => entry.validationStatus === "draft" && entry.reviews.length === 0 && entry.publicationAuthorization === undefined)) {
    problems.push("editorial workflow state changed");
  }
  if (!catalog.every((entry) => entry.artwork === undefined)) problems.push("unexpected real artwork");
  return problems;
}
