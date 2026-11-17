import type { ConfirmParams } from "./confirm-params";

/**
 * Where a verified email link should land, decided by the callback
 * ROUTE that received it — the deterministic mechanism that replaced
 * guessing the flow from `user.recovery_sent_at`.
 *
 * - `recovery` purpose (`/auth/recovery`): every verified link lands on
 *   the password form. The destination is chosen by the API call that
 *   generated the email (`resetPasswordForEmail` sets `redirectTo` to
 *   this route), never inferred from user data.
 * - `confirm` purpose (`/auth/confirm`): OTP links still carry
 *   `type=recovery` in the URL, so a recovery OTP arriving here is
 *   routed to the password form as defense in depth; everything else
 *   goes to the sanitized `next` destination.
 */
export type CallbackPurpose = "confirm" | "recovery";

export function resolveCallbackTarget(
  purpose: CallbackPurpose,
  params: ConfirmParams,
  next: string,
): string {
  if (purpose === "recovery") return "/nova-senha";
  if (params.kind === "otp" && params.type === "recovery") {
    return "/nova-senha";
  }
  return next;
}
