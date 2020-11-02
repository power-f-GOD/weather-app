import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

declare var self: ServiceWorkerGlobalScope & typeof globalThis;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());

  // only use this to force service worker update
  // self.registration.unregister().then(() => {
  //   console.log('Stale service worker unregistered.');
  // });
});

precacheAndRoute((self as any).__WB_MANIFEST);

registerRoute(
  ({ request }) => !!request && request.destination === 'document',
  new StaleWhileRevalidate({ cacheName: 'document-cache' })
);

registerRoute(
  ({ request }) => !!request && request.destination === 'manifest',
  new CacheFirst({ cacheName: 'manifest-cache' })
);

registerRoute(
  ({ request }) => !!request && request.destination === 'style',
  new CacheFirst({ cacheName: 'styles-cache' })
);

registerRoute(
  ({ request }) => !!request && /script|worker/.test(request.destination),
  new CacheFirst({ cacheName: 'scripts-cache' })
);

registerRoute(
  ({ request }) => !!request && request.destination === 'font',
  new CacheFirst({ cacheName: 'fonts-cache' })
);

registerRoute(
  ({ request }) => !!request && request.destination === 'image',
  new StaleWhileRevalidate({ cacheName: 'icons-cache' })
);
