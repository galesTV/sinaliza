/**
 * Account activity history — pure helpers, no React, no storage.
 *
 * Reads the remote `lesson_completions` rows the account page fetched
 * server-side and shapes them for display: validation, chronological
 * ordering, calendar-day grouping and pt-BR labels.
 *
 * Honesty rules:
 * - `completed_at` is the moment the FIRST remote write for that lesson
 *   landed — for offline work and guest→account transfers that is the
 *   sync/transfer time, never the learning moment. Copy must say
 *   "Registrado", never "Concluída em".
 * - Local pending records carry no timestamp at all and must never get
 *   one fabricated — they render in their own undated group.
 *
 * Known limitation: "Hoje"/"Ontem" labels are resolved at render time.
 * A page left open across midnight keeps the labels it was rendered
 * with until the next navigation/refresh — reconciling a live clock is
 * deliberately out of scope (no polling).
 */

/** One remote row, as selected server-side from `lesson_completions`. */
export interface HistoryRow {
  lessonKey: string;
  /** ISO timestamp of the first remote write (`completed_at`). */
  completedAt: string;
}

/** One display-ready entry inside a day group. */
export interface HistoryEntry {
  lessonKey: string;
  /** pt-BR "HH:mm" in the display timezone. */
  timeLabel: string;
}

export interface HistoryDayGroup {
  /** Stable calendar-day key in the display timezone ("2026-11-24"). */
  dayKey: string;
  /** "Hoje", "Ontem" or a pt-BR date like "24 de novembro de 2026". */
  label: string;
  entries: HistoryEntry[];
}

/** Upper bound of remote rows displayed; the page asks for limit+1. */
export const HISTORY_DISPLAY_LIMIT = 100;

/**
 * Keep only well-formed rows: string `lesson_key`, string `completed_at`
 * that parses to a real instant. Malformed rows are dropped rather than
 * rendered with invented data.
 */
export function validateHistoryRows(raw: unknown): HistoryRow[] {
  if (!Array.isArray(raw)) return [];
  const rows: HistoryRow[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const { lesson_key, completed_at } = item as {
      lesson_key?: unknown;
      completed_at?: unknown;
    };
    if (typeof lesson_key !== "string" || lesson_key.length === 0) continue;
    if (typeof completed_at !== "string") continue;
    const time = Date.parse(completed_at);
    if (Number.isNaN(time)) continue;
    rows.push({ lessonKey: lesson_key, completedAt: completed_at });
  }
  return rows;
}

/**
 * Deterministic order: newest `completed_at` first; equal timestamps
 * break ties by `lesson_key` so the list never reshuffles between reads.
 */
export function sortHistoryRows(rows: readonly HistoryRow[]): HistoryRow[] {
  return [...rows].sort((a, b) => {
    const diff = Date.parse(b.completedAt) - Date.parse(a.completedAt);
    if (diff !== 0) return diff;
    return a.lessonKey < b.lessonKey ? -1 : a.lessonKey > b.lessonKey ? 1 : 0;
  });
}

/**
 * Calendar-day key "YYYY-MM-DD" in `timeZone`, built from explicit
 * formatToParts components — never by parsing a locale-formatted
 * string, so the key is deterministic regardless of locale output
 * quirks (e.g. "en-CA" literals like "a.m.").
 */
export function historyDayKey(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string): string =>
    parts.find((entry) => entry.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Previous calendar day of a "YYYY-MM-DD" key — pure date arithmetic. */
function previousDayKey(dayKey: string): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  const prev = new Date(Date.UTC(year, month - 1, day - 1));
  const mm = String(prev.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(prev.getUTCDate()).padStart(2, "0");
  return `${prev.getUTCFullYear()}-${mm}-${dd}`;
}

export function historyTimeLabel(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/**
 * Group validated rows by calendar day in `timeZone`, newest first.
 * `now` is explicit so tests can pin "today" — calendar days come from
 * the Intl formatter, never from fixed 24h arithmetic, so month/year
 * boundaries and DST behave correctly.
 */
export function groupHistoryByDay(
  rows: readonly HistoryRow[],
  timeZone: string,
  now: Date,
): HistoryDayGroup[] {
  const todayKey = historyDayKey(now, timeZone);
  const yesterdayKey = previousDayKey(todayKey);
  const dayLabelFormat = new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const groups = new Map<string, HistoryDayGroup>();
  for (const row of sortHistoryRows(rows)) {
    const key = historyDayKey(new Date(row.completedAt), timeZone);
    let group = groups.get(key);
    if (!group) {
      groups.set(
        key,
        (group = {
          dayKey: key,
          label:
            key === todayKey
              ? "Hoje"
              : key === yesterdayKey
                ? "Ontem"
                : dayLabelFormat.format(new Date(row.completedAt)),
          entries: [],
        }),
      );
    }
    group.entries.push({
      lessonKey: row.lessonKey,
      timeLabel: historyTimeLabel(row.completedAt, timeZone),
    });
  }
  return [...groups.values()];
}

/**
 * Transient queue tracking for the history view — a small pure state
 * machine the component folds into React state during render.
 *
 * Each key lives in one of three honest states:
 * - "pending":   still in the sync queue — a real pending write.
 * - "updating":  left the queue (its upsert succeeded) but the remote
 *   rows don't cover it yet — the history is catching up.
 * - covered:     present in the remote rows — a real record.
 *
 * `drainedEpoch` bumps whenever keys leave the queue, letting the
 * component schedule ONE debounced router.refresh() per drain instead
 * of one per push. Reconciliation on a NEW remote snapshot: an
 * "updating" key still uncovered is dropped — queue.confirm already
 * proved its remote write, and a capped window may legitimately omit
 * it; it must not linger as a fake pending entry. A refresh that fails
 * (rows unchanged) keeps entries waiting, with no false success.
 */
export interface HistoryTracker {
  /** Queue keys observed at the last advance. */
  pending: ReadonlySet<string>;
  /** Keys drained from the queue but not yet covered by remote rows. */
  awaiting: ReadonlySet<string>;
  /** Bumped whenever keys leave the queue — drives one batched refresh. */
  drainedEpoch: number;
  /** Remote rows already reconciled against (reference-compared). */
  rowsSeen: readonly HistoryRow[] | null;
}

export const INITIAL_HISTORY_TRACKER: HistoryTracker = {
  pending: new Set<string>(),
  awaiting: new Set<string>(),
  drainedEpoch: 0,
  rowsSeen: null,
};

function sameKeys(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  if (a.size !== b.size) return false;
  for (const key of a) if (!b.has(key)) return false;
  return true;
}

export function advanceHistoryTracker(
  prev: HistoryTracker,
  pendingKeys: readonly string[],
  remoteRows: readonly HistoryRow[],
): HistoryTracker {
  const pending = new Set(pendingKeys);
  const remoteKeys = new Set(remoteRows.map((row) => row.lessonKey));
  // First observation is never "a fresh snapshot" — mount only.
  const rowsChanged =
    prev.rowsSeen !== null && prev.rowsSeen !== remoteRows;

  const awaiting = new Set<string>();
  for (const key of prev.awaiting) {
    if (remoteKeys.has(key)) continue; // covered — became a record
    if (rowsChanged && !pending.has(key)) continue; // outside the window
    awaiting.add(key);
  }
  let drained = 0;
  for (const key of prev.pending) {
    if (!pending.has(key) && !remoteKeys.has(key)) {
      awaiting.add(key);
      drained += 1;
    }
  }

  if (
    drained === 0 &&
    prev.rowsSeen === remoteRows &&
    sameKeys(prev.pending, pending) &&
    sameKeys(prev.awaiting, awaiting)
  ) {
    return prev;
  }

  return {
    pending,
    awaiting,
    drainedEpoch: drained > 0 ? prev.drainedEpoch + 1 : prev.drainedEpoch,
    rowsSeen: remoteRows,
  };
}

/** Display state of an item in the transient history group. */
export type PendingItemState = "pending" | "updating" | "failed";

export interface PendingItem {
  lessonKey: string;
  state: PendingItemState;
}

/**
 * Keys still travelling to the remote that are not already covered by
 * the remote rows — the undated transient group. Queue keys come first
 * (real pending writes, failures flagged), then drained keys awaiting
 * the next snapshot. Never presents a local record as a remote
 * confirmation, and never fabricates a timestamp.
 */
export function buildPendingItems(
  pendingKeys: readonly string[],
  failedKeys: readonly string[],
  awaitingKeys: ReadonlySet<string>,
  remoteKeys: ReadonlySet<string>,
): PendingItem[] {
  const failed = new Set(failedKeys);
  const seen = new Set<string>();
  const items: PendingItem[] = [];
  for (const key of pendingKeys) {
    if (remoteKeys.has(key) || seen.has(key)) continue;
    seen.add(key);
    items.push({
      lessonKey: key,
      state: failed.has(key) ? "failed" : "pending",
    });
  }
  for (const key of awaitingKeys) {
    if (remoteKeys.has(key) || seen.has(key)) continue;
    seen.add(key);
    items.push({ lessonKey: key, state: "updating" });
  }
  return items;
}
