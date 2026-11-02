/* ExamVerse PWA Service Worker (sw.js) */
var CACHE_NAME = 'examverse-cache-v1';
var ASSETS = [
  './index.html',
  './css/theme.css',
  './css/main.css',
  './css/animations.css',
  './js/data.js',
  './js/storage.js',
  './js/quiz.js',
  './js/app.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
