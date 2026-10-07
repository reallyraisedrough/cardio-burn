/* Cardio Burner — offline shell + local inspiration notifications */
const CACHE = "cardio-burner-v16";
const MUSIC_CACHE = "cardio-burner-music-v1";
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
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE && k !== MUSIC_CACHE).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  // 4K pose exports are downloads only: never precached or runtime-cached (too heavy).
  const path = new URL(request.url).pathname;
  if (path.startsWith("/poses-4k/")) return;
  // Workout music: not precached. Cached the first time a track plays, then
  // served (with byte ranges, which iOS needs for audio) from the cache.
  if (path.startsWith("/music/") && path.endsWith(".mp3")) {
    event.respondWith(musicResponse(request));
    return;
  }
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

const musicFetches = new Set();

function cacheWholeTrack(url) {
  if (musicFetches.has(url)) return;
  musicFetches.add(url);
  fetch(url)
    .then((res) => {
      if (res.status === 200) return caches.open(MUSIC_CACHE).then((c) => c.put(url, res));
    })
    .catch(() => {})
    .finally(() => musicFetches.delete(url));
}

async function rangeFrom(cached, rangeHeader) {
  const buf = await cached.arrayBuffer();
  const size = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(rangeHeader || "");
  let start = m && m[1] ? Number(m[1]) : 0;
  let end = m && m[2] ? Number(m[2]) : size - 1;
  if (m && !m[1] && m[2]) {
    start = Math.max(0, size - Number(m[2]));
    end = size - 1;
  }
  end = Math.min(end, size - 1);
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": cached.headers.get("Content-Type") || "audio/mpeg",
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
    },
  });
}

async function musicResponse(request) {
  const url = new URL(request.url).href;
  const range = request.headers.get("range");
  const cached = await caches.match(url, { cacheName: MUSIC_CACHE });
  if (cached) return range ? rangeFrom(cached, range) : cached;
  try {
    const res = await fetch(request);
    if (res.status === 200 && !range) {
      const copy = res.clone();
      caches.open(MUSIC_CACHE).then((c) => c.put(url, copy)).catch(() => {});
    } else if (res.ok) {
      cacheWholeTrack(url);
    }
    return res;
  } catch (err) {
    return Response.error();
  }
}

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
