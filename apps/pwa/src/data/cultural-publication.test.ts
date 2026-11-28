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


  it("accepts a structurally valid optional editorial body without treating it as semantic validation", () => {
    const entry = makePublishableHistory({
      editorialBody: {
        paragraphs: ["Parágrafo editorial sintético.", "Segundo parágrafo com <strong>HTML</strong> e **Markdown** tratados como texto."],
        claimIds: ["claim-1"],
      },
    });
    expect(isCulturalPublishable(entry, [entry])).toBe(true);
  });

  it("keeps exactly the two authorized real cultural records published and all others unpublished", () => {
    for (const entry of culturalCatalog) {
      const expected = entry.id === "BIB-004" || entry.id === "BIB-011";
      expect(isCulturalPublishable(entry, culturalCatalog), entry.id).toBe(expected);
    }
    expect(projectPublicCulturalEntries(culturalCatalog).map((entry) => entry.id).sort()).toEqual(["BIB-004", "BIB-011"]);
    expect(getPublicCulturalEntries().map((entry) => entry.id).sort()).toEqual(["BIB-004", "BIB-011"]);
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

  it("rejects structurally invalid editorial bodies and blocks publication", () => {
    const cases: Array<[string, CulturalHistoryEntry["editorialBody"], string[]]> = [
      ["missing paragraphs", { paragraphs: [], claimIds: ["claim-1"] }, ["missing paragraphs"]],
      ["blank paragraph", { paragraphs: ["   "], claimIds: ["claim-1"] }, ["empty text"]],
      ["missing claim ids", { paragraphs: ["Texto sintético."], claimIds: [] }, ["missing claim ids"]],
      ["empty claim id", { paragraphs: ["Texto sintético."], claimIds: [""] }, ["empty id", "no valid claims"]],
      ["duplicate claim id", { paragraphs: ["Texto sintético."], claimIds: ["claim-1", "claim-1"] }, ["duplicate id"]],
      ["unknown claim id", { paragraphs: ["Texto sintético."], claimIds: ["claim-404"] }, ["unknown claim", "no valid claims"]],
    ];

    for (const [name, editorialBody, expected] of cases) {
      const entry = makePublishableHistory({ editorialBody });
      const problems = getCulturalPublicationBlockers(entry, [entry]).join("\n");
      for (const fragment of expected) {
        expect(problems, `${name}: ${fragment}`).toContain(fragment);
      }
      expect(isCulturalPublishable(entry, [entry]), name).toBe(false);
    }
  });

  it("blocks malformed editorial body runtime structures without throwing", () => {
    const cases: Array<[string, unknown, string[]]> = [
      ["null", null, ["invalid structure"]],
      ["false", false, ["invalid structure"]],
      ["string", "texto", ["invalid structure"]],
      ["array", [], ["invalid structure"]],
      ["empty object", {}, ["missing paragraphs", "missing claim ids"]],
      ["missing paragraphs", { claimIds: ["claim-1"] }, ["missing paragraphs"]],
      ["null paragraphs", { paragraphs: null, claimIds: ["claim-1"] }, ["paragraphs must be an array"]],
      ["string paragraphs", { paragraphs: "texto", claimIds: ["claim-1"] }, ["paragraphs must be an array"]],
      ["non-string paragraph", { paragraphs: ["Texto sintético.", 42], claimIds: ["claim-1"] }, ["non-string text"]],
      ["missing claim ids", { paragraphs: ["Texto sintético."] }, ["missing claim ids"]],
      ["null claim ids", { paragraphs: ["Texto sintético."], claimIds: null }, ["claim ids must be an array"]],
      ["string claim ids", { paragraphs: ["Texto sintético."], claimIds: "claim-1" }, ["claim ids must be an array"]],
      ["non-string claim id", { paragraphs: ["Texto sintético."], claimIds: ["claim-1", 42] }, ["non-string id"]],
    ];

    for (const [name, editorialBody, expected] of cases) {
      const entry = makePublishableHistory({
        editorialBody: editorialBody as CulturalHistoryEntry["editorialBody"],
      });
      let problems: string[] = [];
      expect(() => {
        problems = getCulturalPublicationBlockers(entry, [entry]);
      }, name).not.toThrow();
      expect(() => getCulturalContentFingerprint(entry), name).not.toThrow();
      const joined = problems.join("\n");
      for (const fragment of expected) {
        expect(joined, `${name}: ${fragment}`).toContain(fragment);
      }
      expect(isCulturalPublishable(entry, [entry]), name).toBe(false);
      expect(projectPublicCulturalEntries([entry]), name).toEqual([]);
    }
  });

  it("resolves a legacy claim id within the owning record before checking other records", () => {
    const other = makePublishableHistory({ id: "TEST-002", slug: "outro-registro" });
    const entry = makePublishableHistory({
      editorialBody: {
        paragraphs: ["Texto editorial sintético."],
        claimIds: ["claim-1"],
      },
    });
    expect(other.claims.some((claim) => claim.id === "claim-1")).toBe(true);
    expect(entry.claims.some((claim) => claim.id === "claim-1")).toBe(true);
    expect(isCulturalPublishable(entry, [entry, other])).toBe(true);
  });

  it("rejects an editorial body claim that belongs to another record", () => {
    const target = makePublishableHistory({ id: "TEST-002", slug: "outro-registro" });
    target.claims = [{ id: "foreign-claim", text: "Afirmação externa.", referenceIds: ["source-1"] }];
    const entry = makePublishableHistory({
      editorialBody: { paragraphs: ["Texto sintético."], claimIds: ["foreign-claim"] },
    });
    const problems = getCulturalPublicationBlockers(entry, [entry, target]).join("\n");
    expect(problems).toContain("belongs to another record");
    expect(problems).toContain("no valid claims");
    expect(isCulturalPublishable(entry, [entry, target])).toBe(false);
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


  it("changes the fingerprint when editorial body content or claim links change", () => {
    const withoutBody = makePublishableHistory();
    const withBody = makePublishableHistory({
      editorialBody: {
        paragraphs: ["Primeiro parágrafo.", "Segundo parágrafo."],
        claimIds: ["claim-1"],
      },
    });
    const baseline = getCulturalContentFingerprint(withBody);
    expect(getCulturalContentFingerprint(withoutBody)).not.toBe(baseline);

    const removed = { ...withBody };
    delete removed.editorialBody;
    expect(getCulturalContentFingerprint(removed)).toBe(
      getCulturalContentFingerprint(withoutBody),
    );

    const altered = {
      ...withBody,
      editorialBody: {
        ...withBody.editorialBody!,
        paragraphs: ["Primeiro parágrafo alterado.", "Segundo parágrafo."],
      },
    };
    expect(getCulturalContentFingerprint(altered)).not.toBe(baseline);

    const reordered = {
      ...withBody,
      editorialBody: {
        ...withBody.editorialBody!,
        paragraphs: ["Segundo parágrafo.", "Primeiro parágrafo."],
      },
    };
    expect(getCulturalContentFingerprint(reordered)).not.toBe(baseline);

    const twoClaimEntry = {
      ...withBody,
      claims: [
        ...withBody.claims,
        { id: "claim-2", text: "Outra afirmação sintética.", referenceIds: ["source-1"] },
      ],
    };
    const firstClaimLink = getCulturalContentFingerprint(twoClaimEntry);
    const secondClaimLink = {
      ...twoClaimEntry,
      editorialBody: {
        ...twoClaimEntry.editorialBody!,
        claimIds: ["claim-2"],
      },
    };
    expect(getCulturalContentFingerprint(secondClaimLink)).not.toBe(firstClaimLink);
  });

  it("rejects reused reviews and authorization after the editorial body changes", () => {
    const approved = makePublishableHistory({
      editorialBody: {
        paragraphs: ["Corpo editorial original."],
        claimIds: ["claim-1"],
      },
    });
    const mutated = {
      ...approved,
      editorialBody: {
        ...approved.editorialBody!,
        paragraphs: ["Corpo editorial modificado."],
      },
    };
    const problems = getCulturalPublicationBlockers(mutated, [mutated]).join("\n");
    expect(isCulturalPublishable(mutated, [mutated])).toBe(false);
    expect(problems).toContain("review covers a different content fingerprint");
    expect(problems).toContain("authorization covers a different content fingerprint");
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


  it("projects only editorial body paragraphs, preserving exact order and treating markup as text", () => {
    const paragraphs = [
      "Primeiro parágrafo com <strong>HTML</strong> literal.",
      "Segundo parágrafo com **Markdown** literal.",
    ];
    const entry = makePublishableHistory({
      editorialBody: { paragraphs, claimIds: ["claim-1"] },
    });
    const [publicEntry] = projectPublicCulturalEntries([entry]);
    expect(publicEntry.editorialBody).toEqual({ paragraphs });
    expect(publicEntry.editorialBody?.paragraphs).not.toBe(paragraphs);

    const serialized = JSON.stringify(publicEntry);
    expect(serialized).toContain("<strong>HTML</strong>");
    expect(serialized).toContain("**Markdown**");
    expect(serialized).not.toContain("claimIds");
    expect(serialized).not.toContain("claims");
    expect(serialized).not.toContain("contentFingerprint");
    expect(serialized).not.toContain("internalPending");
  });

  it("drops extra fields injected inside editorialBody during public projection", () => {
    const entry = makePublishableHistory({
      editorialBody: {
        paragraphs: ["Parágrafo público sintético."],
        claimIds: ["claim-1"],
        internalNote: "não projetar",
        reviewerDebug: { fingerprint: "não projetar" },
      } as CulturalHistoryEntry["editorialBody"],
    });
    const [publicEntry] = projectPublicCulturalEntries([entry]);
    expect(publicEntry.editorialBody).toEqual({
      paragraphs: ["Parágrafo público sintético."],
    });
    expect(JSON.stringify(publicEntry.editorialBody)).not.toContain("internalNote");
    expect(JSON.stringify(publicEntry.editorialBody)).not.toContain("reviewerDebug");
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
