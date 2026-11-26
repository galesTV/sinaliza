/**
 * Environment boundary for local-only review media.
 *
 * The catalog records evidence that certain assets may be displayed for
 * pedagogical review. Some of those assets are not cleared for public
 * redistribution (`displayScope: "local-review"`). Server-rendered review
 * surfaces call these helpers before passing content to client components:
 * in Vercel preview/production the display evidence is stripped, so the
 * ordinary fail-closed media gate hides the asset and the browser never
 * requests the restricted file. Local development keeps the review preview
 * intact.
 *
 * This module is meant for server components/route modules only. Do not
 * import it from client components.
 */
import type { AlphabetSpecimen } from "./alphabet-specimens";
import type {
  LessonContent,
  LessonExercise,
  LessonExerciseMedia,
  LessonMediaAttribution,
} from "./lesson-content";

const PUBLIC_DEPLOYMENT_ENVS = new Set(["preview", "production"]);

export function isPublicDeploymentEnvironment(
  vercelEnv = process.env.VERCEL_ENV,
): boolean {
  return PUBLIC_DEPLOYMENT_ENVS.has(vercelEnv ?? "");
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

function prepareExerciseMediaForEnvironment<T extends LessonExerciseMedia>(
  item: T,
): T {
  const attribution = prepareAttributionForEnvironment(item.attribution);
  if (attribution === item.attribution) return item;
  return {
    ...item,
    // Never serialize a local-only asset URL into a public deployment.
    // The empty source is unreachable because display permission has been
    // stripped as well, so this is defense in depth rather than a rendered
    // placeholder.
    media: { ...item.media, src: "" },
    attribution,
  };
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
  if (!isPublicDeploymentEnvironment()) return content;
  return {
    ...content,
    blocks: content.blocks.map((block) => {
      if (block.kind === "media") {
        const attribution = prepareAttributionForEnvironment(block.attribution);
        if (attribution === block.attribution) return block;
        return {
          ...block,
          media: { ...block.media, src: "" },
          attribution,
        };
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
  if (attribution === specimen.attribution) return specimen;
  return {
    ...specimen,
    media: { ...specimen.media, src: "" },
    attribution,
  };
}
