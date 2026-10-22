/* Caïssa v2 · Actualización PWA iOS. No borra localStorage, torneos ni licencias. */
const CACHE = 'caissa-ios-pwa-v2';
const APP = ['./', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key =>
      key.startsWith('caissa-ios-pwa-') && key !== CACHE
    ).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) {
        const clone = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put('./index.html', clone)));
      }
      return response;
    }).catch(() => caches.match('./index.html')));
  } else {
    event.respondWith(caches.match(event.request).then(found => found || fetch(event.request)));
  }
});
