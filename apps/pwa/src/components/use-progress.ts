"use client";

import { useSyncExternalStore } from "react";

import {
  EMPTY_PROGRESS,
  createProgressStore,
  type ProgressSnapshot,
  type ProgressStore,
} from "@/lib/progress";

/**
 * Singleton real-lesson progress store, created lazily so SSR never touches
 * `window`. `useSyncExternalStore` serves `EMPTY_PROGRESS` on the server and
 * swaps in the real snapshot after hydration — no mismatch, no flash of fake
 * progress.
 */
let store: ProgressStore | null = null;

function getStore(): ProgressStore | null {
  if (typeof window === "undefined") return null;
  if (!store) {
    store = createProgressStore({ storage: window.localStorage });
  }
  return store;
}

export function useProgressSnapshot(): ProgressSnapshot {
  return useSyncExternalStore(
    (onStoreChange) => getStore()?.subscribe(onStoreChange) ?? (() => {}),
    () => getStore()?.getSnapshot() ?? EMPTY_PROGRESS,
    () => EMPTY_PROGRESS,
  );
}

export function markLessonCompleted(key: string): boolean {
  return getStore()?.markCompleted(key) ?? false;
}
