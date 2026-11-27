import { describe, expect, it } from "vitest";

import { culturalCatalog } from "./cultural-catalog";
import {
  validateCulturalEntry,
  type CulturalArtwork,
  type CulturalCatalogEntry,
  type CulturalHistoryEntry,
  type CulturalReview,
} from "./cultural-catalog-model";
import {
  getCulturalContentFingerprint,
  getCulturalPublicationBlockers,
  isCulturalPublishable,
  projectPublicCulturalEntries,
} from "./cultural-publication";

function baseEntry(category: CulturalCatalogEntry["category"]): CulturalCatalogEntry {
  const common = {
    id: "TEST-001",
    slug: "registro-sintetico",
    title: "Registro sintético",
    summary: "Resumo sintético.",
    version: "draft-1",
    references: [{ id: "source-1", url: "https://example.org/fonte" }],
    claims: [
      { id: "claim-1", text: "Afirmação sintética.", referenceIds: ["source-1"] },
      { id: "claim-2", text: "Outra afirmação sintética.", referenceIds: ["source-1"] },
    ],
    validationStatus: "draft" as const,
    reviews: [],
    rights: { mode: "external-link-only" as const, assets: [] },
    relatedEntries: [],
    internalPending: ["Revisão sintética pendente"],
  };
  if (category === "history") {
    return { ...common, category, history: { year: 2026, unknownMetadata: [] } };
  }
  if (category === "curiosity") {
    return {
      ...common,
      category,
      curiosity: { question: "Pergunta sintética?", shortAnswer: "Resposta sintética." },
    };
  }
  if (category === "personality") {
    return {
      ...common,
      category,
      personality: { personName: "Pessoa Sintética", biographicalSummary: "Resumo sintético." },
    };
  }
  return {
    ...common,
    category,
    library: { unknownMetadata: ["creators", "publicationYear", "publisher", "format", "access", "languages"] },
  };
}

function withArtwork(
  category: CulturalCatalogEntry["category"],
  artwork: unknown,
): CulturalCatalogEntry {
  return { ...baseEntry(category), artwork } as CulturalCatalogEntry;
}

function review(type: CulturalReview["type"], fingerprint: string): CulturalReview {
  return {
    reviewer: `Revisor ${type}`,
    type,
    date: "2026-11-26",
    version: "v1",
    contentFingerprint: fingerprint,
  };
}

function makePublishableHistory(artwork?: CulturalHistoryEntry["artwork"]): CulturalHistoryEntry {
  const draft = baseEntry("history") as CulturalHistoryEntry;
  const entry: CulturalHistoryEntry = {
    ...draft,
    version: "v1",
    validationStatus: "expert-validated",
    references: [{
      ...draft.references[0],
      institution: "Instituição sintética",
      purpose: "Fundamentar a afirmação sintética",
      consultedAt: "2026-11-26",
    }],
    reviews: [],
    publicationAuthorization: {
      authorizer: "Responsável sintético",
      date: "2026-11-26",
      version: "v1",
      scope: "public-web",
    },
    internalPending: [],
    ...(artwork ? { artwork } : {}),
  };
  const fingerprint = getCulturalContentFingerprint(entry);
  entry.reviews = [review("research", fingerprint), review("technical", fingerprint), review("expert", fingerprint)];
  entry.publicationAuthorization = { ...entry.publicationAuthorization!, contentFingerprint: fingerprint };
  return entry;
}

describe("cultural artwork metadata", () => {
  it("accepts all eight approved motifs in compatible categories", () => {
    const valid: Array<[CulturalCatalogEntry["category"], CulturalArtwork]> = [
      ["history", { motif: "timeline", events: [{ year: 1855, label: "Proposta", claimId: "claim-1" }] }],
      ["history", { motif: "legal-document", documentNumber: { value: "00.000", claimId: "claim-1" }, documentDate: { value: "1º de janeiro", claimId: "claim-2" } }],
      ["curiosity", { motif: "diversity-orbits" }],
      ["curiosity", { motif: "parallel-structures" }],
      ["curiosity", { motif: "visual-rhythm" }],
      ["personality", { motif: "monogram", initials: "NP" }],
      ["library", { motif: "academic", volumeNumber: { value: "I", claimId: "claim-1" } }],
      ["library", { motif: "literary" }],
    ];
    for (const [category, artwork] of valid) {
      const entry = withArtwork(category, artwork);
      expect(validateCulturalEntry(entry, [entry]), `${category}/${artwork.motif}`).toEqual([]);
    }
  });

  it("rejects malformed roots, unknown motifs and incompatible categories", () => {
    const cases: Array<[string, unknown, string]> = [
      ["null", null, "invalid structure"],
      ["array", [], "invalid structure"],
      ["unknown motif", { motif: "unknown" }, "unknown motif"],
      ["wrong category", { motif: "monogram" }, "incompatible with category"],
      ["unknown root field", { motif: "timeline", unexpected: true }, 'unknown field "unexpected"'],
      ["foreign parameter", { motif: "timeline", documentNumber: { value: "1", claimId: "claim-1" } }, 'unknown field "documentNumber"'],
    ];
    for (const [name, artwork, expected] of cases) {
      const problems = validateCulturalEntry(withArtwork("history", artwork), [baseEntry("history")]).join("\n");
      expect(problems, name).toContain(expected);
    }
  });

  it("rejects inherited-prototype and conventional unknown motifs fail-closed", () => {
    for (const motif of ["constructor", "toString", "proto", "hasOwnProperty", "unknown"]) {
      const entry = {
        ...makePublishableHistory(),
        artwork: { motif },
      } as unknown as CulturalHistoryEntry;
      let blockers: string[] = [];
      expect(() => {
        blockers = getCulturalPublicationBlockers(entry, [entry]);
      }, motif).not.toThrow();
      expect(blockers.join("\n"), motif).toContain("unknown motif");
      expect(isCulturalPublishable(entry, [entry]), motif).toBe(false);
      expect(projectPublicCulturalEntries([entry]), motif).toEqual([]);
    }
  });

  it("validates timeline events structurally without reordering or semantic parsing", () => {
    const cases: Array<[string, unknown, string]> = [
      ["null events", { motif: "timeline", events: null }, "must be an array"],
      ["empty events", { motif: "timeline", events: [] }, "must not be empty"],
      ["malformed event", { motif: "timeline", events: [null] }, "invalid structure"],
      ["incomplete event", { motif: "timeline", events: [{ year: 1855 }] }, "incomplete event"],
      ["fractional year", { motif: "timeline", events: [{ year: 1855.5, label: "Proposta", claimId: "claim-1" }] }, "year must be an integer"],
      ["out of range year", { motif: "timeline", events: [{ year: 2101, label: "Proposta", claimId: "claim-1" }] }, "between 0 and 2100"],
      ["empty label", { motif: "timeline", events: [{ year: 1855, label: "   ", claimId: "claim-1" }] }, "empty label"],
      ["long label", { motif: "timeline", events: [{ year: 1855, label: "x".repeat(81), claimId: "claim-1" }] }, "label is too long"],
      ["unknown event field", { motif: "timeline", events: [{ year: 1855, label: "Proposta", claimId: "claim-1", extra: true }] }, 'unknown field "extra"'],
      ["duplicate event", { motif: "timeline", events: [{ year: 1855, label: "Proposta", claimId: "claim-1" }, { year: 1855, label: "Proposta", claimId: "claim-1" }] }, "duplicate event"],
      ["unknown claim", { motif: "timeline", events: [{ year: 1855, label: "Proposta", claimId: "claim-404" }] }, 'unknown claim "claim-404"'],
    ];
    for (const [name, artwork, expected] of cases) {
      const entry = withArtwork("history", artwork);
      expect(validateCulturalEntry(entry, [entry]).join("\n"), name).toContain(expected);
    }
  });

  it("rejects sparse event arrays and invalid field types without throwing", () => {
    const sparseEvents = new Array(2);
    sparseEvents[1] = { year: 1855, label: "Proposta", claimId: "claim-1" };
    const sparseEntry = withArtwork("history", { motif: "timeline", events: sparseEvents });
    expect(validateCulturalEntry(sparseEntry, [sparseEntry]).join("\n")).toContain("artwork event 0: invalid structure");

    const invalidTypesEntry = withArtwork("history", {
      motif: "timeline",
      events: [
        { year: BigInt(1855), label: "Proposta", claimId: "claim-1" },
        { year: 1856, label: 42, claimId: "claim-1" },
        { year: 1857, label: "Lei", claimId: 42 },
      ],
    });
    let problems = "";
    expect(() => {
      problems = validateCulturalEntry(invalidTypesEntry, [invalidTypesEntry]).join("\n");
    }).not.toThrow();
    expect(problems).toContain("artwork event 0: year must be an integer");
    expect(problems).toContain("artwork event 1: label must be a string");
    expect(problems).toContain("artwork event 2: claim id must be a string");
  });

  it("rejects visual facts and monogram initials with invalid structure", () => {
    const cases: Array<[string, unknown, string]> = [
      ["incomplete fact", { motif: "legal-document", documentNumber: { value: "10.436" } }, "incomplete visual fact"],
      ["empty fact", { motif: "legal-document", documentNumber: { value: " ", claimId: "claim-1" } }, "empty value"],
      ["nested unknown field", { motif: "legal-document", documentNumber: { value: "10.436", claimId: "claim-1", note: "interno" } }, 'unknown field "note"'],
      ["bad volume fact", { motif: "academic", volumeNumber: null }, "invalid visual fact structure"],
      ["blank initials", { motif: "monogram", initials: " " }, "one to four letters"],
      ["long initials", { motif: "monogram", initials: "ABCDE" }, "one to four letters"],
    ];
    const categories = { "incomplete fact": "history", "empty fact": "history", "nested unknown field": "history", "bad volume fact": "library", "blank initials": "personality", "long initials": "personality" } as const;
    for (const [name, artwork, expected] of cases) {
      const entry = withArtwork(categories[name as keyof typeof categories], artwork);
      expect(validateCulturalEntry(entry, [entry]).join("\n"), name).toContain(expected);
    }
  });

  it("rejects a visual claim belonging to another record", () => {
    const foreign = { ...baseEntry("history"), id: "TEST-002" } as CulturalCatalogEntry;
    const entry = withArtwork("history", {
      motif: "timeline",
      events: [{ year: 1855, label: "Proposta", claimId: "claim-1" }],
    });
    const foreignEntry = {
      ...entry,
      id: "TEST-003",
      claims: [{ id: "claim-local", text: "Afirmação local.", referenceIds: ["source-1"] }],
    } as CulturalCatalogEntry;
    const problems = validateCulturalEntry(foreignEntry, [foreign, foreignEntry]).join("\n");
    expect(problems).toContain('claim "claim-1" belongs to another record');
  });

  it("preserves fingerprints when artwork is absent and changes them for material artwork edits", () => {
    const without = baseEntry("history");
    const fingerprintWithout = getCulturalContentFingerprint(without);
    expect(getCulturalContentFingerprint({ ...without })).toBe(fingerprintWithout);
    expect(getCulturalContentFingerprint({ ...without, artwork: undefined })).toBe(fingerprintWithout);

    const eventA = { year: 1855, label: "Proposta", claimId: "claim-1" };
    const eventB = { year: 1856, label: "Aulas", claimId: "claim-2" };
    const timeline = {
      ...without,
      artwork: { motif: "timeline", events: [eventA] },
    } as CulturalCatalogEntry;
    const original = getCulturalContentFingerprint(timeline);
    expect(original).not.toBe(fingerprintWithout);

    const orderedAB = {
      ...without,
      artwork: { motif: "timeline", events: [eventA, eventB] },
    } as CulturalCatalogEntry;
    const orderedBA = {
      ...without,
      artwork: { motif: "timeline", events: [eventB, eventA] },
    } as CulturalCatalogEntry;
    expect(getCulturalContentFingerprint(orderedAB)).not.toBe(getCulturalContentFingerprint(orderedBA));

    const variants = [
      { ...timeline, artwork: { motif: "legal-document" } },
      { ...timeline, artwork: { motif: "timeline", events: [{ year: 1856, label: "Proposta", claimId: "claim-1" }] } },
      { ...timeline, artwork: { motif: "timeline", events: [{ year: 1855, label: "Aulas", claimId: "claim-1" }] } },
      { ...timeline, artwork: { motif: "timeline", events: [{ year: 1855, label: "Proposta", claimId: "claim-2" }] } },
      { ...timeline, artwork: { motif: "timeline", events: [{ year: 1855, label: "Proposta", claimId: "claim-1" }, { year: 1856, label: "Aulas", claimId: "claim-2" }] } },
      { ...timeline, artwork: { motif: "timeline", events: [{ year: 1856, label: "Aulas", claimId: "claim-2" }, { year: 1855, label: "Proposta", claimId: "claim-1" }] } },
    ] as CulturalCatalogEntry[];
    for (const [index, variant] of variants.entries()) {
      expect(getCulturalContentFingerprint(variant), `variant ${index}`).not.toBe(original);
    }

    const parameterCases: Array<[string, CulturalCatalogEntry, CulturalCatalogEntry]> = [
      [
        "documentNumber value",
        withArtwork("history", { motif: "legal-document", documentNumber: { value: "00.000", claimId: "claim-1" } }),
        withArtwork("history", { motif: "legal-document", documentNumber: { value: "00.001", claimId: "claim-1" } }),
      ],
      [
        "documentNumber claim",
        withArtwork("history", { motif: "legal-document", documentNumber: { value: "00.000", claimId: "claim-1" } }),
        withArtwork("history", { motif: "legal-document", documentNumber: { value: "00.000", claimId: "claim-2" } }),
      ],
      [
        "documentDate value",
        withArtwork("history", { motif: "legal-document", documentDate: { value: "1º de janeiro", claimId: "claim-1" } }),
        withArtwork("history", { motif: "legal-document", documentDate: { value: "2 de janeiro", claimId: "claim-1" } }),
      ],
      [
        "documentDate claim",
        withArtwork("history", { motif: "legal-document", documentDate: { value: "1º de janeiro", claimId: "claim-1" } }),
        withArtwork("history", { motif: "legal-document", documentDate: { value: "1º de janeiro", claimId: "claim-2" } }),
      ],
      [
        "initials",
        withArtwork("personality", { motif: "monogram", initials: "NP" }),
        withArtwork("personality", { motif: "monogram", initials: "NPQ" }),
      ],
      [
        "volumeNumber value",
        withArtwork("library", { motif: "academic", volumeNumber: { value: "I", claimId: "claim-1" } }),
        withArtwork("library", { motif: "academic", volumeNumber: { value: "II", claimId: "claim-1" } }),
      ],
      [
        "volumeNumber claim",
        withArtwork("library", { motif: "academic", volumeNumber: { value: "I", claimId: "claim-1" } }),
        withArtwork("library", { motif: "academic", volumeNumber: { value: "I", claimId: "claim-2" } }),
      ],
    ];
    for (const [name, before, after] of parameterCases) {
      expect(getCulturalContentFingerprint(after), name).not.toBe(getCulturalContentFingerprint(before));
    }
  });

  it("invalidates prior reviews and authorization when artwork changes after approval", () => {
    const approved = makePublishableHistory();
    const changed = {
      ...approved,
      artwork: { motif: "timeline", events: [{ year: 1855, label: "Proposta", claimId: "claim-1" }] },
    } as CulturalHistoryEntry;
    const problems = getCulturalPublicationBlockers(changed, [changed]).join("\n");
    expect(problems).toContain("covers a different content fingerprint");
    expect(isCulturalPublishable(changed, [changed])).toBe(false);
  });

  it("projects artwork explicitly without claim ids or unknown nested fields", () => {
    const entry = makePublishableHistory({
      motif: "timeline",
      events: [{ year: 1855, label: "Proposta", claimId: "claim-1" }],
    });
    const [publicEntry] = projectPublicCulturalEntries([entry]);
    expect(publicEntry.artwork).toEqual({
      motif: "timeline",
      events: [{ year: 1855, label: "Proposta" }],
    });
    expect(JSON.stringify(publicEntry.artwork)).not.toContain("claimId");

    const legal = makePublishableHistory({
      motif: "legal-document",
      documentNumber: { value: "00.000", claimId: "claim-1" },
      documentDate: { value: "1º de janeiro", claimId: "claim-2" },
    });
    expect(projectPublicCulturalEntries([legal])[0].artwork).toEqual({
      motif: "legal-document",
      documentNumber: "00.000",
      documentDate: "1º de janeiro",
    });
  });

  it("keeps JSON-compatible malformed artwork fail-closed without throwing in publication or fingerprinting", () => {
    const cases: Array<[string, unknown, string]> = [
      ["null", null, "invalid structure"],
      ["array", [], "invalid structure"],
      ["unknown motif", { motif: "unknown" }, "unknown motif"],
      ["inherited motif", { motif: "constructor" }, "unknown motif"],
      ["null events", { motif: "timeline", events: null }, "must be an array"],
      ["empty events", { motif: "timeline", events: [] }, "must not be empty"],
      ["malformed event", { motif: "timeline", events: [null] }, "invalid structure"],
      ["invalid event year", { motif: "timeline", events: [{ year: 2101, label: "Proposta", claimId: "claim-1" }] }, "between 0 and 2100"],
      ["unknown event field", { motif: "timeline", events: [{ year: 1855, label: "Proposta", claimId: "claim-1", extra: true }] }, 'unknown field "extra"'],
      ["unknown claim", { motif: "timeline", events: [{ year: 1855, label: "Proposta", claimId: "claim-404" }] }, 'unknown claim "claim-404"'],
      ["incomplete visual fact", { motif: "legal-document", documentNumber: { value: "00.000" } }, "incomplete visual fact"],
    ];

    for (const [name, artwork, expected] of cases) {
      const entry = {
        ...makePublishableHistory(),
        artwork,
      } as unknown as CulturalHistoryEntry;
      expect(() => getCulturalContentFingerprint(entry), name).not.toThrow();
      let blockers: string[] = [];
      expect(() => {
        blockers = getCulturalPublicationBlockers(entry, [entry]);
      }, name).not.toThrow();
      expect(blockers.join("\n"), name).toContain(expected);
      expect(isCulturalPublishable(entry, [entry]), name).toBe(false);
      expect(projectPublicCulturalEntries([entry]), name).toEqual([]);
    }
  });

  it("preserves the real registry without artwork or public projection", () => {
    expect(culturalCatalog).toHaveLength(41);
    // Temporary current-state assertions: zero real artworks and three editorial bodies must evolve consciously during R.5.3-C/V.3.3 with dedicated baselines and traceability.
    expect(culturalCatalog.every((entry) => entry.artwork === undefined)).toBe(true);
    expect(culturalCatalog.filter((entry) => entry.editorialBody)).toHaveLength(3);
    expect(culturalCatalog.every((entry) => entry.reviews.length === 0)).toBe(true);
    expect(culturalCatalog.every((entry) => entry.publicationAuthorization === undefined)).toBe(true);
    expect(projectPublicCulturalEntries(culturalCatalog)).toEqual([]);
  });
});
