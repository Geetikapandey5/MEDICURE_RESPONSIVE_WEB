const CACHE_NAME = 'medicure-cache-v2';

// Only cache essential files for core functionality
const urlsToCache = [
  '/',
  '/indexx1.html',
  '/about.html',
  '/services.html',
  '/products.html',
  '/contact.html',
  '/outreach.html',
  '/styles.css',
  '/cart.js',
  '/offline.html',
  '/images/Screenshot 2025-02-23 174433.png',
  '/images/pharmacy-banner.jpg',
  '/images/Teams.jpg',
  '/images/Paracetamol.jpg',
  '/images/Vitamin1.png',
  '/images/Fishoil.png',
  '/images/FirstAid.png',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - network first, fallback to cache, then offline page
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Save the response in cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseClone);
          });
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            
            // If the request is for a page, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // For images, return the default logo
            if (event.request.destination === 'image') {
              return caches.match('/images/Screenshot 2025-02-23 174433.png');
            }
            
            return new Response('', {
              status: 404,
              statusText: 'Not Found'
            });
          });
      })
  );
}); 