import { describe, expect, it } from "vitest";

import {
  getLearningPath,
  getLearningPaths,
  getPathStats,
} from "./learning-paths";
import { getCatalogEntry, isPublishable } from "./lesson-catalog";
import { lessonKey } from "@/lib/progress";

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

  it("requires a publishable catalog entry for every available lesson", () => {
    // Closing the status-flip gap: marking a lesson "available" is only
    // legitimate when the catalog carries the full validation evidence —
    // otherwise the page would promise content that never passed review.
    for (const path of getLearningPaths()) {
      for (const mod of path.modules) {
        for (const lesson of mod.lessons) {
          if (lesson.status !== "available") continue;
          const key = lessonKey(path.slug, mod.slug, lesson.slug);
          const entry = getCatalogEntry(key);
          expect(
            entry,
            `available lesson "${key}" has no catalog entry`,
          ).toBeDefined();
          expect(
            isPublishable(entry!),
            `available lesson "${key}" lacks expert validation evidence`,
          ).toBe(true);
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
