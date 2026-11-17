import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Pure parsing of the auth email-link callback parameters (`/auth/confirm`
 * and `/auth/recovery`), kept separate from the route handlers so the
 * decision logic is unit-testable.
 *
 * Supabase sends two link styles:
 * - `?code=…` (PKCE flow) → `exchangeCodeForSession`.
 * - `?token_hash=…&type=…` (OTP flow) → `verifyOtp`.
 * Failed links arrive with `error`/`error_code` params and no token at all.
 */
const ALLOWED_OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export type ConfirmParams =
  | { kind: "code"; code: string }
  | { kind: "otp"; tokenHash: string; type: EmailOtpType }
  | { kind: "invalid" };

export function parseConfirmParams(
  searchParams: URLSearchParams,
): ConfirmParams {
  const code = searchParams.get("code");
  if (code) return { kind: "code", code };

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  if (tokenHash && type && ALLOWED_OTP_TYPES.has(type as EmailOtpType)) {
    return { kind: "otp", tokenHash, type: type as EmailOtpType };
  }
  return { kind: "invalid" };
}
