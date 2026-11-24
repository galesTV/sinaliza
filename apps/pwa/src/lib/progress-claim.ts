/**
 * Per-account guest-claim bookkeeping — no React.
 *
 * Records, for one `userId`, which guest-completion keys were:
 * - `dismissed`: the user explicitly chose "keep separate" for them;
 * - `initiated`: a consent-driven transfer was started (persisted intent
 *   before any network work — surviving reloads and tab closes);
 * - `confirmed`: verified present in `lesson_completions` for this account.
 *
 * All three sets are monotonic claims about keys, never about progress
 * counts or proficiency. Sibling instances (other tabs) merge by union,
 * with `confirmed`/`dismissed` always shadowing `initiated`.
 *
 * localStorage offers no compare-and-swap, so two tabs writing at the
 * exact same moment can still overwrite each other. The pattern here —
 * merge the stored record before every mutation, then persist the union
 * — makes concurrent writes converge on the next read/write cycle. It is
 * best-effort for truly simultaneous writes, not atomic.
 */

import type { ProgressStorage } from "./progress";

export const CLAIM_STORAGE_PREFIX = "sinaliza.progress.claim.v1";

export function claimStorageKey(userId: string): string {
  return `${CLAIM_STORAGE_PREFIX}.u_${userId}`;
}

interface ClaimRecord {
  dismissed: string[];
  initiated: string[];
  confirmed: string[];
}

export interface ClaimMarkerSnapshot {
  dismissed: ReadonlySet<string>;
  initiated: ReadonlySet<string>;
  confirmed: ReadonlySet<string>;
}

export interface ClaimMarker {
  snapshot(): ClaimMarkerSnapshot;
  /** User dismissed these keys — they are never offered again. */
  addDismissed(keys: Iterable<string>): void;
  /** Transfer consent recorded; never treated as confirmation. */
  addInitiated(keys: Iterable<string>): void;
  /** Keys verified in the account's remote rows. */
  addConfirmed(keys: Iterable<string>): void;
}

function loadRecord(storage: ProgressStorage | undefined, key: string): ClaimRecord {
  const empty: ClaimRecord = { dismissed: [], initiated: [], confirmed: [] };
  try {
    const raw = storage?.getItem(key);
    if (!raw) return empty;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      (parsed as { version?: unknown }).version !== 1
    ) {
      return empty;
    }
    const list = (value: unknown): string[] =>
      Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : [];
    const record = parsed as Record<string, unknown>;
    return {
      dismissed: list(record.dismissed),
      initiated: list(record.initiated),
      confirmed: list(record.confirmed),
    };
  } catch {
    return empty;
  }
}

export function createClaimMarker(deps: {
  storage?: ProgressStorage;
  storageKey: string;
}): ClaimMarker {
  function readStored() {
    const record = loadRecord(deps.storage, deps.storageKey);
    return {
      dismissed: new Set(record.dismissed),
      initiated: new Set(record.initiated),
      confirmed: new Set(record.confirmed),
    };
  }

  let dismissed: Set<string>;
  let initiated: Set<string>;
  let confirmed: Set<string>;

  /** Union with a sibling tab's writes, resolving shadows deterministically. */
  function mergeStored() {
    if (!deps.storage) return;
    const stored = readStored();
    confirmed = new Set([...confirmed, ...stored.confirmed]);
    dismissed = new Set([...dismissed, ...stored.dismissed]);
    initiated = new Set([...initiated, ...stored.initiated]);
    for (const key of confirmed) initiated.delete(key);
    for (const key of dismissed) initiated.delete(key);
  }

  ({ dismissed, initiated, confirmed } = readStored());
  for (const key of confirmed) initiated.delete(key);
  for (const key of dismissed) initiated.delete(key);

  function persist() {
    try {
      deps.storage?.setItem(
        deps.storageKey,
        JSON.stringify({
          version: 1,
          dismissed: [...dismissed].sort(),
          initiated: [...initiated].sort(),
          confirmed: [...confirmed].sort(),
        } satisfies ClaimRecord & { version: number }),
      );
    } catch {
      // Storage unavailable/full: in-memory markers stand for this session;
      // the sync queue still carries any initiated transfer durably.
    }
  }

  return {
    snapshot() {
      mergeStored();
      return {
        dismissed: new Set(dismissed),
        initiated: new Set(initiated),
        confirmed: new Set(confirmed),
      };
    },
    addDismissed(keys) {
      mergeStored();
      let changed = false;
      for (const key of keys) {
        if (dismissed.has(key)) continue;
        dismissed.add(key);
        initiated.delete(key);
        changed = true;
      }
      if (changed) persist();
    },
    addInitiated(keys) {
      mergeStored();
      let changed = false;
      for (const key of keys) {
        if (initiated.has(key) || confirmed.has(key) || dismissed.has(key)) {
          continue;
        }
        initiated.add(key);
        changed = true;
      }
      if (changed) persist();
    },
    addConfirmed(keys) {
      mergeStored();
      let changed = false;
      for (const key of keys) {
        if (confirmed.has(key)) continue;
        confirmed.add(key);
        initiated.delete(key);
        changed = true;
      }
      if (changed) persist();
    },
  };
}
