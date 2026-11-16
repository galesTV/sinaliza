"use client";

import Link from "next/link";

import type { LessonStatus } from "@/data/learning-paths";
import { cn } from "@/lib/utils";

import { IconCheck } from "./icons";
import { useProgressSnapshot } from "./use-progress";

/**
 * One lesson link inside a module card. Three honest states:
 * - completed: success check + tint (client-side, after hydration — the
 *   progress store only exists in the browser, so SSR renders it neutral);
 * - planned: visibly unavailable (dashed, muted) — still navigable, because
 *   the lesson page explains the pending state honestly;
 * - available & incomplete: the default actionable styling.
 */
export function ModuleLessonChip({
  href,
  title,
  status,
  lessonKey,
}: {
  href: string;
  title: string;
  status: LessonStatus;
  lessonKey: string;
}) {
  const snapshot = useProgressSnapshot();
  const completed = snapshot.completed.has(lessonKey);
  const planned = status === "planned";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3.5 text-xs font-medium transition-colors duration-200",
        completed
          ? "border-success/40 bg-success/10 text-foreground hover:border-success/60"
          : planned
            ? "border-dashed border-border bg-transparent text-muted/70 hover:border-primary/45 hover:text-muted"
            : "border-border bg-surface-elevated/60 text-muted hover:border-primary/45 hover:text-foreground",
      )}
    >
      {completed && (
        <IconCheck aria-hidden="true" className="h-3 w-3 text-success" />
      )}
      {title}
      {completed && <span className="sr-only">(concluída)</span>}
      {!completed && planned && <span className="sr-only">(em breve)</span>}
    </Link>
  );
}
