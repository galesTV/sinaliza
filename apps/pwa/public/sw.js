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

const VERSION = "v1";
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

const OFFLINE_URL = "/offline.html";

const PAGES_LIMIT = 50;
const MEDIA_LIMIT = 64;
const BRAND_LIMIT = 30;
const EXTERNAL_LIMIT = 20; // ~15 MB total: ~8 MB model + WASM set

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

function isAllowedExternal(url) {
  return (
    (url.host === "cdn.jsdelivr.net" && url.pathname.startsWith("/npm/@mediapipe/")) ||
    (url.host === "storage.googleapis.com" && url.pathname.startsWith("/mediapipe-models/"))
  );
}

function isCacheableDocument(response) {
  if (!response || !response.ok || response.type !== "basic") return false;
  const cacheControl = response.headers.get("cache-control") || "";
  return !/no-store|private/i.test(cacheControl);
}

async function trimCache(cacheName, limit, exempt = new Set()) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const removable = keys.filter((key) => !exempt.has(key.url));
  for (let i = 0; i < removable.length - limit; i += 1) {
    await cache.delete(removable[i]);
  }
}

async function networkFirst(request) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const response = await fetch(request);
    if (isCacheableDocument(response)) {
      await cache.put(request, response.clone());
      await trimCache(PAGES_CACHE, PAGES_LIMIT, CORE_URLS);
    }
    return response;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const fallback = await caches.match(OFFLINE_URL);
    return fallback || Response.error();
  }
}

async function cacheFirst(request, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && (response.type === "basic" || response.type === "cors")) {
    await cache.put(request, response.clone());
    if (limit) await trimCache(cacheName, limit);
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const refreshed = fetch(request)
    .then(async (response) => {
      if (response.ok && response.type === "basic") {
        await cache.put(request, response.clone());
        await trimCache(cacheName, limit);
      }
      return response;
    })
    .catch(() => cached);
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
    event.respondWith(staleWhileRevalidate(request, MEDIA_CACHE, MEDIA_LIMIT));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, BRAND_CACHE, BRAND_LIMIT));
});
