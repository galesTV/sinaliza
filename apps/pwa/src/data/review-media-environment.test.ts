import { afterEach, describe, expect, it } from "vitest";

import { hasMediaDisplayPermission } from "./lesson-content";
import {
  isPublicDeploymentEnvironment,
  prepareLessonContentForEnvironment,
  prepareSpecimenForEnvironment,
} from "./review-media-environment";
import type { AlphabetSpecimen } from "./alphabet-specimens";
import type { LessonContent } from "./lesson-content";

const ORIGINAL_VERCEL_ENV = process.env.VERCEL_ENV;

afterEach(() => {
  if (ORIGINAL_VERCEL_ENV === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = ORIGINAL_VERCEL_ENV;
});

const localReviewAttribution = {
  source: "Fonte",
  license: "Licença",
  permissionEvidence: "uso local confirmado",
  displayScope: "local-review" as const,
};

function makeContent(): LessonContent {
  return {
    intro: "intro",
    blocks: [
      {
        kind: "media",
        title: "Demonstração",
        description: "descrição",
        media: { type: "image", src: "/restricted.jpg", alt: "alt" },
        attribution: localReviewAttribution,
      },
      {
        kind: "exercise",
        exercise: {
          prompt: "visual",
          promptMedia: {
            media: { type: "image", src: "/restricted.jpg", alt: "alt" },
            attribution: localReviewAttribution,
          },
          options: [
            { label: "a", feedback: "f" },
            {
              label: "b",
              feedback: "f",
              media: {
                media: { type: "image", src: "/restricted.jpg", alt: "alt" },
                attribution: localReviewAttribution,
              },
            },
          ],
          correctIndex: 1,
          explanation: "e",
        },
      },
    ],
  };
}

function makeSpecimen(): AlphabetSpecimen {
  return {
    id: "letra-x",
    lessonKey: "alfabeto/letras-u-z/letra-x",
    letter: "X",
    title: "Letra X",
    media: { type: "image", src: "/restricted.jpg", alt: "alt" },
    attribution: localReviewAttribution,
    references: [],
    validationStatus: "draft",
    version: "draft-1",
    reviews: [],
  };
}

describe("review media environment guard", () => {
  it("detects only preview and production as public deployments", () => {
    expect(isPublicDeploymentEnvironment("preview")).toBe(true);
    expect(isPublicDeploymentEnvironment("production")).toBe(true);
    expect(isPublicDeploymentEnvironment("development")).toBe(false);
    expect(isPublicDeploymentEnvironment(undefined)).toBe(false);
  });

  it("keeps local-review media displayable outside public deployments", () => {
    delete process.env.VERCEL_ENV;
    const content = makeContent();
    expect(prepareLessonContentForEnvironment(content)).toEqual(content);
    expect(prepareSpecimenForEnvironment(makeSpecimen()).attribution).toEqual(
      localReviewAttribution,
    );
  });

  it("resolves opaque local-review references only outside public deployments", () => {
    delete process.env.VERCEL_ENV;
    const content = makeContent();
    const mediaBlock = content.blocks[0];
    if (mediaBlock.kind !== "media") throw new Error("fixture");
    mediaBlock.media = {
      ...mediaBlock.media,
      src: "local-review:fiocruz:b",
    };

    const prepared = prepareLessonContentForEnvironment(content);
    const preparedBlock = prepared.blocks[0];
    if (preparedBlock.kind !== "media") throw new Error("fixture");
    expect(preparedBlock.media.src).toBe(
      "/media/alfabeto/primeiros-passos/letra-b.jpg",
    );
    expect(mediaBlock.media.src).toBe("local-review:fiocruz:b");
  });

  it("strips display permission from every local-review media slot in public deployments", () => {
    process.env.VERCEL_ENV = "preview";
    const original = makeContent();
    const prepared = prepareLessonContentForEnvironment(original);

    const mediaBlock = prepared.blocks[0];
    if (mediaBlock.kind !== "media") throw new Error("fixture");
    expect(hasMediaDisplayPermission(mediaBlock.attribution)).toBe(false);
    expect(mediaBlock.media.src).toBe("");

    const exerciseBlock = prepared.blocks[1];
    if (exerciseBlock.kind !== "exercise") throw new Error("fixture");
    expect(
      hasMediaDisplayPermission(exerciseBlock.exercise.promptMedia?.attribution),
    ).toBe(false);
    expect(exerciseBlock.exercise.promptMedia?.media.src).toBe("");
    expect(
      hasMediaDisplayPermission(
        exerciseBlock.exercise.options[1].media?.attribution,
      ),
    ).toBe(false);
    expect(exerciseBlock.exercise.options[1].media?.media.src).toBe("");

    // The catalog itself is never mutated.
    const originalBlock = original.blocks[0];
    if (originalBlock.kind !== "media") throw new Error("fixture");
    expect(hasMediaDisplayPermission(originalBlock.attribution)).toBe(true);
  });

  it("strips specimen display permission in public deployments without mutating it", () => {
    process.env.VERCEL_ENV = "production";
    const specimen = makeSpecimen();
    const prepared = prepareSpecimenForEnvironment(specimen);
    expect(hasMediaDisplayPermission(prepared.attribution)).toBe(false);
    expect(prepared.media?.src).toBe("");
    expect(hasMediaDisplayPermission(specimen.attribution)).toBe(true);
  });

  it("leaves public-scope media untouched in public deployments", () => {
    process.env.VERCEL_ENV = "production";
    const specimen = makeSpecimen();
    specimen.attribution = {
      ...specimen.attribution!,
      displayScope: "public",
    };
    expect(hasMediaDisplayPermission(specimen.attribution)).toBe(true);
  });
});
