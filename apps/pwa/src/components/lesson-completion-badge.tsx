"use client";

import type { LessonStatus } from "@/data/learning-paths";
import { isLessonCompletable } from "@/data/path-publication";

import { Badge } from "./badge";
import { IconCheck } from "./icons";
import { useProgressSnapshot } from "./use-progress";

/**
 * Whether a completion may be displayed: the same eligibility-precedes-
 * completion rule the lesson chip applies. A stored completion of a
 * currently non-completable lesson is kept in the record but not shown —
 * the badge would otherwise read as currently available.
 */
export function lessonCompletionVisible(
  completable: boolean,
  hasCompletion: boolean,
): boolean {
  return completable && hasCompletion;
}

/**
 * Shows a "Concluída" badge when the lesson is recorded in the real
 * progress store AND is currently completable. Renders nothing during
 * SSR/first paint, since the store only exists client-side.
 */
export function LessonCompletionBadge({
  lessonKey,
  status,
}: {
  lessonKey: string;
  status: LessonStatus;
}) {
  const snapshot = useProgressSnapshot();
  if (
    !lessonCompletionVisible(
      isLessonCompletable(lessonKey, status),
      snapshot.completed.has(lessonKey),
    )
  )
    return null;

  return (
    <Badge tone="success">
      <IconCheck className="h-3 w-3" />
      Concluída
    </Badge>
  );
}
