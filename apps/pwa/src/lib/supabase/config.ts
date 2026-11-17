/**
 * Supabase configuration detection.
 *
 * The PWA must build and run identically whether or not the Supabase project
 * is wired up: previews without env vars, offline development, and guests
 * all stay fully functional with local-only progress. Every Supabase
 * integration point gates on `getSupabaseEnv()` returning a value — a
 * missing or placeholder configuration means "guest mode", never a crash.
 *
 * Only the publishable key is ever read here. Secret keys (`sb_secret_*`)
 * must never appear in `NEXT_PUBLIC_*` variables or reach the browser.
 */

export interface SupabaseEnv {
  url: string;
  publishableKey: string;
}

const PLACEHOLDER_HOST = "your-project-ref.supabase.co";

function readUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !parsed.hostname) return null;
    // The .env.example placeholder parses fine but is not a real project.
    if (parsed.hostname === PLACEHOLDER_HOST) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

function readPublishableKey(): string | null {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!key) return null;
  // Reject obvious placeholders before they reach a client constructor.
  if (/^x+$|sb_publishable_x+$/i.test(key)) return null;
  return key;
}

/**
 * Returns the Supabase connection settings, or `null` when the app must run
 * in guest mode (env absent, malformed, or still the documented placeholder).
 */
export function getSupabaseEnv(): SupabaseEnv | null {
  const url = readUrl();
  const publishableKey = readPublishableKey();
  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}
