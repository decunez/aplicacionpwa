const CACHE_NAME = 'facturacion-pwa-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/js/main.js',
  '/js/components/clientes-component.js',
  '/js/components/productos-component.js',
  '/js/components/facturacion-component.js',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/favicon.ico'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cacheando assets estáticos');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch((err) => {
        console.error('Error al cachear assets:', err);
      })
  );
});

// Estrategia: Cache First, fallback a Network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Devuelve la respuesta cacheada si existe
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Si no está en cache, hace la petición a la red
        return fetch(event.request)
          .then((response) => {
            // No cacheamos respuestas que no sean exitosas o que sean de otro origen
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonamos la respuesta para cachearla
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(() => {
            // Si estamos offline y es una página, mostramos la página offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Limpieza de caches antiguos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});