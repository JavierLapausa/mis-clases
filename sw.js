// Service Worker para Mis Clases PWA
const CACHE_NAME = 'mis-clases-v1.0.0';
const OFFLINE_URL = '/index.html';

// Archivos esenciales para cachear
const ESSENTIAL_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icon-192.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Recursos opcionales (se cachean cuando se acceden)
const OPTIONAL_FILES = [
  '/icon-72.png',
  '/icon-96.png',
  '/icon-128.png',
  '/icon-144.png',
  '/icon-152.png',
  '/icon-384.png',
  '/icon-512.png'
];

// ===== INSTALACIÓN DEL SERVICE WORKER =====
self.addEventListener('install', event => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cacheando archivos esenciales...');
        
        // Cachear archivos esenciales de forma secuencial para evitar errores
        return Promise.allSettled(
          ESSENTIAL_FILES.map(url => {
            return cache.add(url).catch(error => {
              console.warn(`[SW] Error al cachear ${url}:`, error);
              return null;
            });
          })
        );
      })
      .then(() => {
        console.log('[SW] Archivos esenciales cacheados correctamente');
        // Forzar activación inmediata
        self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Error durante la instalación:', error);
      })
  );
});

// ===== ACTIVACIÓN DEL SERVICE WORKER =====
self.addEventListener('activate', event => {
  console.log('[SW] Activando Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control de todas las pestañas
      self.clients.claim()
    ])
  );
  
  console.log('[SW] Service Worker activado correctamente');
});

// ===== INTERCEPCIÓN DE REQUESTS =====
self.addEventListener('fetch', event => {
  // Solo manejar requests HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Estrategia: Cache First para recursos estáticos, Network First para datos
  if (isStaticResource(event.request.url)) {
    event.respondWith(cacheFirstStrategy(event.request));
  } else {
    event.respondWith(networkFirstStrategy(event.request));
  }
});

// ===== ESTRATEGIAS DE CACHE =====

// Cache First: Buscar en cache primero, luego red
async function cacheFirstStrategy(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Sirviendo desde cache:', request.url);
      return cachedResponse;
    }
    
    console.log('[SW] No encontrado en cache, buscando en red:', request.url);
    const networkResponse = await fetch(request);
    
    // Cachear la respuesta si es exitosa
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('[SW] Error en cache-first:', error);
    
    // Si es una página HTML, servir la página offline
    if (request.destination === 'document') {
      const cache = await caches.open(CACHE_NAME);
      return cache.match(OFFLINE_URL);
    }
    
    // Para otros recursos, devolver respuesta de error
    return new Response('Recurso no disponible offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network First: Intentar red primero, luego cache
async function networkFirstStrategy(request) {
  try {
    console.log('[SW] Intentando red primero:', request.url);
    const networkResponse = await fetch(request);
    
    // Cachear respuestas exitosas de GET
    if (networkResponse.status === 200 && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] Red falló, buscando en cache:', request.url);
    
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si es una página HTML, servir la página offline
    if (request.destination === 'document') {
      return cache.match(OFFLINE_URL);
    }
    
    // Para API calls, devolver respuesta JSON de error
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({
        error: 'No hay conexión a internet',
        offline: true
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Recurso no disponible offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// ===== FUNCIONES AUXILIARES =====

// Determinar si un recurso es estático
function isStaticResource(url) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  const staticDomains = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
  
  return staticExtensions.some(ext => url.includes(ext)) ||
         staticDomains.some(domain => url.includes(domain)) ||
         url.includes('manifest.json');
}

// ===== MENSAJES DEL CLIENTE =====
self.addEventListener('message', event => {
  console.log('[SW] Mensaje recibido:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'GET_VERSION':
        event.ports[0].postMessage({
          version: CACHE_NAME
        });
        break;
        
      case 'CLEAR_CACHE':
        clearAllCaches().then(() => {
          event.ports[0].postMessage({
            success: true,
            message: 'Cache limpiado correctamente'
          });
        });
        break;
        
      case 'CACHE_STATUS':
        getCacheStatus().then(status => {
          event.ports[0].postMessage(status);
        });
        break;
    }
  }
});

// Limpiar todos los caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('[SW] Todos los caches eliminados');
}

// Obtener estado del cache
async function getCacheStatus() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    return {
      cacheName: CACHE_NAME,
      cachedFiles: keys.length,
      files: keys.map(request => request.url)
    };
  } catch (error) {
    return {
      error: 'No se pudo obtener el estado del cache',
      details: error.message
    };
  }
}

// ===== SINCRONIZACIÓN EN BACKGROUND =====
self.addEventListener('sync', event => {
  console.log('[SW] Sincronización en background:', event.tag);
  
  if (event.tag === 'backup-data') {
    event.waitUntil(syncBackupData());
  }
});

// Sincronizar datos cuando hay conexión
async function syncBackupData() {
  try {
    // Aquí podrías implementar sincronización con un servidor
    console.log('[SW] Sincronizando datos...');
    
    // Por ahora solo registramos que la sincronización ocurrió
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        data: { success: true }
      });
    });
    
  } catch (error) {
    console.error('[SW] Error en sincronización:', error);
  }
}

// ===== PUSH NOTIFICATIONS (para futuras mejoras) =====
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    tag: 'clase-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'Ver',
        icon: '/icon-72.png'
      },
      {
        action: 'dismiss',
        title: 'Descartar'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Mis Clases', options)
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

console.log('[SW] Service Worker cargado correctamente');
