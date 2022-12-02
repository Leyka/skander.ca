'use strict';

const IGNORED_HOSTS = [];
const OFFLINE_FUNDAMENTALS = [
  '/assets/bundle.js',
  '/assets/main.css',
  '/assets/vendors/prism/prism-theme.css',
];

let cacheVersion;
const getLatestCacheVersion = async () => {
  if (cacheVersion) {
    return cacheVersion;
  }

  const buildTxtUrl = new URL(self.location.href).origin + '/build.txt';
  const response = await fetch(buildTxtUrl);
  const buildTimestamp = (await response.text()).trim();
  cacheVersion = `offline-${buildTimestamp}`;
  return cacheVersion;
};

self.addEventListener('install', async function (event) {
  const preCache = async () => {
    const cacheName = await getLatestCacheVersion();
    const cache = await caches.open(cacheName);
    await cache.addAll(OFFLINE_FUNDAMENTALS);
  };

  event.waitUntil(preCache());
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  const activate = async () => {
    const latestCacheVersion = await getLatestCacheVersion();
    const cacheNames = await caches.keys();
    const oldCacheNames = cacheNames.filter((cacheName) => cacheName !== latestCacheVersion);
    const deletePromises = oldCacheNames.map((oldCacheName) => {
      return caches.delete(oldCacheName);
    });
    await Promise.all(deletePromises);
  };

  event.waitUntil(activate());

  // Tell the active service worker to take control of the page immediately.
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  console.log('fetch');
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (IGNORED_HOSTS.includes(requestUrl.host)) {
    console.log('ignore');
    return;
  }

  event.respondWith(async () => {
    debugger;
    const cachedResponse = await caches.match(event.request);
    console.log({ cachedResponse });
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const networkResponse = await fetch(event.request);
      const cacheCopy = networkResponse.clone();
      console.log({ cacheCopy });
      const cacheName = await getLatestCacheVersion();
      const cache = await caches.open(cacheName);
      cache.put(event.request, cacheCopy);

      return networkResponse;
    } catch (error) {
      return new Response('<h1>Service Unavailable</h1>', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/html',
        }),
      });
    }
  });
});
