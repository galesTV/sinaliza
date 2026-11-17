import { createAuthCallbackHandler } from "@/lib/auth/callback-handler";

/**
 * GET /auth/recovery — callback reserved for password-reset emails.
 * `resetPasswordForEmail` sets `redirectTo` to this route, so a
 * verified recovery session deterministically lands on the new-password
 * form — no heuristics on user data. `next` is ignored: a recovery
 * session exists only to choose a new password.
 */
export const GET = createAuthCallbackHandler("recovery", "/nova-senha", false);
