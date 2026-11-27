import { describe, expect, it } from "vitest";

import { culturalCatalog } from "./cultural-catalog";
import type {
  CulturalHistoryEntry,
  CulturalReview,
} from "./cultural-catalog-model";
import {
  getCulturalContentFingerprint,
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
  const entry: CulturalHistoryEntry = {
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

  const contentFingerprint = getCulturalContentFingerprint(entry);
  entry.reviews = entry.reviews.map((review) => ({
    ...review,
    contentFingerprint,
  }));
  if (entry.publicationAuthorization) {
    entry.publicationAuthorization = {
      ...entry.publicationAuthorization,
      contentFingerprint,
    };
  }
  return entry;
}

describe("isCulturalPublishable", () => {
  it("accepts a synthetic fixture with the complete review chain and final authorization", () => {
    const entry = makePublishableHistory();
    expect(isCulturalPublishable(entry, [entry])).toBe(true);
  });

  it("keeps all 41 real cultural records unpublished", () => {
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

  it("does not block otherwise approved content because optional relations are unpublished", () => {
    const unverified = makePublishableHistory({
      relatedEntries: [
        { targetId: "TEST-002", kind: "unverified-candidate", evidenceReferenceIds: [] },
      ],
    });
    const draftTarget = makePublishableHistory({
      id: "TEST-002",
      slug: "alvo-sintetico",
      validationStatus: "draft",
      reviews: [],
      publicationAuthorization: undefined,
      internalPending: ["Pendente."],
    });
    expect(isCulturalPublishable(unverified, [unverified, draftTarget])).toBe(true);
    expect(projectPublicCulturalEntries([unverified, draftTarget])[0].relatedEntries).toEqual([]);

    const withoutEvidence = makePublishableHistory({
      relatedEntries: [
        { targetId: "TEST-002", kind: "historical-context", evidenceReferenceIds: [] },
      ],
    });
    expect(isCulturalPublishable(withoutEvidence, [withoutEvidence, draftTarget])).toBe(true);
    expect(projectPublicCulturalEntries([withoutEvidence, draftTarget])[0].relatedEntries).toEqual([]);
  });

  it("is deterministic and independent of workflow-only fields", () => {
    const first = makePublishableHistory();
    const second = makePublishableHistory({
      version: "v2",
      validationStatus: "draft",
      reviews: [],
      publicationAuthorization: undefined,
      internalPending: ["Workflow note only."],
    });
    expect(getCulturalContentFingerprint(first)).toMatch(/^[a-f0-9]{64}$/);
    expect(getCulturalContentFingerprint(first)).toBe(getCulturalContentFingerprint(second));
  });

  it.each([
    ["entry text", (entry: CulturalHistoryEntry) => ({ ...entry, title: "Texto alterado" })],
    [
      "claims",
      (entry: CulturalHistoryEntry) => ({
        ...entry,
        claims: [{ ...entry.claims[0], text: "Afirmação alterada." }],
      }),
    ],
    [
      "references",
      (entry: CulturalHistoryEntry) => ({
        ...entry,
        references: [{ ...entry.references[0], purpose: "Finalidade alterada" }],
      }),
    ],
    [
      "rights",
      (entry: CulturalHistoryEntry) => ({
        ...entry,
        rights: { ...entry.rights, notes: "Nota de direitos alterada" },
      }),
    ],
    [
      "media",
      (entry: CulturalHistoryEntry) => ({
        ...entry,
        rights: {
          mode: "licensed-assets" as const,
          assets: [{ id: "asset-1", kind: "image" as const, scope: "public" as const }],
        },
      }),
    ],
  ])("rejects reused approvals when %s change without a new review", (_name, mutate) => {
    const mutated = mutate(makePublishableHistory());
    const problems = getCulturalPublicationBlockers(mutated, [mutated]).join("\n");
    expect(isCulturalPublishable(mutated, [mutated])).toBe(false);
    expect(problems).toContain("review covers a different content fingerprint");
    expect(problems).toContain("authorization covers a different content fingerprint");
  });

  it("rejects reviews and authorization that lack fingerprints", () => {
    const entry = makePublishableHistory();
    entry.reviews = entry.reviews.map((review) => {
      const copy = { ...review };
      delete copy.contentFingerprint;
      return copy;
    });
    entry.publicationAuthorization = {
      ...entry.publicationAuthorization!,
      contentFingerprint: undefined,
    };
    const problems = getCulturalPublicationBlockers(entry, [entry]).join("\n");
    expect(problems).toContain("research review lacks a content fingerprint");
    expect(problems).toContain("final publication authorization lacks a content fingerprint");
  });

  it("rejects authorization predating reviews, orphan candidate targets, invalid URLs, and blank library metadata", () => {
    const earlyAuth = makePublishableHistory();
    earlyAuth.reviews = earlyAuth.reviews.map((review) => ({ ...review, date: "2026-11-27" }));
    earlyAuth.publicationAuthorization!.date = "2026-11-26";
    expect(getCulturalPublicationBlockers(earlyAuth, [earlyAuth]).join("\n")).toContain(
      "authorization predates",
    );

    const orphan = makePublishableHistory({
      relatedEntries: [{ targetId: "MISSING", kind: "unverified-candidate", evidenceReferenceIds: [] }],
    });
    expect(isCulturalPublishable(orphan, [orphan])).toBe(true);
    expect(projectPublicCulturalEntries([orphan])[0].relatedEntries).toEqual([]);

    const invalidUrl = makePublishableHistory({
      references: [{ ...makePublishableHistory().references[0], url: "https://" }],
    });
    expect(getCulturalPublicationBlockers(invalidUrl, [invalidUrl]).join("\n")).toContain(
      "valid https URL",
    );
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


  it("drops non-allowlisted nested fields even when injected at runtime", () => {
    const entry = makePublishableHistory() as CulturalHistoryEntry & {
      editorDebug: string;
      references: Array<CulturalHistoryEntry["references"][number] & { privateNote: string }>;
      history: CulturalHistoryEntry["history"] & { internalTrace: string };
    };
    entry.editorDebug = "internal-editor-debug";
    entry.references[0].privateNote = "private-source-note";
    entry.history.internalTrace = "internal-history-trace";
    const fingerprint = getCulturalContentFingerprint(entry);
    entry.reviews = entry.reviews.map((review) => ({ ...review, contentFingerprint: fingerprint }));
    entry.publicationAuthorization!.contentFingerprint = fingerprint;

    const [publicEntry] = projectPublicCulturalEntries([entry]);
    const serialized = JSON.stringify(publicEntry);
    expect(serialized).not.toContain("internal-editor-debug");
    expect(serialized).not.toContain("private-source-note");
    expect(serialized).not.toContain("internal-history-trace");
    expect(serialized).not.toContain("rights");
    expect(serialized).not.toContain("claims");
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
