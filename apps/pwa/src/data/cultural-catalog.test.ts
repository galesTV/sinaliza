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


  it("does not migrate any real editorial body in the contract-only stage", () => {
    for (const entry of culturalCatalog) {
      expect(entry.editorialBody, entry.id).toBeUndefined();
    }
  });

  it("preserves source URLs without inventing missing source metadata", () => {
    for (const entry of culturalCatalog) {
      expect(entry.references.length, entry.id).toBeGreaterThan(0);
      for (const reference of entry.references) {
        expect(reference.url, `${entry.id}:${reference.id}`).toMatch(/^https:\/\//);
        expect(reference.institution, `${entry.id}:${reference.id}`).toBeUndefined();
        expect(reference.purpose, `${entry.id}:${reference.id}`).toBeUndefined();
        expect(reference.consultedAt, `${entry.id}:${reference.id}`).toBeUndefined();
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
    const blocked = new Set(["PER-001-C03", "PER-001-C04", "PER-002-C01", "BIB-002-C01", "BIB-010-C02"]);
    const approved = matrix.filter((claim) => !blocked.has(claim.id));
    expect(approved).toHaveLength(26);

    const migrated = culturalCatalog.flatMap((entry) =>
      entry.claims.filter((claim) => claim.id.includes("-C")).map((claim) => ({ entry, claim })),
    );
    expect(migrated).toHaveLength(26);

    for (const source of approved) {
      const entry = culturalCatalog.find((item) => item.id === source.entryId)!;
      const claim = entry.claims.find((item) => item.id === source.id);
      expect(claim, source.id).toBeDefined();
      expect(claim!.text, source.id).toBe(source.text);
      expect(claim!.referenceIds.length, source.id).toBeGreaterThan(0);
      for (const referenceId of claim!.referenceIds) {
        expect(entry.references.some((reference) => reference.id === referenceId), `${source.id}:${referenceId}`).toBe(true);
      }
    }

    for (const blockedId of blocked) {
      expect(culturalCatalog.some((entry) => entry.claims.some((claim) => claim.id === blockedId)), blockedId).toBe(false);
    }
  });

  it("versions only the 12 authorized records as candidate-2 and keeps reference IDs unique", () => {
    const authorized = new Set(["HIST-001", "HIST-006", "HIST-008", "CUR-001", "CUR-002", "CUR-006", "PER-001", "BIB-003", "BIB-004", "BIB-005", "BIB-010", "BIB-011"]);
    for (const entry of culturalCatalog) {
      expect(entry.version, entry.id).toBe(authorized.has(entry.id) ? "candidate-2" : "candidate-1");
      const referenceIds = entry.references.map((reference) => reference.id);
      expect(new Set(referenceIds).size, entry.id).toBe(referenceIds.length);
    }
    expect(getCulturalEntryById("PER-002")!.claims.map((claim) => claim.id)).toEqual(["claim-1"]);
    expect(getCulturalEntryById("BIB-002")!.claims.map((claim) => claim.id)).toEqual(["claim-1"]);
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

  it("preserves 29 baseline records and changes only authorized claim/reference/version content", () => {
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
      expect(entry.version, entryId).toBe("candidate-2");

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
      const expectedClaimIds = approved
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

    expect(addedClaimCount).toBe(26);
    expect(addedReferences).toEqual([
      {
        entryId: "CUR-002",
        id: "source-2",
        url: "https://ojsrevista.furb.br/ojs/index.php/linguagens/article/download/7287/4653/32619",
      },
      {
        entryId: "CUR-002",
        id: "source-3",
        url: "https://doi.org/10.51207/2179-4057.20220014",
      },
      {
        entryId: "CUR-006",
        id: "source-3",
        url: "https://librando.paginas.ufsc.br/poemas/",
      },
      {
        entryId: "PER-001",
        id: "source-2",
        url: "https://indl.iphan.gov.br/pessoas-de-referencia/nelson-pimenta-de-castro/",
      },
      {
        entryId: "PER-001",
        id: "source-3",
        url: "https://nuestra.ufsc.br/vocab/index.php?tema=42&/nelson-pimenta-de-castro",
      },
      {
        entryId: "BIB-004",
        id: "source-2",
        url: "https://librando.paginas.ufsc.br/livros-2/",
      },
    ]);
  });
});
