import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { LearningPath, Lesson } from "@/data/learning-paths";
import { getLearningPaths } from "@/data/learning-paths";
import {
  lessonCatalog,
  type LessonCatalogEntry,
  type LessonReview,
} from "@/data/lesson-catalog";
import type { LessonContent } from "@/data/lesson-content";
import { lessonKey } from "@/lib/progress";

import {
  allInPreparation,
  constellationSize,
  projectConstellation,
  starPosition,
  wrapStarLabel,
} from "./constellation";

/**
 * Same catalog fixture strategy as progression.test.ts: synthetic
 * publishable entries are appended and rolled back after each test, so
 * the live catalog is never mutated.
 */
let catalogLength = lessonCatalog.length;
beforeEach(() => {
  catalogLength = lessonCatalog.length;
});
afterEach(() => {
  lessonCatalog.length = catalogLength;
});

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

function publishableEntry(key: string): LessonCatalogEntry {
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
    validationStatus: "expert-validated",
    version: "draft-1",
    reviews: [
      makeReview("research"),
      makeReview("technical"),
      makeReview("expert"),
    ],
    draft: testContent,
  };
}

const planned = (slug: string): Lesson => ({
  slug,
  title: slug.toUpperCase(),
  status: "planned",
  objective: "",
});
const available = (slug: string): Lesson => ({
  ...planned(slug),
  status: "available",
});

/**
 * Synthetic path whose modules cover every state under `completed`:
 * mod-um walked (both completable lessons done), mod-dois in_progress,
 * mod-tres available, mod-quatro preparation (all planned).
 */
function makePath(): LearningPath {
  const path: LearningPath = {
    slug: "trilha-teste",
    title: "Trilha teste",
    summary: "",
    goal: "",
    icon: "alphabet",
    contentNote: "",
    modules: [
      {
        slug: "mod-um",
        title: "Módulo um",
        description: "",
        lessons: [available("l1"), available("l2")],
      },
      {
        slug: "mod-dois",
        title: "Módulo dois",
        description: "",
        lessons: [available("l1"), available("l2")],
      },
      {
        slug: "mod-tres",
        title: "Módulo três",
        description: "",
        lessons: [available("l1")],
      },
      {
        slug: "mod-quatro",
        title: "Módulo quatro",
        description: "",
        lessons: [planned("l1")],
      },
    ],
  };
  for (const courseModule of path.modules) {
    for (const lesson of courseModule.lessons) {
      if (lesson.status === "available") {
        lessonCatalog.push(
          publishableEntry(lessonKey(path.slug, courseModule.slug, lesson.slug)),
        );
      }
    }
  }
  return path;
}

const ALL_DONE = (path: LearningPath) =>
  new Set([
    lessonKey(path.slug, "mod-um", "l1"),
    lessonKey(path.slug, "mod-um", "l2"),
    lessonKey(path.slug, "mod-dois", "l1"),
  ]);

describe("constellationSize", () => {
  it("is deterministic and grows with star count, never fixed to the catalog", () => {
    expect(constellationSize(0)).toEqual(constellationSize(0));
    expect(constellationSize(1).width).toBeLessThan(constellationSize(6).width);
    expect(constellationSize(1).height).toBeLessThan(
      constellationSize(7).height,
    );
    expect(constellationSize(7).width).toEqual(constellationSize(3).width);
    expect(constellationSize(4).height).toBeGreaterThan(
      constellationSize(3).height,
    );
  });
});

describe("starPosition", () => {
  it("alternates the wave and the label side", () => {
    const first = starPosition(0, 348);
    const second = starPosition(1, 348);
    expect(first.labelAbove).toBe(true);
    expect(second.labelAbove).toBe(false);
    expect(first.y).toBeLessThan(second.y);
    expect(second.x).toBeGreaterThan(first.x);
  });

  it("reverses direction on the second row (serpentine)", () => {
    const lastOfRowZero = starPosition(2, 174);
    const firstOfRowOne = starPosition(3, 174);
    expect(firstOfRowOne.y).toBeGreaterThan(lastOfRowZero.y);
    // second row runs right-to-left: index 3 sits under index 2.
    expect(firstOfRowOne.x).toBeGreaterThan(starPosition(4, 174).x);
  });
});

describe("projectConstellation", () => {
  it("is a deterministic projection of the same inputs", () => {
    const path = makePath();
    const completed = ALL_DONE(path);
    expect(projectConstellation(path, completed, false)).toEqual(
      projectConstellation(path, completed, false),
    );
  });

  it("keeps stable identities and the catalog's editorial order", () => {
    const path = makePath();
    const group = projectConstellation(path, ALL_DONE(path), false);
    expect(group.stars.map((s) => s.key)).toEqual([
      "trilha-teste/mod-um",
      "trilha-teste/mod-dois",
      "trilha-teste/mod-tres",
      "trilha-teste/mod-quatro",
    ]);
    expect(group.stars[0].href).toBe("/trilhas/trilha-teste#mod-um");
  });

  it("derives the four module states without duplicating eligibility rules", () => {
    const path = makePath();
    const group = projectConstellation(path, ALL_DONE(path), false);
    expect(group.stars.map((s) => s.state)).toEqual([
      "walked",
      "in_progress",
      "available",
      "preparation",
    ]);
  });

  it("does not light a star for a stale completion of an ineligible lesson", () => {
    const path = makePath();
    // Recorded completion of a planned (never completable) lesson.
    const completed = new Set([lessonKey(path.slug, "mod-quatro", "l1")]);
    const group = projectConstellation(path, completed, false);
    expect(group.stars[3].state).toBe("preparation");
  });

  it("reflects an eligibility change, not the stored record", () => {
    const path = makePath();
    const key = lessonKey(path.slug, "mod-tres", "l1");
    const completed = new Set([key]);
    expect(
      projectConstellation(path, completed, false).stars[2].state,
    ).toBe("walked");
    // The catalog entry disappears → the module can no longer be completable.
    lessonCatalog.splice(
      lessonCatalog.findIndex((entry) => entry.lessonKey === key),
      1,
    );
    expect(
      projectConstellation(path, completed, false).stars[2].state,
    ).toBe("preparation");
  });

  it("connects only consecutive stars — editorial sequence, not prerequisites", () => {
    const path = makePath();
    const group = projectConstellation(path, ALL_DONE(path), false);
    expect(group.edges.map((e) => [e.from, e.to])).toEqual([
      [0, 1],
      [1, 2],
      [2, 3],
    ]);
  });

  it("lights an edge only when both adjacent modules are walked", () => {
    const path = makePath();
    const walkedTwo = new Set([
      lessonKey(path.slug, "mod-um", "l1"),
      lessonKey(path.slug, "mod-um", "l2"),
      lessonKey(path.slug, "mod-dois", "l1"),
      lessonKey(path.slug, "mod-dois", "l2"),
    ]);
    const group = projectConstellation(path, walkedTwo, false);
    expect(group.edges.map((e) => e.walked)).toEqual([true, false, false]);
  });

  it("hides personal states during loading but keeps catalog facts", () => {
    const path = makePath();
    const group = projectConstellation(path, ALL_DONE(path), true);
    // preparation is a catalog fact — never pending.
    expect(group.stars[3].pending).toBe(false);
    // eligible stars withhold their personal state while resolving.
    expect(group.stars[0].pending).toBe(true);
    expect(group.stars[1].pending).toBe(true);
    expect(group.stars[2].pending).toBe(true);
    // and no edge may light while loading.
    expect(group.edges.every((e) => !e.walked)).toBe(true);
  });

  it("handles zero, one, and many modules", () => {
    const path = makePath();
    const empty = { ...path, modules: [] };
    expect(projectConstellation(empty, new Set(), false).stars).toHaveLength(0);
    const single = { ...path, modules: [path.modules[0]] };
    const singleGroup = projectConstellation(single, new Set(), false);
    expect(singleGroup.stars).toHaveLength(1);
    expect(singleGroup.edges).toHaveLength(0);
    const many = { ...path, modules: [...path.modules, ...path.modules, ...path.modules] };
    expect(projectConstellation(many, new Set(), false).stars).toHaveLength(12);
  });
});

describe("allInPreparation", () => {
  it("is true for the real catalog today — zero completable lessons", () => {
    for (const path of getLearningPaths()) {
      const group = projectConstellation(path, new Set(), false);
      expect(allInPreparation(group)).toBe(true);
      expect(group.stars.length).toBe(
        path.modules.length,
      );
    }
  });
});

describe("wrapStarLabel", () => {
  it("keeps short titles on one line and wraps long ones to two", () => {
    expect(wrapStarLabel("Saudações")).toEqual(["Saudações"]);
    expect(wrapStarLabel("Expressões cotidianas")).toEqual([
      "Expressões",
      "cotidianas",
    ]);
    expect(wrapStarLabel("Um título muito muito muito longo mesmo")).toEqual([
      "Um título muito",
      "muito muito…",
    ]);
  });
});
