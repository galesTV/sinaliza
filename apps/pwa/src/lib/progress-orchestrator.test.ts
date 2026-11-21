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

  it("retries are bounded by MAX_SYNC_ATTEMPTS", async () => {
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
    for (let i = 0; i < MAX_SYNC_ATTEMPTS + 2; i += 1) {
      orch.handleOnline();
      await vi.waitFor(() => expect(remote.upsert).toHaveBeenCalled());
    }
    expect(remote.upsert.mock.calls.length).toBeLessThanOrEqual(MAX_SYNC_ATTEMPTS);
    expect(orch.getSyncSnapshot(user(ALICE)).failed).toBe(1);
    // Entry is retained in the durable queue — never silently discarded.
    const raw = map.get(syncStorageKey(ALICE));
    expect(raw).toBeDefined();
    expect(raw).toContain(K1);
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
