import { describe, expect, it, vi } from "vitest";

import {
  EMPTY_CLAIM,
  createProgressOrchestrator,
  type ProgressIdentity,
} from "./progress-orchestrator";
import { claimStorageKey } from "./progress-claim";
import {
  PROGRESS_STORAGE_KEY,
  progressStorageKey,
  type ProgressStorage,
} from "./progress";
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
const K3 = "alfabeto/letras-a-e/letra-c";
const K9 = "vocabulario/saudacoes/oi";

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

/**
 * A shared `rows` map stands in for `lesson_completions`: remotes built over
 * the same map behave like two sessions against one database.
 */
function makeRemote(rows: Map<string, Set<string>>) {
  const remote = {
    fetchKeys: vi
      .fn<(userId: string) => Promise<string[]>>()
      .mockImplementation(async (userId) => [...(rows.get(userId) ?? [])]),
    upsert: vi
      .fn<(userId: string, key: string) => Promise<void>>()
      .mockImplementation(async (userId, key) => {
        let set = rows.get(userId);
        if (!set) rows.set(userId, (set = new Set()));
        set.add(key);
      }),
  };
  return remote satisfies ProgressRemote;
}

function seedGuest(map: Map<string, string>, keys: string[]) {
  map.set(
    PROGRESS_STORAGE_KEY,
    JSON.stringify({ version: 1, completed: keys }),
  );
}

async function settle() {
  // Drain the whole claim chain: enqueue → flush → push → post-flush
  // verification fetch → confirm. Two macrotask rounds are enough.
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("guest → account claim", () => {
  it("login without consent never transfers guest progress", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1, K2]);
    const rows = new Map<string, Set<string>>();
    const remote = makeRemote(rows);
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    await settle();

    expect(remote.upsert).not.toHaveBeenCalled();
    expect(rows.has(ALICE)).toBe(false);
    const claim = orch.getClaimSnapshot(user(ALICE));
    expect(claim.eligible).toEqual(new Set([K1, K2]));
    expect(claim.initiated.size).toBe(0);
  });

  it("hydration does not touch the guest bucket or the claim marker", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1]);
    const orch = createProgressOrchestrator({
      storage,
      remote: makeRemote(new Map()),
    });

    orch.setIdentity(user(ALICE));
    await settle();

    expect(map.get(PROGRESS_STORAGE_KEY)).toContain(K1);
    expect(map.has(claimStorageKey(ALICE))).toBe(false);
  });

  it("explicit consent claims the eligible set end-to-end", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1, K2]);
    const rows = new Map<string, Set<string>>();
    const remote = makeRemote(rows);
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    await settle();
    expect(orch.claimGuestProgress(ALICE)).toBe("started");

    // Intent is persisted before any network work completes.
    expect(map.get(claimStorageKey(ALICE))).toContain(K1);
    expect(orch.getClaimSnapshot(user(ALICE)).initiated).toEqual(
      new Set([K1, K2]),
    );

    await settle();
    expect(rows.get(ALICE)).toEqual(new Set([K1, K2]));
    const claim = orch.getClaimSnapshot(user(ALICE));
    expect(claim.initiated.size).toBe(0);
    expect(claim.confirmed).toEqual(new Set([K1, K2]));
    expect(claim.eligible.size).toBe(0);
    // The guest bucket is preserved untouched.
    expect(map.get(PROGRESS_STORAGE_KEY)).toContain(K1);
    expect(map.get(PROGRESS_STORAGE_KEY)).toContain(K2);
  });

  it("unions guest keys with existing account rows, no duplicates", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1, K2]);
    const rows = new Map<string, Set<string>>([[ALICE, new Set([K2])]]);
    const orch = createProgressOrchestrator({
      storage,
      remote: makeRemote(rows),
    });

    orch.setIdentity(user(ALICE));
    await settle();
    orch.claimGuestProgress(ALICE);
    await settle();

    expect(rows.get(ALICE)).toEqual(new Set([K1, K2]));
  });

  it("repeating the transfer is a no-op once confirmed", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1]);
    const remote = makeRemote(new Map());
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    await settle();
    orch.claimGuestProgress(ALICE);
    await settle();
    const calls = remote.upsert.mock.calls.length;

    expect(orch.claimGuestProgress(ALICE)).toBe("no-eligible");
    await settle();
    expect(remote.upsert.mock.calls.length).toBe(calls);
  });

  it("offers newly completed guest activities after a confirmed claim", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1]);
    const orch = createProgressOrchestrator({
      storage,
      remote: makeRemote(new Map()),
    });

    orch.setIdentity(user(ALICE));
    await settle();
    orch.claimGuestProgress(ALICE);
    await settle();
    expect(orch.getClaimSnapshot(user(ALICE)).eligible.size).toBe(0);

    // A new guest completion re-opens the offer for that key only.
    orch.setIdentity(GUEST);
    orch.markCompleted(K3);
    orch.setIdentity(user(ALICE));
    await settle();
    expect(orch.getClaimSnapshot(user(ALICE)).eligible).toEqual(
      new Set([K3]),
    );
  });

  it("'keep separate' persists the dismissal for that account", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1, K2]);
    const rows = new Map<string, Set<string>>();
    const orch = createProgressOrchestrator({
      storage,
      remote: makeRemote(rows),
    });

    orch.setIdentity(user(ALICE));
    await settle();
    orch.dismissGuestClaim(ALICE);
    expect(orch.getClaimSnapshot(user(ALICE)).eligible.size).toBe(0);
    expect(rows.has(ALICE)).toBe(false);

    // Reload: a fresh orchestrator still does not offer them.
    const orch2 = createProgressOrchestrator({
      storage,
      remote: makeRemote(rows),
    });
    orch2.setIdentity(user(ALICE));
    await settle();
    expect(orch2.getClaimSnapshot(user(ALICE)).eligible.size).toBe(0);
  });

  it("one account's dismissal does not affect another account's offer", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1]);
    const orch = createProgressOrchestrator({
      storage,
      remote: makeRemote(new Map()),
    });

    orch.setIdentity(user(ALICE));
    await settle();
    orch.dismissGuestClaim(ALICE);

    orch.setIdentity(user(BOB));
    await settle();
    expect(orch.getClaimSnapshot(user(BOB)).eligible).toEqual(new Set([K1]));
  });

  it("a failed push preserves the guest bucket and the persisted intent", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1]);
    const rows = new Map<string, Set<string>>();
    const remote = makeRemote(rows);
    remote.upsert.mockRejectedValue(new Error("offline"));
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    await settle();
    orch.claimGuestProgress(ALICE);
    await settle();

    // Nothing reached the remote; the intent and the guest data stand.
    expect(rows.has(ALICE)).toBe(false);
    expect(map.get(PROGRESS_STORAGE_KEY)).toContain(K1);
    const claim = orch.getClaimSnapshot(user(ALICE));
    expect(claim.initiated).toEqual(new Set([K1]));
    expect(claim.confirmed.size).toBe(0);
    // The durable queue still holds the key for a later attempt.
    expect(map.get(syncStorageKey(ALICE))).toContain(K1);
  });

  it("a transfer authorized before a reload completes on the next session", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1, K2]);
    const rows = new Map<string, Set<string>>();

    // First session: claim initiated but writes/verification never land.
    const failing = makeRemote(rows);
    failing.upsert.mockRejectedValue(new Error("offline"));
    failing.fetchKeys.mockRejectedValue(new Error("offline"));
    const first = createProgressOrchestrator({ storage, remote: failing });
    first.setIdentity(user(ALICE));
    await settle();
    first.claimGuestProgress(ALICE);
    await settle();
    expect(rows.has(ALICE)).toBe(false);

    // New session over the same storage: the persisted intent resumes,
    // the queue flushes and the remote set confirms the claim.
    const working = makeRemote(rows);
    const second = createProgressOrchestrator({ storage, remote: working });
    second.setIdentity(user(ALICE));
    await settle();

    expect(rows.get(ALICE)).toEqual(new Set([K1, K2]));
    const claim = second.getClaimSnapshot(user(ALICE));
    expect(claim.initiated.size).toBe(0);
    expect(claim.confirmed).toEqual(new Set([K1, K2]));
  });

  it("stops pushing under the wrong identity mid-transfer", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1, K2]);
    const rows = new Map<string, Set<string>>();
    const remote = makeRemote(rows);
    let resolveUpsert: (() => void) | undefined;
    remote.upsert.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveUpsert = resolve;
        }),
    );
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    await settle();
    orch.claimGuestProgress(ALICE);
    // The account changes while the first write is in flight.
    orch.setIdentity(user(BOB));
    resolveUpsert!();
    await settle();

    // Only the in-flight write ran; subsequent keys waited for ownership.
    expect(remote.upsert.mock.calls.length).toBe(1);
    // Alice's intent is intact for her next session; Bob sees no claim UI
    // for it (his snapshot only tracks his own marker).
    expect(orch.getClaimSnapshot(user(BOB)).initiated.size).toBe(0);
  });

  it("two tabs claiming the same keys converge without duplication", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1]);
    const rows = new Map<string, Set<string>>();
    const tabA = createProgressOrchestrator({
      storage,
      remote: makeRemote(rows),
    });
    const tabB = createProgressOrchestrator({
      storage,
      remote: makeRemote(rows),
    });

    tabA.setIdentity(user(ALICE));
    tabB.setIdentity(user(ALICE));
    await settle();
    tabA.claimGuestProgress(ALICE);
    tabB.claimGuestProgress(ALICE);
    await settle();

    expect(rows.get(ALICE)).toEqual(new Set([K1]));
    const queueRecord = JSON.parse(map.get(syncStorageKey(ALICE))!) as {
      pending: { key: string }[];
    };
    expect(queueRecord.pending).toEqual([]);
    expect(tabA.getClaimSnapshot(user(ALICE)).confirmed.has(K1)).toBe(true);
  });

  it("confirms by exact remote key set, not by count", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1, K2]);
    const rows = new Map<string, Set<string>>();
    const remote = makeRemote(rows);
    // The account has unrelated remote rows; the verification fetch sees
    // K1 but never K2.
    remote.fetchKeys.mockImplementation(async () => [K9, K1]);
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    await settle();
    orch.claimGuestProgress(ALICE);
    await settle();

    const claim = orch.getClaimSnapshot(user(ALICE));
    expect(claim.confirmed).toEqual(new Set([K1]));
    expect(claim.initiated).toEqual(new Set([K2]));
  });

  it("unrelated queue entries do not block claim confirmation", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1]);
    // The account's queue already holds an unrelated pending key.
    map.set(
      syncStorageKey(ALICE),
      JSON.stringify({
        version: 1,
        pending: [{ key: K9, attempts: 0, lastError: null }],
      }),
    );
    const rows = new Map<string, Set<string>>();
    const remote = makeRemote(rows);
    remote.upsert.mockImplementation(async (userId, key) => {
      if (key === K9) throw new Error("offline for K9");
      let set = rows.get(userId);
      if (!set) rows.set(userId, (set = new Set()));
      set.add(key);
    });
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    await settle();
    orch.claimGuestProgress(ALICE);
    await settle();

    const claim = orch.getClaimSnapshot(user(ALICE));
    expect(claim.confirmed).toEqual(new Set([K1]));
    // The unrelated entry is still pending — it did not block the claim.
    expect(orch.getSyncSnapshot(user(ALICE)).pending).toBe(1);
  });

  it("exhausted retries surface as a recoverable failed state", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1]);
    const remote = makeRemote(new Map());
    // Hydration and verification fetch succeed; only the writes fail.
    remote.upsert.mockRejectedValue(new Error("offline"));
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    await settle();
    orch.claimGuestProgress(ALICE);
    await settle();
    // The claim's first flush already spent one attempt; MAX-1 more
    // online events exhaust the budget (a further flush would reset it).
    for (let i = 0; i < MAX_SYNC_ATTEMPTS - 1; i += 1) {
      orch.handleOnline();
      await settle();
    }
    const claim = orch.getClaimSnapshot(user(ALICE));
    expect(claim.initiated).toEqual(new Set([K1]));
    expect(claim.failed).toBe(1);
    expect(map.get(PROGRESS_STORAGE_KEY)).toContain(K1);
  });

  it("never offers a transfer without a configured remote", () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1]);
    const orch = createProgressOrchestrator({ storage });

    orch.setIdentity(user(ALICE));
    expect(orch.getClaimSnapshot(user(ALICE))).toBe(EMPTY_CLAIM);
    expect(orch.claimGuestProgress(ALICE)).toBe("unavailable");
  });

  it("shows nothing offerable when the guest bucket is empty", async () => {
    const { storage } = makeStorage();
    const orch = createProgressOrchestrator({
      storage,
      remote: makeRemote(new Map()),
    });
    orch.setIdentity(user(ALICE));
    await settle();
    expect(orch.getClaimSnapshot(user(ALICE)).eligible.size).toBe(0);
    expect(orch.claimGuestProgress(ALICE)).toBe("no-eligible");
  });

  it("rejects claims from a guest or loading identity", () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1]);
    const orch = createProgressOrchestrator({
      storage,
      remote: makeRemote(new Map()),
    });
    orch.setIdentity(GUEST);
    expect(orch.claimGuestProgress(ALICE)).toBe("wrong-identity");
    orch.setIdentity(LOADING);
    expect(orch.claimGuestProgress(ALICE)).toBe("wrong-identity");
    // The claim can only target the account actually signed in.
  });

  it("rejects a claim aimed at a different account than the session's", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1]);
    const remote = makeRemote(new Map());
    const orch = createProgressOrchestrator({ storage, remote });
    orch.setIdentity(user(ALICE));
    await settle();
    expect(orch.claimGuestProgress(BOB)).toBe("wrong-identity");
    expect(map.has(claimStorageKey(BOB))).toBe(false);
    expect(remote.upsert).not.toHaveBeenCalledWith(BOB, K1);
  });

  it("never copies another account's bucket — claims only read the guest store", async () => {
    const { storage, map } = makeStorage();
    // Alice's account bucket has a key; Bob signs in on the same device.
    map.set(
      progressStorageKey(ALICE),
      JSON.stringify({ version: 1, completed: [K1] }),
    );
    const rows = new Map<string, Set<string>>();
    const orch = createProgressOrchestrator({
      storage,
      remote: makeRemote(rows),
    });

    orch.setIdentity(user(BOB));
    await settle();
    // Bob's offer is about the guest bucket only — Alice's key is not it.
    expect(orch.getClaimSnapshot(user(BOB)).eligible.size).toBe(0);
    expect(orch.getCompletedSnapshot(user(BOB)).completed.has(K1)).toBe(
      false,
    );
    expect(orch.claimGuestProgress(BOB)).toBe("no-eligible");
    expect(rows.has(BOB)).toBe(false);
  });

  it("re-enqueues an authorized claim whose queue entry is missing", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1, K2, K3]);
    // Intent persisted in a previous session; its queue entry is gone.
    map.set(
      claimStorageKey(ALICE),
      JSON.stringify({
        version: 1,
        dismissed: [],
        initiated: [K1, K2],
        confirmed: [],
      }),
    );
    const rows = new Map<string, Set<string>>();
    const remote = makeRemote(rows);
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    await settle();

    // The authorized keys are re-enqueued and pushed without new consent.
    expect(rows.get(ALICE)).toEqual(new Set([K1, K2]));
    // Only previously authorized keys move — K3 was never consented to,
    // stays in the guest bucket and remains offerable for fresh consent.
    expect(remote.upsert).not.toHaveBeenCalledWith(ALICE, K3);
    const claim = orch.getClaimSnapshot(user(ALICE));
    expect(claim.confirmed).toEqual(new Set([K1, K2]));
    expect(claim.eligible).toEqual(new Set([K3]));
    expect(map.get(PROGRESS_STORAGE_KEY)).toContain(K3);
  });

  it("does not re-enqueue initiated keys the remote already covers", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1, K2]);
    map.set(
      claimStorageKey(ALICE),
      JSON.stringify({
        version: 1,
        dismissed: [],
        initiated: [K1, K2],
        confirmed: [],
      }),
    );
    // K1 already reached the remote in the lost session: no re-push.
    const rows = new Map<string, Set<string>>([[ALICE, new Set([K1])]]);
    const remote = makeRemote(rows);
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    await settle();

    expect(remote.upsert).not.toHaveBeenCalledWith(ALICE, K1);
    expect(remote.upsert).toHaveBeenCalledWith(ALICE, K2);
    const claim = orch.getClaimSnapshot(user(ALICE));
    expect(claim.confirmed).toEqual(new Set([K1, K2]));
  });

  it("a fetch resolved under a switched session confirms nothing", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1, K2]);
    map.set(
      claimStorageKey(ALICE),
      JSON.stringify({
        version: 1,
        dismissed: [],
        initiated: [K1, K2],
        confirmed: [],
      }),
    );
    const rows = new Map<string, Set<string>>([[ALICE, new Set([K1])]]);
    const remote = makeRemote(rows);
    // fetchKeys calls queue behind a manual gate when `gate` is set.
    const pending: ((keys: string[]) => void)[] = [];
    let gate = false;
    remote.fetchKeys.mockImplementation((userId) =>
      gate
        ? new Promise<string[]>((resolve) => pending.push(resolve))
        : Promise.resolve([...(rows.get(userId) ?? [])]),
    );
    const orch = createProgressOrchestrator({ storage, remote });

    gate = true;
    orch.setIdentity(user(ALICE));
    await settle();
    // Alice's hydrate answer: K1 confirms, K2 re-enqueues and pushes.
    pending[0]([K1]);
    await settle();
    // The post-flush verification fetch is now pending — and the session
    // switches before it resolves.
    orch.setIdentity(user(BOB));
    await settle();
    pending[1]([K1, K2]); // Alice's late answer under Bob's session.
    pending.at(-1)!([K1]); // Bob's own hydrate.
    await settle();

    // K2 is NOT confirmed under a stale identity: it stays initiated.
    const claim = orch.getClaimSnapshot(user(ALICE));
    expect(claim.confirmed).toEqual(new Set([K1]));
    expect(claim.initiated).toEqual(new Set([K2]));

    // Back under Alice's session the next pass confirms it honestly.
    gate = false;
    orch.setIdentity(user(ALICE));
    await settle();
    expect(orch.getClaimSnapshot(user(ALICE)).confirmed).toEqual(
      new Set([K1, K2]),
    );
  });

  it("claimed keys enter the account's local store on consent", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1]);
    const orch = createProgressOrchestrator({
      storage,
      remote: makeRemote(new Map()),
    });

    orch.setIdentity(user(ALICE));
    await settle();
    orch.claimGuestProgress(ALICE);

    // Consented keys belong to the account's progress immediately —
    // activity and trails never show transferred lessons as undone.
    expect(
      orch.getCompletedSnapshot(user(ALICE)).completed.has(K1),
    ).toBe(true);
    await settle();
    expect(
      orch.getCompletedSnapshot(user(ALICE)).completed.has(K1),
    ).toBe(true);
  });

  it("verifies the claim after a flush deferred by a busy queue", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1]);
    // An unrelated pending write keeps the flush busy when the claim lands.
    map.set(
      syncStorageKey(ALICE),
      JSON.stringify({
        version: 1,
        pending: [{ key: K9, attempts: 0, lastError: null }],
      }),
    );
    const rows = new Map<string, Set<string>>();
    const remote = makeRemote(rows);
    const resolvers: (() => void)[] = [];
    remote.upsert.mockImplementation(
      (userId, key) =>
        new Promise<void>((resolve) =>
          resolvers.push(() => {
            let set = rows.get(userId);
            if (!set) rows.set(userId, (set = new Set()));
            set.add(key);
            resolve();
          }),
        ),
    );
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    await settle();
    // Hydration's flush is parked on the pending K9 write.
    orch.claimGuestProgress(ALICE);
    await settle();

    // The claim's own verify pass ran before the deferred flush: K1 was
    // not remote yet, so it stays initiated — but must not get stuck.
    expect(orch.getClaimSnapshot(user(ALICE)).initiated).toEqual(
      new Set([K1]),
    );

    for (const resolve of resolvers.splice(0)) resolve();
    await settle();
    for (const resolve of resolvers.splice(0)) resolve();
    await settle();

    expect(rows.get(ALICE)).toEqual(new Set([K9, K1]));
    expect(orch.getClaimSnapshot(user(ALICE)).confirmed).toEqual(
      new Set([K1]),
    );
  });

  it("offers guest keys a sibling tab recorded after this session started", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1]);
    const orch = createProgressOrchestrator({
      storage,
      remote: makeRemote(new Map()),
    });

    orch.setIdentity(user(ALICE));
    await settle();
    expect(orch.getClaimSnapshot(user(ALICE)).eligible).toEqual(
      new Set([K1]),
    );

    // Another tab completes K3: the shared record grows while this
    // store's in-memory snapshot stays stale — the offer must see both.
    seedGuest(map, [K1, K3]);
    expect(orch.getClaimSnapshot(user(ALICE)).eligible).toEqual(
      new Set([K1, K3]),
    );
  });

  it("claims only the keys the offer presented", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1]);
    const rows = new Map<string, Set<string>>();
    const orch = createProgressOrchestrator({
      storage,
      remote: makeRemote(rows),
    });

    orch.setIdentity(user(ALICE));
    await settle();
    const offered = new Set(
      orch.getClaimSnapshot(user(ALICE)).eligible,
    );
    // A sibling tab completes K3 between the render and the click: it
    // was never shown, so the click must not transfer it.
    seedGuest(map, [K1, K3]);

    expect(orch.claimGuestProgress(ALICE, offered)).toBe("started");
    await settle();

    expect(rows.get(ALICE)).toEqual(new Set([K1]));
    expect(
      orch.getCompletedSnapshot(user(ALICE)).completed.has(K3),
    ).toBe(false);
    // K3 stays offerable for a fresh consent.
    expect(orch.getClaimSnapshot(user(ALICE)).eligible).toEqual(
      new Set([K3]),
    );
  });

  it("'keep separate' only dismisses the keys the offer presented", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1]);
    const orch = createProgressOrchestrator({
      storage,
      remote: makeRemote(new Map()),
    });

    orch.setIdentity(user(ALICE));
    await settle();
    const offered = new Set(
      orch.getClaimSnapshot(user(ALICE)).eligible,
    );
    seedGuest(map, [K1, K3]);

    orch.dismissGuestClaim(ALICE, offered);

    // Only the shown key is dismissed; the late one stays offerable.
    expect(orch.getClaimSnapshot(user(ALICE)).eligible).toEqual(
      new Set([K3]),
    );
  });

  it("restores an authorized transfer locally even when the remote is down", async () => {
    const { storage, map } = makeStorage();
    seedGuest(map, [K1]);
    // A persisted intent with no store merge and no queue entry yet.
    map.set(
      claimStorageKey(ALICE),
      JSON.stringify({
        version: 1,
        dismissed: [],
        initiated: [K1],
        confirmed: [],
      }),
    );
    const remote = makeRemote(new Map());
    remote.fetchKeys.mockRejectedValue(new Error("offline"));
    remote.upsert.mockRejectedValue(new Error("offline"));
    const orch = createProgressOrchestrator({ storage, remote });

    orch.setIdentity(user(ALICE));
    await settle();

    // The authorized key belongs to the account's local store even
    // though the remote never answered — local-first resume.
    expect(
      orch.getCompletedSnapshot(user(ALICE)).completed.has(K1),
    ).toBe(true);
    const claim = orch.getClaimSnapshot(user(ALICE));
    expect(claim.initiated).toEqual(new Set([K1]));
    expect(claim.confirmed.size).toBe(0);
  });
});
