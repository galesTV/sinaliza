"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AuthSessionState =
  | { status: "unconfigured"; user: null }
  | { status: "loading"; user: null }
  | { status: "guest"; user: null }
  | { status: "user"; user: { id: string; email: string | null } };

/**
 * Client-side session state for navigation and auth UI.
 *
 * - Unconfigured Supabase → `unconfigured` forever; guest UI only, and no
 *   client is ever constructed.
 * - `getSession()` reads the cookie locally (no network round-trip), then
 *   `onAuthStateChange` keeps the UI in sync across tabs and after
 *   sign-in/sign-out in the same page.
 *
 * This state drives UI only — it is never an authorization decision.
 */
export function useAuthSession(): AuthSessionState {
  const [state, setState] = useState<AuthSessionState>(() =>
    isSupabaseConfigured()
      ? { status: "loading", user: null }
      : { status: "unconfigured", user: null },
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let active = true;
    const supabase = createClient();

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        const user = data.session?.user;
        setState(
          user
            ? { status: "user", user: { id: user.id, email: user.email ?? null } }
            : { status: "guest", user: null },
        );
      })
      .catch(() => {
        if (active) setState({ status: "guest", user: null });
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setState(
        user
          ? { status: "user", user: { id: user.id, email: user.email ?? null } }
          : { status: "guest", user: null },
      );
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
