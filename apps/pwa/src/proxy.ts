import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getPublicCulturalEntryBySlug } from "@/data/cultural-public";
import { getCulturalCategoryBySegment } from "@/data/cultural-taxonomy";
import { updateSession } from "@/lib/supabase/session";

/**
 * Next.js 16 request proxy (the renamed `middleware.ts` — a `middleware.ts`
 * file is never invoked on Next 16). It refreshes the Supabase auth session
 * when the project is configured and applies the cultural publication guard
 * before Cache Components can stream a partial shell with a 200 status.
 *
 * The matcher excludes immutable build assets and every public/static path
 * the service worker also serves, so auth logic can never delay or break
 * static delivery.
 */
export function proxy(request: NextRequest) {
  const exploreMatch = /^\/explorar\/([^/]+)\/([^/]+)\/?$/.exec(
    request.nextUrl.pathname,
  );

  if (exploreMatch) {
    const [, categorySegment, slug] = exploreMatch.map(decodeURIComponent);
    const category = getCulturalCategoryBySegment(categorySegment);
    const entry = category
      ? getPublicCulturalEntryBySlug(category, slug)
      : undefined;

    if (!entry) {
      return NextResponse.rewrite(new URL("/_not-found", request.url));
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|sw\\.js|offline\\.html|manifest\\.webmanifest|icons|brand|media|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|vtt|ico)$).*)",
  ],
};
