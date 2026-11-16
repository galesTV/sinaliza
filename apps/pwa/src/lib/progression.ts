/**
 * Pure derivations over learning-path structure + recorded progress.
 *
 * No React, no storage: callers pass the `completed` key set from the
 * progress store (`ReadonlySet<string>` of `trilha/modulo/licao` keys).
 * Only `status === "available"` lessons are actionable — planned lessons
 * are never suggested, counted as resumable, or included in progress
 * ratios, so unpublished material can never produce misleading numbers.
 */

import {
  getLessonUrl,
  type CourseModule,
  type LearningPath,
  type Lesson,
} from "@/data/learning-paths";
import { lessonKey } from "@/lib/progress";

export interface PathProgress {
  /**
   * Available lessons in this path recorded as completed. A recorded key
   * for a `planned` lesson is stale (it could never have been completed)
   * and is ignored like any unknown key, so completedCount can never
   * exceed availableCount.
   */
  completedCount: number;
  /** Lessons published (`status === "available"`) in this path. */
  availableCount: number;
  /** Total lessons in the path, including planned ones. */
  lessonCount: number;
  /**
   * `completedCount / availableCount`, or `null` when the path has no
   * available lessons — a ratio over unpublished material would be
   * meaningless, so callers must render the honest fallback instead.
   */
  ratio: number | null;
}

export interface ResumeTarget {
  path: LearningPath;
  module: CourseModule;
  lesson: Lesson;
  url: string;
}

interface LessonEntry {
  module: CourseModule;
  lesson: Lesson;
}

function* iterateLessons(path: LearningPath): Generator<LessonEntry> {
  for (const courseModule of path.modules) {
    for (const lesson of courseModule.lessons) {
      yield { module: courseModule, lesson };
    }
  }
}

function keyOf(path: LearningPath, entry: LessonEntry): string {
  return lessonKey(path.slug, entry.module.slug, entry.lesson.slug);
}

function isAvailable(entry: LessonEntry): boolean {
  return entry.lesson.status === "available";
}

/**
 * Progress within one path. Only keys matching real, available lessons of
 * this path count — unknown, malformed, foreign-path, and stale
 * (now-planned) keys are ignored.
 */
export function getPathProgress(
  path: LearningPath,
  completed: ReadonlySet<string>,
): PathProgress {
  let completedCount = 0;
  let availableCount = 0;
  let lessonCount = 0;

  for (const entry of iterateLessons(path)) {
    lessonCount += 1;
    if (!isAvailable(entry)) continue;
    availableCount += 1;
    if (completed.has(keyOf(path, entry))) completedCount += 1;
  }

  return {
    completedCount,
    availableCount,
    lessonCount,
    ratio: availableCount === 0 ? null : completedCount / availableCount,
  };
}

/**
 * First available, not-yet-completed lesson in the path's learning order
 * (module order, then lesson order inside each module). Returns
 * `undefined` when every available lesson is completed or none is
 * published — callers must not resume into planned lessons.
 */
export function getNextLesson(
  path: LearningPath,
  completed: ReadonlySet<string>,
): ResumeTarget | undefined {
  for (const entry of iterateLessons(path)) {
    if (!isAvailable(entry)) continue;
    if (completed.has(keyOf(path, entry))) continue;
    return {
      path,
      module: entry.module,
      lesson: entry.lesson,
      url: getLessonUrl(path.slug, entry.module.slug, entry.lesson.slug),
    };
  }
  return undefined;
}

/**
 * Resume target across paths, in array order (the same convention that
 * makes `learningPaths[0]` the designated starting path): the first path
 * with an available incomplete lesson wins.
 */
export function getResumeLesson(
  paths: readonly LearningPath[],
  completed: ReadonlySet<string>,
): ResumeTarget | undefined {
  for (const path of paths) {
    const target = getNextLesson(path, completed);
    if (target) return target;
  }
  return undefined;
}
