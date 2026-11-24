"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { getLessonContext } from "@/data/learning-paths";
import { isLessonCompletable } from "@/data/path-publication";
import { parseLessonKey } from "@/lib/progress";
import {
  buildPendingItems,
  groupHistoryByDay,
  type HistoryRow,
} from "@/lib/progress-history";

import { IconCheck } from "./icons";
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

export function pendingFailedCopy(): string {
  return "Nova tentativa ao reconectar";
}

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

/**
 * Watches the queue and fires a single router.refresh() when it drains,
 * so confirmed rows move from the pending group into the remote list.
 * Gated on the pending>0 → 0 edge — never on a timer, never per push.
 * Rendered only while the owner session is active, so the router hooks
 * below never run during SSR (no app-router context there).
 */
function QueueDrainRefresh({ pending }: { pending: number }) {
  const router = useRouter();
  const prevPending = useRef(0);
  useEffect(() => {
    if (prevPending.current > 0 && pending === 0) router.refresh();
    prevPending.current = pending;
  }, [pending, router]);
  return null;
}

function HistoryItem({
  lessonKey,
  meta,
}: {
  lessonKey: string;
  meta?: string;
}) {
  const resolved = resolveHistoryTitle(lessonKey);
  const body = (
    <>
      <IconCheck
        aria-hidden="true"
        className="mt-0.5 h-4 w-4 shrink-0 text-success"
      />
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

/**
 * Chronological activity history for one account — remote rows fetched
 * server-side plus the account's real pending queue keys (undated).
 *
 * Identity isolation: the rows were fetched for `userId`; the component
 * renders only while the ACTIVE session is that same account, so a stale
 * server snapshot can never surface after a switch or sign-out.
 */
export function ActivityHistory({
  userId,
  rows,
  truncated,
}: {
  userId: string;
  rows: HistoryRow[];
  truncated: boolean;
}) {
  const { status, user } = useAuthSession();
  const sync = useProgressSyncState();
  const isOwner = status === "user" && user?.id === userId;

  const remoteKeys = useMemo(
    () => new Set(rows.map((row) => row.lessonKey)),
    [rows],
  );

  // Keys confirmed remotely during this mount are remembered so they keep
  // rendering in the pending group until a refreshed server snapshot
  // covers them — they must never blink out of the list mid-transition.
  // Derived state adjusted during render (the documented alternative to
  // setState-in-effect, same pattern as the claim card).
  const [remembered, setRemembered] = useState<Set<string>>(new Set());
  const tracked = new Set(remembered);
  let trackedChanged = false;
  for (const key of sync.pendingKeys) {
    if (!tracked.has(key)) {
      tracked.add(key);
      trackedChanged = true;
    }
  }
  for (const key of [...tracked]) {
    if (remoteKeys.has(key)) {
      tracked.delete(key);
      trackedChanged = true;
    }
  }
  if (trackedChanged) setRemembered(tracked);

  const pendingItems = buildPendingItems(
    [...tracked],
    sync.failedKeys,
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
  if (!hasRemote && !hasPending) {
    return (
      <p className="text-sm leading-relaxed text-muted">
        {HISTORY_EMPTY_COPY}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <QueueDrainRefresh pending={sync.pending} />
      {hasPending && (
        <section aria-label={HISTORY_PENDING_LABEL}>
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            {HISTORY_PENDING_LABEL}
          </h3>
          <ul className="mt-2 flex flex-col gap-2">
            {pendingItems.map((item) => (
              <HistoryItem
                key={item.lessonKey}
                lessonKey={item.lessonKey}
                meta={item.failed ? pendingFailedCopy() : undefined}
              />
            ))}
          </ul>
        </section>
      )}
      {hasRemote && (
        <div className="flex flex-col gap-4">
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
    </div>
  );
}
