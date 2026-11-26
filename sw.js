// Service worker: vzdy najprv siet (aby bola stranka aj obsah vzdy aktualne),
// posledna stiahnuta verzia sa pouzije len bez internetu. Obsah ostava zasifrovany.
const CACHE = "nl-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim())
));

self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  // data/content.json sa nacitava s ?t=..., v cache je pod adresou bez parametrov
  const key = url.origin + url.pathname;
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(key, copy)); }
      return res;
    }).catch(() => caches.match(key).then((hit) =>
      hit || (req.mode === "navigate" ? caches.match(new URL("./", self.location).href) : Response.error())))
  );
});
