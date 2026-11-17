import { NextResponse, type NextRequest } from "next/server";

import {
  resolveCallbackTarget,
  type CallbackPurpose,
} from "@/lib/auth/callback-target";
import { parseConfirmParams } from "@/lib/auth/confirm-params";
import { sanitizeRedirect } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * Shared GET handler for the two Supabase email-link callbacks.
 *
 * The flow type is determined by WHICH route received the link, not by
 * inspecting the verified session: `resetPasswordForEmail` points its
 * `redirectTo` at `/auth/recovery`, while signup/email-change links
 * point at `/auth/confirm`. Both routes must be listed in the hosted
 * project's Redirect URLs allowlist.
 *
 * Handles both confirmation styles (`?code=` PKCE and
 * `?token_hash=&type=` OTP) plus pre-failed links (Supabase redirects
 * errors back with `error` params → parsed as `invalid`). Success
 * establishes the session through the server client (cookies written on
 * the redirect response) and lands on a sanitized internal path; any
 * failure goes to /login with a generic notice — tokens are never echoed
 * into the UI, the URL, or logs.
 */
export function createAuthCallbackHandler(
  purpose: CallbackPurpose,
  destination: string,
  allowNext: boolean,
) {
  return async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const fail = () =>
      NextResponse.redirect(new URL("/login?erro=link-invalido", url.origin));

    if (!isSupabaseConfigured()) return fail();

    const params = parseConfirmParams(url.searchParams);
    if (params.kind === "invalid") return fail();

    const supabase = await createClient();
    const next = allowNext
      ? sanitizeRedirect(url.searchParams.get("next"), destination)
      : destination;

    if (params.kind === "code") {
      const { error } = await supabase.auth.exchangeCodeForSession(
        params.code,
      );
      if (error) return fail();
    } else {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: params.tokenHash,
        type: params.type,
      });
      if (error) return fail();
    }

    const target = resolveCallbackTarget(purpose, params, next);
    return NextResponse.redirect(new URL(target, url.origin));
  };
}
