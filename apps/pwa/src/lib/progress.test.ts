import { describe, expect, it, vi } from "vitest";

import {
  PROGRESS_STORAGE_KEY,
  createProgressStore,
  lessonKey,
  parseLessonKey,
  progressStorageKey,
  type ProgressStorage,
} from "./progress";

function makeStorage(initial?: string) {
  const map = new Map<string, string>();
  if (initial !== undefined) map.set(PROGRESS_STORAGE_KEY, initial);
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    map,
  } satisfies ProgressStorage & { map: Map<string, string> };
}

const KEY = lessonKey("alfabeto", "letras-a-e", "letra-a");

describe("lessonKey / parseLessonKey", () => {
  it("builds a stable trilha/modulo/licao identifier", () => {
    expect(KEY).toBe("alfabeto/letras-a-e/letra-a");
    expect(parseLessonKey(KEY)).toEqual({
      pathSlug: "alfabeto",
      moduleSlug: "letras-a-e",
      lessonSlug: "letra-a",
    });
  });

  it("rejects malformed keys", () => {
    expect(parseLessonKey("a/b")).toBeNull();
    expect(parseLessonKey("a/b/c/d")).toBeNull();
    expect(parseLessonKey("a//c")).toBeNull();
    expect(parseLessonKey("")).toBeNull();
  });
});

describe("progressStorageKey", () => {
  it("keeps the shared guest key when there is no account", () => {
    expect(progressStorageKey(null)).toBe(PROGRESS_STORAGE_KEY);
    expect(progressStorageKey(null)).toBe("sinaliza.progress.v1");
  });

  it("scopes keys per account so progress never mixes", () => {
    const alice = progressStorageKey("user-a-uuid");
    const bob = progressStorageKey("user-b-uuid");

    expect(alice).toBe("sinaliza.progress.v1.u_user-a-uuid");
    expect(bob).toBe("sinaliza.progress.v1.u_user-b-uuid");
    expect(alice).not.toBe(bob);
    expect(alice).not.toBe(PROGRESS_STORAGE_KEY);
  });
});

describe("createProgressStore", () => {
  it("starts empty when no record exists", () => {
    const store = createProgressStore({ storage: makeStorage() });
    expect(store.getSnapshot().completed.size).toBe(0);
    expect(store.isCompleted(KEY)).toBe(false);
  });

  it("records a lesson and persists it", () => {
    const storage = makeStorage();
    const store = createProgressStore({ storage });

    expect(store.markCompleted(KEY)).toBe(true);
    expect(store.isCompleted(KEY)).toBe(true);
    expect(store.getSnapshot().completed.has(KEY)).toBe(true);

    const raw = storage.map.get(PROGRESS_STORAGE_KEY);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw!);
    expect(parsed).toEqual({ version: 1, completed: [KEY] });
  });

  it("restores completed lessons from storage", () => {
    const storage = makeStorage(
      JSON.stringify({ version: 1, completed: [KEY] }),
    );
    const store = createProgressStore({ storage });
    expect(store.isCompleted(KEY)).toBe(true);
  });

  it("rejects duplicate completions", () => {
    const store = createProgressStore({ storage: makeStorage() });
    expect(store.markCompleted(KEY)).toBe(true);
    expect(store.markCompleted(KEY)).toBe(false);
    expect(store.getSnapshot().completed.size).toBe(1);
  });

  it("treats malformed JSON as empty", () => {
    const store = createProgressStore({
      storage: makeStorage("{not json"),
    });
    expect(store.getSnapshot().completed.size).toBe(0);
  });

  it("treats a wrong-version or wrongly-shaped payload as empty", () => {
    for (const payload of [
      JSON.stringify({ version: 2, completed: [KEY] }),
      JSON.stringify({ completed: [KEY] }),
      JSON.stringify({ version: 1, completed: "oops" }),
      JSON.stringify([KEY]),
      "null",
    ]) {
      const store = createProgressStore({ storage: makeStorage(payload) });
      expect(store.getSnapshot().completed.size).toBe(0);
    }
  });

  it("filters non-string entries out of the payload", () => {
    const store = createProgressStore({
      storage: makeStorage(
        JSON.stringify({ version: 1, completed: [KEY, 42, null] }),
      ),
    });
    expect([...store.getSnapshot().completed]).toEqual([KEY]);
  });

  it("survives a throwing getItem", () => {
    const store = createProgressStore({
      storage: {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: vi.fn(),
      },
    });
    expect(store.getSnapshot().completed.size).toBe(0);
  });

  it("keeps in-memory state when setItem throws", () => {
    const store = createProgressStore({
      storage: {
        getItem: () => null,
        setItem: () => {
          throw new Error("quota");
        },
      },
    });
    expect(store.markCompleted(KEY)).toBe(true);
    expect(store.isCompleted(KEY)).toBe(true);
  });

  it("works with no storage at all", () => {
    const store = createProgressStore();
    store.markCompleted(KEY);
    expect(store.isCompleted(KEY)).toBe(true);
  });

  it("merges completions across instances sharing the same storage", () => {
    const storage = makeStorage();
    const tabA = createProgressStore({ storage });
    const tabB = createProgressStore({ storage });
    const other = lessonKey("alfabeto", "letras-a-e", "letra-b");

    tabA.markCompleted(KEY);
    tabB.markCompleted(other);

    expect(tabB.isCompleted(KEY)).toBe(true);
    expect(tabB.isCompleted(other)).toBe(true);
    const parsed = JSON.parse(storage.map.get(PROGRESS_STORAGE_KEY)!);
    expect(parsed.completed).toEqual(expect.arrayContaining([KEY, other]));
  });

  it("keeps in-memory completions when storage writes fail", () => {
    const store = createProgressStore({
      storage: {
        getItem: () => null,
        setItem: () => {
          throw new Error("quota");
        },
      },
    });
    const other = lessonKey("alfabeto", "letras-a-e", "letra-b");

    store.markCompleted(KEY);
    store.markCompleted(other);

    expect(store.isCompleted(KEY)).toBe(true);
    expect(store.isCompleted(other)).toBe(true);
    expect(store.getSnapshot().completed.size).toBe(2);
  });

  it("notifies subscribers when progress changes", () => {
    const store = createProgressStore({ storage: makeStorage() });
    const listener = vi.fn();
    store.subscribe(listener);

    store.markCompleted(KEY);
    store.markCompleted(KEY); // duplicate: no emit
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("createProgressStore.merge", () => {
  const OTHER = "alfabeto/letras-a-e/letra-b";

  it("merges remote keys into the store and persists them", () => {
    const storage = makeStorage();
    const store = createProgressStore({ storage });
    store.markCompleted(KEY);

    expect(store.merge([OTHER])).toBe(true);
    expect(store.getSnapshot().completed).toEqual(new Set([KEY, OTHER]));
    const parsed = JSON.parse(storage.map.get(PROGRESS_STORAGE_KEY)!);
    expect(parsed.completed).toEqual(expect.arrayContaining([KEY, OTHER]));
  });

  it("is a no-op when every key is already present", () => {
    const store = createProgressStore({ storage: makeStorage() });
    store.markCompleted(KEY);
    const listener = vi.fn();
    store.subscribe(listener);

    expect(store.merge([KEY])).toBe(false);
    expect(listener).not.toHaveBeenCalled();
  });

  it("never drops existing completions while merging", () => {
    const store = createProgressStore({ storage: makeStorage() });
    store.markCompleted(KEY);
    store.merge([OTHER]);
    store.merge([]);

    expect(store.isCompleted(KEY)).toBe(true);
    expect(store.isCompleted(OTHER)).toBe(true);
  });

  it("re-reads storage so entries added by another instance survive", () => {
    const storage = makeStorage();
    const tabA = createProgressStore({ storage });
    const tabB = createProgressStore({ storage });
    tabB.markCompleted(OTHER);

    tabA.merge([KEY]);
    expect(tabA.isCompleted(OTHER)).toBe(true);
    expect(tabA.isCompleted(KEY)).toBe(true);
  });
});
