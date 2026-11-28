import { describe, expect, it } from "vitest";

import { culturalCatalog } from "./cultural-catalog";
import {
  getCulturalContentFingerprint,
  getCulturalPublicationBlockers,
  isCulturalPublishable,
  projectPublicCulturalEntries,
} from "./cultural-publication";
import {
  materializeD335DAfterEntry,
  restoreCulturalD335DBeforeState,
  validateD335DTransition,
} from "@/test/cultural-d335d-transition";

const ids = ["BIB-004", "BIB-011"] as const;

function expectBlockedAfterMutation(mutate: (catalog: typeof culturalCatalog) => void, fragment: string) {
  const altered = structuredClone(culturalCatalog);
  mutate(altered);
  expect(validateD335DTransition(altered).join("\n")).toContain(fragment);
}

describe("D.3.5-D.5 registered documentary decisions", () => {
  it("validates the exact authorized transition end-to-end", () => {
    expect(validateD335DTransition(culturalCatalog)).toEqual([]);
    for (const id of ids) {
      const entry = culturalCatalog.find((item) => item.id === id)!;
      expect(entry).toEqual(materializeD335DAfterEntry(id));
      expect(entry.validationStatus).toBe("documentary-validated");
      expect(entry.reviews.map((review) => review.type)).toEqual(["research", "technical"]);
      expect(entry.reviews.every((review) => review.contentFingerprint === getCulturalContentFingerprint(entry))).toBe(true);
      expect(entry.publicationAuthorization?.scope).toBe("public-web");
      expect(isCulturalPublishable(entry, culturalCatalog)).toBe(true);
      expect(getCulturalPublicationBlockers(entry, culturalCatalog)).toEqual([]);
    }
  });

  it("keeps exact counts and preserves the other 39 records", () => {
    expect(culturalCatalog.filter((entry) => entry.validationStatus === "documentary-validated")).toHaveLength(2);
    expect(culturalCatalog.filter((entry) => entry.validationStatus === "expert-validated")).toHaveLength(0);
    expect(culturalCatalog.flatMap((entry) => entry.reviews)).toHaveLength(4);
    expect(culturalCatalog.flatMap((entry) => entry.reviews).filter((review) => review.type === "expert")).toHaveLength(0);
    expect(culturalCatalog.filter((entry) => entry.publicationAuthorization)).toHaveLength(2);
    expect(culturalCatalog.filter((entry) => entry.validationStatus === "draft")).toHaveLength(39);
    const bib010 = culturalCatalog.find((entry) => entry.id === "BIB-010")!;
    expect(bib010.validationStatus).toBe("draft");
    expect(bib010.reviews).toEqual([]);
    expect(bib010.publicationAuthorization).toBeUndefined();
    expect(isCulturalPublishable(bib010, culturalCatalog)).toBe(false);
  });

  it("projects exactly the two authorized records without internal fields or unverified relations", () => {
    const projected = projectPublicCulturalEntries(culturalCatalog);
    expect(projected.map((entry) => entry.id).sort()).toEqual(["BIB-004", "BIB-011"]);
    for (const entry of projected) {
      const serialized = JSON.stringify(entry);
      expect(entry.relatedEntries).toEqual([]);
      for (const forbidden of ["reviewPolicy", "documentaryEligibility", "validationStatus", "reviews", "publicationAuthorization", "contentFingerprint", "claims", "Gael Leite Guzman"]) {
        expect(serialized).not.toContain(forbidden);
      }
    }
  });

  it("reconstructs the exact pre-D.3.5-D state for historical validation", () => {
    const restored = restoreCulturalD335DBeforeState(culturalCatalog);
    for (const id of ids) {
      const entry = restored.find((item) => item.id === id)!;
      expect(entry.validationStatus).toBe("draft");
      expect(entry.reviews).toEqual([]);
      expect(entry.publicationAuthorization).toBeUndefined();
    }
  });

  it("rejects removal or invalidation of reviews, authorization, fingerprints and scope", () => {
    expectBlockedAfterMutation((catalog) => {
      catalog.find((entry) => entry.id === "BIB-004")!.reviews = catalog.find((entry) => entry.id === "BIB-004")!.reviews.slice(1);
    }, "unauthorized D.3.5-D structural change BIB-004");

    expectBlockedAfterMutation((catalog) => {
      delete catalog.find((entry) => entry.id === "BIB-011")!.publicationAuthorization;
    }, "unauthorized D.3.5-D structural change BIB-011");

    expectBlockedAfterMutation((catalog) => {
      catalog.find((entry) => entry.id === "BIB-004")!.reviews[0].contentFingerprint = "0".repeat(64);
    }, "unauthorized D.3.5-D structural change BIB-004");

    expectBlockedAfterMutation((catalog) => {
      catalog.find((entry) => entry.id === "BIB-011")!.publicationAuthorization!.scope = "private" as never;
    }, "unauthorized D.3.5-D structural change BIB-011");
  });

  it("rejects content and workflow changes outside the authorized transition", () => {
    expectBlockedAfterMutation((catalog) => {
      catalog.find((entry) => entry.id === "BIB-004")!.summary = "alterado";
    }, "unauthorized D.3.5-D structural change BIB-004");

    expectBlockedAfterMutation((catalog) => {
      catalog.find((entry) => entry.id === "BIB-011")!.reviews.reverse();
    }, "unauthorized D.3.5-D structural change BIB-011");

    expectBlockedAfterMutation((catalog) => {
      catalog.find((entry) => entry.id === "BIB-010")!.validationStatus = "documentary-validated";
    }, "BIB-010 changed outside the authorized scope");
  });
});
