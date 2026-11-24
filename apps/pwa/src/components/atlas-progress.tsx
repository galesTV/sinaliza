"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useAuthSession } from "./use-auth-session";
import { useProgressSnapshot, useProgressSyncState } from "./use-progress";

export interface AtlasProgressState {
  /** Completion keys of the resolved identity (empty while loading). */
  completed: ReadonlySet<string>;
  /** Session resolving or first remote hydration in flight. */
  loading: boolean;
}

const EMPTY_COMPLETED: ReadonlySet<string> = new Set();

/**
 * Shared progress read for the Atlas indicators. Each useProgress* hook
 * mounts its own auth-session read (getSession + onAuthStateChange), so
 * one provider per page replaces ~3 auth subscriptions per indicator.
 * The default hides personal states — safe outside the provider.
 */
export const AtlasProgressContext = createContext<AtlasProgressState>({
  completed: EMPTY_COMPLETED,
  loading: true,
});

export function AtlasProgressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { status } = useAuthSession();
  const snapshot = useProgressSnapshot();
  const sync = useProgressSyncState();

  const loading =
    status === "loading" ||
    (status === "user" && sync.configured && !sync.hydrated && sync.syncing);

  return (
    <AtlasProgressContext.Provider
      value={{ completed: snapshot.completed, loading }}
    >
      {children}
    </AtlasProgressContext.Provider>
  );
}

export function useAtlasProgress(): AtlasProgressState {
  return useContext(AtlasProgressContext);
}
