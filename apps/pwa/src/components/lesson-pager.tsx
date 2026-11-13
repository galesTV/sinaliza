import Link from "next/link";

import { getLessonUrl, type LessonContext } from "@/data/learning-paths";

import { IconArrowLeft, IconArrowRight } from "./icons";

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
  return (
    <Link
      href={getLessonUrl(context.path.slug, context.module.slug, lesson.slug)}
      className="group flex min-h-11 items-center gap-3 rounded-[11px] border border-border bg-white/[0.025] px-4 py-2.5 text-sm transition-colors duration-200 hover:bg-white/[0.07]"
    >
      {isPrevious && (
        <IconArrowLeft className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-foreground" />
      )}
      <span className="flex min-w-0 flex-col">
        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
          {isPrevious ? "Lição anterior" : "Próxima lição"}
        </span>
        <span className="truncate font-semibold text-foreground">
          {lesson.title}
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
