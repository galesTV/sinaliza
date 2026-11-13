import type { LessonStatus } from "@/data/learning-paths";

import { Badge, PlannedBadge } from "./badge";
import { IconClock } from "./icons";

export function LessonStatusBadge({ status }: { status: LessonStatus }) {
  return status === "available" ? (
    <Badge tone="success">Disponível</Badge>
  ) : (
    <PlannedBadge />
  );
}

/**
 * The main instructional-content slot of a lesson page. Until validated
 * material exists (status "planned"), it renders an honest pending panel.
 * Real blocks (video, images, explanations, activities) slot in here once the
 * lesson content model lands.
 */
export function LessonContentArea({ status }: { status: LessonStatus }) {
  if (status === "available") return null;

  return (
    <div className="flex items-start gap-3.5 rounded-2xl border border-dashed border-border bg-surface/50 p-6">
      <span
        aria-hidden="true"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-surface-elevated text-muted"
      >
        <IconClock className="h-5 w-5" />
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-foreground">
          Conteúdo em preparação
        </p>
        <p className="text-sm leading-relaxed text-muted">
          O material desta lição — demonstração visual do sinal, explicações e
          atividades — será desenvolvido e passará por validação pedagógica e
          linguística antes de ser publicado.
        </p>
      </div>
    </div>
  );
}
