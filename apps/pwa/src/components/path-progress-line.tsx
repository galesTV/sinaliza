"use client";

import { getLearningPath } from "@/data/learning-paths";
import { getPathProgress, type PathProgress } from "@/lib/progression";

import { Badge } from "./badge";
import { IconCheck } from "./icons";
import { useAuthSession } from "./use-auth-session";
import { useProgressSnapshot, useProgressSyncState } from "./use-progress";

/**
 * "N de M atividades publicadas percorridas" badge for the path header —
 * individual progress over published content, deliberately distinct from
 * `PublicationBadge` ("N de M publicadas"), which describes the catalog.
 * Renders nothing when the path has no completable lessons — a "0 de 0"
 * figure over unpublished material would be noise — and nothing while
 * the identity resolves, because loading is not empty progress.
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
        ? "atividade publicada percorrida"
        : "atividades publicadas percorridas"}
    </Badge>
  );
}

export function PathProgressLine({ pathSlug }: { pathSlug: string }) {
  const { status } = useAuthSession();
  const snapshot = useProgressSnapshot();
  const sync = useProgressSyncState();
  const path = getLearningPath(pathSlug);
  if (!path) return null;

  const loading =
    status === "loading" ||
    (status === "user" && sync.configured && !sync.hydrated && sync.syncing);
  if (loading) return null;

  return (
    <PathProgressLineView
      progress={getPathProgress(path, snapshot.completed)}
    />
  );
}
