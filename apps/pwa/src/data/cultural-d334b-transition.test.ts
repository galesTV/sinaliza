import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { culturalCatalog } from "./cultural-catalog";
import { getCulturalContentFingerprint, getCulturalPublicationBlockers } from "./cultural-publication";
import {
  expectedD334BAfterFingerprints,
  expectedD334BAfterVersions,
  expectedD334BIntermediateFingerprints,
  expectedD334BIntermediateVersions,
  materializeD334BBeforeEntry,
  restoreCulturalD334BBeforeState,
  validateD334BTransition,
} from "@/test/cultural-d334b-transition";
import { restoreCulturalD335CBeforeState } from "@/test/cultural-d335c-transition";
import { restoreCulturalD335DBeforeState } from "@/test/cultural-d335d-transition";
import { validateR53CTransition, parseR53CTraceText } from "@/test/cultural-r53c-transition";
import { validateV33Transition } from "@/test/cultural-v33-transition";

const scopedIds = ["BIB-011", "BIB-010", "BIB-004"] as const;

function historicalD334BCatalog() {
  return restoreCulturalD335CBeforeState(restoreCulturalD335DBeforeState(culturalCatalog));
}

function validateHistorical(catalog: typeof culturalCatalog) {
  return validateD334BTransition(restoreCulturalD335CBeforeState(restoreCulturalD335DBeforeState(catalog)));
}

describe("D.3.4-B first cultural library release preparation", () => {
  it("validates the exact authorized transition end-to-end in the reconstructed historical layer", () => {
    const historical = historicalD334BCatalog();
    expect(validateD334BTransition(historical)).toEqual([]);
    for (const entryId of scopedIds) {
      const entry = historical.find((item) => item.id === entryId)!;
      expect(entry.version).toBe(expectedD334BAfterVersions[entryId]);
      expect(entry.validationStatus).toBe("draft");
      expect(entry.reviews).toEqual([]);
      expect(entry.publicationAuthorization).toBeUndefined();
      expect(entry.internalPending).toEqual([]);
    }
  });

  it("preserves BIB-011 and BIB-010 fingerprints and represents the BIB-004 refinement chain", () => {
    const historical = historicalD334BCatalog();
    for (const entryId of ["BIB-011", "BIB-010"] as const) {
      const entry = historical.find((item) => item.id === entryId)!;
      expect(entry.version).toBe(expectedD334BIntermediateVersions[entryId]);
      expect(entry.version).toBe(expectedD334BAfterVersions[entryId]);
      expect(getCulturalContentFingerprint(entry)).toBe(expectedD334BIntermediateFingerprints[entryId]);
      expect(getCulturalContentFingerprint(entry)).toBe(expectedD334BAfterFingerprints[entryId]);
    }

    const bib004 = historical.find((item) => item.id === "BIB-004")!;
    expect(bib004.version).toBe("candidate-6");
    expect(expectedD334BIntermediateVersions["BIB-004"]).toBe("candidate-5");
    expect(getCulturalContentFingerprint(bib004)).toBe(expectedD334BAfterFingerprints["BIB-004"]);
    expect(getCulturalContentFingerprint(bib004)).not.toBe(expectedD334BIntermediateFingerprints["BIB-004"]);
  });

  it("leaves the three records blocked only by human validation and final authorization in the historical layer", () => {
    const historical = historicalD334BCatalog();
    for (const entryId of scopedIds) {
      const entry = historical.find((item) => item.id === entryId)!;
      expect(getCulturalPublicationBlockers(entry, historical)).toEqual([
        "entry has not completed expert validation",
        "missing final publication authorization",
      ]);
      expect(expectedD334BAfterFingerprints[entryId]).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it("reconstructs the frozen pre-D.3.4-B state for historical transition validation", () => {
    const restored = restoreCulturalD334BBeforeState(historicalD334BCatalog());
    for (const entryId of scopedIds) {
      expect(restored.find((entry) => entry.id === entryId)).toEqual(materializeD334BBeforeEntry(entryId));
    }
    expect(validateV33Transition(culturalCatalog)).toEqual([]);
    const tracePath = join(process.cwd(), "docs/curadoria-cultural/v2.1/rastreabilidade-r53c.md");
    const parsed = parseR53CTraceText(readFileSync(tracePath, "utf8"));
    expect(parsed.problems).toEqual([]);
    expect(validateR53CTransition(culturalCatalog, parsed.rows)).toEqual([]);
  });

  it("rejects unauthorized content, workflow, rights and artwork changes", () => {
    const alteredBody = structuredClone(culturalCatalog);
    alteredBody.find((entry) => entry.id === "BIB-011")!.editorialBody!.paragraphs[0] += " alterado";
    expect(validateHistorical(alteredBody).join("\n")).toContain("unauthorized D.3.4-B structural change BIB-011");

    const alteredClaims = structuredClone(culturalCatalog);
    alteredClaims.find((entry) => entry.id === "BIB-010")!.claims[0].text = "afirmação alterada";
    expect(validateHistorical(alteredClaims).join("\n")).toContain("unauthorized D.3.4-B structural change BIB-010");

    const alteredRights = structuredClone(culturalCatalog);
    alteredRights.find((entry) => entry.id === "BIB-004")!.rights.assets.push({
      id: "asset-1",
      kind: "cover",
      scope: "public",
    });
    expect(validateHistorical(alteredRights).join("\n")).toContain("unauthorized D.3.4-B structural change BIB-004");

    const alteredWorkflow = structuredClone(culturalCatalog);
    alteredWorkflow.find((entry) => entry.id === "BIB-010")!.validationStatus = "expert-validated";
    expect(validateHistorical(alteredWorkflow).join("\n")).toContain("unauthorized D.3.4-B structural change BIB-010");

    const alteredArtwork = structuredClone(culturalCatalog);
    alteredArtwork.find((entry) => entry.id === "BIB-010")!.artwork = { motif: "literary" };
    expect(validateHistorical(alteredArtwork).join("\n")).toContain("unauthorized D.3.4-B structural change BIB-010");

    const alteredOutOfScope = structuredClone(culturalCatalog);
    alteredOutOfScope.find((entry) => entry.id === "BIB-002")!.claims[0].text = "fora de escopo";
    expect(validateHistorical(alteredOutOfScope).join("\n")).toContain("out-of-scope fingerprint changed BIB-002");

    const alteredOutOfScopePending = structuredClone(culturalCatalog);
    alteredOutOfScopePending.find((entry) => entry.id === "BIB-005")!.internalPending = [];
    expect(validateHistorical(alteredOutOfScopePending).join("\n")).toContain("out-of-scope internal pending changed BIB-005");
  });
});
