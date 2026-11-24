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
import { IconActivity, IconCheck, IconClock } from "./icons";
import { useAuthSession } from "./use-auth-session";
import { useProgressSnapshot, useProgressSyncState } from "./use-progress";

export const MILESTONES_TITLE = "Marcos da sua jornada";
export const MILESTONES_SUBTITLE =
  "Cada pequeno passo faz parte de uma descoberta maior.";
export const MILESTONES_EMPTY_TITLE = "Uma jornada prestes a começar";
export const MILESTONES_EMPTY_COPY =
  "Seus marcos serão construídos conforme novas atividades forem disponibilizadas.";
export const MILESTONES_NOTE =
  "Os marcos representam sua participação nas atividades, não uma certificação de domínio em Libras.";
export const MILESTONES_ACHIEVED_LABEL = "Alcançado";
export const MILESTONES_SOON_LABEL = "Em breve";

const STATUS_ICON: Record<MilestoneStatus, typeof IconCheck> = {
  achieved: IconCheck,
  available: IconActivity,
  unavailable: IconClock,
};

const STATUS_ICON_TONE: Record<MilestoneStatus, string> = {
  achieved: "border-success/35 bg-success/10 text-success",
  available: "border-accent/35 bg-accent/10 text-accent",
  unavailable: "border-border bg-surface-elevated text-muted",
};

function MilestoneRow({ milestone }: { milestone: Milestone }) {
  const Icon = STATUS_ICON[milestone.status];
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
        {milestone.progress && (
          <p className="text-xs font-medium tabular-nums text-muted">
            {milestone.progress.current} de {milestone.progress.target}
          </p>
        )}
      </div>
    </li>
  );
}

/**
 * Journey milestones — a live projection of the recorded completion set
 * over the published catalog, shared by the home dashboard and /conta.
 *
 * Identity: milestones read `useProgressSnapshot()`, which already
 * resolves the active identity (guest bucket or account bucket), so a
 * sign-in/sign-out can never leak another identity's progress here.
 *
 * Loading is not empty progress: while the session resolves, or while a
 * signed-in account's remote completions are still being merged for the
 * first time this session, the section renders nothing rather than a
 * momentary "zero milestones". A failed hydration still shows the
 * honest local picture (locally recorded participation counts).
 */
export function MilestonesSection() {
  const { status } = useAuthSession();
  const snapshot = useProgressSnapshot();
  const sync = useProgressSyncState();

  const milestones = deriveMilestones(getLearningPaths(), snapshot.completed);
  const summary = summarizeMilestones(milestones);
  const loading =
    status === "loading" ||
    (status === "user" && sync.configured && !sync.hydrated && sync.syncing);

  if (loading) return null;

  const allUnavailable = summary.reachable === 0;

  return (
    <section
      aria-labelledby="journey-milestones-title"
      className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-7"
    >
      <div className="flex flex-col gap-2">
        <h3
          id="journey-milestones-title"
          className="text-sm font-semibold text-foreground"
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

      <ul className="flex flex-col gap-4">
        {milestones.map((milestone) => (
          <MilestoneRow key={milestone.id} milestone={milestone} />
        ))}
      </ul>

      <p className="text-xs leading-relaxed text-muted">{MILESTONES_NOTE}</p>
    </section>
  );
}
