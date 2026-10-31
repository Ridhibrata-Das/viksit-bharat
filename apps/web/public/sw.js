/**
 * Viksit Bengal Dashboard — Progressive Web App Service Worker
 * Version: v1.0.0
 */

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `viksit-bengal-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `viksit-bengal-dynamic-${CACHE_VERSION}`;

// Pre-cached App Shell resources
const APP_SHELL = [
  '/offline.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png'
];

// Install: Pre-cache App Shell and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Activate: Purge obsolete caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Apply optimal caching strategy per request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests and external domains
  if (request.method !== 'GET' || url.origin !== location.origin) {
    return;
  }

  // Strategy A: Static Assets (Cache-First)
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|webp|woff|woff2|ico)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Strategy B: API Data (Stale-While-Revalidate for fast read access)
  if (url.pathname.startsWith('/api/analytics') || url.pathname.startsWith('/api/districts') || url.pathname.startsWith('/api/promises')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Strategy C: HTML Navigation Pages (Network-First with Offline Fallback)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }
});

// --- Strategies ---

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return new Response('Asset unavailable offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offlineFallback = await caches.match('/offline.html');
    return offlineFallback || new Response('Offline page unavailable', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const dynamicCache = await caches.open(DYNAMIC_CACHE);
  const cached = await dynamicCache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        dynamicCache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}
