import { createAuthCallbackHandler } from "@/lib/auth/callback-handler";

/**
 * GET /auth/confirm — callback for signup and other non-recovery email
 * links. Recovery links must point at `/auth/recovery` instead: the
 * callback route determines the session's purpose, not the verified
 * session's timestamps. Both paths must be listed in the hosted
 * project's Redirect URLs allowlist (see `resetPasswordForEmail`).
 */
export const GET = createAuthCallbackHandler("confirm", "/conta", true);
