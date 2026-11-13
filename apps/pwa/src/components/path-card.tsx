import Link from "next/link";

import { getPathStats, type LearningPath } from "@/data/learning-paths";

import { Badge } from "./badge";
import { IconArrowRight, IconChat, IconType } from "./icons";

const PATH_ICONS = {
  alphabet: IconType,
  vocabulary: IconChat,
} as const;

export function PathCard({ path }: { path: LearningPath }) {
  const stats = getPathStats(path);
  const Icon = PATH_ICONS[path.icon];

  return (
    <Link
      href={`/trilhas/${path.slug}`}
      className="group flex h-full flex-col gap-5 rounded-2xl border border-border bg-surface p-6 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/45"
    >
      <div className="flex items-start justify-between gap-4">
        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/35 bg-gradient-to-br from-primary/25 to-accent/10 text-primary-soft"
        >
          <Icon className="h-5 w-5" />
        </span>
        <Badge tone="accent">Disponível</Badge>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
          {path.title}
        </h3>
        <p className="text-sm leading-relaxed text-muted">{path.summary}</p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <span className="text-xs tabular-nums text-muted">
          {stats.moduleCount} módulos · {stats.lessonCount} lições
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-soft transition-colors duration-200 group-hover:text-accent">
          Ver trilha
          <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
