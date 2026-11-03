/* ==========================================================================
   ExamVerse — Production PWA Service Worker (sw.js)
   Audit Section 9 Fixes Applied:
   - Cache versioning (examverse-cache-v3) & old cache deletion on activate
   - self.skipWaiting() and self.clients.claim()
   - Network-first for HTML/JS/CSS so updates show immediately
   ========================================================================== */

var CACHE_VERSION = 'examverse-cache-v3';
var CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/theme.css',
  './css/main.css',
  './css/animations.css',
  './js/data.js',
  './js/storage.js',
  './js/supabase-client.js',
  './js/quiz.js',
  './js/app.js'
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(CORE_ASSETS);
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE_VERSION) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(function (networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          var copy = networkResponse.clone();
          caches.open(CACHE_VERSION).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return networkResponse;
      })
      .catch(function () {
        return caches.match(event.request).then(function (cached) {
          return cached || caches.match('./index.html');
        });
      })
  );
});
