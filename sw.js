/* ============================================================================
   Service Worker — Registro de Jornada SPIE
   Se encarga de:
     • recibir las notificaciones push (incluso con la app cerrada) y mostrarlas
     • abrir la app al tocar la notificación
   No cachea la app (para que siempre cargue la versión más reciente desde la web).
   ============================================================================ */

self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

// Llega un push del servidor (Edge Function). Mostramos la notificación.
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {
    data = { title: 'Registro de Jornada', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'Registro de Jornada';
  const options = {
    body: data.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: data.tag || 'jornada',
    data: { url: data.url || './' },
    vibrate: [80, 40, 80]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Al tocar la notificación, enfocamos o abrimos la app.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) { if ('focus' in w) return w.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
