import Link from "next/link";

import { getLessonUrl, type CourseModule } from "@/data/learning-paths";

import { PlannedBadge } from "./badge";

export function ModuleCard({
  module,
  index,
  pathSlug,
}: {
  module: CourseModule;
  index: number;
  pathSlug: string;
}) {
  return (
    <li
      id={module.slug}
      className="flex scroll-mt-24 gap-5 rounded-2xl border border-border bg-surface p-6"
    >
      <span
        aria-hidden="true"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface-elevated font-display text-sm font-semibold tabular-nums text-primary-soft"
      >
        {index + 1}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-base font-semibold text-foreground">
              {module.title}
            </h3>
            <PlannedBadge />
          </div>
          <p className="text-sm leading-relaxed text-muted">
            {module.description}
          </p>
        </div>

        <ul
          className="flex flex-wrap gap-2"
          aria-label={`Lições do módulo ${module.title}`}
        >
          {module.lessons.map((lesson) => (
            <li key={lesson.slug}>
              <Link
                href={getLessonUrl(pathSlug, module.slug, lesson.slug)}
                className="inline-flex items-center rounded-lg border border-border bg-surface-elevated/60 px-3 py-1.5 text-xs font-medium text-muted transition-colors duration-200 hover:border-primary/45 hover:text-foreground"
              >
                {lesson.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
