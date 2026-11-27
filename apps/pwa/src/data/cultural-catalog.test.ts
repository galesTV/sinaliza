import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";

import { describe, expect, it } from "vitest";

import { culturalCatalog, getCulturalEntryById } from "./cultural-catalog";
import { culturalMigrationBaseline } from "@/test/cultural-migration-baseline";
import { getCulturalContentFingerprint } from "./cultural-publication";
import {
  CULTURAL_CATEGORIES,
  validateCulturalCatalog,
  validateCulturalEntry,
  type CulturalCatalogEntry,
} from "./cultural-catalog-model";


const approvedEditorialBodyClaimIds = {
  "HIST-001": ["HIST-001-C01", "HIST-001-C02", "HIST-001-C03", "claim-1"],
  "HIST-006": ["HIST-006-C01", "HIST-006-C02", "HIST-006-C03", "HIST-006-C04"],
  "CUR-001": ["CUR-001-C01", "CUR-001-C02"],
} as const;
const approvedEditorialBodyEntryIds = new Set<string>(
  Object.keys(approvedEditorialBodyClaimIds),
);

describe("culturalCatalog migration", () => {
  it("contains exactly the 41 cultural candidates, without benchmarks", () => {
    expect(culturalCatalog).toHaveLength(41);
    expect(culturalCatalog.every((entry) => !entry.id.startsWith("BEN-"))).toBe(true);
    expect(culturalCatalog.filter((entry) => entry.category === "history")).toHaveLength(8);
    expect(culturalCatalog.filter((entry) => entry.category === "curiosity")).toHaveLength(8);
    expect(culturalCatalog.filter((entry) => entry.category === "personality")).toHaveLength(9);
    expect(culturalCatalog.filter((entry) => entry.category === "library")).toHaveLength(16);
  });

  it("keeps every real record blocked as an unreviewed draft", () => {
    for (const entry of culturalCatalog) {
      expect(entry.validationStatus, entry.id).toBe("draft");
      expect(entry.reviews, entry.id).toEqual([]);
      expect(entry.publicationAuthorization, entry.id).toBeUndefined();
      expect(entry.internalPending.length, entry.id).toBeGreaterThan(0);
    }
  });


  it("preserves the three approved E.4 editorial bodies byte-exactly", () => {
    const acervo = JSON.parse(
      readFileSync(join(process.cwd(), "docs/curadoria-cultural/v2/pacote-original/acervo-editorial.json"), "utf8"),
    ) as { records: Array<{ id: string; editorialBody: string }> };
    const sourceById = new Map(acervo.records.map((record) => [record.id, record.editorialBody]));
    // E.4 permanece validada aqui; o conjunto total de 14 corpos é validado pela transição R.5.3-C.
    for (const entryId of approvedEditorialBodyEntryIds) {
      const entry = culturalCatalog.find((item) => item.id === entryId)!;
      const expectedClaimIds = [
        ...approvedEditorialBodyClaimIds[
          entry.id as keyof typeof approvedEditorialBodyClaimIds
        ],
      ];
      expect(entry.editorialBody, entry.id).toEqual({
        paragraphs: [sourceById.get(entry.id)],
        claimIds: expectedClaimIds,
      });
      expect(entry.editorialBody?.paragraphs[0], entry.id).toBe(sourceById.get(entry.id));
      expect(entry.version, entry.id).toBe("candidate-3");
      for (const claimId of expectedClaimIds) {
        expect(
          entry.claims.some((claim) => claim.id === claimId),
          `${entry.id}:${claimId}`,
        ).toBe(true);
      }
    }
  });

  it("preserves source URLs without inventing missing source metadata", () => {
    for (const entry of culturalCatalog) {
      expect(entry.references.length, entry.id).toBeGreaterThan(0);
      const documentedV21ReferenceIds = new Set([
        "CUR-002:source-4",
        "CUR-006:source-4",
        "PER-002:source-2",
        "BIB-003:source-2",
        "BIB-004:source-3",
        "BIB-011:source-2",
        "PER-001:source-4",
        "PER-001:source-5",
        "BIB-010:source-2",
      ]);
      for (const reference of entry.references) {
        const key = `${entry.id}:${reference.id}`;
        expect(reference.url, key).toMatch(/^https:\/\//);
        if (documentedV21ReferenceIds.has(key)) {
          expect(reference.institution, key).toBeTruthy();
          expect(reference.purpose, key).toBeTruthy();
          expect(reference.consultedAt, key).toBe("2026-11-27");
        } else {
          expect(reference.institution, key).toBeUndefined();
          expect(reference.purpose, key).toBeUndefined();
          expect(reference.consultedAt, key).toBeUndefined();
        }
      }
    }
  });

  it("keeps migrated relations explicitly unverified", () => {
    for (const entry of culturalCatalog) {
      for (const relation of entry.relatedEntries) {
        expect(relation.kind, `${entry.id}->${relation.targetId}`).toBe("unverified-candidate");
        expect(relation.evidenceReferenceIds, `${entry.id}->${relation.targetId}`).toEqual([]);
      }
    }
  });


  it("keeps the six V2 candidates as minimal unpublished drafts", () => {
    const expected = new Set(["PER-008", "PER-009", "BIB-013", "BIB-014", "BIB-015", "BIB-016"]);
    const entries = culturalCatalog.filter((entry) => expected.has(entry.id));
    expect(entries).toHaveLength(6);
    for (const entry of entries) {
      expect(entry.version, entry.id).toBe("candidate-1");
      expect(entry.claims, entry.id).toEqual([]);
      expect(entry.reviews, entry.id).toEqual([]);
      expect(entry.publicationAuthorization, entry.id).toBeUndefined();
      expect(entry.rights, entry.id).toEqual({ mode: "external-link-only", assets: [] });
      expect(entry.relatedEntries, entry.id).toEqual([]);
      expect(entry.internalPending.length, entry.id).toBeGreaterThan(0);
      expect(entry.references.length, entry.id).toBeGreaterThan(0);
      for (const reference of entry.references) {
        expect(reference.url, `${entry.id}:${reference.id}`).toMatch(/^https:\/\//);
      }
    }
  });

  it("keeps all library metadata gaps explicit", () => {
    const expectedGaps = [
      "creators",
      "publicationYear",
      "publisher",
      "format",
      "access",
      "languages",
    ];
    for (const entry of culturalCatalog) {
      if (entry.category !== "library") continue;
      expect(entry.library.unknownMetadata, entry.id).toEqual(expectedGaps);
    }
  });


  it("migrates exactly the 26 approved V2 claims with traceable texts and references", () => {
    const matrix = JSON.parse(
      readFileSync(join(process.cwd(), "docs/curadoria-cultural/v2/pacote-original/matriz-afirmacoes.json"), "utf8"),
    ) as Array<{ id: string; entryId: string; text: string }>;
    expect(matrix).toHaveLength(31);

    const migrated = culturalCatalog.flatMap((entry) =>
      entry.claims.filter((claim) => claim.id.includes("-C")).map((claim) => ({ entry, claim })),
    );
    expect(migrated).toHaveLength(56);

    for (const source of matrix) {
      const entry = culturalCatalog.find((item) => item.id === source.entryId)!;
      const claim = entry.claims.find((item) => item.id === source.id);
      expect(claim, source.id).toBeDefined();
      expect(claim!.text, source.id).toBe(source.text);
      expect(claim!.referenceIds.length, source.id).toBeGreaterThan(0);
      for (const referenceId of claim!.referenceIds) {
        expect(entry.references.some((reference) => reference.id === referenceId), `${source.id}:${referenceId}`).toBe(true);
      }
    }

  });

  it("keeps versions aligned to the authorized editorial migration stages and reference IDs unique", () => {

    for (const entry of culturalCatalog) {
      const complementaryCandidate3 = new Set(["HIST-008", "CUR-002", "CUR-006", "PER-001", "BIB-003", "BIB-004", "BIB-005", "BIB-010", "BIB-011"]);
      const complementaryCandidate2 = new Set(["PER-002", "BIB-002"]);
      expect(entry.version, entry.id).toBe(
        complementaryCandidate3.has(entry.id)
          ? "candidate-4"
          : complementaryCandidate2.has(entry.id)
            ? "candidate-3"
            : approvedEditorialBodyEntryIds.has(entry.id)
              ? "candidate-3"
              : "candidate-1",
      );
      const referenceIds = entry.references.map((reference) => reference.id);
      expect(new Set(referenceIds).size, entry.id).toBe(referenceIds.length);
    }
  });

  it("uses unique ids and slugs", () => {
    const ids = culturalCatalog.map((entry) => entry.id);
    const slugs = culturalCatalog.map((entry) => entry.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("is structurally valid as a draft editorial registry", () => {
    expect(validateCulturalCatalog(culturalCatalog)).toEqual([]);
  });

  it("does not include complementary backlog references as complete records", () => {
    expect(
      culturalCatalog.some((entry) =>
        entry.title.includes("Estudos da Língua Brasileira de Sinais I"),
      ),
    ).toBe(false);
  });
});

describe("validateCulturalEntry", () => {
  it("accepts the migrated HIST-001 draft structurally", () => {
    const entry = getCulturalEntryById("HIST-001")!;
    expect(validateCulturalEntry(entry, culturalCatalog)).toEqual([]);
  });

  it("flags structural problems in incomplete records", () => {
    const entry = {
      ...getCulturalEntryById("HIST-001")!,
      slug: "Slug Inválido",
      title: "",
      references: [{ id: "source-1", url: "http://example.org/fonte" }],
    };
    const problems = validateCulturalEntry(entry, culturalCatalog).join("\n");
    expect(problems).toContain("slug");
    expect(problems).toContain("missing title");
    expect(problems).toContain("valid https URL");
  });

  it("flags relations to unknown targets", () => {
    const entry: CulturalCatalogEntry = {
      ...getCulturalEntryById("HIST-001")!,
      relatedEntries: [
        {
          targetId: "BIB-999",
          kind: "unverified-candidate",
          evidenceReferenceIds: [],
        },
      ],
    };
    expect(validateCulturalEntry(entry, culturalCatalog).join("\n")).toContain(
      'unknown target "BIB-999"',
    );
  });

  it("does not expose benchmarks in the public category taxonomy", () => {
    expect(CULTURAL_CATEGORIES).not.toContain("benchmark");
    expect(CULTURAL_CATEGORIES).toEqual([
      "history",
      "curiosity",
      "personality",
      "library",
    ]);
  });
});


describe("cultural V2 migration integrity hardening", () => {
  type MatrixClaim = {
    id: string;
    entryId: string;
    text: string;
    url: string;
    locator: string;
    consultation: string;
  };

  type TraceabilityRow = {
    claimId: string;
    recordId: string;
    text: string;
    runtimeReference: string;
    originalUrl: string;
    runtimeUrl: string;
    transformation: string;
    locator: string;
    consultation: string;
  };

  const blockedClaimIds = new Set([
    "PER-001-C03",
    "PER-001-C04",
    "PER-002-C01",
    "BIB-002-C01",
    "BIB-010-C02",
  ]);
  const authorizedEntryIds = new Set([
    "HIST-001",
    "HIST-006",
    "HIST-008",
    "CUR-001",
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
  ]);
  const matrixPath = join(
    process.cwd(),
    "docs/curadoria-cultural/v2/pacote-original/matriz-afirmacoes.json",
  );
  const traceabilityPath = join(
    process.cwd(),
    "docs/curadoria-cultural/v2/rastreabilidade-d23d2.md",
  );

  const readMatrix = () =>
    JSON.parse(readFileSync(matrixPath, "utf8")) as MatrixClaim[];
  const complementaryClaims = () =>
    JSON.parse(readFileSync(join(process.cwd(), "docs/curadoria-cultural/v2.1/pacote-original/claims-complementares.json"), "utf8")) as MatrixClaim[];
  const recoveredClaims = () =>
    JSON.parse(readFileSync(join(process.cwd(), "docs/curadoria-cultural/v2.1/pacote-original/claims-recuperadas.json"), "utf8")) as MatrixClaim[];
  const adendoClaims = [
    { id: "PER-001-C05", entryId: "PER-001" },
    { id: "PER-001-C06", entryId: "PER-001" },
    { id: "PER-001-C07", entryId: "PER-001" },
  ];
  const approvedClaims = (matrix: MatrixClaim[]) =>
    matrix.filter((claim) => !blockedClaimIds.has(claim.id));
  const authorizedRuntimeUrl = (source: MatrixClaim) =>
    source.entryId === "BIB-003" && source.url.endsWith("?show=full")
      ? source.url.slice(0, -"?show=full".length)
      : source.url;

  function validateClaimReferenceBinding(
    entry: CulturalCatalogEntry,
    source: MatrixClaim,
  ): string[] {
    const problems: string[] = [];
    if (source.entryId !== entry.id) {
      problems.push(
        `matrix owner ${source.entryId} does not match runtime record ${entry.id}`,
      );
    }

    const claim = entry.claims.find((item) => item.id === source.id);
    if (!claim) {
      problems.push(`missing claim ${source.id}`);
      return problems;
    }
    if (!claim.id.startsWith(`${entry.id}-`)) {
      problems.push(`claim ${claim.id} is not owned by record ${entry.id}`);
    }
    if (claim.text !== source.text) {
      problems.push(`claim ${source.id} text differs from the V2 matrix`);
    }
    if (claim.referenceIds.length !== 1) {
      problems.push(`claim ${source.id} does not have exactly one migrated reference`);
    }

    const reference = entry.references.find(
      (item) => item.id === claim.referenceIds[0],
    );
    if (!reference) {
      problems.push(`claim ${source.id} references a missing reference`);
      return problems;
    }

    const expectedUrl = authorizedRuntimeUrl(source);
    if (reference.url !== expectedUrl) {
      problems.push(
        `claim ${source.id} reference URL ${reference.url} differs from authorized URL ${expectedUrl}`,
      );
    }
    return problems;
  }

  const unquote = (value: string) => value.replace(/^`|`$/g, "");
  function parseTraceabilityRows(markdown: string): TraceabilityRow[] {
    return markdown
      .split("\n")
      .filter((line) => line.startsWith("| `"))
      .map((line) => {
        const cells = line
          .split("|")
          .slice(1, -1)
          .map((cell) => cell.trim());
        if (cells.length !== 9) {
          throw new Error(`Malformed traceability row: ${line}`);
        }
        return {
          claimId: unquote(cells[0]),
          recordId: unquote(cells[1]),
          text: cells[2],
          runtimeReference: unquote(cells[3]),
          originalUrl: cells[4],
          runtimeUrl: cells[5],
          transformation: cells[6],
          locator: cells[7],
          consultation: unquote(cells[8]),
        };
      });
  }

  function expectedTransformation(
    source: MatrixClaim,
    referenceId: string,
    before: CulturalCatalogEntry,
    entry: CulturalCatalogEntry,
    approved: MatrixClaim[],
  ) {
    if (source.entryId === "BIB-003" && source.url.endsWith("?show=full")) {
      return "remoção determinística do sufixo ?show=full para a URL canônica institucional já presente";
    }
    if (before.references.some((reference) => reference.id === referenceId)) {
      return "nenhuma";
    }
    const firstUse = approved.find(
      (item) =>
        item.entryId === source.entryId &&
        entry.claims.find((claim) => claim.id === item.id)?.referenceIds[0] ===
          referenceId,
    );
    return firstUse?.id === source.id
      ? "adição de referência HTTPS ausente"
      : "nenhuma";
  }

  function validateTraceabilityRow(
    row: TraceabilityRow,
    source: MatrixClaim,
    entry: CulturalCatalogEntry,
    before: CulturalCatalogEntry,
    approved: MatrixClaim[],
  ): string[] {
    const problems: string[] = [];
    const claim = entry.claims.find((item) => item.id === source.id);
    const reference = claim
      ? entry.references.find((item) => item.id === claim.referenceIds[0])
      : undefined;
    if (!claim) problems.push(`missing runtime claim ${source.id}`);
    if (!reference) problems.push(`missing runtime reference for ${source.id}`);

    const expected: TraceabilityRow = {
      claimId: source.id,
      recordId: source.entryId,
      text: source.text,
      runtimeReference: claim?.referenceIds[0] ?? "",
      originalUrl: source.url,
      runtimeUrl: reference?.url ?? "",
      transformation: expectedTransformation(
        source,
        claim?.referenceIds[0] ?? "",
        before,
        entry,
        approved,
      ),
      locator: source.locator,
      consultation: source.consultation,
    };

    for (const [key, expectedValue] of Object.entries(expected)) {
      const field = key as keyof TraceabilityRow;
      if (row[field] !== expectedValue) {
        problems.push(
          `${source.id} traceability ${field} is ${row[field]} instead of ${expectedValue}`,
        );
      }
    }
    return problems;
  }


  it("keeps the migration baseline out of runtime source files", () => {
    const sourceRoot = join(process.cwd(), "src");
    const files: string[] = [];
    const visit = (directory: string) => {
      for (const item of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, item.name);
        if (item.isDirectory()) {
          if (path !== join(sourceRoot, "test")) visit(path);
        } else if (
          /\.(ts|tsx)$/.test(item.name) &&
          !item.name.endsWith(".test.ts") &&
          !item.name.endsWith(".test.tsx")
        ) {
          files.push(path);
        }
      }
    };
    visit(sourceRoot);

    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toContain("culturalMigrationBaseline");
      expect(source, file).not.toContain("cultural-migration-baseline");
    }
  });

  it("binds every migrated claim to the exact authorized source URL through a shared validator", () => {
    const matrix = readMatrix();
    for (const source of approvedClaims(matrix)) {
      const entry = culturalCatalog.find((item) => item.id === source.entryId)!;
      expect(validateClaimReferenceBinding(entry, source), source.id).toEqual([]);
    }
  });

  it("rejects incorrect reference associations through the shared validator", () => {
    const matrix = readMatrix();
    const source = matrix.find((item) => item.id === "HIST-001-C01")!;

    const wrongUrlEntry = structuredClone(getCulturalEntryById("HIST-001")!);
    wrongUrlEntry.references.find((item) => item.id === "source-1")!.url =
      "https://example.org/wrong";
    expect(
      validateClaimReferenceBinding(wrongUrlEntry, source).join("\n"),
    ).toContain("differs from authorized URL");

    const missingReferenceEntry = structuredClone(getCulturalEntryById("HIST-001")!);
    missingReferenceEntry.claims.find((item) => item.id === source.id)!.referenceIds = [
      "source-missing",
    ];
    expect(
      validateClaimReferenceBinding(missingReferenceEntry, source).join("\n"),
    ).toContain("missing reference");

    const unauthorizedNormalizationEntry = structuredClone(
      getCulturalEntryById("HIST-001")!,
    );
    unauthorizedNormalizationEntry.references.find(
      (item) => item.id === "source-1",
    )!.url = source.url.slice(0, source.url.lastIndexOf("/"));
    expect(
      validateClaimReferenceBinding(unauthorizedNormalizationEntry, source).join("\n"),
    ).toContain("differs from authorized URL");

    const wrongOwnerEntry = structuredClone(getCulturalEntryById("CUR-001")!);
    const originalEntry = getCulturalEntryById("HIST-001")!;
    wrongOwnerEntry.claims.push(
      structuredClone(originalEntry.claims.find((item) => item.id === source.id)!),
    );
    wrongOwnerEntry.references.push(
      structuredClone(originalEntry.references.find((item) => item.id === "source-1")!),
    );
    expect(
      validateClaimReferenceBinding(
        wrongOwnerEntry,
        { ...source, entryId: wrongOwnerEntry.id },
      ).join("\n"),
    ).toContain("is not owned by record CUR-001");
  });

  it("keeps every traceability row aligned with its individual claim, reference and evidence state", () => {
    const matrix = readMatrix();
    const approved = approvedClaims(matrix);
    const rows = parseTraceabilityRows(readFileSync(traceabilityPath, "utf8"));
    const baseline = JSON.parse(JSON.stringify(culturalMigrationBaseline)) as typeof culturalCatalog;
    const baselineById = new Map(baseline.map((entry) => [entry.id, entry]));

    expect(rows).toHaveLength(26);
    expect(rows.map((row) => row.claimId).sort()).toEqual(
      approved.map((claim) => claim.id).sort(),
    );

    for (const source of approved) {
      const row = rows.find((item) => item.claimId === source.id)!;
      const entry = culturalCatalog.find((item) => item.id === source.entryId)!;
      expect(
        validateTraceabilityRow(
          row,
          source,
          entry,
          baselineById.get(source.entryId)!,
          approved,
        ),
        source.id,
      ).toEqual([]);
    }

    for (const blockedId of blockedClaimIds) {
      expect(rows.some((row) => row.claimId === blockedId), blockedId).toBe(false);
    }
  });

  it("detects swapped traceability references and consultation states", () => {
    const matrix = readMatrix();
    const matrixById = new Map(matrix.map((claim) => [claim.id, claim]));
    const rows = parseTraceabilityRows(readFileSync(traceabilityPath, "utf8"));
    const baseline = JSON.parse(JSON.stringify(culturalMigrationBaseline)) as typeof culturalCatalog;
    const baselineById = new Map(baseline.map((entry) => [entry.id, entry]));
    const validateRow = (row: TraceabilityRow) => {
      const source = matrixById.get(row.claimId)!;
      return validateTraceabilityRow(
        row,
        source,
        culturalCatalog.find((item) => item.id === source.entryId)!,
        baselineById.get(source.entryId)!,
        approvedClaims(matrix),
      ).join("\n");
    };

    const referenceRows = structuredClone(rows);
    const firstReferenceIndex = referenceRows.findIndex(
      (row) => row.claimId === "HIST-001-C01",
    );
    const secondReferenceIndex = referenceRows.findIndex(
      (row) => row.claimId === "CUR-002-C02",
    );
    [
      referenceRows[firstReferenceIndex].runtimeReference,
      referenceRows[secondReferenceIndex].runtimeReference,
    ] = [
      referenceRows[secondReferenceIndex].runtimeReference,
      referenceRows[firstReferenceIndex].runtimeReference,
    ];
    expect(validateRow(referenceRows[firstReferenceIndex])).toContain(
      "traceability runtimeReference",
    );
    expect(validateRow(referenceRows[secondReferenceIndex])).toContain(
      "traceability runtimeReference",
    );

    const consultationRows = structuredClone(rows);
    const firstConsultationIndex = consultationRows.findIndex(
      (row) => row.claimId === "HIST-001-C01",
    );
    const secondConsultationIndex = consultationRows.findIndex(
      (row) => row.claimId === "BIB-003-C01",
    );
    [
      consultationRows[firstConsultationIndex].consultation,
      consultationRows[secondConsultationIndex].consultation,
    ] = [
      consultationRows[secondConsultationIndex].consultation,
      consultationRows[firstConsultationIndex].consultation,
    ];
    expect(validateRow(consultationRows[firstConsultationIndex])).toContain(
      "traceability consultation",
    );
    expect(validateRow(consultationRows[secondConsultationIndex])).toContain(
      "traceability consultation",
    );
  });

  function validateApprovedEditorialBodyMigration(
    entry: CulturalCatalogEntry,
    sourceBody: string,
  ): string[] {
    const problems: string[] = [];
    if (!approvedEditorialBodyEntryIds.has(entry.id)) {
      problems.push(`record ${entry.id} is not authorized for editorial body migration`);
    }
    if (!entry.editorialBody) {
      problems.push(`record ${entry.id} is missing editorial body`);
      return problems;
    }
    const expectedClaimIds = approvedEditorialBodyEntryIds.has(entry.id)
      ? [
          ...approvedEditorialBodyClaimIds[
            entry.id as keyof typeof approvedEditorialBodyClaimIds
          ],
        ]
      : [];
    if (!isDeepStrictEqual(entry.editorialBody.paragraphs, [sourceBody])) {
      problems.push(`record ${entry.id} editorial body differs byte-for-byte from the V2 source`);
    }
    if (!isDeepStrictEqual(entry.editorialBody.claimIds, expectedClaimIds)) {
      problems.push(`record ${entry.id} editorial body claim ids differ from the approved set`);
    }
    for (const claimId of entry.editorialBody.claimIds) {
      if (!entry.claims.some((claim) => claim.id === claimId)) {
        problems.push(`record ${entry.id} editorial body references non-local claim ${claimId}`);
      }
    }
    return problems;
  }

  it("validates the three approved body migrations through a shared byte-exact helper", () => {
    const acervo = JSON.parse(readFileSync(
      join(process.cwd(), "docs/curadoria-cultural/v2/pacote-original/acervo-editorial.json"),
      "utf8",
    )) as { records: Array<{ id: string; editorialBody: string }> };
    const sourceById = new Map(acervo.records.map((record) => [record.id, record.editorialBody]));
    for (const entryId of approvedEditorialBodyEntryIds) {
      const entry = culturalCatalog.find((item) => item.id === entryId)!;
      expect(
        validateApprovedEditorialBodyMigration(entry, sourceById.get(entryId)!),
        entryId,
      ).toEqual([]);
    }
  });

  it("rejects altered, removed, mislinked or unauthorized editorial bodies through the shared helper", () => {
    const hist = structuredClone(getCulturalEntryById("HIST-001")!);
    const sourceBody = hist.editorialBody!.paragraphs[0];

    const altered = structuredClone(hist);
    altered.editorialBody!.paragraphs[0] = `${sourceBody} alterado`;
    expect(validateApprovedEditorialBodyMigration(altered, sourceBody).join("\n")).toContain(
      "differs byte-for-byte",
    );

    const removed = structuredClone(hist);
    delete removed.editorialBody;
    expect(validateApprovedEditorialBodyMigration(removed, sourceBody).join("\n")).toContain(
      "missing editorial body",
    );

    const mislinked = structuredClone(hist);
    mislinked.editorialBody!.claimIds = ["HIST-001-C01", "HIST-001-C02", "HIST-001-C03", "claim-404"];
    expect(validateApprovedEditorialBodyMigration(mislinked, sourceBody).join("\n")).toContain(
      "non-local claim claim-404",
    );

    const unauthorized = structuredClone(getCulturalEntryById("CUR-002")!);
    unauthorized.editorialBody = structuredClone(hist.editorialBody!);
    expect(validateApprovedEditorialBodyMigration(unauthorized, sourceBody).join("\n")).toContain(
      "not authorized",
    );
  });

  it("changes exactly the three approved editorial-body fingerprints", () => {
    const expected = {
      "HIST-001": {
        before: "9d6f9296d64c8be186862f7282e106354ff498003977a2c4b4c57606e5a2834d",
        after: "7cc13fbb7fa0a15b092e0e80782b686c91273581fc18174ff72cc5594451d98b",
      },
      "HIST-006": {
        before: "c25000fefb706576b2ddcb58206a359bddaefa8962e6640a2eccb3c94e947960",
        after: "caddc7d4e35b1f164e41081775f6fdad6387993db49bda556a6f4ee60d8979ae",
      },
      "CUR-001": {
        before: "068140ac553c02221af7c6ad07f9b2546e9868b8a6d847687fdcc08ef77177fc",
        after: "b4da839e9fd3a3f9a2480fb21680873e1dd29118521fc960088d36f21fc2bab2",
      },
    } as const;

    for (const entryId of approvedEditorialBodyEntryIds) {
      const entry = culturalCatalog.find((item) => item.id === entryId)!;
      const beforeEntry = structuredClone(entry);
      delete beforeEntry.editorialBody;
      const fingerprints = expected[entry.id as keyof typeof expected];
      expect(getCulturalContentFingerprint(beforeEntry), `${entry.id}:before`).toBe(fingerprints.before);
      expect(getCulturalContentFingerprint(entry), `${entry.id}:after`).toBe(fingerprints.after);
      expect(fingerprints.after, entry.id).not.toBe(fingerprints.before);
    }
  });

  it("preserves baseline records and changes only authorized claim/reference/version/editorial-body content", () => {
    const baseline = JSON.parse(JSON.stringify(culturalMigrationBaseline)) as typeof culturalCatalog;
    const baselineById = new Map(baseline.map((entry) => [entry.id, entry]));
    for (const entry of culturalCatalog) {
      const before = baselineById.get(entry.id)!;
      const beforeFingerprint = getCulturalContentFingerprint(before);
      const currentFingerprint = getCulturalContentFingerprint(entry);
      if (!authorizedEntryIds.has(entry.id)) {
        expect(entry, entry.id).toEqual(before);
        expect(currentFingerprint, entry.id).toBe(beforeFingerprint);
      } else {
        expect(currentFingerprint, entry.id).not.toBe(beforeFingerprint);
        const strip = (item: CulturalCatalogEntry) => {
          const copy = { ...item } as Partial<CulturalCatalogEntry>;
          delete copy.version;
          delete copy.references;
          delete copy.claims;
          delete copy.editorialBody;
          delete copy.artwork;
          return copy;
        };
        expect(strip(entry), entry.id).toEqual(strip(before));
      }
    }
  });

  it("preserves prior claims and references integrally while adding only approved migration objects", () => {
    const matrix = readMatrix();
    const approved = approvedClaims(matrix);
    const baseline = JSON.parse(JSON.stringify(culturalMigrationBaseline)) as typeof culturalCatalog;
    const baselineById = new Map(baseline.map((entry) => [entry.id, entry]));
    const addedReferences: Array<{ entryId: string; id: string; url: string }> = [];
    let addedClaimCount = 0;

    for (const entryId of authorizedEntryIds) {
      const entry = culturalCatalog.find((item) => item.id === entryId)!;
      const before = baselineById.get(entryId)!;
      expect(entry.version, entryId).toBe(
        entryId === "HIST-001" || entryId === "HIST-006" || entryId === "CUR-001"
          ? "candidate-3"
          : entryId === "PER-002" || entryId === "BIB-002"
            ? "candidate-3"
            : "candidate-4",
      );

      for (const previousClaim of before.claims) {
        expect(
          entry.claims.some((claim) => isDeepStrictEqual(claim, previousClaim)),
          `${entryId}:${previousClaim.id}`,
        ).toBe(true);
      }
      for (const previousReference of before.references) {
        expect(
          entry.references.some((reference) =>
            isDeepStrictEqual(reference, previousReference),
          ),
          `${entryId}:${previousReference.id}`,
        ).toBe(true);
      }

      const entryAddedClaims = entry.claims.filter(
        (claim) => !before.claims.some((item) => isDeepStrictEqual(item, claim)),
      );
      const expectedClaimIds = [
        ...approved,
        ...complementaryClaims(),
        ...recoveredClaims(),
        ...adendoClaims,
      ]
        .filter((claim) => claim.entryId === entryId)
        .map((claim) => claim.id)
        .sort();
      expect(
        entryAddedClaims.map((claim) => claim.id).sort(),
        entryId,
      ).toEqual(expectedClaimIds);
      addedClaimCount += entryAddedClaims.length;

      const entryAddedReferences = entry.references.filter(
        (reference) =>
          !before.references.some((item) => isDeepStrictEqual(item, reference)),
      );
      addedReferences.push(
        ...entryAddedReferences.map((reference) => ({
          entryId,
          id: reference.id,
          url: reference.url,
        })),
      );

      expect(entry.claims).toHaveLength(before.claims.length + expectedClaimIds.length);
      expect(entry.references).toHaveLength(
        before.references.length + entryAddedReferences.length,
      );
    }

    expect(addedClaimCount).toBe(56);
    expect(
      addedReferences.sort((a, b) => `${a.entryId}:${a.id}`.localeCompare(`${b.entryId}:${b.id}`)),
    ).toEqual([
      { entryId: "BIB-004", id: "source-2", url: "https://librando.paginas.ufsc.br/livros-2/" },
      { entryId: "BIB-004", id: "source-3", url: "https://repositorio.ufsc.br/xmlui/bitstream/handle/123456789/259641/Literatura_em_Libras_Rachel_Sutton_Spence.pdf?sequence=1&isAllowed=y" },
      { entryId: "BIB-010", id: "source-2", url: "https://www.scielo.br/j/rbee/a/S5Gyt4gMNzzQJJmLYqMcqCC/abstract/?lang=pt" },
      { entryId: "BIB-011", id: "source-2", url: "https://debasi.ines.gov.br/tv-ines" },
      { entryId: "CUR-002", id: "source-2", url: "https://ojsrevista.furb.br/ojs/index.php/linguagens/article/download/7287/4653/32619" },
      { entryId: "CUR-002", id: "source-3", url: "https://doi.org/10.51207/2179-4057.20220014" },
      { entryId: "CUR-002", id: "source-4", url: "https://letraslibras.paginas.ufsc.br/files/2022/12/LSB7106-Libras-Iniciante.pdf" },
      { entryId: "CUR-006", id: "source-3", url: "https://librando.paginas.ufsc.br/poemas/" },
      { entryId: "CUR-006", id: "source-4", url: "https://www.revistaglauks.ufv.br/Glauks/article/view/377" },
      { entryId: "PER-001", id: "source-2", url: "https://indl.iphan.gov.br/pessoas-de-referencia/nelson-pimenta-de-castro/" },
      { entryId: "PER-001", id: "source-3", url: "https://nuestra.ufsc.br/vocab/index.php?tema=42&/nelson-pimenta-de-castro" },
      { entryId: "PER-001", id: "source-4", url: "https://repositorio.ufsc.br/handle/123456789/204538" },
      { entryId: "PER-001", id: "source-5", url: "https://repositorio.ufsc.br/handle/123456789/100721" },
      { entryId: "PER-002", id: "source-2", url: "https://www.gov.br/fundaj/pt-br/composicao/dimeca/biblioteca/acervos/inventarios-documentais-e-indices/libras_25_4_2012.pdf" },
      { entryId: "BIB-003", id: "source-2", url: "https://www.researchgate.net/publication/385893948_A_Fonetica_e_a_Fonologia_das_Linguas_de_Sinais" },
    ].sort((a, b) => `${a.entryId}:${a.id}`.localeCompare(`${b.entryId}:${b.id}`)));
  });
});

describe("cultural V2.1 complementary evidence migration", () => {
  const v21Dir = join(process.cwd(), "docs/curadoria-cultural/v2.1/pacote-original");
  type V21Claim = {
    id: string;
    entryId: string;
    text: string;
    consultation: string;
  };

  it("migrates exactly the 30 authorized complementary, recovered and PER-001 adendo claims", () => {
    const complementary = JSON.parse(readFileSync(join(v21Dir, "claims-complementares.json"), "utf8")) as V21Claim[];
    const recovered = JSON.parse(readFileSync(join(v21Dir, "claims-recuperadas.json"), "utf8")) as V21Claim[];
    const adendo = [
      ["PER-001-C05", "Nelson Pimenta de Castro é identificado como uma liderança surda pelo Inventário Nacional da Diversidade Linguística."],
      ["PER-001-C06", "Nelson Pimenta de Castro possui trajetória artística no teatro, incluindo atuação no espetáculo Nelson 6 ao Vivo."],
      ["PER-001-C07", "Nelson Pimenta de Castro concluiu mestrado e doutorado em Estudos da Tradução pela Universidade Federal de Santa Catarina."],
    ] as const;
    expect(complementary).toHaveLength(22);
    expect(recovered).toHaveLength(5);

    for (const source of [...complementary, ...recovered]) {
      const entry = getCulturalEntryById(source.entryId)!;
      const claim = entry.claims.find((item) => item.id === source.id);
      expect(claim?.text, source.id).toBe(source.text);
      expect(claim?.referenceIds, source.id).toHaveLength(1);
      expect(
        claim!.referenceIds.every((id) => entry.references.some((reference) => reference.id === id)),
        source.id,
      ).toBe(true);
    }
    for (const [id, text] of adendo) {
      expect(getCulturalEntryById("PER-001")!.claims.find((claim) => claim.id === id)?.text).toBe(text);
    }

    const migratedIds = culturalCatalog.flatMap((entry) =>
      entry.claims.filter((claim) => claim.id.includes("-C")).map((claim) => claim.id),
    );
    expect(migratedIds).toHaveLength(56);
    expect(new Set(migratedIds).size).toBe(56);
  });

  it("preserves the post-R.5.3-B.2 records while the R.5.3-C transition owns the body assertions", () => {
    const expectedVersions = {
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
    } as const;
    for (const [entryId, version] of Object.entries(expectedVersions)) {
      expect(getCulturalEntryById(entryId)?.version, entryId).toBe(version);
    }
    expect(culturalCatalog.filter((entry) => entry.editorialBody).map((entry) => entry.id)).toHaveLength(14);
    expect(culturalCatalog.every((entry) => entry.validationStatus === "draft")).toBe(true);
    expect(culturalCatalog.every((entry) => entry.reviews.length === 0)).toBe(true);
    expect(culturalCatalog.every((entry) => entry.publicationAuthorization === undefined)).toBe(true);
  });
});
