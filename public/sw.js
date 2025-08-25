// Service Worker for PWA and Push Notifications
const CACHE_NAME = 'globcoders-v2'
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
]

// Install event - cache resources and clean old caches
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => {
        // Clean up old caches
        return caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              if (cacheName !== CACHE_NAME) {
                console.log('Deleting old cache:', cacheName);
                return caches.delete(cacheName);
              }
            })
          );
        });
      })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
  )
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/images/xmark.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('GlobCoders', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    )
  } else if (event.action === 'close') {
    // Just close the notification
    event.notification.close()
  } else {
    // Default action
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

function doBackgroundSync() {
  // Sync offline data when connection is restored
  return fetch('https://backend-production-435e.up.railway.app/api/sync')
    .then(response => response.json())
    .then(data => {
      console.log('Background sync completed:', data)
    })
    .catch(error => {
      console.error('Background sync failed:', error)
    })
}