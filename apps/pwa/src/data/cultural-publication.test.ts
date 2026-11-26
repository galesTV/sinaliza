import { describe, expect, it } from "vitest";

import { culturalCatalog } from "./cultural-catalog";
import type {
  CulturalHistoryEntry,
  CulturalReview,
} from "./cultural-catalog-model";
import {
  getCulturalPublicationBlockers,
  isCulturalPublishable,
  projectPublicCulturalEntries,
} from "./cultural-publication";
import { getPublicCulturalEntries } from "./cultural-public";

function makeReview(
  type: CulturalReview["type"],
  version = "v1",
): CulturalReview {
  return {
    reviewer: `Revisor ${type}`,
    type,
    date: "2026-11-26",
    version,
  };
}

function makePublishableHistory(
  overrides: Partial<CulturalHistoryEntry> = {},
): CulturalHistoryEntry {
  return {
    id: "TEST-001",
    slug: "registro-sintetico",
    category: "history",
    title: "Registro sintético",
    summary: "Resumo sintético verificado.",
    version: "v1",
    references: [
      {
        id: "source-1",
        url: "https://example.org/fonte",
        institution: "Instituição sintética",
        purpose: "Fundamentar a afirmação sintética",
        consultedAt: "2026-11-26",
      },
    ],
    claims: [
      {
        id: "claim-1",
        text: "Afirmação sintética.",
        referenceIds: ["source-1"],
      },
    ],
    validationStatus: "expert-validated",
    reviews: [makeReview("research"), makeReview("technical"), makeReview("expert")],
    publicationAuthorization: {
      authorizer: "Responsável sintético",
      date: "2026-11-26",
      version: "v1",
      scope: "public-web",
    },
    rights: { mode: "external-link-only", assets: [] },
    relatedEntries: [],
    internalPending: [],
    history: { year: 2026, unknownMetadata: [] },
    ...overrides,
  };
}

describe("isCulturalPublishable", () => {
  it("accepts a synthetic fixture with the complete review chain and final authorization", () => {
    const entry = makePublishableHistory();
    expect(isCulturalPublishable(entry, [entry])).toBe(true);
  });

  it("keeps all 35 real cultural records unpublished", () => {
    for (const entry of culturalCatalog) {
      expect(isCulturalPublishable(entry, culturalCatalog), entry.id).toBe(false);
    }
    expect(projectPublicCulturalEntries(culturalCatalog)).toEqual([]);
    expect(getPublicCulturalEntries()).toEqual([]);
  });

  it("ignores a manual publishable boolean even when injected into the object", () => {
    const draft = {
      ...culturalCatalog[0],
      publishable: true,
    } as typeof culturalCatalog[number] & { publishable: boolean };
    expect(isCulturalPublishable(draft, culturalCatalog)).toBe(false);
  });

  it("rejects categories outside the public taxonomy", () => {
    const entry = {
      ...makePublishableHistory(),
      category: "benchmark",
    } as unknown as CulturalHistoryEntry;
    expect(getCulturalPublicationBlockers(entry, [entry]).join("\n")).toContain(
      "public cultural taxonomy",
    );
  });

  it("rejects incomplete publication references", () => {
    const entry = makePublishableHistory({
      references: [
        {
          id: "source-1",
          url: "https://example.org/fonte",
        },
      ],
    });
    expect(getCulturalPublicationBlockers(entry, [entry]).join("\n")).toContain(
      "incomplete publication references",
    );
  });

  it("rejects missing, stale and out-of-order reviews", () => {
    const missing = makePublishableHistory({ reviews: [] });
    expect(getCulturalPublicationBlockers(missing, [missing]).join("\n")).toContain(
      "missing research review",
    );

    const stale = makePublishableHistory({
      reviews: [
        makeReview("research", "v0"),
        makeReview("technical", "v0"),
        makeReview("expert", "v0"),
      ],
    });
    expect(getCulturalPublicationBlockers(stale, [stale]).join("\n")).toContain(
      "outdated editorial version",
    );

    const outOfOrder = makePublishableHistory({
      reviews: [makeReview("expert"), makeReview("technical"), makeReview("research")],
    });
    expect(getCulturalPublicationBlockers(outOfOrder, [outOfOrder]).join("\n")).toContain(
      "review chain is out of order",
    );
  });

  it("rejects missing or outdated final publication authorization", () => {
    const missing = makePublishableHistory({ publicationAuthorization: undefined });
    expect(getCulturalPublicationBlockers(missing, [missing]).join("\n")).toContain(
      "missing final publication authorization",
    );

    const stale = makePublishableHistory({
      publicationAuthorization: {
        authorizer: "Responsável sintético",
        date: "2026-11-26",
        version: "v0",
        scope: "public-web",
      },
    });
    expect(getCulturalPublicationBlockers(stale, [stale]).join("\n")).toContain(
      "authorization covers an outdated editorial version",
    );
  });

  it("rejects unresolved internal pendências", () => {
    const entry = makePublishableHistory({ internalPending: ["Conferir fonte."] });
    expect(getCulturalPublicationBlockers(entry, [entry]).join("\n")).toContain(
      "unresolved internal editorial pending items",
    );
  });

  it("rejects insufficient rights evidence for declared assets", () => {
    const entry = makePublishableHistory({
      rights: {
        mode: "licensed-assets",
        assets: [
          {
            id: "asset-1",
            kind: "image",
            scope: "local-review",
          },
        ],
      },
    });
    const problems = getCulturalPublicationBlockers(entry, [entry]).join("\n");
    expect(problems).toContain("missing source");
    expect(problems).toContain("missing license");
    expect(problems).toContain("missing permission evidence");
    expect(problems).toContain("missing publication evidence");
    expect(problems).toContain("scope is not public");
  });

  it("rejects unverified or evidence-free semantic relations", () => {
    const unverified = makePublishableHistory({
      relatedEntries: [
        { targetId: "TEST-002", kind: "unverified-candidate", evidenceReferenceIds: [] },
      ],
    });
    expect(getCulturalPublicationBlockers(unverified, [unverified]).join("\n")).toContain(
      "unverified semantics",
    );

    const withoutEvidence = makePublishableHistory({
      relatedEntries: [
        { targetId: "TEST-002", kind: "historical-context", evidenceReferenceIds: [] },
      ],
    });
    expect(
      getCulturalPublicationBlockers(withoutEvidence, [withoutEvidence]).join("\n"),
    ).toContain("has no evidence");
  });
});

describe("projectPublicCulturalEntries", () => {
  it("projects only allowlisted public fields", () => {
    const entry = makePublishableHistory();
    const [publicEntry] = projectPublicCulturalEntries([entry]);
    expect(publicEntry).toBeDefined();
    expect(publicEntry).toMatchObject({
      id: "TEST-001",
      slug: "registro-sintetico",
      category: "history",
      title: "Registro sintético",
    });

    const serialized = JSON.stringify(publicEntry);
    expect(serialized).not.toContain("internalPending");
    expect(serialized).not.toContain("validationStatus");
    expect(serialized).not.toContain("publicationAuthorization");
    expect(serialized).not.toContain("Revisor research");
    expect(serialized).not.toContain("Responsável sintético");
    expect(serialized).not.toContain("permissionEvidence");
  });

  it("omits relations whose targets are not publishable", () => {
    const draftTarget = makePublishableHistory({
      id: "TEST-002",
      slug: "alvo-em-rascunho",
      validationStatus: "draft",
      reviews: [],
      publicationAuthorization: undefined,
      internalPending: ["Pendente."],
    });
    const source = makePublishableHistory({
      relatedEntries: [
        {
          targetId: "TEST-002",
          kind: "historical-context",
          evidenceReferenceIds: ["source-1"],
        },
      ],
    });
    const [publicSource] = projectPublicCulturalEntries([source, draftTarget]);
    expect(publicSource.relatedEntries).toEqual([]);
  });

  it("keeps relations only when both records are publishable", () => {
    const target = makePublishableHistory({ id: "TEST-002", slug: "alvo-publicavel" });
    const source = makePublishableHistory({
      relatedEntries: [
        {
          targetId: "TEST-002",
          kind: "historical-context",
          evidenceReferenceIds: ["source-1"],
        },
      ],
    });
    const [publicSource] = projectPublicCulturalEntries([source, target]);
    expect(publicSource.relatedEntries).toEqual([
      { targetId: "TEST-002", kind: "historical-context" },
    ]);
  });
});
