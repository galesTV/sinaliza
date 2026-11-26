"use client";

import { io } from "next/cache";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState, useTransition } from "react";

import { getLessonContext } from "@/data/learning-paths";
import { isLessonCompletable } from "@/data/path-publication";
import { parseLessonKey } from "@/lib/progress";
import {
  advanceHistoryTracker,
  buildPendingItems,
  groupHistoryByDay,
  INITIAL_HISTORY_TRACKER,
  type HistoryRow,
  type PendingItemState,
} from "@/lib/progress-history";

import { IconCheck, IconClock, IconRefresh, IconX } from "./icons";
import { useAuthSession } from "./use-auth-session";
import { useProgressSyncState } from "./use-progress";

/**
 * Copy for the activity history — pure functions/constants so the strings
 * stay unit-testable without a DOM.
 *
 * Honesty rules:
 * - `completed_at` is the first remote write, not the learning moment:
 *   labels say "registrada"/"registrado", never "concluída em".
 * - Pending local records have no timestamp at all — the pending group
 *   shows none, and it never presents itself as remote confirmation.
 * - "Atualizando histórico" means the write already reached the remote
 *   and this list is catching up — never a fake remote record.
 */
export const HISTORY_NOTE_COPY =
  "As datas indicam quando as atividades foram registradas na sua conta, " +
  "incluindo aquelas sincronizadas ou transferidas posteriormente.";

export const HISTORY_EMPTY_COPY =
  "Nenhuma atividade registrada na sua conta ainda — suas lições " +
  "concluídas aparecem aqui quando forem registradas.";

export const HISTORY_TRUNCATED_COPY =
  "Exibindo os registros mais recentes.";

export const HISTORY_PENDING_LABEL = "Aguardando sincronização";

export const HISTORY_UPDATING_COPY = "Atualizando histórico";

export const HISTORY_FAILED_COPY = "Nova tentativa ao reconectar";

export const HISTORY_REFRESH_COPY = "Atualizar histórico";

export const HISTORY_REFRESH_BUSY_COPY = "Atualizando…";

export const HISTORY_RETRY_COPY = "Tentar novamente";

export const HISTORY_ERROR_COPY =
  "Não foi possível carregar seu histórico agora — seus dados " +
  "continuam seguros.";

export interface ResolvedHistoryTitle {
  title: string;
  /** Module/path context line, e.g. "Primeiras letras · Alfabeto". */
  context: string | null;
  /** Lesson URL — only for content the learner can actually open. */
  url: string | null;
}

const UNAVAILABLE_TITLE = "Lição indisponível";

/**
 * Resolve a completion key to a display title. Unknown keys — lessons
 * removed from the catalog or never shipped — get a neutral label, never
 * the raw internal key. A link is offered only when the lesson is both
 * resolvable and completable (available + publishable catalog entry).
 */
export function resolveHistoryTitle(lessonKey: string): ResolvedHistoryTitle {
  const parsed = parseLessonKey(lessonKey);
  if (!parsed) {
    return { title: UNAVAILABLE_TITLE, context: null, url: null };
  }
  const context = getLessonContext(
    parsed.pathSlug,
    parsed.moduleSlug,
    parsed.lessonSlug,
  );
  if (!context) {
    return { title: UNAVAILABLE_TITLE, context: null, url: null };
  }
  return {
    title: context.lesson.title,
    context: `${context.module.title} · ${context.path.title}`,
    url: isLessonCompletable(lessonKey, context.lesson.status)
      ? `/trilhas/${parsed.pathSlug}/${parsed.moduleSlug}/${parsed.lessonSlug}`
      : null,
  };
}

type HistoryItemVariant = "registered" | PendingItemState;

/**
 * Discrete visual treatment per record state — neutral icons for
 * transient states, success only for real remote records, a warning
 * mark plus recovery copy only for actual queue failures. Nothing here
 * suggests skill or Libras proficiency.
 */
export const HISTORY_STATE_PRESENTATION: Record<
  HistoryItemVariant,
  { Icon: typeof IconCheck; className: string }
> = {
  registered: { Icon: IconCheck, className: "text-success" },
  pending: { Icon: IconClock, className: "text-muted" },
  updating: { Icon: IconRefresh, className: "text-accent" },
  failed: { Icon: IconX, className: "text-destructive" },
};

function stateMeta(state: PendingItemState): string | undefined {
  if (state === "failed") return HISTORY_FAILED_COPY;
  if (state === "updating") return HISTORY_UPDATING_COPY;
  return undefined;
}

/**
 * The transient group's heading reflects what it actually holds: once
 * every entry has left the queue and only awaits the next snapshot,
 * "Aguardando sincronização" would mislabel them — the group reads
 * "Atualizando histórico" instead.
 */
export function transientGroupLabel(
  items: readonly { state: PendingItemState }[],
): string {
  return items.every((item) => item.state === "updating")
    ? HISTORY_UPDATING_COPY
    : HISTORY_PENDING_LABEL;
}

/**
 * Manual refresh affordance — the recovery path when a fetch fails or
 * the list looks stale. One click, one router.refresh(): no polling,
 * no automatic retries.
 */
export function HistoryRefreshButton({
  label = HISTORY_REFRESH_COPY,
}: {
  label?: string;
}) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => startTransition(() => router.refresh())}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors duration-200 hover:text-primary-soft disabled:cursor-wait disabled:opacity-60"
    >
      <IconRefresh aria-hidden="true" className="h-3.5 w-3.5" />
      {busy ? HISTORY_REFRESH_BUSY_COPY : label}
    </button>
  );
}

/** Error state for the history section — copy plus manual recovery. */
export function HistoryErrorNote() {
  return (
    <div className="flex flex-col gap-2">
      <p role="status" className="text-sm leading-relaxed text-muted">
        {HISTORY_ERROR_COPY}
      </p>
      <HistoryRefreshButton label={HISTORY_RETRY_COPY} />
    </div>
  );
}

function HistoryItem({
  lessonKey,
  meta,
  variant = "registered",
}: {
  lessonKey: string;
  meta?: string;
  variant?: HistoryItemVariant;
}) {
  const resolved = resolveHistoryTitle(lessonKey);
  const { Icon, className } = HISTORY_STATE_PRESENTATION[variant];
  const body = (
    <>
      <Icon aria-hidden="true" className={`mt-0.5 h-4 w-4 shrink-0 ${className}`} />
      <span className="flex flex-col">
        <span className="font-medium text-foreground">{resolved.title}</span>
        <span className="text-xs text-muted">
          {[resolved.context, meta].filter(Boolean).join(" · ")}
        </span>
      </span>
    </>
  );
  return (
    <li className="flex items-start gap-2.5 text-sm">
      {resolved.url ? (
        <Link
          href={resolved.url}
          className="flex items-start gap-2.5 transition-colors duration-200 hover:opacity-80"
        >
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  );
}

/** Debounce window so a run of queue confirms coalesces into one refresh. */
const REFRESH_DEBOUNCE_MS = 800;

/**
 * The mounted history for the account that owns `rows`. Transient queue
 * tracking lives here only — keyed on `userId` by the wrapper, so a
 * session switch remounts it empty and no other account's keys can ever
 * accumulate in its state.
 */
function ActivityHistoryInner({
  userId,
  rows,
  truncated,
  snapshotId,
}: {
  userId: string;
  rows: HistoryRow[];
  truncated: boolean;
  snapshotId: string;
}) {
  // Cache Components treats wall-clock reads during server-side rendering as
  // synchronous IO; `io()` keeps the day grouping out of the static shell.
  use(io());

  const { status, user } = useAuthSession();
  const sync = useProgressSyncState();
  const router = useRouter();
  const isOwner = status === "user" && user?.id === userId;

  const remoteKeys = useMemo(
    () => new Set(rows.map((row) => row.lessonKey)),
    [rows],
  );

  // Fold each sync emission through the pure tracker (state adjusted
  // during render — the documented alternative to setState-in-effect).
  // A non-owner emission feeds an EMPTY queue so foreign keys can never
  // enter the tracker while an identity transition is in flight.
  const [tracker, setTracker] = useState(INITIAL_HISTORY_TRACKER);
  const nextTracker = advanceHistoryTracker(
    tracker,
    isOwner ? sync.pendingKeys : [],
    rows,
    snapshotId,
  );
  if (nextTracker !== tracker) setTracker(nextTracker);

  // One refresh per drain, debounced across consecutive confirms:
  // rows-driven reconciliation never bumps drainedEpoch, so refresh
  // output can never re-trigger itself — no polling, no loops.
  const epoch = nextTracker.drainedEpoch;
  useEffect(() => {
    if (!isOwner || epoch === 0) return;
    const timer = setTimeout(() => router.refresh(), REFRESH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [isOwner, epoch, router]);

  const pendingItems = buildPendingItems(
    [...nextTracker.pending],
    isOwner ? sync.failedKeys : [],
    nextTracker.awaiting,
    remoteKeys,
  );

  const groups = useMemo(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return groupHistoryByDay(rows, timeZone, new Date());
  }, [rows]);

  // A signed-out, loading or switched session renders nothing — the
  // remote rows belong to the identity that produced them.
  if (!isOwner) return null;

  const hasRemote = groups.length > 0;
  const hasPending = pendingItems.length > 0;

  // One stable tree shape: the refresh button always occupies the same
  // child slot, so it is never remounted when the empty state fills in
  // — keyboard focus on it survives the refresh that adds records.
  return (
    <div className="flex flex-col gap-4">
      {!hasRemote && !hasPending ? (
        <p className="text-sm leading-relaxed text-muted">
          {HISTORY_EMPTY_COPY}
        </p>
      ) : (
        <>
          {hasPending && (
            // Polite live region: queue→remote transitions (label
            // swaps, items leaving/entering) are announced as they
            // happen.
            <section
              aria-label={transientGroupLabel(pendingItems)}
              aria-live="polite"
            >
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                {transientGroupLabel(pendingItems)}
              </h3>
              <ul className="mt-2 flex flex-col gap-2">
                {pendingItems.map((item) => (
                  <HistoryItem
                    key={item.lessonKey}
                    lessonKey={item.lessonKey}
                    meta={stateMeta(item.state)}
                    variant={item.state}
                  />
                ))}
              </ul>
            </section>
          )}
          {hasRemote && (
            // New day groups/records arriving after a refresh are
            // announced politely — ProgressSyncNote only covers the
            // queue's own state.
            <div className="flex flex-col gap-4" aria-live="polite">
              {groups.map((group) => (
                <section key={group.dayKey} aria-label={group.label}>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                    {group.label}
                  </h3>
                  <ul className="mt-2 flex flex-col gap-2">
                    {group.entries.map((entry) => (
                      <HistoryItem
                        key={entry.lessonKey}
                        lessonKey={entry.lessonKey}
                        meta={`Registrado às ${entry.timeLabel}`}
                      />
                    ))}
                  </ul>
                </section>
              ))}
              <p className="text-xs leading-relaxed text-muted">
                {HISTORY_NOTE_COPY}
                {truncated ? ` ${HISTORY_TRUNCATED_COPY}` : ""}
              </p>
            </div>
          )}
        </>
      )}
      <HistoryRefreshButton />
    </div>
  );
}

/**
 * Chronological activity history for one account — remote rows fetched
 * server-side plus the account's real pending queue keys (undated).
 *
 * Identity isolation: the rows were fetched for `userId`; the inner
 * component mounts ONLY while the active session is that same account
 * and is keyed on it — mounting, unmounting and switching all guarantee
 * a stale server snapshot or another account's queue keys can never
 * surface in (or accumulate into) this account's history state.
 */
export function ActivityHistory({
  userId,
  rows,
  truncated,
  snapshotId,
}: {
  userId: string;
  rows: HistoryRow[];
  truncated: boolean;
  /** Token emitted once per successful history query — pairs with `rows`. */
  snapshotId: string;
}) {
  const { status, user } = useAuthSession();
  if (status !== "user" || user?.id !== userId) return null;
  return (
    <ActivityHistoryInner
      key={userId}
      userId={userId}
      rows={rows}
      truncated={truncated}
      snapshotId={snapshotId}
    />
  );
}
