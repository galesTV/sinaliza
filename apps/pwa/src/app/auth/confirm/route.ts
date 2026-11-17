import { NextResponse, type NextRequest } from "next/server";

import { parseConfirmParams } from "@/lib/auth/confirm-params";
import { isRecentRecovery } from "@/lib/auth/recovery";
import { sanitizeRedirect } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/confirm — target for Supabase email links.
 *
 * Handles both confirmation styles (`?code=` PKCE and
 * `?token_hash=&type=` OTP) plus pre-failed links (Supabase redirects
 * errors back with `error` params → parsed as `invalid`). Success
 * establishes the session through the server client (cookies written on
 * the redirect response) and lands on a sanitized internal path; any
 * failure goes to /login with a generic notice — tokens are never echoed
 * into the UI, the URL, or logs.
 *
 * Must be listed in the project's Redirect URLs allowlist (dashboard).
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const fail = () =>
    NextResponse.redirect(new URL("/login?erro=link-invalido", url.origin));

  if (!isSupabaseConfigured()) return fail();

  const params = parseConfirmParams(url.searchParams);
  if (params.kind === "invalid") return fail();

  const supabase = await createClient();
  const next = sanitizeRedirect(url.searchParams.get("next"), "/conta");

  if (params.kind === "code") {
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      params.code,
    );
    if (error) return fail();
    // PKCE links don't carry the flow type in the URL — a fresh
    // recovery_sent_at means this session exists only to pick a password.
    const target = isRecentRecovery(data.user?.recovery_sent_at)
      ? "/nova-senha"
      : next;
    return NextResponse.redirect(new URL(target, url.origin));
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: params.tokenHash,
    type: params.type,
  });
  if (error) return fail();

  // A recovery session exists only to choose a new password.
  const target = params.type === "recovery" ? "/nova-senha" : next;
  return NextResponse.redirect(new URL(target, url.origin));
}
