// ZenPlanner service worker.
// - Bump CACHE_NAME whenever cache policy changes so old caches get purged.
// - Network-first for Next.js chunks so fresh builds always propagate.
// - Cache-first for the HTML shell so offline loads still work.
// - skipWaiting + clients.claim so a new SW replaces the old one immediately
//   instead of waiting for every tab to close.

const CACHE_NAME = 'zenplanner-v2';
const OFFLINE_URL = '/';
const PRECACHE_URLS = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  // Activate this SW as soon as it finishes installing, even if an older SW
  // is still controlling other tabs. Required to escape a broken cached build.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Purge every cache that isn't the current version.
      caches.keys().then((names) =>
        Promise.all(
          names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
        )
      ),
      // Take control of all open clients (tabs) immediately.
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin GETs. Let everything else pass straight through
  // to the network — critical for POSTs (form submits, Supabase auth) and
  // cross-origin requests (Supabase API, Pollinations.ai, LINE).
  if (req.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests (HTML pages): network-first, fall back to offline shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Next.js build chunks: NETWORK-FIRST so a fresh deploy always wins.
  // Falls back to cache only if the network is unreachable (offline).
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Other same-origin assets (icons, manifest, etc.): cache-first.
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
