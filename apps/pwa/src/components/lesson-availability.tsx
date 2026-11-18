import Link from "next/link";

import type { LessonContent } from "@/data/lesson-content";
import type { LessonStatus } from "@/data/learning-paths";

import { Badge, PlannedBadge } from "./badge";
import { HonestNote } from "./honest-note";
import { IconFlask } from "./icons";
import { LessonRunner } from "./lesson-runner";

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
 * An "available" lesson without `content` is a data gap — it also gets an
 * honest fallback instead of a blank area. When validated `content` exists,
 * the runner takes over here and `lessonKey` records real completion in the
 * progress store.
 */
export function LessonContentArea({
  status,
  content,
  lessonKey,
  draftHref,
}: {
  status: LessonStatus;
  content?: LessonContent;
  lessonKey?: string;
  /** Link to the unvalidated draft preview, when the catalog holds one. */
  draftHref?: string;
}) {
  if (status === "available" && content) {
    return <LessonRunner content={content} lessonKey={lessonKey} />;
  }
  if (status === "available") {
    return (
      <HonestNote title="Conteúdo indisponível no momento">
        O material desta lição ainda não foi publicado e passará por validação
        pedagógica e linguística antes de ficar acessível. Nenhum progresso é
        registrado nesta página.
      </HonestNote>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <HonestNote title="Conteúdo em preparação">
        O material desta lição — demonstração visual do sinal, explicações e
        atividades — será desenvolvido e passará por validação pedagógica e
        linguística antes de ser publicado.
      </HonestNote>
      {draftHref && (
        <Link
          href={draftHref}
          className="group inline-flex items-center gap-2 self-start text-sm font-medium text-accent transition-colors hover:text-foreground"
        >
          <IconFlask className="h-4 w-4" />
          Ver prévia do conteúdo em revisão — rascunho não validado
        </Link>
      )}
    </div>
  );
}
