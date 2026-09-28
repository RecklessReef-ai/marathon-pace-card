// Offline shell for the pace card. Bump VERSION whenever anything in public/ changes.
const VERSION = "2026-09-28.3";
const CACHE = "pacecard-" + VERSION;
const ASSETS = [
  "/", "/styles.css", "/app.js", "/map.js", "/pace.js", "/course-data.js", "/map-data.js", "/config.js", "/manifest.webmanifest",
  "/icons/icon.svg", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/maskable-512.png", "/icons/apple-touch-icon.png",
  "/fonts/barlow-400.woff2", "/fonts/barlow-500.woff2", "/fonts/barlow-600.woff2",
  "/fonts/barlow-condensed-700.woff2", "/fonts/barlow-condensed-800.woff2"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS.map(u => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    // Network first so updates land, cached shell when the crowd eats the signal.
    event.respondWith(
      withTimeout(fetch(req), 3000)
        .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put("/", copy)); return res; })
        .catch(() => caches.match("/"))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
