import { describe, expect, it } from "vitest";

import {
  buildPendingItems,
  groupHistoryByDay,
  historyTimeLabel,
  sortHistoryRows,
  validateHistoryRows,
  type HistoryRow,
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

describe("buildPendingItems", () => {
  it("lists pending keys without dates, deduped against remote rows", () => {
    const items = buildPendingItems([K1, K2, K3], [], new Set([K2]));
    expect(items).toEqual([
      { lessonKey: K1, failed: false },
      { lessonKey: K3, failed: false },
    ]);
  });

  it("flags exhausted entries as failed", () => {
    const items = buildPendingItems([K1, K2], [K2], new Set());
    expect(items[1]).toEqual({ lessonKey: K2, failed: true });
  });

  it("drops duplicate pending keys", () => {
    const items = buildPendingItems([K1, K1, K2], [], new Set());
    expect(items.map((i) => i.lessonKey)).toEqual([K1, K2]);
  });
});
