"use client";

import { getLearningPaths } from "@/data/learning-paths";
import {
  deriveMilestones,
  summarizeMilestones,
  type Milestone,
  type MilestoneStatus,
} from "@/lib/milestones";
import { cn } from "@/lib/utils";

import { Badge } from "./badge";
import { Eyebrow } from "./eyebrow";
import {
  IconActivity,
  IconArrowRight,
  IconFlag,
  IconLayers,
  IconMap,
  IconRoute,
  IconCheck,
} from "./icons";
import { useAuthSession } from "./use-auth-session";
import { useProgressSnapshot, useProgressSyncState } from "./use-progress";

export const MILESTONES_TITLE = "Marcos da sua jornada";
export const MILESTONES_SUBTITLE =
  "Cada pequeno passo faz parte de uma descoberta maior.";
export const MILESTONES_EYEBROW = "Observatório Pessoal";
export const MILESTONES_EMPTY_TITLE = "Uma jornada prestes a começar";
export const MILESTONES_EMPTY_COPY =
  "Seus marcos serão construídos conforme novas atividades forem disponibilizadas.";
export const MILESTONES_NOTE =
  "Os marcos acompanham as atividades atualmente publicadas e representam sua participação, não uma certificação de domínio em Libras.";
export const MILESTONES_ACHIEVED_LABEL = "Alcançado";
export const MILESTONES_SOON_LABEL = "Em breve";

/** Conceptual icon per milestone — the badge communicates the state. */
const MILESTONE_ICON: Record<string, typeof IconCheck> = {
  "primeiro-passo": IconArrowRight,
  base: IconLayers,
  "novos-caminhos": IconRoute,
  "etapa-percorrida": IconFlag,
  "caminho-percorrido": IconMap,
};

const STATUS_ICON_TONE: Record<MilestoneStatus, string> = {
  achieved: "border-success/35 bg-success/10 text-success",
  available: "border-accent/35 bg-accent/10 text-accent",
  unavailable: "border-border bg-surface-elevated text-muted",
};

/**
 * Human-readable unit for each counter, keyed by milestone id — the bare
 * "n de N" numbers need their meaning spelled out (activities? modules?
 * which module/path? — the closest one, per `closest()`).
 */
export function progressLabel(milestone: Milestone): string | null {
  const progress = milestone.progress;
  if (!progress) return null;
  const { current, target } = progress;
  switch (milestone.id) {
    case "base":
      return `${current} de ${target} atividades`;
    case "novos-caminhos":
      return `${current} de ${target} módulos`;
    case "etapa-percorrida":
      return `Módulo mais próximo: ${current} de ${target} atividades`;
    case "caminho-percorrido":
      return `Trilha mais próxima: ${current} de ${target} atividades`;
    default:
      return `${current} de ${target}`;
  }
}

function MilestoneRow({ milestone }: { milestone: Milestone }) {
  const Icon = MILESTONE_ICON[milestone.id] ?? IconActivity;
  const label = progressLabel(milestone);
  return (
    <li className="flex items-start gap-3.5">
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border",
          STATUS_ICON_TONE[milestone.status],
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <p
            className={cn(
              "text-sm font-semibold",
              milestone.status === "unavailable"
                ? "text-muted"
                : "text-foreground",
            )}
          >
            {milestone.title}
          </p>
          {milestone.status === "achieved" && (
            <Badge tone="success">{MILESTONES_ACHIEVED_LABEL}</Badge>
          )}
          {milestone.status === "unavailable" && (
            <Badge tone="neutral">{MILESTONES_SOON_LABEL}</Badge>
          )}
        </div>
        <p className="text-sm leading-relaxed text-muted">
          {milestone.description}
        </p>
        {label && (
          <p className="text-xs font-medium tabular-nums text-muted">{label}</p>
        )}
      </div>
    </li>
  );
}

/**
 * Pure presentation of a derived milestone list — takes the projection
 * as props so it stays testable with synthetic catalogs and free of any
 * identity/loading concerns (the wrapper owns those).
 */
export function MilestonesView({
  milestones,
}: {
  milestones: readonly Milestone[];
}) {
  const summary = summarizeMilestones(milestones);
  const allUnavailable = summary.reachable === 0;

  return (
    <section
      aria-labelledby="journey-milestones-title"
      className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-7"
    >
      <div className="flex flex-col gap-2.5">
        <Eyebrow>{MILESTONES_EYEBROW}</Eyebrow>
        <h3
          id="journey-milestones-title"
          className="font-display text-lg font-semibold tracking-tight text-foreground"
        >
          {MILESTONES_TITLE}
        </h3>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          {MILESTONES_SUBTITLE}
        </p>
      </div>

      {allUnavailable ? (
        <div className="flex flex-col gap-1.5 rounded-xl border border-dashed border-border bg-surface-elevated/60 px-5 py-4">
          <p className="text-sm font-semibold text-foreground">
            {MILESTONES_EMPTY_TITLE}
          </p>
          <p className="text-sm leading-relaxed text-muted">
            {MILESTONES_EMPTY_COPY}
          </p>
        </div>
      ) : (
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          {summary.achieved === 1
            ? `1 de ${summary.reachable} marcos disponíveis alcançado`
            : `${summary.achieved} de ${summary.reachable} marcos disponíveis alcançados`}
        </p>
      )}

      <ul className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {milestones.map((milestone) => (
          <MilestoneRow key={milestone.id} milestone={milestone} />
        ))}
      </ul>

      <p className="text-xs leading-relaxed text-muted">{MILESTONES_NOTE}</p>
    </section>
  );
}

/**
 * Journey milestones wired to the live identity — a projection of the
 * recorded completion set over the published catalog, shared by the
 * home dashboard and /conta.
 *
 * Identity: `useProgressSnapshot()` resolves the snapshot under the
 * identity computed for this render (guest bucket or account bucket),
 * and `useProgressSyncState()` reports that same identity's sync state.
 *
 * Loading is not empty progress: while the session resolves, or while a
 * signed-in account's first remote merge of this session is in flight,
 * the section renders nothing rather than a momentary "zero milestones".
 * When the merge has already failed (not hydrated, nothing in flight),
 * the honest local picture renders — locally recorded participation
 * already counts toward milestones.
 */
export function MilestonesSection() {
  const { status } = useAuthSession();
  const snapshot = useProgressSnapshot();
  const sync = useProgressSyncState();

  const loading =
    status === "loading" ||
    (status === "user" && sync.configured && !sync.hydrated && sync.syncing);

  if (loading) return null;

  return (
    <MilestonesView
      milestones={deriveMilestones(getLearningPaths(), snapshot.completed)}
    />
  );
}
