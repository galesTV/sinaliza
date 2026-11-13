import type { LessonContent } from "@/data/lesson-content";
import type { LessonStatus } from "@/data/learning-paths";

import { Badge, PlannedBadge } from "./badge";
import { IconClock } from "./icons";
import { LessonRunner } from "./lesson-runner";

export function LessonStatusBadge({ status }: { status: LessonStatus }) {
  return status === "available" ? (
    <Badge tone="success">Disponível</Badge>
  ) : (
    <PlannedBadge />
  );
}

function PendingPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex items-start gap-3.5 rounded-2xl border border-dashed border-border bg-surface/50 p-6">
      <span
        aria-hidden="true"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-surface-elevated text-muted"
      >
        <IconClock className="h-5 w-5" />
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </div>
  );
}

/**
 * The main instructional-content slot of a lesson page. Until validated
 * material exists (status "planned"), it renders an honest pending panel.
 * An "available" lesson without `content` is a data gap — it also gets an
 * honest fallback instead of a blank area. When validated `content` exists,
 * the runner takes over here and `lessonKey` records real completion in the
 * progress store.
 */
export function LessonContentArea({
  status,
  content,
  lessonKey,
}: {
  status: LessonStatus;
  content?: LessonContent;
  lessonKey?: string;
}) {
  if (status === "available" && content) {
    return <LessonRunner content={content} lessonKey={lessonKey} />;
  }
  if (status === "available") {
    return (
      <PendingPanel
        title="Conteúdo indisponível no momento"
        body="O material desta lição ainda não foi publicado e passará por validação pedagógica e linguística antes de ficar acessível. Nenhum progresso é registrado nesta página."
      />
    );
  }

  return (
    <PendingPanel
      title="Conteúdo em preparação"
      body="O material desta lição — demonstração visual do sinal, explicações e atividades — será desenvolvido e passará por validação pedagógica e linguística antes de ser publicado."
    />
  );
}
