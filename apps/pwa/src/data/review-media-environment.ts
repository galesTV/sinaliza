/**
 * Environment boundary for local-only review media.
 *
 * The catalog records evidence that certain assets may be displayed for
 * pedagogical review. Some of those assets are not cleared for public
 * redistribution (`displayScope: "local-review"`). Their catalog `src` is an
 * opaque `local-review:` reference, so client-side progress/catalog imports
 * never carry the distributable file path. Server-rendered review surfaces
 * call these helpers before passing content to client components:
 *
 * - in local development/test, the opaque reference is resolved to the local
 *   review file path and the licensed preview behaves normally;
 * - in any production runtime, including production builds outside Vercel,
 *   and in Vercel preview/production the display evidence is stripped and the
 *   source emptied, so the ordinary fail-closed media gate hides the asset
 *   and the browser never requests the restricted file.
 *
 * This module is meant for server components/route modules only. Do not
 * import it from client components.
 */
import type { AlphabetSpecimen } from "./alphabet-specimens";
import type {
  LessonContent,
  LessonExercise,
  LessonExerciseMedia,
  LessonMedia,
  LessonMediaAttribution,
} from "./lesson-content";

const PUBLIC_DEPLOYMENT_ENVS = new Set(["preview", "production"]);
const LOCAL_REVIEW_SRC = /^local-review:fiocruz:([abil])$/;

export function isPublicDeploymentEnvironment(
  vercelEnv = process.env.VERCEL_ENV,
  nodeEnv = process.env.NODE_ENV,
): boolean {
  return (
    PUBLIC_DEPLOYMENT_ENVS.has(vercelEnv ?? "") || nodeEnv === "production"
  );
}

function resolveLocalReviewSrc(src: string): string {
  const letter = LOCAL_REVIEW_SRC.exec(src)?.[1];
  return letter
    ? `/media/alfabeto/primeiros-passos/letra-${letter}.jpg`
    : src;
}

function prepareAttributionForEnvironment<T extends LessonMediaAttribution>(
  attribution: T,
): T {
  if (
    !isPublicDeploymentEnvironment() ||
    attribution.displayScope !== "local-review"
  ) {
    return attribution;
  }
  return { ...attribution, permissionEvidence: "" };
}

function prepareMediaForEnvironment<T extends LessonMedia>(
  media: T,
  attribution: LessonMediaAttribution,
): T {
  if (attribution.displayScope !== "local-review") return media;
  if (isPublicDeploymentEnvironment()) return { ...media, src: "" };
  const src = resolveLocalReviewSrc(media.src);
  return src === media.src ? media : ({ ...media, src } as T);
}

function prepareExerciseMediaForEnvironment<T extends LessonExerciseMedia>(
  item: T,
): T {
  const attribution = prepareAttributionForEnvironment(item.attribution);
  const media = prepareMediaForEnvironment(item.media, item.attribution);
  if (attribution === item.attribution && media === item.media) return item;
  return { ...item, media, attribution };
}

function prepareExerciseForEnvironment(
  exercise: LessonExercise,
): LessonExercise {
  return {
    ...exercise,
    promptMedia: exercise.promptMedia
      ? prepareExerciseMediaForEnvironment(exercise.promptMedia)
      : undefined,
    options: exercise.options.map((option) =>
      option.media
        ? {
            ...option,
            media: prepareExerciseMediaForEnvironment(option.media),
          }
        : option,
    ),
  };
}

/** Content safe to pass to learner-facing client runtime in this environment. */
export function prepareLessonContentForEnvironment(
  content: LessonContent,
): LessonContent {
  return {
    ...content,
    blocks: content.blocks.map((block) => {
      if (block.kind === "media") {
        const attribution = prepareAttributionForEnvironment(block.attribution);
        const media = prepareMediaForEnvironment(block.media, block.attribution);
        if (attribution === block.attribution && media === block.media) {
          return block;
        }
        return { ...block, media, attribution };
      }
      if (block.kind === "exercise") {
        return {
          ...block,
          exercise: prepareExerciseForEnvironment(block.exercise),
        };
      }
      return block;
    }),
  };
}

/** Specimen safe to pass to learner-facing client runtime in this environment. */
export function prepareSpecimenForEnvironment(
  specimen: AlphabetSpecimen,
): AlphabetSpecimen {
  if (!specimen.attribution || !specimen.media) return specimen;
  const attribution = prepareAttributionForEnvironment(specimen.attribution);
  const media = prepareMediaForEnvironment(specimen.media, specimen.attribution);
  if (attribution === specimen.attribution && media === specimen.media) {
    return specimen;
  }
  return { ...specimen, media, attribution };
}
