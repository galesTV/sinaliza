import { describe, expect, it } from "vitest";

import { parseLessonKey } from "@/lib/progress";

import { getLessonContext, getLearningPaths } from "./learning-paths";
import {
  demoLesson,
  getLessonContent,
  lessonContents,
  validateLessonContent,
  type LessonContent,
  type LessonMediaBlock,
} from "./lesson-content";

/**
 * Synthetic fixture — clearly labeled test data, NOT Libras material — used
 * to exercise the media block shape without touching the real catalog.
 */
function makeMediaBlock(overrides: Partial<LessonMediaBlock> = {}): LessonMediaBlock {
  return {
    kind: "media",
    title: "Demonstração sintética",
    description: "Descrição de teste independente do vídeo.",
    media: {
      type: "video",
      src: "/media/fixtures/demo-pulse.mp4",
      poster: "/media/fixtures/demo-poster.png",
      captions: {
        src: "/media/fixtures/demo-captions.vtt",
        srclang: "pt-BR",
        label: "Português",
      },
    },
    attribution: {
      source: "Sinaliza — ativo sintético",
      license: "Uso interno em testes",
    },
    ...overrides,
  };
}

function validContent(blocks: LessonContent["blocks"]): LessonContent {
  return { intro: "intro", blocks };
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
      expect(validateLessonContent(content), key).toEqual([]);
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
    expect(kinds).toEqual(new Set(["text", "exercise", "media"]));
  });

  it("is well-formed and completable", () => {
    expect(validateLessonContent(demoLesson)).toEqual([]);
  });
});

describe("validateLessonContent", () => {
  it("accepts a well-formed video media block", () => {
    expect(validateLessonContent(validContent([makeMediaBlock()]))).toEqual(
      [],
    );
  });

  it("accepts a well-formed image media block", () => {
    expect(
      validateLessonContent(
        validContent([
          makeMediaBlock({
            media: {
              type: "image",
              src: "/media/fixtures/demo-diagram.png",
              alt: "Diagrama sintético de teste",
            },
          }),
        ]),
      ),
    ).toEqual([]);
  });

  it("accepts a video without optional poster and captions", () => {
    const block = makeMediaBlock();
    block.media = { type: "video", src: "/media/x.mp4" };
    expect(validateLessonContent(validContent([block]))).toEqual([]);
  });

  it("rejects media without source or license", () => {
    const problems = validateLessonContent(
      validContent([
        makeMediaBlock({
          attribution: { source: " ", license: "" },
        }),
      ]),
    );
    expect(problems.join()).toContain("attribution.source");
    expect(problems.join()).toContain("attribution.license");
  });

  it("rejects media without title or standalone description", () => {
    const problems = validateLessonContent(
      validContent([makeMediaBlock({ title: "", description: " " })]),
    );
    expect(problems.join()).toContain("missing title");
    expect(problems.join()).toContain("missing description");
  });

  it("rejects an image without alt text", () => {
    const problems = validateLessonContent(
      validContent([
        makeMediaBlock({
          media: { type: "image", src: "/media/x.png", alt: " " },
        }),
      ]),
    );
    expect(problems.join()).toContain("missing alt text");
  });

  it("rejects malformed caption tracks", () => {
    const block = makeMediaBlock();
    if (block.media.type !== "video") throw new Error("fixture");
    block.media.captions = { src: "legendas.txt", srclang: "", label: " " };
    const problems = validateLessonContent(validContent([block]));
    expect(problems.join()).toContain("captions");
    expect(problems.join()).toContain("srclang");
  });

  it("still flags malformed exercises and empty lessons", () => {
    const problems = validateLessonContent(
      validContent([
        {
          kind: "exercise",
          exercise: {
            prompt: "p",
            options: [{ label: "a", feedback: "f" }],
            correctIndex: 5,
            explanation: "e",
          },
        },
      ]),
    );
    expect(problems.join()).toContain("fewer than 2 options");
    expect(problems.join()).toContain("correctIndex out of bounds");
    expect(validateLessonContent({ intro: "", blocks: [] })).not.toEqual([]);
  });
});
