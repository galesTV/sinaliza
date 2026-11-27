/**
 * Editorial contract for cultural catalog entries.
 *
 * This module contains only types and validation helpers — no catalog data.
 * Keeping it data-free lets publication logic be reused without putting the
 * editorial registry in a client-side dependency graph.
 */

export const CULTURAL_CATEGORIES = [
  "history",
  "curiosity",
  "personality",
  "library",
] as const;

export type CulturalCategory = (typeof CULTURAL_CATEGORIES)[number];

export type CulturalValidationStatus =
  | "draft"
  | "research-reviewed"
  | "technical-reviewed"
  | "expert-validated";

export const CULTURAL_VALIDATION_STATUS_ORDER: readonly CulturalValidationStatus[] = [
  "draft",
  "research-reviewed",
  "technical-reviewed",
  "expert-validated",
];

export const REQUIRED_CULTURAL_REVIEWS: Record<
  CulturalValidationStatus,
  readonly CulturalReview["type"][]
> = {
  draft: [],
  "research-reviewed": ["research"],
  "technical-reviewed": ["research", "technical"],
  "expert-validated": ["research", "technical", "expert"],
};

export interface CulturalReference {
  id: string;
  url: string;
  /** Institution or author responsible for the source. Unknown in candidates. */
  institution?: string;
  /** What the source substantiates. Unknown in candidates. */
  purpose?: string;
  /** ISO date (YYYY-MM-DD) when the source was last consulted. */
  consultedAt?: string;
}

/**
 * A claim is the smallest editorial unit reviewers can approve, correct or
 * reject. Migration keeps composite summaries as one claim instead of
 * inventing a finer decomposition.
 */
export interface CulturalClaim {
  id: string;
  text: string;
  referenceIds: string[];
}

/**
 * Optional long-form educational body. Paragraphs are plain text only: they
 * are preserved byte-for-byte, rendered as text and never interpreted as HTML
 * or Markdown. `claimIds` is internal provenance linking the body to the
 * claims reviewers must validate; it is not public evidence by itself.
 */
export interface CulturalEditorialBody {
  paragraphs: string[];
  claimIds: string[];
}

export interface CulturalReview {
  reviewer: string;
  type: "research" | "technical" | "expert";
  /** ISO date (YYYY-MM-DD) the review happened. */
  date: string;
  /** Editorial version covered by this review. */
  version: string;
  /** Deterministic fingerprint of the exact reviewed editorial content. */
  contentFingerprint?: string;
  notes?: string;
}

/**
 * Final publication authorization. It is deliberately separate from expert
 * review and is valid only while `version` and `contentFingerprint` match
 * the current entry.
 */
export interface CulturalPublicationAuthorization {
  authorizer: string;
  date: string;
  version: string;
  /** Deterministic fingerprint of the exact authorized editorial content. */
  contentFingerprint?: string;
  scope: "public-web";
  notes?: string;
}

/**
 * Relations migrated from D.2 start as `unverified-candidate`: the original
 * seed established adjacency but not semantics or evidence.
 */
export type CulturalRelationKind =
  | "unverified-candidate"
  | "theme"
  | "person"
  | "work"
  | "historical-context"
  | "source";

export interface CulturalRelation {
  targetId: string;
  kind: CulturalRelationKind;
  evidenceReferenceIds: string[];
  internalNote?: string;
}

export type CulturalAssetKind =
  | "image"
  | "video"
  | "document"
  | "cover"
  | "audio"
  | "embed";

export interface CulturalAssetRights {
  id: string;
  kind: CulturalAssetKind;
  source?: string;
  sourceUrl?: string;
  license?: string;
  licenseUrl?: string;
  permissionEvidence?: string;
  publicationEvidence?: string;
  scope: "public" | "local-review";
  restrictions?: string;
}

/**
 * Rights are independent from editorial validation. `external-link-only`
 * permits linking out — never copying, hosting, embedding or reproducing
 * third-party material.
 */
export interface CulturalRights {
  mode:
    | "external-link-only"
    | "no-third-party-assets"
    | "licensed-assets"
    | "mixed";
  assets: CulturalAssetRights[];
  notes?: string;
}

interface CulturalEntryBase {
  id: string;
  slug: string;
  category: CulturalCategory;
  title: string;
  summary: string;
  /** Optional long-form educational text, distinct from the short summary. */
  editorialBody?: CulturalEditorialBody;
  /** Editorial version. Any substantive content change requires a new value. */
  version: string;
  references: CulturalReference[];
  claims: CulturalClaim[];
  validationStatus: CulturalValidationStatus;
  reviews: CulturalReview[];
  publicationAuthorization?: CulturalPublicationAuthorization;
  rights: CulturalRights;
  relatedEntries: CulturalRelation[];
  /** Internal-only unresolved editorial work; never part of public output. */
  internalPending: string[];
}

export type HistoryMetadataKey = "year" | "dateLabel" | "context";

export interface CulturalHistoryEntry extends CulturalEntryBase {
  category: "history";
  history: {
    year?: number;
    dateLabel?: string;
    context?: string;
    unknownMetadata: HistoryMetadataKey[];
  };
}

export interface CulturalCuriosityEntry extends CulturalEntryBase {
  category: "curiosity";
  curiosity: {
    question: string;
    shortAnswer: string;
    deepening?: string;
  };
}

export interface CulturalPersonalityEntry extends CulturalEntryBase {
  category: "personality";
  personality: {
    personName: string;
    biographicalSummary: string;
    contributions?: string[];
  };
}

export type LibraryFormat =
  | "book"
  | "children-literature"
  | "dictionary"
  | "audiovisual-series"
  | "academic-study"
  | "historical-facsimile"
  | "website"
  | "other";

export type LibraryAccess =
  | "open-digital"
  | "institutional-digital"
  | "commercial"
  | "physical"
  | "external-website"
  | "unavailable"
  | "other";

export type LibraryMetadataKey =
  | "creators"
  | "publicationYear"
  | "publisher"
  | "format"
  | "access"
  | "languages";

export interface CulturalLibraryEntry extends CulturalEntryBase {
  category: "library";
  library: {
    creators?: string[];
    publicationYear?: number;
    publisher?: string;
    format?: LibraryFormat;
    access?: LibraryAccess;
    languages?: string[];
    /** Structured fields still unknown; absence must never mean "assumed". */
    unknownMetadata: LibraryMetadataKey[];
    /** Unverified metadata exactly as received, retained for editorial work. */
    unstructuredMetadata?: string;
  };
}

export type CulturalCatalogEntry =
  | CulturalHistoryEntry
  | CulturalCuriosityEntry
  | CulturalPersonalityEntry
  | CulturalLibraryEntry;

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isValidCulturalReview(review: CulturalReview): boolean {
  return (
    review.reviewer.trim().length > 0 &&
    isValidISODate(review.date) &&
    review.version.trim().length > 0 &&
    (review.contentFingerprint === undefined ||
      /^[a-f0-9]{64}$/.test(review.contentFingerprint))
  );
}

export function hasCurrentCulturalReview(
  reviews: readonly CulturalReview[],
  version: string,
  type: CulturalReview["type"],
): boolean {
  return reviews.some(
    (review) =>
      review.type === type &&
      isValidCulturalReview(review) &&
      review.version === version,
  );
}

/**
 * Problems in the review chain claimed by the entry status. A chain is valid
 * only when every required stage exists, is complete, covers the current
 * editorial version and appears in lifecycle order.
 */
export function getCulturalReviewChainProblems(
  entry: Pick<
    CulturalCatalogEntry,
    "validationStatus" | "version" | "reviews"
  >,
  contentFingerprint?: string,
): string[] {
  const problems: string[] = [];
  const required = REQUIRED_CULTURAL_REVIEWS[entry.validationStatus];
  const currentPositions: number[] = [];

  for (const type of required) {
    const matching = entry.reviews.filter((review) => review.type === type);
    const currentIndex = entry.reviews.findIndex(
      (review) =>
        review.type === type &&
        isValidCulturalReview(review) &&
        review.version === entry.version &&
        (contentFingerprint === undefined ||
          review.contentFingerprint === contentFingerprint),
    );
    currentPositions.push(currentIndex);

    if (matching.length === 0) {
      problems.push(`missing ${type} review`);
    } else if (!matching.some((review) => isValidCulturalReview(review))) {
      problems.push(`${type} review is incomplete`);
    } else if (
      !matching.some(
        (review) =>
          isValidCulturalReview(review) && review.version === entry.version,
      )
    ) {
      problems.push(`${type} review covers an outdated editorial version`);
    }
  }

  if (
    currentPositions.every((position) => position >= 0) &&
    currentPositions.some(
      (position, index) =>
        index > 0 && position <= currentPositions[index - 1],
    )
  ) {
    problems.push("review chain is out of order");
  }

  return problems;
}

export function isValidHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function validateSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/** Structural integrity required even for drafts. Editorial completeness is checked separately before publication. */
export function validateCulturalEntry(
  entry: CulturalCatalogEntry,
  allEntries: readonly CulturalCatalogEntry[] = [],
): string[] {
  const problems: string[] = [];

  if (!entry.id.trim()) problems.push("missing id");
  if (!validateSlug(entry.slug)) problems.push("slug must be lowercase URL-safe text");
  if (!CULTURAL_CATEGORIES.includes(entry.category)) {
    problems.push(`invalid category "${entry.category}"`);
  }
  if (!entry.title.trim()) problems.push("missing title");
  if (!entry.summary.trim()) problems.push("missing summary");
  if (!entry.version.trim()) problems.push("missing editorial version");

  const referenceIds = new Set<string>();
  entry.references.forEach((reference, index) => {
    const at = `reference ${index}`;
    if (!reference.id.trim()) problems.push(`${at}: missing id`);
    if (referenceIds.has(reference.id)) {
      problems.push(`${at}: duplicate id "${reference.id}"`);
    }
    referenceIds.add(reference.id);
    if (!isValidHttpsUrl(reference.url)) {
      problems.push(`${at}: url must be a valid https URL`);
    }
    if (
      reference.consultedAt !== undefined &&
      !isValidISODate(reference.consultedAt)
    ) {
      problems.push(`${at}: consultedAt must be YYYY-MM-DD`);
    }
  });

  const claimIds = new Set<string>();
  entry.claims.forEach((claim, index) => {
    const at = `claim ${index}`;
    if (!claim.id.trim()) problems.push(`${at}: missing id`);
    if (claimIds.has(claim.id)) {
      problems.push(`${at}: duplicate id "${claim.id}"`);
    }
    claimIds.add(claim.id);
    if (!claim.text.trim()) problems.push(`${at}: missing text`);
    for (const referenceId of claim.referenceIds) {
      if (!referenceIds.has(referenceId)) {
        problems.push(`${at}: unknown reference "${referenceId}"`);
      }
    }
  });

  problems.push(...getCulturalReviewChainProblems(entry));

  if (entry.publicationAuthorization) {
    const authorization = entry.publicationAuthorization;
    if (!authorization.authorizer.trim()) {
      problems.push("publication authorization: missing authorizer");
    }
    if (!isValidISODate(authorization.date)) {
      problems.push("publication authorization: date must be YYYY-MM-DD");
    }
    if (!authorization.version.trim()) {
      problems.push("publication authorization: missing version");
    }
    if (
      authorization.contentFingerprint !== undefined &&
      !/^[a-f0-9]{64}$/.test(authorization.contentFingerprint)
    ) {
      problems.push("publication authorization: invalid content fingerprint");
    }
    if (authorization.scope !== "public-web") {
      problems.push("publication authorization: unsupported scope");
    }
  }

  const assetIds = new Set<string>();
  entry.rights.assets.forEach((asset, index) => {
    const at = `asset ${index}`;
    if (!asset.id.trim()) problems.push(`${at}: missing id`);
    if (assetIds.has(asset.id)) {
      problems.push(`${at}: duplicate id "${asset.id}"`);
    }
    assetIds.add(asset.id);
    if (asset.sourceUrl && !isValidHttpsUrl(asset.sourceUrl)) {
      problems.push(`${at}: sourceUrl must be a valid https URL`);
    }
    if (asset.licenseUrl && !isValidHttpsUrl(asset.licenseUrl)) {
      problems.push(`${at}: licenseUrl must be a valid https URL`);
    }
  });
  if (
    (entry.rights.mode === "external-link-only" ||
      entry.rights.mode === "no-third-party-assets") &&
    entry.rights.assets.length > 0
  ) {
    problems.push(`rights mode "${entry.rights.mode}" cannot declare assets`);
  }

  const catalogIds = new Set(allEntries.map((item) => item.id));
  entry.relatedEntries.forEach((relation, index) => {
    const at = `relation ${index}`;
    if (!relation.targetId.trim()) problems.push(`${at}: missing target`);
    if (relation.targetId === entry.id) problems.push(`${at}: self relation`);
    if (allEntries.length > 0 && !catalogIds.has(relation.targetId)) {
      problems.push(`${at}: unknown target "${relation.targetId}"`);
    }
    for (const referenceId of relation.evidenceReferenceIds) {
      if (!referenceIds.has(referenceId)) {
        problems.push(`${at}: unknown evidence reference "${referenceId}"`);
      }
    }
  });

  entry.internalPending.forEach((pending, index) => {
    if (!pending.trim()) problems.push(`internal pending ${index}: empty text`);
  });

  if (entry.editorialBody !== undefined) {
    const body: unknown = entry.editorialBody;
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      problems.push("editorial body: invalid structure");
    } else {
      const bodyRecord = body as Record<string, unknown>;
      const paragraphs = bodyRecord.paragraphs;
      if (!("paragraphs" in bodyRecord) || (Array.isArray(paragraphs) && paragraphs.length === 0)) {
        problems.push("editorial body: missing paragraphs");
      } else if (!Array.isArray(paragraphs)) {
        problems.push("editorial body: paragraphs must be an array");
      } else {
        paragraphs.forEach((paragraph, index) => {
          if (typeof paragraph !== "string") {
            problems.push(`editorial body paragraph ${index}: non-string text`);
          } else if (!paragraph.trim()) {
            problems.push(`editorial body paragraph ${index}: empty text`);
          }
        });
      }

      const bodyClaimIds = bodyRecord.claimIds;
      if (!("claimIds" in bodyRecord) || (Array.isArray(bodyClaimIds) && bodyClaimIds.length === 0)) {
        problems.push("editorial body: missing claim ids");
      } else if (!Array.isArray(bodyClaimIds)) {
        problems.push("editorial body: claim ids must be an array");
      } else {
        const seenBodyClaimIds = new Set<string>();
        const foreignClaimIds = new Set(
          allEntries
            .filter((item) => item.id !== entry.id)
            .flatMap((item) => item.claims.map((claim) => claim.id)),
        );
        let validBodyClaimCount = 0;
        bodyClaimIds.forEach((claimId, index) => {
          const at = `editorial body claim ${index}`;
          if (typeof claimId !== "string") {
            problems.push(`${at}: non-string id`);
            return;
          }
          if (!claimId.trim()) {
            problems.push(`${at}: empty id`);
            return;
          }
          if (seenBodyClaimIds.has(claimId)) {
            problems.push(`${at}: duplicate id "${claimId}"`);
          }
          seenBodyClaimIds.add(claimId);
          if (claimIds.has(claimId)) {
            validBodyClaimCount += 1;
          } else if (foreignClaimIds.has(claimId)) {
            problems.push(`${at}: claim "${claimId}" belongs to another record`);
          } else {
            problems.push(`${at}: unknown claim "${claimId}"`);
          }
        });
        if (bodyClaimIds.length > 0 && validBodyClaimCount === 0) {
          problems.push("editorial body: no valid claims");
        }
      }
    }
  }

  if (entry.category === "history") {
    if (
      entry.history.year !== undefined &&
      (!Number.isInteger(entry.history.year) || entry.history.year < 0)
    ) {
      problems.push("history: year must be a non-negative integer");
    }
    const allowed: readonly string[] = ["year", "dateLabel", "context"];
    for (const key of entry.history.unknownMetadata) {
      if (!allowed.includes(key)) problems.push(`history: invalid unknown metadata "${key}"`);
    }
  }

  if (entry.category === "curiosity") {
    if (!entry.curiosity.question.trim()) problems.push("curiosity: missing question");
    if (!entry.curiosity.shortAnswer.trim()) problems.push("curiosity: missing short answer");
  }

  if (entry.category === "personality") {
    if (!entry.personality.personName.trim()) problems.push("personality: missing person name");
    if (!entry.personality.biographicalSummary.trim()) {
      problems.push("personality: missing biographical summary");
    }
  }

  if (entry.category === "library") {
    const allowed: readonly string[] = [
      "creators",
      "publicationYear",
      "publisher",
      "format",
      "access",
      "languages",
    ];
    const unknownKeys = new Set<string>();
    for (const key of entry.library.unknownMetadata) {
      if (!allowed.includes(key)) problems.push(`library: invalid unknown metadata "${key}"`);
      if (unknownKeys.has(key)) problems.push(`library: duplicate unknown metadata "${key}"`);
      unknownKeys.add(key);
    }
    if (
      entry.library.publicationYear !== undefined &&
      (!Number.isInteger(entry.library.publicationYear) ||
        entry.library.publicationYear < 0)
    ) {
      problems.push("library: publicationYear must be a non-negative integer");
    }
  }

  return problems;
}

/** Catalog-wide structural validation, including cross-record identity and relation integrity. */
export function validateCulturalCatalog(
  entries: readonly CulturalCatalogEntry[],
): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();

  for (const entry of entries) {
    if (ids.has(entry.id)) problems.push(`duplicate id "${entry.id}"`);
    if (slugs.has(entry.slug)) problems.push(`duplicate slug "${entry.slug}"`);
    ids.add(entry.id);
    slugs.add(entry.slug);
    problems.push(
      ...validateCulturalEntry(entry, entries).map(
        (problem) => `${entry.id}: ${problem}`,
      ),
    );
  }

  return problems;
}
