const CACHE_NAME = 'museu-vinho-v13';
const OFFLINE_ASSETS = [
    '/',
    '/acervo',
    '/public/css/app.css',
    '/public/js/main.js',
    '/public/manifest.webmanifest',
    '/public/icons/icon-192.png',
    '/public/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    const requestUrl = new URL(event.request.url);
    const isSameOrigin = requestUrl.origin === self.location.origin;
    const isApiRequest = isSameOrigin && requestUrl.pathname.startsWith('/api/');
    const isServiceWorkerScript = isSameOrigin && requestUrl.pathname === '/public/service-worker.js';
    const isPhotoRequest = isSameOrigin && requestUrl.pathname.startsWith('/public/photos/');

    if (isApiRequest || isServiceWorkerScript) {
        event.respondWith(fetch(event.request));
        return;
    }

    if (isPhotoRequest) {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse.ok) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }

                    return networkResponse;
                })
                .catch(async () => {
                    const cachedResponse = await caches.match(event.request);
                    return cachedResponse || Response.error();
                })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse.ok && isSameOrigin) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }

                    return networkResponse;
                })
                .catch(() => {
                    if (event.request.mode === 'navigate') {
                        return caches.match('/');
                    }

                    return Response.error();
                });
        })
    );
});
