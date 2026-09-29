/* Cardio Burner — offline shell + local inspiration notifications */
const CACHE = "cardio-burner-v11";
const PRECACHE = ["/", "/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((response) => {
          const copy = response.clone();
          if (response.ok && request.url.startsWith(self.location.origin)) {
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});

/** Client asks SW to display a notification (preferred path). */
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "SHOW_NOTIFICATION" && data.title) {
    event.waitUntil(
      self.registration.showNotification(data.title, data.options || {})
    );
  }

  // Prefs sync is acknowledged for future periodicsync wakes; client owns timers.
  if (data.type === "SYNC_INSPIRATION_PREFS") {
    // no-op store; keeps message channel alive for scheduling nudges
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    (event.notification.data && event.notification.data.url) || "/";
  const absolute = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          if ("navigate" in client) {
            return client.navigate(absolute).then((c) => (c ? c.focus() : client.focus()));
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(absolute);
      }
    })
  );
});

/** Best-effort nudge when Periodic Background Sync is available. */
self.addEventListener("periodicsync", (event) => {
  if (event.tag !== "daily-inspiration") return;
  // Client reschedules on next open; ping open clients to re-arm timers.
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        client.postMessage({ type: "REARM_INSPIRATION" });
      }
    })
  );
});
