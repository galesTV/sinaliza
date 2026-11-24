"use client";

import { useEffect, useSyncExternalStore } from "react";

import {
  EMPTY_PROGRESS,
  type ProgressSnapshot,
} from "@/lib/progress";
import {
  EMPTY_CLAIM,
  EMPTY_SYNC,
  createProgressOrchestrator,
  type GuestClaimResult,
  type GuestClaimSnapshot,
  type ProgressIdentity,
  type ProgressOrchestrator,
  type ProgressSyncSnapshot,
} from "@/lib/progress-orchestrator";
import { createSupabaseProgressRemote } from "@/lib/progress-sync";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import { useAuthSession } from "./use-auth-session";

/**
 * Singleton progress orchestrator, created lazily so SSR never touches
 * `window` or the Supabase client. Owns one local store per storage identity
 * (guest vs `u_<userId>`), hydrates an account's completions from
 * `lesson_completions` when its session starts, and pushes completions
 * remotely through a bounded-retry queue — all without ever merging guest
 * progress into an account (ADR 0004, D4).
 */
let orchestrator: ProgressOrchestrator | null = null;

function getOrchestrator(): ProgressOrchestrator | null {
  if (typeof window === "undefined") return null;
  if (!orchestrator) {
    let storage: Storage | undefined;
    try {
      storage = window.localStorage;
    } catch {
      // Browsers can throw SecurityError on the `localStorage` getter itself
      // (blocked storage): progress degrades to in-memory for the session.
      storage = undefined;
    }
    const remote = isSupabaseConfigured()
      ? createSupabaseProgressRemote(createClient())
      : undefined;
    orchestrator = createProgressOrchestrator({ storage, remote });
    // One reconnect trigger for the whole app — not one per mounted
    // component. The orchestrator dedupes in-flight hydration/flushes, so
    // a single listener is both necessary and sufficient.
    window.addEventListener("online", () =>
      orchestrator?.handleOnline(),
    );
  }
  return orchestrator;
}

function identityOf(
  status: "unconfigured" | "loading" | "guest" | "user",
  userId: string | undefined,
): ProgressIdentity {
  if (status === "loading") return { status: "loading" };
  if (status === "user" && userId) return { status: "user", userId };
  return { status: "guest" };
}

/**
 * Wires the auth session into the orchestrator and returns the snapshot for
 * the identity the component rendered with — `EMPTY_PROGRESS` while the
 * session resolves, so no identity's progress flashes beforehand.
 */
function useOrchestratedProgress<T>(
  getSnapshot: (
    orchestrator: ProgressOrchestrator,
    identity: ProgressIdentity,
  ) => T,
  empty: T,
): T {
  const { status, user } = useAuthSession();
  const identity = identityOf(status, user?.id);
  const identityKey =
    identity.status === "user" ? `u:${identity.userId}` : identity.status;

  useEffect(() => {
    const orch = getOrchestrator();
    if (!orch) return;
    orch.setIdentity(identity);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- identityKey is the serialized form of identity
  }, [identityKey]);

  return useSyncExternalStore(
    (onStoreChange) =>
      getOrchestrator()?.subscribe(onStoreChange) ?? (() => {}),
    () => {
      const orch = getOrchestrator();
      // Render-time identity: a session switch can never surface another
      // account's set for a frame, and "loading" yields the empty snapshot.
      return orch ? getSnapshot(orch, identity) : empty;
    },
    () => empty,
  );
}

export function useProgressSnapshot(): ProgressSnapshot {
  return useOrchestratedProgress(
    (orch, identity) => orch.getCompletedSnapshot(identity),
    EMPTY_PROGRESS,
  );
}

/** Remote synchronization bookkeeping — never a completion record itself. */
export function useProgressSyncState(): ProgressSyncSnapshot {
  return useOrchestratedProgress(
    (orch, identity) => orch.getSyncSnapshot(identity),
    EMPTY_SYNC,
  );
}

export function markLessonCompleted(key: string): boolean {
  return getOrchestrator()?.markCompleted(key) ?? false;
}

/**
 * Consent bookkeeping for transferring guest completions into the active
 * account — `EMPTY_CLAIM` for guests, loading sessions and unconfigured
 * remotes, so the claim card never renders without a signed-in user.
 */
export function useGuestClaimState(): GuestClaimSnapshot {
  return useOrchestratedProgress(
    (orch, identity) => orch.getClaimSnapshot(identity),
    EMPTY_CLAIM,
  );
}

/**
 * Explicit claim action — only ever called from the consent card. The
 * guest bucket is never modified by a claim.
 */
export function claimGuestProgress(userId: string): GuestClaimResult {
  return getOrchestrator()?.claimGuestProgress(userId) ?? "unavailable";
}

/** "Keep separate": persist this account's dismissal of the current offer. */
export function dismissGuestClaim(userId: string): void {
  getOrchestrator()?.dismissGuestClaim(userId);
}
