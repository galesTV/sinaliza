"use client";

import { Badge } from "./badge";
import { IconCheck } from "./icons";
import { useProgressSnapshot } from "./use-progress";

/**
 * Shows a "Concluída" badge when the lesson is recorded in the real progress
 * store. Renders nothing otherwise — and nothing during SSR/first paint, since
 * the store only exists client-side.
 */
export function LessonCompletionBadge({ lessonKey }: { lessonKey: string }) {
  const snapshot = useProgressSnapshot();
  if (!snapshot.completed.has(lessonKey)) return null;

  return (
    <Badge tone="success">
      <IconCheck className="h-3 w-3" />
      Concluída
    </Badge>
  );
}
