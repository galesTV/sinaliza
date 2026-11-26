import Link from "next/link";

import { getLessonUrl, type LessonContext } from "@/data/learning-paths";
import { isLessonCompletable } from "@/data/path-publication";
import { lessonKey } from "@/lib/progress";

import { IconArrowLeft, IconArrowRight } from "./icons";

/**
 * Editorial navigation within the current module — it walks the planned
 * sequence, so it is deliberately NOT the learning recommendation (that
 * lives in `PathResumeCta`). A destination that is not completable is
 * labeled "Em preparação" instead of being presented as the next
 * available learning activity.
 */
function PagerLink({
  context,
  lesson,
  direction,
}: {
  context: LessonContext;
  lesson: NonNullable<LessonContext["previous"]>;
  direction: "previous" | "next";
}) {
  const isPrevious = direction === "previous";
  const completable = isLessonCompletable(
    lessonKey(context.path.slug, context.module.slug, lesson.slug),
    lesson.status,
  );
  return (
    <Link
      href={getLessonUrl(context.path.slug, context.module.slug, lesson.slug)}
      className="group flex min-h-11 min-w-0 items-center gap-3 rounded-[11px] border border-border bg-white/[0.025] px-4 py-2.5 text-sm transition-colors duration-200 hover:bg-white/[0.07]"
    >
      {isPrevious && (
        <IconArrowLeft className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-foreground" />
      )}
      <span className="flex min-w-0 flex-col">
        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
          {isPrevious
            ? "Conteúdo anterior do percurso"
            : "Próximo conteúdo do percurso"}
        </span>
        <span className="flex min-w-0 flex-wrap items-baseline font-semibold text-foreground">
          <span className="truncate">{lesson.title}</span>
          {!completable && (
            <span className="whitespace-nowrap font-normal text-muted">
              {" "}
              · Em preparação
            </span>
          )}
        </span>
      </span>
      {!isPrevious && (
        <IconArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-foreground" />
      )}
    </Link>
  );
}

export function LessonPager({ context }: { context: LessonContext }) {
  return (
    <nav
      aria-label="Navegação entre lições"
      className="grid gap-3 sm:grid-cols-2"
    >
      {context.previous ? (
        <PagerLink
          context={context}
          lesson={context.previous}
          direction="previous"
        />
      ) : (
        <span aria-hidden="true" />
      )}
      {context.next && (
        <PagerLink context={context} lesson={context.next} direction="next" />
      )}
    </nav>
  );
}
