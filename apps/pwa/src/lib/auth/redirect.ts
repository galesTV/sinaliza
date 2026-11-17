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
  // ASCII whitespace/control chars are stripped by the URL parser, so
  // "/\n/evil.com" would collapse into "//evil.com" after new URL().
  for (const char of target) {
    const code = char.charCodeAt(0);
    if (code <= 0x20 || code === 0x7f) return fallback;
  }
  return target;
}
