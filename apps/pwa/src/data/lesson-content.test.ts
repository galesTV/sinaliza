import { describe, expect, it } from "vitest";

import { parseLessonKey } from "@/lib/progress";

import { getLessonContext, getLearningPaths } from "./learning-paths";
import {
  demoLesson,
  getLessonContent,
  lessonContents,
} from "./lesson-content";

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
    for (const block of demoLesson.blocks) {
      if (block.kind !== "exercise") continue;
      const { options, correctIndex } = block.exercise;
      expect(correctIndex).toBeGreaterThanOrEqual(0);
      expect(correctIndex).toBeLessThan(options.length);
      for (const option of options) {
        expect(option.feedback.length).toBeGreaterThan(0);
      }
    }
  });
});
