import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/session";

/**
 * Next.js 16 request proxy (the renamed `middleware.ts` — a `middleware.ts`
 * file is never invoked on Next 16). Its only job today is refreshing the
 * Supabase auth session when the project is configured; it is a no-op in
 * guest mode and adds no route protection.
 *
 * The matcher excludes immutable build assets and every public/static path
 * the service worker also serves, so auth logic can never delay or break
 * static delivery.
 */
export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|sw\\.js|offline\\.html|manifest\\.webmanifest|icons|brand|media|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|vtt|ico)$).*)",
  ],
};
