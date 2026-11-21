import Link from "next/link";

import type { LessonContent } from "@/data/lesson-content";
import { getCatalogEntry, isPublishable } from "@/data/lesson-catalog";
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
 * honest fallback instead of a blank area.
 *
 * Publication guard: the runner mounts only when the lesson's catalog entry
 * is publishable — `expert-validated` with the full review chain covering
 * the current content version. A manually flipped `status`, a missing
 * catalog entry or an incomplete review chain falls back to the honest
 * note, and `lessonKey` — the only path that records progress — never
 * reaches the runner. The guard validates the catalog entry; it does not
 * prove `content` matches the reviewed draft (documented residual risk in
 * docs/revisao-processo-publicacao.md).
 */
export function LessonContentArea({
  status,
  content,
  lessonKey,
  draftHref,
  specimenHref,
}: {
  status: LessonStatus;
  content?: LessonContent;
  lessonKey?: string;
  /** Link to the unvalidated draft preview, when the catalog holds one. */
  draftHref?: string;
  /** Link to the visual specimen preview, when one is catalogued. */
  specimenHref?: string;
}) {
  const catalogEntry = lessonKey ? getCatalogEntry(lessonKey) : undefined;
  if (
    status === "available" &&
    content &&
    catalogEntry &&
    isPublishable(catalogEntry)
  ) {
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
      {specimenHref && (
        <Link
          href={specimenHref}
          className="group inline-flex items-center gap-2 self-start text-sm font-medium text-accent transition-colors hover:text-foreground"
        >
          <IconFlask className="h-4 w-4" />
          Ver prévia da demonstração visual — espécime não validado
        </Link>
      )}
      <Link
        href="/laboratorio"
        className="group inline-flex items-center gap-2 self-start text-sm font-medium text-accent transition-colors hover:text-foreground"
      >
        <IconFlask className="h-4 w-4" />
        Conheça as demonstrações do Sinaliza
      </Link>
    </div>
  );
}
