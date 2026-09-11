const CACHE_NAME = 'antrean-klinik-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (e) => {
  // 1. ABAIKAN (Bypass) request jika method POST atau mengarah ke Google Apps Script / CDN luar
  if (
    e.request.method !== 'GET' ||
    e.request.url.includes('script.google.com') ||
    e.request.url.includes('googleusercontent.com')
  ) {
    return; // Biarkan browser menangani request secara langsung tanpa intercepted oleh SW
  }

  // 2. Tangani asset static (GET) dengan strategi Cache First
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).catch(() => {
        // Fallback jika offline dan tidak ada di cache
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
