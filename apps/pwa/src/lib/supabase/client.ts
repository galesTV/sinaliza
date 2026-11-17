"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "./config";

/**
 * Supabase client for Client Components. The `@supabase/ssr` browser client
 * keeps the session in cookies (not localStorage) so the server and the
 * proxy share the same auth state.
 *
 * Throws when Supabase is not configured — callers must gate auth UI on
 * `isSupabaseConfigured()` so guest mode never constructs a client.
 */
export function createClient(): SupabaseClient {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, or keep guest mode.",
    );
  }
  return createBrowserClient(env.url, env.publishableKey);
}
