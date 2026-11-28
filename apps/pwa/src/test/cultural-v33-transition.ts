import { isDeepStrictEqual } from "node:util";

import type { CulturalCatalogEntry } from "../data/cultural-catalog-model";
import {
  getCulturalContentFingerprint,
  projectPublicCulturalEntries,
} from "../data/cultural-publication";
import {
  culturalPreV33Baseline,
  culturalV33ArtworkEntryIds,
} from "./cultural-v33-baseline";
import { restoreCulturalD334BBeforeState } from "./cultural-d334b-transition";

export const v33ArtworkEntryIds = culturalV33ArtworkEntryIds;

export const expectedV33AfterVersions = {
  "HIST-001": "candidate-4",
  "HIST-006": "candidate-4",
  "CUR-001": "candidate-4",
  "CUR-002": "candidate-5",
  "CUR-006": "candidate-5",
  "PER-001": "candidate-5",
  "BIB-003": "candidate-5",
  "BIB-005": "candidate-5",
} as const;

export const expectedV33AfterFingerprints = {
  "HIST-001": "5d9077c0408f6d8396730756a5d5966726be4f3019f991f3ba8a45be9f0d4b8e",
  "HIST-006": "eddfa0e813f82aad06abb3ccd16124e870dd56a49af98f868ec418b95cfe1022",
  "CUR-001": "9b36e420ffb33b423633f07dacb1a3f9b8c942e4073945484cd8d6c80b38d833",
  "CUR-002": "e0e1245d105e0d76654515cac25b0bbe31be15b3a2dd8a1a19baf8a0b1cd95a6",
  "CUR-006": "95432958b803dc5bf32acdba351da0e0a90a81f94f82e85249a1b7df5559bf60",
  "PER-001": "a9fedc57bf147f49eb7f6b27c5a428919788f9d22312fbbe0c31dd77316f9b20",
  "BIB-003": "0bef5c8d004ebb1dd64619c8bdfb57a6f76d816f3b3568015b7ee58103fcaa51",
  "BIB-005": "0d7596e0dbec74096e8064b86ac01323b92008b2d1341e91ecd3813a923c8304",
} as const;

export const expectedV33Artworks = {
  "HIST-001": {
    motif: "timeline",
    events: [
      { year: 1855, label: "Proposta", claimId: "HIST-001-C01" },
      { year: 1856, label: "Início das aulas", claimId: "HIST-001-C02" },
      { year: 1857, label: "Lei nº 939", claimId: "HIST-001-C03" },
    ],
  },
  "HIST-006": {
    motif: "legal-document",
    documentNumber: { value: "10.436", claimId: "claim-1" },
    documentDate: { value: "2002", claimId: "HIST-006-C01" },
  },
  "CUR-001": { motif: "diversity-orbits" },
  "CUR-002": { motif: "parallel-structures" },
  "CUR-006": { motif: "visual-rhythm" },
  "PER-001": { motif: "monogram" },
  "BIB-003": {
    motif: "academic",
    volumeNumber: { value: "I", claimId: "BIB-003-C04" },
  },
  "BIB-005": { motif: "literary" },
} as const;

type FrozenWorkflow = {
  validationStatus: string;
  reviews: readonly unknown[];
  publicationAuthorization?: unknown;
  internalPending: readonly unknown[];
};

type FrozenBaselineEntry = {
  version: string;
  fingerprint: string;
  workflow: FrozenWorkflow;
  content?: Record<string, unknown>;
};

const frozenBaseline = culturalPreV33Baseline as unknown as Record<string, FrozenBaselineEntry>;

function sorted(values: readonly string[]) {
  return [...values].sort();
}

function stripV33ControlledFields(entry: CulturalCatalogEntry) {
  const copy = { ...entry } as Partial<CulturalCatalogEntry>;
  delete copy.version;
  delete copy.artwork;
  return copy;
}

function workflowMatches(entry: CulturalCatalogEntry, workflow: FrozenWorkflow) {
  return (
    entry.validationStatus === workflow.validationStatus &&
    isDeepStrictEqual(entry.reviews, workflow.reviews) &&
    isDeepStrictEqual(entry.internalPending, workflow.internalPending) &&
    entry.publicationAuthorization === workflow.publicationAuthorization
  );
}

export function materializeV33BaselineEntry(entryId: string): CulturalCatalogEntry | undefined {
  const baseline = frozenBaseline[entryId];
  if (!baseline?.content) return undefined;
  return {
    ...structuredClone(baseline.content),
    version: baseline.version,
    validationStatus: baseline.workflow.validationStatus,
    reviews: structuredClone(baseline.workflow.reviews),
    internalPending: structuredClone(baseline.workflow.internalPending),
    ...(baseline.workflow.publicationAuthorization
      ? { publicationAuthorization: structuredClone(baseline.workflow.publicationAuthorization) }
      : {}),
  } as unknown as CulturalCatalogEntry;
}

function collectArtworkClaimIds(artwork: unknown): string[] {
  if (!artwork || typeof artwork !== "object") return [];
  const record = artwork as Record<string, unknown>;
  const claimIds: string[] = [];
  if (Array.isArray(record.events)) {
    for (const event of record.events) {
      if (event && typeof event === "object" && typeof (event as { claimId?: unknown }).claimId === "string") {
        claimIds.push((event as { claimId: string }).claimId);
      }
    }
  }
  for (const key of ["documentNumber", "documentDate", "volumeNumber"]) {
    const fact = record[key];
    if (fact && typeof fact === "object" && typeof (fact as { claimId?: unknown }).claimId === "string") {
      claimIds.push((fact as { claimId: string }).claimId);
    }
  }
  return claimIds;
}

export function validateV33Transition(currentCatalog: CulturalCatalogEntry[]) {
  const catalog = restoreCulturalD334BBeforeState(currentCatalog);
  const problems: string[] = [];
  const expectedIds = sorted(Object.keys(frozenBaseline));
  const actualIds = catalog.map((entry) => entry.id);
  if (catalog.length !== 41) problems.push(`expected 41 records, got ${catalog.length}`);
  if (new Set(actualIds).size !== actualIds.length) problems.push("duplicate cultural record id");
  if (!isDeepStrictEqual(sorted(actualIds), expectedIds)) problems.push("cultural record id set differs from frozen baseline");

  const targetIds = sorted(v33ArtworkEntryIds);
  const artworkIds = sorted(catalog.filter((entry) => entry.artwork !== undefined).map((entry) => entry.id));
  if (!isDeepStrictEqual(artworkIds, targetIds)) problems.push("artwork record set differs from the eight authorized records");

  const changedFingerprintIds: string[] = [];
  for (const entry of catalog) {
    const baseline = frozenBaseline[entry.id];
    if (!baseline) {
      problems.push(`unexpected record outside frozen baseline ${entry.id}`);
      continue;
    }
    const fingerprint = getCulturalContentFingerprint(entry);
    if (fingerprint !== baseline.fingerprint) changedFingerprintIds.push(entry.id);

    if ((v33ArtworkEntryIds as readonly string[]).includes(entry.id)) {
      const entryId = entry.id as (typeof v33ArtworkEntryIds)[number];
      const baselineEntry = materializeV33BaselineEntry(entry.id);
      if (!baselineEntry) {
        problems.push(`missing frozen full baseline ${entry.id}`);
        continue;
      }
      if (getCulturalContentFingerprint(baselineEntry) !== baseline.fingerprint) {
        problems.push(`frozen pre-V3.3 fingerprint mismatch ${entry.id}`);
      }
      if (entry.version !== expectedV33AfterVersions[entryId]) {
        problems.push(`wrong post-V3.3 version ${entry.id}`);
      }
      const beforeNumber = Number(baseline.version.split("-")[1]);
      const afterNumber = Number(entry.version.split("-")[1]);
      if (afterNumber !== beforeNumber + 1) problems.push(`version was not incremented exactly once ${entry.id}`);
      if (!isDeepStrictEqual(entry.artwork, expectedV33Artworks[entryId])) {
        problems.push(`artwork differs from approved metadata ${entry.id}`);
      }
      if (fingerprint !== expectedV33AfterFingerprints[entryId]) {
        problems.push(`post-V3.3 fingerprint mismatch ${entry.id}`);
      }
      if (fingerprint === baseline.fingerprint) problems.push(`fingerprint did not change ${entry.id}`);
      if (!isDeepStrictEqual(stripV33ControlledFields(entry), stripV33ControlledFields(baselineEntry))) {
        problems.push(`unauthorized structural change ${entry.id}`);
      }
      if (!workflowMatches(entry, baseline.workflow)) problems.push(`editorial workflow changed ${entry.id}`);
      for (const claimId of collectArtworkClaimIds(entry.artwork)) {
        if (!entry.claims.some((claim) => claim.id === claimId)) {
          problems.push(`artwork references non-local or missing claim ${entry.id}:${claimId}`);
        }
      }
    } else {
      if (entry.artwork !== undefined) problems.push(`unexpected artwork outside authorized set ${entry.id}`);
      if (entry.version !== baseline.version) problems.push(`out-of-scope version change ${entry.id}`);
      if (fingerprint !== baseline.fingerprint) problems.push(`out-of-scope fingerprint change ${entry.id}`);
      if (!workflowMatches(entry, baseline.workflow)) problems.push(`out-of-scope workflow change ${entry.id}`);
    }
  }

  if (!isDeepStrictEqual(sorted(changedFingerprintIds), targetIds)) {
    problems.push("changed fingerprint set differs from the eight authorized records");
  }
  if (changedFingerprintIds.length !== 8) problems.push(`expected 8 changed fingerprints, got ${changedFingerprintIds.length}`);
  if (catalog.length - changedFingerprintIds.length !== 33) problems.push("expected 33 preserved fingerprints");

  const bodyEntries = catalog.filter((entry) => entry.editorialBody);
  if (bodyEntries.length !== 14) problems.push(`expected 14 editorial bodies, got ${bodyEntries.length}`);
  const associationCount = bodyEntries.reduce((count, entry) => count + entry.editorialBody!.claimIds.length, 0);
  if (associationCount !== 57) problems.push(`expected 57 body claim associations, got ${associationCount}`);

  const atomizedClaimIds = catalog.flatMap((entry) => entry.claims.filter((claim) => claim.id.includes("-C")).map((claim) => claim.id));
  if (atomizedClaimIds.length !== 56) problems.push(`expected 56 atomized claims, got ${atomizedClaimIds.length}`);
  if (new Set(atomizedClaimIds).size !== atomizedClaimIds.length) problems.push("duplicate atomized claim id");

  if (!catalog.every((entry) => entry.validationStatus === "draft")) problems.push("not every record remains draft");
  if (!catalog.every((entry) => entry.reviews.length === 0)) problems.push("unexpected review");
  if (!catalog.every((entry) => entry.publicationAuthorization === undefined)) problems.push("unexpected publication authorization");
  if (projectPublicCulturalEntries(catalog).length !== 0) problems.push("public cultural projection is not empty");

  return problems;
}
