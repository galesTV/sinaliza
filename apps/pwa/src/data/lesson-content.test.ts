import { describe, expect, it } from "vitest";

import { lessonCatalog } from "./lesson-catalog";
import {
  blockedExerciseDemo,
  demoLesson,
  guidedExperience,
  hasMediaDisplayPermission,
  hasMediaPublicationPermission,
  isExerciseVisuallyPermitted,
  validateLessonContent,
  validateLessonPublicationMedia,
  visualExerciseDemo,
  type LessonContent,
  type LessonExercise,
  type LessonExerciseOption,
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

  it("is laboratory content, never used as a published lesson draft", () => {
    // The guided experience lives outside the catalog: no entry's draft is
    // this content, so completing it can never record real progress.
    for (const entry of lessonCatalog) {
      expect(entry.draft).not.toBe(guidedExperience);
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

describe("resources block validation", () => {
  function makeResourcesBlock(
    overrides: Partial<
      Extract<LessonContent["blocks"][number], { kind: "resources" }>
    > = {},
  ) {
    return {
      kind: "resources" as const,
      heading: "Recursos complementares",
      body: "Links externos opcionais.",
      items: [
        {
          title: "Publicação oficial do alfabeto manual",
          source: "Instituição X",
          url: "https://example.org/alfabeto",
          description: "Por que este link ajuda.",
        },
      ],
      ...overrides,
    };
  }

  it("accepts a well-formed resources block", () => {
    expect(
      validateLessonContent(validContent([makeResourcesBlock()])),
    ).toEqual([]);
  });

  it("flags missing heading, body and empty items", () => {
    const problems = validateLessonContent(
      validContent([
        makeResourcesBlock({ heading: " ", body: "", items: [] }),
      ]),
    );
    expect(problems.join()).toContain("missing heading");
    expect(problems.join()).toContain("missing body");
    expect(problems.join()).toContain("no resources");
  });

  it("flags malformed items and non-https or relative urls", () => {
    const problems = validateLessonContent(
      validContent([
        makeResourcesBlock({
          items: [
            {
              title: " ",
              source: "",
              url: "/interna",
              description: " ",
            },
            {
              title: "ok",
              source: "ok",
              url: "http://inseguro.example",
              description: "ok",
            },
          ],
        }),
      ]),
    );
    expect(problems.join()).toContain("resource 0: missing title");
    expect(problems.join()).toContain("resource 0: missing source");
    expect(problems.join()).toContain("resource 0: url must be an external https link");
    expect(problems.join()).toContain("resource 0: missing description");
    expect(problems.join()).toContain("resource 1: url must be an external https link");
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

  it("requires separate publication evidence beyond display permission", () => {
    expect(hasMediaPublicationPermission(baseAttribution)).toBe(false);
    expect(
      hasMediaPublicationPermission({
        ...baseAttribution,
        publicationEvidence: "autorização de distribuição",
      }),
    ).toBe(true);
    expect(
      hasMediaPublicationPermission({
        ...baseAttribution,
        publicationEvidence: "autorização de distribuição",
        displayScope: "local-review",
      }),
    ).toBe(false);
  });

  it("reports media without publication evidence as not publishable", () => {
    const displayOnly: LessonContent = {
      intro: "intro",
      blocks: [makeMediaBlock({ attribution: baseAttribution })],
    };
    expect(validateLessonPublicationMedia(displayOnly)).toHaveLength(1);

    const distributable: LessonContent = {
      intro: "intro",
      blocks: [
        makeMediaBlock({
          attribution: {
            ...baseAttribution,
            publicationEvidence: "autorização de distribuição",
          },
        }),
      ],
    };
    expect(validateLessonPublicationMedia(distributable)).toEqual([]);
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

  it("rejects video in option.media — options are image-only", () => {
    const exercise = visualExercise();
    // Draft content arrives as data (e.g. JSON): malformed media kinds can
    // bypass the narrower option type, so structural validation must also
    // refuse videos in answer options.
    exercise.options[0].media = {
      media: { type: "video", src: "/v.mp4" },
      attribution: { source: "F", license: "L" },
    } as unknown as LessonExerciseOption["media"];
    const problems = validateLessonContent(
      validContent([{ kind: "exercise", exercise }]),
    );
    expect(problems.join()).toContain(
      "option 0 media: only image media is supported",
    );
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
