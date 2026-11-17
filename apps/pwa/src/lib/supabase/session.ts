import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "./config";

/**
 * Session refresh for the Next.js proxy (`src/proxy.ts`).
 *
 * - Unconfigured Supabase → pass-through: the app stays in guest mode and
 *   the proxy is a no-op.
 * - Configured → `getClaims()` validates and refreshes the auth token,
 *   copying rotated cookies onto the request (for downstream server code)
 *   and the response (for the browser).
 *
 * Educational routes are intentionally NOT protected here: learning paths,
 * modules, and lessons stay public per product decision (guest learning is
 * a feature). Route protection for future account pages lives in their own
 * server components/layouts, not in this refresh pass.
 *
 * Do not add logic between `createServerClient` and `getClaims()` — a code
 * path that returns before refreshing can leave users randomly signed out.
 */
export async function updateSession(request: NextRequest) {
  const env = getSupabaseEnv();
  if (!env) return NextResponse.next({ request });

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.getClaims();

  return supabaseResponse;
}
