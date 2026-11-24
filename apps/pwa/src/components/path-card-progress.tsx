"use client";

import type { LearningPath } from "@/data/learning-paths";
import { getPathProgress, type PathProgress } from "@/lib/progression";

import { IconArrowRight, IconClock } from "./icons";
import { useAuthSession } from "./use-auth-session";
import { useProgressSnapshot, useProgressSyncState } from "./use-progress";

/**
 * Personal progress layer of a PathCard — a client island so the card
 * itself stays a server component. Renders only spans and text: the card
 * is a single Link, so nothing here may be interactive (no nested links).
 * The CTA wording stays navigational ("Explorar trilha" / "Ver trilha"),
 * never promising to open the next activity directly.
 */
export function PathCardProgressView({
  progress,
  loading,
}: {
  progress: PathProgress;
  loading: boolean;
}) {
  const { completedCount, availableCount } = progress;
  const preparation = availableCount === 0;

  return (
    <div className="flex flex-col gap-3">
      {preparation ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
          <IconClock className="h-3.5 w-3.5" aria-hidden="true" />
          Em preparação — conteúdo em validação
        </span>
      ) : loading ? null : (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs leading-relaxed text-muted">
            {completedCount > 0
              ? `${completedCount} de ${availableCount} atividades publicadas percorridas`
              : `${availableCount} atividades publicadas`}
          </span>
          {completedCount > 0 && (
            <span
              aria-hidden="true"
              className="h-1 w-full overflow-hidden rounded-full bg-border/60"
            >
              <span
                className="block h-full rounded-full bg-success/70"
                style={{
                  width: `${Math.round((completedCount / availableCount) * 100)}%`,
                }}
              />
            </span>
          )}
        </div>
      )}
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-soft transition-colors duration-200 group-hover:text-accent">
        {preparation ? "Explorar trilha" : "Ver trilha"}
        <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </div>
  );
}

export function PathCardProgress({ path }: { path: LearningPath }) {
  const { status } = useAuthSession();
  const snapshot = useProgressSnapshot();
  const sync = useProgressSyncState();

  const loading =
    status === "loading" ||
    (status === "user" && sync.configured && !sync.hydrated && sync.syncing);

  return (
    <PathCardProgressView
      progress={getPathProgress(path, snapshot.completed)}
      loading={loading}
    />
  );
}
