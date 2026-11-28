/**
 * Fail-closed publication logic and explicit public projection for cultural
 * entries. This module is data-free: callers provide the editorial registry,
 * so importing these helpers never imports candidate records.
 */
import { createHash } from "node:crypto";

import {
  CULTURAL_CATEGORIES,
  REQUIRED_CULTURAL_REVIEWS,
  getCulturalReviewChainProblems,
  getCulturalReviewPolicyProblems,
  isValidISODate,
  validateCulturalEntry,
  type CulturalCatalogEntry,
  type CulturalReference,
  type CulturalRelationKind,
  type CulturalRights,
  type CulturalValidationStatus,
} from "./cultural-catalog-model";


function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const entries = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

/**
 * Deterministic SHA-256 fingerprint of the editorial material reviewers saw.
 * Workflow fields are excluded so status, review metadata, authorization,
 * editorial version labels and internal pending notes do not alter it.
 */
export function getCulturalContentFingerprint(
  entry: CulturalCatalogEntry,
): string {
  const reviewedContent: Record<string, unknown> = { ...entry };
  delete reviewedContent.version;
  delete reviewedContent.validationStatus;
  delete reviewedContent.reviews;
  delete reviewedContent.publicationAuthorization;
  delete reviewedContent.internalPending;
  return createHash("sha256")
    .update(stableStringify(reviewedContent))
    .digest("hex");
}

function getRequiredCulturalValidationStatus(
  entry: CulturalCatalogEntry,
): CulturalValidationStatus {
  const policy = entry.reviewPolicy;
  return policy?.path === "documentary"
    ? "documentary-validated"
    : "expert-validated";
}

function getFingerprintPublicationProblems(
  entry: CulturalCatalogEntry,
  requiredReviewTypes: readonly ("research" | "technical" | "expert")[],
): string[] {
  const fingerprint = getCulturalContentFingerprint(entry);
  const problems: string[] = [];

  for (const type of requiredReviewTypes) {
    const currentVersionReviews = entry.reviews.filter(
      (item) => item.type === type && item.version === entry.version,
    );
    if (currentVersionReviews.some((review) => !review.contentFingerprint)) {
      problems.push(`${type} review lacks a content fingerprint`);
    } else if (
      !currentVersionReviews.some(
        (review) => review.contentFingerprint === fingerprint,
      )
    ) {
      problems.push(`${type} review covers a different content fingerprint`);
    }
  }

  const authorization = entry.publicationAuthorization;
  if (!authorization?.contentFingerprint) {
    problems.push("final publication authorization lacks a content fingerprint");
  } else if (authorization.contentFingerprint !== fingerprint) {
    problems.push(
      "final publication authorization covers a different content fingerprint",
    );
  }

  return problems;
}

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
        | "reviews"
        | "validationStatus"
        | "publicationAuthorization"
        | "internalPending"
      > & {
        references: CompleteCulturalReference[];
        reviews: Array<
          T["reviews"][number] & { contentFingerprint: string }
        >;
        validationStatus: T["category"] extends "library"
          ? "documentary-validated" | "expert-validated"
          : "expert-validated";
        publicationAuthorization: NonNullable<
          T["publicationAuthorization"]
        > & { contentFingerprint: string };
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

export interface PublicCulturalTimelineEvent {
  year: number;
  label: string;
}

export type PublicCulturalArtwork =
  | {
      motif: "timeline";
      events?: PublicCulturalTimelineEvent[];
    }
  | {
      motif: "legal-document";
      documentNumber?: string;
      documentDate?: string;
    }
  | {
      motif: "diversity-orbits";
    }
  | {
      motif: "parallel-structures";
    }
  | {
      motif: "visual-rhythm";
    }
  | {
      motif: "monogram";
      initials?: string;
    }
  | {
      motif: "academic";
      volumeNumber?: string;
    }
  | {
      motif: "literary";
    };

interface PublicCulturalEntryBase {
  id: string;
  slug: string;
  title: string;
  summary: string;
  editorialBody?: {
    paragraphs: string[];
  };
  artwork?: PublicCulturalArtwork;
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
  if (!entry.library.creators?.some((creator) => creator.trim())) {
    problems.push("library content lacks creators");
  }
  if (!entry.library.format) problems.push("library content lacks format");
  if (!entry.library.access) problems.push("library content lacks access");
  if (!entry.library.languages?.some((language) => language.trim())) {
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
  const catalogIds = new Set(allEntries.map((item) => item.id));
  const validationEntry = {
    ...entry,
    relatedEntries: entry.relatedEntries.filter(
      (relation) =>
        relation.kind !== "unverified-candidate" || catalogIds.has(relation.targetId),
    ),
  };
  const problems = validateCulturalEntry(validationEntry, allEntries);

  if (!CULTURAL_CATEGORIES.includes(entry.category)) {
    problems.push("category is not part of the public cultural taxonomy");
  }

  problems.push(...getCulturalReviewPolicyProblems(entry));

  const requiredStatus = getRequiredCulturalValidationStatus(entry);
  const requiredReviewTypes = REQUIRED_CULTURAL_REVIEWS[requiredStatus];
  if (entry.validationStatus !== requiredStatus) {
    if (requiredStatus === "expert-validated") {
      problems.push("entry has not completed expert validation");
    } else {
      problems.push("entry has not completed documentary validation");
    }
    if (
      entry.validationStatus === "documentary-validated" ||
      entry.validationStatus === "expert-validated"
    ) {
      problems.push("validation status is incompatible with the required review policy");
    }
  } else {
    problems.push(
      ...getCulturalReviewChainProblems(entry, getCulturalContentFingerprint(entry)),
    );
    problems.push(...getFingerprintPublicationProblems(entry, requiredReviewTypes));
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
    const latestReviewDate = entry.reviews
      .filter(
        (review) =>
          review.version === entry.version &&
          requiredReviewTypes.includes(review.type),
      )
      .map((review) => review.date)
      .sort()
      .at(-1);
    if (latestReviewDate && authorization.date < latestReviewDate) {
      problems.push("final publication authorization predates the review chain");
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

function toPublicArtwork(
  artwork: CulturalCatalogEntry["artwork"],
): PublicCulturalArtwork | undefined {
  if (!artwork) return undefined;
  if (artwork.motif === "timeline") {
    return {
      motif: "timeline",
      ...(artwork.events
        ? {
            events: artwork.events.map((event) => ({
              year: event.year,
              label: event.label,
            })),
          }
        : {}),
    };
  }
  if (artwork.motif === "legal-document") {
    return {
      motif: "legal-document",
      ...(artwork.documentNumber
        ? { documentNumber: artwork.documentNumber.value }
        : {}),
      ...(artwork.documentDate
        ? { documentDate: artwork.documentDate.value }
        : {}),
    };
  }
  if (artwork.motif === "monogram") {
    return {
      motif: "monogram",
      ...(artwork.initials ? { initials: artwork.initials } : {}),
    };
  }
  if (artwork.motif === "academic") {
    return {
      motif: "academic",
      ...(artwork.volumeNumber
        ? { volumeNumber: artwork.volumeNumber.value }
        : {}),
    };
  }
  return { motif: artwork.motif };
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
    ...(entry.editorialBody
      ? {
          editorialBody: {
            paragraphs: [...entry.editorialBody.paragraphs],
          },
        }
      : {}),
    ...(entry.artwork ? { artwork: toPublicArtwork(entry.artwork) } : {}),
    references: toPublicReferences(entry.references),
    relatedEntries: entry.relatedEntries
      .filter(
        (relation) =>
          relation.kind !== "unverified-candidate" &&
          relation.evidenceReferenceIds.length > 0 &&
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
      ...(entry.library.creators
        ? { creators: entry.library.creators.filter((creator) => creator.trim()) }
        : {}),
      ...(entry.library.publicationYear !== undefined
        ? { publicationYear: entry.library.publicationYear }
        : {}),
      ...(entry.library.publisher ? { publisher: entry.library.publisher } : {}),
      ...(entry.library.format ? { format: entry.library.format } : {}),
      ...(entry.library.access ? { access: entry.library.access } : {}),
      ...(entry.library.languages
        ? { languages: entry.library.languages.filter((language) => language.trim()) }
        : {}),
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
