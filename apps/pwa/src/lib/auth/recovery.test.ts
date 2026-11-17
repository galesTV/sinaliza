import { describe, expect, it } from "vitest";

import { isRecentRecovery, RECOVERY_WINDOW_MS } from "./recovery";

describe("isRecentRecovery", () => {
  const now = Date.parse("2026-11-16T12:00:00Z");

  it("returns true for a timestamp inside the window", () => {
    const sentAt = new Date(now - 2 * 60 * 1000).toISOString();
    expect(isRecentRecovery(sentAt, now)).toBe(true);
  });

  it("returns true at the exact boundary edge", () => {
    const sentAt = new Date(now - RECOVERY_WINDOW_MS + 1000).toISOString();
    expect(isRecentRecovery(sentAt, now)).toBe(true);
  });

  it("returns false for an old recovery timestamp", () => {
    const sentAt = new Date(now - 60 * 60 * 1000).toISOString();
    expect(isRecentRecovery(sentAt, now)).toBe(false);
  });

  it("returns false for missing or malformed values", () => {
    expect(isRecentRecovery(undefined, now)).toBe(false);
    expect(isRecentRecovery(null, now)).toBe(false);
    expect(isRecentRecovery("not-a-date", now)).toBe(false);
  });

  it("returns false for future timestamps (clock skew guard)", () => {
    const sentAt = new Date(now + 5 * 60 * 1000).toISOString();
    expect(isRecentRecovery(sentAt, now)).toBe(false);
  });
});
