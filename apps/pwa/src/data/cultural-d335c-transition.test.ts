import { describe, expect, it } from "vitest";

import { culturalCatalog } from "./cultural-catalog";
import {
  getCulturalContentFingerprint,
  getCulturalPublicationBlockers,
  isCulturalPublishable,
  projectPublicCulturalEntries,
} from "./cultural-publication";
import { restoreCulturalD335DBeforeState } from "@/test/cultural-d335d-transition";
import {
  culturalD335CEntryIds,
  expectedD335CAfterFingerprints,
  expectedD335CAfterVersions,
  expectedD335CBeforeFingerprints,
  expectedD335CReviewPolicy,
  materializeD334BAfterEntry,
  materializeD335CAfterEntry,
  restoreCulturalD335CBeforeState,
  validateD335CTransition,
} from "@/test/cultural-d335c-transition";

describe("D.3.5-C first documentary library classification", () => {
  it("validates the exact authorized transition end-to-end", () => {
    expect(validateD335CTransition(restoreCulturalD335DBeforeState(culturalCatalog))).toEqual([]);

    const entriesWithPolicy = restoreCulturalD335DBeforeState(culturalCatalog).filter((entry) => entry.reviewPolicy !== undefined);
    expect(entriesWithPolicy.map((entry) => entry.id).sort()).toEqual(["BIB-004", "BIB-011"]);

    for (const entryId of culturalD335CEntryIds) {
      const entry = restoreCulturalD335DBeforeState(culturalCatalog).find((item) => item.id === entryId)!;
      expect(entry.version).toBe(expectedD335CAfterVersions[entryId]);
      expect(getCulturalContentFingerprint(entry)).toBe(expectedD335CAfterFingerprints[entryId]);
      expect(entry.reviewPolicy).toEqual(expectedD335CReviewPolicy(entryId));
      expect(entry.validationStatus).toBe("draft");
      expect(entry.reviews).toEqual([]);
      expect(entry.publicationAuthorization).toBeUndefined();
      expect(isCulturalPublishable(entry, restoreCulturalD335DBeforeState(culturalCatalog))).toBe(false);
    }
  });

  it("preserves editorial content exactly apart from policy addition and version increments", () => {
    const restored = restoreCulturalD335CBeforeState(restoreCulturalD335DBeforeState(culturalCatalog));
    for (const entryId of culturalD335CEntryIds) {
      const before = restored.find((entry) => entry.id === entryId)!;
      const expectedBefore = materializeD334BAfterEntry(entryId);
      expect(before).toEqual(expectedBefore);
      expect(getCulturalContentFingerprint(before)).toBe(expectedD335CBeforeFingerprints[entryId]);

      const after = restoreCulturalD335DBeforeState(culturalCatalog).find((entry) => entry.id === entryId)!;
      expect(after).toEqual(materializeD335CAfterEntry(entryId));
      expect(after.title).toBe(before.title);
      expect(after.slug).toBe(before.slug);
      expect(after.summary).toBe(before.summary);
      expect(after.editorialBody).toEqual(before.editorialBody);
      expect(after.claims).toEqual(before.claims);
      expect(after.references).toEqual(before.references);
      expect("library" in after && after.library).toEqual("library" in before && before.library);
      expect(after.relatedEntries).toEqual(before.relatedEntries);
      expect(after.rights).toEqual(before.rights);
      expect(after.internalPending).toEqual(before.internalPending);
    }
  });

  it("preserves BIB-010 integrally in the legacy expert path", () => {
    const bib010 = culturalCatalog.find((entry) => entry.id === "BIB-010")!;
    expect(bib010).toEqual(materializeD334BAfterEntry("BIB-010"));
    expect(bib010.reviewPolicy).toBeUndefined();
    expect(getCulturalContentFingerprint(bib010)).toBe(
      "e008a09c63c23ff15fb198042e3048bce2eafda506833eac2f9daed62e69cfce",
    );
    expect(getCulturalPublicationBlockers(bib010, culturalCatalog)).toEqual([
      "entry has not completed expert validation",
      "missing final publication authorization",
    ]);
  });

  it("leaves the classified records blocked only by human documentary validation and final authorization in the historical layer", () => {
    const historical = restoreCulturalD335DBeforeState(culturalCatalog);
    for (const entryId of culturalD335CEntryIds) {
      const entry = historical.find((item) => item.id === entryId)!;
      expect(getCulturalPublicationBlockers(entry, historical)).toEqual([
        "entry has not completed documentary validation",
        "missing final publication authorization",
      ]);
    }
    expect(projectPublicCulturalEntries(historical)).toEqual([]);
  });

  it("rejects unauthorized policy, coverage, content and workflow changes", () => {
    const alteredPolicy = structuredClone(culturalCatalog);
    alteredPolicy.find((entry) => entry.id === "BIB-004")!.reviewPolicy = { path: "expert-required" };
    expect(validateD335CTransition(restoreCulturalD335DBeforeState(alteredPolicy)).join("\n")).toContain(
      "unauthorized D.3.5-C structural change BIB-004",
    );

    const alteredCoverage = structuredClone(culturalCatalog);
    const bib011 = alteredCoverage.find((entry) => entry.id === "BIB-011")!;
    if (bib011.reviewPolicy?.path !== "documentary") throw new Error("unexpected fixture");
    bib011.reviewPolicy.documentaryEligibility.claimIds = ["claim-1"];
    expect(validateD335CTransition(restoreCulturalD335DBeforeState(alteredCoverage)).join("\n")).toContain(
      "unauthorized D.3.5-C structural change BIB-011",
    );

    const alteredContent = structuredClone(culturalCatalog);
    alteredContent.find((entry) => entry.id === "BIB-004")!.summary = "resumo alterado";
    expect(validateD335CTransition(restoreCulturalD335DBeforeState(alteredContent)).join("\n")).toContain(
      "unauthorized D.3.5-C structural change BIB-004",
    );

    const alteredWorkflow = structuredClone(culturalCatalog);
    alteredWorkflow.find((entry) => entry.id === "BIB-011")!.validationStatus = "documentary-validated";
    expect(validateD335CTransition(alteredWorkflow).join("\n")).toContain(
      "unauthorized D.3.5-C structural change BIB-011",
    );

    const extraPolicy = structuredClone(culturalCatalog);
    extraPolicy.find((entry) => entry.id === "BIB-010")!.reviewPolicy = { path: "expert-required" };
    expect(validateD335CTransition(restoreCulturalD335DBeforeState(extraPolicy)).join("\n")).toContain("unexpected review policy BIB-010");
  });
});
