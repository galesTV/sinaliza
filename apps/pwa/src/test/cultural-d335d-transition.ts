import { isDeepStrictEqual } from "node:util";

import type { CulturalCatalogEntry, CulturalLibraryEntry } from "../data/cultural-catalog-model";
import {
  getCulturalContentFingerprint,
  projectPublicCulturalEntries,
} from "../data/cultural-publication";
import {
  culturalD335CEntryIds,
  expectedD335CAfterFingerprints,
  expectedD335CAfterVersions,
  materializeD335CAfterEntry,
  validateD335CTransition,
  type D335CEntryId,
} from "./cultural-d335c-transition";

const decisionDate = "2026-11-28";
const responsible = "Gael Leite Guzman";

function isD335DEntryId(id: string): id is D335CEntryId {
  return (culturalD335CEntryIds as readonly string[]).includes(id);
}

/** Reconstructs the exact post-D.3.5-C/pre-D.3.5-D.5 state for layered historical validation. */
export function restoreCulturalD335DBeforeState(
  catalog: readonly CulturalCatalogEntry[],
): CulturalCatalogEntry[] {
  return catalog.map((entry) => {
    if (!isD335DEntryId(entry.id)) return entry;
    const copy = structuredClone(entry) as CulturalLibraryEntry;
    copy.validationStatus = "draft";
    copy.reviews = [];
    delete copy.publicationAuthorization;
    return copy;
  });
}

export function materializeD335DAfterEntry(entryId: D335CEntryId): CulturalLibraryEntry {
  const entry = materializeD335CAfterEntry(entryId);
  const fingerprint = getCulturalContentFingerprint(entry);
  entry.validationStatus = "documentary-validated";
  entry.reviews = [
    {
      reviewer: responsible,
      type: "research",
      date: decisionDate,
      version: expectedD335CAfterVersions[entryId],
      contentFingerprint: fingerprint,
      notes: "Aprovação humana de pesquisa registrada a partir de decisão explícita do responsável editorial; concentração de funções autorizada e ausência de independência documentada; não é validação especializada.",
    },
    {
      reviewer: responsible,
      type: "technical",
      date: decisionDate,
      version: expectedD335CAfterVersions[entryId],
      contentFingerprint: fingerprint,
      notes: "Aprovação humana de revisão técnica registrada a partir de decisão explícita do responsável editorial; concentração de funções autorizada e ausência de independência documentada; não é validação especializada.",
    },
  ];
  entry.publicationAuthorization = {
    authorizer: responsible,
    date: decisionDate,
    version: expectedD335CAfterVersions[entryId],
    contentFingerprint: fingerprint,
    scope: "public-web",
    notes: "Autorização editorial final registrada a partir de decisão explícita do responsável editorial; não representa aprovação especializada nem licença de reprodução de materiais de terceiros.",
  };
  return entry;
}

export function validateD335DTransition(catalog: readonly CulturalCatalogEntry[]): string[] {
  const problems = validateD335CTransition(restoreCulturalD335DBeforeState(catalog));

  const validated = catalog.filter((entry) => entry.validationStatus === "documentary-validated");
  if (validated.length !== 2) problems.push(`expected exactly 2 documentary-validated records, got ${validated.length}`);
  for (const entry of validated) {
    if (!isD335DEntryId(entry.id)) problems.push(`unexpected documentary-validated record ${entry.id}`);
  }

  const allReviews = catalog.flatMap((entry) => entry.reviews);
  if (allReviews.length !== 4) problems.push(`expected exactly 4 reviews, got ${allReviews.length}`);
  if (allReviews.filter((review) => review.type === "research").length !== 2) problems.push("expected exactly 2 research reviews");
  if (allReviews.filter((review) => review.type === "technical").length !== 2) problems.push("expected exactly 2 technical reviews");
  if (allReviews.some((review) => review.type === "expert")) problems.push("unexpected expert review");
  if (catalog.some((entry) => entry.validationStatus === "expert-validated")) problems.push("unexpected expert-validated record");
  const authorizations = catalog.filter((entry) => entry.publicationAuthorization !== undefined);
  if (authorizations.length !== 2) problems.push(`expected exactly 2 authorizations, got ${authorizations.length}`);

  for (const entryId of culturalD335CEntryIds) {
    const actual = catalog.find((entry) => entry.id === entryId) as CulturalLibraryEntry | undefined;
    if (!actual) {
      problems.push(`missing D.3.5-D entry ${entryId}`);
      continue;
    }
    const expected = materializeD335DAfterEntry(entryId);
    if (!isDeepStrictEqual(actual, expected)) problems.push(`unauthorized D.3.5-D structural change ${entryId}`);
    if (getCulturalContentFingerprint(actual) !== expectedD335CAfterFingerprints[entryId]) {
      problems.push(`fingerprint changed ${entryId}`);
    }
    if (actual.reviews.length !== 2) problems.push(`wrong review count ${entryId}`);
    if (new Set(actual.reviews.map((review) => review.type)).size !== actual.reviews.length) {
      problems.push(`duplicate review type ${entryId}`);
    }
    if (actual.reviews[0]?.type !== "research" || actual.reviews[1]?.type !== "technical") {
      problems.push(`review chain is out of order ${entryId}`);
    }
    for (const review of actual.reviews) {
      if (review.version !== actual.version || review.contentFingerprint !== getCulturalContentFingerprint(actual)) {
        problems.push(`review version or fingerprint mismatch ${entryId}`);
      }
    }
    const authorization = actual.publicationAuthorization;
    if (!authorization) {
      problems.push(`missing authorization ${entryId}`);
    } else {
      if (authorization.scope !== "public-web") problems.push(`wrong authorization scope ${entryId}`);
      if (authorization.version !== actual.version || authorization.contentFingerprint !== getCulturalContentFingerprint(actual)) {
        problems.push(`authorization version or fingerprint mismatch ${entryId}`);
      }
      if (authorization.date < actual.reviews.map((review) => review.date).sort().at(-1)!) {
        problems.push(`authorization predates reviews ${entryId}`);
      }
    }
  }

  const publicIds = projectPublicCulturalEntries(catalog).map((entry) => entry.id).sort();
  if (!isDeepStrictEqual(publicIds, ["BIB-004", "BIB-011"])) {
    problems.push(`unexpected public projection ${publicIds.join(",")}`);
  }
  return [...new Set(problems)];
}
