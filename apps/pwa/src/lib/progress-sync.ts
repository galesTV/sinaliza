/**
 * Remote persistence layer for real-lesson completions — no React.
 *
 * Two independent pieces:
 *
 * - `ProgressRemote`: the two Data API calls the app needs against
 *   `public.lesson_completions` (read own keys, upsert one). The composite
 *   primary key makes every write idempotent; `completed_at` is generated
 *   server-side and is never sent.
 * - `createSyncQueue`: a per-account, versioned localStorage record of
 *   completions whose remote write has not been confirmed. This is
 *   synchronization bookkeeping — it never records completion itself and
 *   never claims progress was synced; it only tracks pending work with a
 *   bounded retry budget.
 *
 * Guests never get a queue: without a remote there is nothing to sync.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProgressStorage } from "./progress";

/** Retry budget per pending completion before it is reported as failed. */
export const MAX_SYNC_ATTEMPTS = 5;

export const SYNC_STORAGE_PREFIX = "sinaliza.progress.sync.v1";

export function syncStorageKey(userId: string): string {
  return `${SYNC_STORAGE_PREFIX}.u_${userId}`;
}

export interface ProgressRemote {
  /** All `lesson_key` values recorded remotely for this user. */
  fetchKeys(userId: string): Promise<string[]>;
  /** Idempotent insert of one completion for this user. */
  upsert(userId: string, key: string): Promise<void>;
}

/**
 * Data API adapter. RLS enforces `user_id = auth.uid()` server-side, so the
 * explicit `user_id` can never leak a completion into another account — a
 * mismatched one is simply rejected.
 */
export function createSupabaseProgressRemote(
  client: SupabaseClient,
): ProgressRemote {
  return {
    async fetchKeys(userId) {
      const { data, error } = await client
        .from("lesson_completions")
        .select("lesson_key")
        .eq("user_id", userId);
      if (error) throw error;
      return (data ?? [])
        .map((row) => (row as { lesson_key?: unknown }).lesson_key)
        .filter((key): key is string => typeof key === "string");
    },
    async upsert(userId, key) {
      const { error } = await client.from("lesson_completions").upsert(
        { user_id: userId, lesson_key: key },
        {
          onConflict: "user_id,lesson_key",
          // Re-completion is a no-op at the PK, not an error to the user.
          ignoreDuplicates: true,
        },
      );
      if (error) throw error;
    },
  };
}

export interface SyncQueueEntry {
  key: string;
  attempts: number;
  lastError: string | null;
}

export interface SyncQueue {
  /** Every entry still unconfirmed, in enqueue order. */
  list(): SyncQueueEntry[];
  has(key: string): boolean;
  /** Register a key awaiting remote write (idempotent). */
  enqueue(key: string): void;
  /** Confirm a key was written remotely. */
  confirm(key: string): void;
  /** Record one failed push attempt; returns the updated entry. */
  recordAttempt(key: string, error: unknown): SyncQueueEntry;
  /**
   * Reset the retry budget of every exhausted entry so a fresh flush can
   * try them again. Entries stay durable — a temporary outage can never
   * strand valid progress permanently; this is the explicit recovery path.
   * Returns the keys whose budget was reset.
   */
  resetExhausted(): string[];
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

export function createSyncQueue(deps: {
  storage?: ProgressStorage;
  storageKey: string;
}): SyncQueue {
  function load(): SyncQueueEntry[] {
    try {
      const raw = deps.storage?.getItem(deps.storageKey);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        (parsed as { version?: unknown }).version !== 1 ||
        !Array.isArray((parsed as { pending?: unknown }).pending)
      ) {
        return [];
      }
      return (parsed as { pending: unknown[] }).pending
        .filter(
          (entry): entry is SyncQueueEntry =>
            typeof entry === "object" &&
            entry !== null &&
            typeof (entry as SyncQueueEntry).key === "string",
        )
        .map((entry) => ({
          key: entry.key,
          attempts:
            typeof entry.attempts === "number" && entry.attempts >= 0
              ? entry.attempts
              : 0,
          lastError:
            typeof entry.lastError === "string" ? entry.lastError : null,
        }));
    } catch {
      return [];
    }
  }

  // In-memory source of truth, seeded from storage once and reconciled on
  // every operation: entries a sibling instance persisted are adopted, and
  // entries a sibling confirmed (removed from storage) are dropped —
  // except keys kept memory-only because a persist failed, which a missing
  // storage row can never mean "confirmed" for.
  let pending = load();
  const volatile = new Set<string>();

  function mergeStored() {
    const stored = load();
    const storedKeys = new Set(stored.map((entry) => entry.key));
    pending = pending.filter(
      (entry) => storedKeys.has(entry.key) || volatile.has(entry.key),
    );
    const seen = new Map(pending.map((entry) => [entry.key, entry]));
    for (const entry of stored) {
      if (!seen.has(entry.key)) {
        pending.push(entry);
        seen.set(entry.key, entry);
      }
    }
  }

  function persist() {
    try {
      deps.storage?.setItem(
        deps.storageKey,
        JSON.stringify({ version: 1, pending }),
      );
      volatile.clear();
    } catch {
      // Storage unavailable or full: current entries become memory-only
      // for this session — a later merge must not treat them as confirmed.
      for (const entry of pending) volatile.add(entry.key);
    }
  }

  return {
    list: () => {
      mergeStored();
      return pending.map((entry) => ({ ...entry }));
    },
    has: (key) => {
      mergeStored();
      return pending.some((entry) => entry.key === key);
    },
    enqueue(key) {
      mergeStored();
      if (pending.some((entry) => entry.key === key)) return;
      pending.push({ key, attempts: 0, lastError: null });
      persist();
    },
    confirm(key) {
      mergeStored();
      pending = pending.filter((entry) => entry.key !== key);
      persist();
    },
    recordAttempt(key, error) {
      mergeStored();
      let entry = pending.find((item) => item.key === key);
      if (!entry) {
        entry = { key, attempts: 0, lastError: null };
        pending.push(entry);
      }
      entry.attempts += 1;
      entry.lastError = errorMessage(error).slice(0, 300);
      persist();
      return { ...entry };
    },
    resetExhausted() {
      mergeStored();
      const revived: string[] = [];
      for (const entry of pending) {
        if (entry.attempts >= MAX_SYNC_ATTEMPTS) {
          entry.attempts = 0;
          entry.lastError = null;
          revived.push(entry.key);
        }
      }
      if (revived.length > 0) persist();
      return revived;
    },
  };
}
