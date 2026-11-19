import { describe, expect, it } from "vitest";

import { parseLessonKey } from "@/lib/progress";
import { createLessonRunner } from "@/lib/lesson-runner";

import {
  getCatalogEntry,
  getCatalogEntryById,
  getLessonDraft,
  getLessonDraftUrl,
  isPublishable,
  lessonCatalog,
  validateCatalogEntry,
  VALIDATION_STATUS_ORDER,
  type LessonCatalogEntry,
} from "./lesson-catalog";
import { lessonContents } from "./lesson-content";
import {
  hasMediaDisplayPermission,
  isExerciseVisuallyPermitted,
} from "./lesson-content";
import { getLessonContext } from "./learning-paths";

function makeEntry(
  overrides: Partial<LessonCatalogEntry> = {},
): LessonCatalogEntry {
  return {
    id: "teste",
    lessonKey: "alfabeto/primeiros-passos/o-que-e",
    title: "Lição de teste",
    objective: "Objetivo de teste",
    references: [
      {
        institution: "Instituição de teste",
        url: "https://example.org/fonte",
        purpose: "Testar",
        consultedAt: "2026-11-18",
      },
    ],
    plannedOutline: ["passo"],
    validationStatus: "draft",
    version: "draft-1",
    reviews: [],
    ...overrides,
  };
}

function makeReview(
  type: LessonCatalogEntry["reviews"][number]["type"],
  overrides: Partial<LessonCatalogEntry["reviews"][number]> = {},
): LessonCatalogEntry["reviews"][number] {
  return {
    reviewer: `Revisor ${type}`,
    type,
    date: "2026-11-18",
    version: "draft-1",
    ...overrides,
  };
}

const FULL_REVIEW_CHAIN = [
  makeReview("research"),
  makeReview("technical"),
  makeReview("expert"),
];

describe("lessonCatalog", () => {
  it("registers every entry as well-formed and traceable", () => {
    for (const entry of lessonCatalog) {
      expect(validateCatalogEntry(entry), entry.id).toEqual([]);
    }
  });

  it("has unique ids and lesson keys", () => {
    const ids = lessonCatalog.map((entry) => entry.id);
    const keys = lessonCatalog.map((entry) => entry.lessonKey);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("points every key at a real, existing lesson", () => {
    for (const entry of lessonCatalog) {
      const parsed = parseLessonKey(entry.lessonKey);
      expect(parsed, entry.lessonKey).not.toBeNull();
      expect(
        getLessonContext(
          parsed!.pathSlug,
          parsed!.moduleSlug,
          parsed!.lessonSlug,
        ),
        entry.lessonKey,
      ).toBeDefined();
    }
  });

  it("registers the three foundational concept lessons as drafts", () => {
    const lingua = getCatalogEntry(
      "alfabeto/primeiros-passos/libras-e-uma-lingua",
    );
    const datilologia = getCatalogEntry("alfabeto/primeiros-passos/o-que-e");
    const primeirasLetras = getCatalogEntry(
      "alfabeto/primeiros-passos/primeiras-letras",
    );
    expect(lingua?.draft).toBeDefined();
    expect(datilologia?.draft).toBeDefined();
    expect(primeirasLetras?.draft).toBeDefined();
    for (const entry of [lingua, datilologia, primeirasLetras]) {
      expect(entry?.validationStatus).toBe("draft");
      expect(isPublishable(entry!)).toBe(false);
    }
  });
});

describe("publication safety", () => {
  it("keeps provisional content out of the published registry", () => {
    // Nothing in lessonContents may be backed by an unvalidated entry, and
    // no unvalidated entry may point at an already-published lesson.
    for (const entry of lessonCatalog) {
      const published = lessonContents[entry.lessonKey];
      if (published) {
        expect(
          entry.validationStatus,
          `"${entry.lessonKey}" is published but its catalog entry is "${entry.validationStatus}"`,
        ).toBe("expert-validated");
      }
      if (entry.draft && entry.validationStatus !== "expert-validated") {
        expect(
          lessonContents[entry.lessonKey],
          `provisional draft "${entry.lessonKey}" leaked into lessonContents`,
        ).toBeUndefined();
      }
    }
  });

  it("requires a publishable catalog entry for every published lesson", () => {
    // Mirror direction: anything that reaches lessonContents must be backed
    // by a catalog entry carrying the full review evidence.
    for (const key of Object.keys(lessonContents)) {
      const entry = getCatalogEntry(key);
      expect(entry, `published "${key}" has no catalog entry`).toBeDefined();
      expect(
        isPublishable(entry!),
        `published "${key}" lacks expert validation evidence`,
      ).toBe(true);
    }
  });

  it("marks every status as not publishable without review evidence", () => {
    // Even "expert-validated" alone is not enough — the review chain and a
    // well-formed draft are required (positive case covered below).
    for (const status of VALIDATION_STATUS_ORDER) {
      const entry = makeEntry({ validationStatus: status });
      expect(isPublishable(entry)).toBe(false);
    }
  });

  it("is not publishable with a bare expert-validated status", () => {
    // Status alone is not evidence: the review chain must exist and cover
    // the current content version.
    const entry = makeEntry({
      validationStatus: "expert-validated",
      draft: {
        intro: "intro",
        blocks: [{ kind: "text", heading: "h", body: "b" }],
      },
    });
    expect(isPublishable(entry)).toBe(false);
  });

  it("is not publishable with an incomplete or stale review chain", () => {
    const missingStages = makeEntry({
      validationStatus: "expert-validated",
      reviews: [makeReview("expert")],
    });
    expect(isPublishable(missingStages)).toBe(false);

    const stale = makeEntry({
      validationStatus: "expert-validated",
      version: "draft-2",
      reviews: [...FULL_REVIEW_CHAIN],
    });
    expect(isPublishable(stale)).toBe(false);

    const incomplete = makeEntry({
      validationStatus: "expert-validated",
      reviews: [
        makeReview("research"),
        makeReview("technical"),
        makeReview("expert", { version: "" }),
      ],
    });
    expect(isPublishable(incomplete)).toBe(false);
  });

  it("is publishable only with the full chain on the current version", () => {
    const entry = makeEntry({
      validationStatus: "expert-validated",
      reviews: [...FULL_REVIEW_CHAIN],
      draft: {
        intro: "intro",
        blocks: [{ kind: "text", heading: "h", body: "b" }],
      },
    });
    expect(isPublishable(entry)).toBe(true);

    // Without draft content there is nothing to publish.
    expect(isPublishable({ ...entry, draft: undefined })).toBe(false);
    // Malformed draft content is not publishable either.
    expect(
      isPublishable({ ...entry, draft: { intro: "", blocks: [] } }),
    ).toBe(false);
  });
});

describe("validateCatalogEntry", () => {
  it("rejects expert-validated without an expert review on record", () => {
    const problems = validateCatalogEntry(
      makeEntry({ validationStatus: "expert-validated" }),
    );
    expect(problems.join()).toContain("expert-validated");
  });

  it("accepts expert-validated with the full review chain on the current version", () => {
    const problems = validateCatalogEntry(
      makeEntry({
        validationStatus: "expert-validated",
        reviews: [...FULL_REVIEW_CHAIN],
      }),
    );
    expect(problems).toEqual([]);
  });

  it("requires the research and technical reviews before the expert one", () => {
    const problems = validateCatalogEntry(
      makeEntry({
        validationStatus: "expert-validated",
        reviews: [makeReview("expert")],
      }),
    );
    expect(problems.join()).toContain("research");
    expect(problems.join()).toContain("technical");
  });

  it("flags an incomplete review as no evidence", () => {
    const problems = validateCatalogEntry(
      makeEntry({
        validationStatus: "expert-validated",
        reviews: [
          makeReview("research"),
          makeReview("technical"),
          makeReview("expert", { reviewer: "" }),
        ],
      }),
    );
    expect(problems.join()).toContain("expert review is incomplete");
  });

  it("flags a review that covers an outdated content version", () => {
    const problems = validateCatalogEntry(
      makeEntry({
        validationStatus: "expert-validated",
        version: "draft-2",
        reviews: [...FULL_REVIEW_CHAIN],
      }),
    );
    expect(problems.join()).toContain("outdated content version");
  });

  it("rejects intermediate statuses without the matching review", () => {
    expect(
      validateCatalogEntry(
        makeEntry({ validationStatus: "research-reviewed" }),
      ).join(),
    ).toContain("research");
    expect(
      validateCatalogEntry(
        makeEntry({
          validationStatus: "technical-reviewed",
          reviews: [
            {
              reviewer: "Pesquisador",
              type: "research",
              date: "2026-11-18",
              version: "draft-1",
            },
          ],
        }),
      ).join(),
    ).toContain("technical");
  });

  it("flags malformed keys, references and reviews", () => {
    const problems = validateCatalogEntry(
      makeEntry({
        lessonKey: "chave-invalida",
        references: [
          {
            institution: "",
            url: "nao-e-url",
            purpose: "",
            consultedAt: "18/11/2026",
          },
        ],
        reviews: [{ reviewer: "", type: "expert", date: "hoje", version: "" }],
      }),
    );
    expect(problems.join()).toContain("malformed lessonKey");
    expect(problems.join()).toContain("missing institution");
    expect(problems.join()).toContain("not http(s)");
    expect(problems.join()).toContain("missing purpose");
    expect(problems.join()).toContain("YYYY-MM-DD");
  });

  it("flags malformed draft content", () => {
    const problems = validateCatalogEntry(
      makeEntry({ draft: { intro: "", blocks: [] } }),
    );
    expect(problems.join()).toContain("draft:");
  });
});

describe("primeiras-letras draft-4", () => {
  const entry = getCatalogEntry(
    "alfabeto/primeiros-passos/primeiras-letras",
  )!;

  it("stays a draft: never publishable, never in the lesson registry", () => {
    expect(entry.validationStatus).toBe("draft");
    expect(entry.version).toBe("draft-4");
    expect(isPublishable(entry)).toBe(false);
    expect(lessonContents[entry.lessonKey]).toBeUndefined();
    expect(validateCatalogEntry(entry)).toEqual([]);
  });

  it("declares one gated media slot per taught letter", () => {
    const mediaBlocks = entry.draft!.blocks.flatMap((block) =>
      block.kind === "media" ? [block] : [],
    );
    expect(mediaBlocks.length).toBe(4);
    for (const block of mediaBlocks) {
      expect(block.media.type).toBe("image");
      expect(block.media.src).toMatch(
        /^\/media\/alfabeto\/primeiros-passos\/letra-[abil]\.jpg$/,
      );
      // No evidence was recorded: the fail-closed gate must keep every
      // slot in the "em produção" state instead of rendering the asset.
      expect(block.attribution.permissionEvidence).toBeUndefined();
      expect(hasMediaDisplayPermission(block.attribution)).toBe(false);
    }
  });

  it("gates both visual exercises and offers a description variant", () => {
    const visual = entry.draft!.blocks.flatMap((block) =>
      block.kind === "exercise" &&
      (block.exercise.promptMedia ||
        block.exercise.options.some((option) => option.media))
        ? [block.exercise]
        : [],
    );
    expect(visual.length).toBeGreaterThanOrEqual(2);
    for (const exercise of visual) {
      expect(isExerciseVisuallyPermitted(exercise)).toBe(false);
      expect(exercise.descriptionVariant).toBeDefined();
    }
  });

  it("remains completable without any media via the description variants", () => {
    const runner = createLessonRunner(entry.draft!);
    while (runner.getSnapshot().block) {
      const { block } = runner.getSnapshot();
      if (block?.kind === "exercise") {
        // Visual select() is refused while media is gated; the variant
        // path is what keeps the lesson completable today.
        if (!isExerciseVisuallyPermitted(block.exercise)) {
          runner.select(0);
          expect(runner.getSnapshot().result).toBeNull();
        }
        const variant = block.exercise.descriptionVariant;
        if (variant) {
          runner.selectVariant(variant.correctIndex);
        } else {
          runner.select(block.exercise.correctIndex);
        }
        expect(runner.getSnapshot().result).toBe("correct");
      }
      runner.advance();
    }
    expect(runner.getSnapshot().canComplete).toBe(true);
    expect(runner.complete()).toBe(true);
  });
});

describe("draft accessors", () => {
  it("resolves entries by key and id", () => {
    const entry = lessonCatalog[0];
    expect(getCatalogEntry(entry.lessonKey)).toBe(entry);
    expect(getCatalogEntryById(entry.id)).toBe(entry);
  });

  it("returns draft content only for entries that have one", () => {
    for (const entry of lessonCatalog) {
      expect(getLessonDraft(entry.lessonKey)).toBe(entry.draft);
    }
    expect(getLessonDraft("nao/existe/aqui")).toBeUndefined();
  });

  it("builds the laboratory preview route", () => {
    expect(getLessonDraftUrl("alfabeto/primeiros-passos/o-que-e")).toBe(
      "/laboratorio/licoes/alfabeto/primeiros-passos/o-que-e",
    );
  });
});
