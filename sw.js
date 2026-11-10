const STATIC_CACHE = 'panaderia-belen-static-v2';
const IMAGE_CACHE = 'panaderia-belen-fotos-v2';

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './tortas.html',
    './style.css',
    './manifest.json',
    './imagen/logo.jpg',
    './imagen/apple-touch-icon.png',
    './imagen/icon-192.png',
    './imagen/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== STATIC_CACHE && key !== IMAGE_CACHE) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );
    self.clients.claim();
});

// Intercepta peticiones: guarda las fotos en el teléfono para que carguen al instante
self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);

    // 1. Si es una imagen (de productos o local), la servimos desde la memoria del celular primero (Cache First)
    const esImagen =
        req.destination === 'image' ||
        url.hostname.includes('ibb.co') ||
        url.hostname.includes('wsrv.nl') ||
        url.pathname.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);

    if (esImagen) {
        event.respondWith(
            caches.open(IMAGE_CACHE).then(async (cache) => {
                const cachedResponse = await cache.match(req);
                if (cachedResponse) {
                    return cachedResponse;
                }
                try {
                    const networkResponse = await fetch(req);
                    if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                        cache.put(req, networkResponse.clone());
                    }
                    return networkResponse;
                } catch (err) {
                    return cachedResponse || Response.error();
                }
            })
        );
        return;
    }

    // 2. Para archivos propios (HTML, CSS, manifest), intentamos red y respaldamos en caché
    if (url.origin === self.location.origin) {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    const resClone = res.clone();
                    caches.open(STATIC_CACHE).then((cache) => cache.put(req, resClone));
                    return res;
                })
                .catch(() => caches.match(req))
        );
    }
});

// Permite pre-guardar todas las fotos del catálogo en segundo plano en el sistema del celular
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_IMAGES' && Array.isArray(event.data.urls)) {
        event.waitUntil(
            caches.open(IMAGE_CACHE).then(async (cache) => {
                for (const imgUrl of event.data.urls) {
                    if (!imgUrl) continue;
                    try {
                        const existe = await cache.match(imgUrl);
                        if (!existe) {
                            const req = new Request(imgUrl, { mode: 'no-cors' });
                            const res = await fetch(req);
                            if (res) await cache.put(imgUrl, res);
                        }
                    } catch (e) {}
                }
            })
        );
    }
});
