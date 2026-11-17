/* Sinaliza service worker — bounded offline baseline.
 *
 * Bump VERSION whenever this file or the precached assets change; activation
 * deletes only caches under the "sinaliza-" prefix from older versions.
 *
 * Navigation model (verified against Next.js 16.4.5):
 * - Document navigations are NetworkFirst so a deploy always wins online.
 * - RSC and prefetch requests carry router-state headers and must never be
 *   intercepted: the same URL returns different Flight payloads per client
 *   state, so URL-keyed caching would serve wrong trees. Left untouched, a
 *   failed RSC request makes the App Router fall back to a full document
 *   navigation, which the pages cache can then satisfy offline.
 * - No skipWaiting()/clients.claim(): an open tab keeps its SW and caches
 *   until it closes, so a new worker never controls an old-build page.
 */

const VERSION = "v3";
const CACHE_PREFIX = "sinaliza-";

const CRITICAL_CACHE = `sinaliza-critical-${VERSION}`;
const PAGES_CACHE = `sinaliza-pages-${VERSION}`;
const STATIC_CACHE = `sinaliza-static-${VERSION}`;
const MEDIA_CACHE = `sinaliza-media-${VERSION}`;
const BRAND_CACHE = `sinaliza-brand-${VERSION}`;
const EXTERNAL_CACHE = `sinaliza-external-${VERSION}`;

const KNOWN_CACHES = [
  CRITICAL_CACHE,
  PAGES_CACHE,
  STATIC_CACHE,
  MEDIA_CACHE,
  BRAND_CACHE,
  EXTERNAL_CACHE,
];

// Paths reserved for authenticated flows (auth callbacks, account pages,
// sign-in, recovery). They must NEVER be intercepted or cached: responses
// may be personalized or carry session cookies, and a cached page could
// leak one account's data to another account on a shared device.
const AUTHENTICATED_PREFIXES = [
  "/auth",
  "/conta",
  "/login",
  "/cadastro",
  "/recuperar",
  "/nova-senha",
];

const OFFLINE_URL = "/offline.html";

const PAGES_LIMIT = 50;
const MEDIA_LIMIT = 64;
const BRAND_LIMIT = 30;
// Entry-count cap, not a byte budget: the allowlisted MediaPipe set is a
// few files (~10 MB: 8 MB model + WASM loader), so counting bounds it.
const EXTERNAL_LIMIT = 20;

// Failure to cache any of these fails install so the browser retries later.
const CRITICAL_ASSETS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png",
];

// Best-effort: one failure must not abort installation.
const CORE_ROUTES = ["/", "/trilhas", "/trilhas/alfabeto", "/trilhas/vocabulario"];
const CORE_URLS = new Set(CORE_ROUTES.map((route) => self.location.origin + route));
const CORE_BRAND_ASSETS = [
  "/brand/sinaliza-icone-pwa.svg",
  "/brand/sinaliza-horizontal.svg",
  "/brand/sinaliza-simbolo.svg",
  "/brand/sinaliza-monocromatico.svg",
];

// Mirrors the exact CDN assets loaded by src/lib/hand-tracking.ts: the
// wasm directory of the pinned @mediapipe/tasks-vision version (covers
// the SIMD and nosimd loader variants MediaPipe picks at runtime) and
// the hand_landmarker float16 model. Anything else is network-only.
const MEDIAPIPE_WASM_PREFIX = "/npm/@mediapipe/tasks-vision@0.10.21/wasm/";
const MEDIAPIPE_MODEL_PATH =
  "/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

function isAllowedExternal(url) {
  return (
    (url.host === "cdn.jsdelivr.net" &&
      url.pathname.startsWith(MEDIAPIPE_WASM_PREFIX)) ||
    (url.host === "storage.googleapis.com" &&
      url.pathname === MEDIAPIPE_MODEL_PATH)
  );
}

// Shared store predicate: every strategy validates status, response type
// (basic for same-origin, cors allowed only where opted in) and the
// Cache-Control directives that actually forbid storing the response.
function isStorable(response, { cors = false } = {}) {
  if (!response || !response.ok) return false;
  if (response.type !== "basic" && !(cors && response.type === "cors")) return false;
  const cacheControl = response.headers.get("cache-control") || "";
  return !/no-store|private/i.test(cacheControl);
}

function isCacheableDocument(response) {
  return isStorable(response);
}

async function trimCache(cacheName, limit, exempt = new Set()) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const removable = keys.filter((key) => !exempt.has(key.url));
  for (let i = 0; i < removable.length - limit; i += 1) {
    await cache.delete(removable[i]);
  }
}

// Cache writes must never break serving: every put/trim below absorbs
// quota/storage failures so a full disk never breaks the online path.
async function networkFirst(request) {
  const cache = await caches.open(PAGES_CACHE);
  let response;
  try {
    response = await fetch(request);
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const fallback = await caches.match(OFFLINE_URL);
    return fallback || Response.error();
  }
  if (isCacheableDocument(response)) {
    try {
      await cache.put(request, response.clone());
      await trimCache(PAGES_CACHE, PAGES_LIMIT, CORE_URLS);
    } catch {
      console.warn("[sinaliza-sw] page cache write skipped:", request.url);
    }
  }
  return response;
}

async function cacheFirst(request, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (isStorable(response, { cors: true })) {
    try {
      await cache.put(request, response.clone());
      if (limit) await trimCache(cacheName, limit);
    } catch {
      console.warn("[sinaliza-sw] cache write skipped:", request.url);
    }
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName, limit, event) {
  const cache = await caches.open(cacheName);
  // Cross-cache match: precached critical assets (manifest, icons, offline
  // page) must also serve subresource requests, not only navigations.
  const cached = (await cache.match(request)) || (await caches.match(request));
  const refreshed = fetch(request)
    .then(async (response) => {
      if (isStorable(response)) {
        try {
          await cache.put(request, response.clone());
          await trimCache(cacheName, limit);
        } catch {
          console.warn("[sinaliza-sw] cache write skipped:", request.url);
        }
      }
      return response;
    })
    .catch(() => cached);
  // Keep the worker alive until the revalidation write settles.
  event?.waitUntil(refreshed.catch(() => {}));
  return cached || refreshed;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const critical = await caches.open(CRITICAL_CACHE);
      await critical.addAll(CRITICAL_ASSETS);

      const pages = await caches.open(PAGES_CACHE);
      const brand = await caches.open(BRAND_CACHE);
      const results = await Promise.allSettled([
        ...CORE_ROUTES.map((url) => pages.add(url)),
        ...CORE_BRAND_ASSETS.map((url) => brand.add(url)),
      ]);
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const url = [...CORE_ROUTES, ...CORE_BRAND_ASSETS][index];
          console.warn("[sinaliza-sw] precache skipped:", url);
        }
      });
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith(CACHE_PREFIX) && !KNOWN_CACHES.includes(name))
          .map((name) => caches.delete(name)),
      );
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;
  // RSC/prefetch: never intercept — let the router fall back on failure.
  if (request.headers.has("rsc") || request.headers.has("next-router-prefetch")) return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    if (isAllowedExternal(url)) {
      event.respondWith(cacheFirst(request, EXTERNAL_CACHE, EXTERNAL_LIMIT));
    }
    return;
  }

  // Auth/account paths: network only, no interception — see the declaration
  // above. Leaving respondWith uncalled lets the request hit the network
  // untouched by any cache.
  if (
    AUTHENTICATED_PREFIXES.some(
      (prefix) =>
        url.pathname === prefix || url.pathname.startsWith(`${prefix}/`),
    )
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname === OFFLINE_URL) {
    event.respondWith(cacheFirst(request, CRITICAL_CACHE));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (url.pathname.startsWith("/_next/image")) {
    event.respondWith(staleWhileRevalidate(request, MEDIA_CACHE, MEDIA_LIMIT, event));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, BRAND_CACHE, BRAND_LIMIT, event));
});
