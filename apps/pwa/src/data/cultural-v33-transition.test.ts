import { describe, expect, it } from "vitest";

import { culturalCatalog } from "./cultural-catalog";
import type { CulturalCatalogEntry } from "./cultural-catalog-model";
import {
  expectedV33AfterFingerprints,
  expectedV33AfterVersions,
  expectedV33Artworks,
  validateV33Transition,
  v33ArtworkEntryIds,
} from "@/test/cultural-v33-transition";

function entry(catalog: CulturalCatalogEntry[], id: string) {
  return catalog.find((item) => item.id === id)!;
}

function mutatedCatalog(mutate: (catalog: CulturalCatalogEntry[]) => void) {
  const catalog = structuredClone(culturalCatalog);
  mutate(catalog);
  return catalog;
}

function validationProblems(catalog: CulturalCatalogEntry[]) {
  return validateV33Transition(catalog).join("\n");
}

describe("V.3.3 controlled artwork association transition", () => {
  it("validates exactly the eight approved real associations end-to-end", () => {
    expect(validateV33Transition(culturalCatalog)).toEqual([]);
    expect(culturalCatalog.filter((item) => item.artwork !== undefined).map((item) => item.id).sort()).toEqual(
      [...v33ArtworkEntryIds].sort(),
    );
    for (const entryId of v33ArtworkEntryIds) {
      const item = entry(culturalCatalog, entryId);
      expect(item.version, entryId).toBe(expectedV33AfterVersions[entryId]);
      expect(item.artwork, entryId).toEqual(expectedV33Artworks[entryId]);
    }
  });

  it("rejects artwork in a ninth record and artwork missing from an authorized record", () => {
    const ninth = mutatedCatalog((catalog) => {
      entry(catalog, "HIST-002").artwork = { motif: "timeline" } as CulturalCatalogEntry["artwork"];
    });
    expect(validationProblems(ninth)).toContain("artwork record set differs");

    const missing = mutatedCatalog((catalog) => {
      delete entry(catalog, "HIST-001").artwork;
    });
    expect(validationProblems(missing)).toContain("artwork record set differs");
  });

  it("rejects wrong motifs, factual claims, factual values and chronology order", () => {
    const wrongMotif = mutatedCatalog((catalog) => {
      entry(catalog, "CUR-001").artwork = { motif: "parallel-structures" } as CulturalCatalogEntry["artwork"];
    });
    expect(validationProblems(wrongMotif)).toContain("artwork differs from approved metadata CUR-001");

    const wrongClaim = mutatedCatalog((catalog) => {
      const artwork = entry(catalog, "HIST-001").artwork;
      if (artwork?.motif === "timeline") artwork.events = [
        { year: 1855, label: "Proposta", claimId: "HIST-001-C02" },
        { year: 1856, label: "Início das aulas", claimId: "HIST-001-C02" },
        { year: 1857, label: "Lei nº 939", claimId: "HIST-001-C03" },
      ];
    });
    expect(validationProblems(wrongClaim)).toContain("artwork differs from approved metadata HIST-001");

    const wrongValue = mutatedCatalog((catalog) => {
      const artwork = entry(catalog, "HIST-006").artwork;
      if (artwork?.motif === "legal-document" && artwork.documentNumber) artwork.documentNumber.value = "10.437";
    });
    expect(validationProblems(wrongValue)).toContain("artwork differs from approved metadata HIST-006");

    const wrongOrder = mutatedCatalog((catalog) => {
      const artwork = entry(catalog, "HIST-001").artwork;
      if (artwork?.motif === "timeline" && artwork.events) {
        artwork.events = [artwork.events[1], artwork.events[0], artwork.events[2]];
      }
    });
    expect(validationProblems(wrongOrder)).toContain("artwork differs from approved metadata HIST-001");
  });

  it("rejects missing or double version increments", () => {
    const notIncremented = mutatedCatalog((catalog) => {
      entry(catalog, "HIST-001").version = "candidate-3";
    });
    expect(validationProblems(notIncremented)).toContain("wrong post-V3.3 version HIST-001");

    const doubleIncremented = mutatedCatalog((catalog) => {
      entry(catalog, "HIST-001").version = "candidate-5";
    });
    expect(validationProblems(doubleIncremented)).toContain("version was not incremented exactly once HIST-001");
  });

  it("rejects editorial body, claim, reference, rights and fingerprint tampering", () => {
    const alteredBody = mutatedCatalog((catalog) => {
      entry(catalog, "HIST-001").editorialBody!.paragraphs[0] += " alterado";
    });
    expect(validationProblems(alteredBody)).toContain("unauthorized structural change HIST-001");

    const alteredClaim = mutatedCatalog((catalog) => {
      entry(catalog, "HIST-001").claims.find((claim) => claim.id === "HIST-001-C01")!.text = "Afirmação adulterada.";
    });
    expect(validationProblems(alteredClaim)).toContain("unauthorized structural change HIST-001");

    const alteredReference = mutatedCatalog((catalog) => {
      entry(catalog, "HIST-001").references[0].url = "https://example.org/adulterado";
    });
    expect(validationProblems(alteredReference)).toContain("unauthorized structural change HIST-001");

    const alteredRights = mutatedCatalog((catalog) => {
      (entry(catalog, "HIST-001").rights as unknown as { mode: string }).mode = "invented";
    });
    expect(validationProblems(alteredRights)).toContain("unauthorized structural change HIST-001");

    const incompatibleFingerprint = mutatedCatalog((catalog) => {
      entry(catalog, "HIST-001").summary = "Resumo adulterado.";
    });
    expect(validationProblems(incompatibleFingerprint)).toContain("post-V3.3 fingerprint mismatch HIST-001");
  });

  it("rejects duplicate or missing records and changes outside the authorized scope", () => {
    const duplicated = mutatedCatalog((catalog) => {
      catalog.push(structuredClone(entry(catalog, "HIST-001")));
    });
    expect(validationProblems(duplicated)).toContain("duplicate cultural record id");

    const missing = mutatedCatalog((catalog) => {
      catalog.splice(catalog.findIndex((item) => item.id === "HIST-001"), 1);
    });
    expect(validationProblems(missing)).toContain("expected 41 records, got 40");

    const outsideScope = mutatedCatalog((catalog) => {
      entry(catalog, "HIST-002").internalPending.push("Alteração fora do escopo");
    });
    expect(validationProblems(outsideScope)).toContain("out-of-scope workflow change HIST-002");

    const unexpectedContentChange = mutatedCatalog((catalog) => {
      entry(catalog, "HIST-002").summary = "Resumo fora do escopo.";
    });
    expect(validationProblems(unexpectedContentChange)).toContain("out-of-scope fingerprint change HIST-002");
  });

  it("keeps post-transition fingerprints explicit and independent", () => {
    for (const entryId of v33ArtworkEntryIds) {
      expect(expectedV33AfterFingerprints[entryId]).toMatch(/^[0-9a-f]{64}$/);
    }
  });
});
