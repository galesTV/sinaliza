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
  clampLabelX,
  CONSTELLATION_HIT_RADIUS,
  constellationDust,
  constellationSize,
  projectConstellation,
  starPosition,
  trailVariant,
  wrapStarLabel,
} from "./constellation";

/**
 * Same catalog fixture strategy as progression.test.ts: synthetic
 * publishable entries are appended and rolled back after each test, so
 * the live catalog is never mutated — and no assertion depends on what
 * is or isn't published in the real catalog.
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

/** Register completability for every `available` lesson of `path`. */
function publishAvailable(path: LearningPath): LearningPath {
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

/**
 * Synthetic path whose modules cover every state under `completed`:
 * mod-um walked (both completable lessons done), mod-dois in_progress,
 * mod-tres available, mod-quatro preparation (all planned).
 */
function makePath(): LearningPath {
  return {
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
}

function makeAllPlannedPath(): LearningPath {
  const path = makePath();
  for (const courseModule of path.modules) {
    courseModule.lessons = [planned("l1")];
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
    expect(constellationSize(1).width).toBeLessThan(constellationSize(3).width);
    expect(constellationSize(4).height).toBeGreaterThan(
      constellationSize(3).height,
    );
  });

  it("widens with capacity for layouts that can afford it", () => {
    expect(constellationSize(6, 6).width).toBeGreaterThan(
      constellationSize(6, 3).width,
    );
    expect(constellationSize(6, 6).height).toBeLessThan(
      constellationSize(6, 3).height,
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
    expect(firstOfRowOne.x).toBeGreaterThan(starPosition(4, 174).x);
  });

  it("flips the wave for the other silhouette variant", () => {
    const a = starPosition(0, 174, 3, 0);
    const b = starPosition(0, 174, 3, 1);
    expect(a.labelAbove).not.toBe(b.labelAbove);
    expect(a.y).not.toBe(b.y);
    expect(a.x).toBe(b.x);
  });
});

describe("trailVariant", () => {
  it("is deterministic and returns only 0 or 1", () => {
    for (const slug of ["alfabeto", "vocabulario", "trilha-teste"]) {
      const variant = trailVariant(slug);
      expect(trailVariant(slug)).toBe(variant);
      expect([0, 1]).toContain(variant);
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
  });

  it("hard-breaks words longer than maxChars and never emits empty lines", () => {
    const lines = wrapStarLabel("Anticonstitucionalissimamente legal");
    expect(lines.length).toBeLessThanOrEqual(2);
    expect(lines.every((line) => line.length > 0)).toBe(true);
    expect(lines.every((line) => line.length <= 15)).toBe(true);
  });

  it("marks truncated tails with an ellipsis on the second line", () => {
    const lines = wrapStarLabel("Um título muito muito muito longo mesmo");
    expect(lines).toHaveLength(2);
    expect(lines[1].endsWith("…")).toBe(true);
  });
});

describe("clampLabelX", () => {
  it("keeps every label fully inside the viewBox", () => {
    // Near the left edge, the label center shifts right; near the right
    // edge it shifts left; in the middle it stays on the star.
    expect(clampLabelX(29, 14, 174)).toBeCloseTo(43.2, 0);
    expect(clampLabelX(145, 14, 174)).toBeCloseTo(130.8, 0);
    expect(clampLabelX(87, 8, 174)).toBeCloseTo(87, 0);
  });
});

describe("projectConstellation", () => {
  it("is a deterministic projection of the same inputs", () => {
    const path = publishAvailable(makePath());
    const completed = ALL_DONE(path);
    expect(projectConstellation(path, completed, false)).toEqual(
      projectConstellation(path, completed, false),
    );
  });

  it("keeps stable identities and the catalog's editorial order", () => {
    const path = publishAvailable(makePath());
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
    const path = publishAvailable(makePath());
    const group = projectConstellation(path, ALL_DONE(path), false);
    expect(group.stars.map((s) => s.state)).toEqual([
      "walked",
      "in_progress",
      "available",
      "preparation",
    ]);
  });

  it("covers a catalog fully in preparation", () => {
    const group = projectConstellation(makeAllPlannedPath(), new Set(), false);
    expect(allInPreparation(group)).toBe(true);
    expect(group.hasPending).toBe(false);
    expect(group.edges.every((e) => !e.walked)).toBe(true);
  });

  it("covers a partially published catalog", () => {
    const path = makePath();
    // Only mod-tres gets a publishable entry → eligible without completion.
    lessonCatalog.push(
      publishableEntry(lessonKey(path.slug, "mod-tres", "l1")),
    );
    const group = projectConstellation(path, new Set(), false);
    expect(group.stars.map((s) => s.state)).toEqual([
      "preparation",
      "preparation",
      "available",
      "preparation",
    ]);
    expect(allInPreparation(group)).toBe(false);
  });

  it("does not light a star for a stale completion of an ineligible lesson", () => {
    const path = makePath();
    const completed = new Set([lessonKey(path.slug, "mod-quatro", "l1")]);
    const group = projectConstellation(path, completed, false);
    expect(group.stars[3].state).toBe("preparation");
  });

  it("reflects an eligibility change, not the stored record", () => {
    const path = makePath();
    const key = lessonKey(path.slug, "mod-tres", "l1");
    lessonCatalog.push(publishableEntry(key));
    const completed = new Set([key]);
    expect(projectConstellation(path, completed, false).stars[2].state).toBe(
      "walked",
    );
    lessonCatalog.splice(
      lessonCatalog.findIndex((entry) => entry.lessonKey === key),
      1,
    );
    expect(projectConstellation(path, completed, false).stars[2].state).toBe(
      "preparation",
    );
  });

  it("connects only consecutive stars — editorial sequence, not prerequisites", () => {
    const path = publishAvailable(makePath());
    const group = projectConstellation(path, ALL_DONE(path), false);
    expect(group.edges.map((e) => [e.from, e.to])).toEqual([
      [0, 1],
      [1, 2],
      [2, 3],
    ]);
  });

  it("lights an edge only when both adjacent modules are walked", () => {
    const path = publishAvailable(makePath());
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
    const path = publishAvailable(makePath());
    const group = projectConstellation(path, ALL_DONE(path), true);
    expect(group.stars[3].pending).toBe(false);
    expect(group.stars[0].pending).toBe(true);
    expect(group.stars[1].pending).toBe(true);
    expect(group.stars[2].pending).toBe(true);
    expect(group.hasPending).toBe(true);
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

  it("keeps labels inside the viewBox on every projected star", () => {
    const path = publishAvailable(makePath());
    for (const capacity of [3, 6]) {
      const group = projectConstellation(path, ALL_DONE(path), false, capacity);
      for (const star of group.stars) {
        const half =
          (Math.max(...star.labelLines.map((l) => l.length)) * 5.6) / 2;
        expect(star.labelX - half).toBeGreaterThanOrEqual(3);
        expect(star.labelX + half).toBeLessThanOrEqual(group.width - 3);
      }
    }
  });

  it("produces a different silhouette for a different variant", () => {
    const path = publishAvailable(makePath());
    const base = projectConstellation(path, new Set(), false);
    const flipped = projectConstellation(
      { ...path, slug: "outra-trilha" },
      new Set(),
      false,
    );
    // Same module count, deterministic — but wave phase may differ.
    expect(base.stars.length).toBe(flipped.stars.length);
    if (base.variant !== flipped.variant) {
      expect(base.stars[0].labelAbove).not.toBe(
        flipped.stars[0].labelAbove,
      );
    }
  });
});

describe("constellationDust", () => {
  it("returns only dots outside every star's hit circle", () => {
    const path = publishAvailable(makePath());
    const group = projectConstellation(path, ALL_DONE(path), false);
    for (const dot of constellationDust(group)) {
      for (const star of group.stars) {
        expect(Math.hypot(star.x - dot.x, star.y - dot.y)).toBeGreaterThan(
          CONSTELLATION_HIT_RADIUS,
        );
      }
    }
  });
});

describe("catalog invariants", () => {
  it("star count equals module count for every real path", () => {
    for (const path of getLearningPaths()) {
      const group = projectConstellation(path, new Set(), false);
      expect(group.stars.length).toBe(path.modules.length);
      expect(group.edges.length).toBe(Math.max(0, path.modules.length - 1));
    }
  });
});
