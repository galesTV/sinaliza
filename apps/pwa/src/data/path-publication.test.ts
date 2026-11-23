import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getLearningPaths, type LearningPath } from "./learning-paths";
import {
  lessonCatalog,
  type LessonCatalogEntry,
  type LessonReview,
} from "./lesson-catalog";
import type { LessonContent } from "./lesson-content";
import { getPathPublicationSummary, isLessonCompletable } from "./path-publication";

/**
 * Synthetic entries pushed by these tests are appended to the catalog and
 * rolled back after each test, so the live catalog is never mutated.
 */
let catalogLength = lessonCatalog.length;
beforeEach(() => {
  catalogLength = lessonCatalog.length;
});
afterEach(() => {
  lessonCatalog.length = catalogLength;
});

const SYNTHETIC_PATH: LearningPath = {
  slug: "sintetica",
  title: "Trilha sintética",
  summary: "Resumo sintético",
  goal: "Objetivo sintético",
  icon: "alphabet",
  contentNote: "",
  modules: [
    {
      slug: "modulo",
      title: "Módulo sintético",
      description: "",
      lessons: [
        {
          slug: "publicada",
          title: "Publicada",
          status: "available",
          objective: "",
        },
        {
          slug: "em-revisao",
          title: "Em revisão",
          status: "available",
          objective: "",
        },
        {
          slug: "planejada",
          title: "Planejada",
          status: "planned",
          objective: "",
        },
        {
          slug: "aprovada-nao-liberada",
          title: "Aprovada, não liberada",
          status: "planned",
          objective: "",
        },
      ],
    },
  ],
};

const testContent: LessonContent = {
  intro: "Introdução da lição.",
  blocks: [{ kind: "text", heading: "Passo único", body: "texto" }],
};

function makeReview(type: LessonReview["type"]): LessonReview {
  return {
    reviewer: `Revisor ${type}`,
    type,
    date: "2026-11-18",
    version: "draft-1",
  };
}

function makeCatalogEntry(
  key: string,
  overrides: Partial<LessonCatalogEntry> = {},
): LessonCatalogEntry {
  return {
    id: `teste-${key}`,
    lessonKey: key,
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

function publishableEntry(key: string): LessonCatalogEntry {
  return makeCatalogEntry(key, {
    validationStatus: "expert-validated",
    reviews: [makeReview("research"), makeReview("technical"), makeReview("expert")],
    draft: testContent,
  });
}

describe("isLessonCompletable", () => {
  const KEY = "sintetica/modulo/publicada";

  it("is false for a planned lesson even with a publishable entry", () => {
    lessonCatalog.push(
      publishableEntry("sintetica/modulo/aprovada-nao-liberada"),
    );
    expect(
      isLessonCompletable("sintetica/modulo/aprovada-nao-liberada", "planned"),
    ).toBe(false);
  });

  it("is false for an available lesson with no catalog entry", () => {
    expect(isLessonCompletable(KEY, "available")).toBe(false);
  });

  it("is false for an available lesson whose entry is still a draft", () => {
    lessonCatalog.push(makeCatalogEntry(KEY, { draft: testContent }));
    expect(isLessonCompletable(KEY, "available")).toBe(false);
  });

  it("is false for an available lesson with an incomplete review chain", () => {
    lessonCatalog.push(
      makeCatalogEntry(KEY, {
        validationStatus: "expert-validated",
        reviews: [makeReview("research")], // technical + expert missing
        draft: testContent,
      }),
    );
    expect(isLessonCompletable(KEY, "available")).toBe(false);
  });

  it("is false for an available lesson with reviews on a stale version", () => {
    lessonCatalog.push(
      makeCatalogEntry(KEY, {
        validationStatus: "expert-validated",
        version: "draft-2",
        reviews: [
          { ...makeReview("research"), version: "draft-1" },
          { ...makeReview("technical"), version: "draft-1" },
          { ...makeReview("expert"), version: "draft-1" },
        ],
        draft: testContent,
      }),
    );
    expect(isLessonCompletable(KEY, "available")).toBe(false);
  });

  it("is false for an available lesson whose draft fails content validation", () => {
    lessonCatalog.push(
      makeCatalogEntry(KEY, {
        validationStatus: "expert-validated",
        reviews: [
          makeReview("research"),
          makeReview("technical"),
          makeReview("expert"),
        ],
        draft: { intro: "", blocks: [] },
      }),
    );
    expect(isLessonCompletable(KEY, "available")).toBe(false);
  });

  it("is true for an available lesson with a publishable entry", () => {
    lessonCatalog.push(publishableEntry(KEY));
    expect(isLessonCompletable(KEY, "available")).toBe(true);
  });
});

describe("getPathPublicationSummary", () => {
  it("accounts for every lesson in each path", () => {
    for (const path of getLearningPaths()) {
      const summary = getPathPublicationSummary(path);
      const expected = path.modules.reduce(
        (total, mod) => total + mod.lessons.length,
        0,
      );
      expect(summary.total).toBe(expected);
      expect(
        summary.published + summary.inReview + summary.planned,
      ).toBe(summary.total);
    }
  });

  it("reflects the current catalog state without hardcoding", () => {
    // No lesson has completed expert validation yet: published must be
    // derived as zero, never asserted by hand.
    for (const path of getLearningPaths()) {
      const summary = getPathPublicationSummary(path);
      expect(summary.published).toBe(0);
      expect(summary.planned + summary.inReview).toBe(summary.total);
    }

    const alfabeto = getLearningPaths().find((p) => p.slug === "alfabeto")!;
    const summary = getPathPublicationSummary(alfabeto);
    // The catalog currently holds draft material for the first module.
    expect(summary.inReview).toBeGreaterThan(0);
    expect(summary.planned).toBe(summary.total - summary.inReview);
  });

  it("counts a synthetic published lesson under the same page rule", () => {
    // publicada: available + publishable entry -> published
    // em-revisao: available + non-publishable draft -> inReview (not published)
    // aprovada-nao-liberada: publishable entry but status planned -> inReview,
    //   NOT published (proves the availability check is load-bearing)
    // planejada: planned + no catalog entry -> planned
    lessonCatalog.push(
      publishableEntry("sintetica/modulo/publicada"),
      publishableEntry("sintetica/modulo/aprovada-nao-liberada"),
      makeCatalogEntry("sintetica/modulo/em-revisao", { draft: testContent }),
    );

    const summary = getPathPublicationSummary(SYNTHETIC_PATH);
    expect(summary.total).toBe(4);
    expect(summary.published).toBe(1);
    expect(summary.inReview).toBe(2);
    expect(summary.planned).toBe(1);
  });

  it("does not count an available lesson whose entry is not publishable", () => {
    // Expert-validated but reviews are on an older version: isPublishable
    // rejects it, so the lesson cannot count as published even with
    // status "available".
    lessonCatalog.push(
      makeCatalogEntry("sintetica/modulo/publicada", {
        validationStatus: "expert-validated",
        version: "draft-2",
        reviews: [
          { ...makeReview("research"), version: "draft-1" },
          { ...makeReview("technical"), version: "draft-1" },
          { ...makeReview("expert"), version: "draft-1" },
        ],
        draft: testContent,
      }),
    );

    const summary = getPathPublicationSummary(SYNTHETIC_PATH);
    expect(summary.published).toBe(0);
    // The stale-reviewed entry still has a draft: it counts as in review.
    // The other three lessons have no catalog entry: they count as planned.
    expect(summary.inReview).toBe(1);
    expect(summary.planned).toBe(3);
  });
});
