import { describe, expect, it } from "vitest";

import type { LearningPath, Lesson } from "@/data/learning-paths";
import { getLearningPaths } from "@/data/learning-paths";

import { createProgressStore, lessonKey } from "./progress";
import {
  getNextLesson,
  getPathProgress,
  getResumeLesson,
} from "./progression";

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
 * Fixture path: the real catalog is all-"planned" today, so availability
 * behavior is exercised against a synthetic path that mirrors its shape.
 */
function makePath(): LearningPath {
  return {
    slug: "alfabeto-teste",
    title: "Alfabeto teste",
    summary: "",
    goal: "",
    icon: "alphabet",
    contentNote: "",
    modules: [
      {
        slug: "mod-um",
        title: "Módulo um",
        description: "",
        lessons: [available("l1"), available("l2"), planned("l3")],
      },
      {
        slug: "mod-dois",
        title: "Módulo dois",
        description: "",
        lessons: [available("l4")],
      },
    ],
  };
}

const KEY_L1 = lessonKey("alfabeto-teste", "mod-um", "l1");
const KEY_L2 = lessonKey("alfabeto-teste", "mod-um", "l2");
const KEY_L3 = lessonKey("alfabeto-teste", "mod-um", "l3");
const KEY_L4 = lessonKey("alfabeto-teste", "mod-dois", "l4");

describe("getPathProgress", () => {
  it("reports zero completions with no progress", () => {
    const progress = getPathProgress(makePath(), new Set());
    expect(progress).toEqual({
      completedCount: 0,
      availableCount: 3,
      lessonCount: 4,
      ratio: 0,
    });
  });

  it("counts only completed lessons of this path", () => {
    const completed = new Set([
      KEY_L1,
      lessonKey("outra-trilha", "mod", "l1"), // foreign path: ignored
      "lixo-sem-formato", // malformed: ignored
    ]);
    const progress = getPathProgress(makePath(), completed);
    expect(progress.completedCount).toBe(1);
    expect(progress.ratio).toBeCloseTo(1 / 3);
  });

  it("ignores a planned lesson even when its key is recorded", () => {
    const progress = getPathProgress(makePath(), new Set([KEY_L3]));
    expect(progress.completedCount).toBe(0);
    expect(progress.availableCount).toBe(3);
  });

  it("returns a null ratio when the path has no available lessons", () => {
    const allPlanned: LearningPath = {
      ...makePath(),
      modules: [
        {
          slug: "m",
          title: "",
          description: "",
          lessons: [planned("p1"), planned("p2")],
        },
      ],
    };
    const progress = getPathProgress(allPlanned, new Set());
    expect(progress.availableCount).toBe(0);
    expect(progress.ratio).toBeNull();
  });

  it("reaches ratio 1 when every available lesson is completed", () => {
    const progress = getPathProgress(
      makePath(),
      new Set([KEY_L1, KEY_L2, KEY_L4]),
    );
    expect(progress.completedCount).toBe(3);
    expect(progress.ratio).toBe(1);
  });
});

describe("getNextLesson", () => {
  it("returns the first available lesson when nothing is completed", () => {
    const target = getNextLesson(makePath(), new Set());
    expect(target?.lesson.slug).toBe("l1");
    expect(target?.module.slug).toBe("mod-um");
    expect(target?.url).toBe("/trilhas/alfabeto-teste/mod-um/l1");
  });

  it("skips completed lessons in path order", () => {
    const target = getNextLesson(makePath(), new Set([KEY_L1]));
    expect(target?.lesson.slug).toBe("l2");
  });

  it("moves to the next module after completing the previous one", () => {
    const target = getNextLesson(makePath(), new Set([KEY_L1, KEY_L2]));
    expect(target?.lesson.slug).toBe("l4");
    expect(target?.module.slug).toBe("mod-dois");
  });

  it("never resumes into a planned lesson", () => {
    // l1 and l2 done; l3 is planned and must be skipped for l4.
    const target = getNextLesson(makePath(), new Set([KEY_L1, KEY_L2]));
    expect(target?.lesson.slug).not.toBe("l3");
  });

  it("returns undefined when every available lesson is completed", () => {
    const target = getNextLesson(
      makePath(),
      new Set([KEY_L1, KEY_L2, KEY_L4]),
    );
    expect(target).toBeUndefined();
  });

  it("returns undefined when every lesson is planned", () => {
    const realAlphabet = getLearningPaths()[0];
    const progress = getPathProgress(realAlphabet, new Set());
    expect(progress.availableCount).toBe(0);
    expect(getNextLesson(realAlphabet, new Set())).toBeUndefined();
  });

  it("ignores unknown or foreign keys entirely", () => {
    const target = getNextLesson(
      makePath(),
      new Set(["a/b/c", lessonKey("alfabeto-teste", "mod-um", "fantasma")]),
    );
    expect(target?.lesson.slug).toBe("l1");
  });
});

describe("getResumeLesson", () => {
  it("resumes in the first path that still has an incomplete lesson", () => {
    const first = makePath();
    const second: LearningPath = {
      ...makePath(),
      slug: "vocabulario-teste",
      modules: [
        {
          slug: "v1",
          title: "",
          description: "",
          lessons: [available("v-l1")],
        },
      ],
    };

    // First path fully done → resume lands on the second path.
    const target = getResumeLesson(
      [first, second],
      new Set([KEY_L1, KEY_L2, KEY_L4]),
    );
    expect(target?.path.slug).toBe("vocabulario-teste");
    expect(target?.lesson.slug).toBe("v-l1");
    expect(target?.url).toBe("/trilhas/vocabulario-teste/v1/v-l1");
  });

  it("returns undefined when no path has an available incomplete lesson", () => {
    expect(getResumeLesson(getLearningPaths(), new Set())).toBeUndefined();
  });

  it("resumes from progress restored out of persisted storage", () => {
    const storage = {
      getItem: () =>
        JSON.stringify({ version: 1, completed: [KEY_L1, KEY_L2] }),
      setItem: () => {},
    };
    const store = createProgressStore({ storage });
    const target = getResumeLesson(
      [makePath()],
      store.getSnapshot().completed,
    );
    expect(target?.lesson.slug).toBe("l4");
  });
});
