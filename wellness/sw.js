/* ═══════════════════════════════════════════════════════
   sw.js — offline app shell
   Cache-first for our own assets, network-only for the API.
   ═══════════════════════════════════════════════════════ */

const CACHE = 'forge-v1';

const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './css/base.css',
  './css/components.css',
  './css/screens.css',
  './js/app.js',
  './js/store.js',
  './js/calc.js',
  './js/ui.js',
  './js/ai.js',
  './js/program.js',
  './js/data/foods.js',
  './js/data/exercises.js',
  './js/data/quotes.js',
  './js/screens/onboarding.js',
  './js/screens/dashboard.js',
  './js/screens/workouts.js',
  './js/screens/nutrition.js',
  './js/screens/snap.js',
  './js/screens/mealplan.js',
  './js/screens/progress.js',
  './js/screens/motivation.js',
  './js/screens/coach.js',
  './js/screens/profile.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => { /* a missing asset should not block install */ })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache model API traffic.
  if (url.hostname.endsWith('api.anthropic.com')) return;

  // Same-origin: cache first, then network, refreshing the cache in the background.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(request, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Cross-origin (fonts): network first, fall back to cache.
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
