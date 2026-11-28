import { isDeepStrictEqual } from "node:util";

import type { CulturalCatalogEntry, CulturalLibraryEntry, CulturalReviewPolicy } from "../data/cultural-catalog-model";
import {
  getCulturalContentFingerprint,
  projectPublicCulturalEntries,
} from "../data/cultural-publication";
import { culturalPreD334BIntegrityExpectations } from "./cultural-d334b-baseline";
import { materializeD334BAfterEntry } from "./cultural-d334b-transition";

export { materializeD334BAfterEntry };

export const culturalD335CEntryIds = ["BIB-004", "BIB-011"] as const;
export type D335CEntryId = (typeof culturalD335CEntryIds)[number];

export const expectedD335CBeforeVersions = {
  "BIB-004": "candidate-6",
  "BIB-011": "candidate-5",
} as const;

export const expectedD335CAfterVersions = {
  "BIB-004": "candidate-7",
  "BIB-011": "candidate-6",
} as const;

export const expectedD335CBeforeFingerprints = {
  "BIB-004": "9e0f708972ba6074453c31b01dfac14c26aafd4ff1cfb3e9d02bf2079332e1de",
  "BIB-011": "07fbd3ef34b7410f7a83efacf539515249b5abf994aa1bf433d48c82e2fe4cc7",
} as const;

export const expectedD335CAfterFingerprints = {
  "BIB-004": "7691c13bffb1a0bd6aed49556cf8a5521a50581ca72d84fb377d6a4dccaec805",
  "BIB-011": "fa76434ad3aae44de26500d20f5c78a447d6963c62373c199efbca776cfa3e79",
} as const;

const documentarySurfaces = [
  "identity",
  "title",
  "summary",
  "claims",
  "references",
  "libraryMetadata",
  "relatedEntries",
  "editorialBody",
] as const;

export function expectedD335CReviewPolicy(entryId: D335CEntryId): CulturalReviewPolicy {
  if (entryId === "BIB-004") {
    return {
      path: "documentary",
      documentaryEligibility: {
        contentClass: "bibliographic-descriptive",
        rationale:
          "Ficha estritamente bibliográfica: apresenta autoria, crédito de tradução, edição, editora, idiomas, modalidades de acesso e descrição sumária da obra apoiados em documentação institucional, ficha técnica, apresentação e sumário. Não ensina Libras, não realiza análise literária independente, não avalia pedagogicamente a obra e não valida linguisticamente o conteúdo.",
        claimIds: [
          "claim-1",
          "BIB-004-C01",
          "BIB-004-C02",
          "BIB-004-C03",
          "BIB-004-C04",
          "BIB-004-C05",
        ],
        coveredSurfaces: [...documentarySurfaces],
      },
    };
  }

  return {
    path: "documentary",
    documentaryEligibility: {
      contentClass: "bibliographic-descriptive",
      rationale:
        "Ficha estritamente documental sobre série audiovisual institucional: descreve natureza, responsabilidade institucional, finalidade declarada e modalidade de acesso conforme fontes oficiais. Não avalia eficácia, não analisa linguisticamente os episódios e não afirma verificação integral ou disponibilidade permanente.",
      claimIds: [
        "claim-1",
        "BIB-011-C01",
        "BIB-011-C02",
        "BIB-011-C03",
        "BIB-011-C04",
      ],
      coveredSurfaces: [...documentarySurfaces],
    },
  };
}

function isD335CEntryId(id: string): id is D335CEntryId {
  return (culturalD335CEntryIds as readonly string[]).includes(id);
}

/** Reconstructs the exact post-D.3.4-B/pre-D.3.5-C state for layered historical validation. */
export function restoreCulturalD335CBeforeState(
  catalog: readonly CulturalCatalogEntry[],
): CulturalCatalogEntry[] {
  return catalog.map((entry) => {
    if (!isD335CEntryId(entry.id)) return entry;
    const copy = structuredClone(entry) as CulturalLibraryEntry;
    delete copy.reviewPolicy;
    copy.version = expectedD335CBeforeVersions[entry.id];
    return copy;
  });
}

export function materializeD335CAfterEntry(entryId: D335CEntryId): CulturalLibraryEntry {
  const entry = materializeD334BAfterEntry(entryId);
  entry.version = expectedD335CAfterVersions[entryId];
  entry.reviewPolicy = expectedD335CReviewPolicy(entryId);
  return entry;
}

export function validateD335CTransition(catalog: readonly CulturalCatalogEntry[]): string[] {
  const problems: string[] = [];
  if (catalog.length !== 41) problems.push(`expected 41 records, got ${catalog.length}`);

  const entriesWithPolicy = catalog.filter((entry) => entry.reviewPolicy !== undefined);
  if (entriesWithPolicy.length !== 2) {
    problems.push(`expected exactly 2 review policies, got ${entriesWithPolicy.length}`);
  }
  for (const entry of entriesWithPolicy) {
    if (!isD335CEntryId(entry.id)) problems.push(`unexpected review policy ${entry.id}`);
  }

  for (const entryId of culturalD335CEntryIds) {
    const actual = catalog.find((entry) => entry.id === entryId) as CulturalLibraryEntry | undefined;
    if (!actual) {
      problems.push(`missing D.3.5-C entry ${entryId}`);
      continue;
    }
    const expectedBefore = materializeD334BAfterEntry(entryId);
    const expectedAfter = materializeD335CAfterEntry(entryId);

    if (expectedBefore.version !== expectedD335CBeforeVersions[entryId]) {
      problems.push(`frozen pre-D.3.5-C version mismatch ${entryId}`);
    }
    if (getCulturalContentFingerprint(expectedBefore) !== expectedD335CBeforeFingerprints[entryId]) {
      problems.push(`frozen pre-D.3.5-C fingerprint mismatch ${entryId}`);
    }
    if (actual.version !== expectedD335CAfterVersions[entryId]) {
      problems.push(`wrong post-D.3.5-C version ${entryId}`);
    }
    if (getCulturalContentFingerprint(actual) !== expectedD335CAfterFingerprints[entryId]) {
      problems.push(`post-D.3.5-C fingerprint mismatch ${entryId}`);
    }
    if (getCulturalContentFingerprint(actual) === getCulturalContentFingerprint(expectedBefore)) {
      problems.push(`fingerprint did not change materially ${entryId}`);
    }
    if (!isDeepStrictEqual(actual, expectedAfter)) {
      problems.push(`unauthorized D.3.5-C structural change ${entryId}`);
    }
    if (actual.validationStatus !== "draft") problems.push(`validation status changed ${entryId}`);
    if (actual.reviews.length !== 0) problems.push(`unexpected review ${entryId}`);
    if (actual.publicationAuthorization !== undefined) {
      problems.push(`unexpected publication authorization ${entryId}`);
    }
  }

  const bib010 = catalog.find((entry) => entry.id === "BIB-010");
  if (!bib010) {
    problems.push("missing BIB-010");
  } else if (!isDeepStrictEqual(bib010, materializeD334BAfterEntry("BIB-010"))) {
    problems.push("BIB-010 changed outside the authorized scope");
  }

  for (const [id, expectedIntegrity] of Object.entries(culturalPreD334BIntegrityExpectations)) {
    if (isD335CEntryId(id) || id === "BIB-010") continue;
    const actual = catalog.find((entry) => entry.id === id);
    if (!actual) {
      problems.push(`missing out-of-scope entry ${id}`);
      continue;
    }
    if (actual.version !== expectedIntegrity.version) problems.push(`out-of-scope version changed ${id}`);
    if (getCulturalContentFingerprint(actual) !== expectedIntegrity.fingerprint) {
      problems.push(`out-of-scope fingerprint changed ${id}`);
    }
    if (actual.validationStatus !== expectedIntegrity.validationStatus) {
      problems.push(`out-of-scope validation status changed ${id}`);
    }
    if (actual.reviews.length !== expectedIntegrity.reviews) problems.push(`out-of-scope reviews changed ${id}`);
    if ((actual.publicationAuthorization !== undefined) !== expectedIntegrity.publicationAuthorization) {
      problems.push(`out-of-scope authorization changed ${id}`);
    }
    if (!isDeepStrictEqual(actual.internalPending, expectedIntegrity.internalPending)) {
      problems.push(`out-of-scope internal pending changed ${id}`);
    }
  }

  if (projectPublicCulturalEntries(catalog).length !== 0) {
    problems.push("public cultural projection is not empty");
  }
  return problems;
}
