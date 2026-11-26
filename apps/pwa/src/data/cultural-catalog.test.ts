import { describe, expect, it } from "vitest";

import { culturalCatalog, getCulturalEntryById } from "./cultural-catalog";
import {
  CULTURAL_CATEGORIES,
  validateCulturalCatalog,
  validateCulturalEntry,
  type CulturalCatalogEntry,
} from "./cultural-catalog-model";

describe("culturalCatalog migration", () => {
  it("contains exactly the 35 cultural candidates, without benchmarks", () => {
    expect(culturalCatalog).toHaveLength(35);
    expect(culturalCatalog.every((entry) => !entry.id.startsWith("BEN-"))).toBe(true);
    expect(culturalCatalog.filter((entry) => entry.category === "history")).toHaveLength(8);
    expect(culturalCatalog.filter((entry) => entry.category === "curiosity")).toHaveLength(8);
    expect(culturalCatalog.filter((entry) => entry.category === "personality")).toHaveLength(7);
    expect(culturalCatalog.filter((entry) => entry.category === "library")).toHaveLength(12);
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
    expect(problems).toContain("url must use https");
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
