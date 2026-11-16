"use client";

import { getLearningPath } from "@/data/learning-paths";
import { getPathProgress, type PathProgress } from "@/lib/progression";

import { Badge } from "./badge";
import { IconCheck } from "./icons";
import { useProgressSnapshot } from "./use-progress";

/**
 * "N de M lições disponíveis concluídas" line for the path header, split so
 * the store-free view stays testable. Renders nothing when the path has no
 * published lessons — a "0 de 0" figure over unpublished material would be
 * noise, and the page's content note already explains the pending state.
 */
export function PathProgressLineView({
  progress,
}: {
  progress: PathProgress;
}) {
  if (progress.availableCount === 0) return null;

  const done = progress.completedCount >= progress.availableCount;
  return (
    <Badge tone={done ? "success" : "neutral"}>
      {done && <IconCheck className="h-3 w-3" />}
      {progress.completedCount} de {progress.availableCount}{" "}
      {progress.availableCount === 1
        ? "lição disponível concluída"
        : "lições disponíveis concluídas"}
    </Badge>
  );
}

export function PathProgressLine({ pathSlug }: { pathSlug: string }) {
  const snapshot = useProgressSnapshot();
  const path = getLearningPath(pathSlug);
  if (!path) return null;

  return (
    <PathProgressLineView
      progress={getPathProgress(path, snapshot.completed)}
    />
  );
}
