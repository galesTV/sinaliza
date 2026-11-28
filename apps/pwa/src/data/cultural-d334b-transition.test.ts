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
import { validateR53CTransition, parseR53CTraceText } from "@/test/cultural-r53c-transition";
import { validateV33Transition } from "@/test/cultural-v33-transition";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const scopedIds = ["BIB-011", "BIB-010", "BIB-004"] as const;

describe("D.3.4-B first cultural library release preparation", () => {
  it("validates the exact authorized transition end-to-end", () => {
    expect(validateD334BTransition(culturalCatalog)).toEqual([]);
    for (const entryId of scopedIds) {
      const entry = culturalCatalog.find((item) => item.id === entryId)!;
      expect(entry.version).toBe(expectedD334BAfterVersions[entryId]);
      expect(entry.validationStatus).toBe("draft");
      expect(entry.reviews).toEqual([]);
      expect(entry.publicationAuthorization).toBeUndefined();
      expect(entry.internalPending).toEqual([]);
    }
  });

  it("preserves BIB-011 and BIB-010 fingerprints and represents the BIB-004 refinement chain", () => {
    for (const entryId of ["BIB-011", "BIB-010"] as const) {
      const entry = culturalCatalog.find((item) => item.id === entryId)!;
      expect(entry.version).toBe(expectedD334BIntermediateVersions[entryId]);
      expect(entry.version).toBe(expectedD334BAfterVersions[entryId]);
      expect(getCulturalContentFingerprint(entry)).toBe(expectedD334BIntermediateFingerprints[entryId]);
      expect(getCulturalContentFingerprint(entry)).toBe(expectedD334BAfterFingerprints[entryId]);
    }

    const bib004 = culturalCatalog.find((item) => item.id === "BIB-004")!;
    expect(bib004.version).toBe("candidate-6");
    expect(expectedD334BIntermediateVersions["BIB-004"]).toBe("candidate-5");
    expect(getCulturalContentFingerprint(bib004)).toBe(expectedD334BAfterFingerprints["BIB-004"]);
    expect(getCulturalContentFingerprint(bib004)).not.toBe(expectedD334BIntermediateFingerprints["BIB-004"]);
  });

  it("leaves the three records blocked only by human validation and final authorization", () => {
    for (const entryId of scopedIds) {
      const entry = culturalCatalog.find((item) => item.id === entryId)!;
      expect(getCulturalPublicationBlockers(entry, culturalCatalog)).toEqual([
        "entry has not completed expert validation",
        "missing final publication authorization",
      ]);
      expect(expectedD334BAfterFingerprints[entryId]).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it("reconstructs the frozen pre-D.3.4-B state for historical transition validation", () => {
    const restored = restoreCulturalD334BBeforeState(culturalCatalog);
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
    expect(validateD334BTransition(alteredBody).join("\n")).toContain("unauthorized D.3.4-B structural change BIB-011");

    const alteredClaims = structuredClone(culturalCatalog);
    alteredClaims.find((entry) => entry.id === "BIB-010")!.claims[0].text = "afirmação alterada";
    expect(validateD334BTransition(alteredClaims).join("\n")).toContain("unauthorized D.3.4-B structural change BIB-010");

    const alteredRights = structuredClone(culturalCatalog);
    alteredRights.find((entry) => entry.id === "BIB-004")!.rights.assets.push({
      id: "asset-1",
      kind: "cover",
      scope: "public",
    });
    expect(validateD334BTransition(alteredRights).join("\n")).toContain("unauthorized D.3.4-B structural change BIB-004");

    const alteredWorkflow = structuredClone(culturalCatalog);
    alteredWorkflow.find((entry) => entry.id === "BIB-004")!.validationStatus = "expert-validated";
    expect(validateD334BTransition(alteredWorkflow).join("\n")).toContain("unauthorized D.3.4-B structural change BIB-004");

    const alteredArtwork = structuredClone(culturalCatalog);
    alteredArtwork.find((entry) => entry.id === "BIB-010")!.artwork = { motif: "literary" };
    expect(validateD334BTransition(alteredArtwork).join("\n")).toContain("unauthorized D.3.4-B structural change BIB-010");

    const alteredOutOfScope = structuredClone(culturalCatalog);
    alteredOutOfScope.find((entry) => entry.id === "BIB-002")!.claims[0].text = "fora de escopo";
    expect(validateD334BTransition(alteredOutOfScope).join("\n")).toContain("out-of-scope fingerprint changed BIB-002");

    const alteredOutOfScopePending = structuredClone(culturalCatalog);
    alteredOutOfScopePending.find((entry) => entry.id === "BIB-005")!.internalPending = [];
    expect(validateD334BTransition(alteredOutOfScopePending).join("\n")).toContain("out-of-scope internal pending changed BIB-005");
  });
});
