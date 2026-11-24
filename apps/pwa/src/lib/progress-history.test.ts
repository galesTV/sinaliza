import { describe, expect, it } from "vitest";

import {
  advanceHistoryTracker,
  buildPendingItems,
  groupHistoryByDay,
  historyDayKey,
  historyTimeLabel,
  INITIAL_HISTORY_TRACKER,
  sortHistoryRows,
  validateHistoryRows,
  type HistoryRow,
  type HistoryTracker,
} from "./progress-history";

const TZ = "America/Sao_Paulo"; // UTC-3, no DST since 2019
const K1 = "alfabeto/letras-a-e/letra-a";
const K2 = "alfabeto/letras-a-e/letra-b";
const K3 = "alfabeto/letras-a-e/letra-c";

const row = (key: string, at: string): HistoryRow => ({
  lessonKey: key,
  completedAt: at,
});

describe("validateHistoryRows", () => {
  it("keeps only well-formed rows", () => {
    const valid = validateHistoryRows([
      { lesson_key: K1, completed_at: "2026-11-24T12:00:00Z" },
      { lesson_key: "", completed_at: "2026-11-24T12:00:00Z" },
      { lesson_key: K2, completed_at: "not-a-date" },
      { lesson_key: K2, completed_at: null },
      { completed_at: "2026-11-24T12:00:00Z" },
      "junk",
      null,
      { lesson_key: 42, completed_at: "2026-11-24T12:00:00Z" },
    ]);
    expect(valid).toEqual([
      { lessonKey: K1, completedAt: "2026-11-24T12:00:00Z" },
    ]);
  });

  it("returns an empty list for a non-array payload", () => {
    expect(validateHistoryRows(null)).toEqual([]);
    expect(validateHistoryRows({ lesson_key: K1 })).toEqual([]);
  });
});

describe("sortHistoryRows", () => {
  it("orders newest first and breaks ties by lesson key", () => {
    const sorted = sortHistoryRows([
      row(K3, "2026-11-20T10:00:00Z"),
      row(K2, "2026-11-24T10:00:00Z"),
      row(K1, "2026-11-24T10:00:00Z"), // same instant as K2 — key decides
      row(K2, "2026-11-10T10:00:00Z"),
    ]);
    expect(sorted.map((r) => r.lessonKey)).toEqual([K1, K2, K3, K2]);
  });
});

describe("groupHistoryByDay", () => {
  it("labels today, yesterday and older dates in pt-BR", () => {
    const now = new Date("2026-11-24T15:00:00Z"); // 12:00 in São Paulo
    const groups = groupHistoryByDay(
      [
        row(K1, "2026-11-24T14:00:00Z"), // today local
        row(K2, "2026-11-23T20:00:00Z"), // yesterday local
        row(K3, "2026-10-30T12:00:00Z"), // older
      ],
      TZ,
      now,
    );
    expect(groups.map((g) => g.label)).toEqual([
      "Hoje",
      "Ontem",
      "30 de outubro de 2026",
    ]);
    expect(groups[0].entries.map((e) => e.lessonKey)).toEqual([K1]);
  });

  it("groups by the display timezone's calendar day, not UTC's", () => {
    // 00:30 UTC on the 24th is still the 23rd in São Paulo.
    const now = new Date("2026-11-25T15:00:00Z");
    const groups = groupHistoryByDay(
      [
        row(K1, "2026-11-24T00:30:00Z"), // Nov 23 local
        row(K2, "2026-11-24T02:30:00Z"), // Nov 23 local too
        row(K3, "2026-11-25T12:00:00Z"), // Nov 25 local
      ],
      TZ,
      now,
    );
    expect(groups.map((g) => g.dayKey)).toEqual(["2026-11-25", "2026-11-23"]);
    expect(groups[1].entries.map((e) => e.lessonKey)).toEqual([K2, K1]);
  });

  it("handles month and year boundaries for yesterday", () => {
    const now = new Date("2027-01-01T15:00:00Z"); // Jan 1 local
    const groups = groupHistoryByDay(
      [row(K1, "2026-12-31T20:00:00Z")], // Dec 31 local
      TZ,
      now,
    );
    expect(groups[0].label).toBe("Ontem");
  });

  it("does not use fixed 24h offsets for calendar days", () => {
    // now is Monday 00:30 local — yesterday is Sunday, not "24h ago"
    // boundaries-wise; a row 23h ago belongs to yesterday's day-key.
    const now = new Date("2026-11-24T03:30:00Z"); // 00:30 local
    const groups = groupHistoryByDay(
      [row(K1, "2026-11-23T04:30:00Z")], // 01:30 local on the 23rd
      TZ,
      now,
    );
    expect(groups[0].label).toBe("Ontem");
  });
});

describe("historyTimeLabel", () => {
  it("formats HH:mm in the display timezone", () => {
    expect(historyTimeLabel("2026-11-24T15:37:00Z", TZ)).toBe("12:37");
    expect(historyTimeLabel("2026-11-24T15:37:00Z", "UTC")).toBe("15:37");
  });
});

describe("historyDayKey", () => {
  it("builds deterministic YYYY-MM-DD keys from calendar components", () => {
    // Same instant, two zones — never parsed from a locale string.
    const instant = new Date("2026-11-24T02:30:00Z");
    expect(historyDayKey(instant, "America/Sao_Paulo")).toBe("2026-11-23");
    expect(historyDayKey(instant, "UTC")).toBe("2026-11-24");
  });

  it("keeps year/month/day ordering across DST-free and DST zones", () => {
    const instant = new Date("2026-03-08T05:00:00Z"); // US spring-forward day
    expect(historyDayKey(instant, "America/New_York")).toBe("2026-03-08");
    expect(historyDayKey(new Date("2027-01-01T00:30:00Z"), TZ)).toBe(
      "2026-12-31",
    );
  });
});

describe("buildPendingItems", () => {
  const none = new Set<string>();

  it("lists pending keys without dates, deduped against remote rows", () => {
    const items = buildPendingItems([K1, K2, K3], [], none, new Set([K2]));
    expect(items).toEqual([
      { lessonKey: K1, state: "pending" },
      { lessonKey: K3, state: "pending" },
    ]);
  });

  it("flags exhausted entries as failed", () => {
    const items = buildPendingItems([K1, K2], [K2], none, new Set());
    expect(items[1]).toEqual({ lessonKey: K2, state: "failed" });
  });

  it("marks drained-but-uncovered keys as updating, after queue items", () => {
    const items = buildPendingItems(
      [K2],
      [],
      new Set([K1]),
      new Set<string>(),
    );
    expect(items).toEqual([
      { lessonKey: K2, state: "pending" },
      { lessonKey: K1, state: "updating" },
    ]);
  });

  it("never double-lists a key that is pending and awaiting at once", () => {
    const items = buildPendingItems(
      [K1],
      [],
      new Set([K1]),
      new Set<string>(),
    );
    expect(items).toEqual([{ lessonKey: K1, state: "pending" }]);
  });

  it("drops duplicate pending keys", () => {
    const items = buildPendingItems([K1, K1, K2], [], none, new Set());
    expect(items.map((i) => i.lessonKey)).toEqual([K1, K2]);
  });
});

describe("advanceHistoryTracker", () => {
  const rows = (...rows_: HistoryRow[]) => rows_;
  const advance = (
    prev: HistoryTracker,
    pendingKeys: readonly string[],
    remote: readonly HistoryRow[],
    snapshotId = "s1",
  ) => advanceHistoryTracker(prev, pendingKeys, remote, snapshotId);

  it("observes queue keys as pending without touching awaiting", () => {
    const t = advance(INITIAL_HISTORY_TRACKER, [K1, K2], []);
    expect([...t.pending].sort()).toEqual([K1, K2]);
    expect(t.awaiting.size).toBe(0);
    expect(t.drainedEpoch).toBe(0);
  });

  it("moves a drained key to awaiting while a sibling stays pending", () => {
    // Partial sync: K1 confirmed, K2 still in the queue.
    let t = advance(INITIAL_HISTORY_TRACKER, [K1, K2], []);
    t = advance(t, [K2], []);
    expect(t.pending.has(K2)).toBe(true);
    expect(t.awaiting.has(K1)).toBe(true);
    expect(t.drainedEpoch).toBe(1); // one drain event, not one per state
  });

  it("keeps a failed sibling pending while a drained key awaits", () => {
    let t = advance(INITIAL_HISTORY_TRACKER, [K1, K2], []);
    t = advance(t, [K2], []); // K1 drained; K2 failed but still queued
    expect(t.pending.has(K2)).toBe(true);
    expect(t.awaiting.has(K1)).toBe(true);
  });

  it("graduates an awaiting key to covered once the snapshot has it", () => {
    let t = advance(INITIAL_HISTORY_TRACKER, [K1], []);
    t = advance(t, [], []);
    const refreshed = rows(row(K1, "2026-11-24T12:00:00Z"));
    const next = advance(t, [], refreshed, "s2");
    expect(next.awaiting.size).toBe(0);
    expect(next.snapshotSeen).toBe("s2");
  });

  it("drops an awaiting key a fresh snapshot truncates out of view", () => {
    // K1 synced but fell outside the top-N window: a NEW remote snapshot
    // that still omits it retires the transient marker — queue.confirm
    // already proved its write; it must not linger as a fake pending.
    let t = advance(INITIAL_HISTORY_TRACKER, [K1], []);
    t = advance(t, [], []);
    const unrelated = rows(row(K2, "2026-11-24T12:00:00Z"));
    const next = advance(t, [], unrelated, "s2");
    expect(next.awaiting.size).toBe(0);
  });

  it("treats identical content with a new snapshot id as delivered", () => {
    // A successful query that returns byte-identical rows still proves
    // the remote has nothing new for the key — the transient marker is
    // honestly retired, not stuck "atualizando" forever.
    let t = advance(INITIAL_HISTORY_TRACKER, [K1], []);
    t = advance(t, [], []);
    const next = advance(t, [], [], "s2"); // same content, new token
    expect(next.awaiting.size).toBe(0);
  });

  it("does not count a mere new array reference as a delivered snapshot", () => {
    // Same snapshot id + fresh rows array ≠ a new successful query —
    // churn of references alone must never retire transient entries.
    let t = advance(INITIAL_HISTORY_TRACKER, [K1], []);
    t = advance(t, [], []);
    const next = advance(t, [], [], "s1"); // new [], same token
    expect(next.awaiting.has(K1)).toBe(true);
    expect(next.snapshotSeen).toBe("s1");
  });

  it("keeps awaiting keys when no new snapshot arrives (failed fetch)", () => {
    // A failed query emits no new token — transient entries wait for
    // manual recovery instead of being dropped or faking a record.
    const remote = rows(row(K2, "2026-11-24T12:00:00Z"));
    let t = advance(INITIAL_HISTORY_TRACKER, [K1], remote);
    t = advance(t, [], remote);
    t = advance(t, [], remote); // no new snapshot delivered
    expect(t.awaiting.has(K1)).toBe(true);
    expect(t.drainedEpoch).toBe(1);
  });

  it("keeps a key drained in the same step as a snapshot delivery", () => {
    // A snapshot delivered in the same observation as the drain may
    // reflect a fetch that predates it — it cannot prove coverage, so
    // the key stays "updating" until a LATER delivery reconciles it.
    let t = advance(INITIAL_HISTORY_TRACKER, [K1], []);
    const stale = rows(); // fetched before the drain — key absent
    t = advance(t, [], stale, "s2");
    expect(t.awaiting.has(K1)).toBe(true);
    expect(t.drainedEpoch).toBe(1);
    // The next delivered snapshot (still without the key → truncated
    // out of the window) honestly retires the transient marker.
    const next = advance(t, [], stale, "s3");
    expect(next.awaiting.size).toBe(0);
  });

  it("is referentially stable and never re-triggers a refresh", () => {
    // The drain already bumped the epoch once; reconciling its result
    // back must not bump again — otherwise refresh → epoch → refresh.
    let t = advance(INITIAL_HISTORY_TRACKER, [K1], []);
    t = advance(t, [], []);
    const refreshed = rows(row(K1, "2026-11-24T12:00:00Z"));
    t = advance(t, [], refreshed, "s2");
    expect(t.drainedEpoch).toBe(1);
    expect(advance(t, [], refreshed, "s2")).toBe(t); // same inputs: same ref
  });

  it("does not count a key that is already remote as a drain", () => {
    // Key left the queue but the snapshot already covers it — nothing
    // transient to display, no refresh needed.
    const remote = rows(row(K1, "2026-11-24T12:00:00Z"));
    const t = advance(INITIAL_HISTORY_TRACKER, [K1], remote);
    const next = advance(t, [], remote);
    expect(next.awaiting.size).toBe(0);
    expect(next.drainedEpoch).toBe(0);
  });

  it("starts empty on remount — no identity state carries over", () => {
    // Alice's tracker is dropped with the mount; a fresh tracker (the
    // component remounts keyed on userId) knows nothing about her keys.
    expect(INITIAL_HISTORY_TRACKER.pending.size).toBe(0);
    expect(INITIAL_HISTORY_TRACKER.awaiting.size).toBe(0);
    expect(INITIAL_HISTORY_TRACKER.snapshotSeen).toBeNull();
  });
});
