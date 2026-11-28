import { isDeepStrictEqual } from "node:util";

import type { CulturalCatalogEntry, CulturalLibraryEntry } from "../data/cultural-catalog-model";
import {
  getCulturalContentFingerprint,
  projectPublicCulturalEntries,
} from "../data/cultural-publication";
import {
  culturalD334BEntryIds,
  culturalPreD334BBaseline,
  culturalPreD334BIntegrityExpectations,
} from "./cultural-d334b-baseline";

export const expectedD334BBeforeVersions = {
  "BIB-011": "candidate-4",
  "BIB-010": "candidate-4",
  "BIB-004": "candidate-4",
} as const;

export const expectedD334BIntermediateVersions = {
  "BIB-011": "candidate-5",
  "BIB-010": "candidate-5",
  "BIB-004": "candidate-5",
} as const;

export const expectedD334BAfterVersions = {
  "BIB-011": "candidate-5",
  "BIB-010": "candidate-5",
  "BIB-004": "candidate-6",
} as const;

export const expectedD334BBeforeFingerprints = {
  "BIB-011": "0dc124ea99d68531ff7a82a3cf88c176b1f865efcfbaaf5074a8ee5ff500fce0",
  "BIB-010": "ad7a8470656e1bb992dedf1ef021823c8e9b301bd5c138c1bb780d0e9e9ac151",
  "BIB-004": "3c88d98ae40ae4813bbb7a6b13e2cf5e5a782e231b43fe63269c15729ead7744",
} as const;

export const expectedD334BIntermediateFingerprints = {
  "BIB-011": "07fbd3ef34b7410f7a83efacf539515249b5abf994aa1bf433d48c82e2fe4cc7",
  "BIB-010": "e008a09c63c23ff15fb198042e3048bce2eafda506833eac2f9daed62e69cfce",
  "BIB-004": "f45c33a6066374c4534ffddfd8ffdcbf956772aab846164dedc26e2dc915c8a3",
} as const;

export const expectedD334BAfterFingerprints = {
  "BIB-011": "07fbd3ef34b7410f7a83efacf539515249b5abf994aa1bf433d48c82e2fe4cc7",
  "BIB-010": "e008a09c63c23ff15fb198042e3048bce2eafda506833eac2f9daed62e69cfce",
  "BIB-004": "9e0f708972ba6074453c31b01dfac14c26aafd4ff1cfb3e9d02bf2079332e1de",
} as const;

type D334BEntryId = (typeof culturalD334BEntryIds)[number];

function isD334BEntryId(id: string): id is D334BEntryId {
  return (culturalD334BEntryIds as readonly string[]).includes(id);
}

export function materializeD334BBeforeEntry(entryId: D334BEntryId): CulturalLibraryEntry {
  return structuredClone(culturalPreD334BBaseline[entryId]) as unknown as CulturalLibraryEntry;
}

export function restoreCulturalD334BBeforeState(
  catalog: readonly CulturalCatalogEntry[],
): CulturalCatalogEntry[] {
  return catalog.map((entry) =>
    isD334BEntryId(entry.id) ? materializeD334BBeforeEntry(entry.id) : entry,
  );
}

function completeReference(
  entry: CulturalLibraryEntry,
  referenceId: string,
  institution: string,
  purpose: string,
  consultedAt: string,
) {
  const reference = entry.references.find((item) => item.id === referenceId);
  if (!reference) throw new Error(`missing ${entry.id} ${referenceId}`);
  reference.institution = institution;
  reference.purpose = purpose;
  reference.consultedAt = consultedAt;
}

function applyD334BAuthorizedPreparation(entryId: D334BEntryId): CulturalLibraryEntry {
  const entry = materializeD334BBeforeEntry(entryId);
  entry.version = expectedD334BAfterVersions[entryId];
  entry.internalPending = [];

  if (entryId === "BIB-011") {
    completeReference(
      entry,
      "source-1",
      "INES — DEBASI / TV INES",
      "Descrição institucional da série e lista de episódios vinculados ao YouTube",
      "2026-11-28",
    );
    completeReference(
      entry,
      "source-2",
      "INES — TV INES / DEBASI",
      "Apresentação institucional da TV INES e categoria Infantil",
      "2026-11-28",
    );
    entry.library = {
      ...entry.library,
      creators: ["TV INES"],
      format: "audiovisual-series",
      access: "external-website",
      languages: ["Libras"],
      unknownMetadata: ["publicationYear", "publisher"],
    };
  } else if (entryId === "BIB-010") {
    completeReference(
      entry,
      "source-1",
      "INES — Série Histórica",
      "Apresentação institucional do fac-símile e acesso à edição completa em PDF",
      "2026-11-28",
    );
    entry.library = {
      ...entry.library,
      creators: ["Flausino José da Gama"],
      publicationYear: 1875,
      format: "historical-facsimile",
      access: "institutional-digital",
      languages: ["Português"],
      unknownMetadata: ["publisher"],
    };
  } else {
    completeReference(
      entry,
      "source-1",
      "UFSC — Repositório Institucional",
      "Registro institucional da obra; metadados verificados na curadoria V2/V2.1, com reverificação em 2026-11-28 limitada pela validação de segurança da RedeUFSC",
      "2026-11-28",
    );
    completeReference(
      entry,
      "source-2",
      "LIBRANDO — UFSC",
      "Curadoria bibliográfica com ligações para PDF, leitura online e playlist de vídeos em Libras",
      "2026-11-28",
    );
    completeReference(
      entry,
      "source-3",
      "UFSC — Repositório Institucional",
      "Ficha catalográfica, ficha técnica e apresentação da edição digital",
      "2026-11-28",
    );
    entry.library = {
      ...entry.library,
      creators: ["Rachel Sutton-Spence"],
      publicationYear: 2021,
      publisher: "Editora Arara Azul",
      format: "book",
      access: "open-digital",
      languages: ["Português", "Libras"],
      unknownMetadata: [],
    };
  }

  if (entryId === "BIB-004") {
    entry.summary = "Obra sobre literatura sinalizada, com versões em português e Libras.";
    entry.claims.find((claim) => claim.id === "claim-1")!.text = entry.summary;
    entry.claims.find((claim) => claim.id === "claim-1")!.referenceIds = ["source-2", "source-3"];
    entry.claims.find((claim) => claim.id === "BIB-004-C01")!.text =
      "Autoria de Rachel Sutton-Spence, tradução do conteúdo em Libras por Gustavo Gusmão e primeira edição de 2021.";
    entry.claims.find((claim) => claim.id === "BIB-004-C01")!.referenceIds = ["source-3"];
    entry.claims.find((claim) => claim.id === "BIB-004-C03")!.text =
      "Literatura em Libras é uma obra de Rachel Sutton-Spence, com tradução do conteúdo em Libras por Gustavo Gusmão.";
    entry.editorialBody!.paragraphs[0] =
      "Literatura em Libras, de Rachel Sutton-Spence, com tradução do conteúdo para Libras por Gustavo Gusmão, apresenta estudos sobre literatura sinalizada. A primeira edição é de 2021, pela Arara Azul. O LIBRANDO indica modalidades textuais e audiovisuais.";
  }

  return entry;
}

export function validateD334BTransition(catalog: CulturalCatalogEntry[]) {
  const problems: string[] = [];
  if (catalog.length !== 41) problems.push(`expected 41 records, got ${catalog.length}`);

  for (const entryId of culturalD334BEntryIds) {
    const before = materializeD334BBeforeEntry(entryId);
    const expected = applyD334BAuthorizedPreparation(entryId);
    const actual = catalog.find((entry) => entry.id === entryId) as CulturalLibraryEntry | undefined;
    if (!actual) {
      problems.push(`missing D.3.4-B entry ${entryId}`);
      continue;
    }

    if (before.version !== expectedD334BBeforeVersions[entryId]) problems.push(`frozen before version mismatch ${entryId}`);
    if (getCulturalContentFingerprint(before) !== expectedD334BBeforeFingerprints[entryId]) {
      problems.push(`frozen before fingerprint mismatch ${entryId}`);
    }
    if (actual.version !== expectedD334BAfterVersions[entryId]) problems.push(`wrong post-D.3.4-B version ${entryId}`);
    const beforeNumber = Number(before.version.split("-")[1]);
    const afterNumber = Number(actual.version.split("-")[1]);
    const expectedIncrements = entryId === "BIB-004" ? 2 : 1;
    if (afterNumber !== beforeNumber + expectedIncrements) problems.push(`unexpected authorized version increment chain ${entryId}`);
    if (getCulturalContentFingerprint(actual) !== expectedD334BAfterFingerprints[entryId]) {
      problems.push(`post-D.3.4-B fingerprint mismatch ${entryId}`);
    }
    if (getCulturalContentFingerprint(actual) === getCulturalContentFingerprint(before)) {
      problems.push(`fingerprint did not change materially ${entryId}`);
    }
    if (!isDeepStrictEqual(actual, expected)) problems.push(`unauthorized D.3.4-B structural change ${entryId}`);
    if (entryId !== "BIB-004" && !isDeepStrictEqual(actual.claims, before.claims)) problems.push(`claims changed ${entryId}`);
    if (entryId !== "BIB-004" && !isDeepStrictEqual(actual.editorialBody, before.editorialBody)) {
      problems.push(`editorial body changed ${entryId}`);
    }
    if (!isDeepStrictEqual(actual.rights, { mode: "external-link-only", assets: [] })) {
      problems.push(`rights or third-party assets changed ${entryId}`);
    }
    if (actual.artwork !== undefined) problems.push(`unexpected artwork ${entryId}`);
    if (actual.validationStatus !== "draft") problems.push(`validation status changed ${entryId}`);
    if (actual.reviews.length !== 0) problems.push(`unexpected review ${entryId}`);
    if (actual.publicationAuthorization !== undefined) problems.push(`unexpected publication authorization ${entryId}`);
  }

  for (const [id, expectedIntegrity] of Object.entries(culturalPreD334BIntegrityExpectations)) {
    if (isD334BEntryId(id)) continue;
    const actual = catalog.find((entry) => entry.id === id);
    if (!actual) {
      problems.push(`missing out-of-scope entry ${id}`);
      continue;
    }
    if (actual.version !== expectedIntegrity.version) problems.push(`out-of-scope version changed ${id}`);
    if (getCulturalContentFingerprint(actual) !== expectedIntegrity.fingerprint) {
      problems.push(`out-of-scope fingerprint changed ${id}`);
    }
    if (actual.validationStatus !== expectedIntegrity.validationStatus) problems.push(`out-of-scope validation status changed ${id}`);
    if (actual.reviews.length !== expectedIntegrity.reviews) problems.push(`out-of-scope reviews changed ${id}`);
    if ((actual.publicationAuthorization !== undefined) !== expectedIntegrity.publicationAuthorization) {
      problems.push(`out-of-scope authorization changed ${id}`);
    }
    if (!isDeepStrictEqual(actual.internalPending, expectedIntegrity.internalPending)) {
      problems.push(`out-of-scope internal pending changed ${id}`);
    }
  }

  if (projectPublicCulturalEntries(catalog).length !== 0) problems.push("public cultural projection is not empty");
  return problems;
}
