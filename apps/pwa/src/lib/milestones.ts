/**
 * Pure derivation of the learner's journey milestones.
 *
 * Milestones are a projection, not a persisted entity: published
 * catalog + recorded completion keys -> a stable list for the UI.
 * Nothing here mutates its inputs, touches React/storage/Supabase, or
 * reads timestamps — recompute any time the catalog or progress
 * changes and the milestones track the *currently published* lessons.
 *
 * Semantics:
 * - Only completable lessons count (`isLessonCompletable` — the same
 *   rule the lesson runner and path progress use): `available` status
 *   plus a publishable catalog entry. Unknown keys, planned lessons and
 *   not-yet-publishable material are ignored, so recorded progress can
 *   never outrun what is actually completable.
 * - A module or path with zero eligible lessons can never count as
 *   "percorrido" — empty containers are not accomplishments.
 * - `unavailable` means the published catalog cannot satisfy the
 *   criterion today (e.g. fewer than five eligible lessons). It is a
 *   temporary catalog fact, never a shortcoming of the learner.
 */

import type { LearningPath } from "@/data/learning-paths";
import { isLessonCompletable } from "@/data/path-publication";
import { lessonKey } from "@/lib/progress";

export type MilestoneStatus = "achieved" | "available" | "unavailable";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  /**
   * Partial advance toward an `available` milestone. Omitted when
   * `achieved` (the state itself is the message) and always omitted
   * when `unavailable` — an unreachable target is never presented as
   * pending learner work.
   */
  progress?: { current: number; target: number };
}

interface CompletionTally {
  eligible: number;
  completed: number;
}

interface CatalogTally {
  /** Every module in catalog order, identity = (path, module) pair. */
  modules: CompletionTally[];
  /** Every path in catalog order. */
  paths: CompletionTally[];
  eligibleTotal: number;
  completedTotal: number;
}

/**
 * Count eligible (completable) lessons and recorded completions per
 * module, per path, and across the whole catalog. Module identity is
 * positional — each entry belongs to its (path, module) pair, so
 * identical module slugs in different paths never merge.
 */
function tallyCatalog(
  paths: readonly LearningPath[],
  completed: ReadonlySet<string>,
): CatalogTally {
  const catalogs: CatalogTally = {
    modules: [],
    paths: [],
    eligibleTotal: 0,
    completedTotal: 0,
  };
  for (const path of paths) {
    const pathTally: CompletionTally = { eligible: 0, completed: 0 };
    for (const courseModule of path.modules) {
      const moduleTally: CompletionTally = { eligible: 0, completed: 0 };
      for (const lesson of courseModule.lessons) {
        const key = lessonKey(path.slug, courseModule.slug, lesson.slug);
        if (!isLessonCompletable(key, lesson.status)) continue;
        moduleTally.eligible += 1;
        pathTally.eligible += 1;
        catalogs.eligibleTotal += 1;
        if (completed.has(key)) {
          moduleTally.completed += 1;
          pathTally.completed += 1;
          catalogs.completedTotal += 1;
        }
      }
      catalogs.modules.push(moduleTally);
    }
    catalogs.paths.push(pathTally);
  }
  return catalogs;
}

function statusOf(achieved: boolean, reachable: boolean): MilestoneStatus {
  if (achieved) return "achieved";
  return reachable ? "available" : "unavailable";
}

function progressOf(
  status: MilestoneStatus,
  current: number,
  target: number,
): Milestone["progress"] {
  // A "0 de 1" bar carries no information — binary milestones keep no
  // counter while multi-step ones report real partial advance.
  if (status !== "available" || target <= 1) return undefined;
  return { current: Math.min(current, target), target };
}

/**
 * The closest candidate for a "percorrido" milestone: the tally with the
 * highest completion ratio (ties broken by absolute completions, then
 * catalog order), so progress reads as "the module/path nearest done".
 */
function closest(tallies: CompletionTally[]): CompletionTally | undefined {
  let best: CompletionTally | undefined;
  for (const tally of tallies) {
    if (tally.eligible === 0) continue;
    if (
      best === undefined ||
      tally.completed * best.eligible > best.completed * tally.eligible ||
      (tally.completed * best.eligible === best.completed * tally.eligible &&
        tally.completed > best.completed)
    ) {
      best = tally;
    }
  }
  return best;
}

export function deriveMilestones(
  paths: readonly LearningPath[],
  completed: ReadonlySet<string>,
): Milestone[] {
  const { modules, paths: pathTallies, eligibleTotal, completedTotal } =
    tallyCatalog(paths, completed);

  const eligibleModules = modules.filter((m) => m.eligible > 0);
  const eligiblePaths = pathTallies.filter((p) => p.eligible > 0);
  const touchedModules = modules.filter((m) => m.completed > 0).length;
  const bestModule = closest(eligibleModules);
  const bestPath = closest(eligiblePaths);

  const first = statusOf(completedTotal >= 1, eligibleTotal >= 1);
  const base = statusOf(completedTotal >= 5, eligibleTotal >= 5);
  const twoModules = statusOf(touchedModules >= 2, eligibleModules.length >= 2);
  const moduleDone = statusOf(
    eligibleModules.some((m) => m.completed === m.eligible),
    eligibleModules.length >= 1,
  );
  const pathDone = statusOf(
    eligiblePaths.some((p) => p.completed === p.eligible),
    eligiblePaths.length >= 1,
  );

  return [
    {
      id: "primeiro-passo",
      title: "Primeiro passo",
      description: "Conclua sua primeira atividade publicada.",
      status: first,
    },
    {
      id: "base",
      title: "Construindo uma base",
      description: "Conclua cinco atividades publicadas diferentes.",
      status: base,
      progress: progressOf(base, completedTotal, 5),
    },
    {
      id: "novos-caminhos",
      title: "Novos caminhos",
      description: "Conclua atividades em dois módulos diferentes.",
      status: twoModules,
      progress: progressOf(twoModules, touchedModules, 2),
    },
    {
      id: "etapa-percorrida",
      title: "Uma etapa percorrida",
      description: "Percorra todas as atividades publicadas de um módulo.",
      status: moduleDone,
      progress: progressOf(
        moduleDone,
        bestModule?.completed ?? 0,
        bestModule?.eligible ?? 1,
      ),
    },
    {
      id: "caminho-percorrido",
      title: "Caminho percorrido",
      description: "Percorra todas as atividades publicadas de uma trilha.",
      status: pathDone,
      progress: progressOf(
        pathDone,
        bestPath?.completed ?? 0,
        bestPath?.eligible ?? 1,
      ),
    },
  ];
}

export interface MilestoneSummary {
  /** Milestones the published catalog lets the learner reach now. */
  reachable: number;
  /** Reachable milestones already achieved. */
  achieved: number;
}

/**
 * Summary over the achievable subset only: temporarily unavailable
 * milestones never enter the denominator, so the fraction can never
 * read as stalled learner progress.
 */
export function summarizeMilestones(
  milestones: readonly Milestone[],
): MilestoneSummary {
  let reachable = 0;
  let achieved = 0;
  for (const milestone of milestones) {
    if (milestone.status === "unavailable") continue;
    reachable += 1;
    if (milestone.status === "achieved") achieved += 1;
  }
  return { reachable, achieved };
}
