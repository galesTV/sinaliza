import { describe, expect, it, vi } from "vitest";

import {
  createProgressOrchestrator,
  type ProgressIdentity,
} from "./progress-orchestrator";
import { EMPTY_PROGRESS, PROGRESS_STORAGE_KEY, progressStorageKey } from "./progress";
import type { ProgressStorage } from "./progress";
import {
  MAX_SYNC_ATTEMPTS,
  syncStorageKey,
  type ProgressRemote,
} from "./progress-sync";

const GUEST: ProgressIdentity = { status: "guest" };
const LOADING: ProgressIdentity = { status: "loading" };
const user = (userId: string): ProgressIdentity => ({
  status: "user",
  userId,
});

const ALICE = "user-alice";
const BOB = "user-bob";
const K1 = "alfabeto/letras-a-e/letra-a";
const K2 = "alfabeto/letras-a-e/letra-b";

function makeStorage() {
  const map = new Map<string, string>();
  const storage: ProgressStorage = {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
  return { storage, map };
}

function makeRemote() {
  const state = {
    fetchKeys: vi.fn<(userId: string) => Promise<string[]>>().mockResolvedValue([]),
    upsert: vi.fn<(userId: string, key: string) => Promise<void>>().mockResolvedValue(),
  };
  return state satisfies ProgressRemote;
}

async function settle() {
  // Let pending microtasks/promise chains (hydrate, push) complete.
  await vi.waitFor(() => {});
}

describe("identity-scoped snapshots", () => {
  it("shows nothing while authentication is loading", () => {
    const { storage, map } = makeStorage();
    map.set(progressStorageKey(ALICE), JSON.stringify({ version: 1, completed: [K1] }));
    const orch = createProgressOrchestrator({ storage, remote: makeRemote() });

    orch.setIdentity(user(ALICE));
    // A render whose identity still says "loading" never surfaces a user's set.
    expect(orch.getCompletedSnapshot(LOADING)).toBe(EMPTY_PROGRESS);
    expect(orch.getCompletedSnapshot(LOADING).completed.size).toBe(0);
  });

  it("keeps guest and account buckets isolated", async () => {
    const { storage, map } = makeStorage();
    const orch = createProgressOrchestrator({ storage, remote: makeRemote() });

    orch.setIdentity(GUEST);
    orch.markCompleted(K1);
    expect(orch.getCompletedSnapshot(GUEST).completed.has(K1)).toBe(true);

    orch.setIdentity(user(ALICE));
    await settle();
    // The account bucket must not show the guest entry (no implicit claim).
    expect(orch.getCompletedSnapshot(user(ALICE)).completed.has(K1)).toBe(false);
    expect(map.has(progressStorageKey(ALICE))).toBe(false);
    // Guest bucket preserved untouched.
    expect(map.get(PROGRESS_STORAGE_KEY)).toContain(K1);
  });

  it("Account A → logout → Account B never leaks A's progress", async () => {
    const { storage } = makeStorage();
    const remote = makeRemote();
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    await settle();
    orch.markCompleted(K1);
    await settle();

    orch.setIdentity(GUEST);
    expect(orch.getCompletedSnapshot(GUEST).completed.has(K1)).toBe(false);

    orch.setIdentity(user(BOB));
    await settle();
    expect(orch.getCompletedSnapshot(user(BOB)).completed.has(K1)).toBe(false);
    // Bob's bucket was not populated with Alice's key.
    expect(orch.getSyncSnapshot(user(BOB)).hydrated).toBe(true);
    // A's data still intact under A's key.
    expect(orch.getCompletedSnapshot(user(ALICE)).completed.has(K1)).toBe(true);
  });

  it("does not transfer guest progress to an account on login", async () => {
    const { storage, map } = makeStorage();
    const orch = createProgressOrchestrator({ storage, remote: makeRemote() });

    orch.setIdentity(GUEST);
    orch.markCompleted(K1);
    orch.setIdentity(user(ALICE));
    await settle();

    expect(orch.getCompletedSnapshot(user(ALICE)).completed.size).toBe(0);
    expect(map.get(PROGRESS_STORAGE_KEY)).toContain(K1);
  });
});

describe("completions during the loading window", () => {
  it("defers a completion until identity resolves — never writes to guest", async () => {
    const { storage, map } = makeStorage();
    const remote = makeRemote();
    const orch = createProgressOrchestrator({ storage, remote });

    // Identity still loading: nothing may be attributed to any bucket.
    expect(orch.markCompleted(K1)).toBe(true);
    expect(map.has(PROGRESS_STORAGE_KEY)).toBe(false);
    expect(map.has(progressStorageKey(ALICE))).toBe(false);
    expect(remote.upsert).not.toHaveBeenCalled();

    orch.setIdentity(user(ALICE));
    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).pending).toBe(0),
    );
    // Deferred mark now belongs to the resolved account, locally + remote.
    expect(orch.getCompletedSnapshot(user(ALICE)).completed.has(K1)).toBe(true);
    expect(remote.upsert).toHaveBeenCalledWith(ALICE, K1);
    // Guest bucket still clean.
    expect(orch.getCompletedSnapshot(GUEST).completed.has(K1)).toBe(false);
  });

  it("a deferred completion lands in the guest bucket when the session resolves as guest", () => {
    const { storage } = makeStorage();
    const remote = makeRemote();
    const orch = createProgressOrchestrator({ storage, remote });

    orch.markCompleted(K1);
    orch.setIdentity(GUEST);

    expect(orch.getCompletedSnapshot(GUEST).completed.has(K1)).toBe(true);
    expect(remote.upsert).not.toHaveBeenCalled();
  });
});

describe("remote hydration", () => {
  it("merges remote keys into the account store without duplicates", async () => {
    const { storage, map } = makeStorage();
    map.set(
      progressStorageKey(ALICE),
      JSON.stringify({ version: 1, completed: [K1] }),
    );
    const remote = makeRemote();
    remote.fetchKeys.mockResolvedValue([K1, K2]);
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).hydrated).toBe(true),
    );

    const snapshot = orch.getCompletedSnapshot(user(ALICE));
    expect([...snapshot.completed].sort()).toEqual([K1, K2].sort());
    // Local entry preserved; no duplicates in the persisted payload.
    expect(map.get(progressStorageKey(ALICE))).toContain(K1);
    expect(remote.fetchKeys).toHaveBeenCalledWith(ALICE);
  });

  it("hydrates each account once per session", async () => {
    const { storage } = makeStorage();
    const remote = makeRemote();
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).hydrated).toBe(true),
    );
    orch.setIdentity(GUEST);
    orch.setIdentity(user(ALICE));
    await settle();
    expect(remote.fetchKeys).toHaveBeenCalledTimes(1);
  });

  it("a hydration failure keeps local data and reports hydrated=false", async () => {
    const { storage, map } = makeStorage();
    map.set(
      progressStorageKey(ALICE),
      JSON.stringify({ version: 1, completed: [K1] }),
    );
    const remote = makeRemote();
    remote.fetchKeys.mockRejectedValue(new Error("offline"));
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).syncing).toBe(false),
    );

    expect(orch.getSyncSnapshot(user(ALICE)).hydrated).toBe(false);
    expect(orch.getCompletedSnapshot(user(ALICE)).completed.has(K1)).toBe(true);
  });

  it("dedupes concurrent triggers into a single remote hydration", async () => {
    const { storage } = makeStorage();
    const remote = makeRemote();
    let resolveFetch!: (keys: string[]) => void;
    remote.fetchKeys.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    orch.setIdentity(user(ALICE));
    orch.handleOnline();
    orch.handleOnline();
    resolveFetch([]);
    await settle();

    expect(remote.fetchKeys).toHaveBeenCalledTimes(1);
  });

  it("a reconnect during an in-flight hydration is not dropped — it re-runs once", async () => {
    const { storage } = makeStorage();
    const remote = makeRemote();
    let rejectFetch!: (error: unknown) => void;
    remote.fetchKeys
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            rejectFetch = reject;
          }),
      )
      .mockResolvedValue([K1]);
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    // Reconnect lands mid-flight: it is queued as a trailing re-run, not
    // discarded — so a failed first attempt still gets retried.
    orch.handleOnline();
    rejectFetch(new Error("flaky"));
    await vi.waitFor(() =>
      expect(remote.fetchKeys).toHaveBeenCalledTimes(2),
    );
    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).hydrated).toBe(true),
    );
    expect(orch.getCompletedSnapshot(user(ALICE)).completed.has(K1)).toBe(true);
  });

  it("the first reconnect after an offline restart revives exhausted entries", async () => {
    const { storage } = makeStorage();
    // App reopened with an already-exhausted durable queue from before.
    storage.setItem(
      syncStorageKey(ALICE),
      JSON.stringify({
        version: 1,
        pending: [{ key: K1, attempts: MAX_SYNC_ATTEMPTS, lastError: "x" }],
      }),
    );
    const remote = makeRemote();
    const orch = createProgressOrchestrator({ storage, remote });

    // Session starts (still "offline") then connectivity returns: the
    // hydration-driven flush itself revives the budget — no second event
    // is needed for progress to reach the server.
    orch.setIdentity(user(ALICE));
    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).pending).toBe(0),
    );
    expect(remote.upsert).toHaveBeenCalledWith(ALICE, K1);
    expect(orch.getSyncSnapshot(user(ALICE)).failed).toBe(0);
  });

  it("a late hydration response still merges into the correct account bucket", async () => {
    const { storage } = makeStorage();
    const remote = makeRemote();
    const resolvers = new Map<string, (keys: string[]) => void>();
    remote.fetchKeys.mockImplementation(
      (userId) =>
        new Promise((resolve) => {
          resolvers.set(userId, resolve);
        }),
    );
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    // User switches away before the response arrives.
    orch.setIdentity(user(BOB));
    resolvers.get(ALICE)!([K1]);
    resolvers.get(BOB)!([]);
    await vi.waitFor(() =>
      expect(orch.getCompletedSnapshot(user(ALICE)).completed.has(K1)).toBe(true),
    );
    // Bob was untouched.
    expect(orch.getCompletedSnapshot(user(BOB)).completed.has(K1)).toBe(false);
  });

  it("a response answered under a switched session does not mark the account hydrated", async () => {
    const { storage } = makeStorage();
    const remote = makeRemote();
    const resolvers = new Map<string, ((keys: string[]) => void)[]>();
    remote.fetchKeys.mockImplementation(
      (userId) =>
        new Promise((resolve) => {
          const list = resolvers.get(userId) ?? [];
          list.push(resolve);
          resolvers.set(userId, list);
        }),
    );
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    orch.setIdentity(user(BOB));
    // Alice's fetch resolves after the session moved on — under Bob's
    // session its answer cannot be trusted, so Alice stays unhydrated.
    resolvers.get(ALICE)![0]([]);
    resolvers.get(BOB)![0]([]);
    await settle();

    orch.setIdentity(GUEST);
    orch.setIdentity(user(ALICE));
    resolvers.get(ALICE)![1]([]);
    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).hydrated).toBe(true),
    );
    // Alice was fetched twice: the stale answer never counted.
    expect(
      remote.fetchKeys.mock.calls.filter(([uid]) => uid === ALICE),
    ).toHaveLength(2);
  });
});

describe("idempotent remote writes", () => {
  it("writes locally first, then upserts with the composite key", async () => {
    const { storage } = makeStorage();
    const remote = makeRemote();
    const orch = createProgressOrchestrator({ storage, remote });
    orch.setIdentity(user(ALICE));
    await settle();

    orch.markCompleted(K1);
    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).pending).toBe(0),
    );
    expect(remote.upsert).toHaveBeenCalledWith(ALICE, K1);
    expect(orch.getCompletedSnapshot(user(ALICE)).completed.has(K1)).toBe(true);
  });

  it("a duplicate completion does not write remotely twice", async () => {
    const { storage } = makeStorage();
    const remote = makeRemote();
    const orch = createProgressOrchestrator({ storage, remote });
    orch.setIdentity(user(ALICE));
    await settle();

    orch.markCompleted(K1);
    await vi.waitFor(() => expect(remote.upsert).toHaveBeenCalledTimes(1));
    orch.markCompleted(K1);
    await settle();
    expect(remote.upsert).toHaveBeenCalledTimes(1);
  });

  it("guest completions never touch the remote", async () => {
    const { storage } = makeStorage();
    const remote = makeRemote();
    const orch = createProgressOrchestrator({ storage, remote });
    orch.setIdentity(GUEST);

    orch.markCompleted(K1);
    await settle();
    expect(remote.upsert).not.toHaveBeenCalled();
    expect(orch.getSyncSnapshot(GUEST).pending).toBe(0);
  });

  it("without a remote configured, marks stay purely local", () => {
    const { storage } = makeStorage();
    const orch = createProgressOrchestrator({ storage });
    orch.setIdentity(user(ALICE));
    orch.markCompleted(K1);
    expect(orch.getSyncSnapshot(user(ALICE)).configured).toBe(false);
    expect(orch.getSyncSnapshot(user(ALICE)).pending).toBe(0);
    expect(orch.getCompletedSnapshot(user(ALICE)).completed.has(K1)).toBe(true);
  });
});

describe("hydration reconciliation of pre-existing completions", () => {
  it("reconciles local completions never enqueued (offline session/pre-queue data)", async () => {
    const { storage, map } = makeStorage();
    // A completion persisted in the account bucket without any queue entry
    // — e.g. written before sync existed or during an offline session.
    map.set(
      progressStorageKey(ALICE),
      JSON.stringify({ version: 1, completed: [K1] }),
    );
    const remote = makeRemote(); // server knows nothing
    const orch = createProgressOrchestrator({ storage, remote });
    orch.setIdentity(user(ALICE));

    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).pending).toBe(0),
    );
    expect(remote.upsert).toHaveBeenCalledWith(ALICE, K1);
    // Local store untouched — still complete.
    expect(orch.getCompletedSnapshot(user(ALICE)).completed.has(K1)).toBe(true);
  });

  it("does not enqueue local completions the server already has", async () => {
    const { storage, map } = makeStorage();
    map.set(
      progressStorageKey(ALICE),
      JSON.stringify({ version: 1, completed: [K1] }),
    );
    const remote = makeRemote();
    remote.fetchKeys.mockResolvedValue([K1]);
    const orch = createProgressOrchestrator({ storage, remote });
    orch.setIdentity(user(ALICE));

    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).hydrated).toBe(true),
    );
    await settle();
    expect(remote.upsert).not.toHaveBeenCalled();
    expect(orch.getSyncSnapshot(user(ALICE)).pending).toBe(0);
  });
});

describe("retry and reconciliation", () => {
  it("failed upserts stay pending and are retried on reconnect", async () => {
    const { storage } = makeStorage();
    const remote = makeRemote();
    remote.upsert.mockRejectedValueOnce(new Error("offline"));
    const orch = createProgressOrchestrator({ storage, remote });
    orch.setIdentity(user(ALICE));
    await settle();

    orch.markCompleted(K1);
    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).pending).toBe(1),
    );

    orch.handleOnline();
    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).pending).toBe(0),
    );
    expect(remote.upsert).toHaveBeenCalledTimes(2);
  });

  it("retries are bounded: one attempt per entry per flush cycle, no background retries", async () => {
    const { storage, map } = makeStorage();
    const remote = makeRemote();
    remote.upsert.mockRejectedValue(new Error("always fails"));
    const orch = createProgressOrchestrator({ storage, remote });
    orch.setIdentity(user(ALICE));
    await settle();

    orch.markCompleted(K1);
    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).pending).toBe(1),
    );
    // Each reconnect event is one bounded flush cycle: one attempt per
    // pending entry, never an unbounded loop of retries on its own.
    for (let i = 0; i < MAX_SYNC_ATTEMPTS - 1; i += 1) {
      orch.handleOnline();
      await settle();
    }
    expect(remote.upsert.mock.calls.length).toBe(MAX_SYNC_ATTEMPTS);
    expect(orch.getSyncSnapshot(user(ALICE)).failed).toBe(1);
    // No background job pushes on its own: without another explicit event,
    // the call count stays put and the entry keeps its retry budget spent.
    await settle();
    expect(remote.upsert.mock.calls.length).toBe(MAX_SYNC_ATTEMPTS);
    // Entry is retained in the durable queue — never silently discarded.
    const raw = map.get(syncStorageKey(ALICE));
    expect(raw).toBeDefined();
    expect(raw).toContain(K1);
  });

  it("a reconnect revives exhausted entries — valid progress is never stranded", async () => {
    const { storage, map } = makeStorage();
    const remote = makeRemote();
    // Fail exactly MAX_SYNC_ATTEMPTS times, then recover.
    for (let i = 0; i < MAX_SYNC_ATTEMPTS; i += 1) {
      remote.upsert.mockRejectedValueOnce(new Error(`down ${i}`));
    }
    const orch = createProgressOrchestrator({ storage, remote });
    orch.setIdentity(user(ALICE));
    await settle();

    orch.markCompleted(K1);
    // markCompleted's push + (MAX-1) explicit flushes exhaust the budget.
    for (let i = 0; i < MAX_SYNC_ATTEMPTS - 1; i += 1) {
      orch.handleOnline();
      await settle();
    }
    expect(remote.upsert.mock.calls.length).toBe(MAX_SYNC_ATTEMPTS);
    expect(orch.getSyncSnapshot(user(ALICE)).failed).toBe(1);

    // Connectivity is back: the durable entry gets a fresh budget and
    // completes — it was never dropped.
    orch.handleOnline();
    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).pending).toBe(0),
    );
    expect(orch.getSyncSnapshot(user(ALICE)).failed).toBe(0);
    expect(map.get(syncStorageKey(ALICE))).toContain('"pending":[]');
    expect(remote.upsert).toHaveBeenCalledWith(ALICE, K1);
  });

  it("re-login reconciles pending writes without refetching", async () => {
    const { storage } = makeStorage();
    const remote = makeRemote();
    remote.upsert.mockRejectedValueOnce(new Error("down"));
    const orch = createProgressOrchestrator({ storage, remote });
    orch.setIdentity(user(ALICE));
    await settle();

    orch.markCompleted(K1);
    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).pending).toBe(1),
    );

    orch.setIdentity(GUEST);
    orch.setIdentity(user(ALICE));
    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).pending).toBe(0),
    );
    expect(remote.fetchKeys).toHaveBeenCalledTimes(1);
    expect(remote.upsert).toHaveBeenCalledTimes(2);
  });

  it("pending entries survive an orchestrator restart (durable queue)", () => {
    const { storage } = makeStorage();
    const first = createProgressOrchestrator({ storage, remote: makeRemote() });
    first.setIdentity(user(ALICE));
    // Seed a failed pending entry directly through the queue key.
    storage.setItem(
      syncStorageKey(ALICE),
      JSON.stringify({ version: 1, pending: [{ key: K1, attempts: 1 }] }),
    );
    const second = createProgressOrchestrator({
      storage,
      remote: makeRemote(),
    });
    expect(second.getSyncSnapshot(user(ALICE)).pending).toBe(1);
  });
});

describe("pending requests during account switching", () => {
  it("a push in-flight for A still confirms A's queue after switching to B", async () => {
    const { storage } = makeStorage();
    const remote = makeRemote();
    let resolveUpsert!: () => void;
    remote.upsert.mockImplementation(
      () => new Promise<void>((resolve) => (resolveUpsert = resolve)),
    );
    const orch = createProgressOrchestrator({ storage, remote });
    orch.setIdentity(user(ALICE));
    await settle();

    orch.markCompleted(K1);
    orch.setIdentity(user(BOB));
    resolveUpsert();
    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).pending).toBe(0),
    );
    // Bob untouched.
    expect(orch.getSyncSnapshot(user(BOB)).pending).toBe(0);
  });

  it("flushPending stops pushing once the owner is no longer active", async () => {
    const { storage } = makeStorage();
    const remote = makeRemote();
    remote.upsert.mockRejectedValue(new Error("down"));
    const orch = createProgressOrchestrator({ storage, remote });
    orch.setIdentity(user(ALICE));
    await settle();

    orch.markCompleted(K1);
    orch.markCompleted(K2);
    await vi.waitFor(() =>
      expect(orch.getSyncSnapshot(user(ALICE)).pending).toBe(2),
    );

    // Switch away mid-retry: A's queue must not push while B is active.
    orch.setIdentity(user(BOB));
    await settle();
    orch.handleOnline(); // targets the ACTIVE account (Bob), not Alice
    await settle();
    expect(orch.getSyncSnapshot(user(ALICE)).pending).toBe(2);
    const calls = remote.upsert.mock.calls.filter(
      ([uid]: [string, string]) => uid === BOB,
    );
    expect(calls).toHaveLength(0);
  });
});

describe("sync snapshot honesty", () => {
  it("reports configured=false and no hydration without a remote", () => {
    const { storage } = makeStorage();
    const orch = createProgressOrchestrator({ storage });
    expect(orch.getSyncSnapshot(user(ALICE))).toEqual({
      configured: false,
      hydrated: false,
      pending: 0,
      failed: 0,
      syncing: false,
    });
    expect(orch.getSyncSnapshot(GUEST).configured).toBe(false);
  });

  it("guest and loading identities never claim hydration", () => {
    const { storage } = makeStorage();
    const orch = createProgressOrchestrator({ storage, remote: makeRemote() });
    orch.setIdentity(user(ALICE));
    expect(orch.getSyncSnapshot(GUEST).hydrated).toBe(false);
    expect(orch.getSyncSnapshot(LOADING).hydrated).toBe(false);
  });
});
