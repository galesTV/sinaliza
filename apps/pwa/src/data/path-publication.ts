/**
 * Honest publication summary for a learning path.
 *
 * Counts are derived from the catalog and the publication gates — never
 * hardcoded. A lesson only counts as published under the same rule the
 * lesson page applies (`LessonContentArea`): status "available", catalog
 * entry publishable (expert-validated with the full review chain on the
 * current version) and material present in `lessonContents`.
 */
import { getCatalogEntry, isPublishable } from "./lesson-catalog";
import { getLessonContent } from "./lesson-content";
import { lessonKey } from "@/lib/progress";
import type { LearningPath } from "./learning-paths";

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
      const entry = getCatalogEntry(key);
      const published =
        lesson.status === "available" &&
        Boolean(entry) &&
        isPublishable(entry!) &&
        Boolean(
          getLessonContent(path.slug, courseModule.slug, lesson.slug),
        );

      if (published) {
        summary.published += 1;
      } else if (entry?.draft) {
        summary.inReview += 1;
      } else {
        summary.planned += 1;
      }
    }
  }

  return summary;
}
