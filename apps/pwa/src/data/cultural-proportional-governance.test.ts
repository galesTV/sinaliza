import { describe, expect, it } from "vitest";

import { culturalCatalog } from "./cultural-catalog";
import type {
  CulturalDocumentarySurface,
  CulturalLibraryEntry,
  CulturalReview,
  CulturalReviewPolicy,
} from "./cultural-catalog-model";
import {
  getCulturalContentFingerprint,
  getCulturalPublicationBlockers,
  isCulturalPublishable,
  projectPublicCulturalEntries,
} from "./cultural-publication";

function makeReview(
  type: CulturalReview["type"],
  overrides: Partial<CulturalReview> = {},
): CulturalReview {
  return {
    reviewer: `Revisor ${type}`,
    type,
    date: "2026-11-26",
    version: "v1",
    ...overrides,
  };
}

function refreshApprovalFingerprints(entry: CulturalLibraryEntry): CulturalLibraryEntry {
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

function documentaryPolicyFor(entry: CulturalLibraryEntry): CulturalReviewPolicy {
  const coveredSurfaces: CulturalDocumentarySurface[] = [
    "identity",
    "title",
    "summary",
    "claims",
    "references",
    "libraryMetadata",
    "relatedEntries",
  ];
  if (entry.editorialBody !== undefined) coveredSurfaces.push("editorialBody");

  return {
    path: "documentary",
    documentaryEligibility: {
      contentClass: "bibliographic-descriptive",
      rationale:
        "Ficha sintética estritamente bibliográfica, sem conteúdo pedagógico ou interpretativo.",
      claimIds: entry.claims.map((claim) => claim.id),
      coveredSurfaces,
    },
  };
}

function makeDocumentaryLibrary(
  overrides: Partial<CulturalLibraryEntry> = {},
): CulturalLibraryEntry {
  const entry: CulturalLibraryEntry = {
    id: "TEST-LIB-001",
    slug: "registro-documental-sintetico",
    category: "library",
    title: "Registro documental sintético",
    summary: "Resumo bibliográfico sintético.",
    version: "v1",
    references: [
      {
        id: "source-1",
        url: "https://example.org/fonte",
        institution: "Instituição sintética",
        purpose: "Fundamentar metadados bibliográficos sintéticos",
        consultedAt: "2026-11-26",
      },
    ],
    claims: [
      {
        id: "claim-1",
        text: "Afirmação bibliográfica sintética.",
        referenceIds: ["source-1"],
      },
    ],
    validationStatus: "documentary-validated",
    reviews: [makeReview("research"), makeReview("technical")],
    publicationAuthorization: {
      authorizer: "Responsável sintético",
      date: "2026-11-26",
      version: "v1",
      scope: "public-web",
    },
    rights: { mode: "external-link-only", assets: [] },
    relatedEntries: [],
    internalPending: [],
    library: {
      creators: ["Instituição sintética"],
      publicationYear: 2026,
      publisher: "Editora sintética",
      format: "book",
      access: "external-website",
      languages: ["Português"],
      unknownMetadata: [],
    },
    ...overrides,
  };

  if (entry.reviewPolicy === undefined) {
    entry.reviewPolicy = documentaryPolicyFor(entry);
  }
  return refreshApprovalFingerprints(entry);
}

function makeExpertLibrary(
  overrides: Partial<CulturalLibraryEntry> = {},
): CulturalLibraryEntry {
  const entry = makeDocumentaryLibrary({
    validationStatus: "expert-validated",
    reviews: [makeReview("research"), makeReview("technical"), makeReview("expert")],
    ...overrides,
  });
  entry.reviewPolicy = { path: "expert-required" };
  return refreshApprovalFingerprints(entry);
}

function makeLegacyExpertLibrary(
  overrides: Partial<CulturalLibraryEntry> = {},
): CulturalLibraryEntry {
  const entry = makeDocumentaryLibrary({
    validationStatus: "expert-validated",
    reviews: [makeReview("research"), makeReview("technical"), makeReview("expert")],
    ...overrides,
  });
  delete entry.reviewPolicy;
  return refreshApprovalFingerprints(entry);
}

function problemsOf(entry: CulturalLibraryEntry): string {
  return getCulturalPublicationBlockers(entry, [entry]).join("\n");
}

describe("proportional cultural governance: valid paths", () => {
  it("accepts a complete synthetic documentary path without expert review", () => {
    const entry = makeDocumentaryLibrary();
    expect(entry.reviews.some((review) => review.type === "expert")).toBe(false);
    expect(isCulturalPublishable(entry, [entry])).toBe(true);
  });

  it("keeps covered orphan candidate relations internal and omitted from projection", () => {
    const entry = makeDocumentaryLibrary({
      relatedEntries: [
        {
          targetId: "MISSING",
          kind: "unverified-candidate",
          evidenceReferenceIds: [],
        },
      ],
    });
    expect(isCulturalPublishable(entry, [entry])).toBe(true);
    expect(projectPublicCulturalEntries([entry])[0].relatedEntries).toEqual([]);
  });

  it("accepts a complete synthetic explicit expert-required path", () => {
    const entry = makeExpertLibrary();
    expect(isCulturalPublishable(entry, [entry])).toBe(true);
  });

  it("accepts a complete synthetic legacy expert path without a policy field", () => {
    const entry = makeLegacyExpertLibrary();
    expect("reviewPolicy" in entry).toBe(false);
    expect(isCulturalPublishable(entry, [entry])).toBe(true);
  });

  it("does not expose internal policy, review, authorization or fingerprint fields publicly", () => {
    const entry = makeDocumentaryLibrary();
    const [publicEntry] = projectPublicCulturalEntries([entry]);
    expect(publicEntry).toBeDefined();
    const serialized = JSON.stringify(publicEntry);
    for (const forbidden of [
      "reviewPolicy",
      "documentaryEligibility",
      "validationStatus",
      "publicationAuthorization",
      "contentFingerprint",
      "Revisor research",
      "Responsável sintético",
      "claimIds",
      "claims",
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});

describe("proportional cultural governance: policy structure and eligibility", () => {
  it("rejects null, malformed and unknown review policies without throwing", () => {
    const cases: Array<[string, unknown, string]> = [
      ["null", null, "invalid structure"],
      ["array", [], "invalid structure"],
      ["unknown path", { path: "documental" }, "unknown path"],
      ["missing path", {}, "missing path"],
      ["non-string path", { path: 42 }, "path must be a string"],
      ["expert with eligibility", { path: "expert-required", documentaryEligibility: {} }, "cannot declare documentary eligibility"],
      ["unknown policy key", { path: "documentary", extra: true }, "unknown field"],
      ["missing eligibility", { path: "documentary" }, "missing documentary eligibility"],
      ["null eligibility", { path: "documentary", documentaryEligibility: null }, "invalid structure"],
      [
        "non-array claim coverage",
        { path: "documentary", documentaryEligibility: { contentClass: "bibliographic-descriptive", rationale: "Sintético", claimIds: "claim-1", coveredSurfaces: [] } },
        "claim ids must be an array",
      ],
      [
        "non-array surface coverage",
        { path: "documentary", documentaryEligibility: { contentClass: "bibliographic-descriptive", rationale: "Sintético", claimIds: [], coveredSurfaces: "summary" } },
        "covered surfaces must be an array",
      ],
    ];

    for (const [name, reviewPolicy, expected] of cases) {
      const entry = makeDocumentaryLibrary({
        reviewPolicy: reviewPolicy as CulturalLibraryEntry["reviewPolicy"],
      });
      expect(problemsOf(entry), name).toContain(expected);
      expect(isCulturalPublishable(entry, [entry]), name).toBe(false);
    }
  });

  it("rejects documentary policy outside the library category", () => {
    const entry = makeDocumentaryLibrary() as CulturalLibraryEntry;
    const mutated = {
      ...entry,
      category: "history",
      history: { year: 2026, unknownMetadata: [] },
    } as unknown as CulturalLibraryEntry;
    expect(problemsOf(mutated)).toContain("eligible only for library records");
    expect(isCulturalPublishable(mutated, [mutated])).toBe(false);
  });

  it("rejects unsupported content class and missing or blank rationale", () => {
    const policy = documentaryPolicyFor(makeDocumentaryLibrary());
    if (policy.path !== "documentary") throw new Error("unexpected fixture");

    const wrongClass = makeDocumentaryLibrary({
      reviewPolicy: {
        ...policy,
        documentaryEligibility: {
          ...policy.documentaryEligibility,
          contentClass: "general-editorial" as never,
        },
      },
    });
    expect(problemsOf(wrongClass)).toContain("unsupported content class");

    for (const rationale of [undefined, "", "   "] as const) {
      const entry = makeDocumentaryLibrary({
        reviewPolicy: {
          ...policy,
          documentaryEligibility: {
            ...policy.documentaryEligibility,
            rationale: rationale as string,
          },
        },
      });
      expect(problemsOf(entry)).toContain("missing rationale");
      expect(isCulturalPublishable(entry, [entry])).toBe(false);
    }
  });

  it("requires exact claim coverage and rejects missing, duplicate and unknown ids", () => {
    const valid = makeDocumentaryLibrary();
    const policy = documentaryPolicyFor(valid);
    if (policy.path !== "documentary") throw new Error("unexpected fixture");
    const eligibility = policy.documentaryEligibility;

    const missing = makeDocumentaryLibrary({
      reviewPolicy: {
        ...policy,
        documentaryEligibility: { ...eligibility, claimIds: [] },
      },
    });
    expect(problemsOf(missing)).toContain('missing claim "claim-1"');

    const duplicate = makeDocumentaryLibrary({
      reviewPolicy: {
        ...policy,
        documentaryEligibility: { ...eligibility, claimIds: ["claim-1", "claim-1"] },
      },
    });
    expect(problemsOf(duplicate)).toContain('duplicate claim "claim-1"');

    const unknown = makeDocumentaryLibrary({
      reviewPolicy: {
        ...policy,
        documentaryEligibility: { ...eligibility, claimIds: ["claim-1", "claim-404"] },
      },
    });
    expect(problemsOf(unknown)).toContain('unknown claim "claim-404"');

    for (const entry of [missing, duplicate, unknown]) {
      expect(isCulturalPublishable(entry, [entry])).toBe(false);
    }
  });

  it("requires exact surface coverage, including newly present editorial surfaces", () => {
    const valid = makeDocumentaryLibrary();
    const policy = documentaryPolicyFor(valid);
    if (policy.path !== "documentary") throw new Error("unexpected fixture");
    const eligibility = policy.documentaryEligibility;

    const missing = makeDocumentaryLibrary({
      reviewPolicy: {
        ...policy,
        documentaryEligibility: {
          ...eligibility,
          coveredSurfaces: eligibility.coveredSurfaces.filter(
            (surface) => surface !== "libraryMetadata",
          ),
        },
      },
    });
    expect(problemsOf(missing)).toContain('missing surface "libraryMetadata"');

    const duplicate = makeDocumentaryLibrary({
      reviewPolicy: {
        ...policy,
        documentaryEligibility: {
          ...eligibility,
          coveredSurfaces: [...eligibility.coveredSurfaces, "summary"],
        },
      },
    });
    expect(problemsOf(duplicate)).toContain('duplicate surface "summary"');

    const unknown = makeDocumentaryLibrary({
      reviewPolicy: {
        ...policy,
        documentaryEligibility: {
          ...eligibility,
          coveredSurfaces: [...eligibility.coveredSurfaces, "privateNotes" as never],
        },
      },
    });
    expect(problemsOf(unknown)).toContain('unknown surface "privateNotes"');

    const withBody = makeDocumentaryLibrary({
      editorialBody: {
        paragraphs: ["Corpo bibliográfico sintético."],
        claimIds: ["claim-1"],
      },
    });
    expect(isCulturalPublishable(withBody, [withBody])).toBe(true);

    const policyWithoutBody = documentaryPolicyFor(valid);
    if (policyWithoutBody.path !== "documentary") throw new Error("unexpected fixture");
    const uncoveredNewSurface = makeDocumentaryLibrary({
      editorialBody: {
        paragraphs: ["Corpo bibliográfico sintético."],
        claimIds: ["claim-1"],
      },
      reviewPolicy: policyWithoutBody,
    });
    expect(problemsOf(uncoveredNewSurface)).toContain('missing surface "editorialBody"');

    const incompatibleSurface = makeDocumentaryLibrary({
      reviewPolicy: {
        ...policy,
        documentaryEligibility: {
          ...eligibility,
          coveredSurfaces: [...eligibility.coveredSurfaces, "editorialBody"],
        },
      },
    });
    expect(problemsOf(incompatibleSurface)).toContain('incompatible surface "editorialBody"');
  });

  it("requires conservative rights, no assets, no artwork and no pendências", () => {
    const wrongRights = makeDocumentaryLibrary({
      rights: { mode: "licensed-assets", assets: [] },
    });
    expect(problemsOf(wrongRights)).toContain("requires external-link-only rights");

    const withAssets = makeDocumentaryLibrary({
      rights: {
        mode: "licensed-assets",
        assets: [{ id: "asset-1", kind: "image", scope: "public" }],
      },
    });
    expect(problemsOf(withAssets)).toContain("requires no third-party assets");

    const withArtwork = makeDocumentaryLibrary({
      artwork: { motif: "literary" },
    });
    expect(problemsOf(withArtwork)).toContain("requires no artwork");

    const pending = makeDocumentaryLibrary({ internalPending: ["Pendência sintética."] });
    expect(problemsOf(pending)).toContain("requires no internal pending items");

    for (const entry of [wrongRights, withAssets, withArtwork, pending]) {
      expect(isCulturalPublishable(entry, [entry])).toBe(false);
    }
  });
});

describe("proportional cultural governance: workflows", () => {
  it("rejects documentary entries missing research, technical or final authorization", () => {
    const noResearch = makeDocumentaryLibrary({ reviews: [makeReview("technical")] });
    expect(problemsOf(noResearch)).toContain("missing research review");

    const noTechnical = makeDocumentaryLibrary({ reviews: [makeReview("research")] });
    expect(problemsOf(noTechnical)).toContain("missing technical review");

    const noAuthorization = makeDocumentaryLibrary({ publicationAuthorization: undefined });
    expect(problemsOf(noAuthorization)).toContain("missing final publication authorization");

    for (const entry of [noResearch, noTechnical, noAuthorization]) {
      expect(isCulturalPublishable(entry, [entry])).toBe(false);
    }
  });

  it("still requires expert review in explicit and legacy expert paths", () => {
    for (const entry of [
      makeExpertLibrary({ reviews: [makeReview("research"), makeReview("technical")] }),
      makeLegacyExpertLibrary({ reviews: [makeReview("research"), makeReview("technical")] }),
    ]) {
      expect(problemsOf(entry)).toContain("missing expert review");
      expect(isCulturalPublishable(entry, [entry])).toBe(false);
    }
  });

  it("rejects terminal states incompatible with the required review policy", () => {
    const expertStatusWithDocumentaryPolicy = makeDocumentaryLibrary({
      validationStatus: "expert-validated",
    });
    expect(problemsOf(expertStatusWithDocumentaryPolicy)).toContain(
      "entry has not completed documentary validation",
    );
    expect(problemsOf(expertStatusWithDocumentaryPolicy)).toContain(
      "validation status is incompatible",
    );

    const documentaryStatusWithoutPolicy = makeLegacyExpertLibrary({
      validationStatus: "documentary-validated",
      reviews: [makeReview("research"), makeReview("technical")],
    });
    expect(problemsOf(documentaryStatusWithoutPolicy)).toContain(
      "entry has not completed expert validation",
    );
    expect(problemsOf(documentaryStatusWithoutPolicy)).toContain(
      "validation status is incompatible",
    );
  });

  it("rejects out-of-order reviews and stale versions", () => {
    const outOfOrder = makeDocumentaryLibrary({
      reviews: [makeReview("technical"), makeReview("research")],
    });
    expect(problemsOf(outOfOrder)).toContain("review chain is out of order");

    const stale = makeDocumentaryLibrary({
      reviews: [makeReview("research", { version: "v0" }), makeReview("technical", { version: "v0" })],
    });
    expect(problemsOf(stale)).toContain("outdated editorial version");
  });

  it("rejects fingerprint mismatches in reviews and authorization", () => {
    const entry = makeDocumentaryLibrary();
    entry.reviews = entry.reviews.map((review) => ({
      ...review,
      contentFingerprint: "0".repeat(64),
    }));
    entry.publicationAuthorization!.contentFingerprint = "0".repeat(64);
    const problems = problemsOf(entry);
    expect(problems).toContain("review covers a different content fingerprint");
    expect(problems).toContain("authorization covers a different content fingerprint");
    expect(isCulturalPublishable(entry, [entry])).toBe(false);
  });

  it("rejects authorization dated before required reviews", () => {
    const entry = makeDocumentaryLibrary();
    entry.reviews = entry.reviews.map((review) => ({ ...review, date: "2026-11-27" }));
    entry.publicationAuthorization!.date = "2026-11-26";
    expect(problemsOf(entry)).toContain("authorization predates");
  });

  it("invalidates reused approvals after policy, eligibility or content changes", () => {
    const approved = makeDocumentaryLibrary();
    const originalFingerprint = getCulturalContentFingerprint(approved);
    const policy = approved.reviewPolicy;
    if (policy?.path !== "documentary") throw new Error("unexpected fixture");

    const policySwitch = {
      ...approved,
      validationStatus: "expert-validated" as const,
      reviews: [...approved.reviews, makeReview("expert")],
      reviewPolicy: { path: "expert-required" },
    } as CulturalLibraryEntry;
    expect(getCulturalContentFingerprint(policySwitch)).not.toBe(originalFingerprint);
    expect(problemsOf(policySwitch)).toContain("review covers a different content fingerprint");
    expect(problemsOf(policySwitch)).toContain("authorization covers a different content fingerprint");

    const eligibilityChange = {
      ...approved,
      reviewPolicy: {
        ...policy,
        documentaryEligibility: {
          ...policy.documentaryEligibility,
          rationale: "Justificativa alterada.",
        },
      },
    } as CulturalLibraryEntry;
    expect(getCulturalContentFingerprint(eligibilityChange)).not.toBe(originalFingerprint);
    expect(problemsOf(eligibilityChange)).toContain("review covers a different content fingerprint");

    const contentChange = { ...approved, title: "Título alterado" };
    expect(getCulturalContentFingerprint(contentChange)).not.toBe(originalFingerprint);
    expect(problemsOf(contentChange)).toContain("authorization covers a different content fingerprint");
  });

  it("keeps incomplete references and internal pendências blocking both paths", () => {
    const incompleteReferenceDocumentary = makeDocumentaryLibrary({
      references: [{ id: "source-1", url: "https://example.org/fonte" }],
    });
    expect(problemsOf(incompleteReferenceDocumentary)).toContain("incomplete publication references");

    const pendingExpert = makeExpertLibrary({ internalPending: ["Pendência sintética."] });
    expect(problemsOf(pendingExpert)).toContain("unresolved internal editorial pending items");
  });
});

describe("proportional cultural governance: fingerprint and registry invariants", () => {
  it("changes fingerprints when policy is added, switched or eligibility coverage changes", () => {
    const legacy = makeLegacyExpertLibrary();
    const legacyFingerprint = getCulturalContentFingerprint(legacy);

    const explicitExpert = {
      ...legacy,
      reviewPolicy: { path: "expert-required" },
    } as CulturalLibraryEntry;
    expect(getCulturalContentFingerprint(explicitExpert)).not.toBe(legacyFingerprint);

    const documentary = makeDocumentaryLibrary();
    const documentaryFingerprint = getCulturalContentFingerprint(documentary);
    const policy = documentary.reviewPolicy;
    if (policy?.path !== "documentary") throw new Error("unexpected fixture");

    const coverageChange = {
      ...documentary,
      reviewPolicy: {
        ...policy,
        documentaryEligibility: {
          ...policy.documentaryEligibility,
          claimIds: [...policy.documentaryEligibility.claimIds],
          coveredSurfaces: [...policy.documentaryEligibility.coveredSurfaces].reverse(),
        },
      },
    } as CulturalLibraryEntry;
    expect(getCulturalContentFingerprint(coverageChange)).not.toBe(documentaryFingerprint);
  });

  it("adds review policies only to the two explicitly classified real records", () => {
    expect(culturalCatalog).toHaveLength(41);
    expect(
      culturalCatalog
        .filter((entry) => entry.reviewPolicy !== undefined)
        .map((entry) => entry.id)
        .sort(),
    ).toEqual(["BIB-004", "BIB-011"]);
    expect(projectPublicCulturalEntries(culturalCatalog)).toEqual([]);
  });
});
