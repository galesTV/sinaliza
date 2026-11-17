/**
 * Redirect target sanitization for auth flows.
 *
 * Links that carry a post-login destination (`?next=`) or Supabase
 * confirmation parameters must never send the user off-site. Only
 * absolute paths on this origin are allowed: anything that could resolve
 * to another host — `//host`, absolute URLs, backslash tricks — falls back.
 */
export function sanitizeRedirect(target: unknown, fallback: string): string {
  if (typeof target !== "string") return fallback;
  if (!target.startsWith("/") || target.startsWith("//")) return fallback;
  if (target.includes("\\") || target.includes("://")) return fallback;
  return target;
}
