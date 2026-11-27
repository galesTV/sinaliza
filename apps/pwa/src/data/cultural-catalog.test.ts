import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { culturalCatalog, getCulturalEntryById } from "./cultural-catalog";
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
