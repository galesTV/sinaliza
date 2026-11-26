/**
 * Fail-closed publication logic and explicit public projection for cultural
 * entries. This module is data-free: callers provide the editorial registry,
 * so importing these helpers never imports candidate records.
 */
import {
  CULTURAL_CATEGORIES,
  getCulturalReviewChainProblems,
  isValidISODate,
  validateCulturalEntry,
  type CulturalCatalogEntry,
  type CulturalReference,
  type CulturalRelationKind,
  type CulturalRights,
} from "./cultural-catalog-model";

export type CompleteCulturalReference = CulturalReference & {
  institution: string;
  purpose: string;
  consultedAt: string;
};

/**
 * Editorial contract satisfied only after the derived publication gate passes.
 * Candidates use `CulturalCatalogEntry`; this narrower contract is never
 * asserted manually — it is available only through the `isCulturalPublishable`
 * type guard after runtime evidence has been checked.
 */
export type PublishableCulturalEntry = CulturalCatalogEntry extends infer T
  ? T extends CulturalCatalogEntry
    ? Omit<
        T,
        | "references"
        | "validationStatus"
        | "publicationAuthorization"
        | "internalPending"
      > & {
        references: CompleteCulturalReference[];
        validationStatus: "expert-validated";
        publicationAuthorization: NonNullable<
          T["publicationAuthorization"]
        >;
        internalPending: [];
      }
    : never
  : never;

export interface PublicCulturalReference {
  institution: string;
  url: string;
  purpose: string;
  consultedAt: string;
}

export type PublicCulturalRelationKind = Exclude<
  CulturalRelationKind,
  "unverified-candidate"
>;

export interface PublicCulturalRelation {
  targetId: string;
  kind: PublicCulturalRelationKind;
}

interface PublicCulturalEntryBase {
  id: string;
  slug: string;
  title: string;
  summary: string;
  references: PublicCulturalReference[];
  relatedEntries: PublicCulturalRelation[];
}

export interface PublicCulturalHistoryEntry extends PublicCulturalEntryBase {
  category: "history";
  history: {
    year?: number;
    dateLabel?: string;
    context?: string;
  };
}

export interface PublicCulturalCuriosityEntry extends PublicCulturalEntryBase {
  category: "curiosity";
  curiosity: {
    question: string;
    shortAnswer: string;
    deepening?: string;
  };
}

export interface PublicCulturalPersonalityEntry extends PublicCulturalEntryBase {
  category: "personality";
  personality: {
    personName: string;
    biographicalSummary: string;
    contributions?: string[];
  };
}

export interface PublicCulturalLibraryEntry extends PublicCulturalEntryBase {
  category: "library";
  library: {
    creators?: string[];
    publicationYear?: number;
    publisher?: string;
    format?: string;
    access?: string;
    languages?: string[];
  };
}

export type PublicCulturalEntry =
  | PublicCulturalHistoryEntry
  | PublicCulturalCuriosityEntry
  | PublicCulturalPersonalityEntry
  | PublicCulturalLibraryEntry;

function hasCompletePublicationReference(
  reference: CulturalReference,
): boolean {
  return (
    Boolean(reference.institution?.trim()) &&
    Boolean(reference.purpose?.trim()) &&
    Boolean(reference.consultedAt) &&
    isValidISODate(reference.consultedAt!)
  );
}

function getRightsPublicationProblems(rights: CulturalRights): string[] {
  if (
    rights.mode === "external-link-only" ||
    rights.mode === "no-third-party-assets"
  ) {
    return [];
  }

  return rights.assets.flatMap((asset, index) => {
    const problems: string[] = [];
    const at = `asset ${index}`;
    if (!asset.source?.trim()) problems.push(`${at}: missing source`);
    if (!asset.license?.trim()) problems.push(`${at}: missing license`);
    if (!asset.permissionEvidence?.trim()) {
      problems.push(`${at}: missing permission evidence`);
    }
    if (!asset.publicationEvidence?.trim()) {
      problems.push(`${at}: missing publication evidence`);
    }
    if (asset.scope !== "public") {
      problems.push(`${at}: scope is not public`);
    }
    return problems;
  });
}

function getContentPublicationProblems(
  entry: CulturalCatalogEntry,
): string[] {
  if (!CULTURAL_CATEGORIES.includes(entry.category)) {
    return ["content does not match a public cultural category"];
  }
  if (entry.category === "history") {
    const hasDate =
      entry.history.year !== undefined || Boolean(entry.history.dateLabel?.trim());
    return hasDate ? [] : ["history content lacks a date or year"];
  }
  if (entry.category === "curiosity") {
    return entry.curiosity.question.trim() && entry.curiosity.shortAnswer.trim()
      ? []
      : ["curiosity content is incomplete"];
  }
  if (entry.category === "personality") {
    return entry.personality.personName.trim() &&
      entry.personality.biographicalSummary.trim()
      ? []
      : ["personality content is incomplete"];
  }

  const problems: string[] = [];
  const requiredKeys = ["creators", "format", "access", "languages"] as const;
  for (const key of requiredKeys) {
    if (entry.library.unknownMetadata.includes(key)) {
      problems.push(`library metadata "${key}" is unknown`);
    }
  }
  if (!entry.library.creators?.length) {
    problems.push("library content lacks creators");
  }
  if (!entry.library.format) problems.push("library content lacks format");
  if (!entry.library.access) problems.push("library content lacks access");
  if (!entry.library.languages?.length) {
    problems.push("library content lacks languages");
  }
  return problems;
}

/**
 * Every reason an entry cannot be published. Empty means publishable.
 * The result is fully derived; no boolean stored in the seed or entry can
 * authorize publication.
 */
export function getCulturalPublicationBlockers(
  entry: CulturalCatalogEntry,
  allEntries: readonly CulturalCatalogEntry[],
): string[] {
  const problems = validateCulturalEntry(entry, allEntries);

  if (!CULTURAL_CATEGORIES.includes(entry.category)) {
    problems.push("category is not part of the public cultural taxonomy");
  }

  if (entry.validationStatus !== "expert-validated") {
    problems.push("entry has not completed expert validation");
  } else {
    problems.push(...getCulturalReviewChainProblems(entry));
  }

  const authorization = entry.publicationAuthorization;
  if (!authorization) {
    problems.push("missing final publication authorization");
  } else {
    if (!authorization.authorizer.trim()) {
      problems.push("final publication authorization is incomplete");
    }
    if (!isValidISODate(authorization.date)) {
      problems.push("final publication authorization has invalid date");
    }
    if (authorization.version !== entry.version) {
      problems.push("final publication authorization covers an outdated editorial version");
    }
  }

  if (entry.internalPending.length > 0) {
    problems.push("entry has unresolved internal editorial pending items");
  }

  if (entry.references.length === 0) {
    problems.push("entry has no references");
  } else if (
    entry.references.some((reference) => !hasCompletePublicationReference(reference))
  ) {
    problems.push("entry has incomplete publication references");
  }

  if (entry.claims.length === 0) {
    problems.push("entry has no traceable claims");
  } else if (entry.claims.some((claim) => claim.referenceIds.length === 0)) {
    problems.push("entry has claims without references");
  }

  for (const relation of entry.relatedEntries) {
    if (relation.kind === "unverified-candidate") {
      problems.push(`relation to "${relation.targetId}" has unverified semantics`);
    }
    if (relation.evidenceReferenceIds.length === 0) {
      problems.push(`relation to "${relation.targetId}" has no evidence`);
    }
  }

  problems.push(...getContentPublicationProblems(entry));
  problems.push(...getRightsPublicationProblems(entry.rights));

  return [...new Set(problems)];
}

export function isCulturalPublishable(
  entry: CulturalCatalogEntry,
  allEntries: readonly CulturalCatalogEntry[],
): entry is PublishableCulturalEntry {
  return getCulturalPublicationBlockers(entry, allEntries).length === 0;
}

function toPublicReferences(
  references: readonly CulturalReference[],
): PublicCulturalReference[] {
  return references.map((reference) => ({
    institution: reference.institution!,
    url: reference.url,
    purpose: reference.purpose!,
    consultedAt: reference.consultedAt!,
  }));
}

function toPublicEntry(
  entry: CulturalCatalogEntry,
  publishableIds: ReadonlySet<string>,
): PublicCulturalEntry {
  const base: PublicCulturalEntryBase = {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    summary: entry.summary,
    references: toPublicReferences(entry.references),
    relatedEntries: entry.relatedEntries
      .filter(
        (relation) =>
          relation.kind !== "unverified-candidate" &&
          publishableIds.has(relation.targetId),
      )
      .map((relation) => ({
        targetId: relation.targetId,
        kind: relation.kind as PublicCulturalRelationKind,
      })),
  };

  if (entry.category === "history") {
    return {
      ...base,
      category: "history",
      history: {
        ...(entry.history.year !== undefined ? { year: entry.history.year } : {}),
        ...(entry.history.dateLabel ? { dateLabel: entry.history.dateLabel } : {}),
        ...(entry.history.context ? { context: entry.history.context } : {}),
      },
    };
  }

  if (entry.category === "curiosity") {
    return {
      ...base,
      category: "curiosity",
      curiosity: {
        question: entry.curiosity.question,
        shortAnswer: entry.curiosity.shortAnswer,
        ...(entry.curiosity.deepening
          ? { deepening: entry.curiosity.deepening }
          : {}),
      },
    };
  }

  if (entry.category === "personality") {
    return {
      ...base,
      category: "personality",
      personality: {
        personName: entry.personality.personName,
        biographicalSummary: entry.personality.biographicalSummary,
        ...(entry.personality.contributions
          ? { contributions: [...entry.personality.contributions] }
          : {}),
      },
    };
  }

  return {
    ...base,
    category: "library",
    library: {
      ...(entry.library.creators ? { creators: [...entry.library.creators] } : {}),
      ...(entry.library.publicationYear !== undefined
        ? { publicationYear: entry.library.publicationYear }
        : {}),
      ...(entry.library.publisher ? { publisher: entry.library.publisher } : {}),
      ...(entry.library.format ? { format: entry.library.format } : {}),
      ...(entry.library.access ? { access: entry.library.access } : {}),
      ...(entry.library.languages ? { languages: [...entry.library.languages] } : {}),
    },
  };
}

/**
 * Allowlisted public projection. Editorial status, reviewers, authorization,
 * rights evidence, claims, pendências, unstructured metadata and relations to
 * non-publishable records are intentionally absent.
 */
export function projectPublicCulturalEntries(
  entries: readonly CulturalCatalogEntry[],
): PublicCulturalEntry[] {
  const publishableEntries = entries.filter((entry) =>
    isCulturalPublishable(entry, entries),
  );
  const publishableIds = new Set(publishableEntries.map((entry) => entry.id));
  return publishableEntries.map((entry) => toPublicEntry(entry, publishableIds));
}
