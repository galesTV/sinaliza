import { describe, expect, it } from "vitest";

import {
  getLearningPaths,
  getLessonContext,
  getLessonUrl,
} from "./learning-paths";

describe("getLessonContext", () => {
  it("resolves every registered lesson to a context", () => {
    for (const path of getLearningPaths()) {
      for (const mod of path.modules) {
        for (const lesson of mod.lessons) {
          const context = getLessonContext(
            path.slug,
            mod.slug,
            lesson.slug,
          );
          expect(context?.lesson).toBe(lesson);
          expect(context?.path).toBe(path);
          expect(context?.module).toBe(mod);
        }
      }
    }
  });

  it("returns undefined for unknown slugs at every level", () => {
    expect(
      getLessonContext("nao-existe", "saudacoes", "ola"),
    ).toBeUndefined();
    expect(
      getLessonContext("vocabulario", "nao-existe", "ola"),
    ).toBeUndefined();
    expect(
      getLessonContext("vocabulario", "saudacoes", "nao-existe"),
    ).toBeUndefined();
  });

  it("reports the 1-based position inside the module", () => {
    const context = getLessonContext("vocabulario", "saudacoes", "boa-tarde");
    expect(context?.position).toBe(3);
    expect(context?.lessonCount).toBe(7);
  });

  it("walks previous/next in module order", () => {
    const context = getLessonContext("vocabulario", "saudacoes", "boa-tarde");
    expect(context?.previous?.slug).toBe("bom-dia");
    expect(context?.next?.slug).toBe("boa-noite");
  });

  it("does not link past the first or last lesson", () => {
    const first = getLessonContext(
      "alfabeto",
      "primeiros-passos",
      "o-que-e",
    );
    expect(first?.previous).toBeUndefined();
    expect(first?.next?.slug).toBe("quando-usar");

    const last = getLessonContext("alfabeto", "letras-u-z", "letra-z");
    expect(last?.next).toBeUndefined();
    expect(last?.previous?.slug).toBe("letra-y");
  });
});

describe("getLessonUrl", () => {
  it("builds the nested lesson route", () => {
    expect(getLessonUrl("alfabeto", "letras-a-e", "letra-a")).toBe(
      "/trilhas/alfabeto/letras-a-e/letra-a",
    );
  });
});
