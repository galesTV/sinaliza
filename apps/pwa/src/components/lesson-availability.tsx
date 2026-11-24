import Link from "next/link";

import { getCatalogEntry } from "@/data/lesson-catalog";
import type { LessonStatus } from "@/data/learning-paths";
import { isLessonCompletable } from "@/data/path-publication";

import { Badge, PlannedBadge } from "./badge";
import { HonestNote } from "./honest-note";
import { IconFlask } from "./icons";
import { LessonRunner } from "./lesson-runner";

/**
 * Availability badge for a lesson page header. "Disponível" only when the
 * lesson is actually completable — `status === "available"` AND a
 * publishable catalog entry — so the badge never promises learnability
 * the content area below will refuse. `lessonKey` is required: no caller
 * may assert availability outside the unified eligibility rule.
 */
export function LessonStatusBadge({
  status,
  lessonKey,
}: {
  status: LessonStatus;
  lessonKey: string;
}) {
  return isLessonCompletable(lessonKey, status) ? (
    <Badge tone="success">Disponível</Badge>
  ) : (
    <PlannedBadge />
  );
}

/**
 * The main instructional-content slot of a lesson page. Until validated
 * material exists (status "planned"), it renders an honest pending panel.
 * An "available" lesson whose catalog entry is missing or not publishable
 * is a data gap — it also gets an honest fallback instead of a blank area.
 *
 * Publication guard: the runner mounts only when the lesson is completable
 * (`isLessonCompletable`) — `status === "available"` AND a publishable
 * catalog entry: `expert-validated` with the full review chain covering
 * the current content version and a well-formed draft. A manually flipped
 * `status`, a missing catalog entry or an incomplete review chain falls
 * back to the honest note, and `lessonKey` — the only path that records
 * progress — never reaches the runner. The rendered content is
 * `catalogEntry.draft` itself, so what the learner sees is by construction
 * the exact draft the review chain covered at `entry.version` — there is
 * no second content source to diverge from.
 */
export function LessonContentArea({
  status,
  lessonKey,
  draftHref,
  specimenHref,
}: {
  status: LessonStatus;
  lessonKey?: string;
  /** Link to the unvalidated draft preview, when the catalog holds one. */
  draftHref?: string;
  /** Link to the visual specimen preview, when one is catalogued. */
  specimenHref?: string;
}) {
  const catalogEntry = lessonKey ? getCatalogEntry(lessonKey) : undefined;
  if (
    lessonKey &&
    catalogEntry?.draft &&
    isLessonCompletable(lessonKey, status)
  ) {
    return <LessonRunner content={catalogEntry.draft} lessonKey={lessonKey} />;
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
