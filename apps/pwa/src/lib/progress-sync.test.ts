import { describe, expect, it, vi } from "vitest";

import type { ProgressStorage } from "./progress";
import {
  createSupabaseProgressRemote,
  createSyncQueue,
  syncStorageKey,
} from "./progress-sync";

function makeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    map,
  } satisfies ProgressStorage & { map: Map<string, string> };
}

const UID = "11111111-1111-1111-1111-111111111111";
const KEY = "alfabeto/letras-a-e/letra-a";

describe("createSyncQueue", () => {
  it("enqueues, lists and confirms entries", () => {
    const queue = createSyncQueue({
      storage: makeStorage(),
      storageKey: syncStorageKey(UID),
    });
    queue.enqueue(KEY);
    queue.enqueue("alfabeto/letras-a-e/letra-b");
    expect(queue.list().map((e) => e.key)).toEqual([KEY, "alfabeto/letras-a-e/letra-b"]);
    expect(queue.has(KEY)).toBe(true);

    queue.confirm(KEY);
    expect(queue.has(KEY)).toBe(false);
    expect(queue.list()).toHaveLength(1);
  });

  it("is idempotent on repeated enqueues", () => {
    const queue = createSyncQueue({
      storage: makeStorage(),
      storageKey: syncStorageKey(UID),
    });
    queue.enqueue(KEY);
    queue.enqueue(KEY);
    expect(queue.list()).toHaveLength(1);
  });

  it("records attempts with the error message", () => {
    const queue = createSyncQueue({
      storage: makeStorage(),
      storageKey: syncStorageKey(UID),
    });
    queue.enqueue(KEY);
    const entry = queue.recordAttempt(KEY, new Error("network down"));
    expect(entry.attempts).toBe(1);
    expect(entry.lastError).toBe("network down");
  });

  it("records attempts even for entries never enqueued", () => {
    const queue = createSyncQueue({
      storage: makeStorage(),
      storageKey: syncStorageKey(UID),
    });
    const entry = queue.recordAttempt(KEY, "boom");
    expect(entry.attempts).toBe(1);
    expect(queue.has(KEY)).toBe(true);
  });

  it("persists across instances (survives reload)", () => {
    const storage = makeStorage();
    const first = createSyncQueue({ storage, storageKey: syncStorageKey(UID) });
    first.enqueue(KEY);
    first.recordAttempt(KEY, new Error("x"));

    const second = createSyncQueue({
      storage,
      storageKey: syncStorageKey(UID),
    });
    expect(second.list()).toEqual([
      { key: KEY, attempts: 1, lastError: "x" },
    ]);
  });

  it("keeps queues isolated per account", () => {
    const storage = makeStorage();
    const alice = createSyncQueue({
      storage,
      storageKey: syncStorageKey("user-a"),
    });
    const bob = createSyncQueue({
      storage,
      storageKey: syncStorageKey("user-b"),
    });
    alice.enqueue(KEY);
    expect(bob.list()).toHaveLength(0);
  });

  it("treats malformed payloads as empty", () => {
    const storage = makeStorage();
    storage.map.set(syncStorageKey(UID), "{not json");
    const queue = createSyncQueue({ storage, storageKey: syncStorageKey(UID) });
    expect(queue.list()).toHaveLength(0);
  });

  it("drops malformed pending entries but keeps valid ones", () => {
    const storage = makeStorage();
    storage.map.set(
      syncStorageKey(UID),
      JSON.stringify({
        version: 1,
        pending: [KEY, { key: "a/b/c", attempts: "x" }, { key: "d/e/f", attempts: 2 }],
      }),
    );
    const queue = createSyncQueue({ storage, storageKey: syncStorageKey(UID) });
    expect(queue.list().map((e) => e.key)).toEqual(["a/b/c", "d/e/f"]);
  });
});

describe("createSupabaseProgressRemote", () => {
  function makeClient({
    selectData = [],
    selectError = null,
    upsertError = null,
  }: {
    selectData?: unknown[];
    selectError?: unknown;
    upsertError?: unknown;
  } = {}) {
    const upsert = vi.fn().mockResolvedValue({ error: upsertError });
    const eq = vi.fn().mockResolvedValue({ data: selectData, error: selectError });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select, upsert });
    return { client: { from } as never, from, select, eq, upsert };
  }

  it("fetches only the given user's lesson keys", async () => {
    const { client, from, select, eq } = makeClient({
      selectData: [{ lesson_key: KEY }, { lesson_key: "a/b/c" }],
    });
    const remote = createSupabaseProgressRemote(client);
    await expect(remote.fetchKeys(UID)).resolves.toEqual([KEY, "a/b/c"]);
    expect(from).toHaveBeenCalledWith("lesson_completions");
    expect(select).toHaveBeenCalledWith("lesson_key");
    expect(eq).toHaveBeenCalledWith("user_id", UID);
  });

  it("filters non-string rows defensively", async () => {
    const { client } = makeClient({
      selectData: [{ lesson_key: KEY }, { lesson_key: null }, {}],
    });
    const remote = createSupabaseProgressRemote(client);
    await expect(remote.fetchKeys(UID)).resolves.toEqual([KEY]);
  });

  it("propagates select errors", async () => {
    const { client } = makeClient({ selectError: new Error("rls") });
    const remote = createSupabaseProgressRemote(client);
    await expect(remote.fetchKeys(UID)).rejects.toThrow("rls");
  });

  it("upserts with the composite PK conflict and never sends completed_at", async () => {
    const { client, upsert } = makeClient();
    const remote = createSupabaseProgressRemote(client);
    await remote.upsert(UID, KEY);
    expect(upsert).toHaveBeenCalledWith(
      { user_id: UID, lesson_key: KEY },
      { onConflict: "user_id,lesson_key", ignoreDuplicates: true },
    );
    const [row] = upsert.mock.calls[0];
    expect(row).not.toHaveProperty("completed_at");
  });

  it("propagates upsert errors", async () => {
    const { client } = makeClient({ upsertError: new Error("conflict") });
    const remote = createSupabaseProgressRemote(client);
    await expect(remote.upsert(UID, KEY)).rejects.toThrow("conflict");
  });
});
