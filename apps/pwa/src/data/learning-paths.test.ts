import { describe, expect, it } from "vitest";

import {
  getLearningPath,
  getLearningPaths,
  getPathStats,
} from "./learning-paths";

describe("learning paths data", () => {
  it("exposes the alphabet and vocabulary paths", () => {
    const slugs = getLearningPaths().map((path) => path.slug);
    expect(slugs).toEqual(["alfabeto", "vocabulario"]);
  });

  it("has unique slugs for paths, modules and lessons", () => {
    const slugs = getLearningPaths().flatMap((path) => [
      path.slug,
      ...path.modules.flatMap((mod) => [
        mod.slug,
        ...mod.lessons.map((lesson) => lesson.slug),
      ]),
    ]);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("marks every lesson as planned or available", () => {
    for (const path of getLearningPaths()) {
      for (const mod of path.modules) {
        for (const lesson of mod.lessons) {
          expect(["planned", "available"]).toContain(lesson.status);
        }
      }
    }
  });

  it("covers all 26 letters of the manual alphabet", () => {
    const alphabet = getLearningPath("alfabeto");
    const letters = alphabet?.modules
      .flatMap((mod) => mod.lessons)
      .filter((lesson) => lesson.slug.startsWith("letra-"));
    expect(letters).toHaveLength(26);
  });

  it("returns undefined for unknown path slugs", () => {
    expect(getLearningPath("nao-existe")).toBeUndefined();
  });
});

describe("getPathStats", () => {
  it("counts modules and lessons", () => {
    const vocabulary = getLearningPath("vocabulario");
    expect(vocabulary).toBeDefined();
    const stats = getPathStats(vocabulary!);
    expect(stats.moduleCount).toBe(6);
    expect(stats.lessonCount).toBe(
      vocabulary!.modules.reduce(
        (total, mod) => total + mod.lessons.length,
        0,
      ),
    );
    expect(stats.lessonCount).toBeGreaterThan(0);
  });
});
