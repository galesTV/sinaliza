import { describe, expect, it } from "vitest";

import { parseLessonKey } from "@/lib/progress";

import { getLessonContext, getLearningPaths } from "./learning-paths";
import {
  demoLesson,
  getLessonContent,
  lessonContents,
  type LessonContent,
} from "./lesson-content";

/**
 * Well-formedness rules the runner relies on to be completable: every
 * exercise needs at least two options, an in-bounds `correctIndex` and
 * populated feedback/explanation, and text blocks need real copy. A
 * malformed entry would silently make a lesson impossible to finish.
 */
function expectValidLessonContent(
  content: LessonContent,
  label: string,
): void {
  expect(content.intro.trim().length, `${label}: intro`).toBeGreaterThan(0);
  expect(content.blocks.length, `${label}: blocks`).toBeGreaterThan(0);

  for (const block of content.blocks) {
    if (block.kind === "text") {
      expect(block.heading.trim().length, `${label}: heading`).toBeGreaterThan(
        0,
      );
      expect(block.body.trim().length, `${label}: body`).toBeGreaterThan(0);
      continue;
    }

    const { prompt, options, correctIndex, explanation } = block.exercise;
    expect(prompt.trim().length, `${label}: prompt`).toBeGreaterThan(0);
    expect(options.length, `${label}: options`).toBeGreaterThanOrEqual(2);
    expect(correctIndex, `${label}: correctIndex`).toBeGreaterThanOrEqual(0);
    expect(correctIndex, `${label}: correctIndex`).toBeLessThan(
      options.length,
    );
    expect(explanation.trim().length, `${label}: explanation`).toBeGreaterThan(
      0,
    );
    for (const option of options) {
      expect(option.label.trim().length, `${label}: option`).toBeGreaterThan(
        0,
      );
      expect(
        option.feedback.trim().length,
        `${label}: option feedback`,
      ).toBeGreaterThan(0);
    }
  }
}

describe("lessonContents registry", () => {
  it("only registers real lessons published as available", () => {
    for (const key of Object.keys(lessonContents)) {
      const parsed = parseLessonKey(key);
      expect(parsed, `malformed lesson key "${key}"`).not.toBeNull();

      const context = getLessonContext(
        parsed!.pathSlug,
        parsed!.moduleSlug,
        parsed!.lessonSlug,
      );
      expect(context, `no lesson matches "${key}"`).toBeDefined();
      expect(
        context!.lesson.status,
        `"${key}" has content but its lesson is not "available"`,
      ).toBe("available");
    }
  });

  it("contains only well-formed, completable lesson content", () => {
    for (const [key, content] of Object.entries(lessonContents)) {
      expectValidLessonContent(content, key);
    }
  });
});

describe("getLessonContent", () => {
  it("returns the registered content for every registry key", () => {
    for (const [key, content] of Object.entries(lessonContents)) {
      const parsed = parseLessonKey(key)!;
      expect(
        getLessonContent(parsed.pathSlug, parsed.moduleSlug, parsed.lessonSlug),
      ).toBe(content);
    }
  });

  it("returns undefined for unknown or content-less lessons", () => {
    expect(getLessonContent("nao", "existe", "aqui")).toBeUndefined();
    // Lessons without a registry entry stay on the honest pending states.
    const planned = getLearningPaths().flatMap((path) =>
      path.modules.flatMap((mod) =>
        mod.lessons
          .filter((lesson) => lesson.status === "planned")
          .map((lesson) => ({ path, mod, lesson })),
      ),
    );
    for (const { path, mod, lesson } of planned) {
      expect(
        getLessonContent(path.slug, mod.slug, lesson.slug),
      ).toBeUndefined();
    }
  });
});

describe("demoLesson", () => {
  it("exercises every block kind the runner supports", () => {
    const kinds = new Set(demoLesson.blocks.map((block) => block.kind));
    expect(kinds).toEqual(new Set(["text", "exercise"]));
  });

  it("keeps every exercise answer inside its own option list", () => {
    expectValidLessonContent(demoLesson, "demoLesson");
  });
});
