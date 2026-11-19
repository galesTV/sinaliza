import { describe, expect, it } from "vitest";

import { parseLessonKey } from "@/lib/progress";

import { getLessonContext, getLearningPaths } from "./learning-paths";
import {
  blockedExerciseDemo,
  demoLesson,
  getLessonContent,
  guidedExperience,
  hasMediaDisplayPermission,
  isExerciseVisuallyPermitted,
  lessonContents,
  validateLessonContent,
  visualExerciseDemo,
  type LessonContent,
  type LessonExercise,
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

describe("guidedExperience", () => {
  it("exercises every block kind the runner supports", () => {
    const kinds = new Set(guidedExperience.blocks.map((block) => block.kind));
    expect(kinds).toEqual(new Set(["text", "exercise", "media"]));
  });

  it("is well-formed and completable", () => {
    expect(validateLessonContent(guidedExperience)).toEqual([]);
  });

  it("is laboratory content, never registered as a published lesson", () => {
    // The guided experience lives outside `lessonContents`: no lesson key
    // points at it, so completing it can never record real progress.
    expect(Object.values(lessonContents)).not.toContain(guidedExperience);
    for (const key of Object.keys(lessonContents)) {
      expect(lessonContents[key]).not.toBe(guidedExperience);
    }
  });

  it("labels its media step honestly as a synthetic test asset", () => {
    const mediaBlocks = guidedExperience.blocks.filter(
      (block) => block.kind === "media",
    );
    expect(mediaBlocks.length).toBeGreaterThan(0);
    for (const block of mediaBlocks) {
      if (block.kind !== "media") continue;
      expect(block.media.src).toContain("/media/fixtures/");
      expect(block.attribution.license).toContain("test");
      expect(block.description).toContain("não é uma demonstração de sinal");
    }
  });

  it("has a completable exercise sequence with immediate feedback", () => {
    const exercises = guidedExperience.blocks.filter(
      (block) => block.kind === "exercise",
    );
    expect(exercises.length).toBeGreaterThan(0);
    for (const block of exercises) {
      if (block.kind !== "exercise") continue;
      for (const option of block.exercise.options) {
        expect(option.feedback.trim().length).toBeGreaterThan(0);
      }
      expect(block.exercise.explanation.trim().length).toBeGreaterThan(0);
    }
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

describe("media permission gate", () => {
  const baseAttribution = {
    source: "Fonte",
    license: "Licença",
    permissionEvidence: "doc-123",
  };

  it("requires source, license and non-empty permission evidence", () => {
    expect(hasMediaDisplayPermission(baseAttribution)).toBe(true);
    expect(hasMediaDisplayPermission(undefined)).toBe(false);
    expect(
      hasMediaDisplayPermission({ ...baseAttribution, source: " " }),
    ).toBe(false);
    expect(
      hasMediaDisplayPermission({ ...baseAttribution, license: "" }),
    ).toBe(false);
    expect(
      hasMediaDisplayPermission({ ...baseAttribution, permissionEvidence: "" }),
    ).toBe(false);
    expect(
      hasMediaDisplayPermission({
        source: "Fonte",
        license: "Licença",
      }),
    ).toBe(false);
  });

  it("gates an exercise when any required media lacks evidence", () => {
    const exercise: LessonExercise = {
      prompt: "p",
      promptMedia: {
        media: { type: "image", src: "/m.png", alt: "a" },
        attribution: baseAttribution,
      },
      options: [
        { label: "a", feedback: "f" },
        {
          label: "b",
          feedback: "f",
          media: {
            media: { type: "image", src: "/n.png", alt: "b" },
            attribution: { source: "Fonte", license: "Licença" },
          },
        },
      ],
      correctIndex: 0,
      explanation: "e",
    };
    // The option media has no permissionEvidence → not visually permitted.
    expect(isExerciseVisuallyPermitted(exercise)).toBe(false);

    exercise.options[1].media!.attribution.permissionEvidence = "doc-456";
    expect(isExerciseVisuallyPermitted(exercise)).toBe(true);
  });

  it("treats media-free exercises as always permitted", () => {
    const exercise: LessonExercise = {
      prompt: "p",
      options: [
        { label: "a", feedback: "f" },
        { label: "b", feedback: "f" },
      ],
      correctIndex: 0,
      explanation: "e",
    };
    expect(isExerciseVisuallyPermitted(exercise)).toBe(true);
  });
});

describe("visual exercise validation", () => {
  const permittedMedia = {
    media: { type: "image" as const, src: "/m.png", alt: "estímulo" },
    attribution: {
      source: "Fonte",
      license: "Licença",
      permissionEvidence: "doc-123",
    },
  };

  function visualExercise(): LessonExercise {
    return {
      prompt: "Qual letra?",
      promptMedia: permittedMedia,
      options: [
        { label: "a", feedback: "f" },
        { label: "b", feedback: "f" },
      ],
      correctIndex: 0,
      explanation: "e",
    };
  }

  it("accepts a well-formed visual exercise", () => {
    const content = validContent([
      { kind: "exercise", exercise: visualExercise() },
    ]);
    expect(validateLessonContent(content)).toEqual([]);
  });

  it("flags malformed promptMedia and option media", () => {
    const exercise = visualExercise();
    exercise.promptMedia = {
      media: { type: "image", src: " ", alt: " " },
      attribution: { source: "", license: "" },
    };
    exercise.options[0].media = {
      media: { type: "image", src: "/ok.png", alt: " " },
      attribution: { source: "F", license: "L" },
    };
    const problems = validateLessonContent(
      validContent([{ kind: "exercise", exercise }]),
    );
    expect(problems.join()).toContain("promptMedia");
    expect(problems.join()).toContain("missing media src");
    expect(problems.join()).toContain("attribution.source");
    expect(problems.join()).toContain("option 0 media");
  });

  it("flags a description variant on a media-free exercise", () => {
    const exercise: LessonExercise = {
      prompt: "p",
      options: [
        { label: "a", feedback: "f" },
        { label: "b", feedback: "f" },
      ],
      correctIndex: 0,
      explanation: "e",
      descriptionVariant: {
        prompt: "p2",
        options: [
          { label: "a", feedback: "f" },
          { label: "b", feedback: "f" },
        ],
        correctIndex: 0,
        explanation: "e",
      },
    };
    const problems = validateLessonContent(
      validContent([{ kind: "exercise", exercise }]),
    );
    expect(problems.join()).toContain(
      "descriptionVariant: requires promptMedia or option.media",
    );
  });

  it("flags malformed variants and media inside a variant", () => {
    const exercise = visualExercise();
    exercise.descriptionVariant = {
      prompt: " ",
      options: [
        { label: "a", feedback: "f", media: permittedMedia },
      ],
      correctIndex: 5,
      explanation: "e",
    };
    const problems = validateLessonContent(
      validContent([{ kind: "exercise", exercise }]),
    );
    expect(problems.join()).toContain("descriptionVariant: missing prompt");
    expect(problems.join()).toContain("fewer than 2 options");
    expect(problems.join()).toContain("correctIndex out of bounds");
    expect(problems.join()).toContain(
      "media not allowed in description variant",
    );
  });
});

describe("visualExerciseDemo lab content", () => {
  it("is well-formed and exercises every media path", () => {
    expect(validateLessonContent(visualExerciseDemo)).toEqual([]);
    const exercises = visualExerciseDemo.blocks.flatMap((block) =>
      block.kind === "exercise" ? [block.exercise] : [],
    );
    // One fully permitted stimulus, one option-media exercise, one gated
    // stimulus with variant and one load-failing stimulus with variant.
    expect(exercises.length).toBe(4);
    expect(isExerciseVisuallyPermitted(exercises[0])).toBe(true);
    expect(isExerciseVisuallyPermitted(exercises[1])).toBe(true);
    expect(isExerciseVisuallyPermitted(exercises[2])).toBe(false);
    expect(isExerciseVisuallyPermitted(exercises[3])).toBe(true);
    expect(exercises[2].descriptionVariant).toBeDefined();
    expect(exercises[3].descriptionVariant).toBeDefined();
  });
});

describe("blockedExerciseDemo lab content", () => {
  it("is well-formed and gated without a description variant", () => {
    expect(validateLessonContent(blockedExerciseDemo)).toEqual([]);
    const exercise = blockedExerciseDemo.blocks.find(
      (block) => block.kind === "exercise",
    );
    if (exercise?.kind !== "exercise") throw new Error("fixture");
    expect(isExerciseVisuallyPermitted(exercise.exercise)).toBe(false);
    expect(exercise.exercise.descriptionVariant).toBeUndefined();
  });
});
