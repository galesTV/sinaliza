/**
 * Recovery sessions after a PKCE `?code=` exchange.
 *
 * OTP-style links carry `type=recovery`, but PKCE confirmation links
 * only deliver `?code=` — the flow type is not in the URL. GoTrue
 * stamps `user.recovery_sent_at` when a recovery email is sent, so a
 * fresh timestamp means this session exists only to choose a new
 * password and should land on /nova-senha instead of the account page.
 */

export const RECOVERY_WINDOW_MS = 15 * 60 * 1000;

export function isRecentRecovery(
  recoverySentAt: string | null | undefined,
  now: number = Date.now(),
): boolean {
  if (!recoverySentAt) return false;
  const sentAt = Date.parse(recoverySentAt);
  if (!Number.isFinite(sentAt) || sentAt > now) return false;
  return now - sentAt < RECOVERY_WINDOW_MS;
}
