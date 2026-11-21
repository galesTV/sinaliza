/**
 * Orchestrates account-scoped real-lesson progress — no React.
 *
 * Responsibilities:
 * - Own one `createProgressStore` per storage identity: the shared guest key,
 *   or `progressStorageKey(userId)` per account. Stores are never merged
 *   across identities — guest progress is never claimed automatically into
 *   an account (ADR 0004, D4).
 * - Hydrate an account's local store from `lesson_completions` when its
 *   session starts, then flush that account's pending sync queue.
 * - Write completions locally first, then push them remotely through a
 *   bounded-retry queue. Remote bookkeeping (`SyncQueue`) is kept strictly
 *   separate from the completion store.
 *
 * Safety invariants:
 * - Remote writes only happen while the queue's owner is the active
 *   identity — a stale sign-in or logout can never push into the wrong
 *   account's rows (and RLS would reject it anyway).
 * - Hydration responses are merged into the store keyed by the user they
 *   belong to, so a late answer still lands in the right bucket.
 * - `status === "loading"` never exposes any store: callers see
 *   `EMPTY_PROGRESS`, so no identity's progress flashes before the session
 *   resolves. A completion recorded in that window is deferred in memory
 *   and attributed to whichever identity resolves — never silently
 *   attributed to the guest bucket.
 */

import {
  EMPTY_PROGRESS,
  PROGRESS_STORAGE_KEY,
  createProgressStore,
  progressStorageKey,
  type ProgressSnapshot,
  type ProgressStorage,
  type ProgressStore,
} from "./progress";
import {
  MAX_SYNC_ATTEMPTS,
  createSyncQueue,
  syncStorageKey,
  type ProgressRemote,
  type SyncQueue,
} from "./progress-sync";

export type ProgressIdentity =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "user"; userId: string };

export interface ProgressSyncSnapshot {
  /** A remote backend is wired (Supabase configured). */
  configured: boolean;
  /** Remote completions were loaded for the active account this session. */
  hydrated: boolean;
  /** Completions still awaiting a confirmed remote write. */
  pending: number;
  /** Pending entries whose retry budget is exhausted. */
  failed: number;
  /** A remote round-trip is in flight right now. */
  syncing: boolean;
}

export const EMPTY_SYNC: ProgressSyncSnapshot = {
  configured: false,
  hydrated: false,
  pending: 0,
  failed: 0,
  syncing: false,
};

export interface ProgressOrchestratorDeps {
  storage?: ProgressStorage;
  /** Absent ⇒ guest-only mode: no hydration, no queues, no remote writes. */
  remote?: ProgressRemote;
}

export interface ProgressOrchestrator {
  subscribe(listener: () => void): () => void;
  /**
   * Completed set for `identity` (defaults to the active one) —
   * `EMPTY_PROGRESS` while loading. Callers pass their render-time identity
   * so a session switch can never show another account's set for a frame.
   */
  getCompletedSnapshot(identity?: ProgressIdentity): ProgressSnapshot;
  /**
   * Remote synchronization bookkeeping for `identity` (defaults to the
   * active one). Same render-time rule as getCompletedSnapshot.
   */
  getSyncSnapshot(identity?: ProgressIdentity): ProgressSyncSnapshot;
  /** Point the orchestrator at a new session identity. */
  setIdentity(identity: ProgressIdentity): void;
  /**
   * Record a completion for the active identity locally; when signed in,
   * enqueue and push the remote write. Returns false when already recorded.
   */
  markCompleted(key: string): boolean;
  /** Connectivity returned: re-hydrate if needed and flush pending writes. */
  handleOnline(): void;
}

function storageKeyFor(identity: ProgressIdentity): string {
  return identity.status === "user"
    ? progressStorageKey(identity.userId)
    : PROGRESS_STORAGE_KEY;
}

export function createProgressOrchestrator(
  deps: ProgressOrchestratorDeps,
): ProgressOrchestrator {
  const listeners = new Set<() => void>();
  const stores = new Map<string, ProgressStore>();
  const queues = new Map<string, SyncQueue>();
  const hydratedUsers = new Set<string>();

  let identity: ProgressIdentity = { status: "loading" };
  let inflight = 0;
  const syncCache = new Map<string, ProgressSyncSnapshot>();
  // In-flight dedupe with a trailing edge: one hydrate and one flush per
  // account at a time, and a trigger that arrives mid-flight is not
  // dropped — it schedules one re-run after the current operation
  // finishes, so a reconnect can never be silently ignored.
  const hydratingUsers = new Set<string>();
  const hydrateAgain = new Set<string>();
  const flushingUsers = new Set<string>();
  const flushAgain = new Set<string>();
  // Completions recorded before the session resolves, waiting for the
  // first non-loading identity to own them.
  const deferredMarks = new Set<string>();

  function emit() {
    for (const listener of listeners) listener();
  }

  function storeFor(storageKey: string): ProgressStore {
    let store = stores.get(storageKey);
    if (!store) {
      store = createProgressStore({ storage: deps.storage, storageKey });
      // Any store mutation (this tab or a sibling write merged on load)
      // reaches our subscribers through the orchestrator emit.
      store.subscribe(emit);
      stores.set(storageKey, store);
    }
    return store;
  }

  function queueFor(userId: string): SyncQueue {
    let queue = queues.get(userId);
    if (!queue) {
      queue = createSyncQueue({
        storage: deps.storage,
        storageKey: syncStorageKey(userId),
      });
      queues.set(userId, queue);
    }
    return queue;
  }

  function userIdOf(id: ProgressIdentity): string | null {
    return id.status === "user" ? id.userId : null;
  }

  function activeUserId(): string | null {
    return userIdOf(identity);
  }

  /**
   * Compute (and memoize) the sync snapshot for one identity. Memoized per
   * identity so useSyncExternalStore sees a referentially stable snapshot
   * until a field actually changes.
   */
  function syncSnapshotFor(id: ProgressIdentity): ProgressSyncSnapshot {
    const userId = userIdOf(id);
    const pending = userId && deps.remote ? queueFor(userId).list() : [];
    const failed = pending.filter(
      (entry) => entry.attempts >= MAX_SYNC_ATTEMPTS,
    ).length;
    const next: ProgressSyncSnapshot = {
      configured: Boolean(deps.remote),
      hydrated: userId !== null && hydratedUsers.has(userId),
      pending: pending.length,
      failed,
      syncing: inflight > 0,
    };
    const cacheKey =
      id.status === "user" ? `u:${id.userId}` : id.status;
    const prev = syncCache.get(cacheKey);
    if (
      prev &&
      prev.configured === next.configured &&
      prev.hydrated === next.hydrated &&
      prev.pending === next.pending &&
      prev.failed === next.failed &&
      prev.syncing === next.syncing
    ) {
      return prev;
    }
    syncCache.set(cacheKey, next);
    return next;
  }

  /**
   * Push one queued key remotely. Only runs while its owner is the active
   * account; a session change mid-flight still removes the key on success,
   * but a failure is recorded for a later session with that account.
   */
  async function push(userId: string, key: string) {
    inflight += 1;
    emit();
    try {
      await deps.remote!.upsert(userId, key);
      queueFor(userId).confirm(key);
    } catch (error) {
      queueFor(userId).recordAttempt(key, error);
    } finally {
      inflight -= 1;
      emit();
    }
  }

  /**
   * Flush the account's pending queue, bounded per entry and deduped so
   * concurrent triggers run a single pass. Each explicit flush cycle is
   * also the recovery path: exhausted entries get a fresh attempt budget
   * first — a temporary outage can never strand valid progress.
   */
  async function flushPending(userId: string) {
    if (flushingUsers.has(userId)) {
      flushAgain.add(userId);
      return;
    }
    flushingUsers.add(userId);
    try {
      queueFor(userId).resetExhausted();
      for (const entry of queueFor(userId).list()) {
        // Stale ownership check per item: stop pushing as soon as the
        // active account is no longer this queue's owner.
        if (activeUserId() !== userId) return;
        if (entry.attempts >= MAX_SYNC_ATTEMPTS) continue;
        await push(userId, entry.key);
      }
    } finally {
      flushingUsers.delete(userId);
      if (flushAgain.delete(userId) && activeUserId() === userId) {
        void flushPending(userId);
      }
    }
  }

  /**
   * Fetch the account's remote completions once per session, merge them into
   * its own store, then flush pending writes. A late response still merges
   * into the correct account-keyed store; remote pushes, however, only run
   * while that account stays active.
   */
  async function hydrate(userId: string) {
    if (!deps.remote) return;
    // Remote fetch happens once per account per session, but a re-login
    // with pending writes still reconciles them. A failed hydration leaves
    // the flag unset so a later setIdentity/handleOnline retries it.
    if (hydratedUsers.has(userId)) {
      if (activeUserId() === userId) await flushPending(userId);
      return;
    }
    if (hydratingUsers.has(userId)) {
      hydrateAgain.add(userId);
      return;
    }
    hydratingUsers.add(userId);
    inflight += 1;
    emit();
    try {
      const keys = await deps.remote.fetchKeys(userId);
      const store = storeFor(progressStorageKey(userId));
      store.merge(keys);
      // Only trust the response while its account is still the active
      // session — a fetch answered under a different session could be
      // empty. Unmarked users are re-fetched when they sign back in.
      if (activeUserId() === userId) hydratedUsers.add(userId);
      // Reconcile completions already in the account's local bucket that
      // the server does not know yet — e.g. written while offline before
      // the queue existed, or an enqueued write that never persisted. They
      // are eligible (they were only ever recorded through the published
      // path) so they join the same bounded-retry queue.
      const remoteKeys = new Set(keys);
      const queue = queueFor(userId);
      for (const key of store.getSnapshot().completed) {
        if (!remoteKeys.has(key)) queue.enqueue(key);
      }
      inflight -= 1;
      emit();
      if (activeUserId() === userId) await flushPending(userId);
    } catch {
      // Hydration failed: the local store stands as-is, `hydrated` stays
      // false, and pending entries keep their retry budget.
      inflight -= 1;
      emit();
    } finally {
      hydratingUsers.delete(userId);
      // Skip the trailing re-run when the session already moved on: the
      // retry would run under the wrong session and its empty answer
      // could mask the real hydration when this account returns.
      if (hydrateAgain.delete(userId) && activeUserId() === userId) {
        void hydrate(userId);
      }
    }
  }

  /** Write one completion against the ACTIVE identity's store and remote. */
  function recordCompletion(key: string): boolean {
    const store = storeFor(storageKeyFor(identity));
    const changed = store.markCompleted(key);
    if (!changed) return false;
    const userId = activeUserId();
    if (userId === null || !deps.remote) return true;
    queueFor(userId).enqueue(key);
    emit();
    void push(userId, key);
    return true;
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getCompletedSnapshot(id = identity) {
      if (id.status === "loading") return EMPTY_PROGRESS;
      return storeFor(storageKeyFor(id)).getSnapshot();
    },

    getSyncSnapshot(id = identity) {
      return syncSnapshotFor(id);
    },

    setIdentity(next) {
      const previous = identity;
      const sameIdentity =
        previous.status === next.status &&
        (next.status !== "user" ||
          (previous.status === "user" && previous.userId === next.userId));
      if (sameIdentity) return;
      identity = next;
      // Release completions deferred during the loading window to the
      // identity that actually resolved.
      if (next.status !== "loading" && deferredMarks.size > 0) {
        for (const key of deferredMarks) recordCompletion(key);
        deferredMarks.clear();
      }
      emit();
      if (next.status === "user" && deps.remote) {
        void hydrate(next.userId);
      }
    },

    markCompleted(key) {
      // While the session is still resolving there is no correct bucket:
      // hold the completion in memory instead of silently attributing it
      // to the guest bucket. It is written once the identity resolves.
      if (identity.status === "loading") {
        const wasNew = !deferredMarks.has(key);
        deferredMarks.add(key);
        return wasNew;
      }
      return recordCompletion(key);
    },

    handleOnline() {
      const userId = activeUserId();
      if (userId === null || !deps.remote) return;
      if (!hydratedUsers.has(userId)) {
        void hydrate(userId);
      } else {
        void flushPending(userId);
      }
    },
  };
}
