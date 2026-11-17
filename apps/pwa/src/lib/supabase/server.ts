import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { getSupabaseEnv } from "./config";

/**
 * Supabase client for Server Components, Server Actions, and Route
 * Handlers. Reads and writes the auth session through Next.js cookies.
 *
 * Server Components cannot write cookies: `setAll` failures are expected
 * there and absorbed — `src/proxy.ts` owns session refresh and propagates
 * refreshed tokens via response cookies.
 *
 * Throws when Supabase is not configured; gate server paths on
 * `isSupabaseConfigured()`.
 */
export async function createClient(): Promise<SupabaseClient> {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, or keep guest mode.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component: writes are ignored; the proxy keeps the
          // session fresh instead.
        }
      },
    },
  });
}
