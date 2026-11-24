"use client";

import { getLearningPath, type CourseModule } from "@/data/learning-paths";
import {
  deriveModuleState,
  getModuleProgress,
  type ModuleState,
  type PathProgress,
} from "@/lib/progression";

import { Badge } from "./badge";
import { IconCheck, IconClock } from "./icons";
import { useAuthSession } from "./use-auth-session";
import { useProgressSnapshot, useProgressSyncState } from "./use-progress";

const STATE_TONE: Record<ModuleState, "neutral" | "accent" | "success"> = {
  preparation: "accent",
  available: "neutral",
  in_progress: "accent",
  walked: "success",
};

const STATE_LABEL: Record<ModuleState, string> = {
  preparation: "Em preparação",
  available: "Disponível",
  in_progress: "Em andamento",
  walked: "Atividades publicadas percorridas",
};

function progressLine(progress: PathProgress): string | null {
  const { completedCount, availableCount, lessonCount } = progress;
  if (availableCount === 0) return null;
  const pending = lessonCount - availableCount;
  if (completedCount >= availableCount) {
    return pending > 0
      ? `Todas as atividades publicadas percorridas · ${pending} em preparação`
      : "Todas as atividades publicadas percorridas";
  }
  return `${completedCount} de ${availableCount} ${
    availableCount === 1
      ? "atividade publicada percorrida"
      : "atividades publicadas percorridas"
  }`;
}

/**
 * Derived state of one module, split so the store-free view stays
 * testable. `preparation` is a catalog fact — it renders even while the
 * identity resolves, because a module with no completable lesson can
 * never be walked. Personal states wait for the resolved progress set
 * and hide entirely during the first remote hydration (loading is not
 * empty progress).
 */
export function ModuleStateBadgeView({
  progress,
  loading,
}: {
  progress: PathProgress;
  loading: boolean;
}) {
  const state = deriveModuleState(progress);
  const line = progressLine(progress);
  const hidePersonal = loading && state !== "preparation";

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {!hidePersonal && (
        <Badge tone={STATE_TONE[state]}>
          {state === "preparation" && (
            <IconClock className="h-3 w-3" aria-hidden="true" />
          )}
          {state === "walked" && (
            <IconCheck className="h-3 w-3" aria-hidden="true" />
          )}
          {STATE_LABEL[state]}
        </Badge>
      )}
      {!hidePersonal && line && (
        <span className="text-xs leading-relaxed text-muted">{line}</span>
      )}
    </div>
  );
}

export function ModuleStateBadge({
  pathSlug,
  module,
}: {
  pathSlug: string;
  module: CourseModule;
}) {
  const { status } = useAuthSession();
  const snapshot = useProgressSnapshot();
  const sync = useProgressSyncState();

  const path = getLearningPath(pathSlug);
  if (!path) return null;

  const loading =
    status === "loading" ||
    (status === "user" && sync.configured && !sync.hydrated && sync.syncing);

  return (
    <ModuleStateBadgeView
      progress={getModuleProgress(path, module, snapshot.completed)}
      loading={loading}
    />
  );
}
