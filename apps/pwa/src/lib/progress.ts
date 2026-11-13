/**
 * Local progress store for real lessons — no React, storage injected.
 *
 * Records which lessons were completed, keyed by a stable identifier
 * `trilha/modulo/licao`. Persisted to `localStorage` under a versioned key;
 * malformed or legacy payloads are treated as empty, and write failures
 * (private mode, quota) degrade gracefully to in-memory state.
 *
 * Laboratory demonstrations never touch this store: `/laboratorio/*` activity
 * is kept separate from real learning progress by design.
 */

export const PROGRESS_STORAGE_KEY = "sinaliza.progress.v1";

export interface ProgressStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ProgressDeps {
  storage?: ProgressStorage;
  storageKey?: string;
}

export interface ProgressSnapshot {
  completed: ReadonlySet<string>;
}

export const EMPTY_PROGRESS: ProgressSnapshot = {
  completed: new Set<string>(),
};

/** Stable identifier for a lesson, independent of wording changes. */
export function lessonKey(
  pathSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): string {
  return `${pathSlug}/${moduleSlug}/${lessonSlug}`;
}

export function parseLessonKey(key: string) {
  const parts = key.split("/");
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    return null;
  }
  return { pathSlug: parts[0], moduleSlug: parts[1], lessonSlug: parts[2] };
}

export function createProgressStore(deps: ProgressDeps = {}) {
  const storageKey = deps.storageKey ?? PROGRESS_STORAGE_KEY;
  const listeners = new Set<() => void>();

  function load(): Set<string> {
    try {
      const raw = deps.storage?.getItem(storageKey);
      if (!raw) return new Set();
      const parsed: unknown = JSON.parse(raw);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        (parsed as { version?: unknown }).version !== 1 ||
        !Array.isArray((parsed as { completed?: unknown }).completed)
      ) {
        return new Set();
      }
      return new Set(
        (parsed as { completed: unknown[] }).completed.filter(
          (key): key is string => typeof key === "string",
        ),
      );
    } catch {
      // Missing key, malformed JSON or a throwing getItem → start empty.
      return new Set();
    }
  }

  function persist(completed: ReadonlySet<string>) {
    try {
      deps.storage?.setItem(
        storageKey,
        JSON.stringify({ version: 1, completed: [...completed] }),
      );
    } catch {
      // Storage unavailable or full: keep the in-memory record anyway.
    }
  }

  let completed = load();
  let snapshot: ProgressSnapshot = { completed };

  function emit() {
    snapshot = { completed };
    for (const listener of listeners) listener();
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    isCompleted: (key: string) => completed.has(key),
    /** Returns false when the lesson was already recorded. */
    markCompleted(key: string): boolean {
      if (completed.has(key)) return false;
      completed = new Set(completed).add(key);
      persist(completed);
      emit();
      return true;
    },
    reset() {
      completed = new Set();
      persist(completed);
      emit();
    },
  };
}

export type ProgressStore = ReturnType<typeof createProgressStore>;
