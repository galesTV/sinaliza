import { getLessonUrl, type CourseModule } from "@/data/learning-paths";
import { lessonKey } from "@/lib/progress";
import { cn } from "@/lib/utils";

import { PlannedBadge } from "./badge";
import { ModuleLessonChip } from "./module-lesson-chip";

/**
 * One module in the path's learning trajectory: a numbered node on the
 * journey rail plus the module card. Nodes encode sequence only — never
 * progress or availability (MASTER.md §1; content states stay text-honest).
 * The rail is decorative; the surrounding `<ol>` carries the real order.
 */
export function ModuleCard({
  module,
  index,
  total,
  pathSlug,
  isLast = false,
}: {
  module: CourseModule;
  index: number;
  total: number;
  pathSlug: string;
  isLast?: boolean;
}) {
  return (
    <li id={module.slug} className="flex scroll-mt-24 gap-4 sm:gap-5">
      <div
        aria-hidden="true"
        className="flex w-11 shrink-0 flex-col items-center"
      >
        {/* Stub edge from the previous node; the first node starts the path. */}
        <span
          className={cn(
            "h-7 w-px shrink-0",
            index === 0 ? "bg-transparent" : "bg-primary-soft/35",
          )}
        />
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary-soft/45 bg-surface-elevated font-display text-sm font-semibold tabular-nums text-primary-soft shadow-[0_0_18px_rgba(105,87,232,0.28)]">
          {index + 1}
        </span>
        {/* Fading trail to the next node; -mb-4 bridges the list gap. */}
        {!isLast && (
          <span className="-mb-4 w-px flex-1 bg-gradient-to-b from-primary-soft/40 to-primary-soft/15" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-base font-semibold text-foreground">
              <span className="sr-only">
                Módulo {index + 1} de {total}:{" "}
              </span>
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
              <ModuleLessonChip
                href={getLessonUrl(pathSlug, module.slug, lesson.slug)}
                title={lesson.title}
                status={lesson.status}
                lessonKey={lessonKey(pathSlug, module.slug, lesson.slug)}
              />
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
