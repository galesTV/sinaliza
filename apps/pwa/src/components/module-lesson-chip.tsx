"use client";

import Link from "next/link";

import type { LessonStatus } from "@/data/learning-paths";
import { isLessonCompletable } from "@/data/path-publication";
import { cn } from "@/lib/utils";

import { IconCheck } from "./icons";
import { useProgressSnapshot } from "./use-progress";

export type LessonChipState = "completed" | "pending" | "actionable";

/**
 * Display state of a lesson chip. Eligibility precedes completion: a
 * stored completion of a currently non-completable lesson yields
 * "pending" — the record stays, but a "done" chip would promise
 * availability that does not exist today.
 */
export function lessonChipState(
  completable: boolean,
  hasCompletion: boolean,
): LessonChipState {
  if (!completable) return "pending";
  return hasCompletion ? "completed" : "actionable";
}

/**
 * One lesson link inside a module card. Three honest states:
 * - completed: success check + tint (client-side, after hydration — the
 *   progress store only exists in the browser, so SSR renders it neutral);
 * - not completable (planned, or "available" without a publishable
 *   catalog entry): visibly in preparation (dashed, muted) — still
 *   navigable, because the lesson page explains the pending state
 *   honestly. An informational link is not a learnable activity.
 * - completable & incomplete: the default actionable styling.
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
  const state = lessonChipState(
    isLessonCompletable(lessonKey, status),
    snapshot.completed.has(lessonKey),
  );
  const completed = state === "completed";
  const pending = state === "pending";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3.5 text-xs font-medium transition-colors duration-200",
        completed
          ? "border-success/40 bg-success/10 text-foreground hover:border-success/60"
          : pending
            ? "border-dashed border-border bg-transparent text-muted/70 hover:border-primary/45 hover:text-muted"
            : "border-border bg-surface-elevated/60 text-muted hover:border-primary/45 hover:text-foreground",
      )}
    >
      {completed && (
        <IconCheck aria-hidden="true" className="h-3 w-3 text-success" />
      )}
      {title}
      {completed && <span className="sr-only">(concluída)</span>}
      {!completed && pending && <span className="sr-only">(em preparação)</span>}
    </Link>
  );
}
