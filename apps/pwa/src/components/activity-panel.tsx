"use client";

import Link from "next/link";

import { getLessonContext } from "@/data/learning-paths";
import { parseLessonKey } from "@/lib/progress";

import { IconActivity, IconCheck, IconGraduationCap } from "./icons";
import { useProgressSnapshot } from "./use-progress";

interface CompletedItem {
  key: string;
  title: string;
  url: string;
}

function EmptyActivity() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border bg-surface/50 p-7">
      <span
        aria-hidden="true"
        className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface-elevated text-muted"
      >
        <IconActivity className="h-5 w-5" />
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-foreground">
          Nenhuma atividade ainda
        </p>
        <p className="max-w-lg text-sm leading-relaxed text-muted">
          Quando as primeiras lições forem liberadas e você concluir uma delas,
          suas lições concluídas aparecem aqui.
        </p>
      </div>
      <Link
        href="/trilhas"
        className="inline-flex min-h-10 items-center gap-2 rounded-[10px] border border-primary/35 bg-primary/10 px-4 text-xs font-semibold text-primary-soft transition-colors duration-200 hover:border-primary/60"
      >
        <IconGraduationCap className="h-4 w-4" />
        Ver o que vem por aí
      </Link>
    </div>
  );
}

export function ActivityPanel({ items }: { items: CompletedItem[] }) {
  if (items.length === 0) return <EmptyActivity />;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7">
      <p className="text-sm font-semibold text-foreground">
        {items.length === 1
          ? "1 lição concluída"
          : `${items.length} lições concluídas`}
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.url}
              className="group inline-flex items-center gap-2.5 rounded-lg text-sm text-muted transition-colors duration-200 hover:text-foreground"
            >
              <IconCheck className="h-4 w-4 text-success" />
              <span className="font-medium text-foreground">{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Dashboard summary of real lesson progress. Reads only the real progress
 * store — laboratory activity never appears here.
 */
export function ActivitySummary() {
  const snapshot = useProgressSnapshot();
  const items = [...snapshot.completed].flatMap((key) => {
    const parsed = parseLessonKey(key);
    if (!parsed) return [];
    const context = getLessonContext(
      parsed.pathSlug,
      parsed.moduleSlug,
      parsed.lessonSlug,
    );
    if (!context) return [];
    return [
      {
        key,
        title: context.lesson.title,
        url: `/trilhas/${parsed.pathSlug}/${parsed.moduleSlug}/${parsed.lessonSlug}`,
      },
    ];
  });

  return <ActivityPanel items={items} />;
}
