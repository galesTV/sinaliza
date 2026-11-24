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

function dayKeyWithZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
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
  const todayKey = dayKeyWithZone(now, timeZone);
  const yesterdayKey = previousDayKey(todayKey);
  const dayLabelFormat = new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const groups = new Map<string, HistoryDayGroup>();
  for (const row of sortHistoryRows(rows)) {
    const key = dayKeyWithZone(new Date(row.completedAt), timeZone);
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
 * Keys pending in the sync queue that are not already covered by the
 * remote rows — the undated "aguardando sincronização" group. Failed
 * entries are flagged so the UI can say a retry is scheduled, without
 * ever confusing a local record with a remote confirmation.
 */
export interface PendingItem {
  lessonKey: string;
  failed: boolean;
}

export function buildPendingItems(
  pendingKeys: readonly string[],
  failedKeys: readonly string[],
  remoteKeys: ReadonlySet<string>,
): PendingItem[] {
  const failed = new Set(failedKeys);
  const seen = new Set<string>();
  const items: PendingItem[] = [];
  for (const key of pendingKeys) {
    if (remoteKeys.has(key) || seen.has(key)) continue;
    seen.add(key);
    items.push({ lessonKey: key, failed: failed.has(key) });
  }
  return items;
}
