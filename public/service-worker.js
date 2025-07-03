// Service Worker for Vite + React PWA
const HOSTNAME_WHITELIST = [
  self.location.hostname,
  "fonts.gstatic.com",
  "fonts.googleapis.com",
  "cdn.jsdelivr.net",
];

const CACHE_NAME = "pwa-cache-v1";

// Function to fix the URL in case of mixed content or cache-busting.
const getFixedUrl = (req) => {
  const now = Date.now();
  let url = new URL(req.url);

  // Fix http:// URLs (to https:// if needed).
  url.protocol = self.location.protocol;

  // Add cache-busting only for GET requests to static assets, excluding API.
  if (
    req.method === "GET" &&
    url.hostname === self.location.hostname &&
    !url.pathname.startsWith("/api")
  ) {
    url.search += (url.search ? "&" : "?") + "cache-bust=" + now;
  }
  return url.href;
};

// Install event to pre-cache assets (optional, can be expanded).
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        "/",
        "/index.html",
        "/styles.css", // Add your static assets
      ])
    )
  );
});

// Activate the service worker and clean old caches.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Handle all fetch requests with detailed logging.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-whitelisted hosts, API requests, and non-GET methods.
  if (
    !HOSTNAME_WHITELIST.includes(url.hostname) ||
    url.pathname.startsWith("/api") ||
    request.method !== "GET"
  ) {
    return; // Bypass Service Worker for API and POST requests
  }

  // Let browser handle navigation requests (SPA routing).
  if (request.mode === "navigate") {
    return;
  }

  // Skip module scripts and documents.
  if (request.destination === "script" || request.destination === "document") {
    return;
  }

  // Stale-while-revalidate for static assets with error handling.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(getFixedUrl(request), {
          method: request.method,
          headers: request.headers,
          body: request.method === "POST" ? request.body : null, // Preserve body for POST (though GET won't use it)
        })
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error(`Fetch failed for ${request.url}:`, error);
            return cachedResponse; // Fallback to cache on error.
          });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
