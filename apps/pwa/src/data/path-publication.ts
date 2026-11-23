/**
 * Honest publication summary for a learning path.
 *
 * Counts are derived from the catalog and the publication gates — never
 * hardcoded. A lesson only counts as published under the same rule the
 * lesson page applies (`LessonContentArea`): status "available" plus a
 * catalog entry that is publishable (expert-validated with the full
 * review chain on the current version and an intact draft). The
 * publishable draft itself is what the page renders — there is no
 * separate published-content registry.
 */
import { getCatalogEntry, isPublishable } from "./lesson-catalog";
import { lessonKey } from "@/lib/progress";
import type { LearningPath, LessonStatus } from "./learning-paths";

/**
 * The single eligibility rule every consumer must agree on: a lesson can
 * be completed — and therefore counted in progress — only when the path
 * marks it `available` AND its catalog entry is publishable
 * (expert-validated, the full review chain on the current version, and a
 * well-formed draft). This is the rule `LessonContentArea` applies before
 * mounting the runner; sharing it keeps progress denominators, resume
 * targets and the publication summary below from promising a lesson the
 * learner cannot actually complete.
 */
export function isLessonCompletable(
  key: string,
  status: LessonStatus,
): boolean {
  if (status !== "available") return false;
  const entry = getCatalogEntry(key);
  return entry !== undefined && isPublishable(entry);
}

export interface PathPublicationSummary {
  /** Lessons in the path, in any lifecycle stage. */
  total: number;
  /** Published: available + expert-validated catalog + content shipped. */
  published: number;
  /** In review: catalog draft exists but is not publishable yet. */
  inReview: number;
  /** Planned: no publishable material and no draft in the catalog. */
  planned: number;
}

export function getPathPublicationSummary(
  path: LearningPath,
): PathPublicationSummary {
  const summary: PathPublicationSummary = {
    total: 0,
    published: 0,
    inReview: 0,
    planned: 0,
  };

  for (const courseModule of path.modules) {
    for (const lesson of courseModule.lessons) {
      summary.total += 1;
      const key = lessonKey(path.slug, courseModule.slug, lesson.slug);
      const published = isLessonCompletable(key, lesson.status);

      if (published) {
        summary.published += 1;
      } else if (getCatalogEntry(key)?.draft) {
        summary.inReview += 1;
      } else {
        summary.planned += 1;
      }
    }
  }

  return summary;
}
